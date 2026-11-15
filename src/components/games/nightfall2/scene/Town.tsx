import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  BRIDGES, FURNITURE_SCALE, HOUSES, LANTERNS, PLATFORMS, PLAZA_RADIUS, RAMPS, RIVER, TILE, TREES, TREE_SCALE, WELL_AT, WORLD_HALF,
  houseBounds, type House, type Side,
} from '../../../../../shared/nightfall2/town';
import { env, view } from '../store';
import { Pieces } from './Pieces';
import { owned, place, type Placement } from './placements';

/** The house the local player has entered: its upper floors, chimney and roof are hidden. */
const enteredHouse = () => view.house;

const BASE = import.meta.env.BASE_URL;
const town = (n: string) => `${BASE}models/nf2/town/${n}.glb`;
const nature = (n: string) => `${BASE}models/nf2/nature/${n}.glb`;
const furniture = (n: string) => `${BASE}models/nf2/furniture/${n}.glb`;

/** Wall tiles face outward: the kit's slab sits on the tile's +x edge, so rotate +x onto each side. */
const SIDE_ROT: Record<Side, number> = { E: 0, N: Math.PI / 2, W: Math.PI, S: -Math.PI / 2 };

interface HousePieces { walls: Record<string, Placement[]>; floor: Placement[]; chimneys: Placement[]; furniture: Record<string, Placement[]> }

/** Lays out every wall / floor / furniture piece of every house (static, computed once). */
function layoutHouses(): HousePieces {
  const walls: Record<string, Placement[]> = {};
  const floor: Placement[] = [];
  const chimneys: Placement[] = [];
  const furn: Record<string, Placement[]> = {};
  const add = (map: Record<string, Placement[]>, name: string, p: Placement) => { (map[name] ??= []).push(p); };
  HOUSES.forEach((hs, houseIndex) => {
    const b = houseBounds(hs);
    const pre = hs.style === 'wood' ? 'wall-wood' : 'wall';
    const doorTile = (n: number) => Math.floor(n / 2);
    for (let f = 0; f < hs.floors; f++) {
      const y = f * TILE;
      const pieceFor = (i: number, side: Side, n: number) => {
        if (f === 0 && side === hs.door && i === doorTile(n)) return `${pre}-doorway-square`;
        if (f === 0) return i % 2 === 0 ? `${pre}-window-shutters` : pre;
        return i % 2 === 1 ? `${pre}-window-glass` : `${pre}-window-shutters`;
      };
      for (let i = 0; i < hs.w; i++) {
        const x = b.minX + (i + 0.5) * TILE;
        add(walls, pieceFor(i, 'N', hs.w), owned(place(x, y, b.minZ + TILE / 2, SIDE_ROT.N, TILE), houseIndex));
        add(walls, pieceFor(i, 'S', hs.w), owned(place(x, y, b.maxZ - TILE / 2, SIDE_ROT.S, TILE), houseIndex));
      }
      for (let j = 0; j < hs.d; j++) {
        const z = b.minZ + (j + 0.5) * TILE;
        add(walls, pieceFor(j, 'W', hs.d), owned(place(b.minX + TILE / 2, y, z, SIDE_ROT.W, TILE), houseIndex));
        add(walls, pieceFor(j, 'E', hs.d), owned(place(b.maxX - TILE / 2, y, z, SIDE_ROT.E, TILE), houseIndex));
      }
    }
    for (let i = 0; i < hs.w; i++) for (let j = 0; j < hs.d; j++) floor.push(place(b.minX + (i + 0.5) * TILE, 0, b.minZ + (j + 0.5) * TILE, 0, TILE, 0.3, TILE));
    if (hs.style === 'wood') chimneys.push(owned(place(b.maxX - TILE * 0.6, hs.floors * TILE + 0.2, b.minZ + TILE * 0.5, 0, TILE), houseIndex));
    for (const fu of hs.furniture) add(furn, fu.name, place(hs.x + fu.dx, 0.1, hs.z + fu.dz, fu.rot, FURNITURE_SCALE));
  });
  return { walls, floor, chimneys, furniture: furn };
}

