const LEVELS=[
  {n:1,e:"😴",l:"Très fatigué",c:"#F8CFDD"},
  {n:2,e:"😔",l:"Fatigué",c:"#F3D8EC"},
  {n:3,e:"😐",l:"Moyen",c:"#BFE3F7"},
  {n:4,e:"🙂",l:"Bien",c:"#BEE9EA"},
  {n:5,e:"😄",l:"Plein d'énergie",c:"#BDEBDD"}
];
const KEY="energie-v1";
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const MONTHS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const DOW=["L","M","M","J","V","S","D"];
const DOWL=["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"];

let state={days:{},examples:false,rem:{on:true,time:"20:00"},lastRem:""};
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.days)state=Object.assign(state,s);}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function seed(){ // exemples : un cycle doux de 7 jours, pour voir le calendrier rempli
  const t=new Date();const pat=[2,3,4,4,5,3,2];
  for(let i=1;i<=40;i++){const d=new Date(t);d.setDate(t.getDate()-i);
    const w=(d.getDay()+6)%7;let v=pat[w]+((i*7)%3===0?-1:0);v=Math.max(1,Math.min(5,v));state.days[iso(d)]=v;}
  state.examples=true;
}

function levelButtons(container,onPick,current){
  container.innerHTML="";
  LEVELS.slice().reverse().forEach(L=>{
    const b=document.createElement("button");b.className="lvl";b.style.background=L.c;
    b.setAttribute("aria-pressed",current===L.n?"true":"false");
    b.innerHTML=`<span class="emo">${L.e}</span><span class="num">${L.n}</span><span class="lab">${L.l}</span>`;
    b.onclick=()=>onPick(L.n);container.appendChild(b);
  });
}

function renderNoter(){
  const t=new Date();
  $("todayLabel").textContent="Aujourd'hui, "+DOWL[(t.getDay()+6)%7]+" "+t.getDate()+" "+MONTHS[t.getMonth()];
  const cur=state.days[iso(t)];
  levelButtons($("levels"),n=>{state.days[iso(new Date())]=n;save();renderNoter();
    const L=LEVELS[n-1];$("saved").textContent="C'est noté "+L.e+" Merci !";},cur);
}

let view=new Date();view.setDate(1);
function renderCal(){
  $("monthLabel").textContent=MONTHS[view.getMonth()]+" "+view.getFullYear();
  const g=$("grid");g.innerHTML="";
  DOW.forEach(d=>{const s=document.createElement("div");s.className="dow";s.textContent=d;g.appendChild(s);});
  const first=(view.getDay()+6)%7;
  for(let i=0;i<first;i++)g.appendChild(document.createElement("div"));
  const dim=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
  const todayIso=iso(new Date());
  for(let d=1;d<=dim;d++){
    const date=new Date(view.getFullYear(),view.getMonth(),d);const k=iso(date);const v=state.days[k];
    const b=document.createElement("button");b.className="day"+(v?" has":"")+(k===todayIso?" today":"");
    if(v)b.style.background=LEVELS[v-1].c;
    b.innerHTML=`<span>${d}</span>${v?`<span class="e">${LEVELS[v-1].e}</span>`:""}`;
    b.setAttribute("aria-label",d+" "+MONTHS[view.getMonth()]+(v?", niveau "+v:", pas noté"));
    if(date>new Date()){b.disabled=true;b.style.opacity=.4;}
    b.onclick=()=>openPicker(date);g.appendChild(b);
  }
  $("legend").innerHTML=LEVELS.map(L=>`<span><i class="dot"></i>${L.n} ${L.e}</span>`).join("");
  $("legend").querySelectorAll(".dot").forEach((d,i)=>d.style.background=LEVELS[i].c);
  renderCycles();
  $("exampleNote").hidden=!state.examples;
}
function renderCycles(){
  const sum=[0,0,0,0,0,0,0],cnt=[0,0,0,0,0,0,0];const t=new Date();
  for(let i=0;i<56;i++){const d=new Date(t);d.setDate(t.getDate()-i);const v=state.days[iso(d)];
    if(v){const w=(d.getDay()+6)%7;sum[w]+=v;cnt[w]++;}}
  const avg=sum.map((s,i)=>cnt[i]?s/cnt[i]:0);
  $("bars").innerHTML=avg.map((a,i)=>`<div class="bar"><i></i><small>${DOW[i]}</small></div>`).join("");
  $("bars").querySelectorAll(".bar i").forEach((el,i)=>el.style.height=(avg[i]?Math.max(8,avg[i]/5*90):0)+"%");
  const have=avg.map((a,i)=>[a,i]).filter(x=>x[0]>0);
  if(have.length<3){$("insight").textContent="Note quelques jours pour voir tes cycles.";return;}
  have.sort((a,b)=>a[0]-b[0]);
  $("insight").textContent="Énergie plus basse le "+DOWL[have[0][1]]+", plus haute le "+DOWL[have[have.length-1][1]]+".";
}
let pickDate=null;
function openPicker(date){
  pickDate=date;$("pickTitle").textContent="Le "+date.getDate()+" "+MONTHS[date.getMonth()];
  levelButtons($("pickLevels"),n=>{state.days[iso(pickDate)]=n;save();closePicker();renderCal();},state.days[iso(date)]);
  $("picker").hidden=false;
}
function closePicker(){$("picker").hidden=true;}
$("pickClose").onclick=closePicker;
$("pickClear").onclick=()=>{delete state.days[iso(pickDate)];save();closePicker();renderCal();};
$("picker").onclick=e=>{if(e.target.id==="picker")closePicker();};
$("prev").onclick=()=>{view.setMonth(view.getMonth()-1);renderCal();};
$("next").onclick=()=>{view.setMonth(view.getMonth()+1);renderCal();};
$("clearEx").onclick=()=>{state.days={};state.examples=false;save();renderCal();renderNoter();};

