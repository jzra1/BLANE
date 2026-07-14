# Decisions Log: BLANE

This file documents architectural and tech stack decisions for the BLANE project.

## 2026-07-14: Choice of Explainable AI Model

### Context
We needed a reliable, cost-effective, and fast LLM to generate custom meal explanations based on high-dimensional user parameters (goals, allergens, budgets, etc.).

### Decision
Use **Gemini 2.5 Flash-Lite** via Node.js SDK and Google AI Studio API.

### Rationale
- Fast response times, ensuring meal explanations load alongside recipes without delay.
- Cost-effective for high-frequency user dashboard loads.
- Proven performance in structured prompt instruction adherence (minimizing hallucinations).

### Model Comparison: Gemini 2.5 Flash-Lite vs. OpenAI GPT-4o-mini

During the architectural review, we compared Gemini 2.5 Flash-Lite with OpenAI's closest lightweight model, GPT-4o-mini:

| Dimension | Google Gemini 2.5 Flash-Lite | OpenAI GPT-4o-mini | Decision Rationale |
|-----------|------------------------------|--------------------|--------------------|
| **Cost (Input)** | **$0.075 / 1M tokens** | $0.15 / 1M tokens | Gemini is **50% cheaper** for input tokens, critical for high-frequency dashboard logs. |
| **Cost (Output)** | **$0.30 / 1M tokens** | $0.60 / 1M tokens | Gemini is **50% cheaper** for output token generation. |
| **Context Window** | **1,000,000 tokens** | 128,000 tokens | Gemini's large context allows loading extensive PhilFCT ingredient reference lists directly in prompts if needed. |
| **Speed (Latency)** | ~300-500ms | ~400-600ms | Gemini 2.5 Flash-Lite provides competitive or faster Time-to-First-Token (TTFT). |
| **Free Tier** | **15 RPM / 1,500 RPD (Free)** | Paid only (API Key billing) | Gemini allows free, robust development and testing via Google AI Studio without upfront costs. |

Based on this comparison, **Gemini 2.5 Flash-Lite** is the optimal choice for academic research, providing equal cognitive capacity at half the cost and with a free testing tier.

---

## 2026-07-14: Database & Real-Time Sync Framework

### Context
The feedback loop requires instant targets recalculation, secure user data partitions, and backend execution of calorie calculation scripts.

### Decision
Use **Supabase** (PostgreSQL database, Row-Level Security, Edge Functions, and Realtime).

### Rationale
- PostgreSQL natively supports complex queries required by the constraint-based recommendation filters.
- Row-Level Security (RLS) satisfies security protocols for health-related profiles.
- Edge Functions (Deno runtime) allow secure server-side execution of formulas and communication with Google AI Studio.
- Supabase Realtime simplifies dashboard updates when metrics are logged.

---

## 2026-07-14: Map Rendering Technology

### Context
The GeoMarket scanner needs to display local market options on a map interface.

### Decision
Use **Leaflet.js** and **OpenStreetMap API**.

### Rationale
- Lightweight and free, avoiding licensing and usage fees associated with Google Maps.
- Highly customizable using vanilla JavaScript.
- Perfectly adequate for rendering marker lists within the geographic boundary of Tarlac City.
