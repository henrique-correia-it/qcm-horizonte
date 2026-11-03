import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,join,dirname,relative,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {site} from '../src/data/site.mjs';
import {publicationConfig} from '../src/publication.mjs';

async function filesUnder(root){
 const result=[];
 for(const entry of await readdir(root,{withFileTypes:true})){
  const full=join(root,entry.name);
  if(entry.isDirectory())result.push(...await filesUnder(full));else if(entry.isFile())result.push(full);
 }
 return result;
}
export async function checkBuild({root=resolve('dist'),origin=process.env.PUBLIC_SITE_URL||site.origin}={}){
 root=resolve(root);
 const publication=publicationConfig(origin);
 const files=await filesUnder(root),htmlFiles=files.filter(p=>p.endsWith('.html'));
 const errors=[],titles=new Set(),documents=new Map();let checkedLinks=0;
 for(const file of htmlFiles){
  const text=await readFile(file,'utf8');documents.set(file,text);
  const label=relative(root,file).replaceAll(sep,'/');
  const title=text.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  if(!title||titles.has(title))errors.push(`${label}: missing or duplicate title`);else titles.add(title);
  if((text.match(/<h1(?:\s|>)/gi)||[]).length!==1)errors.push(`${label}: expected one H1`);
  if(!text.includes('lang="pt-PT"')||!text.includes('name="viewport"')||!text.includes('name="description"')||!text.includes('rel="canonical"'))errors.push(`${label}: missing language or metadata`);
  if(/Lorem ipsum|__QCM_|codex-preview|TODO_PLACEHOLDER/.test(text))errors.push(`${label}: placeholder content`);
  const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)errors.push(`${label}: duplicate element IDs`);
 }
 async function checkReference(raw,file){
  if(!raw||/^(?:data:|mailto:|tel:|javascript:)/i.test(raw))return;
  const route=publication.basePath+'/'+relative(root,file).replaceAll(sep,'/').replace(/index\.html$/,'');
  let url;
  try{url=new URL(raw.replaceAll('&amp;','&'),new URL(route,origin));}catch{errors.push(`${relative(root,file)}: invalid URL ${raw}`);return;}
  if(url.origin!==new URL(origin).origin)return;
  if(publication.basePath&&url.pathname!==publication.basePath&&!url.pathname.startsWith(publication.basePath+'/')){errors.push(`${raw}: reference leaves public base path`);return;}
  const pathname=publication.basePath?url.pathname.slice(publication.basePath.length)||'/':url.pathname;
  let target=resolve(root,'.'+decodeURIComponent(pathname));
  if(target!==root&&!target.startsWith(root+sep)){errors.push(`${raw}: reference escapes build`);return;}
  try{if((await stat(target)).isDirectory())target=join(target,'index.html');await stat(target);}catch{errors.push(`${relative(root,file)}: missing ${raw}`);return;}
  checkedLinks++;
  if(url.hash&&target.endsWith('.html')){
   const text=documents.get(target)||await readFile(target,'utf8');
   const id=decodeURIComponent(url.hash.slice(1));
   if(!text.includes(`id="${id}"`))errors.push(`${relative(root,file)}: missing anchor ${raw}`);
  }
 }
 for(const [file,text] of documents){
  for(const match of text.matchAll(/\b(href|src|srcset)="([^"]*)"/g)){
   const refs=match[1]==='srcset'?match[2].split(',').map(s=>s.trim().split(/\s+/)[0]):[match[2]];
   for(const ref of refs)await checkReference(ref,file);
  }
 }
 for(const file of files.filter(p=>p.endsWith('.css'))){
  const text=await readFile(file,'utf8');
  for(const match of text.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g))await checkReference(match[1],file);
 }
 return {pages:htmlFiles.length,files:files.length,checkedLinks,errors};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const result=await checkBuild();
 console.log(JSON.stringify(result,null,2));
 if(result.errors.length)process.exitCode=1;
}
