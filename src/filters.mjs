import {filterItems} from './core.mjs';

export function initCollections(){
 for(const collection of document.querySelectorAll('[data-collection]')){
  const form=collection.querySelector('[data-filter-form]');
  const list=collection.querySelector('[data-filter-list]');
  if(!form||!list)continue;
  const cards=[...list.querySelectorAll('[data-filter-item]')];
  const items=cards.map((element,index)=>({element,index,category:element.dataset.category,date:element.dataset.year,search:element.dataset.search}));
  const count=collection.querySelector('[data-filter-count]');
  const empty=collection.querySelector('[data-filter-empty]');
  const categoryButtons=[...form.querySelectorAll('[data-category]')];
  const query=form.elements.namedItem('query');
  const year=form.elements.namedItem('year');
  const initial=new URLSearchParams(location.search);
  let category=categoryButtons.some(b=>b.dataset.category===initial.get('area'))?initial.get('area'):'all';
  if(query)query.value=initial.get('q')||'';
  if(year&&[...year.options].some(o=>o.value===initial.get('ano')))year.value=initial.get('ano');
  function update({persist=true}={}){
   const selected=filterItems(items,{query:query?.value||'',category,year:year?.value||'all'});
   const visible=new Set(selected.map(x=>x.index));
   for(const item of items){
    item.element.hidden=!visible.has(item.index);
    if(!item.element.hidden)item.element.classList.add('is-visible');
   }
   for(const button of categoryButtons)button.setAttribute('aria-pressed',String(button.dataset.category===category));
   if(count){const noun=form.dataset.kind==='news'?(selected.length===1?'publicação':'publicações'):(selected.length===1?'projeto':'projetos');count.textContent=`${selected.length} ${noun}`;}
   if(empty)empty.hidden=selected.length!==0;
   if(persist){
    const url=new URL(location.href);
    category==='all'?url.searchParams.delete('area'):url.searchParams.set('area',category);
    query?.value.trim()?url.searchParams.set('q',query.value.trim()):url.searchParams.delete('q');
    year&&year.value!=='all'?url.searchParams.set('ano',year.value):url.searchParams.delete('ano');
    try{history.replaceState(null,'',url);}catch{}
   }
  }
  for(const button of categoryButtons)button.addEventListener('click',()=>{category=button.dataset.category;update()});
  form.addEventListener('submit',event=>{event.preventDefault();update()});
  query?.addEventListener('input',()=>update());
  year?.addEventListener('change',()=>update());
  collection.querySelector('[data-filter-reset]')?.addEventListener('click',()=>{category='all';if(query)query.value='';if(year)year.value='all';update();query?.focus()});
  update({persist:false});
  form.hidden=false;
 }
}
