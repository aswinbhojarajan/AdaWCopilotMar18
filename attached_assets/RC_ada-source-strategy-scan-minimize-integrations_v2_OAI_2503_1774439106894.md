
# Ada Source Strategy Scan (Based on `Ada Expected Questions 24th March Luke.xlsx`)

## Executive summary

I scanned the 79 representative questions in the workbook and grouped them by the **actual source domains** they depend on.

### Main finding
The largest dependency is **not external market data**. It is **your own internal data layer**:
- portfolio / custody / positions
- transaction ledger
- fees
- product catalogue
- CRM / RM context
- goals / alerts / settings
- policy / consent / IAM
- report templates

After that, the biggest external need is a **single broad market/reference data layer**, followed by a smaller set of enrichment layers:
1. market/reference/pricing/history
2. FX
3. macro
4. corporate actions / income events
5. analyst / fundamentals / estimates
6. look-through / classification / ESG / peer benchmarks
7. premium news / licensed content
8. open banking aggregation (only if really needed)

### What this means
If the priority is **minimize integrations**, the best architecture is:

- **Internal core data layer** as source of truth
- **One primary market data vendor**
- **A few public/reference utilities** (FX, macro, filings, identifier mapping)
- **Optional specialist add-ons only when justified**

---

## What the workbook implies

### Approximate source pattern from the 79 questions
- **Internal systems only / mostly internal**: ~17 questions
- **Needs market/reference/pricing/history**: ~25 questions
- **Needs macro context**: ~8 questions
- **Needs FX conversion / currency context**: ~6 questions
- **Needs corporate actions / dividend calendar / income events**: ~5 questions
- **Needs analyst consensus / richer fundamentals**: a small but important set
- **Needs look-through / sector-theme-geography classification / ESG / peer cohorts**: a concentrated but strategic set
- **Needs tax/rules/product catalogue/CRM**: mostly internal knowledge + policy systems, not external market vendors

### Practical implication
A large share of the question list can be handled by:
- your internal data
- one broad market vendor
- one macro source
- one FX source
- one filings / identifier layer

---

## Recommended source architecture

## Layer 1 — Internal sources (must-have)
Treat these as mandatory before shopping for more external vendors:
- portfolio snapshots
- holdings / accounts / transactions
- cost basis / realised & unrealised P&L
- fee ledger and fee schedules
- goals and contribution schedules
- CRM / RM assignment / notes / availability
- product catalogue (FDs, structured products, lending, IPO access, etc.)
- suitability / risk profile / jurisdiction / tax-residency flags
- consent / IAM / data freshness / sync logs
- alerts / exports / report templates

**Recommendation:** Build these as one internal “wealth data platform” abstraction, even if the data comes from multiple systems.

---

## Layer 2 — Free / public sources (minimum viable external stack)

## Recommended minimal free stack
1. **Finnhub** — primary free market/reference layer
2. **FRED** — macro layer
3. **SEC EDGAR public APIs** — filings / XBRL / submissions
4. **OpenFIGI** — identifier mapping
5. **Frankfurter** — general FX reference layer
6. **CBUAE exchange rates** — UAE-facing FX display / AED normalization
7. **Yahoo Finance (optional fallback only)** — development/fallback adapter, not a production-grade source of truth

### Why this is the best minimal free set
This gives Ada:
- quotes and price history
- benchmark/index context
- company news (basic)
- earnings calendar / some corporate-event coverage
- filings and structured financial statements
- macro data
- FX conversion
- identifier normalization
- optional development fallback via Yahoo-style wrappers

### What this free stack will still miss or only partially cover
- deep fund look-through across funds/ETFs/mutual funds
- robust ESG / controversy data
- high-quality peer cohort benchmarking
- production-grade analyst consensus
- premium licensed news / broad RAG-safe content
- institutional-grade primary market data
- open banking aggregation

---

## Layer 3 — Paid sources

There are **two sensible paid paths** depending on whether you prioritize:
- **lowest cost**, or
- **fewest integrations / broadest coverage**

