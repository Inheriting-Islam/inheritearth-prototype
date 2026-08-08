/* Budget composer — the with/without-school toggle (Dusk dossier) */
'use strict';
(function(){
  const LINES=[
    {k:'rent',  cls:'a-rent',  nm:'Rent — 3BR condo', sub:'Mont Kiara / TTDI / Desa ParkCity band', note:'Pool, gym, guarded — standard in this band', amt:1150, always:true},
    {k:'school',cls:'a-school',nm:'School fees — 2 children', sub:'Mid-tier international, annual ÷ 12', note:'Top tier would add $1,500–2,500/mo', amt:1300, always:false},
    {k:'food',  cls:'a-food',  nm:'Groceries & eating out', sub:'', note:'Halal is the default, not a hunt', amt:620, always:true},
    {k:'move',  cls:'a-move',  nm:'Car + fuel + Grab', sub:'', note:'KL is a driving city; school-run traffic is real', amt:260, always:true},
    {k:'util',  cls:'a-util',  nm:'Utilities, internet, phones', sub:'', note:'500Mbps fibre widely available', amt:150, always:true},
    {k:'ins',   cls:'a-ins',   nm:'Health insurance — family', sub:'', note:'Regional private plan, mid coverage', amt:240, always:true},
    {k:'other', cls:'a-other', nm:'Everything else', sub:'Activities, help, buffer', note:'', amt:300, always:true},
  ];
  const money=n=>'$'+n.toLocaleString('en-US');
  function render(mode){
    const withSchool=mode==='school';
    const active=LINES.filter(l=>l.always||withSchool);
    const total=active.reduce((a,l)=>a+l.amt,0);
    const totalEl=document.getElementById('btotal');
    const alloc=document.getElementById('alloc');
    const rows=document.getElementById('brows');
    const note=document.getElementById('bnote');
    if(!totalEl||!alloc||!rows) return;
    totalEl.textContent=money(total);
    alloc.innerHTML=active.map(l=>`<i class="${l.cls}" style="flex-grow:${l.amt}" title="${l.nm}: ${money(l.amt)}"></i>`).join('');
    rows.innerHTML=LINES.map(l=>{
      const off=!l.always&&!withSchool;
      return `<div class="brow ${off?'off':''}">
        <span class="dot ${l.cls}" style="background:${cssBg(l.cls)}"></span>
        <span class="nm">${l.nm}${l.sub?`<span>${l.sub}</span>`:''}</span>
        <span class="note">${l.note}</span>
        <span class="amt">${money(l.amt)}</span></div>`;
    }).join('');
    if(note) note.innerHTML=withSchool
      ?`School fees for two children are <b>${Math.round(1300/total*100)}%</b> of this budget — the single line that decides affordability. Top-tier schools would add another $1,500–2,500/mo.`
      :`Without school fees, KL costs less than most US suburbs. This is the budget for pre-school-age families and homeschoolers — and why the schooling question comes before the city question.`;
    if(typeof track==='function') track('budget_toggle',{mode});
  }
  function cssBg(cls){
    return {'a-rent':'#5B4A7A','a-school':'linear-gradient(135deg,#E8985A,#C2666A)','a-food':'#8A6FA8','a-move':'#B08BB5','a-util':'#C9A8C2','a-ins':'#A8899E','a-other':'#D8C0C4'}[cls];
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('.bt'); if(!b) return;
    document.querySelectorAll('.btoggle .bt').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-selected',x===b)});
    render(b.dataset.bmode);
  });
  render('school');
})();
