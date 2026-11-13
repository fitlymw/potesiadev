/**
 * Nightfall 2 asset pipeline: raw CC0 packs → optimised GLBs in public/models/nf2/.
 *
 *   node tools/nf2-assets.mjs D:/Coding/assets-raw/_extract
 *
 * Expects <src>/characters/*.glb (KayKit Adventurers), <src>/furniture/*.gltf (KayKit Furniture Bits),
 * <src>/town/*.glb (Kenney Fantasy Town Kit), <src>/nature/*.glb (Kenney Nature Kit).
 *
 * Characters: all five share one rig and one animation set, so the animations are kept in
 * Knight.glb only and stripped from the others (3.6 MB → a few hundred KB each).
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, quantize, resample, textureCompress } from '@gltf-transform/functions';
import { mkdir, readdir, stat, copyFile } from 'node:fs/promises';
import path from 'node:path';

const src = process.argv[2];
if (!src) throw new Error('usage: node tools/nf2-assets.mjs <extract dir>');
const out = path.resolve('public/models/nf2');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
let sharp = null;
try { sharp = (await import('sharp')).default; } catch { console.log('(sharp not available: textures kept at full size)'); }

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
async function size(p) { return (await stat(p)).size; }

/** Clips the game uses (locomotion, jumping, emotes, sitting/lying for later gameplay). */
const KEEP_CLIPS = new Set([
  'Idle', 'Walking_A', 'Walking_B', 'Walking_C', 'Walking_Backwards', 'Running_A', 'Running_B', 'Running_Strafe_Left', 'Running_Strafe_Right',
  'Jump_Start', 'Jump_Idle', 'Jump_Land', 'Jump_Full_Short', 'Jump_Full_Long',
  'Cheer', 'Interact', 'Use_Item', 'PickUp', 'Throw', 'Hit_A', 'Hit_B', 'Block', 'Blocking', 'Dodge_Backward', 'Dodge_Left', 'Dodge_Right',
  'Spellcast_Raise', 'Spellcasting', 'Spellcast_Shoot', '1H_Ranged_Aiming', 'Unarmed_Melee_Attack_Kick', 'Unarmed_Melee_Attack_Punch_A', 'Unarmed_Idle',
  'Sit_Chair_Down', 'Sit_Chair_Idle', 'Sit_Chair_StandUp', 'Sit_Floor_Down', 'Sit_Floor_Idle', 'Sit_Floor_StandUp',
  'Lie_Down', 'Lie_Idle', 'Lie_StandUp', 'Death_A', 'Death_B', 'T-Pose',
]);

function dropAnimation(a) {
  a.listChannels().forEach((c) => c.dispose());
  a.listSamplers().forEach((s) => s.dispose());
  a.dispose();
}

async function characters() {
  const dir = path.join(src, 'characters');
  await mkdir(path.join(out, 'char'), { recursive: true });
  for (const f of (await readdir(dir)).filter((x) => x.endsWith('.glb'))) {
    const doc = await io.read(path.join(dir, f));
    const keepAnims = f === 'Knight.glb';
    doc.getRoot().listAnimations().forEach((a) => { if (!keepAnims || !KEEP_CLIPS.has(a.getName())) dropAnimation(a); });
    const fns = [dedup(), prune()];
    if (keepAnims) fns.push(resample({ tolerance: 1e-3 }));
    if (sharp) fns.push(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512], quality: 85 }));
    fns.push(quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
    await doc.transform(...fns);
    const dest = path.join(out, 'char', f);
    await io.write(dest, doc);
    console.log(`char ${f.padEnd(18)} ${kb(await size(path.join(dir, f)))} → ${kb(await size(dest))}${keepAnims ? ' (with animations)' : ''}`);
  }
}

async function furniture() {
  const dir = path.join(src, 'furniture');
  await mkdir(path.join(out, 'furniture'), { recursive: true });
  let total = 0;
  for (const f of (await readdir(dir)).filter((x) => x.endsWith('.gltf'))) {
    const doc = await io.read(path.join(dir, f));
    const fns = [dedup(), prune()];
    if (sharp) fns.push(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512], quality: 85 }));
    fns.push(quantize());
    await doc.transform(...fns);
    const dest = path.join(out, 'furniture', f.replace(/\.gltf$/, '.glb'));
    await io.write(dest, doc);
    total += await size(dest);
  }
  console.log(`furniture: ${kb(total)}`);
}

async function kit(name) {
  const dir = path.join(src, name);
  await mkdir(path.join(out, name), { recursive: true });
  let total = 0;
  for (const f of (await readdir(dir)).filter((x) => x.endsWith('.glb'))) {
    const dest = path.join(out, name, f);
    await copyFile(path.join(dir, f), dest);
    total += await size(dest);
  }
  console.log(`${name}: ${kb(total)}`);
}

await characters();
await furniture();
await kit('town');
await kit('nature');
console.log('done →', out);
