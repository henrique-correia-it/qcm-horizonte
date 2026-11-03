import {initCollections} from './filters.mjs';
import {initExperience} from './experience.mjs';

const root=document.documentElement;
root.classList.add('js');
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let userMotion='full';
try{userMotion=localStorage.getItem('qcm-motion')||'full';}catch{}
const isReduced=()=>systemMotion.matches||userMotion==='reduce';
function applyMotion(){
 root.dataset.motion=isReduced()?'reduce':'full';
 for(const button of document.querySelectorAll('[data-motion-toggle]')){
  button.hidden=false;
  button.setAttribute('aria-pressed',String(isReduced()));
  if(button.firstChild)button.firstChild.textContent=isReduced()?'Movimento reduzido ':'Reduzir movimento ';
 }
 if(isReduced())for(const el of document.querySelectorAll('.reveal-pending'))el.classList.add('is-visible');
}
applyMotion();
systemMotion.addEventListener?.('change',applyMotion);
for(const button of document.querySelectorAll('[data-motion-toggle]'))button.addEventListener('click',()=>{
 userMotion=userMotion==='reduce'?'full':'reduce';
 try{localStorage.setItem('qcm-motion',userMotion);}catch{}
 applyMotion();
});

const menu=document.getElementById('mobile-menu');
const openMenu=document.querySelector('[data-menu-open]');
if(menu&&openMenu&&typeof menu.showModal==='function'){
 openMenu.hidden=false;
 openMenu.addEventListener('click',()=>{
  if(!menu.open){menu.showModal();openMenu.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';}
 });
 const close=()=>{if(menu.open)menu.close()};
 menu.querySelector('[data-menu-close]')?.addEventListener('click',close);
 menu.addEventListener('close',()=>{openMenu.setAttribute('aria-expanded','false');document.body.style.overflow='';openMenu.focus()});
 menu.addEventListener('click',event=>{if(event.target===menu)close()});
 for(const link of menu.querySelectorAll('a'))link.addEventListener('click',close);
}else{
 root.classList.remove('js');
}

try{initExperience();}catch(error){console.warn('The guide content remains fully available.',error)}

function revealContent(){
 if(isReduced()||!('IntersectionObserver'in window))return;
 const pending=[];
 try{
  const observer=new IntersectionObserver(entries=>{
   let stagger=0;
   for(const entry of entries){
    if(entry.isIntersecting){
     entry.target.style.setProperty('--reveal-delay',`${Math.min(stagger++,3)*70}ms`);
     entry.target.classList.add('is-visible');observer.unobserve(entry.target);
    }
   }
  },{threshold:.06,rootMargin:'0px 0px -25px 0px'});
  for(const el of document.querySelectorAll('[data-reveal]')){
   if(el.getBoundingClientRect().top>innerHeight*.94){el.classList.add('reveal-pending');pending.push(el);observer.observe(el);}
  }
 }catch{for(const el of pending)el.classList.remove('reveal-pending')}
}
revealContent();

const header=document.querySelector('[data-header]');
const hero=document.querySelector('[data-hero-image]');
let scheduled=false;
function updateScroll(){
 const y=window.scrollY||0;
 const extent=document.documentElement.scrollHeight-innerHeight;
 root.style.setProperty('--scroll-progress',extent>0?Math.min(1,y/extent).toFixed(4):'0');
 header?.classList.toggle('is-scrolled',y>35);
 if(hero){
  hero.style.setProperty('--hero-offset',isReduced()?'0px':`${Math.min(y*.055,24).toFixed(2)}px`);
  hero.style.transform=isReduced()?'':`scale(${(1+Math.min(y/18000,.025)).toFixed(4)})`;
 }
 scheduled=false;
}
const onScroll=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll)}};
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',onScroll,{passive:true});
updateScroll();

if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 for(const button of document.querySelectorAll('.button')){
  const arrow=button.querySelector('.button-arrow');if(!arrow)continue;
  button.addEventListener('pointermove',event=>{if(isReduced())return;const b=button.getBoundingClientRect();const x=(event.clientX-b.left-b.width/2)/b.width*6;const y=(event.clientY-b.top-b.height/2)/b.height*6;arrow.style.transform=`translate(${x}px,${y}px)`});
  button.addEventListener('pointerleave',()=>{arrow.style.transform=''});
 }
}
try{initCollections();}catch(error){console.warn('The collection remains fully available.',error)}

if(location.pathname.endsWith('/contactos/')){
 const areas={'energia-e-mobilidade':'Energia e mobilidade',telecomunicacoes:'Telecomunicações','arquitetura-e-construcao':'Arquitetura e construção','consultoria-e-gestao':'Consultoria e gestão','economia-de-proximidade':'Economia de proximidade','inovacao-e-desenvolvimento':'Inovação e desenvolvimento'};
 const area=areas[new URLSearchParams(location.search).get('area')];
 if(area){
  const link=document.querySelector('.contact-option-main');if(link)link.href=`mailto:contato@q-cm.pt?subject=${encodeURIComponent('Projeto — '+area)}`;
  const interest=document.querySelector('[data-contact-interest]'),name=interest?.querySelector('[data-contact-interest-name]');
  if(interest&&name){name.textContent=area;interest.hidden=false;}
 }
}
