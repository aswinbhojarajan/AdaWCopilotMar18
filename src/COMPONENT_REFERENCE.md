# Ada Component Quick Reference

## Import Statement
```tsx
import { 
  TopBar, Header, Navigation, BottomBar,
  Button, Tag,
  ContentCard, SummaryCard, InsightCard, TrendCard
} from './components/ada';
```

---

## Components At-A-Glance

### Layout Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `TopBar` | iOS status bar | `time?: string` |
| `Header` | App branding + icons | None |
| `Navigation` | Tab navigation | `activeTab`, `onTabChange` |
| `BottomBar` | Input + home indicator | `onSubmit?: (value: string) => void` |

### UI Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Button` | Action buttons | `variant`, `size`, `onClick` |
| `Tag` | Filter chips | `active`, `onClick` |

### Card Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `ContentCard` | News/content with image | `title`, `description`, `image`, `category` |
| `SummaryCard` | Daily summary container | `date`, `title`, `subtitle`, `children` |
| `InsightCard` | Community insights | `type`, `title`, `children` |
| `TrendCard` | Trending items | `icon`, `title`, `description` |

---

## Common Patterns

### Full Screen Layout
```tsx
<div className="bg-[#efede6] relative h-screen w-full overflow-hidden">
  {/* Header at top */}
  <div className="absolute top-0 left-0 right-0 z-10 bg-[#f7f6f2]">
    <TopBar />
    <Header />
  </div>

  {/* Navigation below header */}
  <div className="absolute top-[88px] left-0 right-0 z-20">
    <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
  </div>

  {/* Scrollable content */}
  <div className="absolute top-[88px] left-0 right-0 bottom-[90px] overflow-y-auto">
    <div className="px-[6px] py-[45px]">
      {/* Cards go here */}
    </div>
  </div>

  {/* Bottom bar */}
  <div className="absolute bottom-0 left-0 right-0 z-10">
    <BottomBar />
  </div>
</div>
```

### Filter Section
```tsx
<div className="w-full">
  <div className="flex justify-center">
    <div className="flex gap-[8px] px-[24px] py-[16px]">
      <Tag active={filter === 'latest'} onClick={() => setFilter('latest')}>
        Latest
      </Tag>
      <Tag active={filter === 'trending'} onClick={() => setFilter('trending')}>
        Trending
      </Tag>
    </div>
  </div>
</div>
```

### Card List
```tsx
<div className="flex flex-col gap-[5px] w-full">
  <ContentCard {...newsProps} />
  <InsightCard {...insightProps}>
    {/* Custom visualization */}
  </InsightCard>
  <SummaryCard {...summaryProps}>
    {/* Portfolio details */}
  </SummaryCard>
</div>
```

---

## Color Reference (Quick)

```css
/* Backgrounds */
#efede6  /* Page background */
#f7f6f2  /* Card alt, buttons */
#ffffff  /* Cards */

/* Text */
#441316  /* Primary dark */
#c0180c  /* Accent red */
#555555  /* Body text */

/* UI */
#a0e622  /* Success/positive */
#d8d8d8  /* Borders */
```

---

## Typography Classes

```tsx
/* Brand - Logo */
className="font-['RL_Limo:Regular',sans-serif]"

/* Headlines - Titles */
className="font-['Crimson_Pro:Regular',sans-serif]"

/* Body - Regular */
className="font-['DM_Sans:Regular',sans-serif]"

/* Body - Light */
className="font-['DM_Sans:Light',sans-serif]"

/* Body - SemiBold */
className="font-['DM_Sans:SemiBold',sans-serif]"
```

---

## Spacing Shortcuts

```tsx
gap-[5px]   /* Between cards in list */
gap-[6px]   /* Small elements within card */
gap-[8px]   /* Tags, small UI */
gap-[12px]  /* Related content sections */
gap-[16px]  /* Major sections */
gap-[24px]  /* Large sections */

px-[6px]    /* Page horizontal (for card margins) */
px-[24px]   /* Content horizontal */
py-[16px]   /* Card vertical */
py-[24px]   /* Large card vertical */
```

---

## Border Radius

```tsx
rounded-[30px]     /* Cards */
rounded-[50px]     /* Buttons, tags */
rounded-[23px]     /* Input fields */
rounded-[100px]    /* Full circles */
```

---

## State Management Pattern

```tsx
function MyScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'wealth' | 'discover' | 'lounge' | 'profile'>('home');
  const [activeFilter, setActiveFilter] = useState<'latest' | 'trending' | 'foryou'>('latest');

  return (
    <div>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <Tag active={activeFilter === 'latest'} onClick={() => setActiveFilter('latest')}>
        Latest
      </Tag>
      
      <BottomBar onSubmit={(value) => handleSubmit(value)} />
    </div>
  );
}
```

---

## Z-Index Layers

```tsx
z-10  /* Header and Bottom Bar */
z-20  /* Navigation (sits on top of header) */
```

---

## Responsive Breakpoints

Currently designed for mobile (375px width). For future expansion:
- Mobile: 375px
- Tablet: TBD
- Desktop: TBD

All components are built with responsive patterns in mind (flex, gap, etc.).
