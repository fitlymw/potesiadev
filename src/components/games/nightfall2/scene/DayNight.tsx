import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { env, nf2 } from '../store';

const DAY = { sky: new THREE.Color('#cfe3ff'), fogNear: 70, fogFar: 160, sun: 2.4, sunColor: new THREE.Color('#fff1d6'), ambient: 0.75 };
const NIGHT = { sky: new THREE.Color('#070b1a'), fogNear: 5, fogFar: 26, sun: 0.12, sunColor: new THREE.Color('#5570b8'), ambient: 0.1 };

/** Eases the whole scene between noon and deep night; at night the fog closes in to a few metres. */
export function DayNight() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const fog = useRef<THREE.Fog>(null);
  const bg = useRef<THREE.Color>(null);

  useFrame((_, dt) => {
    const target = nf2.get().phase === 'night' ? 1 : 0;
    env.night += (target - env.night) * Math.min(1, dt * 0.9);
    const n = env.night;
    if (fog.current) {
      fog.current.color.copy(DAY.sky).lerp(NIGHT.sky, n);
      fog.current.near = THREE.MathUtils.lerp(DAY.fogNear, NIGHT.fogNear, n);
      fog.current.far = THREE.MathUtils.lerp(DAY.fogFar, NIGHT.fogFar, n);
      bg.current?.copy(fog.current.color);
    }
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(DAY.sun, NIGHT.sun, n);
      sun.current.color.copy(DAY.sunColor).lerp(NIGHT.sunColor, n);
    }
    if (amb.current) amb.current.intensity = THREE.MathUtils.lerp(DAY.ambient, NIGHT.ambient, n);
  });

  return (
    <>
      <fog ref={fog} attach="fog" args={['#cfe3ff', DAY.fogNear, DAY.fogFar]} />
      <color ref={bg} attach="background" args={['#cfe3ff']} />
      <ambientLight ref={amb} intensity={DAY.ambient} />
      <hemisphereLight args={['#dfe9ff', '#4b6b3a', 0.35]} />
      <directionalLight ref={sun} position={[30, 50, 20]} intensity={DAY.sun} />
    </>
  );
}
