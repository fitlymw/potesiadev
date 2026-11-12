import { EMOTE_DURATION_MS } from '../../../../../shared/nightfall2/constants';
import { useNf2 } from '../store';
import { useNow } from '../useNow';

const BUBBLE_MS = 5000;

/** What floats above a player's head right now: their last chat line and/or their current emote. */
export function useOverhead(id: string): { text?: string; emote?: number } {
  const now = useNow();
  const chat = useNf2((s) => s.chat);
  const emotes = useNf2((s) => s.emotes);
  let text: string | undefined;
  for (let i = chat.length - 1; i >= 0; i--) {
    if (chat[i].from === id) {
      if (now - chat[i].at < BUBBLE_MS) text = chat[i].text;
      break;
    }
  }
  const e = emotes[id];
  const emote = e && now - e.at < EMOTE_DURATION_MS ? e.id : undefined;
  return { text, emote };
}
