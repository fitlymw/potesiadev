import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BUILDINGS, LANTERNS, PLAZA_RADIUS, TREES, WORLD_HALF } from '../../../../../shared/nightfall2/town';
import { env } from '../store';

/**
 * Placeholder Elf Town: boxes, pyramids and cones laid out from the shared map.
 * Swapping in the Kenney Fantasy Town Kit later only touches this file.
 */
export function Town() {
  const windowMat = useRef<THREE.MeshStandardMaterial>(null);
  const lampMat = useRef<THREE.MeshStandardMaterial>(null);
  const lights = useRef<THREE.PointLight[]>([]);
  useFrame(() => {
    const n = env.night;
    if (windowMat.current) windowMat.current.emissiveIntensity = n * 1.6;
    if (lampMat.current) lampMat.current.emissiveIntensity = 0.2 + n * 2.5;
    for (const l of lights.current) if (l) l.intensity = n * 14;
  });

  return (
    <group>
      {/* ground, plaza and streets */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD_HALF * 2 + 20, WORLD_HALF * 2 + 20]} />
        <meshStandardMaterial color="#5e8c47" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[PLAZA_RADIUS, 40]} />
        <meshStandardMaterial color="#9b9085" />
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

      {/* the well in the middle of the plaza */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 1, 12]} />
        <meshStandardMaterial color="#6f6a66" />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <coneGeometry args={[1.7, 0.9, 6]} />
        <meshStandardMaterial color="#7a4a3a" />
      </mesh>

      {BUILDINGS.map((b, i) => {
        const roofH = b.roofKind === 'gable' ? b.h * 0.55 : b.h * 0.4;
        return (
          <group key={i} position={[b.x, 0, b.z]}>
            <mesh position={[0, b.h / 2, 0]} castShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial color={b.color} />
            </mesh>
            <mesh position={[0, b.h + roofH / 2, 0]} rotation={[0, Math.PI / 4, 0]} scale={[b.w * 0.78, roofH, b.d * 0.78]}>
              <coneGeometry args={[1, 1, 4]} />
              <meshStandardMaterial color={b.roof} flatShading />
            </mesh>
            {/* door facing the nearest street, two lit windows */}
            <mesh position={[0, 0.9, b.z > 0 ? -b.d / 2 - 0.01 : b.d / 2 + 0.01]}>
              <planeGeometry args={[0.9, 1.8]} />
              <meshStandardMaterial color="#4a2e22" side={THREE.DoubleSide} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * b.w * 0.28, b.h * 0.6, b.z > 0 ? -b.d / 2 - 0.01 : b.d / 2 + 0.01]}>
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

function Trees() {
  const trunk = useRef<THREE.InstancedMesh>(null);
  const crown = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    TREES.forEach((t, i) => {
      dummy.position.set(t.x, 0.6 * t.s, t.z);
      dummy.scale.set(t.s, t.s, t.s);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunk.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x, 1.2 * t.s + 1.1 * t.s, t.z);
      dummy.rotation.set(0, (i * 0.7) % Math.PI, 0);
      dummy.updateMatrix();
      crown.current?.setMatrixAt(i, dummy.matrix);
    });
    if (trunk.current) trunk.current.instanceMatrix.needsUpdate = true;
    if (crown.current) crown.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);
  return (
    <>
      <instancedMesh ref={trunk} args={[undefined, undefined, TREES.length]}>
        <cylinderGeometry args={[0.18, 0.26, 1.2, 6]} />
        <meshStandardMaterial color="#5a3d2b" />
      </instancedMesh>
      <instancedMesh ref={crown} args={[undefined, undefined, TREES.length]}>
        <coneGeometry args={[1.1, 2.4, 7]} />
        <meshStandardMaterial color="#3f7a3a" flatShading />
      </instancedMesh>
    </>
  );
}
