# 🔍 Company News & Events Miner

**Identify high-value business trigger events from free/freemium news sources.**

Built for sales intelligence, competitive monitoring, and lead prioritization. Point it at any company and get structured, scored business events in minutes.

---

## 🎯 What It Does

This Actor scans **10 news sources** (mostly free, no key required) for a given company and:

1. **Collects** articles from Google News, Bing News, PR wires, and optional paid APIs
2. **Classifies** events into 5 intent categories using keyword NLP
3. **Deduplicates** similar stories using Jaccard title similarity
4. **Scores** each event 1–10 for business impact
5. **Outputs** a structured, filterable dataset

---

## 📥 Input

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `company_name` | string | ✅ | — | Company to monitor (e.g. `"Stripe"`) |
| `time_window` | string | — | `7d` | Look-back window: `1d`, `3d`, `7d`, `14d`, `30d`, `90d` |
| `intent_categories` | array | — | All 5 | Which event types to track |
| `max_results` | integer | — | `50` | Max events returned |
| `min_impact_score` | integer | — | `3` | Filter out low-signal events (1–10) |
| `language` | string | — | `en` | Language code |
| `NEWSAPI_KEY` | string | — | — | Optional: NewsAPI.org (100 req/day free) |
| `GNEWS_KEY` | string | — | — | Optional: GNews.io (100 req/day free) |
| `THENEWSAPI_KEY` | string | — | — | Optional: TheNewsAPI.com (100 req/day free) |
| `MEDIASTACK_KEY` | string | — | — | Optional: MediaStack (500 req/month free) |

---

## 📤 Output Schema

```json
{
  "company_name": "Stripe",
  "event_type": "funding",
  "headline": "Stripe raises $694M Series I at $65B valuation",
  "summary": "Payment giant Stripe has closed a new funding round...",
  "event_date": "2025-03-12T14:00:00Z",
  "source": "TechCrunch",
  "source_link": "https://techcrunch.com/...",
  "intent_signal": "High",
  "event_impact_score": 9,
  "confidence": "High",
  "keywords_matched": ["raises", "series", "valuation", "billion"],
  "scraped_at": "2025-03-15T10:32:00Z"
}
```

---

## 🔄 Event Types

| Type | What It Detects |
|---|---|
| `expansion` | New markets, offices, M&A, acquisitions, IPO, hiring surges |
| `product_launch` | New products, features, releases, updates, beta launches |
| `funding` | VC rounds, grants, IPOs, debt financing, valuations |
| `partnership` | Joint ventures, alliances, contracts, integration deals |
| `compliance` | Regulatory approvals, fines, lawsuits, certifications, audits |

---

## 📡 News Sources

### Free (No API Key Required)
| Source | Type | Coverage |
|---|---|---|
| **Google News RSS** | RSS Feed | Broad, real-time, global |
| **Bing News RSS** | RSS Feed | Broad, real-time, global |
| **PR Newswire RSS** | Press Releases | Official company announcements |
| **BusinessWire RSS** | Press Releases | Official company announcements |
| **GlobeNewswire RSS** | Press Releases | Official company announcements |
| **SEC EDGAR Full-Text** | Gov Filing API | 8-K, S-1, 10-Q filings (US companies) |

### Freemium (API Key Required – All Have Free Tiers)
| Source | Free Tier | Sign Up |
|---|---|---|
| **NewsAPI.org** | 100 req/day | [newsapi.org](https://newsapi.org) |
| **GNews.io** | 100 req/day | [gnews.io](https://gnews.io) |
| **TheNewsAPI.com** | 100 req/day | [thenewsapi.com](https://thenewsapi.com) |
| **MediaStack** | 500 req/month | [mediastack.com](https://mediastack.com) |

---

## 🧮 Impact Scoring Model

```
Base Score by Event Type:
  funding         → 7
  expansion       → 6
  product_launch  → 5
  partnership     → 5
  compliance      → 4

Modifiers (+/-):
  + Credible source (Reuters, Bloomberg, FT, etc.)   → +1
  + Dollar amount mentioned (millions/billions)       → +1
  + Published within last 48 hours                   → +1
  + High-confidence classification                    → +1
  + 3+ strong keyword matches                         → +1
  - PR wire only (no corroborating source)            → -1
  - Low-confidence classification                     → -1

Final Score = min(10, max(1, base + sum of modifiers))

Intent Signal:
  Score 7–10  → High
  Score 4–6   → Medium
  Score 1–3   → Low
```

---

## 🚫 Filtering Rules

- **PR Fluff Removed**: Awards, culture posts, keynote speakers, team birthdays, anniversary celebrations are auto-rejected
- **Deduplication**: Near-duplicate headlines (Jaccard similarity > 0.65) are merged, keeping the richer version
- **No Date = Included**: Articles without publication dates pass through (let the classifier decide)
- **Min Impact Score**: Set `min_impact_score` to 5+ for only truly high-signal events

---

## ⚡ Quick Start

```json
{
  "company_name": "Anthropic",
  "time_window": "14d",
  "intent_categories": ["funding", "expansion", "product_launch"],
  "min_impact_score": 5
}
```

---

## 🔧 Local Development

```bash
npm install
APIFY_HEADLESS=1 node src/main.js
```

Set optional API keys in `.env` or Apify actor environment variables.

---

## 📊 Use Cases

- **Sales teams**: Identify trigger events to time outreach
- **VC analysts**: Monitor portfolio companies or targets
- **Competitive intelligence**: Track competitor moves in real-time
- **PR teams**: Monitor your own company's coverage
- **Journalists**: Track news beats across many companies
