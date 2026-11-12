import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BRIDGES, BUILDINGS, LANTERNS, PLAZA_RADIUS, RIVER, TREES, WORLD_HALF } from '../../../../../shared/nightfall2/town';
import { env } from '../store';

/**
 * Elf Town built from primitives: stone and wooden houses, a river with three bridges, pines,
 * giant oaks and lanterns — all laid out from the shared map so it matches the server's walls.
 */
export function Town() {
  const windowMat = useRef<THREE.MeshStandardMaterial>(null);
  const lampMat = useRef<THREE.MeshStandardMaterial>(null);
  const waterMat = useRef<THREE.MeshStandardMaterial>(null);
  const lights = useRef<THREE.PointLight[]>([]);
  useFrame(({ clock }) => {
    const n = env.night;
    if (windowMat.current) windowMat.current.emissiveIntensity = n * 1.6;
    if (lampMat.current) lampMat.current.emissiveIntensity = 0.2 + n * 2.5;
    if (waterMat.current) waterMat.current.opacity = 0.78 + Math.sin(clock.elapsedTime * 1.3) * 0.06;
    for (const l of lights.current) if (l) l.intensity = n * 14;
  });
  const riverLen = WORLD_HALF * 2 + 20;
  const riverW = RIVER.z1 - RIVER.z0;
  const riverZ = (RIVER.z0 + RIVER.z1) / 2;

  return (
    <group>
      {/* ground, plaza and streets */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WORLD_HALF * 2 + 20, WORLD_HALF * 2 + 20]} />
        <meshStandardMaterial color="#5e8c47" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[PLAZA_RADIUS, 40]} />
        <meshStandardMaterial color="#9b9085" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[PLAZA_RADIUS - 0.6, PLAZA_RADIUS, 40]} />
        <meshStandardMaterial color="#7f746a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[WORLD_HALF * 2, 4.5]} />
        <meshStandardMaterial color="#8d8378" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[4.5, WORLD_HALF * 2]} />
        <meshStandardMaterial color="#8d8378" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 16.5]}>
        <planeGeometry args={[34, 3.5]} />
        <meshStandardMaterial color="#8d8378" />
      </mesh>

      {/* the river: a sunken band with dark banks and a wobbling water plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, riverZ]}>
        <planeGeometry args={[riverLen, riverW + 1.2]} />
        <meshStandardMaterial color="#3d4a33" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, riverZ]}>
        <planeGeometry args={[riverLen, riverW]} />
        <meshStandardMaterial ref={waterMat} color="#3f86c6" transparent opacity={0.8} roughness={0.25} metalness={0.1} />
      </mesh>
      {BRIDGES.map((br, i) => (
        <group key={i} position={[br.x, 0, riverZ]}>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[br.width, 0.16, riverW + 1.6]} />
            <meshStandardMaterial color="#8a5a2b" />
          </mesh>
          {/* plank lines */}
          {Array.from({ length: 6 }, (_, k) => (
            <mesh key={k} position={[0, 0.305, -riverW / 2 - 0.6 + k * ((riverW + 1.2) / 5)]}>
              <boxGeometry args={[br.width, 0.01, 0.06]} />
              <meshStandardMaterial color="#5f3b1a" />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh position={[s * (br.width / 2 - 0.08), 0.75, 0]}>
                <boxGeometry args={[0.08, 0.08, riverW + 1.6]} />
                <meshStandardMaterial color="#6f4426" />
              </mesh>
              {[-1, 0, 1].map((k) => (
                <mesh key={k} position={[s * (br.width / 2 - 0.08), 0.5, k * (riverW / 2 + 0.6)]}>
                  <boxGeometry args={[0.12, 0.6, 0.12]} />
                  <meshStandardMaterial color="#6f4426" />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* the well in the middle of the plaza */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 1, 12]} />
        <meshStandardMaterial color="#6f6a66" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.0, 1.6, 0]}>
          <boxGeometry args={[0.12, 1.4, 0.12]} />
          <meshStandardMaterial color="#5a3d2b" />
        </mesh>
      ))}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[1.7, 0.9, 6]} />
        <meshStandardMaterial color="#7a4a3a" />
      </mesh>

      {BUILDINGS.map((b, i) => {
        const roofH = b.roofKind === 'gable' ? b.h * 0.55 : b.h * 0.4;
        const front = b.z > 0 ? -b.d / 2 - 0.01 : b.d / 2 + 0.01;
        return (
          <group key={i} position={[b.x, 0, b.z]}>
            <mesh position={[0, b.h / 2, 0]}>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial color={b.color} />
            </mesh>
            {b.style === 'wood' && Array.from({ length: Math.floor(b.h / 0.6) }, (_, k) => (
              <mesh key={k} position={[0, 0.3 + k * 0.6, 0]}>
                <boxGeometry args={[b.w + 0.03, 0.05, b.d + 0.03]} />
                <meshStandardMaterial color="#4a2d14" />
              </mesh>
            ))}
            {b.style === 'wood' && [-1, 1].map((s) => (
              <mesh key={s} position={[s * (b.w / 2 + 0.02), b.h / 2, 0]}>
                <boxGeometry args={[0.1, b.h, 0.14]} />
                <meshStandardMaterial color="#4a2d14" />
              </mesh>
            ))}
            <mesh position={[0, b.h + roofH / 2, 0]} rotation={[0, Math.PI / 4, 0]} scale={[b.w * 0.78, roofH, b.d * 0.78]}>
              <coneGeometry args={[1, 1, 4]} />
              <meshStandardMaterial color={b.roof} flatShading />
            </mesh>
            {b.style === 'wood' && (
              <mesh position={[b.w * 0.3, b.h + roofH * 0.9, -b.d * 0.15]}>
                <boxGeometry args={[0.4, roofH * 0.8, 0.4]} />
                <meshStandardMaterial color="#6b6b6b" />
              </mesh>
            )}
            <mesh position={[0, 0.9, front]}>
              <planeGeometry args={[0.9, 1.8]} />
              <meshStandardMaterial color="#4a2e22" side={THREE.DoubleSide} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * b.w * 0.28, b.h * 0.6, front]}>
                <planeGeometry args={[0.7, 0.7]} />
                <meshStandardMaterial ref={i === 0 && s === -1 ? windowMat : undefined} color="#2b2a35" emissive="#ffcf7a" emissiveIntensity={0} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        );
      })}

      <Trees />

      {LANTERNS.map((l, i) => (
        <group key={i} position={[l.x, 0, l.z]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 2.8, 6]} />
            <meshStandardMaterial color="#3b3b44" />
          </mesh>
          <mesh position={[0, 2.85, 0]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial ref={i === 0 ? lampMat : undefined} color="#ffe2a6" emissive="#ffb347" emissiveIntensity={0.2} />
          </mesh>
          {i < 8 && <pointLight ref={(el) => { if (el) lights.current[i] = el; }} position={[0, 2.8, 0]} color="#ffb860" intensity={0} distance={11} decay={2} />}
        </group>
      ))}
    </group>
  );
}

