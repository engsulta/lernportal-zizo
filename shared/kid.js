/* =========================================================================
   ZIZO LERN-SPASS  ·  geteilte Spiel-Maschine (kid.js)
   -------------------------------------------------------------------------
   Fuer 4-Jaehrige, die noch NICHT lesen koennen. Darum:
     • Kid.speak(...)  liest jede Aufgabe & jedes Lob laut vor (Deutsch).
     • Alles laeuft ueber grosse Tipp-Flaechen  (kein Tastatur-Tippen).
     • Kid.pickGame(...) ist EIN Bauplan fuer alle Spiele: "Tippe das Richtige".
   Jede Themenseite definiert nur ihre Runden – der Rest kommt von hier.
   ========================================================================= */
window.Kid = (function(){
  "use strict";

  /* ---- Mini-DOM-Helfer -------------------------------------------------- */
  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  function el(tag, attrs={}, ...kids){
    const n=document.createElement(tag);
    for(const k in attrs){
      if(k==="class") n.className=attrs[k];
      else if(k==="html") n.innerHTML=attrs[k];
      else if(k.startsWith("on")&&typeof attrs[k]==="function") n.addEventListener(k.slice(2),attrs[k]);
      else if(attrs[k]!=null) n.setAttribute(k,attrs[k]);
    }
    for(const c of kids){ if(c==null) continue; n.append(c.nodeType?c:document.createTextNode(c)); }
    return n;
  }
  const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}

  /* ---- Toene (WebAudio) ------------------------------------------------- */
  const Sound=(()=>{
    let ctx=null,on=true;
    function ac(){ if(!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)();
      if(ctx.state==="suspended") ctx.resume(); return ctx; }
    ["pointerdown","touchstart","keydown","click"].forEach(ev=>
      window.addEventListener(ev,()=>{try{ac();}catch(e){}},{passive:true}));
    function tone(f,t,dur,type="sine",vol=.2){
      if(!on)return; const c=ac(),o=c.createOscillator(),g=c.createGain();
      o.type=type;o.frequency.setValueAtTime(f,t);o.connect(g);g.connect(c.destination);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);
      g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.start(t);o.stop(t+dur);
    }
    return {
      set(v){on=v;}, get(){return on;},
      click(){if(!on)return;const t=ac().currentTime;tone(520,t,.06,"triangle",.12);},
      good(){if(!on)return;const t=ac().currentTime;[523,659,784].forEach((f,i)=>tone(f,t+i*.09,.2,"sine",.18));},
      wrong(){if(!on)return;const t=ac().currentTime;tone(300,t,.16,"sine",.12);tone(240,t+.1,.2,"sine",.12);},
      win(){if(!on)return;const t=ac().currentTime;[523,587,659,784,880,1046].forEach((f,i)=>tone(f,t+i*.12,.32,"triangle",.18));}
    };
  })();

  /* ---- Sprache / Language (umschaltbar, gespeichert) -------------------- */
  const Lang=(()=>{
    const KEY="zizo_lernspass_lang";
    const CODE={de:"de-DE", en:"en-US"};
    let cur="de";
    try{ const s=localStorage.getItem(KEY); if(s==="de"||s==="en") cur=s; }catch(e){}
    // optionaler Erst-Start-Override: window.KID_LANG="en" vor kid.js
    if(!localStorage.getItem(KEY) && (window.KID_LANG==="en"||window.KID_LANG==="de")) cur=window.KID_LANG;
    return {
      get(){ return cur; },
      code(){ return CODE[cur]||"de-DE"; },
      set(l){ if(l!=="de"&&l!=="en")return; cur=l; try{localStorage.setItem(KEY,l);}catch(e){} },
      toggle(){ this.set(cur==="de"?"en":"de"); return cur; },
      /* T("deutsch","english") -> Text in der aktuellen Sprache */
      t(de,en){ return cur==="en" ? (en!=null?en:de) : de; }
    };
  })();

  /* ---- Sprache vorlesen (Deutsch/Englisch, je nach Lang) ---------------- */
  const Speak=(()=>{
    let enabled=true;
    const voices={de:null,en:null};
    const supported = "speechSynthesis" in window;
    // bevorzugt eine freundliche Stimme je Sprache
    const PREF={ de:/(anna|petra|marlene|female|kind|google)/i,
                 en:/(samantha|karen|serena|female|kind|google|zira|aria|jenny)/i };
    function loadVoices(){
      if(!supported)return;
      const vs=speechSynthesis.getVoices(); if(!vs.length)return;
      [["de",/de[-_]/i],["en",/en[-_]/i]].forEach(([k,re])=>{
        voices[k]= vs.find(v=>re.test(v.lang)&&PREF[k].test(v.name))
                || vs.find(v=>re.test(v.lang)) || null;
      });
    }
    if(supported){ loadVoices(); speechSynthesis.onvoiceschanged=loadVoices; }
    function say(text,{rate=.92,pitch=1.15,cb}={}){
      if(!supported||!enabled||!text){ if(cb)setTimeout(cb,300); return; }
      try{
        speechSynthesis.cancel();
        const lg=Lang.get();
        const u=new SpeechSynthesisUtterance(String(text));
        u.lang=Lang.code(); if(voices[lg])u.voice=voices[lg]; u.rate=rate; u.pitch=pitch; u.volume=1;
        if(cb)u.onend=()=>cb();
        speechSynthesis.speak(u);
      }catch(e){ if(cb)setTimeout(cb,300); }
    }
    return {
      say,
      stop(){ if(supported){ try{speechSynthesis.cancel();}catch(e){} } },
      set(v){ enabled=v; if(!v)this.stop(); },
      get(){ return enabled; },
      supported
    };
  })();

  /* ---- Konfetti --------------------------------------------------------- */
  const Confetti=(()=>{
    const cv=$("#confetti"); if(!cv) return {burst(){}};
    const cx=cv.getContext("2d"); let parts=[],raf=null;
    function size(){cv.width=innerWidth;cv.height=innerHeight;}
    addEventListener("resize",size);
    const COL=["#ff7a59","#ffd23f","#3ad07f","#3aa0ff","#a06bff","#ff6fc4"];
    function burst(n=170){
      size();cv.style.display="block";
      for(let i=0;i<n;i++)parts.push({x:innerWidth/2+rnd(-70,70),y:innerHeight/3,
        vx:rnd(-95,95)/10,vy:rnd(-160,-40)/10,g:.18+Math.random()*.12,
        s:rnd(8,16),c:pick(COL),r:Math.random()*6,vr:(Math.random()-.5)*.5,life:rnd(90,150)});
      if(!raf)loop();
    }
    function loop(){
      cx.clearRect(0,0,cv.width,cv.height);
      parts.forEach(p=>{p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life--;
        cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;
        cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);cx.restore();});
      parts=parts.filter(p=>p.life>0&&p.y<cv.height+30);
      if(parts.length)raf=requestAnimationFrame(loop); else{raf=null;cv.style.display="none";}
    }
    return {burst};
  })();

  /* ---- Sterne-Speicher (lokal, ganz einfach) ---------------------------- */
  const Store=(()=>{
    const KEY="zizo_lernspass_v1";
    let data={stars:{},stickers:0};
    try{const d=JSON.parse(localStorage.getItem(KEY)); if(d&&d.stars) data=d;}catch(e){}
    function save(){ try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){} }
    return {
      stars(id){ return data.stars[id]||0; },
      setStars(id,n){ if(n>(data.stars[id]||0)){data.stars[id]=n;} save(); },
      addSticker(){ data.stickers=(data.stickers||0)+1; save(); return data.stickers; },
      stickers(){ return data.stickers||0; },
      total(){ return Object.values(data.stars).reduce((a,b)=>a+b,0); },
      resetAll(){ data={stars:{},stickers:0}; save(); }
    };
  })();

  /* ---- Toast ------------------------------------------------------------ */
  let tT=null;
  function toast(msg){ const t=$("#toast"); if(!t)return;
    t.textContent=msg; t.classList.add("show"); clearTimeout(tT);
    tT=setTimeout(()=>t.classList.remove("show"),1700); }

  /* ---- Bildschirm setzen ------------------------------------------------ */
  function setScreen(node){ const s=$("#screen"); s.innerHTML=""; s.append(node); window.scrollTo(0,0); }
  function mascotRow(face,text){
    const row=el("div",{class:"mascot-row"});
    row.append(el("div",{class:"mascot"},face||"🐣"));
    row.append(el("div",{class:"bubble",html:text}));
    return row;
  }

  /* Lob-Sprueche (werden vorgelesen – darum ohne Emoji im Sprech-Text) */
  const PRAISE={
    de:["Super!","Toll gemacht!","Richtig!","Bravo!","Ganz stark!","Klasse!","Wunderbar!","Jaa, genau!"],
    en:["Great!","Well done!","Correct!","Bravo!","Awesome!","Nice job!","Wonderful!","Yes, exactly!"]
  };
  const TRYAGAIN={
    de:["Fast! Versuch es nochmal.","Hoppla, probier nochmal.","Schau nochmal genau hin."],
    en:["Almost! Try again.","Oops, try again.","Look closely again."]
  };

  /* =======================================================================
     pickGame  –  DER Bauplan fuer alle Spiele
     -----------------------------------------------------------------------
     cfg = {
       id, face, title, backHref,
       intro,                        // gesprochene Begruessung
       rounds: [ {
          say,                       // was vorgelesen wird ("Tippe auf ROT")
          prompt: (host)=>{},        // optional: was oben gezeigt wird (DOM aufbauen)
          cols,                      // 2 oder 3 (Standard 3)
          options: [ { build:(node)=>{}, ok:true|false, say? } ]  // Kacheln
       } ],
       onDone(stars)                 // optional
     }
     ======================================================================= */
  function pickGame(cfg){
    const rounds = cfg.rounds;
    let i=0, firstTryPerfect=0, retriedThis=false;

    function header(){
      const bar=el("div",{class:"topbar",style:"margin-bottom:12px"});
      bar.append(el("button",{class:"iconbtn",title:Lang.t("Zurück","Back"),
        onclick:()=>{ Speak.stop(); location.href=cfg.backHref||"../../index.html"; }},"🏠"));
      bar.append(el("div",{class:"brand"},el("span",{},cfg.face+" "+cfg.title)));
      bar.append(el("button",{class:"iconbtn",title:Lang.t("Nochmal hören","Listen again"),
        onclick:()=>{ Sound.click(); sayPrompt(); }},"🔊"));
      return bar;
    }
    const dots=()=>{ const d=el("div",{class:"dots"});
      rounds.forEach((_,k)=>d.append(el("div",{class:"d"+(k<i?" on":"")}))); return d; };

    let curSay="";
    function sayPrompt(){ Speak.say(curSay); }

    function render(){
      if(i>=rounds.length) return finish();
      retriedThis=false;
      const r=rounds[i];
      curSay=r.say||"";
      const scr=el("div",{class:"screen"});
      scr.append(header());
      scr.append(dots());

      const promptCard=el("div",{class:"card"});
      const pr=el("div",{class:"prompt"});
      if(r.prompt) r.prompt(pr);
      pr.append(el("button",{class:"sayagain",onclick:()=>{Sound.click();sayPrompt();}},"🔊 "+Lang.t("Nochmal hören","Listen again")));
      promptCard.append(pr);
      scr.append(promptCard);

      const grid=el("div",{class:"optgrid "+("c"+(r.cols||3))});
      const opts=shuffle(r.options);
      opts.forEach(o=>{
        const node=el("div",{class:"opt"});
        o.build(node);
        node.addEventListener("click",()=>{
          if(node.classList.contains("dim")||node.classList.contains("correct"))return;
          if(o.ok){
            node.classList.add("correct"); Sound.good();
            $$(".opt",grid).forEach(x=>{ if(x!==node)x.classList.add("dim"); });
            if(!retriedThis) firstTryPerfect++;
            const praise=pick(PRAISE[Lang.get()]);
            fb.className="feedback show ok"; fb.innerHTML="";
            fb.append(el("span",{class:"fi"},"🎉"), el("div",{},praise));
            Store.addSticker();
            Speak.say(praise,{cb:()=>{ i++; setTimeout(render,250); }});
            // Fallback, falls keine Sprachausgabe: trotzdem weiter
            setTimeout(()=>{ if(rounds[i]===r){ i++; render(); } }, 1600);
          } else {
            node.classList.add("wrong"); Sound.wrong(); retriedThis=true;
            setTimeout(()=>node.classList.remove("wrong"),500);
            const t=pick(TRYAGAIN[Lang.get()]);
            fb.className="feedback show no"; fb.innerHTML="";
            fb.append(el("span",{class:"fi"},"💡"), el("div",{},t));
            Speak.say(t);
          }
        });
        grid.append(node);
      });
      const optCard=el("div",{class:"card"}); optCard.append(grid);
      scr.append(optCard);

      const fb=el("div",{class:"feedback"}); scr.append(fb);
      setScreen(scr);
      // Aufgabe vorlesen (kurze Pause, damit der Bildschirm da ist)
      setTimeout(sayPrompt, 350);
    }

    function finish(){
      const stars = firstTryPerfect>=rounds.length ? 3
                  : firstTryPerfect>=Math.ceil(rounds.length*0.6) ? 2 : 1;
      Store.setStars(cfg.id, stars);
      const scr=el("div",{class:"result screen"});
      const bar=el("div",{class:"topbar",style:"margin-bottom:12px"});
      bar.append(el("button",{class:"iconbtn",onclick:()=>{Speak.stop();location.href=cfg.backHref||"../../index.html";}},"🏠"));
      bar.append(el("div",{class:"brand"},el("span",{},cfg.face+" "+cfg.title)));
      bar.append(el("span",{}));
      scr.append(bar);

      const card=el("div",{class:"card center"});
      card.append(el("div",{class:"badge"},cfg.face));
      card.append(el("div",{class:"huge"},Lang.t("Geschafft!","All done!")+" 🎉"));
      const st=el("div",{class:"bigstars"});
      for(let k=0;k<3;k++)st.append(el("span",{class:"s"},"★"));
      card.append(st);
      const nav=el("div",{style:"margin-top:14px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap"});
      nav.append(el("button",{class:"btn green lg",onclick:()=>{Sound.click();play();}},"↻ "+Lang.t("Nochmal spielen","Play again")));
      nav.append(el("button",{class:"btn blue",onclick:()=>{Sound.click();Speak.stop();location.href=cfg.backHref||"../../index.html";}},"🏠 "+Lang.t("Zurück","Back")));
      card.append(nav);
      scr.append(card);
      setScreen(scr);

      setTimeout(()=>{ const ss=$$(".bigstars .s");
        for(let k=0;k<stars;k++)setTimeout(()=>{ss[k].classList.add("on");Sound.good();},k*350);
      },200);
      Confetti.burst(stars>=3?230:150); Sound.win();
      Speak.say(Lang.t("Wunderbar! Du hast alles geschafft!","Wonderful! You did it all!"));
      if(cfg.onDone) cfg.onDone(stars);
    }

    function play(){
      i=0; firstTryPerfect=0;
      // Runden neu mischen fuer Abwechslung
      cfg.rounds = shuffle(rounds);
      render();
    }

    // Start: kurze Begruessung, dann los
    function start(){
      const scr=el("div",{class:"screen"});
      scr.append(header());
      scr.append(mascotRow(cfg.face, cfg.introHtml||("<b>"+cfg.title+"</b>")));
      const card=el("div",{class:"card center"});
      card.append(el("button",{class:"btn green lg",onclick:()=>{Sound.click();play();}},"▶ "+Lang.t("Los geht's!","Let's go!")));
      scr.append(card);
      setScreen(scr);
      if(cfg.intro) setTimeout(()=>Speak.say(cfg.intro),400);
    }
    start();
  }

  /* Sound/Sprache-Umschalter fuer den Kopf-Button einer Seite */
  function wireSoundButton(btn){
    if(!btn)return;
    btn.addEventListener("click",function(){
      const on=!Sound.get();
      Sound.set(on); Speak.set(on);
      this.textContent=on?"🔊":"🔇";
      if(on){ Sound.click(); }
    });
  }

  /* Sprach-Umschalter (Deutsch/Englisch) fuer den Kopf-Button einer Seite.
     Tippen wechselt die Sprache und laedt die Seite neu, damit ALLES (Stimme
     und Text) sofort in der neuen Sprache erscheint. */
  function wireLangButton(btn){
    if(!btn)return;
    btn.textContent = Lang.get()==="de" ? "🇩🇪" : "🇺🇸";
    btn.title = "Sprache / Language";
    btn.addEventListener("click",function(){
      Sound.click(); Lang.toggle(); location.reload();
    });
  }

  /* dekorative Wolken */
  function clouds(n=4){ const b=document.body;
    for(let i=0;i<n;i++){ const c=el("div",{class:"cloud"});
      c.style.top=(8+i*17)+"%"; c.style.width=(66+rnd(0,60))+"px"; c.style.height=(24+rnd(0,14))+"px";
      c.style.animationDuration=(42+rnd(0,40))+"s"; c.style.animationDelay=(-rnd(0,40))+"s"; b.append(c);} }

  return { $, $$, el, rnd, pick, shuffle, Sound, Speak, Confetti, Store,
           toast, setScreen, mascotRow, pickGame, wireSoundButton, clouds,
           Lang, T:(de,en)=>Lang.t(de,en), wireLangButton };
})();
