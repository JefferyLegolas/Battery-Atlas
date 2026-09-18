import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const systemsDir = path.join(root, 'data', 'systems');
const allowed = new Set(['intercalation', 'alloy', 'flow', 'solid-lithium', 'fluoride-solid', 'molten-ceramic']);

const mapping = {
  agzn: { types: ['alloy'], note: '锌/银电极以溶解—沉积和氧化物转化为主；借用合金型模板表达相变与形貌风险。' },
  alion: { types: ['intercalation', 'alloy'], note: '石墨泡沫中发生氯铝酸根插层；铝负极伴随金属沉积/溶解。' },
  alkaline: { types: ['alloy'], note: '锌与二氧化锰以溶解—沉积和转化反应为主；借用合金型模板表达相变。' },
  caion: { types: ['alloy'], note: '钙锡负极为典型合金化过程，并伴随显著体积变化。' },
  fion: { types: ['fluoride-solid'], note: 'F⁻ 在金属氟化物与金属负极之间迁移，固态氟化物导体、界面反应和体积变化是关键限制。' },
  'iron-flow': { types: ['flow'], note: '铁离子氧化还原与铁沉积/溶解发生在外部电解液循环体系中。' },
  kion: { types: ['intercalation'], note: 'K⁺ 在普鲁士蓝和有机负极宿主中嵌入/脱出。' },
  lco: { types: ['intercalation'], note: 'Li⁺ 在层状钴酸锂与石墨之间嵌入/脱出。' },
  lead: { types: ['alloy'], note: '铅和二氧化铅电极以溶解—沉积反应为主；借用合金型模板表达相变与形貌演化。' },
  lfp: { types: ['intercalation'], note: 'Li⁺ 在磷酸铁锂与石墨之间嵌入/脱出，是嵌入型基准示例。' },
  lis: { types: ['alloy'], note: '硫的转化/溶解与锂金属沉积并存；借用合金型模板表达相变、体积和形貌风险。' },
  lmo: { types: ['intercalation'], note: 'Li⁺ 在锰酸锂与石墨之间嵌入/脱出。' },
  lto: { types: ['intercalation'], note: 'Li⁺ 在锰酸锂与钛酸锂之间嵌入/脱出，具有典型零应变特征。' },
  mgion: { types: ['alloy'], note: '镁金属沉积/溶解和电极相变为主；借用合金型模板表达界面形貌变化。' },
  naoxide: { types: ['intercalation'], note: 'Na⁺ 在层状氧化物与硬碳之间嵌入/脱出。' },
  nas: { types: ['molten-ceramic'], note: '熔融 Na 与熔融 S/多硫化物通过 β-氧化铝陶瓷隔膜传输 Na⁺，工作温度约 300–350 °C，密封和腐蚀是核心约束。' },
  nawhite: { types: ['intercalation'], note: 'Na⁺ 在普鲁士白与硬碳之间嵌入/脱出。' },
  nca: { types: ['intercalation'], note: 'Li⁺ 在镍钴铝酸锂与石墨之间嵌入/脱出。' },
  nicd: { types: ['intercalation', 'alloy'], note: 'NiOOH 中发生质子嵌入/脱出，镉电极伴随溶解—沉积转化。' },
  nife: { types: ['intercalation', 'alloy'], note: 'NiOOH 中发生质子嵌入/脱出，铁电极伴随溶解—沉积和析氢。' },
  nimh: { types: ['intercalation', 'alloy'], note: 'NiOOH 中发生质子嵌入/脱出，储氢合金伴随氢吸收/脱出。' },
  nmc: { types: ['intercalation'], note: 'Li⁺ 在层状 NMC 与石墨之间嵌入/脱出。' },
  solid: { types: ['solid-lithium', 'alloy'], note: '硫化物固体电解质负责 Li⁺ 传导；硅负极同时存在合金化体积变化。' },
  vrfb: { types: ['flow'], note: '钒离子氧化还原对在外部储罐与电堆之间循环，通过膜隔离两侧电解液。' },
  'zinc-air': { types: ['alloy'], note: '锌溶解/沉积与氧还原/析氧并存；借用合金型模板表达转化与形貌变化。' },
  'zinc-carbon': { types: ['alloy'], note: '锌溶解与二氧化锰转化反应为主；借用合金型模板表达相变。' },
  znbr: { types: ['flow'], note: '锌沉积/溶解与溴氧化还原发生在外部电解液循环体系中。' }
};

const files = fs.readdirSync(systemsDir).filter(name => name.endsWith('.json'));
const ids = files.map(name => path.basename(name, '.json'));
const missing = ids.filter(id => !mapping[id]);
const extra = Object.keys(mapping).filter(id => !ids.includes(id));
if (missing.length || extra.length) throw new Error(`Mapping mismatch. Missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}`);

for (const id of ids) {
  const file = path.join(systemsDir, `${id}.json`);
  const system = JSON.parse(fs.readFileSync(file, 'utf8'));
  const config = mapping[id];
  if (!config.types.length || config.types.some(type => !allowed.has(type))) throw new Error(`Invalid mechanismType for ${id}`);
  system.mechanismType = [...new Set(config.types)];
  system.mechanismNote = config.note;
  fs.writeFileSync(file, `${JSON.stringify(system, null, 2)}\n`);
}

console.log(`Assigned mechanismType to ${ids.length} systems.`);
