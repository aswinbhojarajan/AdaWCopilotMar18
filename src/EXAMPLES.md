# Ada Design System - Usage Examples

## Example 1: Creating a New Screen

Here's how to create a custom screen using the Ada design system:

```tsx
import React, { useState } from 'react';
import { TopBar, Header, BottomBar, ContentCard, Tag } from './components/ada';

export function CustomScreen() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="bg-[#efede6] relative h-screen w-full overflow-hidden">
      {/* Fixed Header */}
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-[16px] pt-0 px-0 w-full z-10">
        <TopBar />
        <Header />
      </div>

      {/* Scrollable Content */}
      <div className="absolute top-[88px] left-0 right-0 bottom-[90px] overflow-y-auto">
        <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] py-[45px] w-full">
          {/* Your content cards */}
          <ContentCard
            category="CUSTOM"
            title="Your custom title"
            description="Your description here"
            buttonText="Learn more"
            onButtonClick={() => console.log('clicked')}
          />
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomBar onSubmit={(value) => console.log('User asked:', value)} />
      </div>
    </div>
  );
}
```

---

## Example 2: Building a Custom Card

Create a custom card following the Ada design patterns:

```tsx
import React from 'react';
import { Clock } from 'lucide-react';

interface MyCustomCardProps {
  title: string;
  value: string;
  change: string;
  timestamp?: string;
}

export function MyCustomCard({ title, value, change, timestamp }: MyCustomCardProps) {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          {/* Header */}
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            <p className="font-['rl-limo',sans-serif] text-[#c0180c] text-[10px] tracking-[0.2px] uppercase">
              {title}
            </p>
          </div>

          {/* Value Display */}
          <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
            <p className="font-['Crimson_Pro',sans-serif] text-[#555555]">
              {value}
            </p>
            <div className="bg-[#a0e622] content-stretch flex gap-[4px] h-[20px] items-center justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0">
              <p className="font-['DM_Sans',sans-serif] font-semibold text-[#2d3a0a] text-nowrap">
                {change}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          {timestamp && (
            <div className="content-stretch flex gap-[2px] items-center justify-end relative shrink-0 w-full">
              <Clock className="size-[12px] text-[#555555]" strokeWidth={1} />
              <p className="font-['DM_Sans',sans-serif] text-[#555555] text-nowrap">
                {timestamp}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Example 3: Interactive Filter System

Implement a filter system with state management:

```tsx
import React, { useState } from 'react';
import { Tag, ContentCard } from './components/ada';

const newsData = [
  { id: 1, category: 'tech', title: 'Tech news...', description: '...' },
  { id: 2, category: 'market', title: 'Market news...', description: '...' },
  { id: 3, category: 'tech', title: 'More tech...', description: '...' },
];

export function FilteredNewsFeed() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'tech' | 'market'>('all');

  const filteredNews = newsData.filter(item => 
    activeFilter === 'all' || item.category === activeFilter
  );

  return (
    <>
      {/* Filter Bar */}
      <div className="w-full">
        <div className="flex justify-center">
          <div className="flex gap-[8px] px-[24px] py-[16px]">
            <Tag 
              active={activeFilter === 'all'} 
              onClick={() => setActiveFilter('all')}
            >
              All
            </Tag>
            <Tag 
              active={activeFilter === 'tech'} 
              onClick={() => setActiveFilter('tech')}
            >
              Tech
            </Tag>
            <Tag 
              active={activeFilter === 'market'} 
              onClick={() => setActiveFilter('market')}
            >
              Market
            </Tag>
          </div>
        </div>
      </div>

      {/* Filtered Content */}
      <div className="flex flex-col gap-[5px] w-full">
        {filteredNews.map(item => (
          <ContentCard
            key={item.id}
            category={item.category.toUpperCase()}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </>
  );
}
```

---

## Example 4: Portfolio Summary Section

Build a portfolio summary using SummaryCard:

```tsx
import React from 'react';
import { SummaryCard } from './components/ada';

interface PortfolioData {
  value: string;
  change: string;
  changePercent: string;
  yesterday: string;
  week: string;
}

export function PortfolioSummary({ data }: { data: PortfolioData }) {
  return (
    <SummaryCard
      date="TODAY'S SUMMARY"
      title="Fri Dec 2025"
      subtitle="Your portfolio performance overview"
    >
      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
        {/* Value Display */}
        <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
          <p className="font-['Crimson_Pro',sans-serif] text-[#555555]">
            {data.value}
          </p>
          <div className="bg-[#a0e622] content-stretch flex gap-[4px] h-[20px] items-center justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0">
            <p className="font-['DM_Sans',sans-serif] font-semibold text-[#2d3a0a] text-nowrap">
              {data.change} ({data.changePercent})
            </p>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
          <p className="font-['DM_Sans',sans-serif] opacity-50 text-[#555555] text-nowrap">
            Yesterday: {data.yesterday}
          </p>
          <p className="font-['DM_Sans',sans-serif] opacity-50 text-[#555555] text-nowrap">
            Last 7 days: {data.week}
          </p>
        </div>
      </div>
    </SummaryCard>
  );
}

// Usage
<PortfolioSummary 
  data={{
    value: '$131,230.19',
    change: '+$1090',
    changePercent: '+2.4%',
    yesterday: '$4.3m',
    week: '+2.1%'
  }}
/>
```

---

## Example 5: Navigation Between Screens

Implement multi-screen navigation:

```tsx
import React, { useState } from 'react';
import { Navigation } from './components/ada';
import { HomeScreen } from './components/screens/HomeScreen';
import { DiscoverScreen } from './components/screens/DiscoverScreen';
import { LoungeScreen } from './components/screens/LoungeScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'wealth' | 'discover' | 'lounge' | 'profile'>('home');

  const renderScreen = () => {
    switch(activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'discover':
        return <DiscoverScreen />;
      case 'lounge':
        return <LoungeScreen />;
      case 'wealth':
        return <WealthScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#efede6] overflow-hidden">
      {/* Navigation */}
      <div className="absolute top-[88px] left-0 right-0 z-20">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Screen Content */}
      <div className="relative w-full h-full">
        {renderScreen()}
      </div>
    </div>
  );
}
```

---

## Example 6: Custom Visualization in InsightCard

Create custom data visualization inside an InsightCard:

```tsx
import React from 'react';
import { InsightCard } from './components/ada';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Stocks', value: 60, color: '#c0180c' },
  { name: 'Bonds', value: 30, color: '#a0e622' },
  { name: 'Cash', value: 10, color: '#f7f6f2' },
];

