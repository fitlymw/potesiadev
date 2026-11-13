import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EMOTE_DURATION_MS, JUMP_DURATION_MS } from '../../../../../shared/nightfall2/constants';
import { CAPES, CLASSES, HATS, TINTS, type Look } from '../../../../../shared/nightfall2/look';
import { env } from '../store';
import type { AnimState } from './anim';

import { CHAR_BASE as BASE, CHAR_FILES as FILES } from './characterAssets';

/** Base scale: the KayKit rig is ~2.3 units tall; Elf Town doors are ~2 m. */
const SCALE = 0.8;
const JUMP_HEIGHT = 1.15;
const FADE = 0.18;
/** Emote → clip. */
const EMOTE_CLIPS = ['Cheer', 'Interact', 'Sit_Floor_Down', 'Unarmed_Melee_Attack_Kick', 'Spellcast_Raise', '1H_Ranged_Aiming', 'Spellcasting', 'Cheer'];
const KAY_HATS: Record<string, { file: keyof typeof FILES; node: string }> = { helmet: { file: 'Knight', node: 'Knight_Helmet' }, mageHat: { file: 'Mage', node: 'Mage_Hat' }, barbarianHat: { file: 'Barbarian', node: 'Barbarian_Hat' } };

type Gltfs = Record<keyof typeof FILES, GLTF>;

function tinted(src: THREE.Material | THREE.Material[], tint: number, alive: boolean): THREE.MeshStandardMaterial {
  const base = (Array.isArray(src) ? src[0] : src) as THREE.MeshStandardMaterial;
  const m = base.clone();
  m.color.set(TINTS[tint] ?? '#ffffff');
  if (!alive) { m.transparent = true; m.opacity = 0.35; }
  return m;
}

/** Builds the character: cloned skeleton + chosen parts from each class + props + primitive add-ons. */
function build(g: Gltfs, look: Look, alive: boolean) {
  const rig = cloneSkeleton(g.Knight.scene) as THREE.Group;
  const sample = rig.getObjectByName('Knight_Body') as THREE.SkinnedMesh;
  const holder = sample.parent as THREE.Object3D;
  const bones = new Map<string, THREE.Bone>();
  rig.traverse((o) => { if ((o as THREE.Bone).isBone) bones.set(o.name, o as THREE.Bone); });
  // strip every mesh the clone came with
  const toRemove: THREE.Object3D[] = [];
  rig.traverse((o) => { if ((o as THREE.Mesh).isMesh) toRemove.push(o); });
  toRemove.forEach((o) => o.parent?.remove(o));

  // Every KayKit mesh carries its own skin with its own joint order, so each part gets a
  // skeleton rebuilt from the cloned bones in *that* order (binding all parts to one skeleton
  // scrambles the limbs).
  const addPart = (file: keyof typeof FILES, name: string, tint: number) => {
    const src = g[file].scene.getObjectByName(name) as THREE.SkinnedMesh | undefined;
    if (!src) return;
    const ordered = src.skeleton.bones.map((b) => bones.get(b.name));
    if (ordered.some((b) => !b)) return;
    const skeleton = new THREE.Skeleton(ordered as THREE.Bone[], src.skeleton.boneInverses);
    const m = new THREE.SkinnedMesh(src.geometry, tinted(src.material, tint, alive));
    m.bind(skeleton, src.bindMatrix);
    m.frustumCulled = false;
    holder.add(m);
  };
  const addProp = (file: keyof typeof FILES, name: string, bone: string, tint: number) => {
    const src = g[file].scene.getObjectByName(name) as THREE.Mesh | undefined;
    const b = bones.get(bone);
    if (!src || !b) return;
    const m = new THREE.Mesh(src.geometry, tinted(src.material, tint, alive));
    m.position.copy(src.position);
    m.quaternion.copy(src.quaternion);
    m.scale.copy(src.scale);
    b.add(m);
  };

  const cls = (i: number) => CLASSES[i] as keyof typeof FILES;
  const hat = HATS[look.hat];
  if (hat === 'hood') addPart('Hooded', 'Rogue_Head_Hooded', look.tintHead);
  else addPart(cls(look.head), `${CLASSES[look.head]}_Head`, look.tintHead);
  addPart(cls(look.body), `${CLASSES[look.body]}_Body`, look.tintBody);
  addPart(cls(look.arms), `${CLASSES[look.arms]}_ArmLeft`, look.tintArms);
  addPart(cls(look.arms), `${CLASSES[look.arms]}_ArmRight`, look.tintArms);
  addPart(cls(look.legs), `${CLASSES[look.legs]}_LegLeft`, look.tintLegs);
  addPart(cls(look.legs), `${CLASSES[look.legs]}_LegRight`, look.tintLegs);
  if (look.cape > 0) addProp(cls(look.cape - 1), `${CAPES[look.cape]}_Cape`, 'chest', look.tintCape);
  if (hat in KAY_HATS) addProp(KAY_HATS[hat].file, KAY_HATS[hat].node, 'head', look.tintHat);

  // primitive add-ons on the head bone: elf ears and the code-built hats
  const head = bones.get('head');
  if (head) {
    // bind pose: the head bone sits at y 1.24 with identity axes; the crown of the head is ~1.04 above it
    const top = 1.04;
    const skin = new THREE.MeshStandardMaterial({ color: '#e9c4a2' });
    if (look.ears) {
      for (const s of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 6), skin);
        ear.position.set(s * 0.46, top - 0.5, 0.02);
        ear.rotation.z = s * -1.15;
        head.add(ear);
      }
    }
    const hatMat = new THREE.MeshStandardMaterial({ color: TINTS[look.tintHat] === '#ffffff' ? '#6b4a9c' : TINTS[look.tintHat] });
    if (hat === 'wizard') {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 10), hatMat);
      cone.position.set(0, top + 0.4, -0.05);
      cone.rotation.z = 0.1;
      head.add(cone);
      const brim = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.75, 16), new THREE.MeshStandardMaterial({ color: hatMat.color, side: THREE.DoubleSide }));
      brim.rotation.x = -Math.PI / 2;
      brim.position.set(0, top - 0.05, -0.05);
      head.add(brim);
    } else if (hat === 'crown') {
      const gold = new THREE.MeshStandardMaterial({ color: '#f5c542', metalness: 0.6, roughness: 0.3 });
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.2, 8, 1, true), new THREE.MeshStandardMaterial({ color: '#f5c542', metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide }));
      ring.position.set(0, top + 0.02, 0);
      head.add(ring);
      for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 4), gold);
        spike.position.set(Math.cos((i / 5) * Math.PI * 2) * 0.3, top + 0.2, Math.sin((i / 5) * Math.PI * 2) * 0.3);
        head.add(spike);
      }
    } else if (hat === 'leaf') {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.55, 6), new THREE.MeshStandardMaterial({ color: '#4f9a3a' }));
      cap.position.set(0, top + 0.12, -0.02);
      cap.rotation.x = 0.1;
      cap.scale.y = 0.6;
      head.add(cap);
    } else if (hat === 'beret') {
      const beret = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), hatMat);
      beret.position.set(0.1, top + 0.02, -0.06);
      beret.scale.set(1, 0.35, 1);
      beret.rotation.z = -0.2;
      head.add(beret);
    }
  }
  // lantern in the left hand (glows at night)
  const slot = bones.get('handslot.l') ?? bones.get('hand.l');
  const lamp = new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: '#ffb347', emissiveIntensity: 0.3 });
  if (slot) {
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), lamp);
    lantern.position.set(0, -0.15, 0.05);
    slot.add(lantern);
  }
  const mats: THREE.MeshStandardMaterial[] = [];
  rig.traverse((o) => { const m = (o as THREE.Mesh).material; if (m && (m as THREE.MeshStandardMaterial).isMeshStandardMaterial) mats.push(m as THREE.MeshStandardMaterial); });
  return { rig, lamp, mats };
}

