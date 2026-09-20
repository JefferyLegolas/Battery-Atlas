import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const context={window:{},document:{getElementById(){}},location:{hash:''},URLSearchParams};
vm.createContext(context);vm.runInContext(read('assets/explore/data.js'),context);
const app=read('assets/explore/app.js');new vm.Script(app);
vm.runInContext(app.slice(0,app.indexOf('window.ExplorationView='))+'window.ExplorationView={parseState,svgScene};})();',context);
const {parseState,svgScene}=context.window.ExplorationView;
const items=context.window.ExplorationData.experiments;
assert.equal(items.length,3);assert.equal(new Set(items.map(e=>e.id)).size,3);
for(const [i,e] of items.entries()){
 assert.equal(e.options.length,2);assert(e.source.url.startsWith('https://'));assert(e.source.doi.startsWith('10.'));
 assert(e.boundary&&e.evidence&&e.locator&&e.conclusion);
 assert(fs.existsSync(path.join(root,'data/systems',e.family+'.json')));
 for(let choice=0;choice<2;choice++){
  for(const progress of [0,60,100]){
   const parsed=parseState('#'+new URLSearchParams({experiment:e.id,choice:String(choice),progress:String(progress)}));
   assert.equal(parsed.index,i);assert.equal(parsed.choice,choice);assert.equal(parsed.progress,progress);
   const svg=svgScene(e,choice,progress);assert(svg.includes('role="img"'));assert(!svg.includes('NaN'));assert(svg.includes(e.options[choice].name));
  }
  assert.notEqual(svgScene(e,choice,0),svgScene(e,choice,100));
 }
 assert.notEqual(svgScene(e,0,60),svgScene(e,1,60));
}
assert.equal(parseState('#experiment=unknown&choice=9&progress=NaN').index,0);
assert.equal(parseState('#progress=900').progress,100);assert.equal(parseState('#progress=-3').progress,0);
assert.equal(parseState('#progress=Infinity').progress,60);
const baseline='033ea83a7d63c28a1597f61da47a01cce3c52d78';
const original=execFileSync('git',['show',baseline+':index.html'],{cwd:root,encoding:'utf8'});
const scripts=html=>[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1].replaceAll('\r\n','\n'));
assert.deepEqual(scripts(read('index.html')),scripts(original),'Existing atlas scripts must remain unchanged');
const svgDiff=execFileSync('git',['diff',baseline,'--','assets/mechanisms','data/systems'],{cwd:root,encoding:'utf8'});assert.equal(svgDiff,'');
assert(read('index.html').includes('href="explore.html"'));
console.log('PASS: 3 experiments, 6 variants, SVG endpoints, hash round trips, malformed state, evidence metadata, related families, original scripts and animations preserved.');
