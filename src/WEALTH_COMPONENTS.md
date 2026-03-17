# Wealth Tab Components Documentation

This document details all components created for the Wealth Tab screen in the Ada design system.

## Chart Components

### Sparkline
**Path:** `/components/ada/charts/Sparkline.tsx`

A minimal line chart for displaying trends in a compact space.

**Props:**
- `data: number[]` - Array of numeric values to plot
- `width?: number` - Width in pixels (default: 60)
- `height?: number` - Height in pixels (default: 24)
- `color?: string` - Line color (default: #555555)
- `strokeWidth?: number` - Line thickness (default: 1.5)
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<Sparkline 
  data={[120, 125, 123, 128, 130]} 
  width={80}
  height={32}
  color="#441316"
/>
```

---

### LineChart
**Path:** `/components/ada/charts/LineChart.tsx`

A full-featured interactive line chart with hover states, grid lines, and labels.

**Props:**
- `data: { value: number; label: string }[]` - Array of data points with values and labels
- `height?: number` - Chart height in pixels (default: 200)
- `color?: string` - Line color (default: #441316)
- `fillColor?: string` - Area fill color (default: rgba(68, 19, 22, 0.05))
- `showGrid?: boolean` - Show grid lines (default: true)
- `showLabels?: boolean` - Show x-axis labels (default: true)

**Usage:**
```tsx
<LineChart 
  data={[
    { value: 125000, label: 'Jan' },
    { value: 128000, label: 'Feb' },
    { value: 131000, label: 'Mar' }
  ]}
  height={220}
/>
```

---

### DonutChart
**Path:** `/components/ada/charts/DonutChart.tsx`

A donut/ring chart for displaying proportional data with optional center content.

**Props:**
- `segments: DonutSegment[]` - Array of segments with label, value, and color
- `size?: number` - Chart diameter in pixels (default: 140)
- `strokeWidth?: number` - Ring thickness (default: 20)
- `centerLabel?: string` - Optional center label text
- `centerValue?: string` - Optional center value text

**DonutSegment Interface:**
```tsx
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}
```

**Usage:**
```tsx
<DonutChart 
  segments={[
    { label: 'Stocks', value: 50000, color: '#441316' },
    { label: 'Crypto', value: 30000, color: '#c0180c' },
    { label: 'Cash', value: 20000, color: '#a0e622' }
  ]}
  size={140}
  centerLabel="Total"
  centerValue="$100k"
/>
```

---

### ProgressRing
**Path:** `/components/ada/charts/ProgressRing.tsx`

A circular progress indicator showing completion percentage.

**Props:**
- `progress: number` - Progress value from 0-100
- `size?: number` - Ring diameter in pixels (default: 80)
- `strokeWidth?: number` - Ring thickness (default: 8)
- `color?: string` - Progress color (default: #a0e622)
- `backgroundColor?: string` - Background ring color (default: #efede6)
- `showPercentage?: boolean` - Show percentage in center (default: true)

**Usage:**
```tsx
<ProgressRing 
  progress={66}
  size={80}
  color="#a0e622"
