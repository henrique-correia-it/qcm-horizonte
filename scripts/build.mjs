import {mkdir,writeFile,readFile,cp,rm,lstat} from 'node:fs/promises';
import {resolve,dirname,join,basename,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {site,services,projects,news} from '../src/data/site.mjs';
import {validateContent} from '../src/core.mjs';
import {getPages} from '../src/render/pages.mjs';
import {renderDocument} from '../src/render/shell.mjs';
import {publicationConfig,rebaseHtml,rebaseCss,versionModuleSources} from '../src/publication.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export function outputPath(dist,route){
 dist=resolve(dist);
 if(!route.startsWith('/')||route.startsWith('//')||/[\\%?#]/.test(route))throw new Error('Unsafe output route');
 const target=route.endsWith('.html')?resolve(dist,'.'+route):resolve(dist,'.'+route,'index.html');
 if(!target.startsWith(dist+sep))throw new Error('Output is outside dist');
 return target;
}
export async function build(){
const dist=join(root,'dist');
const publication=publicationConfig(process.env.PUBLIC_SITE_URL||site.origin);
const styleVersions=new Map();
validateContent({services,projects,news});
if(dirname(dist)!==root||basename(dist)!=='dist')throw new Error('Unsafe build output directory');
try{if((await lstat(dist)).isSymbolicLink())throw new Error('Build output cannot be a symbolic link');}catch(error){if(error.code!=='ENOENT')throw error;}
await rm(dist,{recursive:true,force:true});
await mkdir(join(dist,'assets'),{recursive:true});
await cp(join(root,'public'),dist,{recursive:true});
for(const name of ['base.css','layout.css','motion.css']){
 const css=rebaseCss(await readFile(join(root,'src/styles',name),'utf8'),publication.basePath);
 await writeFile(join(dist,'assets',name),css);
 styleVersions.set(name,createHash('sha256').update(css).digest('hex').slice(0,12));
}
const moduleSources=new Map();
for(const name of ['app.mjs','filters.mjs','core.mjs','experience.mjs'])moduleSources.set(name,await readFile(join(root,'src',name),'utf8'));
for(const [name,result] of versionModuleSources(moduleSources)){
 await writeFile(join(dist,'assets',name),result.code);
 styleVersions.set(name,result.hash);
}
const pages=getPages({site,services,projects,news});
for(const page of pages){
 const target=outputPath(dist,page.path);
 await mkdir(dirname(target),{recursive:true});
 const html=renderDocument({...page,path:publication.basePath+page.path,origin:publication.url}).replace(/\b(href|src)="\/assets\/([^"?]+\.(?:css|mjs))"/g,(match,attribute,name)=>styleVersions.has(name)?`${attribute}="/assets/${name}?v=${styleVersions.get(name)}"`:match);
 await writeFile(target,rebaseHtml(html,publication.basePath));
}
const xml=pages.filter(p=>p.path!=='/404.html').map(p=>`<url><loc>${publication.url}${p.path}</loc></url>`).join('');
await writeFile(join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`);
await writeFile(join(dist,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${publication.url}/sitemap.xml\n`);
await writeFile(join(dist,'.nojekyll'),'');
await writeFile(join(dist,'_headers'),`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n`);
await writeFile(join(dist,'routes.json'),JSON.stringify(pages.map(({path,title})=>({path,title})),null,2));
console.log(`Built ${pages.length} pages, ${services.length} areas, ${projects.length} projects and ${news.length} news articles.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await build();
