import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { NAME_RADIUS_NIGHT } from '../../../../../shared/nightfall2/constants';
import { decodeLook } from '../../../../../shared/nightfall2/look';
import { emoteAnim, env, jumps, positions, useNf2, type Roster } from '../store';
import { KayCharacter } from './KayCharacter';
import { lerpAngle, newAnim } from './anim';
import { Overhead } from './Overhead';
import type { TEXT } from '../texts';
import { useOverhead } from './useOverhead';

/** Everyone except me, smoothed towards the server's 20 Hz positions. */
export function RemotePlayers({ meRef, t }: { meRef: React.RefObject<THREE.Vector3>; t: (typeof TEXT)['id'] }) {
  const roster = useNf2((s) => s.roster);
  const me = useNf2((s) => s.me);
  return (
    <>
      {roster.filter((p) => p.id !== me).map((p) => <RemotePlayer key={p.id} p={p} meRef={meRef} t={t} />)}
    </>
  );
}

function RemotePlayer({ p, meRef, t }: { p: Roster; meRef: React.RefObject<THREE.Vector3>; t: (typeof TEXT)['id'] }) {
  const group = useRef<THREE.Group>(null);
  const tag = useRef<THREE.Group>(null);
  const anim = useRef(newAnim());
  const look = useMemo(() => decodeLook(p.look), [p.look]);
  const over = useOverhead(p.id);
  useFrame((_, dt) => {
    const pose = positions.get(p.id);
    const g = group.current;
    if (!pose || !g) return;
    const k = 1 - Math.exp(-dt * 12);
    g.position.x += (pose.x - g.position.x) * k;
    g.position.y += (pose.y - g.position.y) * k;
    g.position.z += (pose.z - g.position.z) * k;
    g.rotation.y = lerpAngle(g.rotation.y, pose.rot, k);
    const a = anim.current;
    a.moving = pose.moving;
    a.jumpStart = jumps.get(p.id) ?? -1e9;
    const e = emoteAnim.get(p.id);
    a.emote = e ? e.id : -1;
    a.emoteStart = e ? e.start : -1e9;
    const tg = tag.current;
    if (tg && meRef.current) {
      const d = Math.hypot(meRef.current.x - g.position.x, meRef.current.z - g.position.z);
      tg.visible = env.night < 0.5 || d < NAME_RADIUS_NIGHT;
    }
  });
  return (
    <group ref={group}>
      <KayCharacter look={look} animRef={anim} alive={p.alive} />
      <group ref={tag} position={[0, 2.25, 0]}>
        <Billboard>
          <Text fontSize={0.26} color="#fff" outlineWidth={0.02} outlineColor="#000" anchorY="bottom">
            {p.name}
          </Text>
        </Billboard>
      </group>
      <Overhead text={over.text} emote={over.emote} emoteLabel={over.emote === undefined ? undefined : t.emoteNames[over.emote]} />
    </group>
  );
}
