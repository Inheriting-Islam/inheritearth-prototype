/* ============ InheritEarth prototype — data + quiz engine ============ */
'use strict';

/* ---------- city dataset (prototype scores; fee/budget figures from Aug 2026 desk research, marked illustrative) ---------- */
const PILLARS = [
  {k:'residency', n:'Residency path'},
  {k:'schools',   n:'Schools'},
  {k:'cost',      n:'Cost fit'},          // computed per-user
  {k:'faith',     n:'Muslim life'},
  {k:'belonging', n:'Belonging'},
  {k:'healthcare',n:'Healthcare'},
  {k:'safety',    n:'Safety'},
  {k:'climate',   n:'Climate & air'},
];

const CITIES = [
  {
    id:'kl', name:'Kuala Lumpur', country:'Malaysia', img:'kl-skyline',
    base:2450, feeIntl:9600, feeIslamic:4200, hasIntl:true, hasIslamic:true, beach:false,
    scores:{residency:72, schools:93, faith:92, belonging:74, healthcare:88, safety:78, climate:68},
    conf:  {residency:.9,  schools:.92, faith:.95, belonging:.7, healthcare:.9, safety:.85, climate:.95},
    tags:['31 international schools','MM2H + DE Rantau routes','JCI hospitals'],
    love:'English works everywhere, school depth is unmatched in the region, and Muslim life is ambient — azan, halal food, Eid as a national rhythm.',
    weigh:'Traffic and heat are real; international-school fees at the top tier rival Western private schools; PR is discretionary and slow.',
  },
  {
    id:'penang', name:'Penang', country:'Malaysia', img:'penang',
    base:2050, feeIntl:6200, feeIslamic:3600, hasIntl:true, hasIslamic:true, beach:true,
    scores:{residency:72, schools:80, faith:85, belonging:70, healthcare:82, safety:82, climate:83},
    conf:  {residency:.9,  schools:.85, faith:.9,  belonging:.65, healthcare:.85, safety:.85, climate:.95},
    tags:['Island pace + beaches','Tenby ≈ RM decent value','Strong food culture'],
    love:'KL’s school-and-visa toolkit at two-thirds the price, with beaches, walkable George Town, and a calmer family pace.',
    weigh:'Fewer top-tier schools than KL; specialist healthcare sometimes means a trip to the capital.',
  },
  {
    id:'lombok', name:'Lombok', country:'Indonesia', img:'lombok',
    base:1550, feeIntl:4800, feeIslamic:1800, hasIntl:false, hasIslamic:true, beach:true,
    scores:{residency:55, schools:35, faith:90, belonging:62, healthcare:45, safety:75, climate:92},
    conf:  {residency:.7,  schools:.5,  faith:.85, belonging:.4, healthcare:.6, safety:.7,  climate:.9},
    tags:['“Island of 1,000 mosques”','Lowest family budget','Thin school & hospital depth'],
    love:'The most affordable, most naturally beautiful option here — and Muslim life saturates the island.',
    weigh:'No accredited international school verified; serious pediatric care means Bali or Jakarta. Our data here is thinner — treat scores as estimates.',
  },
  {
    id:'dakar', name:'Dakar', country:'Senegal', img:'dakar',
    base:2100, feeIntl:8900, feeIslamic:2400, hasIntl:true, hasIslamic:true, beach:true,
    scores:{residency:68, schools:62, faith:88, belonging:90, healthcare:60, safety:70, climate:80},
    conf:  {residency:.75, schools:.7,  faith:.9,  belonging:.75, healthcare:.7, safety:.7,  climate:.9},
    tags:['Strong Black-diaspora pull','Atlantic corniche','Francophone schooling'],
    love:'Families tell us Dakar delivers something rare: Muslim life and Black belonging in the same city, on the ocean.',
    weigh:'French matters more than any brochure admits; top-end schooling is one school deep; healthcare depth trails Southeast Asia.',
  },
  {
    id:'casablanca', name:'Casablanca', country:'Morocco', img:'casablanca',
    base:1950, feeIntl:7200, feeIslamic:2000, hasIntl:true, hasIslamic:true, beach:true,
    scores:{residency:70, schools:68, faith:90, belonging:68, healthcare:70, safety:72, climate:84},
    conf:  {residency:.8,  schools:.75, faith:.9,  belonging:.55, healthcare:.75, safety:.75, climate:.95},
    tags:['Mediterranean-Atlantic climate','Carte de séjour route','3h to Europe'],
    love:'The closest Muslim-majority option to the US and Europe, with a mild coast and a functioning residency routine.',
    weigh:'Schooling splits French/Arabic tracks — pick deliberately; bureaucracy runs on patience and paper.',
  },
];

