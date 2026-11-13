import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ChevronDown, Shuffle } from 'lucide-react';
import * as THREE from 'three';
import { CAPES, CLASSES, HATS, HEIGHTS, TINTS, randomLook, type Look } from '../../../../../shared/nightfall2/look';
import { KayCharacter } from '../scene/KayCharacter';
import { newAnim } from '../scene/anim';
import type { TEXT } from '../texts';

/** Live preview that slowly turns and cheers every few seconds. */
function Preview({ look }: { look: Look }) {
  const group = useRef<THREE.Group>(null);
  const anim = useRef(newAnim());
  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (g) g.rotation.y += dt * 0.6;
    const a = anim.current;
    const t = clock.elapsedTime;
    if (t % 7 < 0.05 && a.emote !== 0) { a.emote = 0; a.emoteStart = performance.now(); }
    if (performance.now() - a.emoteStart > 2600) a.emote = -1;
  });
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />
      <group ref={group} position={[0, -0.95, 0]}>
        <Suspense fallback={null}>
          <KayCharacter look={look} animRef={anim} />
        </Suspense>
      </group>
    </>
  );
}

function Swatches({ value, onPick, label }: { value: number; onPick: (i: number) => void; label: string }) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-wider text-indigo-300/70">{label}</span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {TINTS.map((c, i) => (
          <button key={c} type="button" onClick={() => onPick(i)} aria-label={`${label} ${i + 1}`} className={`h-6 w-6 rounded-full border-2 ${value === i ? 'scale-110 border-white' : 'border-transparent'} ${i === 0 ? 'bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]' : ''}`} style={i === 0 ? undefined : { background: c }} />
        ))}
      </div>
    </div>
  );
}

function Chips({ names, value, onPick, label }: { names: readonly string[]; value: number; onPick: (i: number) => void; label: string }) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-wider text-indigo-300/70">{label}</span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {names.map((n, i) => (
          <button key={n} type="button" onClick={() => onPick(i)} className={`rounded-full border px-2.5 py-1 text-xs ${value === i ? 'border-emerald-300 bg-emerald-500/20 text-emerald-100' : 'border-indigo-400/30 text-indigo-200'}`}>{n}</button>
        ))}
      </div>
    </div>
  );
}

/** Part + its tint on one row. */
function PartRow({ label, names, value, tint, onPart, onTint, t }: { label: string; names: readonly string[]; value: number; tint: number; onPart: (i: number) => void; onTint: (i: number) => void; t: (typeof TEXT)['id'] }) {
  return (
    <div className="space-y-2 rounded-xl border border-indigo-400/15 p-2">
      <Chips label={label} names={names} value={value} onPick={onPart} />
      <Swatches label={`${t.parts.tint} · ${label.toLowerCase()}`} value={tint} onPick={onTint} />
    </div>
  );
}

export function CharacterEditor({ look, onChange, t }: { look: Look; onChange: (l: Look) => void; t: (typeof TEXT)['id'] }) {
  const [open, setOpen] = useState(false);
  const set = (k: keyof Look) => (v: number) => onChange({ ...look, [k]: v });
  const classNames = CLASSES.map((_, i) => t.classes[i]);
  return (
    <div className="rounded-2xl border border-indigo-400/20 bg-black/30">
      <div className="flex items-center gap-3 p-3">
        <div className="h-44 w-32 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-indigo-900/60 to-emerald-900/40">
          <Canvas dpr={[1, 1.5]} camera={{ fov: 32, position: [0, 0.5, 5.6] }} gl={{ alpha: true, antialias: true }}>
            <Preview look={look} />
          </Canvas>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-indigo-300/80">{t.character}</span>
          <p className="text-[11px] text-indigo-300/60">{t.mixHint}</p>
          <button type="button" onClick={() => onChange(randomLook())} className="flex items-center justify-center gap-2 rounded-lg border border-indigo-400/40 py-2 text-sm text-indigo-100"><Shuffle className="h-4 w-4" />{t.random}</button>
          <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center justify-center gap-1 rounded-lg border border-emerald-300/50 bg-emerald-500/15 py-2 text-sm text-emerald-100" aria-expanded={open}>
            {t.parts.head} · {t.parts.body} · {t.parts.hat} … <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {open && (
        <div className="space-y-3 border-t border-indigo-400/15 p-3">
          <PartRow t={t} label={t.parts.head} names={classNames} value={look.head} tint={look.tintHead} onPart={set('head')} onTint={set('tintHead')} />
          <PartRow t={t} label={t.parts.body} names={classNames} value={look.body} tint={look.tintBody} onPart={set('body')} onTint={set('tintBody')} />
          <PartRow t={t} label={t.parts.arms} names={classNames} value={look.arms} tint={look.tintArms} onPart={set('arms')} onTint={set('tintArms')} />
          <PartRow t={t} label={t.parts.legs} names={classNames} value={look.legs} tint={look.tintLegs} onPart={set('legs')} onTint={set('tintLegs')} />
          <PartRow t={t} label={t.parts.cape} names={CAPES.map((_, i) => t.capes[i])} value={look.cape} tint={look.tintCape} onPart={set('cape')} onTint={set('tintCape')} />
          <PartRow t={t} label={t.parts.hat} names={HATS.map((_, i) => t.hats[i])} value={look.hat} tint={look.tintHat} onPart={set('hat')} onTint={set('tintHat')} />
          <Chips label={t.parts.height} names={Array.from({ length: HEIGHTS }, (_, i) => t.heights[i])} value={look.height} onPick={set('height')} />
          <Chips label={t.parts.ears} names={['✕', '✓']} value={look.ears} onPick={set('ears')} />
        </div>
      )}
    </div>
  );
}