/** Pines (cone) and oaks (three-sphere canopy), instanced per kind. */
function Trees() {
  const pines = useMemo(() => TREES.filter((t) => t.kind === 'pine'), []);
  const oaks = useMemo(() => TREES.filter((t) => t.kind === 'oak'), []);
  const pineTrunk = useRef<THREE.InstancedMesh>(null);
  const pineCrown = useRef<THREE.InstancedMesh>(null);
  const oakTrunk = useRef<THREE.InstancedMesh>(null);
  const oakCrown = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    pines.forEach((t, i) => {
      dummy.position.set(t.x, 0.6 * t.s, t.z);
      dummy.scale.set(t.s, t.s, t.s);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      pineTrunk.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x, 2.3 * t.s, t.z);
      dummy.rotation.set(0, (i * 0.7) % Math.PI, 0);
      dummy.updateMatrix();
      pineCrown.current?.setMatrixAt(i, dummy.matrix);
    });
    oaks.forEach((t, i) => {
      dummy.position.set(t.x, 0.9 * t.s, t.z);
      dummy.scale.set(t.s, t.s, t.s);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      oakTrunk.current?.setMatrixAt(i, dummy.matrix);
      const blobs: [number, number, number, number][] = [[0, 2.3, 0, 1.25], [0.7, 1.9, 0.3, 0.9], [-0.6, 2.0, -0.4, 0.95]];
      blobs.forEach(([bx, by, bz, bs], k) => {
        dummy.position.set(t.x + bx * t.s, by * t.s, t.z + bz * t.s);
        dummy.scale.set(bs * t.s, bs * t.s * 0.85, bs * t.s);
        dummy.updateMatrix();
        oakCrown.current?.setMatrixAt(i * 3 + k, dummy.matrix);
      });
    });
    for (const m of [pineTrunk, pineCrown, oakTrunk, oakCrown]) if (m.current) m.current.instanceMatrix.needsUpdate = true;
  }, [dummy, pines, oaks]);
  return (
    <>
      <instancedMesh ref={pineTrunk} args={[undefined, undefined, pines.length]}>
        <cylinderGeometry args={[0.18, 0.26, 1.2, 6]} />
        <meshStandardMaterial color="#5a3d2b" />
      </instancedMesh>
      <instancedMesh ref={pineCrown} args={[undefined, undefined, pines.length]}>
        <coneGeometry args={[1.1, 2.6, 7]} />
        <meshStandardMaterial color="#3f7a3a" flatShading />
      </instancedMesh>
      <instancedMesh ref={oakTrunk} args={[undefined, undefined, oaks.length]}>
        <cylinderGeometry args={[0.28, 0.42, 1.8, 7]} />
        <meshStandardMaterial color="#4e3523" />
      </instancedMesh>
      <instancedMesh ref={oakCrown} args={[undefined, undefined, oaks.length * 3]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#4f8f3e" flatShading />
      </instancedMesh>
    </>
  );
}
