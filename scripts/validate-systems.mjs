import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const baselineCommit = '5fcc6c89aa1c389227dd41521530cf29c6f61c23';
const original = execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, 'show', `${baselineCommit}:index.html`], { cwd: root, encoding: 'utf8' });
const current = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...current.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
for (const [, script] of scripts) new vm.Script(script);
const runtime = { console, fetch: async url => {
  const file = path.resolve(root, url);
  if (!file.startsWith(root + path.sep)) throw new Error(`Unsafe path: ${url}`);
  return { ok: fs.existsSync(file), json: async () => JSON.parse(fs.readFileSync(file, 'utf8')) };
} };
runtime.globalThis = runtime;
vm.runInNewContext(scripts[0][1], runtime);
await runtime.AtlasReady;

const assignments = {};
for (const name of ['AtlasBase', 'AtlasMaterials', 'AtlasManufacturers', 'AtlasMetrics']) {
  const match = original.match(new RegExp(`<script>globalThis\\.${name} = ([\\s\\S]*?);\\s*</script>`));
  if (!match) throw new Error(`Missing original ${name}`);
  assignments[name] = JSON.parse(match[1]);
}

const dataDir = path.join(root, 'data');
const manifest = JSON.parse(fs.readFileSync(path.join(dataDir, 'index.json'), 'utf8'));
const shared = JSON.parse(fs.readFileSync(path.join(dataDir, 'shared.json'), 'utf8'));
const systems = manifest.systems.map(item => JSON.parse(fs.readFileSync(path.join(dataDir, item.file), 'utf8')));
if (systems.length !== manifest.count) throw new Error('System count mismatch');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const compare = (label, actual, expected) => { if (!same(actual, expected)) throw new Error(`${label} changed`); };
compare('families', systems.map(s => s.family), assignments.AtlasBase.families);
compare('profiles', systems.flatMap(s => s.profiles), assignments.AtlasMaterials.profiles);
compare('materials', [...new Set([...systems.flatMap(s => s.materials), ...shared.unassignedMaterials].map(m => m.id))].sort(), assignments.AtlasMaterials.materials.map(m => m.id).sort());
compare('manufacturers', systems.flatMap(s => s.manufacturers), assignments.AtlasManufacturers);
compare('metric records', Object.fromEntries(systems.map(s => [s.id, s.performance])), assignments.AtlasMetrics.records);
compare('loaded family IDs', Array.from(runtime.AtlasBase.families, item => item.id), assignments.AtlasBase.families.map(item => item.id));
compare('loaded profile IDs', Array.from(runtime.AtlasMaterials.profiles, item => item.id), assignments.AtlasMaterials.profiles.map(item => item.id));
compare('loaded material IDs', Array.from(runtime.AtlasMaterials.materials, item => item.id), assignments.AtlasMaterials.materials.map(item => item.id));
compare('literature additions', systems.flatMap(s => s.literatureUpdate).map(item => `${item.family}:${item.metric}:${item.source}`).sort(), assignments.AtlasMetrics.literatureUpdate.added.map(item => `${item.family}:${item.metric}:${item.source}`).sort());
for (const system of systems) {
  if (system.id !== system.family.id) throw new Error(`Wrong family ID: ${system.id}`);
  const materialIds = new Set([...systems.flatMap(s => s.materials), ...shared.unassignedMaterials].map(item => item.id));
  for (const profile of system.profiles) {
    if (profile.family !== system.id) throw new Error(`Wrong profile family: ${profile.id}`);
    for (const role of ['cathode', 'anode', 'electrolyte']) if (!materialIds.has(profile[role])) throw new Error(`Missing material ${profile[role]}`);
  }
}
console.log(`Validated ${systems.length} system JSON files, ${assignments.AtlasMaterials.profiles.length} profiles, ${assignments.AtlasMaterials.materials.length} materials and ${scripts.length} inline scripts.`);
