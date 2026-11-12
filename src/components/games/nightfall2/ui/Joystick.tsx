import { useRef, useState } from 'react';
import { input } from '../store';

const R = 48; // px travel radius

/** Thumb joystick for phones. Writes straight into the shared input vector. */
export function Joystick() {
  const [knob, setKnob] = useState({ x: 0, y: 0, active: false });
  const pid = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });

  const update = (cx: number, cy: number) => {
    let dx = cx - origin.current.x;
    let dy = cy - origin.current.y;
    const d = Math.hypot(dx, dy);
    if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
    input.x = dx / R;
    input.y = -dy / R;
    setKnob({ x: dx, y: dy, active: true });
  };
  const end = () => {
    pid.current = null;
    input.x = 0;
    input.y = 0;
    setKnob({ x: 0, y: 0, active: false });
  };

  return (
    <div
      data-ui
      className="absolute bottom-6 left-5 h-36 w-36 touch-none select-none rounded-full border-2 border-white/25 bg-black/25 backdrop-blur-sm"
      style={{ opacity: knob.active ? 0.95 : 0.7 }}
      onPointerDown={(e) => {
        if (pid.current !== null) return;
        pid.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        const r = e.currentTarget.getBoundingClientRect();
        origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => { if (e.pointerId === pid.current) update(e.clientX, e.clientY); }}
      onPointerUp={(e) => { if (e.pointerId === pid.current) end(); }}
      onPointerCancel={end}
      aria-label="joystick"
    >
      <div
        className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/70 shadow-lg"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}
