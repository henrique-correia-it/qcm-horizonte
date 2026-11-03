import {createHash} from 'node:crypto';

export function publicationConfig(value){
 const parsed=new URL(value);
 if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.search||parsed.hash)throw new Error('Invalid public site URL');
 const basePath=parsed.pathname.replace(/\/$/,'');
 if(basePath&&!/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+$/.test(basePath))throw new Error('Invalid public base path');
 return {origin:parsed.origin,basePath,url:parsed.origin+basePath};
}

export function rebaseHtml(html,basePath){
 if(!basePath)return html;
 return html.replace(/\b(href|src|action)="\/(?!\/)([^"]*)"/g,(_,attribute,path)=>`${attribute}="${basePath}/${path}"`)
  .replace(/\bsrcset="([^"]*)"/g,(_,value)=>`srcset="${value.replace(/(^|,\s*)(\/(?!\/)\S+)/g,(_m,separator,path)=>separator+basePath+path)}"`);
}

export function rebaseCss(css,basePath){
 if(!basePath)return css;
 return css.replace(/url\(\s*(['"]?)(\/(?!\/)[^)'"\s]+)\1\s*\)/g,(_,quote,path)=>`url(${quote}${basePath}${path}${quote})`);
}

export function versionModuleSources(sources){
 const compiled=new Map(),visiting=new Set();
 function visit(name){
  if(compiled.has(name))return compiled.get(name);
  if(visiting.has(name))throw new Error(`Circular client module: ${name}`);
  if(!sources.has(name))throw new Error(`Missing client module: ${name}`);
  visiting.add(name);
  const code=sources.get(name).replace(/\b((?:import|export)\s+(?:[^;'"\n]+?\s+from\s+)?)(['"])\.\/([\w.-]+\.mjs)\2/g,(_,prefix,quote,dependency)=>`${prefix}${quote}./${dependency}?v=${visit(dependency).hash}${quote}`);
  const result={code,hash:createHash('sha256').update(code).digest('hex').slice(0,12)};
  visiting.delete(name);compiled.set(name,result);return result;
 }
 for(const name of sources.keys())visit(name);
 return compiled;
}
