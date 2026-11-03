import test from 'node:test';
import assert from 'node:assert/strict';
import {services,projects,news} from '../src/data/site.mjs';
import {validateContent} from '../src/core.mjs';
test('six areas and all 23 historical news articles remain available',()=>{
  assert.equal(services.length,6);
  assert.equal(new Set(services.map(x=>x.slug)).size,6);
  assert.equal(news.length,23);
  assert.equal(new Set(news.map(x=>x.id)).size,23);
});
test('article dates preserve the real archive range',()=>{
  const dates=news.map(x=>x.date).sort();
  assert.equal(dates[0],'2018-01-01');
  assert.equal(dates.at(-1),'2022-12-26');
  assert.ok(news.every(x=>x.sourceUrl.startsWith('https://q-cm.pt/')&&x.paragraphs.length>0));
});
test('project figures describe the matching documented projects',()=>{
  assert.ok(projects.find(x=>x.slug==='solar-zamora').stats.some(x=>x.value==='315'&&x.unit==='kW'));
  assert.ok(projects.find(x=>x.slug==='mobilidade-duero-douro').stats.some(x=>x.value==='50'&&x.unit==='docas'));
});
test('validation rejects duplicate routes rather than silently replacing a page',()=>{
  assert.doesNotThrow(()=>validateContent({services,projects,news}));
  assert.throws(()=>validateContent({services:[...services,services[0]],projects,news}),/duplicad/i);
});
test('content identifiers cannot traverse out of the publication directory',()=>{
  for(const slug of ['../../outside','../private','a/b','a\\b','%2e%2e','']){
    const changed=news.map((n,i)=>i===0?{...n,slug}:n);
    assert.throws(()=>validateContent({services,projects,news:changed}),/identificador|slug|percurso/i);
  }
});
