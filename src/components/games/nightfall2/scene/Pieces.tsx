import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Placement } from './placements';

const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);

/**
 * Many copies of one kit piece as instanced meshes (one draw call per material). The GLB's own
 * node transforms are folded into each instance, so any Kenney/KayKit file works unchanged.
 * Frustum culling is off because an InstancedMesh only knows the single piece's bounds.
 *
 * `hideOwner` lets the piece vanish for one house at a time (the one the player has entered):
 * matrices are only rewritten when that house changes, never per frame.
 */
export function Pieces({ url, items, hideOwner }: { url: string; items: Placement[]; hideOwner?: () => number }) {
  const gltf = useGLTF(url);
  const meshes = useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const out: { geometry: THREE.BufferGeometry; material: THREE.Material; local: THREE.Matrix4 }[] = [];
    gltf.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) out.push({ geometry: m.geometry, material: m.material as THREE.Material, local: m.matrixWorld.clone() });
    });
    return out;
  }, [gltf]);
  const instanced = useMemo(() => meshes.map((m) => {
    const im = new THREE.InstancedMesh(m.geometry, m.material, Math.max(1, items.length));
    im.frustumCulled = false;
    im.count = items.length;
    return im;
  }), [meshes, items.length]);

  const write = useCallback((hidden: number) => {
    const dummy = new THREE.Object3D();
    const mat = new THREE.Matrix4();
    instanced.forEach((im, mi) => {
      items.forEach((it, i) => {
        if (it.owner !== undefined && it.owner === hidden) {
          im.setMatrixAt(i, HIDDEN);
          return;
        }
        dummy.position.set(it.x, it.y, it.z);
        dummy.rotation.set(0, it.rot, 0);
        dummy.scale.set(it.sx, it.sy, it.sz);
        dummy.updateMatrix();
        mat.multiplyMatrices(dummy.matrix, meshes[mi].local);
        im.setMatrixAt(i, mat);
      });
      im.instanceMatrix.needsUpdate = true;
    });
  }, [instanced, items, meshes]);

  const shown = useRef(-1);
  useLayoutEffect(() => {
    shown.current = hideOwner?.() ?? -1;
    write(shown.current);
  }, [write, hideOwner]);

  useFrame(() => {
    if (!hideOwner) return;
    const h = hideOwner();
    if (h !== shown.current) {
      shown.current = h;
      write(h);
    }
  });

  return (
    <>
      {instanced.map((im, i) => <primitive key={i} object={im} />)}
    </>
  );
}
