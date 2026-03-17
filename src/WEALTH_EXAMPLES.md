# Wealth Components - Usage Examples

## Example 1: Simple Portfolio Overview

Create a basic portfolio overview with sparkline:

```tsx
import { WealthOverviewCard } from './components/ada';

function PortfolioSummary() {
  return (
    <WealthOverviewCard
      totalValue={150000}
      dailyChange={2500}
      dailyChangePercent={1.7}
      sparklineData={[145000, 147000, 148500, 150000]}
    />
  );
}
```

---

## Example 2: Performance Chart with Multiple Timeframes

Build an interactive performance chart:

```tsx
import { PerformanceChartCard } from './components/ada';

function PortfolioPerformance() {
  const data = {
    '1D': [
      { value: 149200, label: '9am' },
      { value: 149800, label: '12pm' },
      { value: 150200, label: '3pm' },
      { value: 150000, label: 'Now' }
    ],
    '1W': [
      { value: 145000, label: 'Mon' },
      { value: 146500, label: 'Tue' },
      { value: 148000, label: 'Wed' },
      { value: 149000, label: 'Thu' },
      { value: 150000, label: 'Fri' }
    ],
    '1M': [
      { value: 140000, label: 'W1' },
      { value: 143000, label: 'W2' },
      { value: 147000, label: 'W3' },
      { value: 150000, label: 'W4' }
    ],
    '3M': [
      { value: 130000, label: 'Oct' },
      { value: 140000, label: 'Nov' },
      { value: 150000, label: 'Dec' }
    ],
    '1Y': [
      { value: 100000, label: 'Jan' },
      { value: 110000, label: 'Apr' },
      { value: 125000, label: 'Aug' },
      { value: 150000, label: 'Dec' }
    ]
  };

  return (
    <PerformanceChartCard 
      data={data}
      defaultTimeFrame="1M"
    />
  );
}
```

---

## Example 3: Asset Allocation Visualization

Display portfolio allocation with donut chart:

```tsx
import { AssetAllocationCard } from './components/ada';

function AssetBreakdown() {
  const allocations = [
    { 
      label: 'Stocks', 
      value: 75000, 
      amount: 75000, 
      color: '#441316' 
    },
    { 
      label: 'Bonds', 
      value: 37500, 
      amount: 37500, 
      color: '#a0e622' 
    },
    { 
      label: 'Crypto', 
      value: 22500, 
      amount: 22500, 
      color: '#c0180c' 
    },
    { 
      label: 'Cash', 
      value: 15000, 
      amount: 15000, 
      color: '#f59e0b' 
    }
  ];

  return (
    <AssetAllocationCard 
      allocations={allocations}
      totalValue={150000}
    />
  );
}
```

---

## Example 4: Portfolio Health Dashboard

Show diversification and risk metrics:

```tsx
import { PortfolioHealthCard } from './components/ada';

function HealthMetrics() {
  return (
    <PortfolioHealthCard
      diversificationScore={85}
      riskLevel="moderate"
      suggestions={[
        'Consider rebalancing your crypto holdings',
        'Your diversification is excellent',
        'Risk profile matches your goals'
      ]}
    />
  );
}
```

---

## Example 5: Connected Financial Accounts

Display integrated accounts:

```tsx
import { ConnectedAccountRow } from './components/ada';

function AccountsList() {
  return (
    <div className="bg-white rounded-[30px] p-[24px]">
      <ConnectedAccountRow
        name="Chase Checking"
        logo={<BankIcon />}
        balance={25000}
        lastUpdated="Just now"
        status="synced"
      />
      <ConnectedAccountRow
        name="Fidelity Brokerage"
        logo={<BrokerageIcon />}
        balance={125000}
        lastUpdated="2 min ago"
        status="synced"
      />
      <ConnectedAccountRow
        name="Coinbase"
        logo={<CryptoIcon />}
        balance={15000}
        lastUpdated="Syncing..."
        status="syncing"
      />
    </div>
  );
}
```