/** One roof per house (not instanced) so it can vanish while you are inside. */
function Roof({ hs, index }: { hs: House; index: number }) {
  const gltf = useGLTF(town(hs.roof === 'point' ? 'roof-point' : 'roof-gable'));
  const obj = useMemo(() => gltf.scene.clone(), [gltf]);
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (g) g.visible = view.house !== index;
  });
  const ridgeAlongX = hs.w >= hs.d;
  return (
    <group ref={ref} position={[hs.x, hs.floors * TILE, hs.z]} rotation={[0, ridgeAlongX ? 0 : Math.PI / 2, 0]} scale={[(ridgeAlongX ? hs.w : hs.d) * TILE, TILE * (hs.roof === 'point' ? 1.1 : 1.0), (ridgeAlongX ? hs.d : hs.w) * TILE]}>
      <primitive object={obj} />
    </group>
  );
}

/** Upper-floor walls of the house you are in are hidden too, so the camera can look into the room. */
function UpperWalls({ walls }: { walls: Record<string, Placement[]> }) {
  return (
    <>
      {Object.entries(walls).map(([name, items]) => <Pieces key={name} url={town(name)} items={items} hideOwner={enteredHouse} />)}
    </>
  );
}

export function Town() {
  const layout = useMemo(layoutHouses, []);
  const lampMat = useRef<THREE.MeshStandardMaterial>(null);
  const waterMat = useRef<THREE.MeshStandardMaterial>(null);
  const lights = useRef<THREE.PointLight[]>([]);
  useFrame(({ clock }) => {
    const n = env.night;
    if (lampMat.current) lampMat.current.emissiveIntensity = 0.2 + n * 2.5;
    if (waterMat.current) waterMat.current.opacity = 0.78 + Math.sin(clock.elapsedTime * 1.3) * 0.06;
    for (const l of lights.current) if (l) l.intensity = n * 14;
  });
  const riverLen = WORLD_HALF * 2 + 20;
  const riverW = RIVER.z1 - RIVER.z0;
  const riverZ = (RIVER.z0 + RIVER.z1) / 2;

  // the ground-floor walls stay; upper floors + roofs are split so the house you stand in can open up
  const { ground, upper } = useMemo(() => {
    const ground: Record<string, Placement[]> = {};
    const upper: Record<string, Placement[]> = {};
    for (const [name, items] of Object.entries(layout.walls)) {
      for (const it of items) ((it.y > 0.01 ? upper : ground)[name] ??= []).push(it);
    }
    return { ground, upper };
  }, [layout]);

  const cliffs = useMemo(() => {
    const blocks: Placement[] = [];
    for (const p of PLATFORMS) {
      const w = Math.round(p.maxX - p.minX), d = Math.round(p.maxZ - p.minZ);
      for (let layer = 0; layer < p.h; layer++) {
        const top = layer === p.h - 1;
        for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) {
          if (!top && i > 0 && i < w - 1 && j > 0 && j < d - 1) continue; // hidden core
          blocks.push(place(p.minX + i + 0.5, layer + 0.05, p.minZ + j + 0.5, 0, 1));
        }
      }
    }
    return blocks;
  }, []);
  const slopes = useMemo(() => RAMPS.map((r) => {
    const len = r.axis === 'x' ? r.maxX - r.minX : r.maxZ - r.minZ;
    const wid = r.axis === 'x' ? r.maxZ - r.minZ : r.maxX - r.minX;
    const rise = Math.max(r.h0, r.h1);
    // the kit's slope rises towards −x; turn it so the high end meets the platform
    const highAtMin = r.h0 > r.h1;
    const rot = r.axis === 'x' ? (highAtMin ? 0 : Math.PI) : highAtMin ? Math.PI / 2 : -Math.PI / 2;
    return place((r.minX + r.maxX) / 2, 0.05, (r.minZ + r.maxZ) / 2, rot, len / 1.2, rise, wid);
  }), []);
  const oaks = useMemo(() => TREES.filter((t) => t.kind === 'oak').map((t) => place(t.x, -0.1, t.z, (t.x * 7 + t.z * 3) % 6.28, TREE_SCALE * t.s)), []);
  const pines = useMemo(() => TREES.filter((t) => t.kind === 'pine').map((t) => place(t.x, -0.1, t.z, (t.x * 5 + t.z * 11) % 6.28, TREE_SCALE * t.s)), []);
  const lanterns = useMemo(() => LANTERNS.map((l) => place(l.x, 0, l.z, 0, 1.8)), []);
  const stalls = useMemo(() => [place(14.5, 0, -7.5, Math.PI / 2, TILE), place(14.5, 0, 7.5, -Math.PI / 2, TILE), place(21, 0, -8, 0, TILE)], []);
  const rocks = useMemo(() => [place(-20, 0, 16, 0.4, 3), place(36, 0, -16, 1.1, 2.5), place(-38, 0, 24, 2.2, 3.2), place(20, 0, 32, 0.8, 2.8)], []);
  const bushes = useMemo(() => Array.from({ length: 24 }, (_, i) => place(Math.sin(i * 2.4) * 30, 0, Math.cos(i * 1.7) * 30 + (i % 3) * 2, i, 3 + (i % 3))).filter((b) => Math.hypot(b.x, b.z) > PLAZA_RADIUS + 2 && !(b.z > RIVER.z0 - 2 && b.z < RIVER.z1 + 2)), []);

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

      {/* the well, off to one side so the middle stays clear for the night circle */}
      <group position={[WELL_AT.x, 0, WELL_AT.z]}>
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
      </group>

      {/* houses: Kenney Fantasy Town walls on a 2.5 m grid, plank floors, roofs, chimneys, furniture */}
      {Object.entries(ground).map(([name, items]) => <Pieces key={name} url={town(name)} items={items} />)}
      <UpperWalls walls={upper} />
      <Pieces url={town('planks')} items={layout.floor} />
      <Pieces url={town('chimney')} items={layout.chimneys} hideOwner={enteredHouse} />
      {HOUSES.map((hs, i) => <Roof key={i} hs={hs} index={i} />)}
      {Object.entries(layout.furniture).map(([name, items]) => <Pieces key={name} url={furniture(name)} items={items} />)}

      {/* high ground: cliff blocks and slopes from the Nature kit */}
      <Pieces url={nature('cliff_block_rock')} items={cliffs} />
      <Pieces url={nature('cliff_blockSlope_rock')} items={slopes} />

      {/* nature and props */}
      <Pieces url={nature('tree_oak')} items={oaks} />
      <Pieces url={nature('tree_pineTallA')} items={pines} />
      <Pieces url={nature('rock_largeA')} items={rocks} />
      <Pieces url={nature('plant_bush')} items={bushes} />
      <Pieces url={town('stall')} items={stalls} />
      <Pieces url={town('lantern')} items={lanterns} />
      <WindowGlow />
      {LANTERNS.map((l, i) => (
        <group key={i} position={[l.x, 0, l.z]}>
          <mesh position={[0, 2.55, 0]}>
            <sphereGeometry args={[0.16, 10, 8]} />
            <meshStandardMaterial ref={i === 0 ? lampMat : undefined} color="#ffe2a6" emissive="#ffb347" emissiveIntensity={0.2} />
          </mesh>
          {i < 8 && <pointLight ref={(el) => { if (el) lights.current[i] = el; }} position={[0, 2.6, 0]} color="#ffb860" intensity={0} distance={11} decay={2} />}
        </group>
      ))}
    </group>
  );
}

/** Warm glow behind every ground-floor window at night: a small emissive quad per house. */
function WindowGlow() {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3a2a10', emissive: '#ffcf7a', emissiveIntensity: 0, side: THREE.DoubleSide }), []);
  const live = useRef<THREE.MeshStandardMaterial | null>(null);
  useEffect(() => { live.current = material; }, [material]);
  useFrame(() => {
    const m = live.current;
    if (m) m.emissiveIntensity = env.night * 1.4;
  });
  const quads = useMemo(() => HOUSES.flatMap((hs) => {
    const b = houseBounds(hs);
    const out: [number, number, number, number][] = [];
    for (let i = 0; i < hs.w; i += 2) {
      out.push([b.minX + (i + 0.5) * TILE, 1.4, b.minZ + 0.28, 0]);
      out.push([b.minX + (i + 0.5) * TILE, 1.4, b.maxZ - 0.28, 0]);
    }
    return out;
  }), []);
  return (
    <>
      {quads.map(([x, y, z, rot], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, rot, 0]} material={material}>
          <planeGeometry args={[0.9, 0.9]} />
        </mesh>
      ))}
    </>
  );
}
