import { loadWorld } from '../js/core/loader.js';
import { initMap } from '../js/core/map.js';

const $ = (id) => document.getElementById(id);
const form = $('editor');
let rows = [], realms = {}, selected = -1, picking = false, dirty = false, map, world, pinLayer;
const keys = ['realm','category','id','name_en','x','y','name_fr','name_es','name_de','minZoom','labelMinZoom','label'];
const notify = (message, error=false) => { $('notice').textContent=message; $('notice').classList.toggle('error',error); };
function options(select, values, placeholder='') {
    const current=select.value;
    select.replaceChildren();
    if(placeholder) select.add(new Option(placeholder,''));
    values.forEach(v=>select.add(new Option(v,v)));
    if([...select.options].some(o=>o.value===current))select.value=current;
}
function updateCategories(){
    const realm=form.elements.realm.value;
    options(form.elements.category, realms[realm]||[]);
}
function refreshFilters(){
    options($('realmFilter'),Object.keys(realms),'Tous les royaumes');
    const categories = $('realmFilter').value ? realms[$('realmFilter').value] : [...new Set(Object.values(realms).flat())].sort();
    options($('categoryFilter'),categories||[],'Toutes les catégories');
}
function filtered(){
    const q=$('search').value.trim().toLowerCase();
    return rows.map((r,i)=>({r,i})).filter(({r})=>(!$('realmFilter').value||r.realm===$('realmFilter').value)&&(!$('categoryFilter').value||r.category===$('categoryFilter').value)&&(!q||[r.name_en,r.id,r.name_fr,r.name_es,r.name_de].some(v=>String(v||'').toLowerCase().includes(q))));
}
function validPoint(r){return r.category!=='_realm' && r.x!=='' && r.y!=='' && Number.isFinite(Number(r.x))&&Number.isFinite(Number(r.y));}
function renderPins(){
    pinLayer.clearLayers();
    const visible=filtered();
    visible.forEach(({r,i})=>{
        if(!validPoint(r))return;
        const icon=L.divIcon({className:'',html:`<div class="admin-point ${i===selected?'selected':''}"></div>`,iconSize:[20,20],iconAnchor:[10,10]});
        L.marker(map.unproject([Number(r.x),Number(r.y)],world.maxZoom),{icon,title:r.name_en||'Lieu'}).on('click',e=>{L.DomEvent.stopPropagation(e);select(i);}).addTo(pinLayer);
    });
}
function renderList(){
    const list=$('list');list.replaceChildren();
    filtered().forEach(({r,i})=>{
        const b=document.createElement('button');b.type='button';b.className='place'+(selected===i?' active':'');
        b.textContent=`${r.name_en||'(sans nom)'} · ${r.realm}/${r.category}${validPoint(r)?'':' ⚠ coordonnées'}`;
        b.onclick=()=>select(i);list.append(b);
    });
    renderPins();
}
function select(i){
    selected=i;picking=false;
    const r=rows[i];
    if(!r)return;
    options(form.elements.realm,Object.keys(realms));form.elements.realm.value=r.realm;
    updateCategories();
    keys.forEach(k=>{if(form.elements[k])form.elements[k].value=r[k]??'';});
    renderList();
}
function markDirty(){dirty=true;notify('Modifications non enregistrées dans le CSV.');}
function applyForm(){
    if(selected<0)return false;
    if(!form.reportValidity())return false;
    const r={};keys.forEach(k=>r[k]=form.elements[k].value.trim());
    if(!realms[r.realm]?.includes(r.category)){notify('Catégorie inconnue pour ce royaume.',true);return false;}
    rows[selected]=r;markDirty();renderList();return true;
}
async function request(path,method='GET',data){
    const response=await fetch(path,{method,headers:{'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined,cache:'no-store'});
    const result=await response.json();
    if(!response.ok)throw new Error((result.errors||[]).join('\n')||result.error||result.output||`Erreur HTTP ${response.status}`);
    return result;
}
async function init(){
    try{
        const [data,loadedWorld]=await Promise.all([request('/api/places'),loadWorld()]);
        rows=data.rows;realms=data.realms;world=loadedWorld;
        map=initMap(world);pinLayer=L.layerGroup().addTo(map);
        options(form.elements.realm,Object.keys(realms));updateCategories();refreshFilters();renderList();
        if(rows.length)select(0);
        map.on('click',e=>{
            if(!picking||selected<0)return;
            const p=map.project(e.latlng,world.maxZoom);
            form.elements.x.value=Math.round(p.x);form.elements.y.value=Math.round(p.y);
            picking=false;$('pick').textContent='Placer par clic';
            applyForm();notify('Coordonnées modifiées. Enregistre le CSV pour les conserver.');
        });
        notify(`${rows.length} lignes chargées. Sélectionne un lieu ou crée-en un.`);
    }catch(e){notify(e.message,true);console.error(e);}
}
$('search').oninput=renderList;
$('realmFilter').onchange=()=>{refreshFilters();renderList();};
$('categoryFilter').onchange=renderList;
form.elements.realm.onchange=updateCategories;
form.onsubmit=e=>{e.preventDefault();applyForm();};
$('new').onclick=()=>{
    const realm=$('realmFilter').value||Object.keys(realms)[0];
    const category=$('categoryFilter').value||realms[realm][0];
    rows.push(Object.fromEntries(keys.map(k=>[k,''])));
    rows[rows.length-1].realm=realm;rows[rows.length-1].category=category;
    select(rows.length-1);markDirty();form.elements.name_en.focus();
};
$('delete').onclick=()=>{
    if(selected<0)return;
    if(!confirm(`Supprimer « ${rows[selected].name_en} » du CSV ?`))return;
    rows.splice(selected,1);selected=-1;markDirty();renderList();
    if(rows.length)select(0);
};
$('pick').onclick=()=>{
    if(selected<0)return;
    picking=!picking;
    $('pick').textContent=picking?'Annuler le placement':'Placer par clic';
    notify(picking?'Clique sur la carte pour définir les coordonnées.':'Placement annulé.');
};
$('locate').onclick=()=>{
    const r=rows[selected];if(!r||!validPoint(r))return notify('Coordonnées manquantes.',true);
    map.setView(map.unproject([Number(r.x),Number(r.y)],world.maxZoom),Math.max(map.getZoom(),2));
};
$('save').onclick=async()=>{
    if(selected>=0 && !applyForm())return;
    try{const result=await request('/api/places','POST',{rows});dirty=false;notify(`CSV enregistré (${result.count} lignes). Sauvegarde : ${result.backup}`);}
    catch(e){notify(e.message,true);}
};
$('build').onclick=async()=>{
    if(dirty)return notify('Enregistre d’abord le CSV avant de générer les JSON.',true);
    if(!confirm('Valider le CSV et générer les JSON ?'))return;
    try{const result=await request('/api/build','POST',{});$('log').textContent=result.output;notify('JSON générés. Recharge la carte publique pour voir les changements.');}
    catch(e){$('log').textContent=e.message;notify('Génération interrompue : voir le journal.',true);}
};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
init();