# Option A — Budget-efficient paid path (2–3 external vendors)
Use:
1. **Finnhub paid**
2. **FMP Premium / Ultimate**
3. **Marketaux or Benzinga** (only if Discover/news becomes important)

This is the best path if you want:
- low cost
- fast integration
- decent breadth
- still limited procurement friction

### What each one does
- **Finnhub paid**: keep using the same API surface, just with stronger limits / broader capabilities
- **FMP**: fills gaps in fundamentals, ratios, history, transcripts/holdings (depending on tier)
- **Marketaux/Benzinga**: better news/event layer than generic free feeds

### Best for
- fast MVP / pilot
- lightweight production prototype
- teams that want to stay under a few hundred dollars per month before enterprise procurement

# Option B — Minimize integrations above all else (enterprise path)
Use:
1. **FactSet** as the primary external data/analytics backbone
2. **Factiva** only if premium licensed news / GenAI-safe retrieval becomes core
3. **Open banking aggregator** only if external account aggregation is genuinely in scope

### Why FactSet is the best “one primary vendor” answer
FactSet’s public developer surface is unusually aligned to Ada’s question set:
- Portfolio API
- PA Engine API (performance attribution and risk)
- Estimates API
- ESG API
- Benchmarks API
- Virtual Portfolio API
- Risk / analytics APIs
- entity/reference datasets

This makes it the strongest candidate when the priority is:
- broad coverage
- fewer vendor integrations
- portfolio-centric digital wealth use cases
- less custom stitching than budget APIs

### Why add Factiva only later
Factiva is very attractive for:
- licensed premium news
- article retrieval
- GenAI-safe content / RAG
- monitoring / research / discover experiences

But it solves a narrower problem than FactSet:
- it is a **content/news intelligence layer**
- not a full market + portfolio + analytics backbone

### Enterprise alternatives
- **S&P Capital IQ Pro**: very strong if private markets, estimates, fixed income and broad research matter a lot
- **Bloomberg**: excellent if the institution already has Bloomberg enterprise workflows and budget
- **Morningstar / Sustainalytics**: best specialist add-on if fund analytics / ESG / ratings become central

---

## Final recommendations by source type

## A. Primary market / reference layer
### Free-first
- **Finnhub**
### Paid budget
- **Finnhub paid** or **Twelve Data**
### Paid enterprise / minimize integrations
- **FactSet**
### Enterprise alternative
- **S&P Capital IQ Pro**
### Use only if institution already has it / wants terminal-grade enterprise depth
- **Bloomberg**

## B. Macro layer
### Free
- **FRED**
### Optional additional regional data
- ECB / CBUAE / SAMA where relevant
### Usually no need for paid macro source in early Ada

## C. Filings / authoritative company disclosures
### Free
- **SEC EDGAR**
### Enterprise add-on only if you want this packaged inside a larger vendor
- FactSet / Capital IQ / Bloomberg

## D. Identifier mapping
### Free
- **OpenFIGI**
### Keep this regardless of whether you buy an enterprise vendor

## E. FX conversion
### Free
- **Frankfurter**
- **CBUAE** for AED display/reference
### Paid only if you later need trading-grade or intra-day institutional FX feeds

## F. News / discover / article retrieval
### Free-first
- **Finnhub news**
### Low-cost paid
- **Marketaux**
- **Benzinga**
### Enterprise licensed news / GenAI-safe retrieval
- **Factiva**

## G. Fundamentals / estimates / analyst consensus
### Low-cost paid
- **FMP**
### Enterprise minimize-integrations answer
- **FactSet**
### Enterprise research-heavy alternative
- **S&P Capital IQ Pro**

## H. Look-through / classification / ESG / peer benchmarking
### Best enterprise answer
- **FactSet**
### Best specialist add-on
- **Morningstar + Sustainalytics**
### Strong enterprise alternative
- **S&P Capital IQ Pro**
### Free stack is weak here

