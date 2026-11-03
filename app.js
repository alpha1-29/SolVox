(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>1-Math.pow(1-t,3);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.documentElement,frame=$('#frame');
const cvar=n=>getComputedStyle(root).getPropertyValue(n).trim();
/* safety net for browsers without overflow:clip: snap any shifted layer straight back */
frame.addEventListener('scroll',e=>{const t=e.target;if(t&&t.classList&&(t===frame||t.classList.contains('scr')||t.classList.contains('tab')||t.classList.contains('ovl'))){if(t.scrollTop)t.scrollTop=0;if(t.scrollLeft)t.scrollLeft=0}},true);
document.addEventListener('focusin',()=>{requestAnimationFrame(()=>{[frame,...$$('.scr,.tab,.ovl')].forEach(t=>{if(t.scrollTop)t.scrollTop=0;if(t.scrollLeft)t.scrollLeft=0})})});
/* ---------- state ---------- */
const KEY='solvox.v1';
const DEF={user:null,theme:'auto',ts:1,haptics:true,notif:{battery:true,conn:true,update:false},push:false,vol:70,mode:'normal',auto:false,nr:true,wind:false,dir:false,
lost:false,lostMsg:'',sep:true,sunSrc:'auto',backup:false,bat:{L:85,R:83},hist:[22,31,18,40,27,35,12],hear:null,last:null,note:'',alerts:[],usage:405,dev:null,flags:{low:false,full:false,sep:false}};
let S;try{S=Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){S=Object.assign({},DEF);}
S.notif=Object.assign({},DEF.notif,S.notif);S.look=S.look||'gold';S.card=S.card||'classic';S.round=S.round||'soft';S.hc=!!S.hc;S.calm=!!S.calm;S.flags=Object.assign({},DEF.flags,S.flags);S.bat=Object.assign({},DEF.bat,S.bat);
let st=0;const save=()=>{clearTimeout(st);st=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}},300)};
const users=()=>{try{return JSON.parse(localStorage.getItem('solvox.users')||'[]')}catch(e){return[]}};
const saveUsers=u=>{try{localStorage.setItem('solvox.users',JSON.stringify(u))}catch(e){}};
/* ---------- icons ---------- */
const P={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
tune:'<path d="M4 6h8M16 6h4M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="14" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
find:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
bell:'<path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3L7 7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7"/><circle cx="12" cy="12" r="7"/>',
bt:'<path d="M7 7l10 10-5 5V2l5 5L7 17"/>',ear:'<path d="M7 9a5 5 0 0 1 10 0c0 3-3 3.5-3 6.5a2.5 2.5 0 0 1-5 0M10 9a2 2 0 0 1 4 0"/>',
bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',moon:'<path d="M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z"/>',
chat:'<path d="M4 5h16v11H9l-5 4z"/>',mic:'<path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3M5 11a7 7 0 0 0 14 0M12 18v3"/>',
bat:'<path d="M3 8h15v8H3zM21 11v2"/>',chev:'<path d="M9 6l6 6-6 6"/>',back:'<path d="M15 6l-6 6 6 6"/>',check:'<path d="M5 12l5 5 9-10"/>',
play:'<path d="M7 4l13 8-13 8z"/>',pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11"/><circle cx="12" cy="10" r="2.5"/>',
eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="3"/>',eyeoff:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>',
user:'<path d="M12 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8M4 21a8 8 0 0 1 16 0"/>',vol:'<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6"/>',
minus:'<path d="M5 12h14"/>',plus:'<path d="M12 5v14M5 12h14"/>',wave:'<path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4"/>',
shield:'<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17h0"/>',
nav:'<path d="M12 3l6 17-6-4-6 4z"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',moon2:'<path d="M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z"/>',
flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',out:'<path d="M9 4H4v16h5M16 8l4 4-4 4M20 12H9"/>',
copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
lock:'<path d="M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3"/>',scan:'<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>'};
const ic=(n,s=22)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||''}</svg>`;
const IMG={L:'img/bud-left.webp',R:'img/bud-right.webp'};
const bud=(side='L',w=70)=>`<img class="budimg" src="${IMG[side]}" width="${w}" alt="${side==='L'?'Left':'Right'} SolVox bud" draggable="false">`;
/* ---------- helpers ---------- */
let toastT=0;const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2800)};
const vib=p=>{if(S.haptics&&navigator.vibrate)try{navigator.vibrate(p)}catch(e){}};
const hour=()=>{const d=new Date();return d.getHours()+d.getMinutes()/60};
const sunF=(h=hour())=>h>=6&&h<=18?Math.max(0,Math.sin(Math.PI*(h-6)/12)):0;
const greet=()=>{const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening'};
const fmtT=t=>{const d=new Date(t);return d.toLocaleString([], {weekday:'short',hour:'2-digit',minute:'2-digit'})};
const connected=()=>!!(S.dev&&S.dev.connected);
const avgBat=()=>(S.bat.L+S.bat.R)/2;
const C84=2*Math.PI*84;
const ring=(p,label)=>`<div class="ring" data-ring><div class="glow"></div><svg viewBox="0 0 200 200"><circle class="rt" cx="100" cy="100" r="84"/><circle class="rp" cx="100" cy="100" r="84" stroke-dasharray="${C84}" stroke-dashoffset="${C84*(1-p/100)}" transform="rotate(-90 100 100)"/></svg><div class="rin">${ic('sun',30)}<div class="pct"><b>${Math.round(p)}</b><small>%</small></div><div class="lbl">${label}</div></div></div>`;
const setRings=()=>{$$('[data-ring]').forEach(r=>{const own=r.dataset.ring||'avg';const p=own==='avg'?avgBat():own==='L'?S.bat.L:S.bat.R;const c=$('.rp',r);if(c)c.setAttribute('stroke-dashoffset',C84*(1-p/100));const b=$('.pct b',r);if(b)b.textContent=Math.round(p)})};
/* ---------- router ---------- */
let cur='s-intro';
function show(id,dir=1){if(id===cur)return;const a=$('#'+cur),b=$('#'+id);b.style.transition='none';b.dataset.s=dir>0?'right':'left';void b.offsetWidth;b.style.transition='';b.dataset.s='active';a.dataset.s=dir>0?'left':'right';cur=id;if(id==='s-intro')startIntro();else stopIntro()}
const TABS=['home','tune','find','solar','me'];let curTab='home';
const TLAB={home:'Home',tune:'SoundTune',find:'Find',solar:'Solar',me:'Settings'};
const TIC={home:'home',tune:'tune',find:'find',solar:'sun',me:'gear'};
function tab(n){if(n===curTab)return;const a=$('#tab-'+curTab),b=$('#tab-'+n),d=TABS.indexOf(n)>TABS.indexOf(curTab)?1:-1;b.style.transition='none';b.dataset.s=d>0?'right':'left';void b.offsetWidth;b.style.transition='';b.dataset.s='active';a.dataset.s=d>0?'left':'right';curTab=n;$$('#tabbar button').forEach(x=>x.classList.toggle('on',x.dataset.v===n));vib(8);if(n==='find')syncFind();if(n==='solar')renderSolar();if(n!=='tune'&&false)0}
const OV={hearing:()=>renderHearing(),alerts:()=>renderAlerts(),personal:()=>renderPersonal(),help:()=>renderHelp(),test:()=>renderTestIntro(),solar:()=>renderSolarFull(),caps:()=>renderCaps()};
function openO(n){OV[n]&&OV[n]();$('#o-'+n).classList.add('open');vib(8)}
function closeO(n){$('#o-'+n).classList.remove('open');if(n==='test')abortTest();if(n==='caps')stopCaps();if(n==='alerts'){S.alerts.forEach(a=>a.read=true);save();renderHome()}}
/* ---------- alerts ---------- */
function addAlert(type,title,msg,force){const pref={battery:S.notif.battery,conn:S.notif.conn,update:S.notif.update,find:true}[type];if(pref===false&&!force)return;
S.alerts.unshift({t:Date.now(),type,title,msg,read:false});S.alerts=S.alerts.slice(0,40);save();toast(title);vib([60,40,60]);renderHome();
if(S.push&&'Notification'in window&&Notification.permission==='granted'){try{new Notification(title,{body:msg})}catch(e){}}}
/* ---------- intro film ---------- */
const cv=$('#introCv'),cx=cv.getContext('2d');let introRaf=0,introT0=0,introOn=false,soundOn=false,iaud=null;
const WM='SOLVOX';$('#wm').innerHTML=[...WM].map((c,i)=>`<span style="animation-delay:${3.6+i*.14}s">${c}</span>`).join('');
const parts=Array.from({length:70},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.6+.4,v:Math.random()*.02+.005,p:Math.random()*6}));
function sizeCv(){const d=Math.min(devicePixelRatio||1,2),r=cv.getBoundingClientRect();cv.width=Math.max(2,r.width*d);cv.height=Math.max(2,r.height*d)}
function introFrame(now){if(!introOn)return;const t=Math.max(0,(now-introT0)/1000),w=cv.width,h=cv.height,d=w/(cv.getBoundingClientRect().width||w);
const e=ease(clamp(t/5.2,0,1)),hy=h*.6,x=w/2;cx.clearRect(0,0,w,h);cx.fillStyle='#050403';cx.fillRect(0,0,w,h);
const sy=hy+(1-e)*h*.16-e*h*.005;
let g=cx.createRadialGradient(x,sy,0,x,sy,w*(.18+1.1*e));g.addColorStop(0,`rgba(255,226,150,${.2+.8*e})`);g.addColorStop(.18,`rgba(255,170,60,${.55*e})`);g.addColorStop(.5,`rgba(150,70,10,${.28*e})`);g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(0,0,w,h);
/* rays */
cx.save();cx.translate(x,sy);for(let i=-7;i<=7;i++){const a=i*Math.PI/16-Math.PI/2,len=w*(.12+.3*e)*(1-Math.abs(i)/12);cx.strokeStyle=`rgba(255,210,120,${.5*e*(1-Math.abs(i)/9)})`;cx.lineWidth=1.4*d;cx.beginPath();cx.moveTo(Math.cos(a)*w*.05,Math.sin(a)*w*.05);cx.lineTo(Math.cos(a)*len,Math.sin(a)*len);cx.stroke()}cx.restore();
/* sound ripples */
for(let k=0;k<6;k++){const ph=((t*.28+k/6)%1),r=ph*w*.95;cx.strokeStyle=`rgba(240,190,90,${(1-ph)*.34*e})`;cx.lineWidth=1.2*d;cx.beginPath();cx.arc(x,sy,r,Math.PI*1.02,Math.PI*1.98);cx.stroke()}
/* planet */
const R=w*2.1;cx.fillStyle='#070504';cx.beginPath();cx.arc(x,hy+R,R,0,7);cx.fill();
const rim=cx.createLinearGradient(x-w*.6,hy,x+w*.6,hy);rim.addColorStop(0,'rgba(255,190,80,0)');rim.addColorStop(.5,`rgba(255,215,130,${.95*e})`);rim.addColorStop(1,'rgba(255,190,80,0)');
cx.strokeStyle=rim;cx.lineWidth=2.2*d;cx.beginPath();cx.arc(x,hy+R,R,Math.PI*1.4,Math.PI*1.6);cx.stroke();
const hz=cx.createRadialGradient(x,hy,0,x,hy,w*.6);hz.addColorStop(0,`rgba(255,200,110,${.38*e})`);hz.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=hz;cx.fillRect(0,hy-h*.1,w,h*.2);
/* dust */
parts.forEach(p=>{p.y-=p.v*.003;if(p.y<0)p.y=1;const a=(.2+.5*Math.sin(t*1.3+p.p)**2)*e;cx.fillStyle=`rgba(255,220,150,${a*.7})`;cx.beginPath();cx.arc(p.x*w,p.y*h*.6+h*.05,p.r*d,0,7);cx.fill()});
introRaf=requestAnimationFrame(introFrame)}
function startIntro(){introOn=true;sizeCv();introT0=performance.now()-(matchMedia('(prefers-reduced-motion: reduce)').matches?6000:0);cancelAnimationFrame(introRaf);introRaf=requestAnimationFrame(introFrame);$$('.wm span,.isub,.itag,.igo').forEach(n=>{n.style.animation='none';void n.offsetWidth;n.style.animation=''})}
function stopIntro(){introOn=false;cancelAnimationFrame(introRaf);stopSwell()}
function swell(){try{const c=aud();stopSwell();const n=c.currentTime,m=c.createGain();m.gain.setValueAtTime(0,n);m.gain.linearRampToValueAtTime(.16,n+3.5);m.gain.linearRampToValueAtTime(.09,n+9);m.connect(c.destination);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(300,n);lp.frequency.exponentialRampToValueAtTime(2600,n+5);lp.connect(m);
const os=[110,164.8,220,277.2,329.6].map((f,i)=>{const o=c.createOscillator();o.type=i%2?'triangle':'sine';o.frequency.value=f;const g=c.createGain();g.gain.value=.5/(i+1);o.connect(g);g.connect(lp);o.start(n);return o});
[0,.35,.7,1.05].forEach((o,i)=>{const t=n+5.2+o,f=[659.3,783.99,987.8,1318.5][i];const oo=c.createOscillator(),gg=c.createGain();oo.frequency.value=f;gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(.12,t+.02);gg.gain.exponentialRampToValueAtTime(.0001,t+2.4);oo.connect(gg);gg.connect(c.destination);oo.start(t);oo.stop(t+2.5)});
iaud={os,m}}catch(e){}}
function stopSwell(){if(!iaud)return;try{const c=A.ctx;iaud.m.gain.cancelScheduledValues(c.currentTime);iaud.m.gain.setTargetAtTime(0,c.currentTime,.3);const o=iaud.os;setTimeout(()=>o.forEach(x=>{try{x.stop()}catch(e){}}),1500)}catch(e){}iaud=null}
/* ---------- welcome ---------- */
const arts={art1:`<div style="position:relative;z-index:1">${ic('sun',70)}</div>`,art2:`<div class="row" style="gap:6px;position:relative;z-index:1">${bud('L',100)}${bud('R',100)}</div>`,art3:`<div style="position:relative;z-index:1;color:var(--gold)">${ic('wave',74)}</div>`};
Object.keys(arts).forEach(k=>{$('#'+k).innerHTML=arts[k]});$('#art1 svg').style.color='var(--gold)';
$('#pairArt').innerHTML=`<div class="row" style="gap:6px;position:relative;z-index:1">${bud('L',104)}<div style="color:var(--gt)">${ic('bt',30)}</div>${bud('R',104)}</div>`;
let wi=0;const wt=$('#welTrack');
function welUpdate(){wi=Math.round(wt.scrollLeft/wt.clientWidth);$$('#dots i').forEach((d,i)=>d.classList.toggle('on',i===wi));$('#welNext').textContent=wi===2?'Continue':'Next'}
wt.addEventListener('scroll',()=>{clearTimeout(wt._t);wt._t=setTimeout(welUpdate,60)});
function welNext(){if(wi<2){wt.scrollTo({left:(wi+1)*wt.clientWidth,behavior:'smooth'})}else{toAuth()}}
function toAuth(){if(S.user){afterAuth()}else show('s-auth')}
/* ---------- auth ---------- */
let mode='up';
async function hash(p,salt){try{if(crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}}catch(e){}let h=2166136261;const s=salt+':'+p;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return 'f'+(h>>>0).toString(16)}
const strength=p=>{let s=0;if(p.length>=8)s++;if(/[A-Z]/.test(p)&&/[a-z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^A-Za-z0-9]/.test(p)||p.length>=12)s++;return s};
function authMode(m){mode=m;const up=m==='up';$('#authSeg').dataset.t=m;$$('#authSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===m));$('#authTitle').innerHTML=up?'Create your<br>account':'Welcome<br>back';$('#fName').hidden=!up;$('#fTerms').hidden=!up;$('#meter').hidden=!up;$('#forgotBtn').hidden=up;$('#authGo').textContent=up?'Create account':'Sign in';$('#aPass').autocomplete=up?'new-password':'current-password';$('#authErr').textContent=''}
$('#eyeBtn').innerHTML=ic('eye',20);
$('#aPass').addEventListener('input',e=>{const s=mode==='up'?strength(e.target.value):0;$$('#meter i').forEach((i,n)=>i.style.background=n<s?['#C0432F','#E0902B','#C8B22B','#2B8A57'][s-1]:'')});
$('#authForm').addEventListener('submit',async ev=>{ev.preventDefault();const em=$('#aEmail').value.trim().toLowerCase(),pw=$('#aPass').value,nm=$('#aName').value.trim(),err=m=>{$('#authErr').textContent=m;vib(40)};
if(mode==='up'&&nm.length<2)return err('Enter your name.');if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))return err('Enter a valid email address.');
if(pw.length<8)return err('Password needs at least 8 characters.');
const U=users();
if(mode==='up'){if(strength(pw)<2)return err('Add numbers or capital letters to strengthen the password.');if(!$('#aTerms').checked)return err('Please accept the Terms to continue.');if(U.some(u=>u.email===em))return err('That email already has an account. Try signing in.');
const salt=Math.random().toString(36).slice(2);U.push({name:nm,email:em,salt,h:await hash(pw,salt)});saveUsers(U);S.user={name:nm,email:em};}
else{const u=U.find(u=>u.email===em);if(!u)return err('No account found for that email. Try signing up.');if(u.h!==await hash(pw,u.salt))return err('Wrong password. Try again or reset it.');S.user={name:u.name,email:em};}
$('#authErr').textContent='';save();afterAuth()});
function afterAuth(){toast('Welcome, '+S.user.name.split(' ')[0]);vib(20);if(S.dev){enter()}else show('s-pair')}
/* ---------- pairing ---------- */
const BT={dev:null,rssi:null,rssiT:0};
const IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const PAIRTXT=navigator.bluetooth?'Put your buds in pairing mode, then choose them from the Bluetooth list.':'First connect your buds in '+(IOS?'iPhone Settings > Bluetooth':'your phone Bluetooth settings')+'. Then tap Detect my buds.';
let sysT=0;
async function sysList(ask){try{const md=navigator.mediaDevices;if(!md||!md.enumerateDevices)return null;let devs=await md.enumerateDevices();if(ask&&!devs.some(d=>d.label)){const st=await md.getUserMedia({audio:true});st.getTracks().forEach(t=>t.stop());devs=await md.enumerateDevices()}
if(!devs.some(d=>d.label))return null;return devs.filter(d=>(d.kind==='audioinput'||d.kind==='audiooutput')&&d.label&&!/^(default|communications|iphone|ipad|built-?in|macbook|internal)/i.test(d.label.trim())).map(d=>d.label).filter((v,i,a)=>a.indexOf(v)===i)}catch(e){return null}}
async function sysCheck(){if(!S.dev||!S.dev.sys)return;const l=await sysList(false);if(l===null)return;const here=l.includes(S.dev.devLabel);if(here!==connected())setConn(here,false)}
function startSysWatch(){clearInterval(sysT);if(!S.dev||!S.dev.sys)return;sysT=setInterval(sysCheck,4000);try{navigator.mediaDevices.addEventListener('devicechange',sysCheck)}catch(e){}}
function pickSys(name){S.dev={name,real:false,sys:true,connected:true,devLabel:name};S.bat={L:85,R:83};enter();startSysWatch()}
async function pairSystem(){const pm=$('#pairMsg');$('#pairList').innerHTML='';pm.textContent='Looking for your buds…';const l=await sysList(true);
if(l===null){pm.textContent='SolVox needs microphone access to see which Bluetooth audio device is connected. Allow it, then tap Detect again.';return}
if(!l.length){pm.textContent='No Bluetooth buds found yet. Open '+(IOS?'iPhone Settings > Bluetooth':'Bluetooth settings')+', tap your buds so they say Connected, then come back and tap Detect again.';return}
if(l.length===1)return pickSys(l[0]);pm.textContent='Choose your buds:';$('#pairList').innerHTML=l.map(n=>`<button class="btn sm" data-act="pickSys" data-v="${esc(n)}">${esc(n)}</button>`).join('')}
function enter(){S.dev=S.dev||{name:'SolVox Buds',real:false,connected:true};S.dev.connected=true;save();buildShell();show('s-shell')}
function pairDemo(){S.dev={name:'SolVox Demo Buds',real:false,connected:true};S.bat={L:85,R:83};enter()}
async function pairReal(){if(!navigator.bluetooth)return pairSystem();
$('#pairMsg').textContent='Searching…';
try{const d=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:['battery_service']});BT.dev=d;S.dev={name:d.name||'Bluetooth buds',real:true,connected:true};
d.addEventListener('gattserverdisconnected',()=>setConn(false));
try{const srv=await d.gatt.connect();try{const sv=await srv.getPrimaryService('battery_service'),ch=await sv.getCharacteristic('battery_level'),v=await ch.readValue();S.bat.L=S.bat.R=v.getUint8(0)}catch(e){}}catch(e){}
try{if(d.watchAdvertisements){d.addEventListener('advertisementreceived',e=>{BT.rssi=e.rssi;BT.rssiT=Date.now()});await d.watchAdvertisements()}}catch(e){}
enter()}catch(e){$('#pairMsg').textContent=PAIRTXT;toast(e&&e.name==='NotFoundError'?'No device chosen.':'Bluetooth pairing is blocked here. Try demo buds.')}}
async function setConn(v,silent){if(!S.dev)return;if(v&&S.dev.sys){const l=await sysList(true);if(!l||!l.includes(S.dev.devLabel)){toast('Buds not found. Connect them in '+(IOS?'iPhone Settings > Bluetooth':'Bluetooth settings')+', then tap again.');return}}if(v&&S.dev.real&&BT.dev&&BT.dev.gatt){try{await BT.dev.gatt.connect()}catch(e){toast('Could not reach the buds. Move closer and retry.');return}}
const was=S.dev.connected;S.dev.connected=v;save();if(was===v)return;
if(!v){captureLoc(true);stopLive();stopRing();stopGuide();if(!silent)addAlert('conn','Hearing aids disconnected','Last seen location saved. Open Find My Device to look for them.')}
else{if(!silent)addAlert('conn','Hearing aids connected','Both buds are ready.');if(S.lost){S.lost=false;addAlert('find','Found your buds','They reconnected while Lost mode was on.',true)}}
renderHome();syncFind();renderTuneState();capStatus()}
/* ---------- audio engine ---------- */
const A={ctx:null,g:{},src:null,stream:null,mode:null,demo:null,bands:[]};
const BF=[500,1000,2000,4000,8000];
function aud(){if(A.ctx){if(A.ctx.state==='suspended')A.ctx.resume();return A.ctx}
const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('no audio');const c=A.ctx=new AC(),g=A.g;
const bq=(t,f,q)=>{const n=c.createBiquadFilter();n.type=t;n.frequency.value=f;if(q)n.Q.value=q;return n};
g.inp=c.createGain();g.anIn=c.createAnalyser();g.anIn.fftSize=1024;g.hp=bq('highpass',60,.7);g.lo=bq('lowshelf',250);g.md=bq('peaking',2000,.9);g.hi=bq('highshelf',4500);
A.bands=BF.map(f=>bq('peaking',f,1.1));g.lp=bq('lowpass',12000,.7);g.cp=c.createDynamicsCompressor();g.vol=c.createGain();g.an=c.createAnalyser();g.an.fftSize=1024;g.an.smoothingTimeConstant=.78;
let n=g.inp;g.inp.connect(g.anIn);[g.hp,g.lo,g.md,g.hi,...A.bands,g.lp,g.cp,g.vol,g.an].forEach(x=>{n.connect(x);n=x});g.an.connect(c.destination);
applyDSP();applyProfile();return c}
function applyDSP(){if(!A.ctx)return;const g=A.g,t=A.ctx.currentTime,set=(p,v)=>p.setTargetAtTime(v,t,.08);
let hp=60,lo=0,md=0,mf=2000,hi=0,lp=12000,th=-28,ra=3,mq=.9;
if(S.mode==='conversation'){md=6;mf=2300;lo=-4;hi=3;hp=150;th=-32;ra=4}
if(S.mode==='noisy'){hp=220;lo=-9;md=3;hi=-3;lp=6500;th=-42;ra=7}
if(S.nr){lp=Math.min(lp,7500);hp=Math.max(hp,120);ra+=2}
if(S.wind)hp=Math.max(hp,320);
if(S.dir){md+=3;mq=1.7}
set(g.hp.frequency,hp);set(g.lo.gain,lo);set(g.md.gain,md);set(g.md.frequency,mf);set(g.md.Q,mq);set(g.hi.gain,hi);set(g.lp.frequency,lp);set(g.cp.threshold,th);set(g.cp.ratio,ra);
set(g.vol.gain,Math.pow(S.vol/100,2)*2)}
function applyProfile(){if(!A.ctx)return;const t=A.ctx.currentTime;A.bands.forEach((b,i)=>{let gn=0;if(S.hear){const l=(S.hear.L[i]+S.hear.R[i])/2,base=Math.min(...S.hear.L.map((v,j)=>(v+S.hear.R[j])/2));gn=clamp((l-base)*.3,0,10)}b.gain.setTargetAtTime(gn,t,.1)})}
function demoBuf(){if(A.demo)return A.demo;const c=A.ctx,sr=c.sampleRate,len=sr*8,b=c.createBuffer(1,len,sr),d=b.getChannelData(0);let lp=0,seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const sy=[[.0,.5],[1.1,.9],[2.4,.4]];/* syllable envelope: start,len */
for(let i=0;i<len;i++){const t=i/sr;let n=(rnd()*2-1);lp=lp*.985+n*.015;let v=lp*2.2;/* low rumble/noise bed */
const syl=Math.max(0,Math.sin(Math.PI*((t*3.2)%1)))*(((t%3.4)<2.6)?1:0);const f0=118+12*Math.sin(t*5.1)+((t%3.4)<1.3?0:18);let s=0;for(let h=1;h<=14;h++){const fr=f0*h;const form=Math.exp(-Math.pow((fr-700)/280,2))+.8*Math.exp(-Math.pow((fr-1700)/420,2))+.4*Math.exp(-Math.pow((fr-2700)/500,2));s+=Math.sin(2*Math.PI*fr*t)*form/h*1.4}
v+=s*syl*.18;if((t>5.6&&t<5.75)||(t>6.05&&t<6.2)){v+=Math.sin(2*Math.PI*190*t)*Math.exp(-((t-5.6)%.45)*40)*.35}d[i]=v}
for(let i=0;i<4000;i++){const k=i/4000;d[i]*=k;d[len-1-i]*=k}return A.demo=b}
function srcStop(){if(A.src){try{A.src.stop&&A.src.stop()}catch(e){}try{A.src.disconnect()}catch(e){}A.src=null}if(A.stream){A.stream.getTracks().forEach(t=>t.stop());A.stream=null}A.mode=null}
function startDemo(){const c=aud();srcStop();const s=c.createBufferSource();s.buffer=demoBuf();s.loop=true;s.connect(A.g.inp);s.start();A.src=s;A.mode='demo'}
async function startLive(){if(!connected()){toast('Connect your buds first.');return}
try{const c=aud();if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('nomic');const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});srcStop();A.stream=st;const s=c.createMediaStreamSource(st);s.connect(A.g.inp);A.src=s;A.mode='live';toast('Live Assist on. Use your earbuds to avoid echo.')}
catch(e){toast('Microphone is blocked here. Playing the demo soundscape instead.');startDemo()}
renderTuneState()}
function stopLive(){srcStop();renderTuneState()}
/* tones */
function beep(f,dur,vol,pan,type){try{const c=aud(),o=c.createOscillator(),gn=c.createGain(),t=c.currentTime;o.type=type||'sine';o.frequency.value=f;gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(vol,t+.012);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(gn);if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(pan||0,-1,1);gn.connect(p);p.connect(c.destination)}else gn.connect(c.destination);o.start(t);o.stop(t+dur+.05)}catch(e){}}
/* ---------- scene detection + spectrum ---------- */
let scene='quiet',sceneT=0;
function detect(){if(!A.ctx||!A.mode)return;const an=A.g.anIn,N=an.fftSize,td=new Float32Array(N);an.getFloatTimeDomainData(td);let s=0;for(let i=0;i<N;i++)s+=td[i]*td[i];const db=20*Math.log10(Math.sqrt(s/N)+1e-9);
const fd=new Uint8Array(an.frequencyBinCount);an.getByteFrequencyData(fd);const bw=A.ctx.sampleRate/N;let sp=0,tot=0;fd.forEach((v,i)=>{const f=i*bw,e=v*v;tot+=e;if(f>300&&f<3400)sp+=e});const r=tot?sp/tot:0;
const ns=db<-58?'quiet':(r>.6&&db<-22)?'speech':'noisy';if(ns!==scene){scene=ns;if(S.auto){const m={quiet:'normal',speech:'conversation',noisy:'noisy'}[ns];if(S.mode!==m){S.mode=m;applyDSP();save();renderTuneState()}}renderTuneState()}}
setInterval(detect,600);
function drawSpec(){const c=$('#spec');if(!c)return;const d=Math.min(devicePixelRatio||1,2),r=c.getBoundingClientRect();if(!r.width)return;if(c.width!==Math.round(r.width*d)){c.width=r.width*d;c.height=r.height*d}
const x=c.getContext('2d'),w=c.width,h=c.height,B=36;x.clearRect(0,0,w,h);let data=null;if(A.ctx&&A.mode){data=new Uint8Array(A.g.an.frequencyBinCount);A.g.an.getByteFrequencyData(data)}
const gd=x.createLinearGradient(0,h,0,0);gd.addColorStop(0,cvar('--g2'));gd.addColorStop(1,cvar('--g1'));x.fillStyle=gd;const t=performance.now()/1000;
for(let i=0;i<B;i++){const k0=Math.pow(i/B,2.1)*180+2,k1=Math.pow((i+1)/B,2.1)*180+2;let v=0;if(data){let m=0,n=0;for(let k=Math.floor(k0);k<=Math.ceil(k1)&&k<data.length;k++){m+=data[k];n++}v=n?m/n/255:0}else v=.05+.03*Math.sin(t*2+i*.6);const bh=Math.max(3*d,v*h*.95),bw=w/B;x.globalAlpha=.9;x.beginPath();x.roundRect?x.roundRect(i*bw+2*d,h-bh,bw-4*d,bh,3*d):x.rect(i*bw+2*d,h-bh,bw-4*d,bh);x.fill()}x.globalAlpha=1}
/* ---------- HOME ---------- */
function renderStatus(){const s=$('#strip');if(!s)return;const on=connected(),net=navigator.onLine!==false;
s.className='strip'+(on?'':' off');
s.innerHTML=`<span class="led ${on?'on':''}"></span><b>${on?'Buds connected':'Buds not connected'}</b>${on?`<span class="mut">L ${Math.round(S.bat.L)}% · R ${Math.round(S.bat.R)}%</span>`:'<span class="mut">Tap to reconnect</span>'}<span class="sp"></span><span class="net ${net?'':'offline'}">${net?'Online':'Offline mode'}</span>`}
function renderHome(){const el=$('#tab-home');if(!el||!S.user)return;const unread=S.alerts.some(a=>!a.read),on=connected(),rate=chargeRate();
el.style.setProperty('--aura',sunF().toFixed(2));
el.innerHTML=`<header class="top"><div><div class="mut">${greet()},</div><div class="h1" style="font-size:1.6em">${esc(S.user.name.split(' ')[0])}</div></div><button class="icbtn" data-act="open" data-v="alerts" aria-label="Alerts">${ic('bell')}${unread?'<i class="dot"></i>':''}</button></header>
<div class="body">
<button class="card connc ${on?'':'off'}" data-act="stripTap" style="width:100%;text-align:left;margin-bottom:12px"><div class="row"><span class="led big ${on?'on':''}"></span><span class="sp"><b>${on?'Hearing aids connected':'Hearing aids not connected'}</b><div class="mut" style="font-size:.84em">${on?esc(S.dev.name)+(S.dev.real?' · Bluetooth':S.dev.sys?' · phone Bluetooth audio · battery estimated':' · demo mode'):'Tap to reconnect'}</div></span><span class="mut">${ic('bt',20)}</span></div></button>
${ring(avgBat(),'Battery Level')}
<div class="row" style="justify-content:center;margin:16px 0 4px;gap:8px">${ic('sun',18)}<span>Solar Charging <b class="${rate>0?'ok':'mut'}">${rate>0?'Active':'Idle'}</b></span><span class="mut">· ${rate>=0?'+':''}${rate.toFixed(1)}%/h</span></div>
<div class="buds"><div class="budc">${bud('L',92)}<span class="row" style="gap:6px"><i class="led ${on?'on':''}"></i><b>Left ${Math.round(S.bat.L)}%</b></span></div>
<button class="btpill ${on?'':'off'}" data-act="conn"><span class="c">${ic('bt',22)}</span>${on?'Connected':'Connect'}</button>
<div class="budc">${bud('R',92)}<span class="row" style="gap:6px"><i class="led ${on?'on':''}"></i><b>Right ${Math.round(S.bat.R)}%</b></span></div></div>
<button class="tile gold" data-act="open" data-v="caps" style="width:100%;margin-top:18px;flex-direction:row;align-items:center"><span class="ico">${ic('chat')}</span><span class="sp"><b>Live Transcriber</b><small>Hear it through your buds. Read it on screen.</small></span>${ic('chev')}</button>
<div class="g2" style="margin-top:12px"><button class="tile" data-act="tab" data-v="tune"><span class="ico">${ic('tune')}</span><b>SoundTune</b><small>Volume and modes</small></button>
<button class="tile" data-act="open" data-v="hearing"><span class="ico">${ic('ear')}</span><b>My Hearing</b><small>Status and HearPrint</small></button></div>
<button class="tile" data-act="tab" data-v="find" style="width:100%;margin-top:12px;flex-direction:row;align-items:center"><span class="ico">${ic('find')}</span><span class="sp"><b>Find My Device</b><small>${S.lost?'Lost mode is on':'Ring, map and sound guidance'}</small></span>${ic('chev')}</button></div>`;
renderStatus()}
/* ---------- TUNE ---------- */
function renderTune(){const el=$('#tab-tune');
const R=80,C=2*Math.PI*R;el.innerHTML=`<header class="top"><span class="t">SoundTune</span><button class="icbtn" data-act="open" data-v="personal" aria-label="Personalisation">${ic('gear')}</button></header>
<div class="body"><div class="row" style="gap:8px;margin-bottom:10px" id="modeChips"></div>
<div class="row" style="justify-content:center;gap:10px;margin:8px 0"><button class="icbtn" data-act="volm" aria-label="Volume down">${ic('minus')}</button>
<div class="dial" id="dial"><svg viewBox="0 0 200 200"><circle class="tr" cx="100" cy="100" r="${R}" stroke-dasharray="${C*.75} ${C}" transform="rotate(135 100 100)"/><circle class="pr" id="dpr" cx="100" cy="100" r="${R}" stroke-dasharray="0 ${C}" transform="rotate(135 100 100)"/><circle class="kn" id="dkn" r="9" cx="100" cy="20"/></svg>
<div class="mid">${ic('wave',26)}<div class="lbl">Volume</div><div class="pct"><b id="volN">${S.vol}</b><small>%</small></div></div></div>
<button class="icbtn" data-act="volp" aria-label="Volume up">${ic('plus')}</button></div>
<input class="rng" type="range" min="0" max="100" id="volR" value="${S.vol}" aria-label="Volume">
<div class="card" style="margin-top:16px"><div class="row"><span class="sp"><b>Live Assist</b><div class="mut" style="font-size:.84em" id="liveSub"></div></span><label class="sw"><input type="checkbox" id="liveSw" data-in="live"><i></i></label></div>
<canvas class="spec" id="spec" style="margin-top:12px"></canvas>
<div class="row" style="margin-top:12px;flex-wrap:wrap"><span class="scene" id="sceneChip"><i></i><span id="sceneTxt">Idle</span></span><span class="sp"></span><button class="chip" data-act="preview" id="prevBtn">${ic('play',14)} Preview sound</button></div></div>
<button class="tile gold" data-act="open" data-v="caps" style="width:100%;margin-top:14px;flex-direction:row;align-items:center"><span class="ico">${ic('chat')}</span><span class="sp"><b>Live Transcriber</b><small>Read what is being said, in real time</small></span>${ic('chev')}</button>
<div class="cap" style="margin:20px 0 6px">Listening modes</div><div class="card list" style="padding:6px" id="modeList"></div>
<div class="cap" style="margin:20px 0 6px">Advanced</div><div class="card list" style="padding:6px 16px" id="advList"></div></div>`;
const dial=$('#dial');let drag=false;const setFromPt=e=>{const r=dial.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);let a=Math.atan2(dx,-dy)*180/Math.PI;if(a>135||a<-135){a=a>0?135:-135}setVol((a+135)/270*100)};
dial.addEventListener('pointerdown',e=>{drag=true;dial.setPointerCapture(e.pointerId);setFromPt(e)});dial.addEventListener('pointermove',e=>{if(drag)setFromPt(e)});dial.addEventListener('pointerup',()=>drag=false);dial.addEventListener('pointercancel',()=>drag=false);
$('#volR').addEventListener('input',e=>setVol(+e.target.value));renderTuneState()}
function setVol(v){S.vol=Math.round(clamp(v,0,100));applyDSP();save();paintVol()}
function paintVol(){const R=80,C=2*Math.PI*R;const p=$('#dpr'),k=$('#dkn');if(!p)return;p.setAttribute('stroke-dasharray',`${C*.75*S.vol/100} ${C}`);const a=(-135+270*S.vol/100)*Math.PI/180;k.setAttribute('cx',100+R*Math.sin(a));k.setAttribute('cy',100-R*Math.cos(a));$('#volN').textContent=S.vol;const r=$('#volR');if(r&&+r.value!==S.vol)r.value=S.vol}
const MODES=[['normal','General','Everyday listening','ear'],['conversation','Conversation','Clearer speech, less background','chat'],['noisy','Noise Reduction','For busy environments','shield']];
function renderTuneState(){if(!$('#modeChips'))return;$('#modeChips').innerHTML=MODES.map(m=>`<button class="chip ${S.mode===m[0]?'on':''}" data-act="mode" data-v="${m[0]}">${m[1].split(' ')[0]}</button>`).join('');
$('#modeList').innerHTML=MODES.map(m=>`<button class="mrow ${S.mode===m[0]?'on':''}" data-act="mode" data-v="${m[0]}"><span class="ico li" style="padding:0;width:auto"><span class="ico">${ic(m[3])}</span></span><span><b style="font-weight:500">${m[1]}</b><small class="mut" style="display:block;font-size:.82em">${m[2]}</small></span><i class="rad"></i></button>`).join('');
const adv=[['nr','Noise reduction','Softens steady background hiss'],['wind','Wind reduction','Cuts low rumble from gusts'],['dir','Directional focus','Narrows toward voices in front'],['auto','Auto scene mode','Switch modes as the room changes']];
$('#advList').innerHTML=adv.map(a=>`<div class="li"><span class="sp"><b>${a[1]}</b><small>${a[2]}</small></span><label class="sw"><input type="checkbox" data-in="${a[0]}" ${S[a[0]]?'checked':''}><i></i></label></div>`).join('');
const live=A.mode==='live',dem=A.mode==='demo';const sw=$('#liveSw');if(sw)sw.checked=live;$('#liveSub').textContent=live?'Mic is feeding your buds through your settings':dem?'Playing the demo soundscape':connected()?'Hear the room through your tuned profile':'Connect your buds to start';
$('#prevBtn').innerHTML=dem?'Stop preview':`${ic('play',14)} Preview sound`;
const sc=$('#sceneChip');sc.classList.toggle('live',!!A.mode);$('#sceneTxt').textContent=A.mode?{quiet:'Quiet room',speech:'Speech detected',noisy:'Noisy place'}[scene]:'Idle';paintVol()}
/* ---------- FIND ---------- */
const F={dist:{L:3.2,R:4.1},bear:{L:38,R:82},head:0,tgt:'B',ringT:0,ringOn:false,guideOn:false,guideT:0,scan:false,t0:performance.now(),orient:false,rad:25};
const pathRssi=d=>-59-20*Math.log10(Math.max(d,.3));
function rssiNow(){return BT.rssi!==null&&Date.now()-BT.rssiT<9000?BT.rssi:null}
function distOf(k){const r=rssiNow();if(r!==null&&S.dev&&S.dev.real)return Math.pow(10,(-59-r)/20);return F.dist[k]}
const sigPct=d=>clamp((pathRssi(d)+95)/55*100,0,100);
function renderFind(){const el=$('#tab-find');el.innerHTML=`<header class="top"><span class="t">Find My Device</span><span class="badge" id="fBadge">Demo signal</span></header>
<div class="body"><div class="radar" id="radar"><canvas id="radarCv"></canvas></div>
<div class="row" style="justify-content:center;gap:14px;margin:6px 0 4px"><div style="text-align:center"><div class="pct" style="font-size:2.3em"><b id="fDist">3.2</b><small> m</small></div><div class="mut" id="fSub" style="font-size:.85em">Strong signal</div></div><div class="sig" id="fSig"><i style="height:30%"></i><i style="height:50%"></i><i style="height:70%"></i><i style="height:100%"></i></div></div>
<div class="row" style="justify-content:center;gap:8px;margin:10px 0" id="tgtChips"></div>
<div class="g2"><button class="btn gold pulsebtn" data-act="ring" id="ringBtn">${ic('vol',18)} Play sound</button><button class="btn pulsebtn" data-act="guide" id="guideBtn">${ic('nav',18)} Guide me</button></div>
<div class="mut" style="font-size:.82em;text-align:center;margin:8px 4px 0" id="fHint"></div>
<div class="card" style="margin-top:16px" id="simCard"><div class="row"><span class="cap sp">Simulated distance</span><b id="simV">3 m</b></div><input class="rng" type="range" min="0.4" max="25" step="0.1" id="simR" value="3.2" aria-label="Simulated distance"><div class="mut" style="font-size:.8em;margin-top:4px">No live Bluetooth signal here, so drag to move the buds. Turn the phone or drag the radar to look around.</div></div>
<div class="card" style="margin-top:12px"><div class="row"><span class="ico li" style="padding:0;width:auto"><span class="ico">${ic('pin')}</span></span><span class="sp"><b>Last seen</b><div class="mut" style="font-size:.85em" id="lastTxt"></div></span></div>
<div class="row" style="margin-top:12px;gap:8px"><button class="btn sm" data-act="locNow">Update location</button><a class="btn sm" id="mapLink" target="_blank" rel="noopener" style="text-decoration:none;color:inherit" hidden>Open in Maps</a></div>
<textarea id="noteIn" rows="2" placeholder="Note to yourself, e.g. left on the kitchen table" style="margin-top:12px">${esc(S.note)}</textarea></div>
<div class="card list" style="margin-top:12px;padding:6px 16px"><div class="li"><span class="sp"><b>Lost mode</b><small>Alert me the moment they reconnect</small></span><label class="sw"><input type="checkbox" data-in="lost" ${S.lost?'checked':''}><i></i></label></div>
<div class="li"><span class="sp"><b>Left-behind alert</b><small>Warn me when I walk away from a bud</small></span><label class="sw"><input type="checkbox" data-in="sep" ${S.sep?'checked':''}><i></i></label></div></div>
<input class="fld2" id="lostMsg" placeholder="Message for whoever finds them (optional)" value="${esc(S.lostMsg)}" style="margin-top:12px;height:3.2em"></div>`;
const rd=$('#radar');let dr=false,lx=0;rd.addEventListener('pointerdown',e=>{dr=true;lx=e.clientX;rd.setPointerCapture(e.pointerId)});rd.addEventListener('pointermove',e=>{if(dr){F.head=(F.head+(e.clientX-lx)*.6+360)%360;lx=e.clientX}});rd.addEventListener('pointerup',()=>dr=false);rd.addEventListener('pointercancel',()=>dr=false);
$('#simR').addEventListener('input',e=>{const v=+e.target.value;if(F.tgt==='B'){F.dist.L=v;F.dist.R=v*1.25}else F.dist[F.tgt]=v;});
$('#noteIn').addEventListener('input',e=>{S.note=e.target.value;save()});$('#lostMsg').addEventListener('input',e=>{S.lostMsg=e.target.value;save()});syncFind()}
function syncFind(){if(!$('#fBadge'))return;const live=rssiNow()!==null&&S.dev&&S.dev.real,on=connected();$('#fBadge').textContent=live?'Live Bluetooth':on?'Demo signal':'Offline';$('#fBadge').classList.toggle('live',!!live);$('#simCard').hidden=!!live||!on;
$('#tgtChips').innerHTML=[['L','Left bud'],['R','Right bud'],['B','Both']].map(a=>`<button class="chip ${F.tgt===a[0]?'on':''}" data-act="tgt" data-v="${a[0]}">${a[1]}</button>`).join('');
$('#fHint').textContent=on?'Play sound rings your buds. Guide me beeps left or right as you turn toward them.':'Buds are out of range. Showing the last known spot. Reconnect to ring or guide.';
$('#ringBtn').classList.toggle('act',F.ringOn);$('#ringBtn').lastChild.textContent=F.ringOn?' Stop sound':' Play sound';$('#guideBtn').classList.toggle('act',F.guideOn);$('#guideBtn').lastChild.textContent=F.guideOn?' Stop guiding':' Guide me';
const l=S.last;$('#lastTxt').textContent=l?`${fmtT(l.t)}${l.lat!=null?` · ${l.lat.toFixed(4)}, ${l.lon.toFixed(4)} (±${Math.round(l.acc)} m)`:' · location not shared'}`:'Not recorded yet. Tap Update location.';
const ml=$('#mapLink');if(l&&l.lat!=null){ml.hidden=false;ml.href=`https://www.google.com/maps?q=${l.lat},${l.lon}`}else ml.hidden=true;
const ds=F.tgt==='B'?Math.min(distOf('L'),distOf('R')):distOf(F.tgt);if(on){$('#fDist').textContent=ds<10?ds.toFixed(1):Math.round(ds);const sp=sigPct(ds);$('#fSub').textContent=sp>66?'Strong signal':sp>33?'Fair signal':'Weak signal';$$('#fSig i').forEach((b,i)=>b.classList.toggle('on',sp>i*25+8))}else{$('#fDist').textContent='--';$('#fSub').textContent='No signal';$$('#fSig i').forEach(b=>b.classList.remove('on'))}}
function nearestBud(){const ks=F.tgt==='B'?['L','R']:[F.tgt];return ks.reduce((a,k)=>distOf(k)<distOf(a)?k:a,ks[0])}
function drawRadar(ts){const c=$('#radarCv');if(!c)return;const d=Math.min(devicePixelRatio||1,2),r=c.getBoundingClientRect();if(!r.width)return;if(c.width!==Math.round(r.width*d)){c.width=r.width*d;c.height=r.height*d}
const x=c.getContext('2d'),w=c.width,h=c.height,cx0=w/2,cy0=h/2,Rr=w*.46,t=ts/1000,on=connected();x.clearRect(0,0,w,h);
const col=getComputedStyle(root).getPropertyValue('--gold').trim()||'#E2AE45',line=getComputedStyle(root).getPropertyValue('--line').trim();
x.lineWidth=1.2*d;[.25,.5,.75,1].forEach((k,i)=>{x.strokeStyle=line;x.beginPath();x.arc(cx0,cy0,Rr*k,0,7);x.stroke()});x.strokeStyle=line;x.beginPath();x.moveTo(cx0-Rr,cy0);x.lineTo(cx0+Rr,cy0);x.moveTo(cx0,cy0-Rr);x.lineTo(cx0,cy0+Rr);x.stroke();
x.fillStyle=getComputedStyle(root).getPropertyValue('--mut').trim();x.font=`${10*d}px Jost,sans-serif`;x.textAlign='left';[5,10,15,20].forEach((m,i)=>x.fillText(m+'m',cx0+4*d,cy0-Rr*(m/F.rad)*1-3*d+ (m===20?10*d:0)));
const sw=t*1.5%(Math.PI*2);if(on){if(x.createConicGradient){const gr=x.createConicGradient(sw-Math.PI/2-1.1,cx0,cy0);gr.addColorStop(0,`rgba(${cvar('--glow')},0)`);gr.addColorStop(.17,`rgba(${cvar('--glow')},.32)`);gr.addColorStop(.175,`rgba(${cvar('--glow')},0)`);gr.addColorStop(1,`rgba(${cvar('--glow')},0)`);x.fillStyle=gr;x.beginPath();x.arc(cx0,cy0,Rr,0,7);x.fill()}x.strokeStyle=col;x.lineWidth=2*d;x.beginPath();x.moveTo(cx0,cy0);x.lineTo(cx0+Math.sin(sw)*Rr,cy0-Math.cos(sw)*Rr);x.stroke()}
/* buds */
['L','R'].forEach(k=>{if(F.tgt!=='B'&&F.tgt!==k)x.globalAlpha=.35;const dd=distOf(k),rel=(F.bear[k]-F.head)*Math.PI/180,rr=Math.min(dd/F.rad,1)*Rr,bx=cx0+Math.sin(rel)*rr,by=cy0-Math.cos(rel)*rr;
const pu=(t*1.2+(k==='R'?.5:0))%1;x.strokeStyle=on?col:line;x.globalAlpha*=on?1:.6;x.lineWidth=1.5*d;x.beginPath();x.arc(bx,by,(8+pu*18)*d,0,7);x.globalAlpha*=(1-pu);x.stroke();x.globalAlpha=(F.tgt!=='B'&&F.tgt!==k)?.35:1;
x.fillStyle=k==='L'?getComputedStyle(root).getPropertyValue('--L').trim():getComputedStyle(root).getPropertyValue('--R').trim();if(!on)x.globalAlpha*=.5;x.beginPath();x.arc(bx,by,8*d,0,7);x.fill();x.fillStyle='#fff';x.font=`600 ${9*d}px Jost,sans-serif`;x.textAlign='center';x.fillText(k,bx,by+3.2*d);x.globalAlpha=1});
/* you + heading */
x.fillStyle=col;x.beginPath();x.arc(cx0,cy0,5*d,0,7);x.fill();x.beginPath();x.moveTo(cx0,cy0-Rr-2*d);x.lineTo(cx0-7*d,cy0-Rr+12*d);x.lineTo(cx0+7*d,cy0-Rr+12*d);x.closePath();x.fill();
x.fillStyle=getComputedStyle(root).getPropertyValue('--mut').trim();x.textAlign='center';x.fillText(Math.round(F.head)+'°',cx0,cy0+Rr+14*d)}
function simStep(dt){if(!connected())return;if(rssiNow()===null){['L','R'].forEach(k=>{F.dist[k]=clamp(F.dist[k]+(Math.random()-.5)*.03,.3,25)})}
const ds=Math.min(distOf('L'),distOf('R'));if(S.sep&&ds>12&&!S.flags.sep){S.flags.sep=true;addAlert('find','Did you leave a bud behind?','Your buds are more than 12 m away.')}if(ds<8)S.flags.sep=false}
async function captureLoc(auto){const note=r=>{S.last=r;save();syncFind()};if(!navigator.geolocation){note({t:Date.now(),lat:null});if(!auto)toast('Location is not available on this device.');return}
if(!auto)toast('Finding your location…');return new Promise(res=>{navigator.geolocation.getCurrentPosition(p=>{note({t:Date.now(),lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy});if(!auto)toast('Last seen location saved.');res()},()=>{note({t:Date.now(),lat:null});if(!auto)toast('Location is blocked here. Add a note instead.');res()},{enableHighAccuracy:true,timeout:9000,maximumAge:30000})})}
/* ring */
function ringStart(){if(!connected()){toast('Reconnect your buds first.');return}try{aud()}catch(e){toast('Audio is not available.');return}F.ringOn=true;F.ringT0=Date.now();vib([200,100,200]);const pan=F.tgt==='L'?-1:F.tgt==='R'?1:0;
const loop=()=>{if(!F.ringOn)return;const el=(Date.now()-F.ringT0)/1000;if(el>60){stopRing();return}const v=clamp(.08+el/30*.5,.08,.6);beep(2200,.16,v,pan,'sine');setTimeout(()=>beep(2900,.16,v,pan,'sine'),200);F.ringT=setTimeout(loop,900)};loop();syncFind()}
function stopRing(){F.ringOn=false;clearTimeout(F.ringT);syncFind()}
/* SonicTrail guide */
async function guideStart(){if(!connected()){toast('Reconnect your buds first.');return}try{aud()}catch(e){toast('Audio is not available.');return}
if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'){try{const r=await DeviceOrientationEvent.requestPermission();if(r==='granted')listenOrient()}catch(e){}}else listenOrient();
F.guideOn=true;toast(F.orient?'Walk and turn. Beeps pan toward your bud.':'Drag the radar to turn. Beeps pan toward your bud.');guideLoop();syncFind()}
function listenOrient(){if(F._ol)return;F._ol=e=>{let hd=null;if(typeof e.webkitCompassHeading==='number')hd=e.webkitCompassHeading;else if(e.absolute&&e.alpha!=null)hd=360-e.alpha;if(hd!=null&&!isNaN(hd)){F.head=(hd+360)%360;F.orient=true}};addEventListener('deviceorientationabsolute',F._ol);addEventListener('deviceorientation',F._ol)}
function guideLoop(){if(!F.guideOn)return;const k=nearestBud(),d=distOf(k),rel=((F.bear[k]-F.head)%360+540)%360-180,pan=clamp(Math.sin(rel*Math.PI/180)*1.1,-1,1),near=clamp(1-d/F.rad,0,1);
const front=Math.abs(rel)<90;beep(front?500+near*900:260,.11,.35,pan,front?'sine':'triangle');if(!front)setTimeout(()=>beep(220,.08,.3,pan,'triangle'),130);if(Math.abs(rel)<18)vib(25);
if(d<.8){toast('You are right on it.');vib([80,60,80,60,200]);stopGuide();return}F.guideT=setTimeout(guideLoop,lerp(160,1100,1-near)+(front?0:350))}
function stopGuide(){F.guideOn=false;clearTimeout(F.guideT);syncFind()}
/* ---------- SOLAR ---------- */
const SUN={auto:['Auto','sun'],sun:['Outdoor sun','sun'],cloud:['Cloudy','shield'],win:['By a window','home'],dark:['Indoors / dark','moon']};
function srcKey(){if(S.sunSrc!=='auto')return S.sunSrc;return sunF()>.2?'sun':'dark'}
function chargeRate(){const f=sunF(),k=srcKey();let r={sun:20*Math.max(f,.35),cloud:8*Math.max(f,.3),win:4*Math.max(f,.3),dark:0}[k];if(S.backup)r+=45;if(connected()&&A.mode)r-=6;else r-=(connected()?1.5:.3);return r}
function renderSolar(){const el=$('#tab-solar');const r=chargeRate(),hrs=Array.from({length:24},(_,h)=>sunF(h+.5)*20);const peak=Math.max(...hrs),good=hrs.map((v,h)=>v>=peak*.8?h:-1).filter(v=>v>=0);const win=good.length?`${String(good[0]).padStart(2,'0')}:00 to ${String(good[good.length-1]+1).padStart(2,'0')}:00`:'';
const days=['','','','','','',''].map((_,i)=>{const d=new Date(Date.now()-(6-i)*864e5);return d.toLocaleDateString([], {weekday:'narrow'})});const mx=Math.max(...S.hist,10);
const W=300,H=70,pts=hrs.map((v,h)=>`${(h/23*W).toFixed(1)},${(H-v/22*H).toFixed(1)}`).join(' L'),nowX=(hour()/24*W).toFixed(1);
const keep=(el.querySelector('.body')||{}).scrollTop||0;const sun=Math.round(sunF()*100),eta=fullETA(),wtxt=good.length?`${String(good[0]).padStart(2,'0')}-${String(good[good.length-1]+1).padStart(2,'0')}h`:'None';
el.innerHTML=`<header class="top"><button class="icbtn" style="visibility:hidden">${ic('back')}</button><span class="t">SolarCharge</span><button class="icbtn" data-act="open" data-v="solar" aria-label="Optimise charge">${ic('sun')}</button></header>
<div class="body">${ring(avgBat(),'Charge Level')}
<div class="sstats"><div><small>Sunlight now</small><b id="sSun">${sun}%</b></div><div><small>Time to full</small><b id="sFull">${eta}</b></div><div><small>Best window</small><b>${wtxt}</b></div></div>
<div class="card" style="margin-top:14px"><div class="row">${ic('sun',24)}<span class="sp"><b>Solar charging <span class="${r>0?'ok':'mut'}" id="solState">${r>0?'Active':'Idle'}</span></b><div class="mut" style="font-size:.84em">Net <span id="solRate">${r>=0?'+':''}${r.toFixed(1)}</span>%/h · demo speed ×60</div></span></div>
<div class="chipscroll">${Object.keys(SUN).map(k=>`<button class="chip ${S.sunSrc===k?'on':''}" data-act="srcsel" data-v="${k}">${SUN[k][0]}${k==='auto'?` · ${SUN[srcKey()][0].toLowerCase()}`:''}</button>`).join('')}</div></div>
<div class="card" style="margin-top:12px"><div class="row"><span class="h2 sp">Sun forecast</span><span class="mut" style="font-size:.82em">Peak around 12:00</span></div>
<svg viewBox="0 0 ${W} ${H+16}" width="100%" style="margin-top:8px;overflow:visible"><defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--gold)" stop-opacity=".55"/><stop offset="1" style="stop-color:var(--gold)" stop-opacity="0"/></linearGradient></defs><path d="M0,${H} L${pts} L${W},${H}Z" fill="url(#fg)"/><path d="M${pts}" fill="none" stroke="var(--g2)" stroke-width="2"/><line x1="${nowX}" x2="${nowX}" y1="0" y2="${H}" stroke="var(--fg)" stroke-dasharray="3 3" opacity=".5"/><circle cx="${nowX}" cy="${(H-sunF()*20/22*H).toFixed(1)}" r="4.5" style="fill:var(--gold)" stroke="var(--card)" stroke-width="2"/><g fill="var(--mut)" font-size="9" text-anchor="middle"><text x="0" y="${H+13}" text-anchor="start">00</text><text x="${W/4}" y="${H+13}">06</text><text x="${W/2}" y="${H+13}">12</text><text x="${W*.75}" y="${H+13}">18</text><text x="${W}" y="${H+13}" text-anchor="end">24</text></g></svg></div>
<div class="card" style="margin-top:12px"><div class="row"><span class="h2 sp">Charging history</span><span class="mut" style="font-size:.82em">Last 7 days</span></div><div class="bars" style="margin-top:12px">${S.hist.map((v,i)=>`<div class="${i===6?'today':''}"><b style="height:${v/mx*72}px"></b>${days[i]}</div>`).join('')}</div></div>
<div class="card" style="margin-top:12px"><div class="row"><span class="ico li" style="padding:0;width:auto"><span class="ico">${ic('bolt')}</span></span><span class="sp"><b>Backup charging</b><div class="mut" style="font-size:.84em">Use the USB-C charger when sunlight is not available</div></div><label class="sw"><input type="checkbox" data-in="backup" ${S.backup?'checked':''}><i></i></label></div></div></div>`;const nb=el.querySelector('.body');if(nb)nb.scrollTop=keep}
function fullETA(){const r=chargeRate(),p=avgBat();if(p>=99.5)return 'Full';if(r<=0.05)return '—';const m=Math.round((100-p)/r*60);return m>=60?Math.floor(m/60)+'h '+(m%60)+'m':m+'m'}
function updateSolarLive(){const s=$('#solRate');if(!s)return;const ss=$('#sSun'),sf=$('#sFull');if(ss)ss.textContent=Math.round(sunF()*100)+'%';if(sf)sf.textContent=fullETA();const r=chargeRate();s.textContent=(r>=0?'+':'')+r.toFixed(1);const st=$('#solState');st.textContent=r>0?'Active':'Idle';st.className=r>0?'ok':'mut'}
function renderSolarFull(){const o=$('#o-solar'),p=avgBat(),r=chargeRate();o.innerHTML=`<div class="top"><button class="icbtn" data-act="close" data-v="solar" style="background:#1a1713;border-color:#333;color:#F6EFDF" aria-label="Close">${ic('back')}</button><span class="head" style="letter-spacing:.34em">SOLVOX</span><span style="width:2.8em"></span></div>
<div class="body" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center"><div><div class="h1" style="font-size:1.5em">Solar Charging</div><div style="color:#cdbf9f;margin-top:6px">Optimising your charge<br>with natural light.</div></div>
<div class="solarbig"><div class="pct" style="color:#F6EFDF"><b data-fullpct>${Math.round(p)}</b><small>%</small></div></div><div style="color:var(--gold)">${ic('sun',30)}</div><div style="color:#cdbf9f;font-size:.9em">${r>0?`Gaining ${r.toFixed(1)}% every hour`:'Waiting for light'}</div>
<button class="btn" data-act="backupFull" style="border-color:var(--gold);color:#F6E7BE;max-width:300px">${S.backup?'Switch back to solar':'Switch to Backup Charging'}</button></div>`}
/* ---------- ME ---------- */
function renderMe(){const el=$('#tab-me');el.innerHTML=`<header class="top"><span class="t">Settings</span><span style="width:2.8em"></span></header><div class="body">
<div class="card row"><span class="ico" style="width:3.2em;height:3.2em;border-radius:50%;background:linear-gradient(135deg,var(--g1),var(--g2));color:var(--onGold);display:grid;place-items:center;font:600 1.3em var(--head)">${esc((S.user.name[0]||'S').toUpperCase())}</span><span class="sp"><b>${esc(S.user.name)}</b><div class="mut" style="font-size:.86em">${esc(S.user.email||'Guest session')}</div></span></div>
<div class="card list" style="margin-top:14px;padding:6px 16px">
<button class="li" data-act="open" data-v="personal"><span class="ico">${ic('sun')}</span><span class="sp"><b>Personalisation</b><small>Theme, text size, notifications</small></span>${ic('chev')}</button>
<button class="li" data-act="open" data-v="hearing"><span class="ico">${ic('ear')}</span><span class="sp"><b>My Hearing</b><small>HearPrint test and device status</small></span>${ic('chev')}</button>
<button class="li" data-act="open" data-v="alerts"><span class="ico">${ic('bell')}</span><span class="sp"><b>Alerts</b><small>${S.alerts.length} saved</small></span>${ic('chev')}</button>
<button class="li" data-act="open" data-v="help"><span class="ico">${ic('help')}</span><span class="sp"><b>Help and Support</b><small>FAQs, self-check, contact</small></span>${ic('chev')}</button></div>
<div class="card list" style="margin-top:14px;padding:6px 16px"><div class="li"><span class="ico">${ic('bt')}</span><span class="sp"><b>${esc(S.dev?S.dev.name:'No device')}</b><small>${S.dev&&S.dev.real?'Paired over Bluetooth':'Demo buds'}</small></span><button class="chip" data-act="unpair">Unpair</button></div></div>
<button class="btn" style="margin-top:18px" data-act="signout">${ic('out',18)} Sign out</button>
<button class="link" style="display:block;margin:18px auto 0;font-size:.88em" data-act="delacct">Delete my account and data</button>
<div class="mut" style="text-align:center;font-size:.78em;margin-top:22px;letter-spacing:.1em">SOLVOX COMPANION 1.0</div></div>`}
/* ---------- overlays ---------- */
const OH=(t,c)=>`<div class="top"><button class="icbtn" data-act="close" data-v="${c}" aria-label="Back">${ic('back')}</button><span class="t">${t}</span><span style="width:2.8em"></span></div>`;
function renderAlerts(){$('#o-alerts').innerHTML=OH('Alerts','alerts')+`<div class="body">${S.alerts.length?`<div class="card list" style="padding:6px 16px">${S.alerts.map(a=>`<div class="li"><span class="ico">${ic({battery:'bat',conn:'bt',find:'find',update:'shield'}[a.type]||'bell')}</span><span class="sp"><b>${esc(a.title)}</b><small>${esc(a.msg)} · ${fmtT(a.t)}</small></span></div>`).join('')}</div><button class="btn sm" style="margin-top:16px" data-act="clearAlerts">Clear all</button>`:`<div class="mut" style="text-align:center;padding:60px 20px">${ic('bell',36)}<p>No alerts yet. Battery, connection and find alerts show up here.</p></div>`}</div>`}
const LOOKS=[['gold','Solar Gold','#F5D06E','#D9A235'],['ocean','Ocean Pulse','#86E3EC','#1AA4B5'],['aurora','Aurora','#B9A0FF','#8D63F2'],['forest','Emerald','#8FE3B6','#36A877'],['rose','Rose Quartz','#FFA6BF','#E5648A'],['copper','Desert Copper','#F2B087','#CF7040'],['graphite','Graphite','#8A91A0','#3A3F4A']];
function renderPersonal(){const sw=(k,t,s,ico,g)=>`<div class="li"><span class="ico">${ic(ico)}</span><span class="sp"><b>${t}</b><small>${s}</small></span><label class="sw"><input type="checkbox" data-in="${g}" data-k="${k}" ${(g==='notif'?S.notif[k]:S[k])?'checked':''}><i></i></label></div>`;
$('#o-personal').innerHTML=OH('Personalisation','personal')+`<div class="body"><div class="cap" style="margin:6px 0">Theme</div><div class="g2">${[['light','Light','sun'],['dark','Dark','moon'],['auto','Match phone','gear']].slice(0,2).map(t=>`<button class="btn ${S.theme===t[0]?'gold':''}" data-act="theme" data-v="${t[0]}">${ic(t[2],18)} ${t[1]}</button>`).join('')}</div>
<button class="btn sm ${S.theme==='auto'?'gold':''}" style="margin-top:10px" data-act="theme" data-v="auto">Match my phone</button>
<div class="cap" style="margin:20px 0 8px">Colour look</div><div class="looks">${LOOKS.map(l=>`<button class="lk ${S.look===l[0]?'on':''}" data-act="lookSet" data-v="${l[0]}" aria-label="${l[1]}"><i style="background:linear-gradient(135deg,${l[2]},${l[3]})"></i><span>${l[1]}</span></button>`).join('')}</div>
<div class="cap" style="margin:20px 0 8px">Card style</div><div class="row" style="flex-wrap:wrap;gap:8px">${[['classic','Classic'],['glass','Glass'],['flat','Flat'],['soft','Soft']].map(c=>`<button class="chip ${S.card===c[0]?'on':''}" data-act="cardSet" data-v="${c[0]}">${c[1]}</button>`).join('')}</div>
<div class="cap" style="margin:20px 0 8px">Corners</div><div class="row" style="flex-wrap:wrap;gap:8px">${[['sharp','Sharp'],['soft','Soft'],['round','Round']].map(c=>`<button class="chip ${S.round===c[0]?'on':''}" data-act="roundSet" data-v="${c[0]}">${c[1]}</button>`).join('')}</div>
<div class="cap" style="margin:20px 0 6px">Accessibility</div><div class="card list" style="padding:6px 16px">${sw('hc','High contrast','Stronger text and borders','eye','hc')}${sw('calm','Calm motion','Turn off animations and effects','wave','calm')}</div>
<div class="cap" style="margin:20px 0 6px">Text size</div><div class="card"><div class="row"><span style="font-size:.8em">A</span><input class="rng sp" type="range" min=".9" max="1.3" step=".05" value="${S.ts}" data-in="ts" aria-label="Text size"><span style="font-size:1.3em">A</span></div></div>
<div class="cap" style="margin:20px 0 6px">Notifications</div><div class="card list" style="padding:6px 16px">${sw('battery','Battery alerts','Low and full battery','bat','notif')}${sw('conn','Device connection','Connected and disconnected','bt','notif')}${sw('update','System updates','New features and fixes','shield','notif')}${sw('push','Phone notifications','Also alert outside the app','bell','push')}${sw('haptics','Haptics','Vibrate on key actions','wave','haptics')}</div></div>`}
const FAQ=[['How does solar charging work?','Light on the solar cells tops up the battery. The app estimates the rate from the sun position and the light source you choose. The USB-C backup adds a fast charge.'],['How does the Live Transcriber work?','It listens through your phone microphone, turns speech into text on screen and, if you like, plays the sound through your buds at the same time. Turn on Prefer on-device to keep working without internet where your browser supports it.'],['Why can I not hear Live Assist?','Open SoundTune, switch Live Assist on and allow the microphone. Use earbuds. If the mic is blocked, the app plays a demo soundscape so you can still try every control.'],['How do I find a missing bud?','Open Find My Device. Play sound rings both buds. Guide me beeps toward the nearest bud and pans left or right as you turn. Last seen shows the saved spot and a map link.'],['What is HearPrint?','A short tone test for each ear. It measures the quietest level you notice at five pitches, then shapes the sound to match. It is a screening aid, not a medical test.'],['Where is my data stored?','Only on this device. Sign out keeps your account. Delete removes it.']];
function renderHelp(){$('#o-help').innerHTML=OH('Help and Support','help')+`<div class="body"><div class="cap" style="margin:6px 0">Self-check</div><div class="card"><button class="btn gold sm" data-act="selfcheck">Run device self-check</button><ul class="res" id="checkRes" style="margin-top:8px"></ul></div>
<div class="cap" style="margin:20px 0 6px">FAQs</div><div class="card list" style="padding:0 16px">${FAQ.map(f=>`<button class="faq" data-act="faq"><div class="row"><b style="font-weight:500">${f[0]}</b>${ic('chev',18).replace('class="ic"','class="ic ch"')}</div><div class="a">${f[1]}</div></button>`).join('')}</div>
<div class="cap" style="margin:20px 0 6px">Contact us</div><div class="card"><div class="row"><span class="sp"><b>support@solvox.example</b><div class="mut" style="font-size:.84em">Sample address for this demo</div></span><button class="chip" data-act="copy" data-v="support@solvox.example">${ic('copy',14)} Copy</button></div></div></div>`}
async function selfCheck(){const out=$('#checkRes');out.innerHTML='';const row=(ok,t,h)=>out.insertAdjacentHTML('beforeend',`<li><span class="${ok?'ok':'bad'}">${ic(ok?'check':'x',18)}</span><span><b style="font-weight:500">${t}</b><small class="mut" style="display:block;font-size:.8em">${h}</small></span></li>`);
let ok=!!(window.AudioContext||window.webkitAudioContext);row(ok,'Audio engine',ok?'Ready':'Not supported');
let mic=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);let ms='';try{if(navigator.permissions){const p=await navigator.permissions.query({name:'microphone'});ms=p.state}}catch(e){}row(mic&&ms!=='denied','Microphone',mic?(ms?'Permission: '+ms:'Available'):'Not available here');
row(!!navigator.bluetooth,'Bluetooth pairing',navigator.bluetooth?'Web Bluetooth available':'Not available here. Demo buds work.');
row(!!navigator.geolocation,'Location',navigator.geolocation?'Available for Last seen':'Not available');
row('Notification'in window,'Notifications','Notification'in window?'Permission: '+Notification.permission:'Not supported');
row(!!navigator.vibrate,'Haptics',navigator.vibrate?'Vibration supported':'No vibration motor or blocked');
row(!!(window.SpeechRecognition||window.webkitSpeechRecognition),'Live captions',(window.SpeechRecognition||window.webkitSpeechRecognition)?'Speech recognition available':'Not supported in this browser');
row('DeviceOrientationEvent'in window,'Motion sensors','DeviceOrientationEvent'in window?'Compass guidance available':'Drag the radar to turn');
let sOK=false;try{localStorage.setItem('t','1');localStorage.removeItem('t');sOK=true}catch(e){}row(sOK,'Storage',sOK?'Settings are saved':'Settings will not persist')}
/* hearing + test */
const FQ=[500,1000,2000,4000,8000];
function renderHearing(){const u=S.usage+Math.floor((Date.now()-bootT)/60000),h=Math.floor(u/60),m=u%60;const o=$('#o-hearing');
o.innerHTML=OH('My Hearing','hearing')+`<div class="body"><div class="card"><div class="row"><span class="h2 sp">Device status</span><span style="font-size:.85em"><span class="dotok ${connected()?'':'off'}"></span>${connected()?'Connected':'Offline'}</span></div>
<div class="g2" style="margin-top:12px;text-align:center"><div>${bud('L',100)}<div class="row" style="justify-content:center;gap:6px"><i class="led ${connected()?'on':''}"></i><b>Left</b></div><div class="mut">${Math.round(S.bat.L)}%</div></div><div>${bud('R',100)}<div class="row" style="justify-content:center;gap:6px"><i class="led ${connected()?'on':''}"></i><b>Right</b></div><div class="mut">${Math.round(S.bat.R)}%</div></div></div></div>
<div class="card list" style="margin-top:12px;padding:6px 16px"><div class="li"><span class="ico">${ic('wave')}</span><span class="sp"><b>Usage today</b><small>${h}h ${m}m</small></span></div><button class="li" data-act="tab2" data-v="solar"><span class="ico">${ic('bolt')}</span><span class="sp"><b>Charging history</b><small>View details</small></span>${ic('chev')}</button></div>
<div class="card" style="margin-top:12px"><div class="row"><span class="h2 sp">HearPrint</span>${S.hear?`<span class="badge live">Active</span>`:'<span class="badge">Not set</span>'}</div>
${S.hear?`<canvas id="audio" style="width:100%;height:170px;margin-top:10px"></canvas><div class="row" style="gap:14px;font-size:.82em;margin-top:2px"><span><span style="color:var(--L)">●</span> Left</span><span><span style="color:var(--R)">●</span> Right</span><span class="sp"></span><span class="mut">${fmtT(S.hear.t)}</span></div><p style="margin:10px 0 0" id="hpSum"></p>`:`<p class="mut" style="margin:8px 0 0">Take a two minute tone test for each ear. SolVox then shapes the sound to match.</p>`}
<button class="btn gold" style="margin-top:14px" data-act="open" data-v="test">${S.hear?'Retake test':'Start HearPrint test'}</button>${S.hear?`<button class="link" style="display:block;margin:12px auto 0" data-act="resetHear">Remove HearPrint</button>`:''}</div></div>`;
if(S.hear)setTimeout(()=>{drawAudiogram();const a=(S.hear.L.concat(S.hear.R)).reduce((x,y)=>x+y,0)/10;$('#hpSum').textContent=(a<15?'Your responses fall in a typical range.':a<30?'You needed a little more volume at some pitches. SolVox is lifting those bands.':'You needed noticeably more volume at some pitches. SolVox is lifting those bands. Consider a clinical hearing test.')+' This is a screening aid, not a medical result.'},60)}
function drawAudiogram(){const c=$('#audio');if(!c||!S.hear)return;const d=Math.min(devicePixelRatio||1,2),r=c.getBoundingClientRect();c.width=r.width*d;c.height=r.height*d;const x=c.getContext('2d'),w=c.width,h=c.height,pl=34*d,pr=12*d,pt=12*d,pb=24*d,gw=w-pl-pr,gh=h-pt-pb;const line=getComputedStyle(root).getPropertyValue('--line').trim(),mut=getComputedStyle(root).getPropertyValue('--mut').trim();
x.font=`${10*d}px Jost,sans-serif`;x.fillStyle=mut;x.strokeStyle=line;x.lineWidth=d;for(let v=0;v<=60;v+=20){const y=pt+v/60*gh;x.beginPath();x.moveTo(pl,y);x.lineTo(w-pr,y);x.stroke();x.textAlign='right';x.fillText(v,pl-6*d,y+3*d)}
FQ.forEach((f,i)=>{const px=pl+i/4*gw;x.beginPath();x.moveTo(px,pt);x.lineTo(px,pt+gh);x.stroke();x.textAlign='center';x.fillText(f>=1000?f/1000+'k':f,px,h-8*d)});
[['L',getComputedStyle(root).getPropertyValue('--L').trim()],['R',getComputedStyle(root).getPropertyValue('--R').trim()]].forEach(([k,col])=>{x.strokeStyle=col;x.fillStyle=col;x.lineWidth=2.2*d;x.beginPath();S.hear[k].forEach((v,i)=>{const px=pl+i/4*gw,py=pt+clamp(v,0,60)/60*gh;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();S.hear[k].forEach((v,i)=>{x.beginPath();x.arc(pl+i/4*gw,pt+clamp(v,0,60)/60*gh,4*d,0,7);x.fill()})})}
const T={step:0,res:{L:[],R:[]},osc:null,gn:null,lvl:-72,iv:0,t0:0,on:false};
const db2g=db=>Math.pow(10,db/20);
function renderTestIntro(){abortTest(true);$('#o-test').innerHTML=OH('HearPrint test','test')+`<div class="body" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center"><div class="art" style="width:200px;height:200px">${ic('ear',64)}</div><h2 class="h1">Find your<br>quietest sounds</h2><p class="mut" style="max-width:30ch;margin:0">Wear your earbuds in a quiet room. A soft tone slowly gets louder in one ear at a time. Tap as soon as you hear it.</p><button class="btn gold" data-act="testStart" style="max-width:320px">I am ready</button></div>`}
function testUI(){const ear=T.step<5?'L':'R',f=FQ[T.step%5];$('#o-test').innerHTML=OH('HearPrint test','test')+`<div class="body" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center"><div class="cap">${T.step+1} of 10</div><div class="h1" style="font-size:1.6em">${ear==='L'?'Left':'Right'} ear · ${f>=1000?f/1000+' kHz':f+' Hz'}</div><div style="width:80%" class="lvl"><i id="lvlBar"></i></div><button class="testbtn" data-act="testHeard" id="heardBtn">I HEAR IT</button><p class="mut" style="margin:0;max-width:28ch">Tap the moment a tone starts. If you hear nothing, wait. It moves on by itself.</p></div>`}
function startTest(){try{aud()}catch(e){toast('Audio is not available here.');return}srcStop();renderTuneState();T.step=0;T.res={L:[],R:[]};T.on=true;nextTrial()}
function nextTrial(){if(!T.on)return;if(T.step>=10){return finishTest()}const ear=T.step<5?'L':'R',f=FQ[T.step%5],c=A.ctx;testUI();T.lvl=-74;
const o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null;o.frequency.value=f;g.gain.value=0;o.connect(g);if(p){p.pan.value=ear==='L'?-1:1;g.connect(p);p.connect(c.destination)}else g.connect(c.destination);o.start();T.osc=o;T.gn=g;T.t0=performance.now();
T.iv=setInterval(()=>{T.lvl+=3;g.gain.setTargetAtTime(db2g(T.lvl),c.currentTime,.05);const b=$('#lvlBar');if(b)b.style.width=clamp((T.lvl+74)/62*100,0,100)+'%';if(T.lvl>=-12)record(T.lvl)},560)}
function record(l){clearInterval(T.iv);const ear=T.step<5?'L':'R';T.res[ear][T.step%5]=Math.round(clamp(l+72,0,60));try{T.gn.gain.setTargetAtTime(0,A.ctx.currentTime,.03);const o=T.osc;setTimeout(()=>{try{o.stop()}catch(e){}},150)}catch(e){}T.step++;vib(15);setTimeout(nextTrial,900)}
function heard(){if(!T.on)return;if(performance.now()-T.t0<1100||T.lvl<-70){toast('Wait for the tone, then tap.');return}record(T.lvl)}
function finishTest(){T.on=false;S.hear={L:T.res.L,R:T.res.R,t:Date.now()};applyProfile();save();closeO('test');renderHearing();toast('HearPrint saved and applied.')}
function abortTest(silent){if(!T.on&&!T.osc)return;clearInterval(T.iv);T.on=false;try{T.osc&&T.osc.stop()}catch(e){}T.osc=null}
/* live transcriber */
const CAP={rec:null,on:false,lines:[],int:'',size:1.3,lang:'en-US',local:true,hear:true,name:true,t0:0,iv:0,mode:'cloud',wl:null,startedLive:false,msg:''};
try{const sv=JSON.parse(localStorage.getItem('solvox.tr')||'null');if(sv){CAP.lines=sv.lines||[];CAP.lang=sv.lang||CAP.lang}}catch(e){}
const LANGS=[['en-US','English (US)'],['en-GB','English (UK)'],['en-IN','English (India)'],['ar-SA','العربية (السعودية)'],['ar-KW','العربية (الكويت)'],['hi-IN','हिन्दी'],['ta-IN','தமிழ்'],['es-ES','Español'],['fr-FR','Français']];
const SRC=()=>window.SpeechRecognition||window.webkitSpeechRecognition;
const nameRe=()=>{const n=((S.user&&S.user.name)||'').split(' ')[0];return n&&n.length>2&&n!=='Guest'?new RegExp('('+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'):null};
const hl=t=>{const h=esc(t),re=CAP.name&&nameRe();return re?h.replace(re,'<mark>$1</mark>'):h};
const hhmm=t=>new Date(t).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
function renderCaps(){const sup=!!SRC();
$('#o-caps').innerHTML=OH('Live Transcriber','caps')+`<div class="body" style="display:flex;flex-direction:column;gap:10px;padding-top:0">
<div class="row" style="flex-wrap:wrap;gap:6px" id="capChips"></div>
<div class="card latest-card"><div class="cap" style="margin-bottom:6px">Latest · catch up here</div><div class="latest" id="capLatest" dir="auto"></div></div>
<div id="capMsg" class="capmsg" hidden></div>
<div class="card" style="flex:1;min-height:150px;overflow-y:auto;padding:10px 14px" id="capBox" aria-live="polite"></div>
<div class="row"><span style="font-size:.8em">A</span><input class="rng sp" type="range" min="1" max="2.2" step=".1" value="${CAP.size}" data-in="capsz" aria-label="Text size"><span style="font-size:1.4em">A</span><span class="mut" style="font-size:.8em;min-width:5em;text-align:right" id="capWords"></span></div>
<div class="card list" style="padding:2px 14px">
<div class="li" style="padding:.6em 0"><span class="sp"><b>Language</b></span><select class="fld2" id="capLang" data-in="caplang" style="width:auto;height:2.6em;padding:0 .8em">${LANGS.map(l=>`<option value="${l[0]}" ${CAP.lang===l[0]?'selected':''}>${l[1]}</option>`).join('')}</select></div>
<div class="li" style="padding:.6em 0"><span class="sp"><b>Hear it through my buds</b><small>Runs Live Assist while transcribing</small></span><label class="sw"><input type="checkbox" data-in="caphear" ${CAP.hear?'checked':''}><i></i></label></div>
<div class="li" style="padding:.6em 0"><span class="sp"><b>Prefer on-device</b><small>Works without internet where supported</small></span><label class="sw"><input type="checkbox" data-in="caplocal" ${CAP.local?'checked':''}><i></i></label></div>
<div class="li" style="padding:.6em 0"><span class="sp"><b>Name alert</b><small>Highlight and buzz when your name is said</small></span><label class="sw"><input type="checkbox" data-in="capname" ${CAP.name?'checked':''}><i></i></label></div></div>
<button class="btn gold" data-act="capToggle" id="capBtn"></button>
<div class="g2"><button class="btn sm" data-act="capCopy">${ic('copy',16)} Copy</button><button class="btn sm" data-act="capSave">Save .txt</button></div>
<button class="link" data-act="capClear" style="align-self:center;font-size:.9em">Clear transcript</button></div>`;
capBtn();capPaint();capStatus();if(!sup)capMsg('This browser has no speech recognition. Use Chrome, Edge or Safari.')}
function capMsg(m){CAP.msg=m;const b=$('#capMsg');if(!b)return;b.hidden=!m;b.innerHTML=m?esc(m)+(/^The on-device/.test(m)?'':' <button class="chip on" data-act="capDemo" style="margin-left:6px">Try demo</button>'):''}
const DEMO=['Good morning everyone. Please open your books to page forty two.','Today we will learn how plants turn sunlight into energy.','Eliza, could you read the first paragraph for us?','Remember, the quiz is on Thursday, so review chapters three and four.'];
function capDemoRun(){CAP.on=true;CAP.demo=true;CAP.t0=Date.now();CAP.int='';capBtn();capStatus();clearInterval(CAP.iv);CAP.iv=setInterval(capTick,1000);let li=0,wi=0;const step=()=>{if(!CAP.on||!CAP.demo)return;const w=DEMO[li%DEMO.length].split(' ');if(wi<w.length){wi++;CAP.int=w.slice(0,wi).join(' ');capPaint();CAP.dt=setTimeout(step,230+Math.random()*150)}else{const tx=w.join(' ');CAP.lines.push({t:Date.now(),text:tx});const re=CAP.name&&nameRe();if(re&&tx.search(re)>=0)vib([120,60,120]);CAP.int='';wi=0;li++;capSaveLocal();capPaint();CAP.dt=setTimeout(step,1000)}};step()}
function capStatus(){const c=$('#capChips');if(!c)return;const net=navigator.onLine!==false;
c.innerHTML=`<span class="chip"><i class="led ${CAP.on?'on':''}"></i>${CAP.on?'Listening':'Idle'}</span><span class="chip"><i class="led ${connected()?'on':''}"></i>${connected()?'Buds connected':'Buds not connected'}</span><span class="chip">${CAP.on?(CAP.mode==='device'?'On-device':'Online'):(net?'Online':'Offline')}</span><span class="chip" id="capTime">00:00</span>`}
function capTick(){const t=$('#capTime');if(t){const s=Math.floor((Date.now()-CAP.t0)/1000);t.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}}
function capPaint(){const box=$('#capBox');if(!box)return;const last=CAP.lines.length?CAP.lines[CAP.lines.length-1].text:'';
const lt=$('#capLatest');lt.innerHTML=(CAP.int?hl(CAP.int):hl(last))||'<span class="mut">Start the transcriber, then speak or let someone talk near your phone.</span>';lt.style.fontSize=CAP.size*1.25+'em';
box.innerHTML=CAP.lines.map(l=>`<div class="cl" dir="auto"><small>${hhmm(l.t)}</small>${hl(l.text)}</div>`).join('')+(CAP.int?`<div class="cl int" dir="auto">${hl(CAP.int)}</div>`:'');box.style.fontSize=CAP.size+'em';box.scrollTop=box.scrollHeight;
const w=CAP.lines.reduce((n,l)=>n+l.text.split(/\s+/).filter(Boolean).length,0);$('#capWords').textContent=w+' words'}
function capSaveLocal(){try{localStorage.setItem('solvox.tr',JSON.stringify({lines:CAP.lines.slice(-400),lang:CAP.lang}))}catch(e){}}
function spawnRec(){const SR=SRC();if(!SR)return;const r=new SR();r.continuous=true;r.interimResults=true;r.maxAlternatives=1;r.lang=CAP.lang;CAP.mode='cloud';
if(CAP.local&&'processLocally'in r){try{r.processLocally=true;CAP.mode='device'}catch(e){}}
r.onresult=e=>{let it='';for(let i=e.resultIndex;i<e.results.length;i++){const res=e.results[i],t=res[0].transcript.trim();if(res.isFinal){if(t){CAP.lines.push({t:Date.now(),text:t});const re=CAP.name&&nameRe();if(re&&re.test(t))vib([120,70,120]);capSaveLocal()}}else it+=res[0].transcript}CAP.int=it.trim();capPaint()};
r.onerror=e=>{const er=e.error;if(er==='no-speech'||er==='aborted')return;
if(er==='not-allowed'||er==='service-not-allowed'){capMsg('The microphone is blocked here. Open SolVox as a full page and allow the microphone.');capHalt()}
else if(er==='language-not-supported'&&r.processLocally){r.processLocally=false;CAP.mode='cloud';CAP.local=false;capMsg('The on-device pack for this language is missing. Switched to online recognition.');capStatus()}
else if(er==='network'){capMsg('No internet. This browser needs a connection for speech recognition unless on-device speech is available. Reconnect, or use recent Chrome with the on-device pack.');capHalt()}
else{capMsg('Transcriber stopped: '+er);capHalt()}};
r.onend=()=>{if(CAP.on&&CAP.rec===r)setTimeout(()=>{if(!CAP.on||CAP.rec!==r)return;try{r.start()}catch(x){spawnRec()}},220)};
CAP.rec=r;try{r.start()}catch(e){capMsg('Could not start: '+e.message);capHalt()}capStatus()}
async function capWake(){try{if(navigator.wakeLock)CAP.wl=await navigator.wakeLock.request('screen')}catch(e){}}
function startCaps(){if(!SRC()){capMsg('This browser has no speech recognition. Use Chrome, Edge or Safari.');toast('Speech recognition is not supported here.');return}
capMsg('');CAP.on=true;CAP.t0=Date.now();CAP.int='';spawnRec();capBtn();capWake();clearInterval(CAP.iv);CAP.iv=setInterval(capTick,1000);
if(CAP.hear&&connected()&&A.mode!=='live'){CAP.startedLive=true;startLive()}else if(CAP.hear&&!connected())toast('Buds are not connected, so audio will not play through them.');vib(20)}
function capHalt(){CAP.on=false;CAP.demo=false;clearTimeout(CAP.dt);clearInterval(CAP.iv);try{CAP.rec&&(CAP.rec.onend=null,CAP.rec.stop())}catch(e){}CAP.rec=null;CAP.int='';try{CAP.wl&&CAP.wl.release()}catch(e){}CAP.wl=null;if(CAP.startedLive){CAP.startedLive=false;stopLive()}capSaveLocal();capBtn();capStatus();capPaint()}
function stopCaps(){if(CAP.on)capHalt()}
function capBtn(){const b=$('#capBtn');if(b)b.innerHTML=CAP.on?`${ic('x',18)} Stop transcribing`:`${ic('mic',18)} Start transcribing`}
const capText=()=>CAP.lines.map(l=>`[${hhmm(l.t)}] ${l.text}`).join('\n');
function capCopy(){const t=capText();if(!t){toast('Nothing to copy yet.');return false}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(()=>toast('Transcript copied')).catch(()=>toast('Select the text to copy it.'))}else toast('Select the text to copy it.');return true}
function capSave(){const t=capText();if(!t){toast('Nothing to save yet.');return}try{const b=new Blob([t],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='solvox-transcript.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Saved as solvox-transcript.txt')}catch(e){capCopy()}}
/* ---------- shell build + tick ---------- */
let built=false,bootT=Date.now();
function buildShell(){startSysWatch();$('#tabbar').innerHTML=TABS.map(t=>`<button data-act="tab" data-v="${t}" class="${t===curTab?'on':''}">${ic(TIC[t],22)}<span>${TLAB[t]}</span></button>`).join('');renderHome();if(!built){renderTune();renderFind();renderSolar();built=true}renderMe();setTheme(S.theme);frame.style.setProperty('--ts',S.ts);applyDSP()}
const mqD=matchMedia('(prefers-color-scheme: dark)');
function applyLook(){const d=S.theme==='dark'||(S.theme!=='light'&&(root.dataset.theme?root.dataset.theme==='dark':mqD.matches));root.dataset.mode=d?'dark':'light';root.dataset.look=S.look;root.dataset.card=S.card;root.dataset.round=S.round;root.dataset.hc=S.hc?'1':'0';root.dataset.motion=S.calm?'off':'on';const m=document.querySelector('meta[name=theme-color]');if(m)m.content=cvar('--bg')||'#12100E'}
try{mqD.addEventListener('change',applyLook)}catch(e){}
function setTheme(t){S.theme=t;if(t==='auto')root.removeAttribute('data-app');else root.setAttribute('data-app',t);save();applyLook()}
let tc=0;
function tick(){if(!S.dev)return;tc++;const r=chargeRate(),dt=3,gain=r*dt/3600*60;
if(connected()||r>0){S.bat.L=clamp(S.bat.L+gain,0,100);S.bat.R=clamp(S.bat.R+gain*.97,0,100);if(r>0&&S.hist.length)S.hist[6]=Math.min(60,S.hist[6]+Math.max(0,gain)*.5)}
if(avgBat()<20&&!S.flags.low){S.flags.low=true;addAlert('battery','Battery low','Your buds are under 20%. Move into sunlight or use backup charging.')}if(avgBat()>30)S.flags.low=false;
if(avgBat()>=99.5&&!S.flags.full){S.flags.full=true;addAlert('battery','Fully charged','Your buds are at 100%.')}if(avgBat()<90)S.flags.full=false;
if(S.dev&&S.dev.real&&BT.dev&&BT.dev.gatt&&BT.dev.gatt.connected!==S.dev.connected)setConn(BT.dev.gatt.connected);
setRings();updateSolarLive();renderStatus();$$('[data-fullpct]').forEach(n=>n.textContent=Math.round(avgBat()));
if(!(tc%2)){simStep();if(curTab==='find')syncFind()}if(!(tc%10))save()}
setInterval(tick,3000);setInterval(()=>{if(S.dev&&connected()){S.usage++;save()}},60000);
function loop(ts){if(!document.hidden){if(cur==='s-shell'){if(curTab==='find')drawRadar(ts);if(curTab==='tune')drawSpec()}}requestAnimationFrame(loop)}requestAnimationFrame(loop);
/* ---------- events ---------- */
const act={
introGo(){stopSwell();soundOn=false;toAuthOrWelcome()},introSkip(){stopSwell();toAuthOrWelcome()},
introSnd(b){soundOn=!soundOn;b.textContent=soundOn?'Sound on':'Sound off';if(soundOn)swell();else stopSwell()},
welNext,welSkip:toAuth,authTab:b=>authMode(b.dataset.v),
togglePass(){const i=$('#aPass'),h=i.type==='password';i.type=h?'text':'password';$('#eyeBtn').innerHTML=ic(h?'eyeoff':'eye',20)},
guest(){S.user={name:'Guest',email:'',guest:true};save();afterAuth()},
forgot(){const em=$('#aEmail').value.trim().toLowerCase(),U=users(),u=U.find(x=>x.email===em);if(!u){$('#authErr').textContent='Type your account email above first, then tap Forgot password.';return}const np=$('#aPass').value;if(np.length<8){$('#authErr').textContent='Type a new password (8+ characters) in the password box, then tap Forgot password to reset it.';return}
const salt=Math.random().toString(36).slice(2);hash(np,salt).then(h=>{u.salt=salt;u.h=h;saveUsers(U);$('#authErr').textContent='';toast('Password reset on this device. Tap Sign in.')})},
pairReal,pairDemo,tab:b=>tab(b.dataset.v),tab2:b=>{closeO('hearing');tab(b.dataset.v)},open:b=>openO(b.dataset.v),close:b=>closeO(b.dataset.v),
conn(){if(S.dev&&S.dev.sys&&connected()){toast('To disconnect, turn off Bluetooth for your buds in '+(IOS?'iPhone Settings':'phone settings')+'.');return}setConn(!connected())},pickSys:b=>pickSys(b.dataset.v),mode:b=>{S.mode=b.dataset.v;applyDSP();save();renderTuneState();vib(10)},
volm(){setVol(S.vol-5)},volp(){setVol(S.vol+5)},
preview(){if(!connected()){toast('Connect your buds first.');return}if(A.mode==='demo'){stopLive()}else{try{startDemo()}catch(e){toast('Audio is not available.')}renderTuneState()}},
tgt:b=>{F.tgt=b.dataset.v;const k=F.tgt==='B'?'L':F.tgt;const s=$('#simR');if(s){s.value=F.dist[k]}syncFind()},
ring(){F.ringOn?stopRing():ringStart()},guide(){F.guideOn?stopGuide():guideStart()},locNow(){captureLoc(false)},
srcsel:b=>{S.sunSrc=b.dataset.v;save();renderSolar();toast('Light source: '+SUN[S.sunSrc][0])},
backupFull(){S.backup=!S.backup;save();renderSolarFull();renderSolar();toast(S.backup?'Backup charging on':'Solar only')},
lookSet:b=>{S.look=b.dataset.v;save();applyLook();renderPersonal();vib(10)},cardSet:b=>{S.card=b.dataset.v;save();applyLook();renderPersonal()},roundSet:b=>{S.round=b.dataset.v;save();applyLook();renderPersonal()},
theme:b=>{setTheme(b.dataset.v);renderPersonal();setTimeout(()=>{if(S.hear&&$('#audio'))drawAudiogram()},50)},
faq:b=>b.classList.toggle('open'),selfcheck:selfCheck,copy:b=>{const v=b.dataset.v;(navigator.clipboard&&navigator.clipboard.writeText(v).then(()=>toast('Copied')).catch(()=>toast('Select and copy: '+v)))||toast(v)},
clearAlerts(){S.alerts=[];save();renderAlerts();renderHome()},
testStart:startTest,testHeard:heard,resetHear(){S.hear=null;applyProfile();save();renderHearing();toast('HearPrint removed.')},
capToggle(){CAP.on?stopCaps():startCaps()},capDemo(){capMsg('');if(CAP.on)capHalt();capDemoRun()},capCopy,capSave,capClear(){CAP.lines=[];CAP.int='';capSaveLocal();capPaint();toast('Transcript cleared')},stripTap(){if(!connected())setConn(true);else toast((S.dev&&S.dev.name||'Buds')+' is connected. Left and right are ready.')},
unpair(){stopLive();stopRing();stopGuide();try{BT.dev&&BT.dev.gatt&&BT.dev.gatt.disconnect()}catch(e){}clearInterval(sysT);$('#pairList').innerHTML='';S.dev=null;save();show('s-pair',-1);$('#pairMsg').textContent=PAIRTXT},
signout(){stopLive();stopRing();stopGuide();S.user=null;save();authMode('in');show('s-auth',-1)},
delacct(){if(!act._d){act._d=1;toast('Tap again to permanently delete your data.');setTimeout(()=>act._d=0,4000);return}try{saveUsers(users().filter(u=>u.email!==(S.user&&S.user.email)));localStorage.removeItem(KEY)}catch(e){}S=Object.assign({},DEF);built=false;stopLive();authMode('up');show('s-auth',-1);toast('Account deleted.')}};
function toAuthOrWelcome(){if(S.user&&S.dev){buildShell();show('s-shell')}else if(S.user){show('s-pair')}else show('s-welcome')}
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(a&&act[a.dataset.act]){e.preventDefault();act[a.dataset.act](a,e)}});
document.addEventListener('change',e=>{const i=e.target.closest('[data-in]');if(!i)return;const k=i.dataset.in,v=i.type==='checkbox'?i.checked:i.value;
if(k==='live'){v?startLive():stopLive()}
else if(['nr','wind','dir','auto'].includes(k)){S[k]=v;applyDSP();save()}
else if(k==='notif'){S.notif[i.dataset.k]=v;save()}
else if(k==='push'){if(v&&'Notification'in window){Notification.requestPermission().then(p=>{S.push=p==='granted';if(!S.push){i.checked=false;toast('Phone notifications are blocked. In-app alerts still work.')}save()})}else if(v){i.checked=false;S.push=false;toast('Phone notifications are not supported here.')}else{S.push=false;save()}}
else if(k==='hc'){S.hc=v;save();applyLook()}else if(k==='calm'){S.calm=v;save();applyLook()}
else if(k==='haptics'){S.haptics=v;save();if(v)vib(30)}
else if(k==='lost'){S.lost=v;save();toast(v?'Lost mode on. I will alert you when they reconnect.':'Lost mode off.');renderHome()}
else if(k==='sep'){S.sep=v;save()}
else if(k==='caplang'){CAP.lang=v;if(CAP.on){capHalt();startCaps()}}
else if(k==='caphear'){CAP.hear=v;if(CAP.on){if(v&&connected()&&A.mode!=='live'){CAP.startedLive=true;startLive()}else if(!v&&CAP.startedLive){CAP.startedLive=false;stopLive()}}}
else if(k==='caplocal'){CAP.local=v;if(CAP.on){capHalt();startCaps()}}
else if(k==='capname'){CAP.name=v;capPaint()}
else if(k==='backup'){S.backup=v;save();renderSolar();toast(v?'Backup charging on':'Solar only')}});
document.addEventListener('input',e=>{const i=e.target.closest('[data-in]');if(!i)return;if(i.dataset.in==='ts'){S.ts=+i.value;frame.style.setProperty('--ts',S.ts);save()}if(i.dataset.in==='capsz'){CAP.size=+i.value;capPaint()}});
addEventListener('online',()=>{renderStatus();capStatus();toast('Back online')});addEventListener('offline',()=>{renderStatus();capStatus();toast('You are offline. Everything works except cloud speech recognition.')});
addEventListener('resize',()=>{if(cur==='s-intro')sizeCv();if(S.hear&&$('#audio'))drawAudiogram()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&A.ctx&&A.mode)A.ctx.resume()});
/* ---------- boot ---------- */
if(!navigator.bluetooth){$('#pairRealBtn').textContent='Detect my buds';$('#pairMsg').textContent=PAIRTXT}
applyLook();authMode('up');setTheme(S.theme);frame.style.setProperty('--ts',S.ts);
if(S.dev)S.dev.connected=S.dev.connected!==false;
cur='s-intro';startIntro();
window.__solvox={S,act,F,A,tab,openO,show,buildShell,addAlert};
})();