---

## Example 6: Top Holdings List

Show portfolio holdings with performance:

```tsx
import { HoldingRow } from './components/ada';

function TopHoldings() {
  const holdings = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      value: 25000,
      changePercent: 3.2,
      sparklineData: [24000, 24500, 24800, 25000]
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      value: 18000,
      changePercent: -1.5,
      sparklineData: [18500, 18300, 18100, 18000]
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      value: 22000,
      changePercent: 2.1,
      sparklineData: [21500, 21700, 21900, 22000]
    }
  ];

  return (
    <div className="bg-white rounded-[30px] p-[24px]">
      <h3 className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] mb-[16px]">
        Top Holdings
      </h3>
      {holdings.map((holding, i) => (
        <HoldingRow key={i} {...holding} />
      ))}
    </div>
  );
}
```

---

## Example 7: Financial Goals with Progress

Track financial goals:

```tsx
import { GoalCard } from './components/ada';
import { Home, GraduationCap, Plane } from 'lucide-react';

function FinancialGoals() {
  return (
    <div className="flex flex-col gap-[5px]">
      <GoalCard
        title="Down Payment"
        targetAmount={100000}
        currentAmount={65000}
        deadline="Jun 2026"
        icon={<Home className="size-[18px]" />}
        color="#a0e622"
      />
      
      <GoalCard
        title="Education Fund"
        targetAmount={50000}
        currentAmount={20000}
        deadline="Sep 2028"
        icon={<GraduationCap className="size-[18px]" />}
        color="#f59e0b"
      />
      
      <GoalCard
        title="World Trip"
        targetAmount={30000}
        currentAmount={12000}
        deadline="Dec 2025"
        icon={<Plane className="size-[18px]" />}
        color="#c0180c"
      />
    </div>
  );
}
```

---

## Example 8: Custom Chart Integration

Use chart components independently:

```tsx
import { Sparkline, LineChart, DonutChart, ProgressRing } from './components/ada';

function CustomDashboard() {
  return (
    <div className="grid grid-cols-2 gap-[16px] p-[24px]">
      {/* Compact trend */}
      <div className="bg-white rounded-[12px] p-[16px]">
        <p className="text-[12px] mb-[8px]">30 Day Trend</p>
        <Sparkline 
          data={[100, 105, 103, 108, 112]} 
          width={100}
          height={40}
        />
      </div>

      {/* Progress indicator */}
      <div className="bg-white rounded-[12px] p-[16px] flex items-center justify-center">
        <ProgressRing 
          progress={75}
          size={60}
          color="#a0e622"
        />
      </div>

      {/* Full chart */}
      <div className="col-span-2 bg-white rounded-[12px] p-[16px]">
        <LineChart 
          data={[
            { value: 1000, label: 'Jan' },
            { value: 1200, label: 'Feb' },
            { value: 1500, label: 'Mar' }
          ]}
          height={200}
        />
      </div>

      {/* Donut chart */}
      <div className="col-span-2 bg-white rounded-[12px] p-[16px] flex justify-center">
        <DonutChart 
          segments={[
            { label: 'A', value: 40, color: '#441316' },
            { label: 'B', value: 30, color: '#c0180c' },
            { label: 'C', value: 30, color: '#a0e622' }
          ]}
          size={120}
          centerValue="100%"
        />
      </div>
    </div>
  );
}
```

---

## Example 9: Complete Wealth Dashboard

Build a full wealth management screen:

