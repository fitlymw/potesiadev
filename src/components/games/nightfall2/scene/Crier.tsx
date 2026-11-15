import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CRIER_SPOT } from '../../../../../shared/nightfall2/town';
import type { Look } from '../../../../../shared/nightfall2/look';
import { env, useNf2 } from '../store';
import { KayCharacter } from './KayCharacter';
import { newAnim } from './anim';
import type { TEXT } from '../texts';

/** An old hooded Rogue in a Mage's robe and a dark cape. */
const CRIER_LOOK: Look = { head: 1, body: 2, arms: 2, legs: 2, cape: 2, hat: 4, tintHead: 10, tintBody: 10, tintArms: 10, tintLegs: 9, tintCape: 10, tintHat: 10, height: 1 };

/**
 * The Town Crier: an old hooded elf who steps up to the well as night falls, rings the bell and
 * reads the bulletin. Only exists at night; sinks back into the dark at dawn.
 */
export function Crier({ t }: { t: (typeof TEXT)['id'] }) {
  const crier = useNf2((s) => s.crier);
  const phase = useNf2((s) => s.phase);
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const anim = useRef(newAnim());
  const line = crier && crier.index >= 0 && crier.index < crier.lines.length ? crier.lines[crier.index] : null;
  const speaking = !!line;

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    // rises out of the ground at nightfall, sinks at dawn
    const targetY = phase === 'night' ? 0 : -2.6;
    g.position.y += (targetY - g.position.y) * Math.min(1, dt * 2.2);
    g.visible = g.position.y > -2.5;
    // while reading: the bell arm is up (the "wave" pose), re-triggered so it never times out
    const a = anim.current;
    if (speaking) {
      a.emote = 0;
      if (performance.now() - a.emoteStart > 2000) a.emoteStart = performance.now();
    } else {
      a.emote = -1;
    }
    const l = light.current;
    if (l) l.intensity = env.night * 9;
  });

  return (
    <group ref={group} position={[CRIER_SPOT.x, -2.6, CRIER_SPOT.z]} rotation={[0, CRIER_SPOT.rot, 0]}>
      <KayCharacter look={CRIER_LOOK} animRef={anim} scale={1.08} />
      {/* the bell in the right hand */}
      <mesh position={[0.36, 0.78, 0.05]}>
        <coneGeometry args={[0.1, 0.16, 10, 1, true]} />
        <meshStandardMaterial color="#d4a017" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={light} position={[0, 1.6, 0.4]} color="#ffc070" intensity={0} distance={10} decay={2} />
      <group position={[0, 2.35, 0]}>
        <Billboard>
          <Text fontSize={0.24} color="#ffd98a" outlineWidth={0.02} outlineColor="#000" anchorY="bottom">
            {`🔔 ${t.crier}`}
          </Text>
        </Billboard>
      </group>
      {line && (
        <Html position={[0, 2.75, 0]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="max-w-[240px] rounded-xl border border-amber-300/60 bg-[#1a1408]/95 px-3 py-2 text-[13px] leading-snug text-amber-100 shadow-lg">{line}</div>
        </Html>
      )}
    </group>
  );
}