/* ---------- quiz definition ---------- */
const CHAPTERS = [
  {n:'Your family', range:[0,2]},
  {n:'Money & schooling', range:[3,6]},
  {n:'Faith & belonging', range:[7,9]},
  {n:'Priorities', range:[10,15]},
];

const QUESTIONS = [
  { id:'family', ch:0, t:'Who’s making this move?',
    help:'Family shape drives everything downstream — school stages, visa dependents, housing size.',
    opts:[
      {v:'couple_young', b:'Two of us + young kids', s:'Children under 7'},
      {v:'couple_school', b:'Two of us + school-age kids', s:'At least one child 7–17'},
      {v:'single_parent', b:'One parent + kids', s:'Single-parent household'},
      {v:'couple', b:'Just the two of us', s:'No children yet — planning ahead'},
    ]},
  { id:'passport', ch:0, t:'What passports does your family hold?',
    help:'Why we ask: your passport decides visa-free access and which residency routes even exist.',
    opts:[
      {v:'us', b:'United States', s:''},
      {v:'uk_eu', b:'UK / EU', s:''},
      {v:'ca_au', b:'Canada / Australia / NZ', s:''},
      {v:'other', b:'Other / multiple', s:'Including a second passport or ancestry claim'},
    ]},
  { id:'work', ch:0, t:'How will you earn once you’re abroad?',
    help:'Why we ask: income type is the #1 visa filter — remote income opens doors local job-seeking doesn’t.',
    opts:[
      {v:'remote_emp', b:'Remote employee', s:'Salaried, working for a company back home'},
      {v:'freelance', b:'Freelancer / business owner', s:'Location-independent income'},
      {v:'passive', b:'Savings / investments / retired', s:'FIRE, pension, or passive income'},
      {v:'local', b:'I’ll need to find local work', s:'Job-seeking after arrival'},
    ]},
  { id:'income', ch:1, t:'Monthly household income, roughly?',
    help:'Ranges only — we use this to compute a real affordability score against each city’s family budget, school fees included.',
    opts:[
      {v:2500, b:'Under $3,000 / month', s:''},
      {v:4500, b:'$3,000 – $6,000 / month', s:''},
      {v:7500, b:'$6,000 – $9,000 / month', s:''},
      {v:11000, b:'$9,000+ / month', s:''},
    ]},
  { id:'school', ch:1, t:'What’s the schooling plan?',
    help:'Why we ask: school fees are the single most under-budgeted cost in family relocation — we’ve read the threads.',
    opts:[
      {v:'intl', b:'International school', s:'Accredited, English-medium — non-negotiable'},
      {v:'islamic', b:'Islamic school', s:'Islamic studies + strong academics'},
      {v:'either', b:'International or Islamic', s:'Best available fit'},
      {v:'home', b:'Homeschool / worldschool', s:'We’ll need it to be legal and connected'},
      {v:'none', b:'Not school-age yet', s:'Preschool at most'},
    ]},
  { id:'spouse', ch:1, t:'Does your spouse need the right to work locally?',
    help:'Asked constantly in the forums, almost never answered: dependent work rights vary wildly by visa.',
    opts:[
      {v:'yes', b:'Yes — a real career matters', s:''},
      {v:'nice', b:'Would be nice, not critical', s:''},
      {v:'no', b:'No — one income is the plan', s:''},
    ]},
  { id:'dealbreakers', ch:1, t:'Any hard deal-breakers?', multi:true,
    help:'These filter cities out entirely — we’ll tell you exactly which ones and why.',
    opts:[
      {v:'intl_school', b:'Must have an accredited international school', s:''},
      {v:'path_pr', b:'Must offer a realistic permanent-residency path', s:''},
      {v:'budget', b:'Must fit our budget with school fees included', s:''},
      {v:'muslim_comm', b:'Must have established Muslim community life', s:''},
      {v:'none', b:'No hard deal-breakers', s:'Rank everything, we’ll judge'},
    ]},
  { id:'permanence', ch:2, t:'How long is this move, honestly?',
    help:'The deepest question in every hijrah thread: “can we actually stay — and what happens when we’re 65?”',
    opts:[
      {v:'try', b:'A year or two to try it', s:'Keep it reversible'},
      {v:'mid', b:'3–7 years', s:'Through the kids’ school years'},
      {v:'perm', b:'Permanent — this is home now', s:'PR and maybe citizenship matter'},
      {v:'retire', b:'Permanent, including old age', s:'We need somewhere we can grow old'},
    ]},
  { id:'faith', ch:2, t:'How central is Muslim community life to your day-to-day?', sensitive:true,
    help:'We ask so we can weigh masjid density, halal access, Islamic schooling, and Eid-as-a-holiday in your match.',
    consent:'Optional and private — used only to personalize these results, never shown or sold. Skipping never counts against a city.',
    opts:[
      {v:'essential', b:'Essential', s:'Masjid in walking distance, halal everywhere, azan in the air'},
      {v:'important', b:'Important', s:'An active community we can plug into'},
      {v:'some', b:'Nice to have', s:''},
      {v:'no', b:'Not a factor for us', s:''},
    ]},
  { id:'belonging', ch:2, t:'Some families want somewhere they’ll feel fully seen. Is that part of your search?', sensitive:true,
    help:'Your answer tunes our belonging score — built from resident interviews and diaspora community reports, not vibes.',
    consent:'Optional and private. “Prefer not to say” removes this signal entirely.',
    opts:[
      {v:'core', b:'Yes — it’s central', s:'Thriving Black expat / diaspora community matters to us'},
      {v:'some', b:'Somewhat', s:''},
      {v:'no', b:'Not a priority', s:''},
    ]},
  { id:'health', ch:3, t:'What does your family need from healthcare?',
    help:'We track pediatric depth, NICU/maternity capability, and English-capable hospitals — not just “number of clinics.”',
    opts:[
      {v:'high', b:'Serious capability', s:'Chronic condition, specialist, or maternity plans'},
      {v:'kids', b:'Solid pediatric care', s:'Kids get sick; we want good answers nearby'},
      {v:'std', b:'Standard is fine', s:'Healthy family, want a safety net'},
    ]},
  { id:'safety', ch:3, t:'On safety, which is closest to your instinct?',
    help:'Safety fear — especially for children — is the most common reason families tell us they’re leaving.',
    opts:[
      {v:'max', b:'It’s the whole point', s:'Rank safety above almost everything'},
      {v:'high', b:'Very important', s:'Normal city sense is fine; no daily vigilance'},
      {v:'ok', b:'We’re adaptable', s:''},
    ]},
  { id:'climate', ch:3, t:'Pick your weather honestly.',
    help:'“More like Florida in 30 years” killed one family’s KL plan — heat tolerance is worth being honest about.',
    opts:[
      {v:'beach', b:'Beach & ocean nearby', s:'Coast is part of the dream'},
      {v:'warm', b:'Warm is great, humidity fine', s:''},
      {v:'mild', b:'Mild — we wilt in tropical heat', s:''},
      {v:'any', b:'Weather won’t decide this', s:''},
    ]},
  { id:'community', ch:3, t:'How much does a ready-made community matter?',
    help:'The #1 post-move pain in our research isn’t money or visas — it’s “I miss my people.”',
    opts:[
      {v:'high', b:'A lot', s:'Existing expat/diaspora families we can land among'},
      {v:'some', b:'Some', s:'We’ll build slowly'},
      {v:'low', b:'We’re pioneers', s:''},
    ]},
  { id:'language', ch:3, t:'Language: what can daily life run on?',
    help:'Dakar runs on French and Wolof; KL runs fine in English. This changes school choices too.',
    opts:[
      {v:'en', b:'English, mostly', s:'We’ll learn greetings, not grammar'},
      {v:'learn', b:'We’ll genuinely learn', s:'French, Arabic, Bahasa — part of the adventure'},
      {v:'have', b:'We already have a second language', s:''},
    ]},
  { id:'weights', ch:3, t:'Last step: spend 100 points on what matters most.', type:'weights',
    help:'This is the whole product: your priorities, not ours. We’ve pre-filled a starting point from your answers — adjust freely.'},
];

