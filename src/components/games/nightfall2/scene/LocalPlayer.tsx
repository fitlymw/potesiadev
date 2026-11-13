import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { INPUT_SEND_MS } from '../../../../../shared/nightfall2/constants';
import { colliders, spawnPoint } from '../../../../../shared/nightfall2/town';
import { step } from '../../../../../shared/nightfall2/physics';
import { decodeLook } from '../../../../../shared/nightfall2/look';
import { jump, sendEmote, sendInput } from '../net';
import { camera as cam, emoteAnim, env, input, jumps, positions, useNf2 } from '../store';
import { KayCharacter } from './KayCharacter';
import { newAnim } from './anim';
import { Overhead } from './Overhead';
import { useOverhead } from './useOverhead';

const BOXES = colliders();
const CAM_DIST = 6.5;
const CAM_HEIGHT = 3.4;

/**
 * My own character: moves immediately from local input (prediction) using the same physics
 * as the server, sends the input ~15×/s, and gently snaps back if the server disagrees.
 */
export function LocalPlayer({ meRef }: { meRef: React.RefObject<THREE.Vector3> }) {
  const me = useNf2((s) => s.me);
  const roster = useNf2((s) => s.roster);
  const mine = roster.find((p) => p.id === me);
  const look = useMemo(() => decodeLook(mine?.look), [mine?.look]);
  const over = useOverhead(me);
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const anim = useRef(newAnim());
  const pos = useRef<{ x: number; z: number } | null>(null);
  const rot = useRef(0);
  const lastSend = useRef(0);
  const lastSent = useRef({ x: 0, z: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const typing = () => {
      const el = document.activeElement as HTMLElement | null;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
    };
    const down = (e: KeyboardEvent) => {
      if (typing()) return;
      input.keys.add(e.code);
      if (e.code === 'Space') { e.preventDefault(); jump(); }
      if (/^Digit[1-8]$/.test(e.code)) sendEmote(Number(e.code.slice(5)) - 1);
    };
    const up = (e: KeyboardEvent) => input.keys.delete(e.code);
    const blur = () => input.keys.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      input.keys.clear();
    };
  }, []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const server = positions.get(me);
    if (!pos.current) {
      const sp = server ?? spawnPoint(0);
      pos.current = { x: sp.x, z: sp.z };
      rot.current = sp.rot;
    }
    const p = pos.current;

    // input → world direction relative to the camera yaw
    const k = input.keys;
    let ix = input.x + (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    let iy = input.y + (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    const mag = Math.hypot(ix, iy);
    if (mag > 1) { ix /= mag; iy /= mag; }
    const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw);
    const rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
    const dir = { x: fx * iy + rx * ix, z: fz * iy + rz * ix };
    const moving = Math.hypot(dir.x, dir.z) > 0.05;

    if (moving) {
      const next = step(p, dir, dt, BOXES);
      p.x = next.x;
      p.z = next.z;
      rot.current = Math.atan2(dir.x, dir.z);
    }
    // reconcile with the authoritative position
    if (server) {
      const err = Math.hypot(server.x - p.x, server.z - p.z);
      const pull = err > 1.2 ? 0.25 : moving ? 0.03 : 0.1;
      p.x += (server.x - p.x) * pull;
      p.z += (server.z - p.z) * pull;
    }
    // tell the server (throttled; always send the stop)
    const now = performance.now();
    const changed = Math.abs(dir.x - lastSent.current.x) > 0.01 || Math.abs(dir.z - lastSent.current.z) > 0.01;
    if ((changed && (!moving || now - lastSend.current > INPUT_SEND_MS / 2)) || (moving && now - lastSend.current > INPUT_SEND_MS)) {
      sendInput({ x: dir.x, z: dir.z, rot: rot.current });
      lastSend.current = now;
      lastSent.current = { x: dir.x, z: dir.z };
    }

    const a = anim.current;
    a.moving = moving;
    a.jumpStart = jumps.get(me) ?? -1e9;
    const e = emoteAnim.get(me);
    a.emote = e ? e.id : -1;
    a.emoteStart = e ? e.start : -1e9;

    const g = group.current;
    if (g) {
      g.position.set(p.x, 0, p.z);
      g.rotation.y = rot.current;
    }
    if (light.current) light.current.intensity = env.night * 7;
    meRef.current?.set(p.x, 0, p.z);

    // third-person camera behind the player
    target.set(p.x, 1.3, p.z);
    desired.set(p.x + Math.sin(cam.yaw) * CAM_DIST, CAM_HEIGHT, p.z + Math.cos(cam.yaw) * CAM_DIST);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 9));
    camera.lookAt(target);
  });

  if (!mine) return null;
  return (
    <group ref={group}>
      <KayCharacter look={look} animRef={anim} alive={mine.alive} />
      <pointLight ref={light} position={[-0.4, 1.0, 0.3]} color="#ffb860" intensity={0} distance={8} decay={2} />
      <Overhead text={over.text} emote={over.emote} />
    </group>
  );
}
