import React, { useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Search,
  // Arrows
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownRight,
  MoveRight, MoveLeft, MoveUp, MoveDown, CornerUpRight, CornerDownRight,
  RefreshCw, RotateCcw, Repeat, Shuffle,
  // Shapes
  Circle, Square, Triangle, Star, Heart, Diamond, Hexagon, Octagon, Pentagon,
  // Comm
  Mail, MessageSquare, MessageCircle, Send, Bell, BellRing, Megaphone, Phone,
  Video, AtSign, Hash, Rss,
  // Social & People
  User, Users, UserPlus, ThumbsUp, ThumbsDown, Smile, Frown, Award, Trophy,
  Handshake, Gift, Cake,
  // Media
  Play, Pause, StopCircle, Music, Music2, Camera, Film, Image, Mic, Volume2,
  Headphones, Disc,
  // Objects
  Coffee, ShoppingCart, ShoppingBag, Package, Truck, Car, Plane, Ship, Rocket,
  Bike, Bus, Train, MapPin, Map, Home, Building, Store, Utensils, Wine, Pizza,
  // Nature
  Sun, Moon, Cloud, CloudRain, CloudSnow, Snowflake, Umbrella, Zap, Flame, Droplet,
  Leaf, TreePine, Trees, Flower, Bug,
  // Tech
  Code, Terminal, Cpu, Database, Server, Wifi, Bluetooth, Globe, HardDrive,
  Cloud as CloudTech, Laptop, Smartphone, Monitor, Keyboard, Mouse,
  // Business & Finance
  DollarSign, CreditCard, Wallet, BarChart, PieChart, TrendingUp, TrendingDown,
  Briefcase, Target, Calendar, Clock, Timer,
  // Misc essentials
  Check, X, Plus, Minus, Info, AlertTriangle, HelpCircle, Lock, Unlock, Eye, EyeOff,
  Settings, Sparkles, Wand2, Flag, Bookmark, Tag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

interface IconEntry {
  name: string;
  Icon: LucideIcon;
  keywords: string;
}

const CATEGORIES: { title: string; items: IconEntry[] }[] = [
  {
    title: 'Arrows',
    items: [
      { name: 'ArrowUp', Icon: ArrowUp, keywords: 'up' },
      { name: 'ArrowDown', Icon: ArrowDown, keywords: 'down' },
      { name: 'ArrowLeft', Icon: ArrowLeft, keywords: 'left back' },
      { name: 'ArrowRight', Icon: ArrowRight, keywords: 'right next' },
      { name: 'ArrowUpRight', Icon: ArrowUpRight, keywords: 'up right diagonal' },
      { name: 'ArrowDownRight', Icon: ArrowDownRight, keywords: 'down right' },
      { name: 'MoveRight', Icon: MoveRight, keywords: 'move' },
      { name: 'MoveLeft', Icon: MoveLeft, keywords: 'move' },
      { name: 'MoveUp', Icon: MoveUp, keywords: 'move' },
      { name: 'MoveDown', Icon: MoveDown, keywords: 'move' },
      { name: 'CornerUpRight', Icon: CornerUpRight, keywords: 'corner' },
      { name: 'CornerDownRight', Icon: CornerDownRight, keywords: 'corner' },
      { name: 'RefreshCw', Icon: RefreshCw, keywords: 'refresh reload' },
      { name: 'RotateCcw', Icon: RotateCcw, keywords: 'rotate undo' },
      { name: 'Repeat', Icon: Repeat, keywords: 'repeat loop' },
      { name: 'Shuffle', Icon: Shuffle, keywords: 'random' },
    ],
  },
  {
    title: 'Shapes',
    items: [
      { name: 'Circle', Icon: Circle, keywords: 'round' },
      { name: 'Square', Icon: Square, keywords: 'rect box' },
      { name: 'Triangle', Icon: Triangle, keywords: 'delta' },
      { name: 'Star', Icon: Star, keywords: 'favorite rating' },
      { name: 'Heart', Icon: Heart, keywords: 'love like' },
      { name: 'Diamond', Icon: Diamond, keywords: 'rhombus' },
      { name: 'Hexagon', Icon: Hexagon, keywords: 'polygon' },
      { name: 'Octagon', Icon: Octagon, keywords: 'stop' },
      { name: 'Pentagon', Icon: Pentagon, keywords: 'polygon' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { name: 'Mail', Icon: Mail, keywords: 'email envelope' },
      { name: 'MessageSquare', Icon: MessageSquare, keywords: 'chat comment' },
      { name: 'MessageCircle', Icon: MessageCircle, keywords: 'chat comment bubble' },
      { name: 'Send', Icon: Send, keywords: 'submit' },
      { name: 'Bell', Icon: Bell, keywords: 'notification alert' },
      { name: 'BellRing', Icon: BellRing, keywords: 'notification alert active' },
      { name: 'Megaphone', Icon: Megaphone, keywords: 'announce broadcast' },
      { name: 'Phone', Icon: Phone, keywords: 'call' },
      { name: 'Video', Icon: Video, keywords: 'camera call meeting' },
      { name: 'AtSign', Icon: AtSign, keywords: 'email mention' },
      { name: 'Hash', Icon: Hash, keywords: 'tag hashtag' },
      { name: 'Rss', Icon: Rss, keywords: 'feed subscribe' },
    ],
  },
  {
    title: 'Social',
    items: [
      { name: 'User', Icon: User, keywords: 'person profile' },
      { name: 'Users', Icon: Users, keywords: 'group team people' },
      { name: 'UserPlus', Icon: UserPlus, keywords: 'add friend' },
      { name: 'ThumbsUp', Icon: ThumbsUp, keywords: 'like good' },
      { name: 'ThumbsDown', Icon: ThumbsDown, keywords: 'dislike bad' },
      { name: 'Smile', Icon: Smile, keywords: 'happy face' },
      { name: 'Frown', Icon: Frown, keywords: 'sad face' },
      { name: 'Award', Icon: Award, keywords: 'medal prize' },
      { name: 'Trophy', Icon: Trophy, keywords: 'winner' },
      { name: 'Handshake', Icon: Handshake, keywords: 'agreement deal' },
      { name: 'Gift', Icon: Gift, keywords: 'present' },
      { name: 'Cake', Icon: Cake, keywords: 'birthday party' },
    ],
  },
  {
    title: 'Media',
    items: [
      { name: 'Play', Icon: Play, keywords: 'start' },
      { name: 'Pause', Icon: Pause, keywords: 'stop' },
      { name: 'StopCircle', Icon: StopCircle, keywords: 'end' },
      { name: 'Music', Icon: Music, keywords: 'song audio' },
      { name: 'Music2', Icon: Music2, keywords: 'note' },
      { name: 'Camera', Icon: Camera, keywords: 'photo' },
      { name: 'Film', Icon: Film, keywords: 'movie video' },
      { name: 'Image', Icon: Image, keywords: 'picture photo' },
      { name: 'Mic', Icon: Mic, keywords: 'microphone record' },
      { name: 'Volume2', Icon: Volume2, keywords: 'sound audio' },
      { name: 'Headphones', Icon: Headphones, keywords: 'audio' },
      { name: 'Disc', Icon: Disc, keywords: 'cd album' },
    ],
  },
  {
    title: 'Objects',
    items: [
      { name: 'Coffee', Icon: Coffee, keywords: 'drink cup' },
      { name: 'ShoppingCart', Icon: ShoppingCart, keywords: 'cart buy' },
      { name: 'ShoppingBag', Icon: ShoppingBag, keywords: 'bag shopping' },
      { name: 'Package', Icon: Package, keywords: 'box parcel delivery' },
      { name: 'Truck', Icon: Truck, keywords: 'delivery shipping' },
      { name: 'Car', Icon: Car, keywords: 'vehicle auto' },
      { name: 'Plane', Icon: Plane, keywords: 'flight travel' },
      { name: 'Ship', Icon: Ship, keywords: 'boat sea' },
      { name: 'Rocket', Icon: Rocket, keywords: 'launch startup' },
      { name: 'Bike', Icon: Bike, keywords: 'bicycle cycle' },
      { name: 'Bus', Icon: Bus, keywords: 'transport' },
      { name: 'Train', Icon: Train, keywords: 'rail' },
      { name: 'MapPin', Icon: MapPin, keywords: 'location marker' },
      { name: 'Map', Icon: Map, keywords: 'location' },
      { name: 'Home', Icon: Home, keywords: 'house' },
      { name: 'Building', Icon: Building, keywords: 'office' },
      { name: 'Store', Icon: Store, keywords: 'shop' },
      { name: 'Utensils', Icon: Utensils, keywords: 'food fork knife' },
      { name: 'Wine', Icon: Wine, keywords: 'glass drink' },
      { name: 'Pizza', Icon: Pizza, keywords: 'food' },
    ],
  },
  {
    title: 'Nature',
    items: [
      { name: 'Sun', Icon: Sun, keywords: 'weather day' },
      { name: 'Moon', Icon: Moon, keywords: 'night dark' },
      { name: 'Cloud', Icon: Cloud, keywords: 'weather' },
      { name: 'CloudRain', Icon: CloudRain, keywords: 'weather rain' },
      { name: 'CloudSnow', Icon: CloudSnow, keywords: 'weather snow' },
      { name: 'Snowflake', Icon: Snowflake, keywords: 'winter cold' },
      { name: 'Umbrella', Icon: Umbrella, keywords: 'rain protect' },
      { name: 'Zap', Icon: Zap, keywords: 'lightning bolt' },
      { name: 'Flame', Icon: Flame, keywords: 'fire hot' },
      { name: 'Droplet', Icon: Droplet, keywords: 'water' },
      { name: 'Leaf', Icon: Leaf, keywords: 'nature eco' },
      { name: 'TreePine', Icon: TreePine, keywords: 'tree pine' },
      { name: 'Trees', Icon: Trees, keywords: 'forest' },
      { name: 'Flower', Icon: Flower, keywords: 'plant' },
      { name: 'Bug', Icon: Bug, keywords: 'insect' },
    ],
  },
  {
    title: 'Tech',
    items: [
      { name: 'Code', Icon: Code, keywords: 'programming' },
      { name: 'Terminal', Icon: Terminal, keywords: 'command console' },
      { name: 'Cpu', Icon: Cpu, keywords: 'processor chip' },
      { name: 'Database', Icon: Database, keywords: 'storage' },
      { name: 'Server', Icon: Server, keywords: 'cloud host' },
      { name: 'Wifi', Icon: Wifi, keywords: 'wireless internet' },
      { name: 'Bluetooth', Icon: Bluetooth, keywords: 'wireless' },
      { name: 'Globe', Icon: Globe, keywords: 'internet world' },
      { name: 'HardDrive', Icon: HardDrive, keywords: 'storage disk' },
      { name: 'Cloud', Icon: CloudTech, keywords: 'sync online' },
      { name: 'Laptop', Icon: Laptop, keywords: 'computer' },
      { name: 'Smartphone', Icon: Smartphone, keywords: 'phone mobile' },
      { name: 'Monitor', Icon: Monitor, keywords: 'display screen' },
      { name: 'Keyboard', Icon: Keyboard, keywords: 'type' },
      { name: 'Mouse', Icon: Mouse, keywords: 'cursor click' },
    ],
  },
  {
    title: 'Business',
    items: [
      { name: 'DollarSign', Icon: DollarSign, keywords: 'money price' },
      { name: 'CreditCard', Icon: CreditCard, keywords: 'payment' },
      { name: 'Wallet', Icon: Wallet, keywords: 'money' },
      { name: 'BarChart', Icon: BarChart, keywords: 'graph analytics' },
      { name: 'PieChart', Icon: PieChart, keywords: 'graph analytics' },
      { name: 'TrendingUp', Icon: TrendingUp, keywords: 'growth increase' },
      { name: 'TrendingDown', Icon: TrendingDown, keywords: 'decrease decline' },
      { name: 'Briefcase', Icon: Briefcase, keywords: 'work job' },
      { name: 'Target', Icon: Target, keywords: 'goal aim' },
      { name: 'Calendar', Icon: Calendar, keywords: 'date schedule' },
      { name: 'Clock', Icon: Clock, keywords: 'time' },
      { name: 'Timer', Icon: Timer, keywords: 'time stopwatch' },
    ],
  },
  {
    title: 'Essentials',
    items: [
      { name: 'Check', Icon: Check, keywords: 'ok yes tick' },
      { name: 'X', Icon: X, keywords: 'close cross no' },
      { name: 'Plus', Icon: Plus, keywords: 'add' },
      { name: 'Minus', Icon: Minus, keywords: 'subtract remove' },
      { name: 'Info', Icon: Info, keywords: 'help' },
      { name: 'AlertTriangle', Icon: AlertTriangle, keywords: 'warning' },
      { name: 'HelpCircle', Icon: HelpCircle, keywords: 'question' },
      { name: 'Lock', Icon: Lock, keywords: 'secure private' },
      { name: 'Unlock', Icon: Unlock, keywords: 'open' },
      { name: 'Eye', Icon: Eye, keywords: 'view show' },
      { name: 'EyeOff', Icon: EyeOff, keywords: 'hide' },
      { name: 'Settings', Icon: Settings, keywords: 'gear config' },
      { name: 'Sparkles', Icon: Sparkles, keywords: 'magic ai' },
      { name: 'Wand2', Icon: Wand2, keywords: 'magic' },
      { name: 'Flag', Icon: Flag, keywords: 'report mark' },
      { name: 'Bookmark', Icon: Bookmark, keywords: 'save' },
      { name: 'Tag', Icon: Tag, keywords: 'label' },
    ],
  },
];

const IconsPanel: React.FC = () => {
  const addIconSvg = useEditorStore((s) => s.addIconSvg);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((c) => ({
      title: c.title,
      items: c.items.filter(
        (it) => it.name.toLowerCase().includes(q) || it.keywords.includes(q)
      ),
    })).filter((c) => c.items.length);
  }, [query]);

  const handlePick = (Icon: LucideIcon) => {
    // Render the icon to a standalone SVG string with fill: currentColor overridden
    // to a real hex so Fabric's SVG parser doesn't drop the shape.
    const markup = renderToStaticMarkup(
      <Icon
        size={96}
        color="#111827"
        strokeWidth={2}
      />
    );
    addIconSvg(markup);
  };

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
            placeholder="Search icons"
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
            {sec.items.map(({ name, Icon }) => (
              <button
                key={name}
                onClick={() => handlePick(Icon)}
                title={name}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'background-color 0.12s ease, color 0.12s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div style={{ padding: 20, fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
          No icons match "{query}".
        </div>
      )}
    </>
  );
};

export default IconsPanel;
