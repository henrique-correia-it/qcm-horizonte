import test from 'node:test';
import assert from 'node:assert/strict';
import {publicationConfig,rebaseHtml,rebaseCss} from '../src/publication.mjs';

test('publication configuration handles root and repository URLs without accepting unsafe URL components',()=>{
 assert.deepEqual(publicationConfig('https://example.com/qcm-horizonte/'),{origin:'https://example.com',basePath:'/qcm-horizonte',url:'https://example.com/qcm-horizonte'});
 assert.equal(publicationConfig('https://example.com/').basePath,'');
 assert.throws(()=>publicationConfig('https://example.com/a?draft=1'));
 assert.throws(()=>publicationConfig('https://user:password@example.com/'));
 assert.throws(()=>publicationConfig('javascript:alert(1)'));
});

test('repository hosting rebases navigation responsive images and CSS while preserving external links and anchors',()=>{
 const html='<a href="/grupo/">Grupo</a><img src="/assets/a.webp" srcset="/assets/a.webp 640w,/assets/b.webp 1024w"><a href="#main">Saltar</a><iframe src="https://www.google.com/maps/embed?pb=map"></iframe><a href="mailto:contato@q-cm.pt">Email</a>';
 const result=rebaseHtml(html,'/qcm-horizonte');
 assert.match(result,/href="\/qcm-horizonte\/grupo\/"/);
 assert.match(result,/srcset="\/qcm-horizonte\/assets\/a.webp 640w,\/qcm-horizonte\/assets\/b.webp 1024w"/);
 assert.match(result,/href="#main"/);
 assert.match(result,/src="https:\/\/www.google.com\/maps\/embed\?pb=map"/);
 assert.match(result,/href="mailto:contato@q-cm.pt"/);
 assert.equal(rebaseCss("a{mask:url('/assets/logo.png')}b{src:url(https://example.org/a)}",'/qcm-horizonte'),"a{mask:url('/qcm-horizonte/assets/logo.png')}b{src:url(https://example.org/a)}");
});