/* theme: saved choice > ?theme= param > system preference */
{const p=new URLSearchParams(location.search).get('theme');
 const saved=localStorage.getItem('ie-theme');
 const th=(p==='light'||p==='dark')?p:(saved==='light'||saved==='dark')?saved:null;
 if(th)document.documentElement.dataset.theme=th;
 document.addEventListener('click',e=>{
   if(!e.target.closest('#theme-toggle'))return;
   const cur=document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
   const nxt=cur==='dark'?'light':'dark';
   document.documentElement.dataset.theme=nxt;localStorage.setItem('ie-theme',nxt);
 });}

/* ---------- state ---------- */
const S = { qi:0, answers:{}, weights:null, results:null, unlocked:false };

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
function esc(x){const d=document.createElement('i');d.textContent=x;return d.innerHTML}
function band(v){return v>=85?'Excellent':v>=70?'Strong':v>=55?'Moderate':v>=40?'Weak':'Thin'}
function confBand(c){return c>=.8?['hi','High confidence']:c>=.6?['med','Medium confidence']:['lo','Estimated — thin data']}
function money(n){return '$'+Math.round(n).toLocaleString('en-US')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),3400)}

/* ---------- router ---------- */
function show(view){
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#view-'+view).classList.add('active');
  $$('.nav button[data-nav]').forEach(b=>b.classList.toggle('on',b.dataset.nav===view));
  window.scrollTo({top:0,behavior:'instant'});
  if(view==='quiz') renderQ();
}
document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-nav]');
  if(nav){ if(nav.dataset.nav==='quiz' && S.results && !confirm('Restart the quiz? Your current results will be replaced.')) return;
    if(nav.dataset.nav==='quiz'){S.qi=0;S.answers={};S.weights=null;S.results=null;}
    show(nav.dataset.nav); }
  const go=e.target.closest('[data-go]');
  if(go){show(go.dataset.go)}
});

