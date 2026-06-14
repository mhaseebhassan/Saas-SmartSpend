<p align="center">
  <h1 align="center">SmartSpend</h1>
  <p align="center">
    <strong>Autonomous Wealth Management — Redefined.</strong>
    <br />
    A full-stack personal finance SaaS application built with Next.js, TypeScript, MongoDB, and Stripe.
  </p>
</p>

<br />

## 📸 Screenshots

### Landing Page

<p align="center">
  <img src="public/ss3.png" alt="SmartSpend Landing Page" width="100%" />
</p>

### Dashboard

<p align="center">
  <img src="public/ss1.png" alt="Dashboard — Spending Trends & Category Allocation" width="100%" />
</p>

### Analytics

<p align="center">
  <img src="public/ss2.png" alt="Analytics — Heatmap, 6-Month Trends & Top Merchants" width="100%" />
</p>

<br />

## ✨ Features

- **Authentication** — Email/password and Google OAuth via NextAuth v4
- **Expense Tracking** — Category filters, recurring expenses, and bulk management
- **Dashboard Analytics** — Spending trends, category distribution, recent transactions, and savings rate
- **Budget Planner** — Monthly limits with icons, colors, and warning states per category
- **Stripe Payments** — Checkout and billing portal for Pro subscriptions
- **Recurring Expenses** — Automated processing via Vercel Cron
- **Reports** — Exportable monthly breakdowns and summaries

<br />

## 🛠 Tech Stack

| Area | Technology |
|------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | NextAuth v4, bcryptjs |
| **Payments** | Stripe |
| **Email** | Resend |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Icons** | Lucide React |
| **Charts** | Recharts |

<br />

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Stripe account (for payment features)

### Installation

```bash
# Clone the repository
git clone https://github.com/mhaseebhassan/Saas-SmartSpend.git
cd Saas-SmartSpend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority&appName=<app>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<strong-secret>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-publishable-key>
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
STRIPE_PRICE_ID=<stripe-price-id>

# Email (optional)
RESEND_API_KEY=<resend-api-key>
EMAIL_FROM=<verified-sender>
```

> **Note:** If local Node DNS has trouble resolving Atlas `mongodb+srv` records, add `MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8` to your `.env.local`.

### Run Locally

```bash
# Seed demo data (optional)
npm run seed

# Start development server
npm run dev
```

### Demo Accounts

After seeding, you can log in with these test accounts:

| Email | Password |
|-------|----------|
| `demo@smartspend.test` | `SmartSpend123!` |
| `maya@smartspend.test` | `SmartSpend123!` |
| `omar@smartspend.test` | `SmartSpend123!` |

<br />

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with demo data |

<br />

## 🌐 Deployment

This project is configured for Vercel deployment.

- `npm run build` passes with Next.js 16 production output
- `vercel.json` includes the daily cron route at `/api/expenses/process-recurring`
- Set `NEXTAUTH_URL` to your production Vercel URL (not `localhost`)
- All environment variables must be configured in Vercel project settings before deploy

> **Security Note:** The cron route is publicly reachable by default. For production, add a cron secret header or query token.

<br />

## 📄 License

This project is for portfolio and demonstration purposes.
