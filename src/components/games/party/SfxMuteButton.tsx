import { useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isSfxMuted, setSfxMuted, subscribeSfxMuted } from '@/lib/sfx';

/** Sound-effects on/off switch for the party games (remembered on this device). */
export function SfxMuteButton({ className = '', labels }: { className?: string; labels: { mute: string; unmute: string } }) {
  const muted = useSyncExternalStore(subscribeSfxMuted, isSfxMuted);
  const label = muted ? labels.unmute : labels.mute;
  return (
    <button onClick={() => setSfxMuted(!muted)} className={className} aria-label={label} aria-pressed={muted} title={label}>
      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
}
