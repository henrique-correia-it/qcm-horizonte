import test from 'node:test';
import assert from 'node:assert/strict';
import {site,services,projects,news} from '../src/data/site.mjs';
import {getPages} from '../src/render/pages.mjs';
import {renderDocument} from '../src/render/shell.mjs';

test('every service, case and historical article has its own route',()=>{
  const pages=getPages({site,services,projects,news});
  const paths=new Set(pages.map(p=>p.path));
  assert.equal(paths.size,pages.length);
  for(const s of services)assert.ok(paths.has(`/areas/${s.slug}/`));
  for(const p of projects)assert.ok(paths.has(`/projetos/${p.slug}/`));
  for(const n of news)assert.ok(paths.has(`/noticias/${n.slug}/`));
  for(const p of ['/','/grupo/','/areas/','/projetos/','/noticias/','/contactos/','/informacao/','/404.html'])assert.ok(paths.has(p));
});
test('a rendered page exposes one H1, language, viewport and local metadata',()=>{
  const home=getPages({site,services,projects,news}).find(p=>p.path==='/');
  const html=renderDocument({...home,origin:site.origin});
  assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
  assert.match(html,/<html lang="pt-PT"/);
  assert.match(html,/name="viewport"/);
  assert.match(html,/rel="canonical"/);
  assert.match(html,/Ligamos ideias ao futuro/);
  assert.match(html,/Imagem ilustrativa/);
  assert.doesNotMatch(html,/fonts\.googleapis\.com|jquery|Lorem ipsum/);
});
test('the full article is readable and its title cannot inject markup',()=>{
  const example={...news[0],slug:'ensaio',title:'Teste <script>alert(1)</script>',paragraphs:['Primeiro parágrafo.','Segundo parágrafo completo.']};
  const article=getPages({site,services,projects,news:[example]}).find(p=>p.path==='/noticias/ensaio/');
  const html=renderDocument({...article,origin:site.origin});
  assert.match(html,/Segundo parágrafo completo/);
  assert.match(html,/&lt;script&gt;/);
  assert.doesNotMatch(html,/<script>alert/);
});
test('article links and dates are delivered before JavaScript runs',()=>{
  const index=getPages({site,services,projects,news}).find(p=>p.path==='/noticias/');
  assert.equal((index.body.match(/data-filter-item/g)||[]).length,23);
  assert.match(index.body,/2022-12-26/);
  assert.match(index.body,/2018-01-01/);
  assert.match(index.body,/data-filter-empty[^>]*hidden/);
});
test('shared project previews use documentary imagery or the company identity',()=>{
  const pages=getPages({site,services,projects,news});
  const bike=pages.find(p=>p.path==='/projetos/mobilidade-duero-douro/');
  const html=renderDocument({...bike,origin:site.origin});
  assert.match(html,/property="og:image" content="[^\"]*\/assets\/archive-62.webp"/);
  assert.doesNotMatch(html,/property="og:image" content="[^\"]*concept-energy/);
  const noPhoto=pages.find(p=>p.path==='/projetos/fibra-otica-schmitt/');
  assert.match(renderDocument({...noPhoto,origin:site.origin}),/property="og:image" content="[^\"]*qcm-share.png"/);
});
test('an original illustration is never labelled as a company archive photograph',()=>{
  const page=getPages({site,services,projects,news}).find(p=>p.path==='/projetos/fibra-otica-schmitt/');
  assert.match(page.body,/Ilustração gráfica/);
  assert.doesNotMatch(page.body,/<figcaption>Imagem do arquivo da empresa/);
});
test('historical calls to action offer a current contact path with a dated context',()=>{
  const page=getPages({site,services,projects,news}).find(p=>p.path===`/noticias/${news.find(n=>n.id===65).slug}/`);
  assert.match(page.body,/data-historical-action/);
  assert.match(page.body,/condições atuais/);
});

test('the contact page embeds the real address map with an accessible title and a direct fallback',()=>{
  const page=getPages({site,services,projects,news}).find(p=>p.path==='/contactos/');
  assert.match(page.body,/<iframe[^>]+src="https:\/\/www\.google\.com\/maps\/embed\?pb=/);
  assert.match(page.body,/<iframe[^>]+title="Localização da Q.CM no Google Maps"/);
  assert.match(page.body,/Guarda%201576/);
  assert.match(page.body,/loading="lazy"/);
  assert.match(page.body,/Abrir localização/);
  const info=getPages({site,services,projects,news}).find(p=>p.path==='/informacao/');
  assert.match(info.body,/mapa incorporado.*Google Maps/);
});