function renderRappel(){$("remOn").checked=state.rem.on;$("remTime").value=state.rem.time;}
$("remOn").onchange=e=>{state.rem.on=e.target.checked;save();};
$("remTime").onchange=e=>{state.rem.time=e.target.value||"20:00";save();};
function checkReminder(){
  const n=new Date();const hm=pad(n.getHours())+":"+pad(n.getMinutes());
  if(state.rem.on&&hm>=state.rem.time&&state.lastRem!==iso(n)&&!state.days[iso(n)]){$("banner").hidden=false;}
  if(state.days[iso(n)])$("banner").hidden=true;
}
$("banner").onclick=()=>{state.lastRem=iso(new Date());save();$("banner").hidden=true;show("noter");};

function show(v){
  ["noter","cal","rappel"].forEach(x=>$("v-"+x).hidden=x!==v);
  document.querySelectorAll(".nav button").forEach(b=>b.setAttribute("aria-current",b.dataset.v===v?"page":"false"));
  if(v==="noter")renderNoter();if(v==="cal")renderCal();if(v==="rappel")renderRappel();
  window.scrollTo(0,0);
}
document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>show(b.dataset.v));

async function exportData(){
  const name="energie-"+iso(new Date())+".json";
  const blob=new Blob([JSON.stringify({app:"energie",v:1,days:state.days,rem:state.rem},null,1)],{type:"application/json"});
  try{const f=new File([blob],name,{type:"application/json"});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});$("backupMsg").textContent="Copie prête ✓";return;}}catch(e){if(e&&e.name==="AbortError")return;}
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();
  $("backupMsg").textContent="Copie enregistrée ✓";
}
$("exportBtn").onclick=exportData;
$("importFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||typeof d.days!=="object")throw 0;
    const clean={};for(const k in d.days){const v=+d.days[k];if(/^\d{4}-\d{2}-\d{2}$/.test(k)&&v>=1&&v<=5)clean[k]=v;}
    state.days=clean;state.examples=false;if(d.rem&&/^\d{2}:\d{2}$/.test(d.rem.time))state.rem={on:!!d.rem.on,time:d.rem.time};
    save();$("backupMsg").textContent="Données restaurées ✓";renderRappel();}
  catch(err){$("backupMsg").textContent="Ce fichier n'est pas une sauvegarde de l'app.";}
  e.target.value="";};r.readAsText(f);};
if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(()=>{});}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}
load();save();show("noter");checkReminder();setInterval(checkReminder,30000);
