# SmartSpend — Production-Grade Finance SaaS

[![Next.js Framework](https://img.shields.io/badge/Framework-Next.js%2016-black?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![Database MongoDB](https://img.shields.io/badge/Database-MongoDB%20%26%20Mongoose-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Payment Stripe](https://img.shields.io/badge/Payment-Stripe%20Billing-blue?style=flat&logo=stripe)](https://stripe.com/)
[![Email Resend](https://img.shields.io/badge/Email-Resend%20Alerts-indigo?style=flat)](https://resend.com/)

SmartSpend is an ultra-premium, production-grade personal finance SaaS platform designed for modern tracking. Featuring a sleek "Linear-style" glassmorphic interface, spring physics micro-animations, real-time Stripe billing lifecycles, background cron recurring engines, and threshold email alerts via Resend, SmartSpend delivers an elite-tier experience on both desktop and mobile viewports.

---

## 📸 Screenshots

| 📊 Interactive Dashboard | 💸 Expenses & Right Drawer |
| --- | --- |
| ![Dashboard Layout](file:///d:/CS/CV/Projects-Portfolio/SaaS/public/dashboard-ss.png) | ![Expenses Layout](file:///d:/CS/CV/Projects-Portfolio/SaaS/public/expenses-ss.png) |

| 🎯 Budget Planning & Color Swatches | 📈 Pro Analytics Blurring |
| --- | --- |
| ![Budgets Layout](file:///d:/CS/CV/Projects-Portfolio/SaaS/public/budgets-ss.png) | ![Analytics Layout](file:///d:/CS/CV/Projects-Portfolio/SaaS/public/analytics-ss.png) |

---

## ✨ Production-Grade Features

- [x] **Phase 1: Overhauled Design & Visual Experience**
  - **Premium Dark-Theme Design Tokens**: Unified slate palettes (`#0F1117` background, `#1A1D2E` surfaces, `#2A2D3E` border) accessible across all views.
  - **Framer Motion Micro-animations**: Soft hover glow spotlights, elastic button scales, active indicator layout morphing (`layoutId`), and custom loading skeletons.
  - **Slide-in Expense Drawer**: Right-aligned sliding form with real-time field inline validations.
  - **Grid Budgets Planner**: Categories equipped with custom HSL gradient progress bars transitioning warning colors (>70% amber, >90% red).
- [x] **Phase 2: Relational Data Layer & Auth Hardening**
  - **Relational Scoping**: Shifted from flat strings to full user-scoped relational Category and Expense mongoose models.
  - **Next.js Protection Middleware**: Secured API endpoints rejecting unauthorized requests.
  - **Sliding IP Rate Limiter**: High-security sliding in-memory rate-limiter guarding registration/login routes (max 10 requests per 15 minutes).
  - **Soft Deletions**: GDPR-compliant accounts soft deletion flag.
- [x] **Phase 3: Stripe Billing Lifecycle**
  - **Upgrade Portals**: Interactive session checkouts redirecting to Stripe Checkout subscription pipelines.
  - **Webhook Integrations**: Signature verified endpoints automatically catching checkout completions (`isPro: true`) or subscription cancelations (`isPro: false`).
  - **Billing Customer Portals**: Premium Stripe Portal links allowing customers to cancel, pause, or upgrade payment profiles.
- [x] **Phase 4: Resend Budget Warning Email Alerts**
  - **Inline-styled HTML Warning Templates**: Beautiful warning email containing spent stats, limits, and call-to-action buttons.
  - **Automatic Limit Triggers**: API listeners detecting when an expense pushes category spending `>= 80%` of its budget and firing emails asynchronously with monthly deduplication logic.
- [x] **Phase 5: Automated Recurring Expenses Engine**
  - **Due duplicates calculator**: Secures Cron-level triggers replicating due transactions daily, dynamically checking budgets and firing alerts.
  - **Vercel Cron scheduling**: Configured `vercel.json` scheduling triggers at `0 0 * * *` protected via CRON_SECRET headers.
- [x] **Phase 6: Bell Notifications & Toast Context**
  - **Bell Dropdown Inbox**: Dynamic unread badges in the header showcasing system, subscription, and budget notification cards.
  - **Global Toast Context**: Rich popups (success, warning, info, error) auto-dismissing after 4 seconds.
- [x] **Phase 7: Elite-Tier UX Polish**
  - **Skeleton Loaders**: Custom pulsed loaders replacing raw spinner animations.
  - **Illustrated Empty States**: Inline SVG illustrations directing empty lists to quick action CTAs.
  - **3-step Interactive Onboarding Wizard**: Quick wizard logging currency, categories, and initial expenses on signup.
  - **375px Responsive Mobile Audit**: Fluid viewport scaling across drawers, models, and touch triggers.

---

## 🛠 Tech Stack

- **Core Engine**: Next.js 16 (App Router) + React 19
- **Database & Modeling**: MongoDB + Mongoose
- **SaaS Billing Pipelines**: Stripe Billing Engine + `@stripe/stripe-js`
- **Asynchronous Email Alerts**: Resend SDK
- **Authentication Safeguards**: NextAuth.js v4 + bcryptjs
- **Micro-Animations & UI**: Framer Motion + Tailwind CSS v4 + Lucide React
- **Interactive Visualizations**: Recharts Area & Donut layouts

---

## 🚀 Local Setup & Configuration

### Prerequisites
- Node.js 18.0.0 or higher
- MongoDB local instance or Atlas URI
- Stripe Developer Sandbox Account
- Resend Account & Domain Verification

### Installation Steps

1. **Clone and Navigate into the Project:**
   ```bash
   git clone https://github.com/mhaseebhassan/Saas-SmartSpend.git
   cd SaaS
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Parameters:**
   Create a `.env.local` file by copying our provided template:
   ```bash
   cp .env.example .env.local
   ```
   *Fill in your MongoDB connection strings, NextAuth secrets, Google credentials, Stripe test secret keys, and Resend developer tokens.*

4. **Verify Database Connections & Dev Servers:**
   ```bash
   npm run dev
   ```
   *Navigate to [http://localhost:3000](http://localhost:3000) to view your local production dashboard.*

5. **Local Stripe Webhook Tunneling (Stripe CLI):**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   *Copy the generated webhook signing secret (`whsec_...`) into your `.env.local` to process payments locally.*

---

## 💳 Stripe Test Credentials

When testing the Pro tier payment flow, use Stripe’s canonical sandbox card details:

- **Card Number**: `4242 4242 4242 4242`
- **Expiration**: Any future date (e.g., `12/30`)
- **CVC**: Any 3-digit number (e.g., `242`)
- **ZIP Code**: Any postal code (e.g., `90210`)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
