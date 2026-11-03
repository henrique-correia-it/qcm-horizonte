import test from 'node:test';
import assert from 'node:assert/strict';
import {services,projects,news,site} from '../src/data/site.mjs';
import {areaExperience,contactQuestions} from '../src/data/experience.mjs';
import {getPages} from '../src/render/pages.mjs';
import {renderDocument} from '../src/render/shell.mjs';
import {findInertAffordances} from '../scripts/check-build.mjs';
import {resolveContactArea} from '../src/core.mjs';

test('every published scope has an explanation and practical points, with questions for all six areas',()=>{
 let count=0;
 for(const service of services){
  const content=areaExperience[service.slug];
  assert.ok(content,service.slug);
  assert.equal(content.scopes.length,service.features.length);
  for(const scope of content.scopes){
   assert.ok(scope.body.length>80,service.slug);
   assert.ok(scope.points.length>=2);
   assert.ok(scope.points.every(p=>p.length>15));
   count++;
  }
  assert.equal(content.questions.length,3);
  assert.ok(content.questions.every(q=>q.question.length>15&&q.answer.length>70));
  assert.equal(content.guide.inputs.length,3);
 }
 assert.equal(count,30);
 assert.equal(contactQuestions.length,4);
});

test('all service plus signs expand native disclosures with real text and a contextual next step',()=>{
 const pages=getPages({site,services,projects,news});
 for(const service of services){
  const page=pages.find(p=>p.path===`/areas/${service.slug}/`);
  assert.equal((page.body.match(/<details class="competence-item"/g)||[]).length,5);
  assert.equal((page.body.match(/<details class="faq-item"/g)||[]).length,3);
  for(const scope of areaExperience[service.slug].scopes)assert.ok(page.body.includes(scope.body));
  assert.ok(page.body.includes(`/contactos/?area=${service.slug}`));
 }
});

test('the whole site contains no inert navigation or expansion affordances',()=>{
 const pages=getPages({site,services,projects,news});
 const issues=pages.flatMap(page=>findInertAffordances(renderDocument({...page,origin:site.origin})).map(issue=>`${page.path}: ${issue}`));
 assert.deepEqual(issues,[]);
 assert.ok(findInertAffordances('<li><svg data-icon="plus"></svg></li>').length);
 assert.ok(findInertAffordances('<a href="#">Nada</a>').length);
 assert.deepEqual(findInertAffordances('<details><summary>Âmbito<svg data-icon="plus"></svg></summary><p>Explicação</p></details>'),[]);
});

test('the home guide has six complete readable fallback panels before JavaScript runs',()=>{
 const page=getPages({site,services,projects,news}).find(p=>p.path==='/');
 assert.equal((page.body.match(/data-guide-panel/g)||[]).length,6);
 assert.match(page.body,/data-guide-nav[^>]*hidden/);
 assert.doesNotMatch(page.body,/data-guide-panel[^>]*hidden/);
 for(const service of services)assert.ok(page.body.includes(areaExperience[service.slug].guide.title));
 assert.match(page.body,/<a class="hero-image-corner"[^>]+href="\/areas\/energia-e-mobilidade\/"/);
});

test('cases and contacts explain how to prepare a relevant first conversation',()=>{
 const pages=getPages({site,services,projects,news});
 for(const project of projects){
  const page=pages.find(p=>p.path===`/projetos/${project.slug}/`);
  assert.match(page.body,/data-project-preparation/);
 }
 const contact=pages.find(p=>p.path==='/contactos/');
 assert.match(contact.body,/data-contact-interest[^>]*hidden/);
 assert.equal((contact.body.match(/<details class="faq-item"/g)||[]).length,4);
});

test('contact interest accepts only the six own area keys and rejects inherited or arbitrary URL values',()=>{
 for(const service of services)assert.equal(typeof resolveContactArea(service.slug),'string');
 assert.equal(resolveContactArea('telecomunicacoes'),'Telecomunicações');
 for(const invalid of ['__proto__','toString','constructor','hasOwnProperty','invalid','<script>alert(1)</script>',null,undefined])assert.equal(resolveContactArea(invalid),null);
});
