import { useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Music, VolumeX } from 'lucide-react';
import { isBgMuted, setBgMuted, subscribeBgMuted } from '@/lib/audio';

/** Routes that play their own music and have their own sound button. */
const OWN_MUSIC_ROUTES = ['/games/nightfall'];

/** Small floating button that mutes / unmutes the website's background music. */
export function BgMusicToggle() {
  const muted = useSyncExternalStore(subscribeBgMuted, isBgMuted);
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  if (OWN_MUSIC_ROUTES.includes(pathname)) return null;
  const id = i18n.language?.startsWith('id');
  const label = muted ? (id ? 'Nyalakan musik latar' : 'Turn background music on') : id ? 'Matikan musik latar' : 'Mute background music';
  return (
    <button
      onClick={() => setBgMuted(!muted)}
      aria-label={label}
      aria-pressed={muted}
      title={label}
      className="fixed bottom-4 left-4 z-[80] w-10 h-10 flex items-center justify-center rounded-full border border-hound-gold/60 bg-black/70 text-hound-gold backdrop-blur-sm shadow-lg hover:bg-black/90 transition-colors"
    >
      {muted ? <VolumeX className="w-5 h-5" /> : <Music className="w-5 h-5" />}
    </button>
  );
}