/>
```

---

### WealthPerformanceChart
**Path:** `/components/ada/charts/WealthPerformanceChart.tsx`

A premium interactive chart component with multiple timeframe support, crosshair scrubbing, and hover interactions. Features:
- **Interactive Scrubbing:** Vertical crosshair with perfectly circular indicator that follows cursor/touch
- **Detailed Data Points:** High-resolution data allows scrubbing through every detail (e.g., hourly for 1D, monthly for 1Y)
- **Smart X-Axis Labels:** Automatically shows key time markers while reducing clutter (e.g., 1D shows 9am, 12pm, 3pm, 6pm)
- **Value Tooltip:** Displays formatted value and label at hovered point
- **Consistent Line Weight:** Uses vector effect to maintain uniform stroke width across the entire chart, preventing distortion
- **Responsive Design:** Touch-enabled for mobile interactions

**Props:**
- `title?: string` - Chart title displayed in header
- `summaryMetric?: { value: string; isPositive: boolean }` - Summary metric badge
- `data: { [TimeFrame]: { value: number; label: string }[] }` - Performance data for each timeframe
- `defaultTimeFrame?: TimeFrame` - Initial timeframe (default: '1M')
- `height?: number` - Chart height in pixels (default: 220)
- `color?: string` - Line color (default: '#441316')
- `fillColor?: string` - Area fill color (default: 'rgba(68, 19, 22, 0.05)')
- `loading?: boolean` - Loading state
- `onHoverData?: (data: { value: number; label: string } | null) => void` - Callback when hovering over data points

**TimeFrame Type:** `'1D' | '1W' | '1M' | '3M' | '1Y'`

**Data Point Recommendations:**
- **1D:** 10+ hourly data points (X-axis shows 9am, 12pm, 3pm, 6pm)
- **1W:** 5-7 daily data points
- **1M:** 4-8 weekly data points
- **3M:** 3-4 monthly data points
- **1Y:** 12 monthly data points (X-axis shows Jan and Dec only)

**Usage:**
```tsx
<WealthPerformanceChart 
  title="Performance"
  summaryMetric={{ value: '+2.4%', isPositive: true }}
  data={{
    '1D': [
      { value: 130200, label: '9am' },
      { value: 130300, label: '10am' },
      { value: 130400, label: '11am' },
      { value: 130500, label: '12pm' },
      { value: 130600, label: '1pm' },
      { value: 130700, label: '2pm' },
      { value: 130800, label: '3pm' },
      { value: 130900, label: '4pm' },
      { value: 131000, label: '5pm' },
      { value: 131230, label: '6pm' }
    ],
    '1W': [
      { value: 128500, label: 'Mon' },
      { value: 129100, label: 'Tue' },
      { value: 129800, label: 'Wed' },
      { value: 130500, label: 'Thu' },
      { value: 131230, label: 'Fri' }
    ],
    '1M': [
      { value: 125000, label: '11/12' },
      { value: 126500, label: '11/19' },
      { value: 125800, label: '11/26' },
      { value: 127200, label: '12/03' },
      { value: 128500, label: '12/10' },
      { value: 131230, label: '12/12' }
    ],
    '3M': [
      { value: 115000, label: 'Sep' },
      { value: 118500, label: 'Oct' },
      { value: 125000, label: 'Nov' },
      { value: 131230, label: 'Dec' }
    ],
    '1Y': [
      { value: 98000, label: 'Jan' },
      { value: 99500, label: 'Feb' },
      { value: 102000, label: 'Mar' },
      { value: 104500, label: 'Apr' },
      { value: 108000, label: 'May' },
      { value: 110500, label: 'Jun' },
      { value: 115000, label: 'Jul' },
      { value: 118000, label: 'Aug' },
      { value: 122000, label: 'Sep' },
      { value: 126000, label: 'Oct' },
      { value: 128500, label: 'Nov' },
      { value: 131230, label: 'Dec' }
    ]
  }}
  defaultTimeFrame="1M"
  height={220}
  color="#441316"
  onHoverData={(data) => {
    if (data) {
      console.log(`Hovering: ${data.value} at ${data.label}`);
    }
  }}
/>
```

**Integration with WealthOverviewCard:**
The `onHoverData` callback enables synchronized value updates in parent components:
```tsx
const [hoveredData, setHoveredData] = useState<{ value: number; label: string } | null>(null);
const displayValue = hoveredData ? hoveredData.value : totalValue;

<WealthPerformanceChart 
  data={performanceData}
  onHoverData={setHoveredData}
/>
```

---

## Wealth-Specific Components

### WealthOverviewCard
**Path:** `/components/ada/wealth/WealthOverviewCard.tsx`

Displays total portfolio value with daily change and optional sparkline.

**Props:**
- `totalValue: number` - Total portfolio value
- `dailyChange: number` - Change in currency
- `dailyChangePercent: number` - Change as percentage
- `weeklyChangePercent?: number` - Optional 7-day change
- `monthlyChangePercent?: number` - Optional 30-day change
- `sparklineData?: number[]` - Optional trend data

**Usage:**
```tsx
<WealthOverviewCard
  totalValue={131230.19}
  dailyChange={1090}
  dailyChangePercent={2.4}
  weeklyChangePercent={2.1}
  monthlyChangePercent={5.8}
  sparklineData={[128000, 129500, 130000, 131230]}
/>
```

---

### ConnectedAccountRow
**Path:** `/components/ada/wealth/ConnectedAccountRow.tsx`

Displays a connected financial account with logo, name, balance, and sync status.

**Props:**
- `name: string` - Account name
- `logo: React.ReactNode` - Account logo/icon
- `balance: number` - Account balance
- `lastUpdated: string` - Last sync time text
- `status?: 'synced' | 'syncing' | 'error'` - Sync status (default: synced)
- `onRefresh?: () => void` - Optional refresh handler

**Usage:**
```tsx
<ConnectedAccountRow
  name="Binance"
  logo={<BinanceIcon />}
  balance={42850.32}
  lastUpdated="2 min ago"
  status="synced"
