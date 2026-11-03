export function initExperience(){
 for(const guide of document.querySelectorAll('[data-solution-guide]')){
  const nav=guide.querySelector('[data-guide-nav]');
  const tabs=[...guide.querySelectorAll('[data-guide-tab]')];
  const panels=[...guide.querySelectorAll('[data-guide-panel]')];
  if(!nav||!tabs.length||tabs.length!==panels.length||tabs.some((tab,i)=>tab.getAttribute('aria-controls')!==panels[i].id))continue;
  function select(index,focus=false){
   if(index<0||index>=tabs.length)return;
   tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
   panels.forEach((panel,i)=>{panel.hidden=i!==index;});
   if(focus)tabs[index].focus();
  }
  try{
   nav.setAttribute('role','tablist');
   tabs.forEach((tab,index)=>{
    tab.setAttribute('role','tab');
    panels[index].setAttribute('role','tabpanel');
    panels[index].setAttribute('aria-labelledby',tab.id);
    panels[index].tabIndex=0;
    tab.addEventListener('click',()=>select(index));
    tab.addEventListener('keydown',event=>{
     if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
     event.preventDefault();
     const target=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+tabs.length)%tabs.length;
     select(target,true);
    });
   });
   const initial=panels.findIndex(panel=>'#'+panel.id===location.hash);
   select(initial>=0?initial:0);
   nav.hidden=false;
  }catch{
   nav.hidden=true;
   panels.forEach(panel=>{panel.hidden=false;panel.removeAttribute('role');panel.removeAttribute('tabindex');panel.setAttribute('aria-labelledby','guide-title-'+panel.dataset.guidePanel);});
  }
 }
}
