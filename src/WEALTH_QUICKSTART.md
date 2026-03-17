# Wealth Tab - Quick Start Guide

Get up and running with the Ada Wealth Dashboard components in minutes.

## 🚀 Access the Wealth Tab

The Wealth Tab is already integrated into the app. Simply:

1. Open the app in your browser
2. Click the **"Wealth"** tab in the navigation bar
3. Explore the complete wealth dashboard

Or use the demo switcher to jump directly to any screen.

---

## 📦 What's Included

### 7 New Wealth Components

1. **WealthOverviewCard** - Portfolio total with change indicators
2. **ConnectedAccountRow** - Financial account integrations  
3. **PerformanceChartCard** - Interactive multi-timeframe chart
4. **AssetAllocationCard** - Donut chart breakdown
5. **PortfolioHealthCard** - Diversification & risk metrics
6. **HoldingRow** - Individual asset performance
7. **GoalCard** - Financial goal tracker

### 4 Chart Components

1. **Sparkline** - Compact trend line
2. **LineChart** - Full interactive chart
3. **DonutChart** - Proportional ring chart
4. **ProgressRing** - Circular progress indicator

---

## 💻 Import Components

### All at once
```tsx
import {
  WealthOverviewCard,
  ConnectedAccountRow,
  PerformanceChartCard,
  AssetAllocationCard,
  PortfolioHealthCard,
  HoldingRow,
  GoalCard
} from './components/ada';
```

### Charts only
```tsx
import {
  Sparkline,
  LineChart,
  DonutChart,
  ProgressRing
} from './components/ada';
```

### Individual imports
```tsx
import { WealthOverviewCard } from './components/ada/wealth/WealthOverviewCard';
import { LineChart } from './components/ada/charts/LineChart';
```

---

## 🎯 Common Use Cases

### 1. Display Portfolio Value

```tsx
<WealthOverviewCard
  totalValue={150000}
  dailyChange={2500}
  dailyChangePercent={1.7}
  sparklineData={[145000, 148000, 150000]}
/>
```

### 2. Show Account Integrations

```tsx
<ConnectedAccountRow
  name="Binance"
  logo={<YourLogo />}
  balance={42850.32}
  lastUpdated="2 min ago"
  status="synced"
/>
```

### 3. Interactive Performance Chart

```tsx
<PerformanceChartCard 
  data={{
    '1D': [{ value: 149000, label: '9am' }, ...],
    '1W': [{ value: 145000, label: 'Mon' }, ...],
    '1M': [{ value: 140000, label: 'W1' }, ...],
    '3M': [{ value: 130000, label: 'Oct' }, ...],
    '1Y': [{ value: 100000, label: 'Jan' }, ...]
  }}
  defaultTimeFrame="1M"
/>
```

### 4. Asset Allocation Breakdown

```tsx
<AssetAllocationCard 
  allocations={[
    { label: 'Stocks', value: 75000, amount: 75000, color: '#441316' },
    { label: 'Bonds', value: 50000, amount: 50000, color: '#a0e622' },
    { label: 'Crypto', value: 25000, amount: 25000, color: '#c0180c' }
  ]}
  totalValue={150000}
/>
```

### 5. Portfolio Health

```tsx
<PortfolioHealthCard
  diversificationScore={85}
  riskLevel="moderate"
  suggestions={[
    'Consider rebalancing crypto holdings',
    'Diversification is strong'
  ]}
/>
```

### 6. Top Holdings List

```tsx
<HoldingRow
  symbol="AAPL"
  name="Apple Inc."
  value={25000}
  changePercent={3.2}
  sparklineData={[24000, 24500, 25000]}
/>
```

### 7. Financial Goals

```tsx
<GoalCard
  title="Down Payment"
  targetAmount={100000}
  currentAmount={65000}
  deadline="Jun 2026"
  icon={<Home className="size-[18px]" />}
  color="#a0e622"
/>
```

---

## 🎨 Color Palette

Use these colors for data visualization:

```tsx
// Primary data colors
const colors = {
  primary: '#441316',      // Deep burgundy
  secondary: '#c0180c',    // Bright red
  success: '#a0e622',      // Bright green
  warning: '#f59e0b',      // Amber
  neutral: '#555555'       // Gray
};

// Usage in charts
<DonutChart 
  segments={[
    { label: 'Stocks', value: 50, color: colors.primary },
    { label: 'Crypto', value: 30, color: colors.secondary },
    { label: 'Cash', value: 20, color: colors.success }
  ]}
/>
```

---

## 📊 Chart Data Format

### Sparkline
```tsx
// Simple array of numbers
const data = [100, 105, 103, 108, 112];
```

### LineChart
```tsx
// Array of objects with value and label
const data = [
  { value: 100000, label: 'Jan' },
  { value: 120000, label: 'Feb' },
  { value: 150000, label: 'Mar' }
];
```