/* ---------- quiz rendering ---------- */
function renderQ(){
  const q=QUESTIONS[S.qi], ch=CHAPTERS[q.ch];
  $('#qbar').style.width=((S.qi)/QUESTIONS.length*100)+'%';
  $('#qmeta-left').innerHTML=`<span class="stage">Part ${q.ch+1} of 4 · ${esc(ch.n)}</span>`;
  $('#qmeta-right').textContent=`Question ${S.qi+1} of ${QUESTIONS.length}`;
  const el=$('#qcontent');
  const fin=$('#q-finish'); if(fin&&q.type!=='weights') fin.remove();
  if(q.type==='weights'){renderWeights(el,q);return}
  const cur=S.answers[q.id];
  el.innerHTML=`
    <h2>${esc(q.t)}</h2>
    <p class="qhelp">${esc(q.help)}${q.consent?`<span class="consent">${esc(q.consent)}</span>`:''}</p>
    <div class="opts ${q.opts.length>4?'cols':''}" role="listbox">
      ${q.opts.map((o,i)=>`<button class="opt ${sel(q,o)?'sel':''}" data-opt="${i}">
        <span class="k">${q.multi?(sel(q,o)?'✓':'  '):String.fromCharCode(65+i)}</span>
        <span><b>${esc(o.b)}</b>${o.s?`<span class="sub">${esc(o.s)}</span>`:''}</span>
      </button>`).join('')}
    </div>`;
  el.querySelectorAll('[data-opt]').forEach(btn=>btn.addEventListener('click',()=>{
    const o=q.opts[+btn.dataset.opt];
    if(q.multi){
      let arr=Array.isArray(S.answers[q.id])?S.answers[q.id]:[];
      if(o.v==='none'){arr=arr.includes('none')?[]:['none']}
      else{arr=arr.filter(x=>x!=='none');arr=arr.includes(o.v)?arr.filter(x=>x!==o.v):[...arr,o.v]}
      S.answers[q.id]=arr;renderQ();
    }else{
      S.answers[q.id]=o.v;renderQ();
      setTimeout(next,240);
    }
  }));
  $('#q-skip').style.display=q.sensitive?'inline':'none';
  $('#q-next').style.display=q.multi?'inline-flex':'none';
  $('#q-back').style.visibility=S.qi===0?'hidden':'visible';
}
function sel(q,o){const a=S.answers[q.id];return q.multi?(Array.isArray(a)&&a.includes(o.v)):a===o.v}
function next(){
  const q=QUESTIONS[S.qi];
  if(!q.type && S.answers[q.id]===undefined && !q.sensitive) return;
  if(S.qi<QUESTIONS.length-1){S.qi++;renderQ()}
}
function back(){if(S.qi>0){S.qi--;renderQ()}}
$('#q-next').addEventListener('click',next);
$('#q-back').addEventListener('click',back);
$('#q-skip').addEventListener('click',()=>{const q=QUESTIONS[S.qi];S.answers[q.id]='skip';next()});

