# Ada Design System - Typography Guide

This guide documents the complete typography system for the Ada application, based on the Figma design specifications.

## Font Families

The Ada design system uses two primary font families:

1. **RL Limo** - Display font used exclusively for the "Ada" logo (35px)
2. **Crimson Pro** - Serif font for headlines, body text, and large numbers
3. **DM Sans** - Sans-serif font for UI elements, buttons, supporting text, and section labels

## Typography Specifications

### Section Labels / Category Tags
**Usage:** Card categories, section titles, labels  
**Font:** `font-['DM_Sans:SemiBold',sans-serif]`  
**Size:** `text-[10px]`  
**Line Height:** `leading-[18px]` (h-[12px])  
**Tracking:** `tracking-[0.8px]`  
**Transform:** `uppercase`  
**Color:** `text-[#992929]` (burgundy) or `text-[#555555]` (neutral)  
**Example:**
```tsx
<p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">
  PORTFOLIO OVERVIEW
</p>
```

### Filter Tags / Pill Buttons
**Usage:** Tab filters, pill-shaped navigation buttons  
**Font:** `font-['DM_Sans:Regular',sans-serif]`  
**Size:** `text-[12px]`  
**Line Height:** `leading-[normal]`  
**Color:** `text-[#441316]`  
**Border:** `border-[#441316] border-[0.5px]`  
**Opacity:** 50% when inactive  
**Example:**
```tsx
<button className="content-stretch flex h-[24px] items-center justify-center px-[8px] py-[10px] relative rounded-[50px] shrink-0 opacity-50">
  <div aria-hidden="true" className="absolute border-[#441316] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[50px]" />
  <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#441316] text-[12px] text-nowrap whitespace-pre">Weekly Highlights</p>
</button>
```

### Large Display Numbers
**Usage:** Portfolio values, large financial figures  
**Font:** `font-['Crimson_Pro:ExtraLight',sans-serif]`  
**Weight:** `font-extralight`  
**Size:** `text-[40px]`  
**Line Height:** `leading-[28px]`  
**Tracking:** `tracking-[-1.2px]`  
**Color:** `text-[#555555]`  
**Example:**
```tsx
<p className="font-['Crimson_Pro:ExtraLight',sans-serif] font-extralight leading-[28px] relative shrink-0 text-[#555555] text-[40px] tracking-[-1.2px]">
  $131,230.19
</p>
```

### Headlines / Card Titles
**Usage:** Card titles, main headlines  
**Font:** `font-['Crimson_Pro:Regular',sans-serif]`  
**Weight:** `font-normal`  
**Size:** `text-[24px]`  
**Line Height:** `leading-[normal]`  
**Tracking:** `tracking-[-0.48px]`  
**Color:** `text-[#555555]`  
**Example:**
```tsx
<p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">
  Aisha, your portfolio is on track today.
</p>
```

### Summary Description
**Usage:** Introduction text, personalized messages  
**Font:** `font-['Crimson_Pro:Regular',sans-serif]`  
**Weight:** `font-normal`  
**Size:** `text-[18px]`  
**Line Height:** `leading-[normal]` (with leading-[0] on container)  
**Tracking:** `tracking-[-0.36px]`  
**Color:** `text-[#555555]`  
**Align:** `text-center`  
**Example:**
```tsx
<div className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#555555] text-[18px] text-center tracking-[-0.36px] w-full">
  <p className="leading-[normal] mb-0">Ada's personalised insights for you today. You have 4 items to review.</p>
</div>
```

### Body Text / Descriptions
**Usage:** Card descriptions, supporting information  
**Font:** `font-['DM_Sans:Light',sans-serif]`  
**Weight:** `font-light`  
**Size:** `text-[14px]`  
**Line Height:** `leading-[normal]`  
**Color:** `text-[#555555]`  
**Variation Settings:** `fontVariationSettings: "'opsz' 14"`  
**Example:**
```tsx
<p 
  className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[14px] w-full" 
  style={{ fontVariationSettings: "'opsz' 14" }}
>
  Lower-rate expectations expand growth multiples.
</p>
```

### Stats / Metrics Text
**Usage:** Portfolio stats, performance metrics  
**Font:** `font-['DM_Sans:Regular',sans-serif]`  
**Size:** `text-[12px]`  
**Line Height:** `leading-[normal]`  
**Color:** `text-[#555555]`  
**Example:**
```tsx
<p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">
  Yesterday: +0.8%
</p>
```

