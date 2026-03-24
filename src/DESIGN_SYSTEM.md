# Ada Design System

**Version:** 1.0  
**Last Updated:** March 2026  
**Created from:** 6 original Figma screens (Home, Discover, Lounge, AI Chat, Wealth Tab)

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Border Radius](#border-radius)
7. [Components Library](#components-library)
8. [Data Visualization](#data-visualization)
9. [Icons & Graphics](#icons--graphics)
10. [Usage Guidelines](#usage-guidelines)

---

## Overview

The Ada Design System is a comprehensive component library and style guide built for a mobile-first wealth management application. It emphasizes clarity, sophistication, and personalization with a warm, approachable aesthetic.

### Design Philosophy

- **Mobile-First**: Optimized for 430px viewport
- **Clarity**: Clean typography hierarchy and consistent spacing
- **Warmth**: Beige/cream backgrounds with sophisticated color accents
- **Data-Driven**: Strong emphasis on financial data visualization
- **Personalized**: Conversational tone with user-centric insights

---

## Design Principles

### 1. Visual Hierarchy
Use clear typographic scale and spacing to establish information hierarchy. Headlines (24px) → Body (18px/14px) → Labels (10px) → Metadata (9px).

### 2. Consistency
Maintain consistent patterns across all screens:
- Card radius: 30px
- Card padding: 24px horizontal, 16px-24px vertical
- Gap between cards: 5px
- Button height: 44px

### 3. Accessibility
- Minimum text size: 9px (for timestamps only)
- Primary text: #555555 (sufficient contrast on light backgrounds)
- Clear visual indicators for interactive elements

### 4. Sophistication
- Custom fonts (RL Limo, Crimson Pro, DM Sans)
- Refined letter spacing and tracking
- Subtle borders (0.5px - 0.75px)
- Soft color palette with strategic accent use

---

## Color System

### Primary Palette

#### Background Colors
```css
--background-primary: #efede6;    /* Main app background - warm beige */
--background-secondary: #f7f6f2;  /* Card secondary background - light gray */
--background-card: #ffffff;        /* Card background - white */
```

#### Text Colors
```css
--text-primary: #555555;          /* Main text color */
--text-secondary: #555555;        /* Same as primary, but used with opacity */
--text-accent: #c0180c;           /* Brand red for labels and accents */
--text-dark: #441316;             /* Deep burgundy for borders and accents */
```

#### Accent Colors
```css
--accent-primary: #c0180c;        /* Brand red */
--accent-success: #03561a;        /* Dark green for positive values */
--accent-success-bg: #c6ff6a;     /* Bright green background for badges */
--accent-warning: #f59e0b;        /* Amber for warnings (if needed) */
```

#### Chart & Data Visualization Colors
```css
--chart-purple-light: #d9c6ed;    /* Light purple */
--chart-purple-medium: #c9aee5;   /* Medium purple */
--chart-purple-dark: #441316;     /* Dark burgundy purple */
--chart-green: #9ddc3d;           /* Bright green */
--chart-blue: #4a90e2;            /* Blue accent */
--chart-gray: #e8e8e8;            /* Neutral gray */
```

#### Wealth Tab Extended Palette
```css
--wealth-allocation-equity: #9ddc3d;      /* Bright green */
--wealth-allocation-bonds: #e8e8e8;       /* Light gray */
--wealth-allocation-alternatives: #d9c6ed; /* Lavender */
--wealth-performance-positive: #c6ff6a;    /* Success background */
--wealth-performance-text: #03561a;        /* Success text */
```

#### Border Colors
```css
--border-subtle: #d8d8d8;         /* Light border (0.75px) */
--border-line: #555555;           /* Divider lines (0.5px) */
--border-dark: #441316;           /* Dark border for filters */
```

### Color Usage Guidelines

1. **Background Hierarchy**: Use #efede6 for main background, white (#ffffff) for cards, and #f7f6f2 for buttons/secondary surfaces
2. **Text Contrast**: Always use #555555 for primary text on light backgrounds
3. **Accent Sparingly**: Use #c0180c only for labels, category tags, and key highlights
4. **Positive/Negative**: Use #c6ff6a background with #03561a text for positive financial changes
5. **Borders**: Keep borders thin (0.5px-0.75px) with subtle colors

---

## Typography

### Font Families

The Ada design system uses three font families, loaded via Google Fonts and TypeKit in `index.html`:

1. **RL Limo** - Display font for the "Ada" logo and section labels. Loaded via TypeKit (`use.typekit.net/yua2ikn.css`). Referenced as `font-['rl-limo',sans-serif]`.
2. **Crimson Pro** - Serif font for headlines, body text, and large numbers. Loaded via Google Fonts (weights 200, 300, 400, 600). Referenced as `font-['Crimson_Pro',sans-serif]`.
3. **DM Sans** - Sans-serif font for UI elements, buttons, and supporting text. Loaded via Google Fonts (weights 300, 400, 500, 600, 700). Referenced as `font-['DM_Sans',sans-serif]`.

### Type Scale

| Style | Font | Size | Weight | Line Height | Tracking | Usage |
|-------|------|------|--------|-------------|----------|-------|
| **Display Large** | Crimson Pro ExtraLight | 40px | 200 | 28px | -1.2px | Portfolio values, large numbers |
| **Headline** | Crimson Pro Regular | 24px | 400 | normal | -0.48px | Card titles, section headlines |
| **Body Large** | Crimson Pro Regular | 18px | 400 | normal | -0.36px | Summary descriptions, intro text |
| **Body Medium** | DM Sans Light | 14px | 300 | normal | -0.28px or 'opsz' 14 | Card descriptions, body copy |
| **Body Small** | DM Sans Light | 12px | 300 | normal | 'opsz' 14 | Subtitles, secondary info |
| **Label** | RL Limo Regular | 10px | 400 | 18px | 0.2px | Category tags, section labels (UPPERCASE) |
| **Caption** | DM Sans Regular | 12px | 400 | normal | - | Stats, metrics, button text |
| **Micro** | DM Sans Regular | 9px | 400 | 18px/28px | - | Timestamps, fine print |
| **Chart Value** | Crimson Pro Light | 40px/20px/16px | 300 | 28px | - | Percentages in charts |

### Typography Implementation

#### Section Label
```tsx
<p className="font-['rl-limo',sans-serif] h-[12px] leading-[18px] not-italic text-[#c0180c] text-[10px] tracking-[0.2px] uppercase">
  TODAY'S SUMMARY
</p>
```

#### Headline
```tsx
<p className="font-['Crimson_Pro',sans-serif] font-normal leading-[normal] text-[#555555] text-[24px] tracking-[-0.48px]">
  Aisha, your portfolio is on track today.
</p>
```

#### Body Text
```tsx
<p className="font-['DM_Sans',sans-serif] font-light leading-[normal] text-[#555555] text-[14px]" 
   style={{ fontVariationSettings: "'opsz' 14" }}>
  Lower-rate expectations expand growth multiples.
</p>
```

#### Large Display Number
```tsx
<p className="font-['Crimson_Pro',sans-serif] font-extralight leading-[28px] text-[#555555] text-[40px] tracking-[-1.2px]">
  $131,230.19
</p>
```

### Font Variation Settings

For optimal rendering of DM Sans at smaller sizes, use optical sizing:
```tsx
style={{ fontVariationSettings: "'opsz' 14" }}
```

---

## Spacing & Layout

### Spacing Scale

Ada uses a consistent spacing scale based on 4px increments:

```css
--spacing-1: 2px;
--spacing-2: 4px;
--spacing-3: 6px;
--spacing-4: 8px;
--spacing-5: 10px;
--spacing-6: 12px;
--spacing-8: 16px;
--spacing-10: 20px;
--spacing-12: 24px;
--spacing-16: 32px;
--spacing-20: 40px;
```

### Layout Patterns

#### Screen Layout
```tsx
<div className="bg-[#efede6] relative h-screen w-full overflow-hidden">
  {/* Fixed Header - 88px */}
  <div className="absolute bg-[#f7f6f2] left-0 top-0 pb-[16px] w-full z-10">
    {/* TopBar + Header */}
  </div>

  {/* Scrollable Content */}
  <div className="absolute top-[88px] left-0 right-0 bottom-[90px] overflow-y-auto">
    <div className="flex flex-col gap-[5px] px-[6px] py-[45px]">
      {/* Cards with 5px gap */}
    </div>
  </div>

  {/* Fixed Bottom Bar - 90px */}
  <div className="absolute bottom-0 left-0 right-0 z-10">
    {/* BottomBar */}
  </div>
</div>
```

#### Card Padding
- **Standard Card**: `px-[24px] pt-[16px] pb-[24px]`
- **Wealth Card**: `px-[24px] py-[24px]`
- **Dense Card**: `px-[16px] py-[16px]`

#### Gap Patterns
- **Between Cards**: `gap-[5px]`
- **Within Card Sections**: `gap-[16px]` or `gap-[24px]`
- **Between Related Elements**: `gap-[6px]`, `gap-[8px]`, or `gap-[12px]`
- **Form Elements**: `gap-[16px]`

---

## Border Radius

### Radius Scale

```css
--radius-small: 8px;      /* Small elements, images within cards */
--radius-medium: 16px;    /* Medium components */
--radius-large: 30px;     /* Primary cards */
--radius-pill: 50px;      /* Buttons, tags, badges */
--radius-circle: 50%;     /* Circular elements */
```

### Usage

- **Cards**: `rounded-[30px]`
- **Buttons**: `rounded-[50px]` (pill shape)
- **Images**: `rounded-[8px]`
- **Tags/Badges**: `rounded-[50px]` (pill shape)
- **Chart Containers**: `rounded-[8px]` or `rounded-[12px]`

---

## Components Library

### 1. TopBar

**Purpose**: Fixed top navigation bar with logo and notifications.

**Anatomy**:
- Logo (left)
- Bell icon (right)
- Height: 40px
- Background: #f7f6f2

**Code**:
```tsx
import { TopBar } from '../ada';

<TopBar />
```

**File**: `/components/ada/TopBar.tsx`

---

### Card Layout Patterns

Ada uses two distinct card layout patterns for different content types:

#### Pattern 1: Left-Aligned Layout
**Usage**: Standard content cards, trend cards, data-focused cards  
**Characteristics**:
- Category label with icon on the left
- Title and description left-aligned
- Content fills full width
- Button and timestamp at bottom, left-aligned
- Padding: `px-[24px] py-[12px]` or `px-[24px] pt-[16px] pb-[24px]`

**Structure**:
```tsx
<div className="bg-white rounded-[30px] w-full">
  <div className="flex flex-col items-start px-[24px] py-[12px]">
    {/* Category with Icon - Left Aligned */}
    <div className="flex gap-[12px] items-center w-full">
      <div className="size-[12px]">{/* Icon */}</div>
      <p className="font-['rl-limo',sans-serif] text-[10px] uppercase tracking-[0.2px] text-[#c0180c]">
        CATEGORY
      </p>
    </div>
    
    {/* Title - Left Aligned */}
    <p className="font-['Crimson_Pro',sans-serif] text-[24px] tracking-[-0.48px] text-[#555555] w-full">
      Card Title
    </p>
    
    {/* Description - Left Aligned */}
    <p className="font-['DM_Sans',sans-serif] font-light text-[14px] text-[#555555] w-full">
      Description text
    </p>
    
    {/* Button & Timestamp */}
  </div>
</div>
```

**Examples**: Types of investors card, Trend cards, Poll card (with left-aligned title)

#### Pattern 2: Centralized Layout
**Usage**: Insight cards, peer snapshot cards, highlight cards  
**Characteristics**:
- Category label centered with divider line below
- Title centered with fixed width (277px)
- Description centered with fixed width (273px)
- All content center-aligned
- Footer timestamp in separate bar at bottom
- Padding: `px-[16px] py-[24px]`

**Structure**:
```tsx
<div className="bg-white rounded-[30px] w-full">
  <div className="flex flex-col items-start px-[16px] py-[24px]">
    <div className="flex flex-col items-center w-full">
      {/* Category with Divider - Centered */}
      <div className="flex flex-col gap-[10px] items-center w-full">
        <p className="font-['rl-limo',sans-serif] text-[10px] uppercase tracking-[0.2px] text-[#c0180c] text-center">
          INSIGHT | PEER SNAPSHOT
        </p>
        <div className="h-0 w-[162px]">
          {/* Divider line */}
        </div>
      </div>
      
      {/* Title - Centered with Fixed Width */}
      <p className="font-['Crimson_Pro',sans-serif] text-[24px] tracking-[-0.48px] text-[#555555] text-center w-[277px]">
        Card Title
      </p>
      
      {/* Description - Centered with Fixed Width */}
      <p className="font-['DM_Sans',sans-serif] text-[14px] tracking-[-0.28px] text-[#555555] text-center w-[273px]">
        Description text
      </p>
    </div>
  </div>
  
  {/* Footer with Timestamp - Separate Bar */}
  <div className="bg-white h-[40px] rounded-bl-[32px] rounded-br-[32px]">
    {/* Timestamp */}
  </div>
</div>
```

**Examples**: Insight | Peer Snapshot card, centered highlight cards

---

### 2. Header

**Purpose**: Displays greeting and contextual information.

**Anatomy**:
- Greeting text: "Good morning, Aisha"
- Subtitle: Contextual info
- Font: Crimson Pro Regular
- Padding: 24px horizontal, 16px vertical

**Code**:
```tsx
import { Header } from '../ada';

<Header />
```

**File**: `/components/ada/Header.tsx`

---

### 3. BottomBar

**Purpose**: Fixed bottom input bar with voice button and text input (AI chat interface).

**Anatomy**:
- Voice input button (44px circle, semi-transparent white)
- Text input field with "Ask anything" placeholder (rounded pill)
- Submit button (chevron icon)
- Home indicator bar at bottom
- Height: ~90px
- **Pill-shaped blur backdrop**: Extra-large blur (24px) positioned behind input area
- Blur pill is proportionately larger than the chat bar, creating a floating effect
- Input elements: 90% white opacity for high contrast

**Props**:
```typescript
{
  onSubmit?: (value: string) => void;
}
```

**Visual Effect**:
- Pill-shaped blur background: `bg-gray-100/40` with `backdrop-blur-xl` 
- Light grey tint (40% opacity) creates contrast with white input elements
- Blur extends beyond input elements (8px padding on sides, equal padding top/bottom)
- Input field: `bg-white/90` with `backdrop-blur-sm`
- Voice button: 90% white opacity
- Content scrolls behind the pill with glassmorphism blur effect
- Chat bar is vertically centered within the blur pill

**Code**:
```tsx
import { BottomBar } from '../ada';

<BottomBar onSubmit={(value) => console.log(value)} />
```

**File**: `/components/ada/BottomBar.tsx`

---

### 4. SummaryCard

**Purpose**: Main card with date header and summary content.

**Anatomy**:
- Date container (3-column: Updated time | Title | Date)
- Divider line
- Summary description (18px, centered)
- Children content

**Props**:
```typescript
{
  date: string;      // e.g., "TODAY'S SUMMARY"
  title: string;     // e.g., "10th Dec 2025"
  subtitle: string;  // Summary description
  children: React.ReactNode;
}
```

**Code**:
```tsx
import { SummaryCard } from '../ada';

<SummaryCard
  date="TODAY'S SUMMARY"
  title="10th Dec 2025"
  subtitle="Ada's personalised insights for you today. You have 4 items to review."
>
  {/* Content */}
</SummaryCard>
```

**File**: `/components/ada/SummaryCard.tsx`

---

### 5. ContentCard

**Purpose**: Standard content card for insights, news, and updates.

**Anatomy**:
- Intent badge (above topic label on the left, if applicable)
  - 10px DM Sans Regular, uppercase, tracking 0.2px
  - Colored background with 4px rounded corners
- Topic label: 10px DM Sans SemiBold, uppercase, tracking 0.8px
- Title (24px)
- Description (14px)
- Optional image
- Button
- Timestamp

**Intent Badge Variations**:
- **Portfolio Risk Alert**: "ALERT" badge with amber/orange background (#d9770615) and text (#d97706)
- **Market Opportunity Insight**: "OPPORTUNITY" badge with emerald green background (#05966915) and text (#059669)
- **News/Educational**: No intent badge

**Layout**:
- Card padding: 20px horizontal, 20px vertical (reduced from 24px horizontal for tighter spacing)
- Rounded corners: 30px
- White background

**Props**:
```typescript
{
  category?: string;
  categoryType?: 'PORTFOLIO RISK ALERT' | 'MARKET OPPORTUNITY INSIGHT' | 'NEWS' | 'ACTION ITEM' | 'INSIGHT' | 'EDUCATIONAL' | 'RECOMMENDED READ';
  title: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  timestamp?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  customTopic?: string;
  topicLabelColor?: string;
  hideIntent?: boolean;
  sourcesCount?: number;
  detailSections?: Array<{ title: string; content: string[] | string; }>;
}
```

**Code**:
```tsx
import { ContentCard } from '../ada';

<ContentCard
  categoryType="MARKET OPPORTUNITY INSIGHT"
  title="Fed rate-cut odds rise to 72%"
  description="Lower-rate expectations expand growth multiples."
  buttonText="Dive deeper"
/>
```

**File**: `/components/ada/ContentCard.tsx`

---

### 6. InsightCard

**Purpose**: Lounge section card for insights, trends, and polls.

**Anatomy**:
- Type label with divider
- Centered title (24px)
- Optional description
- Content area
- Footer with timestamp

**Props**:
```typescript
{
  type: 'INSIGHT' | 'TREND' | 'POLL';
  title: string;
  description?: string;
  children: React.ReactNode;
  timestamp?: string;
}
```

**Code**:
```tsx
import { InsightCard } from '../ada';

<InsightCard
  type="INSIGHT"
  title="You allocate more to long-term growth assets than 62% of investors"
  description="Your peers lean slightly more conservative"
  timestamp="13h:31m:47s"
>
  {/* Visualization content */}
</InsightCard>
```

**File**: `/components/ada/InsightCard.tsx`

---

### 7. Tag

**Purpose**: Filter tags and pill-shaped selectors.

**Anatomy**:
- Pill shape (rounded-[50px])
- Border: 0.5px #441316
- Text: 12px DM Sans Regular
- States: Active (opacity 100%) / Inactive (opacity 50%)

**Props**:
```typescript
{
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Code**:
```tsx
import { Tag } from '../ada';

<Tag active={true} onClick={() => {}}>
  Weekly Highlights
</Tag>
```

**File**: `/components/ada/Tag.tsx`

---

### 8. WealthCard

**Purpose**: Wealth tab portfolio overview card.

**Anatomy**:
- Account name with icon
- Total balance (large display)
- Performance badge
- Stats row
- View details link

**Props**:
```typescript
{
  accountName: string;
  accountIcon?: React.ReactNode;
  balance: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  stats?: Array<{ label: string; value: string }>;
}
```

**Code**:
```tsx
import { WealthCard } from '../ada/wealth';

<WealthCard
  accountName="Investment Portfolio"
  balance="$131,230.19"
  change="+$2,210.10"
  changePercent="+2.44%"
  isPositive={true}
  stats={[
    { label: "Today", value: "+0.8%" },
    { label: "This Week", value: "+1.2%" }
  ]}
/>
```

**File**: `/components/ada/wealth/WealthCard.tsx`

---

### 9. AllocationChart

**Purpose**: Donut chart showing asset allocation.

**Anatomy**:
- Donut chart with segments
- Center value display
- Legend with percentages
- Compact layout

**Props**:
```typescript
{
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  centerLabel?: string;
  centerValue?: string;
}
```

**Code**:
```tsx
import { AllocationChart } from '../ada/wealth';

<AllocationChart
  data={[
    { label: "Equities", value: 45, color: "#9ddc3d" },
    { label: "Bonds", value: 30, color: "#e8e8e8" },
    { label: "Alternatives", value: 25, color: "#d9c6ed" }
  ]}
  centerLabel="Total"
  centerValue="100%"
/>
```

**File**: `/components/ada/wealth/AllocationChart.tsx`

---

### 10. PerformanceChart

**Purpose**: Line chart showing performance over time.

**Anatomy**:
- Area chart with gradient fill
- Time period selector
- Y-axis labels
- Responsive to data

**Props**:
```typescript
{
  data: Array<{ date: string; value: number }>;
  height?: number;
  showGrid?: boolean;
  gradientColors?: [string, string];
}
```

**Code**:
```tsx
import { PerformanceChart } from '../ada/wealth';

<PerformanceChart
  data={performanceData}
  height={200}
  showGrid={true}
  gradientColors={["#9ddc3d", "#ffffff"]}
/>
```

**File**: `/components/ada/wealth/PerformanceChart.tsx`

---

### 11. HoldingRow

**Purpose**: Individual holding/asset row in portfolio.

**Anatomy**:
- Asset icon/logo
- Asset name and ticker
- Shares/quantity
- Current value
- Change indicator

**Props**:
```typescript
{
  icon?: React.ReactNode;
  name: string;
  ticker?: string;
  shares?: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}
```

**Code**:
```tsx
import { HoldingRow } from '../ada/wealth';

<HoldingRow
  name="Apple Inc."
  ticker="AAPL"
  shares="50 shares"
  value="$8,750.00"
  change="+$125.50"
  changePercent="+1.45%"
  isPositive={true}
/>
```

**File**: `/components/ada/wealth/HoldingRow.tsx`

---

### 12. MetricCard

**Purpose**: Small stat card for key metrics.

**Anatomy**:
- Label (10px uppercase)
- Value (20px-24px)
- Optional subtext
- Compact padding

**Props**:
```typescript
{
  label: string;
  value: string;
  subtext?: string;
  icon?: React.ReactNode;
}
```

**Code**:
```tsx
import { MetricCard } from '../ada/wealth';

<MetricCard
  label="TOTAL RETURN"
  value="+18.5%"
  subtext="Since inception"
/>
```

**File**: `/components/ada/wealth/MetricCard.tsx`

---

### 13. ProgressBar

**Purpose**: Visual progress indicator for goals.

**Anatomy**:
- Background bar
- Filled segment
- Percentage label
- Height: 8px

**Props**:
```typescript
{
  value: number;      // 0-100
  color?: string;
  label?: string;
  showPercentage?: boolean;
}
```

**Code**:
```tsx
import { ProgressBar } from '../ada/wealth';

<ProgressBar
  value={75}
  color="#9ddc3d"
  label="Emergency Fund"
  showPercentage={true}
/>
```

**File**: `/components/ada/wealth/ProgressBar.tsx`

---

### 14. TimeRangeSelector

**Purpose**: Button group for selecting time ranges.

**Anatomy**:
- Pill buttons in a row
- Active state highlight
- Options: 1D, 1W, 1M, 3M, 1Y, ALL

**Props**:
```typescript
{
  value: string;
  onChange: (value: string) => void;
  options: string[];
}
```

**Code**:
```tsx
import { TimeRangeSelector } from '../ada/wealth';

<TimeRangeSelector
  value="1M"
  onChange={(val) => setRange(val)}
  options={["1D", "1W", "1M", "3M", "1Y", "ALL"]}
/>
```

**File**: `/components/ada/wealth/TimeRangeSelector.tsx`

---

### 15. AccountSelector

**Purpose**: Dropdown to switch between accounts.

**Anatomy**:
- Current account display
- Dropdown icon
- Account list on click
- Shows balance

**Props**:
```typescript
{
  accounts: Array<{
    id: string;
    name: string;
    balance: string;
  }>;
  selectedId: string;
  onChange: (id: string) => void;
}
```

**Code**:
```tsx
import { AccountSelector } from '../ada/wealth';

<AccountSelector
  accounts={accountsList}
  selectedId="portfolio-1"
  onChange={handleAccountChange}
/>
```

**File**: `/components/ada/wealth/AccountSelector.tsx`

---

### 16. TransactionRow

**Purpose**: Individual transaction in history list.

**Anatomy**:
- Transaction type icon
- Description
- Date/time
- Amount (positive/negative)

**Props**:
```typescript
{
  type: 'buy' | 'sell' | 'dividend' | 'fee';
  description: string;
  date: string;
  amount: string;
  isPositive: boolean;
}
```

**Code**:
```tsx
import { TransactionRow } from '../ada/wealth';

<TransactionRow
  type="buy"
  description="Bought AAPL"
  date="Dec 10, 2025"
  amount="+$1,250.00"
  isPositive={false}
/>
```

**File**: `/components/ada/wealth/TransactionRow.tsx`

---

## Data Visualization

### Chart Color Palette

```typescript
const chartColors = {
  primary: "#9ddc3d",      // Bright green
  secondary: "#d9c6ed",    // Lavender
  tertiary: "#e8e8e8",     // Light gray
  accent: "#c0180c",       // Brand red
  positive: "#c6ff6a",     // Success background
  negative: "#ff6b6b",     // Error/negative
  neutral: "#555555",      // Gray
};
```

### Chart Guidelines

1. **Donut Charts**: Use for allocation/composition (max 5 segments)
2. **Line Charts**: Use for performance over time
3. **Bar Charts**: Use for comparisons across categories
4. **Treemaps**: Use for hierarchical data (Lounge section)

### Chart Typography

- **Chart Labels**: DM Sans Regular 12px
- **Chart Values**: Crimson Pro Light 16px-40px
- **Axis Labels**: DM Sans Regular 10px
- **Legend**: DM Sans Regular 12px

---

## Icons & Graphics

### Icon System

Ada uses Lucide React icons with consistent sizing:

- **Small Icons**: `size-[16px]` (deprecated for interactive elements)
- **Medium Icons**: `size-[20px]` or `size-[24px]`
- **Large Icons**: `size-[32px]` or `size-[40px]`
- **Stroke Width**: `strokeWidth={1}` or `strokeWidth={1.5}`

**Accessibility Note**: For interactive header icons (close buttons, navigation), use minimum `size-[20px]` to ensure adequate touch targets and visual clarity.

### Common Icons

```tsx
import { 
  Home, 
  TrendingUp, 
  Compass, 
  Users,
  Bell,
  ChevronRight,
  Clock,
  Plus,
  Search
} from 'lucide-react';
```

### Custom Graphics

The Ada design system includes custom SVG graphics:

1. **Spark Icon**: Orbital atom-style icon for AI features
   - Component: `SparkIcon`
   - Location: `/components/ada/SparkIcon.tsx`
   - Default size: 18px
   - Stroke weight: 1 (consistent line weight across all icons)
   - Color: Defaults to `#d8d8d8`, customizable via props
   - Usage: Used in AI-related CTA buttons (Button component variants `ai-chat` and `ai-primary`)
   - Design: Two overlapping elliptical paths creating an atomic orbital pattern
2. **Diamond**: Geometric shapes for insights
3. **Trend Lines**: Custom chart icons
4. **Logo**: Ada branding

Custom SVGs are stored in `/imports/` directory and imported via the figma:asset scheme or relative imports.

---

## Usage Guidelines

### Component Composition

Always compose screens using the standard layout pattern:

```tsx
export function YourScreen() {
  return (
    <div className="bg-[#efede6] relative h-screen w-full overflow-hidden">
      {/* Fixed Header */}
      <div className="absolute bg-[#f7f6f2] left-0 top-0 w-full z-10">
        <TopBar />
        <Header />
      </div>

      {/* Scrollable Content */}
      <div className="absolute top-[88px] left-0 right-0 bottom-[90px] overflow-y-auto">
        <div className="flex flex-col gap-[5px] px-[6px] py-[45px]">
          {/* Your cards here */}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomBar />
      </div>
    </div>
  );
}
```

### Button Patterns

#### Primary Button
```tsx
<button className="bg-[#f7f6f2] flex h-[44px] items-center justify-center px-[14px] py-[10px] rounded-[50px]">
  <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
  <p className="font-['DM_Sans',sans-serif] leading-[normal] not-italic text-[#555555] text-[12px]">
    Button Text
  </p>
</button>
```

#### Secondary Button (Outline Only)
```tsx
<button className="flex h-[44px] items-center justify-center px-[14px] py-[10px] rounded-[50px]">
  <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
  <p className="font-['DM_Sans',sans-serif] leading-[normal] not-italic text-[#555555] text-[12px]">
    Button Text
  </p>
</button>
```

### Badge Patterns

#### Success Badge
```tsx
<div className="bg-[#c6ff6a] flex gap-[6px] h-[24px] items-center justify-center px-[8px] py-[10px] rounded-[50px]">
  <div className="size-[8px]">
    {/* Up arrow icon */}
  </div>
  <p className="font-['DM_Sans',sans-serif] leading-[normal] text-[#03561a] text-[12px]">
    +$2,210.1 (+2.44%)
  </p>
</div>
```

### Divider Lines

#### Horizontal Divider
```tsx
<div className="h-0 relative shrink-0 w-full">
  <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 315 1">
      <line stroke="#555555" strokeWidth="0.5" x2="315" y1="0.25" y2="0.25" />
    </svg>
  </div>
</div>
```

#### Short Divider (Centered)
```tsx
<div className="h-0 relative shrink-0 w-[162px]">
  <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 162 1">
      <line stroke="#555555" strokeWidth="0.5" x2="162" y1="0.25" y2="0.25" />
    </svg>
  </div>
</div>
```

### Timestamp Pattern

```tsx
<div className="flex gap-[6px] items-center opacity-70">
  <div className="size-[7px]">
    <svg className="block size-full" fill="none" viewBox="0 0 8 8">
      <path d="M7.5 4C7.5 5.933 5.933 7.5 4 7.5C2.067 7.5 0.5 5.933 0.5 4C0.5 2.067 2.067 0.5 4 0.5C5.933 0.5 7.5 2.067 7.5 4Z" 
            stroke="#555555" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
    </svg>
  </div>
  <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[9px] leading-[18px]">
    4 days remaining
  </p>
</div>
```

---

## Design Tokens Reference

### Complete Token List

```typescript
export const tokens = {
  // Colors
  colors: {
    background: {
      primary: "#efede6",
      secondary: "#f7f6f2",
      card: "#ffffff",
    },
    text: {
      primary: "#555555",
      accent: "#c0180c",
      dark: "#441316",
      success: "#03561a",
    },
    border: {
      subtle: "#d8d8d8",
      line: "#555555",
      dark: "#441316",
    },
    chart: {
      purple: {
        light: "#d9c6ed",
        medium: "#c9aee5",
        dark: "#441316",
      },
      green: "#9ddc3d",
      successBg: "#c6ff6a",
      gray: "#e8e8e8",
    },
  },
  
  // Spacing
  spacing: {
    1: "2px",
    2: "4px",
    3: "6px",
    4: "8px",
    5: "10px",
    6: "12px",
    8: "16px",
    10: "20px",
    12: "24px",
    16: "32px",
    20: "40px",
  },
  
  // Border Radius
  radius: {
    small: "8px",
    medium: "16px",
    large: "30px",
    pill: "50px",
    circle: "50%",
  },
  
  // Typography
  fontSize: {
    micro: "9px",
    caption: "10px",
    small: "12px",
    body: "14px",
    bodyLarge: "18px",
    headline: "24px",
    display: "40px",
  },
  
  // Shadows (if needed)
  shadow: {
    subtle: "0 1px 2px rgba(0, 0, 0, 0.05)",
    medium: "0 4px 6px rgba(0, 0, 0, 0.07)",
  },
};
```

---

## File Structure

```
/components
  /ada
    TopBar.tsx
    Header.tsx
    BottomBar.tsx
    SummaryCard.tsx
    ContentCard.tsx
    InsightCard.tsx
    Tag.tsx
    /wealth
      WealthCard.tsx
      AllocationChart.tsx
      PerformanceChart.tsx
      HoldingRow.tsx
      MetricCard.tsx
      ProgressBar.tsx
      TimeRangeSelector.tsx
      AccountSelector.tsx
      TransactionRow.tsx
    index.tsx
  /screens
    HomeScreen.tsx
    WealthScreen.tsx
    DiscoverScreen.tsx
    LoungeScreen.tsx
    
/styles
  globals.css
  
/imports
  [Figma-imported assets and SVGs]

DESIGN_SYSTEM.md
TYPOGRAPHY_GUIDE.md
```

---

## Changelog

### Version 1.0 (December 2025)
- Initial design system export
- 16 core components documented
- Complete typography system
- Color palette finalized
- Spacing and layout patterns established
- Wealth tab components added (11 new components)
- Data visualization guidelines
- Lounge section patterns

---

## Contributing

When creating new components:

1. **Follow existing patterns**: Use the same card structure, spacing, and typography
2. **Use design tokens**: Reference colors, spacing, and typography from this guide
3. **Document thoroughly**: Add props, usage examples, and screenshots
4. **Test responsiveness**: Ensure components work within the 430px viewport
5. **Update this guide**: Add new components and patterns to the relevant sections

---

## Resources

- **Figma Files**: Original 6 screens (Home, Discover, Lounge, AI Chat, Wealth)
- **Typography Guide**: `/TYPOGRAPHY_GUIDE.md`
- **Component Library**: `/components/ada/`
- **Implementation Examples**: `/components/screens/`

---

**For questions or contributions, refer to the component files and implementation examples in the codebase.**