/* ---------- weights screen ---------- */
function defaultWeights(){
  const a=S.answers, w={residency:12, schools:15, cost:15, faith:10, belonging:8, healthcare:12, safety:14, climate:14};
  if(a.faith==='essential'){w.faith=25;w.climate=8;w.belonging=6}
  else if(a.faith==='important'){w.faith=18;w.climate=10}
  else if(a.faith==='no'||a.faith==='skip'){w.faith=0;w.cost+=4;w.safety+=3;w.climate+=3}
  if(a.belonging==='core'){w.belonging=22;w.climate=Math.max(4,w.climate-6)}
  else if(a.belonging==='no'||a.belonging==='skip'){w.belonging=0;w.schools+=3;w.cost+=3}
  if(a.permanence==='perm'||a.permanence==='retire'){w.residency=20}
  if(a.school==='intl'||a.school==='islamic'||a.school==='either'){w.schools=Math.max(w.schools,20)}
  if(a.school==='none'){w.schools=5}
  if(a.health==='high'){w.healthcare=20}
  if(a.safety==='max'){w.safety=20}
  if(a.income<=2500){w.cost=Math.max(w.cost,20)}
  // normalize to 100
  const t=Object.values(w).reduce((x,y)=>x+y,0);
  let acc=0;const keys=Object.keys(w);
  keys.forEach((k,i)=>{if(i<keys.length-1){w[k]=Math.round(w[k]/t*100);acc+=w[k]}else{w[k]=100-acc}});
  return w;
}
function renderWeights(el,q){
  if(!S.weights) S.weights=defaultWeights();
  const w=S.weights;
  const tot=Object.values(w).reduce((a,b)=>a+b,0);
  el.innerHTML=`
    <h2>${esc(q.t)}</h2>
    <p class="qhelp">${esc(q.help)}</p>
    <div class="wgrid">
      ${PILLARS.map(p=>`<div class="wrow">
        <div class="nm">${esc(p.n)}<span>${wDesc(p.k)}</span></div>
        <div class="wctl">
          <button data-w="${p.k}" data-d="-5" aria-label="less">−</button>
          <span class="pts">${w[p.k]}</span>
          <button data-w="${p.k}" data-d="5" aria-label="more">+</button>
        </div>
      </div>`).join('')}
    </div>
    <div class="wtotal ${tot===100?'good':'bad'}"><span>TOTAL ALLOCATED</span><span>${tot} / 100</span></div>`;
  el.querySelectorAll('[data-w]').forEach(b=>b.addEventListener('click',()=>{
    const k=b.dataset.w,d=+b.dataset.d;
    S.weights[k]=Math.max(0,Math.min(40,S.weights[k]+d));
    renderWeights(el,q);
  }));
  $('#q-skip').style.display='none';
  $('#q-next').style.display='none';
  $('#q-back').style.visibility='visible';
  let fin=$('#q-finish');
  if(!fin){fin=document.createElement('button');fin.id='q-finish';fin.className='btn btn-brass btn-lg';$('#qnav-right').appendChild(fin)}
  fin.textContent=tot===100?'See our matches →':'Balance to 100 to continue';
  fin.disabled=tot!==100;fin.style.opacity=tot===100?1:.55;
  fin.onclick=()=>{if(tot===100){compute();show('results')}};
}
function wDesc(k){return{
  residency:'Visa route, PR odds, growing old there',
  schools:'Fees, curricula, Islamic options, depth',
  cost:'Your income vs the real family budget',
  faith:'Masjids, halal life, Islamic learning',
  belonging:'Community where your family is seen',
  healthcare:'Pediatric depth, hospitals, English care',
  safety:'Day-to-day family safety',
  climate:'Heat, air quality, outdoors life',
}[k]}

