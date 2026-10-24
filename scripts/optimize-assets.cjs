/* Reproducible asset preparation: node scripts/optimize-assets.cjs */
const fs=require('node:fs/promises'), path=require('node:path'), crypto=require('node:crypto'), sharp=require('sharp');
const root=path.resolve(__dirname,'..');
async function files(dir) { return (await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(path.join(dir,e.name)):path.join(dir,e.name)))).flat(); }
(async()=>{
  const candidates=(await files(path.join(root,'src'))).filter(p=>/\.(tsx?|json)$/.test(p)&&!p.includes('asset-map.json'));
  const urls=new Set();
  for(const file of candidates) for(const m of (await fs.readFile(file,'utf8')).matchAll(/https:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp|avif|gif)(?:\?[^\s"'<>]*)?/gi)) urls.add(m[0]);
  const dir=path.join(root,'public','media'); await fs.mkdir(dir,{recursive:true});
  let map={}, report=[];
  try { map=JSON.parse(await fs.readFile(path.join(root,'src','mocks','asset-map.json'),'utf8'));report=JSON.parse(await fs.readFile(path.join(root,'docs','asset-audit.json'),'utf8')); } catch {}
  const queue=[...urls].filter(url=>!report.some(r=>r.source===url && !r.error));
  for(const url of queue)report=report.filter(r=>r.source!==url);
  async function worker(){while(queue.length){const url=queue.shift();try{
    const response=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw new Error('HTTP '+response.status);
    const bytes=Buffer.from(await response.arrayBuffer()),meta=await sharp(bytes).metadata();
    let output;
    for(const quality of [84,76,66,56,46]) {output=await sharp(bytes).rotate().resize({width:1300,height:1300,fit:'inside',withoutEnlargement:true}).webp({quality,effort:4}).toBuffer();if(output.length<1000000)break;}
    if(output.length>=1000000)throw new Error('Cannot meet 1 MB target');
    const name=crypto.createHash('sha256').update(url).digest('hex').slice(0,20)+'.webp';
    await fs.writeFile(path.join(dir,name),output);const result=await sharp(output).metadata();
    map[url]='/media/'+name;report.push({source:url,path:map[url],originalBytes:bytes.length,bytes:output.length,originalWidth:meta.width,originalHeight:meta.height,width:result.width,height:result.height});
  }catch(e){report.push({source:url,error:e.message,...(map[url]?{fallback:map[url],note:"Remote source unavailable; same-product-group fallback retained."}:{})});}if(report.length%25===0)console.log(report.length+'/'+urls.size);}}
  await Promise.all(Array.from({length:8},worker));
  await fs.writeFile(path.join(root,'src','mocks','asset-map.json'),JSON.stringify(map,null,2));
  await fs.writeFile(path.join(root,'docs','asset-audit.json'),JSON.stringify(report.sort((a,b)=>a.source.localeCompare(b.source)),null,2));
  console.log(JSON.stringify({assets:urls.size,optimized:Object.keys(map).length,failures:report.filter(r=>r.error)},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
