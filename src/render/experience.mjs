import {escapeHtml as e} from '../core.mjs';
import {areaExperience} from '../data/experience.mjs';
import {icon} from './shell.mjs';

const contactLink=service=>`<a class="text-link" href="/contactos/?area=${e(service.slug)}">Falar sobre ${e(service.title.toLowerCase())} ${icon()}</a>`;
const points=items=>`<ul class="practical-points">${items.map(text=>`<li>${e(text)}</li>`).join('')}</ul>`;

export function renderScopes(service){
 const content=areaExperience[service.slug];
 return `<section class="competence-section section" data-area="${e(service.slug)}"><div class="wrap"><div class="section-heading"><div data-reveal><span class="eyebrow">Âmbitos de atuação</span><h2>Onde podemos<br>criar <em>valor.</em></h2></div><p data-reveal>Explore cada âmbito para conhecer o seu enquadramento, aplicações e pontos de partida.</p></div><div class="competence-list">${service.features.map((title,index)=>{
  const scope=content.scopes[index];
  return `<details class="competence-item" data-reveal><summary><span class="scope-number">${String(index+1).padStart(2,'0')}</span><h3>${e(title)}</h3><span class="disclosure-control">${icon('plus')}</span></summary><div class="disclosure-body"><p>${e(scope.body)}</p><h4>Para enquadrar a sua necessidade</h4>${points(scope.points)}<div class="disclosure-links">${scope.caseSlug?`<a class="text-link" href="/projetos/${scope.caseSlug}/">Explorar um caso documentado ${icon()}</a>`:''}${contactLink(service)}</div></div></details>`;
 }).join('')}</div></div></section>`;
}

export function renderQuestions({title='Perguntas com<br>um ponto de <em>partida.</em>',label='Antes de avançar',questions}){
 return `<section class="section wrap faq-section"><div data-reveal><span class="eyebrow">${e(label)}</span><h2>${title}</h2><p class="faq-intro">Informação para preparar uma conversa mais útil, a partir do seu contexto.</p></div><div class="faq-list">${questions.map(q=>`<details class="faq-item" data-reveal><summary><h3>${e(q.question)}</h3><span class="disclosure-control">${icon('plus')}</span></summary><div class="disclosure-body"><p>${e(q.answer)}</p></div></details>`).join('')}</div></section>`;
}

export function renderSolutionGuide(services){
 return `<section class="solution-section section"><div class="wrap" data-solution-guide><div class="section-heading"><div data-reveal><span class="eyebrow">O seu desafio, o nosso ponto de partida</span><h2>Por onde<br>quer <em>começar?</em></h2></div><p data-reveal>Escolha o que pretende trabalhar. Conheça as competências e os elementos que ajudam a dar contexto à sua ideia.</p></div><div class="guide-nav" data-guide-nav hidden aria-label="Escolher uma necessidade">${services.map(s=>`<button type="button" id="guide-tab-${s.slug}" data-guide-tab="${s.slug}" aria-controls="guide-panel-${s.slug}" data-area="${s.slug}">${icon(s.icon)}<span>${e(areaExperience[s.slug].guide.label)}</span></button>`).join('')}</div><div class="guide-panels">${services.map(s=>{
  const guide=areaExperience[s.slug].guide;
  return `<section class="guide-panel" data-guide-panel="${s.slug}" data-area="${s.slug}" id="guide-panel-${s.slug}" aria-labelledby="guide-title-${s.slug}"><div class="guide-panel-copy"><span class="eyebrow">${e(s.title)}</span><h3 id="guide-title-${s.slug}">${e(guide.title)}</h3><p>${e(guide.body)}</p><div class="guide-actions"><a class="text-link" href="/areas/${s.slug}/">Explorar esta área ${icon()}</a>${contactLink(s)}</div></div><div class="guide-checklist"><span>O que ajuda a começar</span><ol>${guide.inputs.map((text,index)=>`<li><span>0${index+1}</span><p>${e(text)}</p></li>`).join('')}</ol></div></section>`;
 }).join('')}</div></div></section>`;
}

export function renderProjectPreparation(service){
 if(!service)return '';
 const guide=areaExperience[service.slug].guide;
 return `<section class="section wrap project-preparation" data-project-preparation data-area="${service.slug}"><div data-reveal><span class="eyebrow">Do exemplo à sua necessidade</span><h2>Tem um desafio<br><em>semelhante?</em></h2><p>Este caso documenta um contexto específico. Para conversar sobre uma nova intervenção em ${e(service.title.toLowerCase())}, comece pelos elementos que ajudam a compreender a sua necessidade.</p>${contactLink(service)}</div><ol class="preparation-steps">${guide.inputs.map((text,index)=>`<li data-reveal><span>0${index+1}</span><h3>${e(text)}</h3>${icon('check')}</li>`).join('')}</ol></section>`;
}