/* ---------- scoring engine ---------- */
function compute(){
  const a=S.answers, w=S.weights||defaultWeights();
  const income=a.income||4500;
  const excluded=[], ranked=[];
  for(const c of CITIES){
    // school need + fee
    let fee=0, schoolNote='';
    const needIntl=a.school==='intl';
    const needIslamicOnly=a.school==='islamic';
    const kids=(a.family==='couple')?0:(a.family==='single_parent')?1:2;
    if(kids>0){
      if(needIntl) fee=c.feeIntl;
      else if(needIslamicOnly) fee=c.feeIslamic;
      else if(a.school==='either') fee=Math.min(c.feeIntl,c.feeIslamic);
    }
    const monthlyNeed=c.base+(fee*kids/12);
    // hard constraints
    const db=Array.isArray(a.dealbreakers)?a.dealbreakers:[];
    if(db.includes('intl_school')&&!c.hasIntl){excluded.push({c,why:'No accredited international school verified',detail:`We checked the schools on ${c.name} — none currently meets our accreditation bar. If that changes, this ranking changes.`});continue}
    if((needIntl)&&!c.hasIntl){excluded.push({c,why:'International school required — none verified',detail:`Your schooling plan requires an accredited international school; we couldn’t verify one in ${c.name}.`});continue}
    if(db.includes('budget')&&monthlyNeed>income){excluded.push({c,why:`Budget: needs ~${money(monthlyNeed)}/mo vs your ~${money(income)}/mo`,detail:`With ${kids} children in ${needIntl?'international':'the selected'} school, the realistic all-in budget exceeds your stated income. This is the math most families discover too late.`});continue}
    // per-user cost pillar
    let cost=Math.max(0,Math.min(100,100*(1-monthlyNeed/income)*1.6));
    if(monthlyNeed>income) cost=0;
    // pillar assembly
    const ps={...c.scores, cost:Math.round(cost)};
    // climate preference adjustment
    if(a.climate==='beach') ps.climate=Math.min(100,c.scores.climate+(c.beach?8:-10));
    if(a.climate==='mild') ps.climate=c.id==='casablanca'?92:Math.max(20,c.scores.climate-18);
    // weighted total + confidence
    let total=0, confAcc=0, contribs=[];
    for(const p of PILLARS){
      const wt=w[p.k]/100;
      const sc=ps[p.k];
      const cf=p.k==='cost'?0.9:(c.conf[p.k]||.5);
      total+=wt*sc; confAcc+=wt*cf;
      contribs.push({k:p.k,n:p.n,w:w[p.k],score:sc,conf:cf,contrib:wt*sc});
    }
    contribs.sort((x,y)=>y.contrib-x.contrib);
    ranked.push({c,total:Math.min(96,Math.round(total)),conf:confAcc,contribs,monthlyNeed,fee,kids,ps});
  }
  ranked.sort((x,y)=>y.total-x.total||y.conf-x.conf);
  S.results={ranked,excluded,income,weights:w};
}