### DonutChart
```tsx
// Array of segments with label, value, and color
const segments = [
  { label: 'Stocks', value: 50000, color: '#441316' },
  { label: 'Bonds', value: 30000, color: '#a0e622' },
  { label: 'Cash', value: 20000, color: '#f59e0b' }
];
```

### ProgressRing
```tsx
// Simple number from 0-100
const progress = 66;
```

---

## 🏗️ Build a Custom Wealth Screen

```tsx
import React from 'react';
import { TopBar, Header, BottomBar } from './components/ada';
import {
  WealthOverviewCard,
  AssetAllocationCard,
  HoldingRow
} from './components/ada';

export function MyWealthScreen() {
  return (
    <div className="bg-[#efede6] h-screen overflow-hidden relative">
      {/* Fixed Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-[#f7f6f2] pb-[16px]">
        <TopBar />
        <Header />
      </div>

      {/* Scrollable Content */}
      <div className="absolute top-[88px] left-0 right-0 bottom-[90px] overflow-y-auto">
        <div className="flex flex-col gap-[5px] px-[6px] py-[45px]">
          
          {/* Overview */}
          <WealthOverviewCard
            totalValue={200000}
            dailyChange={3500}
            dailyChangePercent={1.75}
          />

          {/* Allocation */}
          <AssetAllocationCard 
            allocations={myAllocations}
            totalValue={200000}
          />

          {/* Holdings */}
          <div className="bg-white rounded-[30px] p-[24px]">
            <p className="font-['RL_Limo:Regular',sans-serif] text-[#c0180c] text-[10px] mb-[12px]">
              HOLDINGS
            </p>
            {holdings.map(h => <HoldingRow key={h.symbol} {...h} />)}
          </div>
        </div>
      </div>

      {/* Fixed Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomBar />
      </div>
    </div>
  );
}
```

---

## 🎯 Pro Tips

### 1. **Use Existing Design Tokens**
Always reference CSS variables:
```tsx
// ✅ Good
className="bg-[#f7f6f2] text-[#555555]"

// ❌ Avoid
className="bg-gray-100 text-gray-600"
```

### 2. **Format Currency Properly**
```tsx
// ✅ Good
${value.toLocaleString('en-US', { 
  minimumFractionDigits: 2, 
  maximumFractionDigits: 2 
})}

// Result: $1,234.56
```

### 3. **Use Semantic Colors**
```tsx
// Positive changes
<div className="bg-[#a0e622] text-[#2d3a0a]">+2.4%</div>

// Negative changes
<div className="bg-[#c0180c] text-white">-1.2%</div>
```

### 4. **Maintain Typography Hierarchy**
```tsx
// Category labels
className="font-['RL_Limo:Regular',sans-serif] text-[10px] uppercase"

// Headlines
className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555]"

// Body text
className="font-['DM_Sans:Regular',sans-serif] text-[#555555]"
```

### 5. **Consistent Card Structure**
```tsx
<div className="bg-white rounded-[30px] p-[24px]">
  {/* Category label */}
  <p className="font-['RL_Limo:Regular',sans-serif] text-[#c0180c] text-[10px] uppercase">
    CATEGORY
  </p>
  
  {/* Heading */}
  <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] tracking-[-0.48px]">
    Your Title
  </p>
  
  {/* Content */}
  <div className="mt-[16px]">
    ...
  </div>
</div>
```

---

## 🐛 Troubleshooting

### Charts not displaying?
- Check that data array has at least 2 points
- Verify data format matches expected structure
- Ensure parent container has defined height

### Colors look different?
- Use exact hex values from design tokens
- Check opacity values (e.g., `opacity-60` for 60%)
- Verify rgba values for transparent colors

### Layout issues?
- Confirm proper nesting of fixed/absolute elements
- Check z-index values (header=10, navigation=20)
- Verify scrollable area has correct top/bottom offsets

### TypeScript errors?
- Import types: `import type { DonutSegment } from './components/ada'`
- Check all required props are provided
- Verify data structure matches interfaces

---

## 📚 More Resources

- **WEALTH_COMPONENTS.md** - Complete component documentation
- **WEALTH_EXAMPLES.md** - 10 detailed usage examples
- **ADA_COMPLETE_DESIGN_SYSTEM.md** - Full design system guide
- **DESIGN_SYSTEM.md** - Core design principles

---

## ✅ Checklist for New Features

When building on top of the Wealth Tab:

- [ ] Use existing components first
- [ ] Reference design tokens (colors, spacing, radius)
- [ ] Follow typography hierarchy
- [ ] Match existing card structure
- [ ] Format numbers consistently
- [ ] Use semantic color meanings
- [ ] Add TypeScript interfaces
- [ ] Test on mobile viewport (320-430px)
- [ ] Document new components
- [ ] Update examples

---

**Ready to build!** All wealth components are production-ready and fully documented. Start by exploring the existing Wealth Tab, then customize for your needs.