/**
 * A KayKit adventurer assembled from a Look, animated by the shared clip set: idle / run /
 * jump (clip + arc with the same timing as the server) / one-shot emote clips, with crossfades.
 */
export function KayCharacter({ look, animRef, alive = true, scale = 1 }: { look: Look; animRef: React.RefObject<AnimState>; alive?: boolean; scale?: number }) {
  const knight = useGLTF(BASE + FILES.Knight);
  const rogue = useGLTF(BASE + FILES.Rogue);
  const mage = useGLTF(BASE + FILES.Mage);
  const barbarian = useGLTF(BASE + FILES.Barbarian);
  const hooded = useGLTF(BASE + FILES.Hooded);
  const g = useMemo(() => ({ Knight: knight, Rogue: rogue, Mage: mage, Barbarian: barbarian, Hooded: hooded }) as unknown as Gltfs, [knight, rogue, mage, barbarian, hooded]);
  const built = useMemo(() => build(g, look, alive), [g, look, alive]);
  const lamp = useRef<THREE.MeshStandardMaterial | null>(null);
  const mixer = useMemo(() => new THREE.AnimationMixer(built.rig), [built]);
  const actions = useMemo(() => {
    const map = new Map<string, THREE.AnimationAction>();
    for (const clip of g.Knight.animations) map.set(clip.name, mixer.clipAction(clip));
    return map;
  }, [g, mixer]);
  const current = useRef<string>('');
  const group = useRef<THREE.Group>(null);
  const emoteKey = useRef(-1e9);

  useEffect(() => {
    lamp.current = built.lamp;
    return () => {
      mixer.stopAllAction();
      built.mats.forEach((m) => m.dispose());
    };
  }, [mixer, built]);

  const play = (name: string, once = false) => {
    if (current.current === name) return;
    const next = actions.get(name);
    if (!next) return;
    const prev = actions.get(current.current);
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    next.enabled = true;
    if (prev) next.crossFadeFrom(prev, FADE, true);
    next.play();
    current.current = name;
  };

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const a = animRef.current;
    const now = performance.now();
    const jp = (now - a.jumpStart) / JUMP_DURATION_MS;
    const jumping = jp >= 0 && jp <= 1;
    const es = now - a.emoteStart;
    const emoting = a.emote >= 0 && es >= 0 && es <= EMOTE_DURATION_MS;

    if (jumping) play(jp < 0.2 ? 'Jump_Start' : jp > 0.8 ? 'Jump_Land' : 'Jump_Idle');
    else if (emoting) {
      // a fresh emote restarts its clip even if it is the same one
      if (emoteKey.current !== a.emoteStart) { emoteKey.current = a.emoteStart; current.current = ''; }
      play(EMOTE_CLIPS[a.emote] ?? 'Cheer', a.emote !== 6);
    } else if (a.moving) play('Running_A');
    else play('Idle');

    mixer.update(dt);
    const grp = group.current;
    if (grp) grp.position.y = jumping ? 4 * JUMP_HEIGHT * jp * (1 - jp) : 0;
    const lm = lamp.current;
    if (lm) lm.emissiveIntensity = 0.3 + env.night * 2.2;
  });

  const s = SCALE * scale;
  return (
    <group ref={group} scale={s}>
      <primitive object={built.rig} />
    </group>
  );
}
