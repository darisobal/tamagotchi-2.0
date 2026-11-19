import { readdirSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist');
function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
const replacements = [];
for (const file of files(path.join(root, 'assets'))) {
  if (!file.includes('/node_modules/')) continue;
  const destination = path.join(root, 'assets', 'vendor', path.basename(file));
  mkdirSync(path.dirname(destination), {recursive:true});
  renameSync(file,destination);
  replacements.push(['/' + path.relative(root,file), '/' + path.relative(root,destination)]);
}
for (const file of files(root).filter(f => /\.(html|js|css|json)$/.test(f))) {
  let content = readFileSync(file,'utf8');
  for (const [from,to] of replacements) content = content.split(from).join(to);
  writeFileSync(file,content);
}
console.log(`Prepared ${replacements.length} dependency assets for public hosting.`);