export function AssetAllocationCard() {
  return (
    <InsightCard
      type="INSIGHT"
      title="Your asset allocation"
      description="Compared to similar investors"
      buttonText="Rebalance portfolio"
    >
      <div className="w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex flex-col gap-[8px] w-full">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-[8px]">
            <div 
              className="w-[12px] h-[12px] rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <p className="font-['DM_Sans',sans-serif] text-[#555555]">
              {item.name}: {item.value}%
            </p>
          </div>
        ))}
      </div>
    </InsightCard>
  );
}
```

---

## Example 7: Custom Button Variants

Extend the Button component with custom styling:

```tsx
import React from 'react';
import { Button } from './components/ada';

export function ActionButtons() {
  return (
    <div className="flex flex-col gap-[12px] w-full">
      {/* Primary Action */}
      <Button 
        variant="primary" 
        size="lg"
        onClick={() => console.log('Primary action')}
      >
        Invest Now
      </Button>

      {/* Secondary Action */}
      <Button 
        variant="secondary" 
        size="md"
        onClick={() => console.log('Secondary action')}
      >
        Learn More
      </Button>

      {/* Small Action */}
      <Button 
        variant="secondary" 
        size="sm"
        onClick={() => console.log('Small action')}
      >
        Details
      </Button>

      {/* Custom Styled */}
      <Button 
        variant="secondary"
        className="!bg-[#c0180c] !text-white"
        onClick={() => console.log('Custom styled')}
      >
        Alert Action
      </Button>
    </div>
  );
}
```

---

## Example 8: Loading States

Implement loading states for cards:

```tsx
import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full animate-pulse">
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
        {/* Category skeleton */}
        <div className="h-[12px] bg-[#f7f6f2] rounded w-[71px]" />
        
        {/* Title skeleton */}
        <div className="h-[24px] bg-[#f7f6f2] rounded w-full" />
        <div className="h-[24px] bg-[#f7f6f2] rounded w-3/4" />
        
        {/* Description skeleton */}
        <div className="h-[14px] bg-[#f7f6f2] rounded w-full" />
        <div className="h-[14px] bg-[#f7f6f2] rounded w-5/6" />
        
        {/* Image skeleton */}
        <div className="h-[184px] bg-[#f7f6f2] rounded w-full" />
        
        {/* Button skeleton */}
        <div className="h-[44px] bg-[#f7f6f2] rounded-[50px] w-[120px]" />
      </div>
    </div>
  );
}

// Usage
export function NewsScreen() {
  const [loading, setLoading] = React.useState(true);
  const [news, setNews] = React.useState([]);

  React.useEffect(() => {
    // Fetch news...
    setTimeout(() => {
      setLoading(false);
      setNews([/* ... */]);
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col gap-[5px]">
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        news.map(item => <ContentCard key={item.id} {...item} />)
      )}
    </div>
  );
}
```

---

## Tips for Building New Features

1. **Follow the spacing system**: Use 5px, 6px, 8px, 12px, 16px, 24px gaps
2. **Use the color tokens**: Reference the design tokens file
3. **Maintain card structure**: Keep the white rounded-[30px] pattern
4. **Typography hierarchy**: RL Limo for tags, Crimson Pro for titles, DM Sans for body
5. **Consistent padding**: Cards use px-[24px], py-[16px] or py-[24px]
6. **Button style**: Always use rounded-[50px] for buttons
7. **Category labels**: Always uppercase, red (#c0180c), 10px
8. **Timestamps**: Use Clock icon + text, right-aligned
