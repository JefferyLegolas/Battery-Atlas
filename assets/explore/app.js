(() => {
'use strict';
const data=window.ExplorationData, experiments=data.experiments;
const $=id=>document.getElementById(id);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function parseState(hash){
 const p=new URLSearchParams(hash.replace(/^#/,''));
 const index=experiments.findIndex(e=>e.id===p.get('experiment'));
 const value=Number(p.get('progress'));
 return {index:index<0?0:index,choice:p.get('choice')==='1'?1:0,progress:p.has('progress')&&Number.isFinite(value)?Math.max(0,Math.min(100,value)):60};
}
let state=parseState(location.hash),playing=false,frame=0,last=0;
function svgScene(experiment,choice,progress){
 const t=progress/100,selected=experiment.options[choice];
 let scene='';
 if(experiment.id==='silicon'){
  const radius=choice?48+36*t:48+5*t;
  scene='<text x="30" y="36" font-size="15">负极局部 · 储锂过程</text><text x="30" y="65" font-size="12">'+esc(selected.formula)+'</text><circle cx="290" cy="180" r="48" fill="none" stroke="#819285" stroke-dasharray="5 5"/>';
  scene+=choice?'<circle cx="290" cy="180" r="'+radius+'" fill="#ffdec3" stroke="#bd622e" stroke-width="3"/>':Array.from({length:5},(_,i)=>'<rect x="230" y="'+(140+i*(18+t*2))+'" width="120" height="5" rx="2" fill="#395e4b"/>').join('');
  scene+='<circle cx="290" cy="180" r="48" fill="none" stroke="#60705f" stroke-dasharray="5 5"/>';
  scene+=Array.from({length:4},(_,i)=>'<circle cx="'+(65+((t+i*.19)%1)*185)+'" cy="'+(130+i*29)+'" r="8" fill="#c2e52e" stroke="#526623"/>').join('');
  scene+='<text x="38" y="270" font-size="12">绿色圆点：Li⁺（仅示意离子进入）</text><text x="38" y="292" font-size="12">虚线圆：形变前参考轮廓；不按比例</text>';
 }else if(experiment.id==='titanate'){
  const y=choice?172:246;
  scene='<text x="30" y="34" font-size="15">电位差示意 · 同一个正极电位</text><path d="M65 270 V70" stroke="#496655" stroke-width="2"/><text x="22" y="60" font-size="12">电位 ↑</text><path d="M90 90 H440" stroke="#d97843" stroke-width="4"/><text x="100" y="77" font-size="13">正极电位（固定教学参照）</text><path d="M90 '+y+' H440" stroke="#2156a0" stroke-width="4"/><text x="100" y="'+(y+24)+'" font-size="13">'+esc(selected.name)+'负极电位</text><rect x="385" y="96" width="22" height="'+((y-100)*t)+'" fill="#a3c548"/><text x="94" y="303" font-size="13">U电池 ≈ U正极 − U负极</text><text x="94" y="326" font-size="11">绿色条表示电位差，不是测量值或充放电曲线</text>';
 }else{
  const thickness=choice?8+8*t:8+48*t;
  scene='<text x="25" y="32" font-size="15">Si–SSE 界面局部 · 首次锂化示意</text><rect x="45" y="95" width="175" height="160" rx="7" fill="#dbe9f3" stroke="#64889d"/><rect x="220" y="95" width="215" height="160" rx="7" fill="#dbe9cb" stroke="#64854c"/><rect x="'+(220-thickness/2)+'" y="95" width="'+thickness+'" height="160" fill="#edac72" opacity=".95"/><text x="75" y="78" font-size="13">硅复合负极侧</text><text x="268" y="78" font-size="13">硫化物电解质侧</text>';
  if(!choice)scene+=Array.from({length:8},(_,i)=>'<circle cx="'+(80+(i%3)*47)+'" cy="'+(127+Math.floor(i/3)*43)+'" r="8" fill="#263d36"/>').join('');
  scene+='<text x="35" y="291" font-size="12">橙色：界面分解产物（非测量厚度）</text><text x="35" y="314" font-size="12">'+(choice?'无碳仍会形成界面，不是零反应':'黑色圆点：碳添加剂，分布仅为示意')+'</text>';
 }
 return '<svg viewBox="0 0 480 350" role="img" aria-label="'+esc(selected.observe)+'"><title>'+esc(experiment.title+'：'+selected.name)+'</title>'+scene+'</svg>';
}
window.ExplorationView={parseState,svgScene};
function updateURL(){const e=experiments[state.index];history.replaceState(null,'','#'+new URLSearchParams({experiment:e.id,choice:String(state.choice),progress:String(Math.round(state.progress))}));}
function draw(){const e=experiments[state.index];$('diagram').innerHTML=svgScene(e,state.choice,state.progress);$('progress').value=String(Math.round(state.progress));$('progressValue').textContent=Math.round(state.progress)+'%';}
function stop(){playing=false;cancelAnimationFrame(frame);$('play').textContent='播放示意';$('play').setAttribute('aria-pressed','false');}
function render(){
 const e=experiments[state.index],o=e.options[state.choice];
 $('experiments').innerHTML=experiments.map((x,i)=>'<button type="button" data-experiment="'+i+'" aria-pressed="'+(i===state.index)+'"><small>EXPERIMENT '+x.number+'</small><strong>'+esc(x.title)+'</strong></button>').join('');
 $('experimentNumber').textContent='EXPERIMENT '+e.number+' / 03';$('experimentTitle').textContent=e.question;$('scope').textContent=e.scope;
 $('visualLabel').textContent=o.name+' · '+o.mechanism;$('observation').textContent=o.observe;$('variable').textContent=e.variable;
 $('choices').innerHTML=e.options.map((x,i)=>'<button type="button" data-choice="'+i+'" aria-pressed="'+(i===state.choice)+'">'+esc(x.name)+'</button>').join('');
 $('explanation').innerHTML=[['可能获得',o.gain],['需要付出 / 留意',o.cost]].map(([title,text])=>'<div class="claim"><span>'+title+'</span><p>'+esc(text)+'</p></div>').join('');
 for(const key of ['conclusion','boundary','evidence','locator','prompt','answer'])$(key).textContent=e[key];
 $('prompt').textContent='想一想 · '+e.prompt;
 $('source').innerHTML='<a href="'+esc(e.source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(e.source.title)+' ↗</a><span>'+esc(e.source.journal)+' · DOI '+esc(e.source.doi)+' · 核对 '+data.checkedAt+'</span>'+(e.source.fullText?'<a href="'+esc(e.source.fullText)+'" target="_blank" rel="noopener noreferrer">阅读原文 PDF ↗</a>':'');
 $('related').href='index.html#atlas='+encodeURIComponent(JSON.stringify({v:1,battery:e.family}));$('related').textContent=e.related+' ↗';$('shareStatus').textContent='';draw();
}
$('experiments').addEventListener('click',event=>{const b=event.target.closest('[data-experiment]');if(!b)return;stop();state={index:Number(b.dataset.experiment),choice:0,progress:60};document.querySelector('.quiz').open=false;render();updateURL();$('experiments').querySelector('[data-experiment="'+state.index+'"]').focus();});
$('choices').addEventListener('click',event=>{const b=event.target.closest('[data-choice]');if(!b)return;stop();state.choice=Number(b.dataset.choice);render();updateURL();$('choices').querySelector('[data-choice="'+state.choice+'"]').focus();});
$('progress').addEventListener('input',()=>{stop();state.progress=Number($('progress').value);draw();updateURL();});
$('play').addEventListener('click',()=>{if(playing){stop();updateURL();return;}playing=true;last=0;$('play').textContent='暂停示意';$('play').setAttribute('aria-pressed','true');if(state.progress>=100)state.progress=0;const tick=time=>{if(!playing)return;if(last)state.progress=Math.min(100,state.progress+(time-last)/80);last=time;draw();if(state.progress>=100){stop();updateURL();}else frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);});
$('next').addEventListener('click',()=>{stop();state={index:(state.index+1)%experiments.length,choice:0,progress:60};document.querySelector('.quiz').open=false;render();updateURL();$('experimentTitle').setAttribute('tabindex','-1');$('experimentTitle').focus();});
$('share').addEventListener('click',async()=>{updateURL();try{await navigator.clipboard.writeText(location.href);$('shareStatus').textContent='已复制，打开链接即可恢复当前选择与进度。';}catch{$('shareStatus').textContent='请复制浏览器地址栏，链接已包含当前实验状态。';}});
window.addEventListener('hashchange',()=>{stop();state=parseState(location.hash);render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
render();
})();
