# ADA Persona RAG Rules — What Belongs in the Persona File vs DB

## Keep in Persona RAG
Use persona RAG for information that is:
- relatively stable over time
- useful for personalization
- narrative or qualitative in nature
- hard to infer from transactional data alone

### Examples
- household context
- communication style
- preferences and dislikes
- risk attitude in plain language
- behavioural tendencies
- broad goals
- relationship expectations from the bank/advisor
- digital habits
- recurring pain points

## Keep in DB / Structured Systems
Use DB or live integrations for information that is:
- numerical
- changing frequently
- operationally important
- auditable
- needed for calculations, charts, suitability, or alerts

### Examples
- holdings and valuations
- liabilities and rates
- cashflow and income values
- account balances
- target vs actual allocation
- product eligibility
- suitability reviews and compliance fields
- advisor and CRM servicing data
- upcoming maturities and payments
- transaction history

## Good Persona Statement
"Omar tends to accumulate technology exposure across multiple platforms and benefits from rebalancing prompts."

## Bad Persona Statement
"Omar holds 12.8% in NVDA and 12.2% in AAPL and is 4.4 percentage points above target in equities."

## Good Goal Statement
"Omar is focused on building an education fund for his daughter and is also considering a larger family home in the medium term."

## Bad Goal Statement
"Omar needs USD 80,000 by September 2041 and USD 60,000 by December 2027."

## Design Principle
Write the persona file so it still makes sense if read six months later without creating conflicts.