### Button Text
**Usage:** Primary and secondary buttons  
**Font:** `font-['DM_Sans:Regular',sans-serif]`  
**Size:** `text-[12px]`  
**Line Height:** `leading-[normal]`  
**Color:** `text-[#555555]`  
**Example:**
```tsx
<p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">
  Dive deeper
</p>
```

### Small Text / Timestamps
**Usage:** Timestamps, fine print, metadata  
**Font:** `font-['DM_Sans:Regular',sans-serif]`  
**Size:** `text-[9px]`  
**Line Height:** `leading-[18px]` or `leading-[28px]` or `leading-[normal]`  
**Color:** `text-[#555555]`  
**Example:**
```tsx
<p className="font-['DM_Sans:Regular',sans-serif] h-[17px] leading-[28px] relative shrink-0 text-[#555555] text-[9px] text-right">
  10th Dec 2025
</p>
```

### Detail Text / Fine Print
**Usage:** Bulleted lists, detailed explanations  
**Font:** `font-['DM_Sans:Light',sans-serif]`  
**Weight:** `font-light`  
**Size:** `text-[10px]`  
**Line Height:** `leading-[0]` or `leading-[normal]`  
**Color:** `text-[#555555]`  
**Variation Settings:** `fontVariationSettings: "'opsz' 14"`  
**Example:**
```tsx
<div className="font-['DM_Sans:Light',sans-serif] font-light leading-[0] relative shrink-0 text-[#555555] text-[10px]" style={{ fontVariationSettings: "'opsz' 14" }}>
  <p className="leading-[normal]">Tech allocation: 48% (AAPL/MSFT/AMZN)</p>
</div>
```

### Bold Labels within Lists
**Usage:** Bold headings within body text  
**Font:** `font-['DM_Sans:SemiBold',sans-serif]`  
**Size:** `text-[10px]`  
**Line Height:** `leading-[normal]`  
**Color:** `text-[#555555]`  
**Example:**
```tsx
<p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] mb-0 not-italic">
  Why you're seeing this:
</p>
```

## Color Palette

### Text Colors
- **Primary Text:** `#555555` - Main text color
- **Accent/Brand:** `#c0180c` - Section labels, highlights, accents
- **Success/Positive:** `#03561a` - Positive changes (on `#c6ff6a` background)
- **Primary Dark:** `#441316` - Borders, subtle accents

### Background Colors
- **Card Background:** `#ffffff` - White cards
- **App Background:** `#efede6` - Beige/cream background
- **Secondary Background:** `#f7f6f2` - Light gray for buttons
- **Positive Badge:** `#c6ff6a` - Bright green for positive changes

## Font Variation Settings

For DM Sans at certain sizes, use optical sizing:
```tsx
style={{ fontVariationSettings: "'opsz' 14" }}
```

## Implementation Notes

1. **Always specify font-family inline** using the Tailwind syntax: `font-['FontName:Weight',sans-serif]`
2. **Use exact pixel values** for font sizes to match Figma specifications
3. **Include letter-spacing (tracking)** where specified for proper visual hierarchy
4. **Use `not-italic`** to override any default italic styling
5. **Combine with `text-nowrap whitespace-pre`** for single-line text that should not wrap
6. **Use `leading-[0]` on containers with `leading-[normal]` on paragraphs** for precise spacing control

## Examples by Component

### SummaryCard Date Header
```tsx
<div className="content-stretch flex items-end justify-between not-italic relative shrink-0 w-full">
  <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] h-[7px] justify-center leading-[0] relative shrink-0 text-[#555555] text-[9px] w-[75px]">
    <p className="leading-[18px]">Updated 6:00 AM</p>
  </div>
  <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] text-center tracking-[0.2px] uppercase">TODAY'S SUMMARY</p>
  <p className="font-['DM_Sans:Regular',sans-serif] h-[17px] leading-[28px] relative shrink-0 text-[#555555] text-[9px] text-right">10th Dec 2025</p>
</div>
```

### ContentCard Structure
```tsx
{/* Category */}
<p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">
  MARKET EVENT
</p>

{/* Title */}
<p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">
  Fed rate-cut odds rise to 72%
</p>

{/* Description */}
<p 
  className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[14px] w-full" 
  style={{ fontVariationSettings: "'opsz' 14" }}
>
  Lower-rate expectations expand growth multiples.
</p>
```

