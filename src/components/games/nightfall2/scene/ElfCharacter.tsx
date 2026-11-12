import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EMOTE_DURATION_MS, JUMP_DURATION_MS } from '../../../../../shared/nightfall2/constants';
import { ACCESSORIES, CLOTH, EYES, HAIR_COLORS, HAIR_STYLES, HATS, MOUTHS, SKIN, type Look } from '../../../../../shared/nightfall2/look';
import { env } from '../store';
import type { AnimState } from './anim';

const JUMP_HEIGHT = 1.15;
const lerp = THREE.MathUtils.lerp;
const damp = (cur: number, target: number, k: number, dt: number) => lerp(cur, target, 1 - Math.exp(-k * dt));

/**
 * A toy-like elf built from primitives: legs, arms, head, hair, hat, outfit, accessory, lantern.
 * Walk cycle, idle breathing, jump arc with squash & stretch and eight emote animations are all
 * driven in code, so no model files are needed. Every part is a plain mesh → cheap for 15 players.
 */
export function ElfCharacter({ look, animRef, alive = true, scale = 1 }: { look: Look; animRef: React.RefObject<AnimState>; alive?: boolean; scale?: number }) {
  const body = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.MeshStandardMaterial>(null);
  const ph = useRef(0);
  const colors = useMemo(() => ({
    skin: SKIN[look.skin], hair: HAIR_COLORS[look.hairColor], hat: CLOTH[look.hatColor],
    top: CLOTH[look.top], bottom: CLOTH[look.bottom], shoes: CLOTH[look.shoes], acc: CLOTH[look.accColor],
  }), [look]);
  const opacity = alive ? 1 : 0.35;

  useFrame(({ clock }, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = clock.elapsedTime;
    const now = performance.now();
    const anim = animRef.current;
    const B = body.current, T = torso.current, H = head.current, LL = legL.current, LR = legR.current, AL = armL.current, AR = armR.current;
    if (!B || !T || !H || !LL || !LR || !AL || !AR) return;

    // targets (rest pose), overwritten by whichever animation is active
    let legLx = 0, legRx = 0, armLx = 0, armRx = 0, armLz = 0, armRz = 0, headX = 0, headY = 0, headZ = 0, bodyY = 0, bodyRx = 0, bodyRy = 0, sy = 1;

    if (anim.moving) {
      ph.current += dt * 11;
      const s = Math.sin(ph.current);
      legLx = s * 0.8; legRx = -s * 0.8;
      armLx = -s * 0.7; armRx = s * 0.7;
      bodyY = Math.abs(Math.cos(ph.current)) * 0.06;
      bodyRx = 0.06;
    } else {
      sy = 1 + Math.sin(t * 2.2) * 0.012;
      armLz = -0.06 + Math.sin(t * 1.6) * 0.03;
      armRz = 0.06 - Math.sin(t * 1.6) * 0.03;
      headY = Math.sin(t * 0.7) * 0.08;
    }

    const jp = (now - anim.jumpStart) / JUMP_DURATION_MS;
    if (jp >= 0 && jp <= 1) {
      bodyY += 4 * JUMP_HEIGHT * jp * (1 - jp);
      legLx = -0.6 * Math.sin(jp * Math.PI); legRx = -0.9 * Math.sin(jp * Math.PI);
      armLz = -2.4 * Math.sin(jp * Math.PI); armRz = 2.4 * Math.sin(jp * Math.PI);
      sy = jp < 0.12 ? 0.85 : jp > 0.9 ? 0.88 : 1.08; // squash on take-off and landing, stretch in the air
    }

    const es = (now - anim.emoteStart) / 1000;
    if (anim.emote >= 0 && es >= 0 && es * 1000 <= EMOTE_DURATION_MS) {
      switch (anim.emote) {
        case 0: armRz = 2.7 + Math.sin(es * 14) * 0.35; headZ = -0.15; break; // wave
        case 1: bodyRx = Math.sin(es * 20) * 0.08; headX = -0.3; bodyY += Math.abs(Math.sin(es * 10)) * 0.05; armLx = armRx = -0.6; break; // laugh
        case 2: headX = 0.45; armLx = armRx = -2.5; armLz = 0.4; armRz = -0.4; bodyY += Math.sin(es * 7) * 0.02; break; // cry
        case 3: headY = Math.sin(es * 12) * 0.25; legLx = Math.max(0, Math.sin(es * 8)) * 0.9; armLz = -0.5; armRz = 0.5; armLx = armRx = 0.6; bodyRx = 0.12; break; // angry stomp
        case 4: armRx = -2.4; armRz = 0.5; headZ = 0.25; headY = 0.3; break; // think
        case 5: armRx = -1.6; headY = 0.1; break; // point
        case 6: bodyRy = Math.sin(es * 6) * 0.5; bodyY += Math.abs(Math.sin(es * 12)) * 0.08; armLz = -2.2 + Math.sin(es * 12) * 0.4; armRz = 2.2 - Math.sin(es * 12) * 0.4; legLx = Math.sin(es * 12) * 0.4; legRx = -legLx; break; // dance
        case 7: armLz = -2.9; armRz = 2.9; headX = -0.2; bodyY += Math.abs(Math.sin(es * 5)) * 0.04; break; // heart
      }
    }

    const k = 14;
    LL.rotation.x = damp(LL.rotation.x, legLx, k, dt);
    LR.rotation.x = damp(LR.rotation.x, legRx, k, dt);
    AL.rotation.x = damp(AL.rotation.x, armLx, k, dt);
    AR.rotation.x = damp(AR.rotation.x, armRx, k, dt);
    AL.rotation.z = damp(AL.rotation.z, armLz, k, dt);
    AR.rotation.z = damp(AR.rotation.z, armRz, k, dt);
    H.rotation.set(damp(H.rotation.x, headX, k, dt), damp(H.rotation.y, headY, k, dt), damp(H.rotation.z, headZ, k, dt));
    B.position.y = jp >= 0 && jp <= 1 ? bodyY : damp(B.position.y, bodyY, 20, dt);
    B.rotation.x = damp(B.rotation.x, bodyRx, k, dt);
    B.rotation.y = damp(B.rotation.y, bodyRy, k, dt);
    B.scale.y = damp(B.scale.y, sy, 18, dt);
    if (lamp.current) lamp.current.emissiveIntensity = 0.3 + env.night * 2.2;
  });

  const mat = (color: string) => <meshStandardMaterial color={color} transparent={!alive} opacity={opacity} />;
  const hair = HAIR_STYLES[look.hair];
  const hat = HATS[look.hat];
  const eyes = EYES[look.eyes];
  const mouth = MOUTHS[look.mouth];
  const acc = ACCESSORIES[look.acc];

  return (
    <group ref={body} scale={scale}>
      {/* legs (pivot at the hip) */}
      <group ref={legL} position={[-0.14, 0.8, 0]}>
        <mesh position={[0, -0.4, 0]}><boxGeometry args={[0.2, 0.8, 0.22]} />{mat(colors.bottom)}</mesh>
        <mesh position={[0, -0.74, 0.05]}><boxGeometry args={[0.23, 0.14, 0.34]} />{mat(colors.shoes)}</mesh>
      </group>
      <group ref={legR} position={[0.14, 0.8, 0]}>
        <mesh position={[0, -0.4, 0]}><boxGeometry args={[0.2, 0.8, 0.22]} />{mat(colors.bottom)}</mesh>
        <mesh position={[0, -0.74, 0.05]}><boxGeometry args={[0.23, 0.14, 0.34]} />{mat(colors.shoes)}</mesh>
      </group>

      <group ref={torso}>
        <mesh position={[0, 1.12, 0]}><boxGeometry args={[0.54, 0.66, 0.32]} />{mat(colors.top)}</mesh>
        <mesh position={[0, 0.82, 0]}><boxGeometry args={[0.56, 0.08, 0.34]} />{mat('#3b2a1a')}</mesh>
        {acc === 'cape' && <mesh position={[0, 0.95, -0.2]} rotation={[0.12, 0, 0]}><boxGeometry args={[0.6, 0.95, 0.03]} />{mat(colors.acc)}</mesh>}
        {acc === 'backpack' && <mesh position={[0, 1.12, -0.26]}><boxGeometry args={[0.4, 0.46, 0.2]} />{mat(colors.acc)}</mesh>}
        {acc === 'scarf' && <mesh position={[0, 1.42, 0.02]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.22, 0.07, 8, 16]} />{mat(colors.acc)}</mesh>}
        {acc === 'wings' && [-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.32, 1.25, -0.2]} rotation={[0, s * 0.5, s * 0.6]}><coneGeometry args={[0.22, 0.7, 3]} /><meshStandardMaterial color={colors.acc} transparent opacity={0.8 * opacity} /></mesh>
        ))}
      </group>

      {/* arms (pivot at the shoulder); the left hand carries the lantern */}
      <group ref={armL} position={[-0.34, 1.4, 0]}>
        <mesh position={[0, -0.28, 0]}><boxGeometry args={[0.15, 0.56, 0.15]} />{mat(colors.top)}</mesh>
        <mesh position={[0, -0.6, 0]}><sphereGeometry args={[0.09, 8, 8]} />{mat(colors.skin)}</mesh>
        <mesh position={[0, -0.72, 0.08]}><sphereGeometry args={[0.09, 8, 8]} /><meshStandardMaterial ref={lamp} color="#ffd27a" emissive="#ffb347" emissiveIntensity={0.3} /></mesh>
      </group>
      <group ref={armR} position={[0.34, 1.4, 0]}>
        <mesh position={[0, -0.28, 0]}><boxGeometry args={[0.15, 0.56, 0.15]} />{mat(colors.top)}</mesh>
        <mesh position={[0, -0.6, 0]}><sphereGeometry args={[0.09, 8, 8]} />{mat(colors.skin)}</mesh>
      </group>

      {/* head (pivot at the neck) */}
      <group ref={head} position={[0, 1.45, 0]}>
        <mesh position={[0, 0.3, 0]}><sphereGeometry args={[0.3, 16, 14]} />{mat(colors.skin)}</mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.31, 0.36, 0]} rotation={[0, 0, s * -1.1]}><coneGeometry args={[0.07, 0.32, 6]} />{mat(colors.skin)}</mesh>
        ))}
        {/* eyes */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.11, eyes === 'sleepy' ? 0.3 : 0.33, 0.26]}>
            {eyes === 'happy' ? (
              <mesh rotation={[0, 0, Math.PI]}><torusGeometry args={[0.045, 0.014, 6, 10, Math.PI]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
            ) : eyes === 'sleepy' ? (
              <mesh><boxGeometry args={[0.09, 0.02, 0.02]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
            ) : (
              <>
                <mesh><sphereGeometry args={[eyes === 'wide' ? 0.06 : 0.045, 10, 8]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
                <mesh position={[0.015, 0.015, 0.035]}><sphereGeometry args={[0.016, 6, 6]} /><meshStandardMaterial color="#fff" /></mesh>
              </>
            )}
          </group>
        ))}
        {/* mouth */}
        {mouth === 'smile' && <mesh position={[0, 0.2, 0.27]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.05, 0.012, 6, 10, Math.PI]} /><meshStandardMaterial color="#7a2e2e" /></mesh>}
        {mouth === 'flat' && <mesh position={[0, 0.2, 0.28]}><boxGeometry args={[0.09, 0.015, 0.02]} /><meshStandardMaterial color="#7a2e2e" /></mesh>}
        {mouth === 'open' && <mesh position={[0, 0.19, 0.27]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#5a1e1e" /></mesh>}

        {/* hair */}
        {hair === 'short' && <mesh position={[0, 0.4, -0.02]}><sphereGeometry args={[0.31, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />{mat(colors.hair)}</mesh>}
        {hair === 'bob' && <mesh position={[0, 0.3, -0.03]}><sphereGeometry args={[0.33, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62]} />{mat(colors.hair)}</mesh>}
        {hair === 'long' && (
          <>
            <mesh position={[0, 0.4, -0.02]}><sphereGeometry args={[0.31, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />{mat(colors.hair)}</mesh>
            <mesh position={[0, 0.05, -0.18]}><boxGeometry args={[0.5, 0.6, 0.18]} />{mat(colors.hair)}</mesh>
          </>
        )}
        {hair === 'bun' && (
          <>
            <mesh position={[0, 0.4, -0.02]}><sphereGeometry args={[0.31, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />{mat(colors.hair)}</mesh>
            <mesh position={[0, 0.66, -0.1]}><sphereGeometry args={[0.12, 10, 8]} />{mat(colors.hair)}</mesh>
          </>
        )}
        {hair === 'spiky' && [0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - 2) * 0.1, 0.62, -0.02 + Math.abs(i - 2) * 0.03]} rotation={[0, 0, (i - 2) * -0.25]}><coneGeometry args={[0.07, 0.3, 5]} />{mat(colors.hair)}</mesh>
        ))}
        {hair === 'ponytail' && (
          <>
            <mesh position={[0, 0.4, -0.02]}><sphereGeometry args={[0.31, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />{mat(colors.hair)}</mesh>
            <mesh position={[0, 0.3, -0.36]} rotation={[0.5, 0, 0]}><capsuleGeometry args={[0.07, 0.4, 4, 8]} />{mat(colors.hair)}</mesh>
          </>
        )}

        {/* hat */}
        {hat === 'wizard' && <mesh position={[0, 0.78, -0.02]} rotation={[0, 0, 0.1]}><coneGeometry args={[0.36, 0.75, 10]} />{mat(colors.hat)}</mesh>}
        {hat === 'wizard' && <mesh position={[0, 0.5, -0.02]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.3, 0.5, 16]} /><meshStandardMaterial color={colors.hat} side={THREE.DoubleSide} /></mesh>}
        {hat === 'hood' && <mesh position={[0, 0.36, -0.04]}><sphereGeometry args={[0.37, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />{mat(colors.hat)}</mesh>}
        {hat === 'crown' && (
          <>
            <mesh position={[0, 0.58, 0]}><cylinderGeometry args={[0.2, 0.22, 0.14, 8, 1, true]} /><meshStandardMaterial color="#f5c542" side={THREE.DoubleSide} metalness={0.6} roughness={0.3} /></mesh>
            {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[Math.cos(i / 5 * Math.PI * 2) * 0.2, 0.7, Math.sin(i / 5 * Math.PI * 2) * 0.2]}><coneGeometry args={[0.04, 0.12, 4]} /><meshStandardMaterial color="#f5c542" metalness={0.6} roughness={0.3} /></mesh>)}
          </>
        )}
        {hat === 'leaf' && <mesh position={[0, 0.56, -0.02]} rotation={[0.1, 0, 0]} scale={[1, 0.45, 1]}><coneGeometry args={[0.4, 0.5, 6]} />{mat('#4f9a3a')}</mesh>}
        {hat === 'beret' && <mesh position={[0.06, 0.58, -0.04]} rotation={[0, 0, -0.2]} scale={[1, 0.35, 1]}><sphereGeometry args={[0.33, 12, 8]} />{mat(colors.hat)}</mesh>}
        {hat === 'helmet' && (
          <>
            <mesh position={[0, 0.38, -0.02]}><sphereGeometry args={[0.34, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color="#8c93a3" metalness={0.5} roughness={0.4} /></mesh>
            <mesh position={[0, 0.5, -0.02]}><boxGeometry args={[0.06, 0.35, 0.5]} />{mat(colors.hat)}</mesh>
          </>
        )}
      </group>
    </group>
  );
}
