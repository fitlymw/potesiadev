import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { NAME_RADIUS_NIGHT } from '../../../../../shared/nightfall2/constants';
import { env, positions, useNf2, type Roster } from '../store';
import { useNow } from '../useNow';

const BUBBLE_MS = 5000;

/** Everyone except me, smoothed towards the server's 20 Hz positions. */
export function RemotePlayers({ meRef }: { meRef: React.RefObject<THREE.Vector3> }) {
  const roster = useNf2((s) => s.roster);
  const me = useNf2((s) => s.me);
  const chat = useNf2((s) => s.chat);
  const now = useNow(); // bubbles expire on a half-second tick
  return (
    <>
      {roster.filter((p) => p.id !== me).map((p) => {
        const last = [...chat].reverse().find((c) => c.from === p.id && now - c.at < BUBBLE_MS);
        return <RemotePlayer key={p.id} p={p} bubble={last?.text} meRef={meRef} />;
      })}
    </>
  );
}

function RemotePlayer({ p, bubble, meRef }: { p: Roster; bubble?: string; meRef: React.RefObject<THREE.Vector3> }) {
  const group = useRef<THREE.Group>(null);
  const tag = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    const pose = positions.get(p.id);
    const g = group.current;
    if (!pose || !g) return;
    const k = 1 - Math.exp(-dt * 12);
    g.position.x += (pose.x - g.position.x) * k;
    g.position.z += (pose.z - g.position.z) * k;
    g.rotation.y = lerpAngle(g.rotation.y, pose.rot, k);
    if (body.current) {
      t.current += dt * (pose.moving ? 11 : 0);
      body.current.position.y = pose.moving ? Math.abs(Math.sin(t.current)) * 0.06 : 0;
    }
    if (tag.current && meRef.current) {
      const d = Math.hypot(meRef.current.x - g.position.x, meRef.current.z - g.position.z);
      tag.current.visible = env.night < 0.5 || d < NAME_RADIUS_NIGHT;
    }
  });
  return (
    <group ref={group}>
      <group ref={body}>
        <Avatar color={p.color} alive={p.alive} />
      </group>
      <group ref={tag} position={[0, 2.25, 0]}>
        <Billboard>
          <Text fontSize={0.26} color="#fff" outlineWidth={0.02} outlineColor="#000" anchorY="bottom">
            {p.name}
          </Text>
        </Billboard>
      </group>
      {bubble && (
        <Html position={[0, 2.7, 0]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="max-w-[180px] rounded-xl bg-white/95 px-3 py-1.5 text-[13px] leading-snug text-zinc-900 shadow">{bubble}</div>
        </Html>
      )}
    </group>
  );
}

/** Capsule body + head + a lantern in hand. Will be replaced by the Quaternius character. */
export function Avatar({ color, alive }: { color: string; alive: boolean }) {
  const skin = useMemo(() => new THREE.Color('#f1c9a5'), []);
  return (
    <group>
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.7, 4, 10]} />
        <meshStandardMaterial color={color} transparent={!alive} opacity={alive ? 1 : 0.35} />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.28, 14, 12]} />
        <meshStandardMaterial color={skin} transparent={!alive} opacity={alive ? 1 : 0.35} />
      </mesh>
      {/* elf ears */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.3, 1.7, 0]} rotation={[0, 0, s * -0.9]}>
          <coneGeometry args={[0.07, 0.3, 6]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      ))}
      <mesh position={[0.4, 0.9, 0.2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function lerpAngle(a: number, b: number, k: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}
