import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {resolve,join,sep} from 'node:path';
import {checkBuild} from '../scripts/check-build.mjs';
import {outputPath} from '../scripts/build.mjs';
import {spawnSync} from 'node:child_process';
import {access,readFile} from 'node:fs/promises';

test('the output validator catches a missing local page and asset',async()=>{
 const scratch=resolve('.superpowers');await mkdir(scratch,{recursive:true});
 const fixture=await mkdtemp(join(scratch,'qa-links-'));
 try{
  await writeFile(join(fixture,'index.html'),'<!doctype html><html lang="pt-PT"><head><title>Teste</title><meta name="viewport" content="width=device-width"><meta name="description" content="Teste"><link rel="canonical" href="https://example.com/"></head><body><h1>Teste</h1><a href="/inexistente/">Página</a><img src="/assets/ausente.webp" alt="Teste"></body></html>');
  const result=await checkBuild({root:fixture,origin:'https://example.com'});
  assert.ok(result.errors.some(e=>e.includes('/inexistente/')));
  assert.ok(result.errors.some(e=>e.includes('/assets/ausente.webp')));
 }finally{assert.ok(fixture.startsWith(scratch+sep));await rm(fixture,{recursive:true,force:true});}
});
test('a rebuild removes an obsolete page instead of publishing stale content',async()=>{
 await mkdir(resolve('dist'),{recursive:true});
 const stale=resolve('dist/obsolete-private-draft.html');
 await writeFile(stale,'obsolete draft');
 const result=spawnSync(process.execPath,['scripts/build.mjs'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 await assert.rejects(access(stale));
});
test('the writer cannot resolve an output outside the declared dist directory',()=>{
 const dist=resolve('dist');
 assert.equal(outputPath(dist,'/grupo/'),join(dist,'grupo','index.html'));
 assert.throws(()=>outputPath(dist,'/noticias/../../outside/'),/outside|fora|Unsafe/i);
 assert.throws(()=>outputPath(dist,'/%2e%2e/outside/'),/outside|fora|Unsafe/i);
});

test('the complete build works under a GitHub Pages repository path',async()=>{
 const publicUrl='https://henrique-correia-it.github.io/qcm-horizonte';
 try{
  const result=spawnSync(process.execPath,['scripts/build.mjs'],{encoding:'utf8',env:{...process.env,PUBLIC_SITE_URL:publicUrl}});
  assert.equal(result.status,0,result.stderr);
  const html=await readFile(resolve('dist/index.html'),'utf8');
  assert.match(html,/href="\/qcm-horizonte\/areas\/"/);
  assert.match(html,/href="\/qcm-horizonte\/assets\/layout\.css\?v=[a-f0-9]{12}"/);
  assert.match(html,/rel="canonical" href="https:\/\/henrique-correia-it\.github\.io\/qcm-horizonte\/"/);
  assert.match(html,/property="og:image" content="https:\/\/henrique-correia-it\.github\.io\/qcm-horizonte\/assets\/qcm-share.png"/);
  assert.match(await readFile(resolve('dist/assets/base.css'),'utf8'),/url\('\/qcm-horizonte\/assets\/manrope-variable.woff2'\)/);
  const checked=await checkBuild({origin:publicUrl});
  assert.equal(checked.pages,46);
  assert.deepEqual(checked.errors,[]);
 }finally{
  const reset=spawnSync(process.execPath,['scripts/build.mjs'],{encoding:'utf8',env:{...process.env,PUBLIC_SITE_URL:''}});
  assert.equal(reset.status,0,reset.stderr);
 }
});
