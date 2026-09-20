import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [,script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(script);
const systems=fs.readdirSync(path.join(root,'data/systems')).map(f=>JSON.parse(fs.readFileSync(path.join(root,'data/systems',f),'utf8')));
const material=Object.fromEntries(systems.flatMap(s=>s.materials).map(m=>[m.id,m]));
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const context={material,esc,labels:{cathode:'正极',electrolyte:'电解质',anode:'负极'},sourceLinks:sources=>sources.map(s=>esc(s.url)).join(' ')};
vm.createContext(context);
vm.runInContext(html.slice(html.indexOf('function materialComposition('),html.indexOf('function renderPerformance(')),context);
let count=0;
for(const system of systems){
 for(const profile of system.profiles){
  const family={...system.family,mechanismType:system.mechanismType,matchedProfiles:[profile]};
  const card=context.cardMechanismPoster(family), detail=context.mechanismFigure(family);
  assert(card.includes('非反应机理图'));
  for(const role of ['cathode','electrolyte','anode']){
   assert(card.includes(esc(material[profile[role]].name)),`${profile.id}: ${role}`);
   assert(detail.includes(esc(material[profile[role]].formula)));
  }
  for(const source of profile.sources)assert(detail.includes(esc(source.url)));
  assert(!/<img|<svg|data-mechanism-zoom/.test(card+detail));
  assert(detail.includes(esc(profile.id)));
  count++;
 }
 const all=context.mechanismFigure({...system.family,matchedProfiles:system.profiles});
 for(const profile of system.profiles)assert(all.includes(esc(profile.id)));
}
assert.equal(context.cardMechanismPoster({}), '');
assert.equal(context.mechanismFigure({}), '');
assert(!html.includes('assets/mechanisms/'));
assert(!html.includes('id="mechanismDialog"'));
material.test={name:'<script>alert(1)</script>',formula:'A&B'};
const escaped=context.materialComposition({cathode:'test',electrolyte:'test',anode:'test'});
assert(!escaped.includes('<script>'));assert(escaped.includes('A&amp;B'));
console.log(`PASS: ${systems.length} systems, ${count} exact profiles, source links, multi-profile rendering, no legacy SVGs, escaping and inline script syntax.`);