## I. Open banking / external account aggregation
Only add if question 67-style flows become real scope.
### Pick one only:
- **Plaid** — if US / Canada is important
- **Tink** — if Europe is the focus
- **Salt Edge** — if you want broader international bank coverage

---

## Recommended minimal stacks

## Stack 1 — Best free/demo stack
- Internal core data layer
- Finnhub
- FRED
- SEC EDGAR
- OpenFIGI
- Frankfurter
- CBUAE
- Yahoo Finance adapter (optional fallback only)

**Use this when:** you want the leanest credible demo stack.

## Stack 2 — Best low-cost paid stack
- Internal core data layer
- Finnhub paid
- FMP Premium
- Marketaux Standard (or Benzinga later)

**Use this when:** you want better breadth without enterprise procurement.

## Stack 3 — Best “fewest integrations” enterprise stack
- Internal core data layer
- FactSet
- Factiva (optional, only if premium news/RAG is core)
- One open banking aggregator only if required

**Use this when:** you want Ada to scale into a serious wealth copilot with fewer external vendors.

---

## My final recommendation

If the priority is truly **minimize integrations**, my recommendation is:

### For demo / early pilot
- Build around **Internal Core + Finnhub + FRED + SEC + OpenFIGI + Frankfurter/CBUAE**
- Keep **Yahoo Finance** as a development/fallback adapter only
- Do **not** add open banking, premium news, ESG, or peer-cohort vendors until usage proves they matter

### For serious pilot / production path
- Move to **Internal Core + FactSet**
- Add **Factiva** only if licensed premium news and GenAI-safe retrieval are a key part of Discover/chat
- Add **one** aggregation provider only when external linked-account flows are truly required

---

## Notes on Yahoo Finance
Yahoo Finance can be useful as an additional option for:
- rapid prototyping
- sanity checks
- non-critical fallback data
- filling occasional coverage gaps during development

But it should **not** be treated as the primary production source of truth for Ada because the commonly used access methods are wrappers around Yahoo Finance’s publicly available endpoints rather than a clearly supported public Yahoo Finance enterprise API.

---

## Official links for reference

### Free / public
- Finnhub: https://finnhub.io/ and https://finnhub.io/pricing
- FRED: https://fred.stlouisfed.org/docs/api/fred/overview.html
- SEC EDGAR public data: https://data.sec.gov/ and https://www.sec.gov/search-filings/edgar-application-programming-interfaces
- OpenFIGI: https://www.openfigi.com/api/documentation
- Frankfurter: https://frankfurter.dev/
- CBUAE FX: https://www.centralbank.ae/en/forex-eibor/exchange-rates/
- Yahoo developer APIs: https://developer.yahoo.com/api/
- yfinance reference / caveat: https://github.com/ranaroussi/yfinance

### Paid / enterprise
- Finnhub paid: https://finnhub.io/pricing-stock-api-market-data
- Twelve Data pricing: https://twelvedata.com/pricing
- FMP pricing: https://site.financialmodelingprep.com/developer/docs/pricing
- Marketaux pricing: https://www.marketaux.com/pricing
- Benzinga APIs: https://www.benzinga.com/apis/
- FactSet pricing: https://www.factset.com/factset-pricing
- FactSet API catalog: https://developer.factset.com/api-catalog
- S&P Capital IQ Pro: https://www.spglobal.com/market-intelligence/en/solutions/products/sp-capital-iq-pro
- Bloomberg enterprise data: https://professional.bloomberg.com/products/data/
- Factiva: https://www.dowjones.com/business-intelligence/factiva/
- Morningstar Data+Analytics: https://www.morningstar.com/business/brands/data-analytics
- Morningstar Direct Web Services: https://www.morningstar.com/business/products/direct-web-services
- Sustainalytics ESG data: https://www.sustainalytics.com/esg-data
- Plaid pricing: https://plaid.com/en-eu/pricing/
- Tink pricing: https://tink.com/pricing/
- Salt Edge: https://www.saltedge.com/