/* ---------- results rendering ---------- */
function pickLabels(ranked){
  const labels={};
  if(ranked[0]) labels[ranked[0].c.id]='Best overall match';
  if(ranked.length>1){
    const val=[...ranked].sort((a,b)=>(b.ps.cost)-(a.ps.cost))[0];
    if(val.c.id!==ranked[0].c.id) labels[val.c.id]='Best value';
    const wild=[...ranked].filter(r=>!labels[r.c.id]).sort((a,b)=>{
      const ma=Math.max(...PILLARS.map(p=>a.ps[p.k])), mb=Math.max(...PILLARS.map(p=>b.ps[p.k]));
      return mb-ma})[0];
    if(wild) labels[wild.c.id]='Wild card';
  }
  return labels;
}
function whyText(r,prev){
  const top=r.contribs.slice(0,2).map(x=>`<b>${x.n.toLowerCase()} (${x.score})</b>`);
  let s=`Strongest for your family on ${top.join(' and ')}`;
  if(prev){
    const gaps=[];
    for(const p of PILLARS){
      const d=(prev.ps[p.k]*S.results.weights[p.k])-(r.ps[p.k]*S.results.weights[p.k]);
      if(d>0) gaps.push({n:p.n.toLowerCase(),d,a:r.ps[p.k],b:prev.ps[p.k]});
    }
    gaps.sort((x,y)=>y.d-x.d);
    if(gaps[0]) s+=`; ranks below ${prev.c.name} mainly on <b>${gaps[0].n} (${gaps[0].a} vs ${gaps[0].b})</b>`;
  }
  return s+'.';
}
function renderResults(){
  const R=S.results;
  if(!R){$('#res-wrap').innerHTML='<div class="wrap res-head"><p>Take the quiz first — results are computed from your answers.</p><p style="margin-top:16px"><button class="btn btn-brass" data-nav="quiz">Start the quiz</button></p></div>';return}
  const labels=pickLabels(R.ranked);
  const a=S.answers;
  const profileBits=[
    a.family&&{couple_young:'Young kids',couple_school:'School-age kids',single_parent:'Single parent + kids',couple:'Couple, no kids yet'}[a.family],
    a.income&&('~'+money(a.income)+'/mo'),
    a.school&&{intl:'International school',islamic:'Islamic school',either:'Intl or Islamic school',home:'Homeschooling',none:'Pre-school-age'}[a.school],
    a.faith==='essential'?'Muslim life: essential':a.faith==='important'?'Muslim life: important':null,
    a.belonging==='core'?'Belonging: central':null,
    (a.permanence==='perm'||a.permanence==='retire')?'Permanent move':null,
  ].filter(Boolean);
  const teaser=R.ranked[0];
  let html=`<div class="wrap res-head">
    <div class="eyebrow">Your results · prototype</div>
    <h1>Where your family fits, ranked honestly.</h1>
    <p>Scored across ${PILLARS.length} pillars using your 100-point weighting. Every number decomposes — click “why this score” on any card. Nothing here is a recommendation to move; it’s a shortlist to research.</p>
    <div class="profile">${profileBits.map(b=>`<span class="chip">${esc(b)}</span>`).join('')}</div>
  </div>`;

  // teaser card (always visible)
  html+=`<div class="wrap rcards">${cardHTML(teaser,1,labels,null,true)}`;

  if(!S.unlocked){
    html+=`<div class="gate"><div class="blurred">${R.ranked.slice(1).map((r,i)=>cardHTML(r,i+2,labels,R.ranked[i],false)).join('')||'<p style="padding:40px">More matches…</p>'}</div>
      <div class="gate-overlay"><div class="gate-card">
        <h3>Your full report is ready.</h3>
        <p>All ${R.ranked.length} ranked matches, full score breakdowns, exclusion reasons, and your ${teaser.c.name} dossier. Where should we send it?</p>
        <form class="gate-form" id="gate-form"><input type="email" required placeholder="you@family.com" aria-label="Email"><button class="btn btn-brass" type="submit">Email me my full report</button></form>
        <p class="gate-fine">Free. One email with your results, then our monthly city-intelligence letter — unsubscribe anytime. We never sell your data.</p>
      </div></div></div>`;
  }else{
    html+=R.ranked.slice(1).map((r,i)=>cardHTML(r,i+2,labels,R.ranked[i],true)).join('');
  }

  // excluded
  if(R.excluded.length){
    html+=R.excluded.map(e=>`<div class="excl">
      <h3>${esc(e.c.name)}, ${esc(e.c.country)} — excluded for your family</h3>
      <p class="why">${esc(e.why)}</p>
      <p>${esc(e.detail)}</p>
    </div>`).join('');
  }
  html+=`<div class="proto-note">PROTOTYPE — scores are illustrative research data (Aug 2026), 5 launch cities only. The live product adds sources on every number.</div>
  <div class="doss-cta"><button class="btn btn-brass btn-lg" data-nav="dossier">Read the ${esc(teaser.c.name)} dossier →</button>
  <button class="btn btn-ghost" data-nav="quiz">Retake the quiz</button></div></div>`;
  $('#res-wrap').innerHTML=html;
  const gf=$('#gate-form');
  if(gf) gf.addEventListener('submit',ev=>{ev.preventDefault();S.unlocked=true;renderResults();toast('Report unlocked — in the live product this also lands in your inbox.')});
  // animate meters
  requestAnimationFrame(()=>{$$('.meter i[data-w]').forEach(m=>{m.style.width=m.dataset.w+'%'})});
  // decomposition toggles
  $$('[data-decomp]').forEach(b=>b.addEventListener('click',()=>{
    const t=document.getElementById('dec-'+b.dataset.decomp);
    t.style.display=t.style.display==='none'?'block':'none';
    b.textContent=t.style.display==='none'?'Why this score?':'Hide breakdown';
  }));
}
function cardHTML(r,rank,labels,prev,interactive){
  const [cb,cl]=confBand(r.conf);
  const label=labels[r.c.id];
  return `<article class="rcard"><div class="rcard-in">
    <div class="ph" style="background-image:url('assets/${r.c.img}-sm.jpg')"></div>
    <div class="bd">
      <div class="rtop">
        <span class="rank">${rank<10?'0'+rank:rank}</span>
        <div><h3>${esc(r.c.name)}</h3><span class="country">${esc(r.c.country)}${label?` · <b style="color:var(--brass-strong)">${label}</b>`:''}</span></div>
        <div class="rmatch"><div class="pct">${r.total}</div><span class="conf ${cb}">${band(r.total)} fit · ${cl}</span></div>
      </div>
      <p class="rwhy">${whyText(r,prev)} Real budget for your family: <b>~${money(r.monthlyNeed)}/mo</b>${r.fee?` including ${money(r.fee*r.kids/12)}/mo school fees for ${r.kids}`:''}.</p>
      <div class="pillars">
        ${r.contribs.map(x=>{const[icb]=confBand(x.conf);return `<div class="prow ${x.conf<.55?'imputed':''}">
          <span class="lbl">${esc(x.n)}${x.conf<.55?' · est':''}</span>
          <span class="meter"><i data-w="${x.score}" style="width:0"></i></span>
          <span class="val">${x.score}</span></div>`}).join('')}
      </div>
      <div class="rfoot">
        <div style="display:flex;gap:8px;flex-wrap:wrap">${r.c.tags.map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div>
        ${interactive?`<button class="rlink" data-decomp="${r.c.id}">Why this score?</button>`:''}
      </div>
      ${interactive?`<div id="dec-${r.c.id}" style="display:none;margin-top:14px;font-size:.85rem;color:var(--ink-2)">
        <p style="font-family:var(--mono);font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;color:var(--brass-strong)">Weighted contribution · your points × city score</p>
        ${r.contribs.map(x=>`<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dotted var(--line)"><span>${esc(x.n)} — you gave it ${x.w} pts</span><span style="font-variant-numeric:tabular-nums">${x.score} × ${x.w}% = ${(x.contrib).toFixed(1)}</span></div>`).join('')}
        <p style="margin-top:10px">Displayed match caps at 96 — no city is perfect, and we’d rather tell you what to weigh: ${esc(r.c.weigh)}</p>
      </div>`:''}
    </div></div></article>`;
}

/* results view lifecycle */
const _origShow=show;
show=function(v){_origShow(v); if(v==='results') renderResults();};

/* hero meters animate on load */
window.addEventListener('load',()=>{requestAnimationFrame(()=>{$$('.meter i[data-w]').forEach(m=>{m.style.width=m.dataset.w+'%'})})});

/* deep links: #quiz #results #dossier ; ?demo=1 = sample family results */
{const p=new URLSearchParams(location.search);
 if(p.get('demo')){
   S.answers={family:'couple_school',passport:'us',work:'remote_emp',income:7500,school:'intl',spouse:'nice',
     dealbreakers:['intl_school'],permanence:'perm',faith:'essential',belonging:'some',health:'kids',
     safety:'high',climate:'beach',community:'high',language:'en'};
   S.weights=defaultWeights();compute();show('results');
 }else{
   const h=location.hash.replace('#','');if(['quiz','results','dossier'].includes(h))show(h);
 }}