```tsx
import React from 'react';
import { TopBar, Header, BottomBar } from './components/ada';
import {
  WealthOverviewCard,
  ConnectedAccountRow,
  PerformanceChartCard,
  AssetAllocationCard,
  PortfolioHealthCard,
  HoldingRow,
  GoalCard
} from './components/ada';

function MyWealthDashboard() {
  return (
    <div className="bg-[#efede6] relative h-screen w-full overflow-hidden">
      {/* Fixed Header */}
      <div className="absolute bg-[#f7f6f2] left-0 top-0 pb-[16px] w-full z-10">
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
            weeklyChangePercent={3.2}
            monthlyChangePercent={8.5}
            sparklineData={[190000, 195000, 197000, 200000]}
          />

          {/* Accounts */}
          <div className="bg-white rounded-[30px] p-[24px]">
            <p className="font-['RL_Limo:Regular',sans-serif] text-[#c0180c] text-[10px] mb-[12px]">
              ACCOUNTS
            </p>
            <ConnectedAccountRow
              name="Checking"
              logo={<BankLogo />}
              balance={50000}
              lastUpdated="Just now"
            />
            <ConnectedAccountRow
              name="Investment"
              logo={<InvestmentLogo />}
              balance={150000}
              lastUpdated="5 min ago"
            />
          </div>

          {/* Performance Chart */}
          <PerformanceChartCard 
            data={performanceData}
            defaultTimeFrame="1M"
          />

          {/* Allocation & Health */}
          <AssetAllocationCard 
            allocations={allocationData}
            totalValue={200000}
          />
          
          <PortfolioHealthCard
            diversificationScore={90}
            riskLevel="low"
            suggestions={['Portfolio well balanced']}
          />

          {/* Holdings */}
          <div className="bg-white rounded-[30px] p-[24px]">
            <p className="font-['RL_Limo:Regular',sans-serif] text-[#c0180c] text-[10px] mb-[12px]">
              HOLDINGS
            </p>
            {holdingsData.map((h, i) => (
              <HoldingRow key={i} {...h} />
            ))}
          </div>

          {/* Goals */}
          <GoalCard
            title="Retirement"
            targetAmount={1000000}
            currentAmount={200000}
            deadline="2045"
            color="#a0e622"
          />
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

## Example 10: Responsive Chart Grid

Create a responsive dashboard layout:

```tsx
import { Sparkline, ProgressRing } from './components/ada';

function MetricsDashboard() {
  const metrics = [
    { label: 'Portfolio', value: 150000, trend: [145, 147, 149, 150] },
    { label: 'Savings', value: 50000, trend: [48, 48.5, 49, 50] },
    { label: 'Investments', value: 100000, trend: [95, 97, 99, 100] }
  ];

  return (
    <div className="bg-white rounded-[30px] p-[24px]">
      <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] mb-[16px]">
        Quick Stats
      </p>
      
      <div className="grid grid-cols-3 gap-[12px]">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-[#f7f6f2] rounded-[12px] p-[12px]">
            <p className="text-[10px] text-[#555555] opacity-60 mb-[4px]">
              {metric.label}
            </p>
            <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555] mb-[8px]">
              ${(metric.value / 1000).toFixed(0)}k
            </p>
            <Sparkline 
              data={metric.trend}
              width={60}
              height={20}
              color="#441316"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Design Principles

When building with wealth components:

✅ **Consistency** - Use existing design tokens  
✅ **Clarity** - Always show currency with proper formatting  
✅ **Context** - Include timestamps and change indicators  
✅ **Hierarchy** - Use established typography scale  
✅ **Feedback** - Show loading/syncing states  
✅ **Accessibility** - Maintain color contrast ratios  

## Color Usage Guide

### Data Visualization
- **Primary line**: `#441316` (brand dark)
- **Secondary line**: `#c0180c` (brand red)
- **Success**: `#a0e622` (bright green)
- **Warning**: `#f59e0b` (amber)
- **Neutral**: `#555555` (text gray)

### Status Indicators
- **Positive change**: Green pill `bg-[#a0e622]`
- **Negative change**: Red pill `bg-[#c0180c]`
- **Neutral**: Gray text with opacity

### Background Hierarchy
- **Cards**: `#ffffff` (white)
- **Nested elements**: `#f7f6f2` (cream)
- **Page background**: `#efede6` (light cream)
