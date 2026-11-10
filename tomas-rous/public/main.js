
(function(){
  var h=document.getElementById('hlavicka'), b=h.querySelector('.menu-btn');
  function closeMenu(){h.classList.remove('open');document.body.classList.remove('menu-open');b.setAttribute('aria-expanded','false');if(typeof upd==='function'){upd();}}
  b.addEventListener('click',function(){var o=h.classList.toggle('open');document.body.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o?'true':'false');});
  document.querySelectorAll('.nav-panel a').forEach(function(a){a.addEventListener('click',closeMenu);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&h.classList.contains('open')){closeMenu();b.focus();}});
  var mqNav=window.matchMedia('(min-width:1121px)');(mqNav.addEventListener?mqNav.addEventListener('change',function(e){if(e.matches){closeMenu();}}):mqNav.addListener(function(e){if(e.matches){closeMenu();}}));
  var onS=function(){h.classList.toggle('scrolled',window.scrollY>8);};onS();window.addEventListener('scroll',onS,{passive:true});
  /* přímý odkaz s kotvou: prohlížeč skočí dřív, než se načtou písma a obrázky – po načtení pozici doladit (dokud uživatel sám neroluje) */
  if(location.hash&&/^#[\w-]+$/.test(location.hash)&&document.querySelector(location.hash)){var userMoved=false;['wheel','touchstart','keydown'].forEach(function(ev){window.addEventListener(ev,function(){userMoved=true;},{passive:true,once:true});});
    var adjust=function(){if(userMoved){return;}var el=document.querySelector(location.hash);if(!el){return;}var smt=parseFloat(getComputedStyle(el).scrollMarginTop)||0;var d=el.getBoundingClientRect().top-smt;if(Math.abs(d)>2){window.scrollBy({top:d,left:0,behavior:'instant'});}};
    window.addEventListener('load',function(){[60,400,1200].forEach(function(t){setTimeout(adjust,t);});});}
  var links=[].slice.call(h.querySelectorAll('.nav-links a[href^="#"]')), secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));}).filter(Boolean);if(document.getElementById('uvod')){secs.push(document.getElementById('uvod'));}
  if('IntersectionObserver' in window&&secs.length){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){links.forEach(function(a){a.setAttribute('aria-current',a.getAttribute('href')==='#'+en.target.id?'true':'false');});}});},{rootMargin:'-40% 0px -55% 0px'});secs.forEach(function(x){io.observe(x);});}
  document.querySelectorAll('a[data-tema]').forEach(function(a){a.addEventListener('click',function(){var sel=document.getElementById('tema');if(sel){sel.value=a.getAttribute('data-tema');}});});
  /* lepivá lišta na mobilu */
  var sc=document.querySelector('.sticky-cta'), hero=document.getElementById('uvod');
  /* lišta Zavolat/Napsat: na telefonu (kde v hlavičce není tlačítko „Domluvit konzultaci“) je vidět hned po načtení – první obrazovka
     by jinak neměla žádný kontakt; na tabletu jako dosud až po odrolování úvodu. Skrytá u kontaktu a při otevřeném menu. */
  if(sc&&hero){var kontakt=document.getElementById('kontakt'),headCta=document.querySelector('.nav-right .btn-sm');var upd=function(){var y=window.scrollY,inK=kontakt&&y+window.innerHeight>kontakt.offsetTop+200,past=!(headCta&&headCta.offsetParent!==null)||y>hero.offsetHeight-80;sc.classList.toggle('show',past&&!inK&&!h.classList.contains('open'));};upd();window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd,{passive:true});b.addEventListener('click',upd);}
  /* kalkulačky */
  (function(){
    var RET=[[15, 7.0, "dyn"], [8, 5.0, "bal"], [0, 3.0, "con"]], RATES={"hypoteka": 5.0, "platnost": "2026-10-20", "zdroj": "výchozí hodnota (Tomáš); ostrý web stahuje průměrnou sazbu nových hypoték z ČNB"}, TX={"result_a": "Mohli byste mít přibližně", "result_a_sub": "z toho vložíte {vklad}, zhodnocení by udělalo {vynos}", "result_b": "Měsíčně odkládat přibližně", "result_b_sub": "potřebný kapitál {kapital} – počítáme s čerpáním 4 % ročně, aby renta vydržela", "strategy": {"dyn": "Modelový výnos {r} % ročně – na {n} počítáme s dynamickou strategií (akcie).", "bal": "Modelový výnos {r} % ročně – na {n} počítáme s vyváženou strategií.", "con": "Modelový výnos {r} % ročně – na {n} počítáme s konzervativní strategií."}, "age_err": "Věk, od kterého chcete rentu, musí být vyšší než Váš současný věk."};
    var fmt=function(n){return Math.round(n).toLocaleString('cs-CZ').replace(/[\s\u202f]/g,'\u00a0')+'\u00a0Kč';};
    function setup(cf,onChange){var inp=cf.querySelector('input[type=text]'),rng=cf.querySelector('input[type=range]'),dec=cf.dataset.fmt==='dec';
      var mn=+inp.dataset.min,mx=+inp.dataset.max,cur=+rng.value;
      function paint(){rng.style.setProperty('--p',((cur-mn)/(mx-mn)*100)+'%');}
      function show(v){inp.value=dec?String(Math.round(v*100)/100).replace('.',','):Math.round(v).toLocaleString('cs-CZ').replace(/\u00a0/g,' ');}
      function val(){return cur;}
      rng.addEventListener('input',function(){cur=+rng.value;show(cur);paint();onChange();});
      inp.addEventListener('input',function(){var v=parseFloat(String(inp.value).replace(/\s/g,'').replace(',','.'));if(!isNaN(v)){cur=Math.min(mx,Math.max(mn,v));rng.value=cur;paint();onChange();}});
      inp.addEventListener('blur',function(){show(cur);});
      inp.addEventListener('keydown',function(e){if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();var st=+rng.step||1;cur=Math.round(Math.min(mx,Math.max(mn,cur+(e.key==='ArrowUp'?st:-st)))*100)/100;rng.value=cur;show(cur);paint();onChange();}});
      inp.addEventListener('focus',function(){inp.select();});
      show(cur);paint();return val;}
    var hypo=document.getElementById('calc-hypo');
    if(hypo){var hv={},hmode='a';['h-castka','h-roky','h-sazba','h2-splatka','h2-roky','h2-sazba'].forEach(function(id){hv[id]=setup(document.getElementById(id).closest('.cf'),calcH);});
      var HT={"result": "Měsíční splátka", "interest": "Celkem na úrocích za dobu splácení", "result_b": "Můžete si půjčit přibližně", "result_b_sub": "celkem zaplatíte {celkem}, z toho úroky {uroky}"};
      function calcH(){var lab=document.getElementById('h-label'),out=document.getElementById('h-vysledek'),sub=document.getElementById('h-sub');
        if(hmode==='a'){var L=hv['h-castka'](),n=hv['h-roky']()*12,r=hv['h-sazba']()/100/12;var P=r>0?L*r/(1-Math.pow(1+r,-n)):L/n;
          lab.textContent=HT.result;out.textContent=fmt(P);sub.innerHTML='<span>'+HT.interest+'</span> <b id="h-uroky">'+fmt(P*n-L)+'</b>';}
        else{var P2=hv['h2-splatka'](),n2=hv['h2-roky']()*12,r2=hv['h2-sazba']()/100/12;var L2=r2>0?P2*(1-Math.pow(1+r2,-n2))/r2:P2*n2;L2=Math.round(L2/10000)*10000;
          lab.textContent=HT.result_b;out.textContent=fmt(L2);sub.innerHTML=HT.result_b_sub.replace('{celkem}','<b>'+fmt(P2*n2)+'</b>').replace('{uroky}','<b>'+fmt(P2*n2-L2)+'</b>');}}
      hypo.querySelectorAll('.seg button').forEach(function(bt){bt.addEventListener('click',function(){hmode=bt.dataset.mode;hypo.querySelectorAll('.seg button').forEach(function(x){x.setAttribute('aria-selected',x===bt?'true':'false');});hypo.querySelector('.mode-a').hidden=hmode!=='a';hypo.querySelector('.mode-b').hidden=hmode!=='b';calcH();});});
      calcH();
      if(window.fetch&&document.documentElement.dataset.deploy==='1'){fetch('sazba.php',{cache:'no-cache'}).then(function(r){if(!r.ok){throw 0;}return r.json();}).catch(function(){return fetch('data/sazby.json',{cache:'no-cache'}).then(function(r){return r.json();});}).then(function(j){if(j&&j.hypoteka){var v=Math.min(7,Math.max(2,+j.hypoteka));['h-sazba','h2-sazba'].forEach(function(id){var inp=document.getElementById(id);inp.value=String(v).replace('.',',');inp.dispatchEvent(new Event('input'));inp.dispatchEvent(new Event('blur'));});}}).catch(function(){});}}
    var inv=document.getElementById('calc-invest');
    if(inv){var iv={};['i-jednorazove','i-mesicne','i-roky','r-renta','r-vek','r-od'].forEach(function(id){iv[id]=setup(document.getElementById(id).closest('.cf'),calcI);});
      var mode='a';
      function ret(years){for(var k=0;k<RET.length;k++){if(years>=RET[k][0]){return RET[k];}}return RET[RET.length-1];}
      function roky(n){return n+'\u00a0'+(n===1?'rok':(n<5?'roky':'let'));}
      /* modelový výnos „p % ročně“ → měsíční výnos tak, aby vklad za 12 měsíců vzrostl přesně o p % (ne p/12 – to by dalo efektivně víc) */
      function mrate(p){return Math.pow(1+p/100,1/12)-1;}
      function fvLump(L,r,n){return L*Math.pow(1+r,n);} function fvMonthly(M,r,n){return r>0?M*(Math.pow(1+r,n)-1)/r:M*n;}
      function calcI(){var lab=document.getElementById('i-label'),out=document.getElementById('i-vysledek'),sub=document.getElementById('i-sub'),st=document.getElementById('i-strategie');
        if(mode==='a'){var L=iv['i-jednorazove'](),M=iv['i-mesicne'](),y=iv['i-roky'](),R=ret(y),r=mrate(R[1]),n=y*12;var fv=fvLump(L,r,n)+fvMonthly(M,r,n),vklad=L+M*n;
          lab.textContent=TX.result_a;out.textContent=fmt(fv);sub.innerHTML=TX.result_a_sub.replace('{vklad}','<b>'+fmt(vklad)+'</b>').replace('{vynos}','<b>'+fmt(fv-vklad)+'</b>');
          st.textContent=TX.strategy[R[2]].replace('{r}',String(R[1]).replace('.',',')).replace('{n}',roky(y));}
        else{var renta=iv['r-renta'](),vek=iv['r-vek'](),od=iv['r-od']();
          if(od<=vek){lab.textContent=TX.result_b;out.textContent='–';sub.textContent='';st.textContent=TX.age_err;return;}
          var y2=od-vek,R2=ret(y2),r2=mrate(R2[1]),n2=y2*12;var kap=renta*12/0.04;var M2=r2>0?kap*r2/(Math.pow(1+r2,n2)-1):kap/n2;
          lab.textContent=TX.result_b;out.textContent=fmt(M2);sub.innerHTML=TX.result_b_sub.replace('{kapital}','<b>'+fmt(kap)+'</b>');
          st.textContent=TX.strategy[R2[2]].replace('{r}',String(R2[1]).replace('.',',')).replace('{n}',roky(y2));}}
      inv.querySelectorAll('.seg button').forEach(function(bt){bt.addEventListener('click',function(){mode=bt.dataset.mode;inv.querySelectorAll('.seg button').forEach(function(x){x.setAttribute('aria-selected',x===bt?'true':'false');});inv.querySelector('.mode-a').hidden=mode!=='a';inv.querySelector('.mode-b').hidden=mode!=='b';calcI();});});
      calcI();}
  })();
  window.addEventListener('beforeprint',function(){document.querySelectorAll('details.svc').forEach(function(d){d.removeAttribute('name');d.open=true;});});
  window.addEventListener('afterprint',function(){document.querySelectorAll('details.svc').forEach(function(d){d.open=false;d.setAttribute('name','sluzba');});});
  /* formulář */
  var f=document.getElementById('kontaktni-formular'), m=document.getElementById('form-hlaska'), rule=document.getElementById('pravidlo-kontakt'), T0=Date.now();
  if(f&&m){
    /* text hlášky: slova se spojovníkem (e-mail) se nesmí zalomit za spojovníkem */
    function setText(el,text){el.textContent='';String(text).split(/([A-Za-zÀ-ž]+-[A-Za-zÀ-ž]+)/).forEach(function(part,i){if(!part){return;}if(i%2){var s=document.createElement('span');s.className='nw';s.textContent=part;el.appendChild(s);}else{el.appendChild(document.createTextNode(part));}});}
    function show(cls,text){setText(m,text);m.className='form-msg '+cls;m.setAttribute('role',cls==='err'?'alert':'status');m.hidden=false;m.scrollIntoView({block:'center'});}
    var why='';
    function mark(el,bad){el.classList.toggle('invalid',bad);if(bad){el.setAttribute('aria-invalid','true');}else{el.removeAttribute('aria-invalid');}}
    function valid(){var ok=true,first=null,nameBad=false;why='';
      ['jmeno','zprava'].forEach(function(id){var el=f.querySelector('#'+id);var bad=!el.value.trim();mark(el,bad);if(bad){ok=false;nameBad=true;first=first||el;}});
      var em=f.querySelector('#email'),tel=f.querySelector('#telefon');var emV=em.value.trim(),emOk=!!emV&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emV),telOk=tel.value.replace(/[^0-9]/g,'').length>=9;
      var pair=emOk||telOk,emBad=!!emV&&!emOk;
      mark(em,emBad||(!pair&&!emV));mark(tel,!pair&&!emV&&!tel.value.trim());if(rule){rule.classList.toggle('err',!pair);}
      if(!pair){ok=false;first=first||em;}if(emBad){ok=false;first=first||em;}
      if(nameBad&&!pair){why='Vyplňte prosím jméno a\u00a0zprávu a\u00a0e-mail nebo telefon.';}else if(nameBad){why='Vyplňte prosím jméno a\u00a0zprávu.';}else if(!pair){why='Vyplňte prosím e-mail nebo telefon, abych se Vám mohl ozvat.';}
      if(emBad){why=(why?why+' ':'')+'Zkontrolujte prosím e-mail\u00a0– má tvar jmeno@domena.cz.';}
      if(!ok&&first){try{first.focus({preventScroll:true});}catch(e){first.focus();}first.scrollIntoView({block:'center'});}
      return ok;}
    f.addEventListener('submit',function(e){
      if(!valid()){e.preventDefault();setText(m,why);m.className='form-msg err';m.setAttribute('role','alert');m.hidden=false;return;}
      if(!f.getAttribute('action')){e.preventDefault();show('','Toto je náhled\u00a0– formulář se neodesílá. Na ostrém webu půjde zpráva na\u00a0info@tomasrous.cz.');return;}
      /* ochrana proti robotům: jak dlouho je stránka otevřená (sekundy) – nezávisle na hodinách zařízení */
      var ft=document.getElementById('form-t');if(ft){ft.value=String(Math.max(0,Math.floor((window.performance&&performance.now?performance.now():(Date.now()-T0))/1000)));}
      if(!window.fetch){return;}
      e.preventDefault();var btn=f.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Odesílám…';
      var fail=function(){show('err','Zprávu se nepodařilo odeslat. Zkuste to znovu, napište na info@tomasrous.cz nebo zavolejte na +420 776 206 850.');btn.disabled=false;btn.textContent='Odeslat zprávu';};
      var opt={method:'POST',body:new FormData(f),headers:{'X-Requested-With':'fetch'}},timer=null;
      if(window.AbortController){var ac=new AbortController();opt.signal=ac.signal;timer=setTimeout(function(){ac.abort();},30000);}   /* server neodpovídá → po 30 s chybová hláška místo nekonečného čekání */
      fetch(f.getAttribute('action'),opt).then(function(r){return r.json();}).then(function(j){
        if(timer){clearTimeout(timer);}
        if(j&&j.ok){var d=document.createElement('div');d.className='form-done';d.innerHTML='<h4>Děkuji, zpráva dorazila.</h4><p>Ozvu se&nbsp;Vám&nbsp;– zavolám nebo napíšu podle toho, co jste uvedli.</p>';f.replaceWith(d);d.scrollIntoView({block:'center'});}
        else{fail();}
      }).catch(function(){if(timer){clearTimeout(timer);}fail();});
    });
    var q=new URLSearchParams(location.search);
    if(q.get('odeslano')==='1'){show('ok','Děkuji, zpráva dorazila. Ozvu se Vám – zavolám nebo napíšu podle toho, co jste uvedli.');}else if(q.get('chyba')==='1'){show('err','Zprávu se nepodařilo odeslat. Zkuste to znovu, napište na info@tomasrous.cz nebo zavolejte na +420 776 206 850.');}
    if(q.get('odeslano')||q.get('chyba')){try{history.replaceState(null,'',location.pathname+'#kontakt');}catch(e){}}
  }
})();
