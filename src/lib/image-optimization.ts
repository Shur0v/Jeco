export const MAX_IMAGE_DIMENSION = 1300;
export const MAX_IMAGE_BYTES = 1_000_000;
export async function optimizeImage(file: Blob): Promise<string> {
  const image = await createImageBitmap(file, {imageOrientation:'from-image'});
  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width,image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(image.width*scale)); canvas.height = Math.max(1,Math.round(image.height*scale));
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Image processing is unavailable.');
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    let blob: Blob | null = null;
    for (const quality of [.86,.76,.66,.56,.46]) {
      blob = await new Promise(resolve => canvas.toBlob(resolve,'image/webp',quality));
      if (blob && blob.size < MAX_IMAGE_BYTES) break;
    }
    if (!blob || blob.size >= MAX_IMAGE_BYTES) throw new Error('This image cannot be optimized under 1 MB. Choose a simpler image.');
    return await new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload=()=>resolve(String(reader.result)); reader.onerror=()=>reject(new Error('Image could not be read.')); reader.readAsDataURL(blob); });
  } finally { image.close(); }
}