### Badge with Icon and Text
```tsx
<div className="bg-[#c6ff6a] content-stretch flex gap-[6px] h-[24px] items-center justify-center px-[8px] py-[10px] relative rounded-[50px] shrink-0">
  <div className="relative shrink-0 size-[8px]">
    {/* Icon SVG */}
  </div>
  <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#03561a] text-[12px] text-nowrap whitespace-pre">
    $2,210.1 (+2.44%)
  </p>
</div>
```

## Responsive Considerations

All typography sizes are fixed and designed for a 430px mobile viewport. The design does not currently include responsive breakpoints, as it's optimized for mobile-first viewing.

## Lounge-Specific Typography

The Lounge section features additional typography patterns for data visualization and peer insights:

### Chart Labels
**Usage:** Labels within treemap charts, data visualization  
**Font:** `font-['DM_Sans:Regular',sans-serif]`  
**Size:** `text-[12px]`  
**Line Height:** `leading-[normal]`  
**Color:** `text-[#555555]`  
**Example:**
```tsx
<p className="absolute font-['DM_Sans:Regular',sans-serif] h-[12px] leading-[normal] not-italic text-[#555555] text-[12px]">
  New Investment Ventures
</p>
```

### Chart Percentages (Spalla Font)
**Usage:** Large percentage values in data visualizations  
**Font:** `font-['Spalla:Regular',sans-serif]`  
**Size:** `text-[40px]`, `text-[20px]`, or `text-[16px]` depending on hierarchy  
**Line Height:** `leading-[28px]`  
**Color:** `text-[#555555]`  
**Example:**
```tsx
<p className="absolute font-['Spalla:Regular',sans-serif] leading-[28px] not-italic text-[#555555] text-[40px] text-nowrap whitespace-pre">
  74%
</p>
```

### Subsection Labels with Icons
**Usage:** Small category labels with accompanying icons  
**Font:** `font-['RL_Limo:Regular',sans-serif]`  
**Size:** `text-[10px]`  
**Line Height:** `leading-[18px]` (h-[14px])  
**Tracking:** `tracking-[0.2px]`  
**Transform:** `uppercase`  
**Color:** `text-[#c0180c]`  
**Example:**
```tsx
<div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
  <div className="h-[12px] relative shrink-0 w-[13.332px]">
    {/* Icon SVG */}
  </div>
  <p className="font-['RL_Limo:Regular',sans-serif] h-[14px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase">
    Investors like you
  </p>
</div>
```

### Insight Card Body Text (with Tracking)
**Usage:** Descriptive body text in insight cards with refined tracking  
**Font:** `font-['DM_Sans:Regular',sans-serif]`  
**Size:** `text-[14px]`  
**Line Height:** `leading-[normal]`  
**Tracking:** `tracking-[-0.28px]`  
**Align:** `text-center`  
**Color:** `text-[#555555]`  
**Example:**
```tsx
<p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px] text-center tracking-[-0.28px] w-[273px]">
  Your peers lean slightly more conservative while you lean more ambitious.
</p>
```

### Subsection Descriptions
**Usage:** Subtitles and descriptions below card titles  
**Font:** `font-['DM_Sans:Light',sans-serif]`  
**Weight:** `font-light`  
**Size:** `text-[12px]`  
**Line Height:** `leading-[normal]`  
**Color:** `text-[#555555]`  
**Variation Settings:** `fontVariationSettings: "'opsz' 14"`  
**Example:**
```tsx
<p className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[12px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
  2751 members benchmarked
</p>
```

### Composite Labels (Category with Divider)
**Usage:** Multi-part labels like "INSIGHT | PEER SNAPSHOT"  
**Font:** `font-['RL_Limo:Regular',sans-serif]`  
**Size:** `text-[10px]`  
**Line Height:** `leading-[18px]` (h-[12px])  
**Tracking:** `tracking-[0.2px]`  
**Transform:** `uppercase`  
**Align:** `text-center`  
**Color:** `text-[#c0180c]`  
**Example:**
```tsx
<p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] text-center tracking-[0.2px] uppercase">
  INSIGHT | PEER SNAPSHOT
</p>
```

---

**Last Updated:** December 2025  
**Design Source:** Figma - Ada Home Screen (HomeTodaysSummary-14-2521) & Lounge Screen (Lounge.tsx)