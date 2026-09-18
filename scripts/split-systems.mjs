import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const baselineCommit = '5fcc6c89aa1c389227dd41521530cf29c6f61c23';
const htmlPath = path.join(root, 'index.html');
const currentHtml = fs.readFileSync(htmlPath, 'utf8');
const html = currentHtml.includes('<script>globalThis.AtlasBase =') ? currentHtml : execFileSync('git', [
  '-c', `safe.directory=${root.replaceAll('\\', '/')}`, 'show', `${baselineCommit}:index.html`
], { cwd: root, encoding: 'utf8' });

function readAssignment(name, closing = '}') {
  const pattern = new RegExp(`<script>globalThis\\.${name} = ([\\s\\S]*?${closing});\\s*</script>`);
  const match = html.match(pattern);
  if (!match) throw new Error(`Cannot find ${name}`);
  return { value: JSON.parse(match[1]), full: match[0] };
}

const base = readAssignment('AtlasBase');
const materialsData = readAssignment('AtlasMaterials');
const manufacturers = readAssignment('AtlasManufacturers', ']');
const metrics = readAssignment('AtlasMetrics');
const dataDir = path.join(root, 'data');
const systemsDir = path.join(dataDir, 'systems');
fs.mkdirSync(systemsDir, { recursive: true });

const materialById = new Map(materialsData.value.materials.map(item => [item.id, item]));
const profilesByFamily = Map.groupBy(materialsData.value.profiles, item => item.family);
const manufacturersByFamily = Map.groupBy(manufacturers.value, item => item.family);

const systems = base.value.families.map(family => {
  let previous = {};
  try { previous = JSON.parse(fs.readFileSync(path.join(systemsDir, `${family.id}.json`), 'utf8')); } catch {}

  const profiles = profilesByFamily.get(family.id) || [];
  const materialIds = [...new Set(profiles.flatMap(profile => [profile.cathode, profile.anode, profile.electrolyte]))];
  const records = metrics.value.records?.[family.id] || null;
  const sourceIds = new Set();
  const collectSources = value => {
    if (!value || typeof value !== 'object') return;
    if (typeof value.source === 'string') sourceIds.add(value.source);
    if (Array.isArray(value.sourceIds)) value.sourceIds.forEach(id => sourceIds.add(id));
    Object.values(value).forEach(collectSources);
  };
  collectSources(records);
  const literatureEvidence = (metrics.value.literatureUpdate?.added || []).filter(item => item.family === family.id);
  literatureEvidence.forEach(item => sourceIds.add(item.source));

  return {
    schemaVersion: 1,
    id: family.id,
    reviewedAt: '2026-09-09',
    family,
    profiles,
    materials: materialIds.map(id => materialById.get(id)).filter(Boolean),
    manufacturers: manufacturersByFamily.get(family.id) || [],
    performance: records,
    literatureUpdate: literatureEvidence,
    metricSources: Object.fromEntries([...sourceIds].filter(id => metrics.value.sources[id]).map(id => [id, metrics.value.sources[id]])),
    mechanismType: previous.mechanismType || [],
    mechanismNote: previous.mechanismNote || ''
  };
});
const assignedMaterialIds = new Set(systems.flatMap(system => system.materials.map(item => item.id)));

for (const system of systems) {
  fs.writeFileSync(path.join(systemsDir, `${system.id}.json`), `${JSON.stringify(system, null, 2)}\n`);
}

const manifest = {
  schemaVersion: 1,
  updatedAt: metrics.value.updatedAt,
  count: systems.length,
  literatureUpdate: Object.fromEntries(Object.entries(metrics.value.literatureUpdate || {}).filter(([key]) => key !== 'added')),
  systems: systems.map(system => ({ id: system.id, name: system.family.name, file: `systems/${system.id}.json` }))
};
fs.writeFileSync(path.join(dataDir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(dataDir, 'shared.json'), `${JSON.stringify({
  schemaVersion: 1,
  elements: base.value.elements,
  materialOrder: materialsData.value.materials.map(item => item.id),
  unassignedMaterials: materialsData.value.materials.filter(item => !assignedMaterialIds.has(item.id)),
  metricDefinitions: metrics.value.definitions,
  metricSources: metrics.value.sources,
  metricsUpdatedAt: metrics.value.updatedAt
}, null, 2)}\n`);

const loader = `<script>globalThis.AtlasReady = (async () => {
  const [manifestResponse, sharedResponse] = await Promise.all([fetch('data/index.json'), fetch('data/shared.json')]);
  if (!manifestResponse.ok || !sharedResponse.ok) throw new Error('无法加载 Battery Atlas 数据索引');
  const manifest = await manifestResponse.json();
  const shared = await sharedResponse.json();
  const systems = await Promise.all(manifest.systems.map(async item => {
    const response = await fetch('data/' + item.file);
    if (!response.ok) throw new Error('无法加载体系：' + item.id);
    return response.json();
  }));
  const families = systems.map(item => item.family);
  const profiles = systems.flatMap(item => item.profiles);
  const materialMap = new Map([...systems.flatMap(item => item.materials), ...shared.unassignedMaterials].map(item => [item.id, item]));
  const materials = shared.materialOrder.map(id => materialMap.get(id));
  const manufacturers = systems.flatMap(item => item.manufacturers);
  const records = Object.fromEntries(systems.filter(item => item.performance).map(item => [item.id, item.performance]));
  const evidence = systems.flatMap(item => item.literatureUpdate);
  globalThis.AtlasBase = { elements: shared.elements, families };
  globalThis.AtlasMaterials = { materials, profiles };
  globalThis.AtlasManufacturers = manufacturers;
  globalThis.AtlasMetrics = {
    schemaVersion: 2,
    updatedAt: shared.metricsUpdatedAt,
    definitions: shared.metricDefinitions,
    sources: shared.metricSources,
    records,
    literatureUpdate: { ...(manifest.literatureUpdate || {}), added: evidence }
  };
})();</script>`;

let output = html;
for (const block of [base.full, materialsData.full, manufacturers.full, metrics.full]) output = output.replace(block, '');
output = output.replace('</noscript>', `</noscript>${loader}`);
const appStart = /<script>\(\(\) => \{\s*'use strict';\s*const \$ =/;
if (!appStart.test(output)) throw new Error('Cannot locate application start');
output = output.replace(appStart, `<script>AtlasReady.then(() => {\n 'use strict';\n const $ =`);
const appEnd = /\}\)\(\);\s*<\/script>\s*<\/body><\/html>\s*$/;
if (!appEnd.test(output)) throw new Error('Cannot locate application end');
output = output.replace(appEnd, `}).catch(error => {\n console.error(error);\n const grid=document.getElementById('resultGrid');\n if(grid) grid.innerHTML='<div class="empty-state"><h3>数据加载失败</h3><p>请通过本地 HTTP 服务器打开页面，并确认 data 目录完整。</p></div>';\n});\n</script>\n</body></html>`);
fs.writeFileSync(htmlPath, output);
console.log(`Created ${systems.length} system records in ${systemsDir}`);