/>
```

---

### AssetAllocationCard
**Path:** `/components/ada/wealth/AssetAllocationCard.tsx`

Shows portfolio asset allocation with donut chart and detailed breakdown.

**Props:**
- `allocations: AllocationItem[]` - Array of asset allocations
- `totalValue: number` - Total portfolio value

**AllocationItem Interface:**
```tsx
interface AllocationItem {
  label: string;
  value: number;
  amount: number;
  color: string;
}
```

**Usage:**
```tsx
<AssetAllocationCard 
  allocations={[
    { label: 'Equities', value: 52460, amount: 52460, color: '#441316' },
    { label: 'Crypto', value: 32861, amount: 32861, color: '#c0180c' },
    { label: 'Cash', value: 26246, amount: 26246, color: '#a0e622' }
  ]}
  totalValue={131230}
/>
```

---

### PortfolioHealthCard
**Path:** `/components/ada/wealth/PortfolioHealthCard.tsx`

Displays diversification score, risk level, and suggested actions.

**Props:**
- `diversificationScore: number` - Score from 0-100
- `riskLevel: 'low' | 'moderate' | 'high'` - Portfolio risk level
- `suggestions?: string[]` - Optional action suggestions

**Usage:**
```tsx
<PortfolioHealthCard
  diversificationScore={82}
  riskLevel="low"
  suggestions={[
    'Consider increasing fixed income exposure',
    'Your crypto allocation is above recommended threshold'
  ]}
/>
```

---

### HoldingRow
**Path:** `/components/ada/wealth/HoldingRow.tsx`

Displays individual asset holding with sparkline and performance.

**Props:**
- `symbol: string` - Asset ticker symbol
- `name: string` - Asset full name
- `value: number` - Current value
- `changePercent: number` - Percentage change
- `sparklineData?: number[]` - Optional trend data

**Usage:**
```tsx
<HoldingRow
  symbol="AAPL"
  name="Apple Inc."
  value={12340}
  changePercent={2.4}
  sparklineData={[12000, 12100, 12200, 12340]}
/>
```

---

### GoalCard
**Path:** `/components/ada/wealth/GoalCard.tsx`

Displays financial goal with progress ring and timeline.

**Props:**
- `title: string` - Goal title
- `targetAmount: number` - Target amount
- `currentAmount: number` - Current progress
- `deadline: string` - Target date
- `icon?: React.ReactNode` - Optional icon
- `color?: string` - Progress ring color (default: #a0e622)

**Usage:**
```tsx
<GoalCard
  title="Buy a Home"
  targetAmount={250000}
  currentAmount={165000}
  deadline="Dec 2026"
  icon={<Home className="size-[18px]" />}
  color="#a0e622"
/>
```

---

## Design Tokens

### New Color Tokens

The following tokens have been added to `/styles/design-tokens.css`:

**Semantic Status Colors:**
```css
--ada-error-bg: #c0180c;
--ada-error-text: #ffffff;
--ada-warning-bg: #f59e0b;
--ada-warning-text: #78350f;
--ada-info-bg: #6C63FF;
--ada-info-text: #ffffff;
```

**Chart & Data Visualization:**
```css
--ada-chart-primary: #441316;
--ada-chart-secondary: #c0180c;
--ada-chart-success: #a0e622;
--ada-chart-warning: #f59e0b;
--ada-chart-neutral: #555555;
--ada-chart-grid: rgba(85, 85, 85, 0.1);
--ada-chart-fill: rgba(68, 19, 22, 0.05);
--ada-chart-hover: rgba(68, 19, 22, 0.1);
```

---

## Design Consistency

All wealth components follow the existing Ada design system:

✅ **Typography:** Uses established font families (RL_Limo, Crimson_Pro, DM_Sans)  
✅ **Spacing:** Follows existing spacing scale (6px, 8px, 12px, 16px, 24px)  
✅ **Radius:** Uses standard radii (8px for small elements, 30px for cards)  
✅ **Colors:** Extends existing color palette with complementary shades  
✅ **Cards:** All cards use white background with 30px border radius  
✅ **Pills:** Change indicators use same style as Home screen  
✅ **Buttons:** Secondary button style with cream background  

---

## Usage in Wealth Screen

The complete Wealth Tab is available at `/components/screens/WealthScreen.tsx` and includes:

1. **Total Wealth Overview** - Portfolio value with sparkline
2. **Connected Accounts** - Binance, IBKR, WIO integrations
3. **Portfolio Performance** - Interactive chart with timeframe selector
4. **Asset Allocation** - Donut chart with category breakdown
5. **Portfolio Health** - Diversification score and risk assessment
6. **Top Holdings** - List of best performing assets
7. **Goals & Progress** - Financial goals with progress trackers

Access the Wealth Tab by clicking the "Wealth" tab in the navigation.