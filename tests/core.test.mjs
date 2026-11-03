import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeText,filterItems,escapeHtml} from '../src/core.mjs';

const items=[
  {title:'Soluções de energia',category:'energia',date:'2021-04-26',summary:'Produção solar em Zamora'},
  {title:'Fibra ótica',category:'telecomunicacoes',date:'2021-03-04',summary:'Ensaios e manutenção'},
  {title:'Igualdade salarial',category:'grupo',date:'2022-12-26',summary:'Distinção relativa a 2022'}
];
test('search finds Portuguese accents without requiring an accented keyboard',()=>{
  assert.equal(normalizeText('  SOLUÇÕES  '),'solucoes');
  assert.equal(filterItems(items,{query:'solucoes'})[0].title,'Soluções de energia');
  assert.equal(filterItems(items,{query:'otica'})[0].title,'Fibra ótica');
});
test('empty or whitespace-only search preserves every item',()=>{
  assert.deepEqual(filterItems(items,{query:'  '}),items);
  assert.deepEqual(filterItems(items,{query:null}),items);
});
test('query, category and year filter the same collection together',()=>{
  assert.equal(filterItems(items,{query:'solar',category:'energia',year:'2021'}).length,1);
  assert.equal(filterItems(items,{query:'solar',category:'energia',year:'2022'}).length,0);
  assert.equal(filterItems(items,{category:'inexistente'}).length,0);
});
test('unmatched and markup-like queries return an empty collection safely',()=>{
  assert.deepEqual(filterItems(items,{query:'<script>alert(1)</script>'}),[]);
  assert.deepEqual(filterItems(items,{query:'coisa que não existe'}),[]);
});
test('content is escaped before entering HTML attributes or text',()=>{
  assert.equal(escapeHtml('A&B <script>"x"</script>'),'A&amp;B &lt;script&gt;&quot;x&quot;&lt;/script&gt;');
});
