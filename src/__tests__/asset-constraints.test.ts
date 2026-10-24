import {describe,it,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import mappings from '@/mocks/asset-map.json';
import audit from '../../docs/asset-audit.json';
describe('local image preparation',()=>{
  it('serves every mapped image locally below 1 MB and 1300px in both dimensions',async()=>{
    const assets=[...new Set(Object.values(mappings))];
    expect(assets.length).toBeGreaterThan(500);
    await Promise.all(assets.map(async url=>{
      expect(url.startsWith('/media/')).toBe(true);
      const bytes=await readFile(path.join(process.cwd(),'public',url));const metadata=await sharp(bytes).metadata();
      expect(bytes.length).toBeLessThan(1_000_000);expect(metadata.width).toBeLessThanOrEqual(1300);expect(metadata.height).toBeLessThanOrEqual(1300);
    }));
  });
  it('discloses missing source images and maps each to an existing same-group fallback',()=>{
    const missing=audit.filter(a=>'error' in a);
    expect(missing).toHaveLength(6);
    for(const row of missing){expect((row as any).fallback).toBe((mappings as Record<string,string>)[row.source]);expect((row as any).note).toContain('fallback');}
  });
});
