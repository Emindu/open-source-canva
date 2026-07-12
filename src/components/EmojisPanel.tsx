import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

interface EmojiEntry {
  char: string;
  keywords: string;
}

const CATEGORIES: { title: string; items: EmojiEntry[] }[] = [
  {
    title: 'Smileys & People',
    items: [
      ['😀', 'grin happy'], ['😃', 'smile'], ['😄', 'laugh'], ['😁', 'beam'],
      ['😆', 'laugh'], ['😅', 'sweat'], ['😂', 'joy tears'], ['🤣', 'rofl'],
      ['😊', 'blush'], ['😇', 'angel'], ['🙂', 'smile'], ['🙃', 'upside'],
      ['😉', 'wink'], ['😍', 'love'], ['🥰', 'love'], ['😘', 'kiss'],
      ['😋', 'yum'], ['😛', 'tongue'], ['🤪', 'crazy'], ['😎', 'cool'],
      ['🤩', 'star'], ['🥳', 'party'], ['😢', 'cry sad'], ['😭', 'sob'],
      ['😡', 'angry'], ['🤔', 'think'], ['🤯', 'mind blown'], ['😱', 'shock'],
      ['👋', 'wave hi'], ['👍', 'thumbs up'], ['👎', 'thumbs down'], ['👌', 'ok'],
      ['✌️', 'peace'], ['🤞', 'crossed'], ['🤟', 'love'], ['🤘', 'rock'],
      ['👏', 'clap'], ['🙌', 'raise hands'], ['🙏', 'pray thanks'], ['💪', 'strong'],
    ].map(([char, keywords]) => ({ char, keywords })),
  },
  {
    title: 'Nature',
    items: [
      ['🌸', 'flower blossom'], ['🌼', 'flower'], ['🌷', 'tulip'], ['🌹', 'rose'],
      ['🌻', 'sunflower'], ['💐', 'bouquet'], ['🌱', 'sprout'], ['🌿', 'herb'],
      ['🍀', 'clover luck'], ['🍃', 'leaves'], ['🌳', 'tree'], ['🌲', 'pine'],
      ['🌵', 'cactus'], ['🌴', 'palm'], ['🌞', 'sun'], ['🌜', 'moon'],
      ['🌛', 'moon'], ['🌟', 'star'], ['⭐', 'star'], ['✨', 'sparkle'],
      ['🌈', 'rainbow'], ['🌊', 'wave water'], ['❄️', 'snow cold'], ['🔥', 'fire hot'],
      ['⚡', 'lightning bolt'], ['☀️', 'sun'], ['☁️', 'cloud'], ['🌧', 'rain'],
    ].map(([char, keywords]) => ({ char, keywords })),
  },
  {
    title: 'Food',
    items: [
      ['🍎', 'apple'], ['🍊', 'orange'], ['🍋', 'lemon'], ['🍌', 'banana'],
      ['🍉', 'watermelon'], ['🍇', 'grape'], ['🍓', 'strawberry'], ['🍒', 'cherry'],
      ['🍑', 'peach'], ['🥑', 'avocado'], ['🍅', 'tomato'], ['🥕', 'carrot'],
      ['🌽', 'corn'], ['🍞', 'bread'], ['🥐', 'croissant'], ['🥯', 'bagel'],
      ['🧀', 'cheese'], ['🍔', 'burger'], ['🍟', 'fries'], ['🍕', 'pizza'],
      ['🌮', 'taco'], ['🌯', 'burrito'], ['🍣', 'sushi'], ['🍰', 'cake'],
      ['🎂', 'birthday'], ['🍪', 'cookie'], ['🍩', 'donut'], ['☕', 'coffee'],
      ['🍵', 'tea'], ['🍺', 'beer'], ['🍷', 'wine'], ['🍹', 'cocktail'],
    ].map(([char, keywords]) => ({ char, keywords })),
  },
  {
    title: 'Activities & Objects',
    items: [
      ['⚽', 'soccer'], ['🏀', 'basketball'], ['🏈', 'football'], ['⚾', 'baseball'],
      ['🎾', 'tennis'], ['🏐', 'volleyball'], ['🎱', 'pool'], ['🏓', 'ping pong'],
      ['🎮', 'game'], ['🎯', 'target dart'], ['🎨', 'art paint'], ['🎭', 'theater'],
      ['🎬', 'movie'], ['🎵', 'music note'], ['🎶', 'music'], ['🎤', 'mic'],
      ['🎧', 'headphones'], ['📱', 'phone mobile'], ['💻', 'laptop'], ['⌨️', 'keyboard'],
      ['📷', 'camera'], ['📹', 'video'], ['💡', 'lightbulb idea'], ['🔋', 'battery'],
      ['🎁', 'gift'], ['🎈', 'balloon'], ['🎉', 'party'], ['🎊', 'confetti'],
      ['🏆', 'trophy'], ['🥇', 'gold medal'], ['📚', 'books'], ['✏️', 'pencil'],
    ].map(([char, keywords]) => ({ char, keywords })),
  },
  {
    title: 'Symbols',
    items: [
      ['❤️', 'heart love red'], ['🧡', 'orange heart'], ['💛', 'yellow heart'], ['💚', 'green heart'],
      ['💙', 'blue heart'], ['💜', 'purple heart'], ['🖤', 'black heart'], ['🤍', 'white heart'],
      ['💔', 'break heart'], ['💕', 'hearts'], ['💯', '100 percent'], ['✅', 'check tick'],
      ['❌', 'x cross'], ['⭕', 'circle'], ['❗', 'exclamation'], ['❓', 'question'],
      ['⚠️', 'warning'], ['🚫', 'no'], ['💬', 'chat speech'], ['💭', 'thought'],
      ['🔔', 'bell notification'], ['🔒', 'lock'], ['🔓', 'unlock'], ['🔑', 'key'],
      ['💰', 'money bag'], ['💵', 'dollar'], ['💎', 'diamond gem'], ['🏳️', 'flag white'],
    ].map(([char, keywords]) => ({ char, keywords })),
  },
];

const EmojisPanel: React.FC = () => {
  const addEmoji = useEditorStore((s) => s.addEmoji);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((c) => ({
      title: c.title,
      items: c.items.filter((e) => e.keywords.includes(q) || e.char === q),
    })).filter((c) => c.items.length);
  }, [query]);

  return (
    <>
      <div className="panel-section" style={{ paddingBottom: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search emojis"
            style={{
              background: 'transparent',
              border: 'none',
              flex: 1,
              fontSize: 13,
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>
      {filtered.map((sec) => (
        <div key={sec.title} className="panel-section" style={{ paddingTop: 8 }}>
          <div className="panel-title">{sec.title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
            {sec.items.map((e) => (
              <button
                key={e.char}
                onClick={() => addEmoji(e.char)}
                title={e.keywords}
                style={{
                  height: 36,
                  fontSize: 22,
                  lineHeight: '36px',
                  padding: 0,
                  borderRadius: 6,
                  border: '1px solid transparent',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.12s ease',
                }}
                onMouseOver={(e2) => (e2.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseOut={(e2) => (e2.currentTarget.style.backgroundColor = 'transparent')}
              >
                {e.char}
              </button>
            ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div style={{ padding: 20, fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
          No emojis match "{query}".
        </div>
      )}
    </>
  );
};

export default EmojisPanel;
