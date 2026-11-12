import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { CHAT_MAX_CHARS } from '../../../../../shared/nightfall2/constants';
import { sendChat } from '../net';
import { useNf2 } from '../store';
import type { TEXT } from '../texts';

/**
 * Proximity chat panel. What shows up here is exactly what the server decided you were
 * close enough to hear — nothing is filtered on the client.
 */
export function Chat({ t, touch }: { t: (typeof TEXT)['id']; touch: boolean }) {
  const chat = useNf2((s) => s.chat);
  const phase = useNf2((s) => s.phase);
  const me = useNf2((s) => s.me);
  const [open, setOpen] = useState(!touch);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [chat, open]);

  // Enter focuses the box on desktop, Escape leaves it
  useEffect(() => {
    if (touch) return;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (e.key === 'Enter' && el !== inputRef.current) { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === 'Escape' && el === inputRef.current) inputRef.current?.blur();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [touch]);

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    sendChat(v);
    setText('');
    if (touch) { inputRef.current?.blur(); setOpen(false); }
  };

  if (!open) {
    return (
      <button data-ui onClick={() => setOpen(true)} className="absolute bottom-6 right-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm" aria-label="chat">
        <MessageCircle className="h-6 w-6" />
        {chat.length > 0 && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-amber-400" />}
      </button>
    );
  }

  return (
    <div data-ui className={`absolute ${touch ? 'inset-x-3 bottom-3' : 'bottom-4 right-4 w-80'} flex max-h-[45vh] flex-col rounded-2xl border border-white/15 bg-black/55 text-sm text-white backdrop-blur-md`}>
      <div className="flex items-center justify-between px-3 pt-2 text-[11px] uppercase tracking-wider text-white/60">
        <span>{phase === 'night' ? `🌙 ${t.whisper}` : '💬 chat'}</span>
        {touch && <button onClick={() => setOpen(false)} aria-label="close"><X className="h-4 w-4" /></button>}
      </div>
      <div ref={listRef} className="min-h-[72px] flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {chat.length === 0 && <p className="text-white/50">{t.chatEmpty}</p>}
        {chat.slice(-40).map((c) => (
          <p key={`${c.id}-${c.from}`} className="leading-snug">
            <span className="font-semibold" style={{ color: c.color }}>{c.from === me ? t.you : c.name}</span>
            {c.whisper && <span className="ml-1 text-[10px] italic text-indigo-300">({t.whisper})</span>}
            {c.from !== me && c.dist > 0 && <span className="ml-1 text-[10px] text-white/40">{c.dist} m</span>}
            <span className="ml-1.5 text-white/90">{c.text}</span>
          </p>
        ))}
      </div>
      <form className="flex gap-2 border-t border-white/10 p-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, CHAT_MAX_CHARS))}
          placeholder={phase === 'night' ? t.chatPlaceholderNight : t.chatPlaceholderDay}
          maxLength={CHAT_MAX_CHARS}
          autoComplete="off"
          enterKeyHint="send"
          className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-amber-300"
        />
        <button type="submit" className="rounded-lg bg-amber-400 px-3 text-zinc-900" aria-label={t.send}><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
