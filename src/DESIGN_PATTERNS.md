# Ada Design System – UX Patterns

## Inline Chat Context Pattern

### Overview
When users tap CTA buttons (buttons with spark icons) that lead to Ada's chatbot, the chat interface displays subtle provenance context at the start of the first user message. This helps users understand what card or condition triggered the conversation without cluttering Ada's minimal aesthetic.

### Format
**"[Specific condition] · [User question]"**

The context label appears inline at the beginning of the first user message only, styled to be editorial and quiet rather than UI-heavy.

### Visual Styling
- **Color:** `#992929` (burgundy red, matching topic labels)
- **Font size:** `12px` (smaller than main message text)
- **Font weight:** Light (`DM_Sans:Light`)
- **Letter spacing:** `-0.24px`
- **Separator:** ` · ` (middle dot with spaces)

The label should:
- Feel like provenance, not a system message
- Be editorial and quiet
- Have no pill, border, icon, or background
- Not look like part of the conversational content
- Clearly signal what the question refers to

### Example
When a user taps "What changed in the markets?" on a "Portfolio Risk Alert" card about tech allocation:

**Chat message displays as:**
```
Tech allocation above target · What changed in the markets?
```

### Implementation

#### 1. ContentCard Component
Content cards that lead to chat should include:
- **`contextTitle`**: Concise provenance label (e.g., "Tech allocation above target")
- **`onChatSubmit`**: Handler that passes context to chat

```tsx
<ContentCard
  category="PORTFOLIO RISK ALERT"
  categoryType="PORTFOLIO RISK ALERT"
  title={<>Your tech allocation has moved<br />above target</>}
  description="Current exposure is 48%, above your 35–45% target range."
  buttonText="What changed in the markets?"
  contextTitle="Tech allocation above target"
  onChatSubmit={onChatSubmit}
/>
```

The ContentCard automatically wraps button handlers to pass context when clicked.

#### 2. Context Titles Guidelines
Context titles should be:
- **Concise:** 3-7 words maximum
- **Specific:** Describe the portfolio condition or topic
- **Lowercase except proper nouns:** "Tech allocation above target" not "Tech Allocation Above Target"
- **No punctuation at end:** No period, comma, or other terminal punctuation

**Good examples:**
- "Tech allocation above target"
- "GCC bonds renewed demand"
- "Fed signals rate cut pause"
- "Low alternatives allocation"
- "Year-end market surge"

**Avoid:**
- Generic labels: ~~"Portfolio Risk Alert"~~
- Too verbose: ~~"Your tech allocation has moved significantly above your target range"~~
- Questions: ~~"Why did tech allocation move?"~~

#### 3. ChatMessage Component
The ChatMessage component automatically renders context when provided:

```tsx
<ChatMessage
  message={msg.message}
  sender="user"
  contextPrefix="Tech allocation above target" // Only for first user message
/>
```

### When to Use
Apply this pattern to **all CTA buttons** (buttons with spark icons) that:
1. Lead directly to Ada chat
2. Are contextual to a specific card, alert, or condition
3. Would benefit from provenance to maintain conversation clarity

### When NOT to Use
Do not apply to:
- General chat prompts from bottom bar
- Follow-up prompts within existing conversations (context already established)
- Non-AI buttons (e.g., "Contact advisor")

### Technical Implementation

#### Screen Interfaces
All screen components should accept the full context parameter:

```tsx
interface ScreenProps {
  onChatSubmit?: (
    message: string, 
    context?: { 
      category: string; 
      categoryType: string; 
      title: string; // This becomes the contextPrefix
      sourceScreen?: string 
    }
  ) => void;
}
```

#### Content Data Structure
When defining content cards in screens, include `contextTitle`:

```tsx
{
  category: "MARKET NEWS",
  categoryType: "MARKET NEWS",
  title: "Federal Reserve signals pause on rate cuts",
  contextTitle: "Fed signals rate cut pause", // ← Concise version
  buttonText: "Impact on my bond holdings?",
  // ... other props
}
```

#### Auto-wiring in ContentCard
ContentCard automatically creates wrapped handlers that pass context:

```tsx
const handleButtonClick = () => {
  if (onChatSubmit && buttonText && contextTitle) {
    onChatSubmit(buttonText, {
      category,
      categoryType: determinedCategoryType,
      title: contextTitle, // Becomes contextPrefix in chat
      sourceScreen: 'Discover'
    });
  }
};
```

### Design Rationale
1. **Provenance over decoration:** Burgundy red (#992929) creates visual continuity with topic labels, reinforcing the connection back to the original card
2. **Smaller size (12px):** Distinguishes context from the actual question while remaining legible
3. **Inline placement:** Keeps context close to the question without adding vertical space
4. **One-time display:** Only appears on the first user message to avoid repetition
5. **Middle dot separator:** Editorial convention that feels natural and lightweight

### Related Components
- `/components/ada/ChatMessage.tsx` – Renders inline context
- `/components/ada/ContentCard.tsx` – Provides context to chat
- `/components/screens/ChatScreen.tsx` – Manages context flow
- `/components/screens/HomeScreen.tsx` – Example implementation
- `/components/screens/DiscoverScreen.tsx` – Example implementation  
- `/components/screens/LoungeScreen.tsx` – Example implementation
