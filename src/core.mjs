export function normalizeText(value){
  return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
}
export function filterItems(items,{query='',category='all',year='all'}={}){
  const q=normalizeText(query);
  return items.filter(item=>
    (category==='all'||item.category===category)&&
    (year==='all'||String(item.date??'').startsWith(String(year)))&&
    (!q||normalizeText(item.search??[item.title,item.summary,...(item.paragraphs??[])].join(' ')).includes(q))
  );
}
export function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function validateContent({services,projects,news}){
  for(const [name,list] of Object.entries({services,projects,news})){
    const keys=list.map(x=>x.slug);
    if(new Set(keys).size!==keys.length)throw new Error(`Percurso duplicado em ${name}`);
    for(const item of list){
      if(typeof item.slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug))throw new Error(`Identificador inválido em ${name}`);
      if(!item.slug||!item.title)throw new Error(`Conteúdo incompleto em ${name}`);
      if(item.date&&!/^\d{4}-\d{2}-\d{2}$/.test(item.date))throw new Error(`Data inválida em ${item.slug}`);
    }
  }
  if(new Set(news.map(x=>x.id)).size!==news.length)throw new Error('Artigo duplicado');
}
