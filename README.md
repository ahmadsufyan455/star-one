# ⭐ StarOne — AI-Powered App Review Analyzer

> Stop guessing what to build. Let real users tell you.

**StarOne** is an AI-powered competitive intelligence tool for indie hackers and product builders. Enter any Google Play app's package ID, and StarOne scrapes its negative reviews (1–3 stars), feeds them to Gemini AI, and returns actionable insights — including sentiment analysis, top complaints, feature requests, and validated app ideas.

---

## 🚀 Live Demo

[https://star-one-five.vercel.app](https://star-one-five.vercel.app)

---

## ✨ Features

### 🔍 Market Gap Detector
Enter any Google Play app package ID (e.g., `com.instagram.android`) and StarOne will:
- Scrape the **150 most recent reviews** from Google Play
- Filter for **negative reviews (1–3 stars)** — where real pain points live
- Send them through **Gemini** for intelligent analysis

### 🧠 AI-Powered Sentiment Analysis
Gemini AI reads thousands of reviews and surfaces:
- **Top Complaints** — The most common user frustrations, ranked and summarized
- **Feature Requests** — Specific features users are explicitly asking for
- **Sentiment Summary** — A concise one-sentence overview of overall user mood

### 💡 App Idea Generator
Based on the pain points discovered, StarOne generates **3–5 validated app concepts**, each with:
- **App name** — A concrete idea, not a vague suggestion
- **Pain point** — The specific user problem it solves
- **Differentiation** — How it differs from the analyzed competitor
- **Value proposition** — Clear user benefit in 1–2 sentences

Each idea is categorized as:
1. **Direct Competitor** — Same category, better execution
2. **Niche Alternative** — Specialized or different angle
3. **Complementary Tool** — Adjacent category that extends the use case

### 📊 Competitive Intelligence Dashboard
For each analyzed app, StarOne shows:
- **Disruption Score** (0–100) — Calculated from rating, installs, and last-update date to measure how vulnerable the app is to a competitor
- **Install Count** — Formatted (1K, 10M, etc.)
- **App Rating** — Score and total review count
- **Last Updated** — Human-readable relative date (e.g., "3 months ago")
- **Pricing** — Free, paid, or with in-app purchases (IAP)

### 🗂️ Bad Reviews Viewer
Raw negative reviews from real users are displayed in the results, showing:
- Reviewer name and avatar
- Star rating (1–3)
- Review text and date

### 🌍 Multi-Region & Multi-Language Support
Analyze reviews from different markets:
| Region | Country Code | Language |
|--------|-------------|----------|
| 🇺🇸 United States | `us` | English |
| 🇮🇩 Indonesia | `id` | Indonesian |
| 🇮🇳 India | `in` | English |
| 🇬🇧 United Kingdom | `gb` | English |
| 🇸🇬 Singapore | `sg` | English |

### ⚡ Quick Start Apps
Pre-loaded examples to get started instantly: **Instagram**, **Notion**, **Duolingo**

### 🔐 Authentication & User Management
- **Google OAuth** sign-in via NextAuth v5
- User data synced to **Supabase** on sign-in
- Protected routes via middleware — unauthenticated users are redirected to login

### 🛡️ Rate Limiting
- **2 analyses per user per 24 hours** (free tier)
- After the limit is hit, a **feedback modal** is shown to gather user input
- Remaining analyses count displayed in the UI

### 📝 Persistent Results
- Last analysis results are saved to **localStorage**
- Pre-filled on next visit so results aren't lost on refresh

### 📊 Analytics & Monitoring
- **Vercel Analytics** for page-level metrics
- **Vercel Speed Insights** for performance monitoring
- Custom event tracking (analysis started/completed/failed, rate limit hits, user sign-in/out)
- **Sentry** integration for error reporting (client, server, and edge)

---

## 🏗️ Project Structure

```
review-analyzer/
├── public/                     # Static assets (logo, icons)
├── src/
│   ├── app/
│   │   ├── (public)/           # Public-facing pages (no auth required)
│   │   │   ├── about/          # About page
│   │   │   ├── privacy-policy/ # Privacy policy
│   │   │   ├── terms-of-service/
│   │   │   └── layout.tsx      # Public layout with Footer
│   │   ├── analyze/
│   │   │   └── page.tsx        # 🔑 Main dashboard — analyze page (protected)
│   │   ├── api/
│   │   │   ├── analyze/
│   │   │   │   └── route.ts    # 🔑 Core API: scrapes reviews + calls Gemini AI
│   │   │   ├── auth/           # NextAuth route handler
│   │   │   └── feedback/       # Feedback API endpoint
│   │   ├── history/            # Analysis history page
│   │   ├── login/              # Login page
│   │   ├── settings/           # User settings page
│   │   ├── layout.tsx          # Root layout (SessionProvider, Analytics)
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ComingSoon.tsx      # Coming soon placeholder component
│   │   ├── FeedbackModal.tsx   # Feedback modal (shown on rate limit)
│   │   └── Footer.tsx          # Site footer with navigation links
│   ├── lib/
│   │   ├── analytics.ts        # Custom Vercel Analytics event tracker
│   │   ├── rate-limit.ts       # In-memory rate limiter (2 analyses/day/user)
│   │   └── supabase/           # Supabase client & user sync utilities
│   ├── types/                  # TypeScript type definitions (AnalysisResponse, etc.)
│   ├── auth.ts                 # NextAuth config (Google provider + Supabase sync)
│   └── middleware.ts           # Route protection middleware
├── sentry.client.config.ts     # Sentry client config
├── sentry.server.config.ts     # Sentry server config
├── sentry.edge.config.ts       # Sentry edge runtime config
├── next.config.ts              # Next.js + Sentry config
└── package.json
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **AI / LLM** | [Google Gemini](https://ai.google.dev/) via `@google/generative-ai` |
| **Review Scraper** | [google-play-scraper](https://github.com/facundoolano/google-play-scraper) |
| **Auth** | [NextAuth.js v5](https://authjs.dev/) (Google OAuth) |
| **Database** | [Supabase](https://supabase.com/) (user sync) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics) + [Speed Insights](https://vercel.com/docs/speed-insights) |
| **Monitoring** | [Sentry](https://sentry.io/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- A Google Cloud project with OAuth credentials
- A Supabase project
- A Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/review-analyzer.git
cd review-analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Google OAuth (NextAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
AUTH_SECRET=your_nextauth_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 How It Works

```
User enters App ID (e.g., com.instagram.android)
        ↓
[API Route] google-play-scraper fetches app details + 150 latest reviews
        ↓
Filter for negative reviews (score ≤ 3 stars)
        ↓
[Gemini] Analyzes review texts → returns structured JSON
        ↓
Response includes:
  - top_complaints[]
  - feature_requests[]
  - sentiment_summary
  - app_ideas[] (name, pain_point, differentiation, value_proposition)
        ↓
UI renders results: Disruption Score, Competitive Intelligence,
Bad Reviews, App Opportunities
```

---

## 🗺️ Roadmap — Next Features

### 🏪 App Store Analysis *(Coming Soon)*
Extend analysis to **Apple App Store** reviews, enabling cross-platform competitive intelligence. Users will be able to compare how iOS and Android audiences experience the same app differently — surfacing platform-specific pain points and opportunities.

### 🚀 Product Hunt Analysis *(Coming Soon)*
Analyze **Product Hunt** launch comments, upvote patterns, and user feedback for SaaS products. This enables makers to identify what feature gaps exist in freshly-launched tools and what the maker community is looking for — perfect for discovering SaaS opportunities before they become crowded.

### 📈 SaaS Review Platform Analysis *(Planned)*
Support for scraping and analyzing reviews from **G2**, **Capterra**, and **Trustpilot** — giving founders deep insight into what enterprise and SMB users want from SaaS tools. This unlocks a whole new tier of market research for B2B product ideas.

### 📋 Analysis History
Save and revisit past analyses, track how apps change over time, and compare insights across multiple competitors.

### 📤 Export Reports
Download analysis results as PDF or CSV for sharing with your team or investors.

### 🔔 Competitor Monitoring
Set up alerts to get notified when a competitor app receives a spike in negative reviews — your signal to move fast.

---

## 📄 License

This project is private. All rights reserved.

---

<p align="center">Built with ❤️ for indie hackers who want to build things people actually want.</p>
