<div align="center">
  <h1>SmartSpend: Finance Intelligence SaaS</h1>
  <p>A production-grade, full-stack personal finance engine built for the modern web.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Stripe](https://img.shields.io/badge/Stripe-Payments-6366F1?style=for-the-badge&logo=stripe)](https://stripe.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

<br />

## 🌟 Overview

**SmartSpend** is a premium Software-as-a-Service (SaaS) application that revolutionizes how users track and manage their personal finances. Built from the ground up to be scalable, secure, and visually stunning, SmartSpend leverages a cutting-edge Next.js App Router architecture and is strictly typed with TypeScript.

Say goodbye to manual expense tracking. SmartSpend introduces intelligent budget monitoring, automated recurring expenses, comprehensive analytics, and seamless real-time notifications via email and in-app toasts.

## ✨ Core Features

*   **⚡ Type-Safe Architecture:** 100% end-to-end type safety from database schemas to UI components, ensuring a reliable and bug-free experience.
*   **🔐 NextAuth Authentication:** Secure session management with seamless Google OAuth and encrypted email/password credentials.
*   **📊 Interactive Analytics Engine:** Real-time financial insights powered by `Recharts`, featuring daily spending trends, category breakdowns, and top expenses.
*   **💳 Stripe Pro Subscriptions:** Fully integrated Stripe Checkout and Customer Billing Portal for unlocking premium analytical features and higher budget limits.
*   **🤖 Automated Recurring Engine:** Built-in Vercel Cron jobs automatically process recurring expenses (daily, weekly, monthly, yearly) so you never miss a beat.
*   **📧 Resend Email Alerts:** Automated lifecycle emails and budget warning alerts trigger the moment a category hits 80% of its monthly limit.
*   **🎨 Premium Design System:** A bespoke, glassmorphic UI built with Tailwind CSS v4, Framer Motion animations, and a strict deep-slate color palette.

## 🛠 Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | MongoDB & Mongoose ORM |
| **Styling** | Tailwind CSS v4, Lucide React Icons |
| **Animation** | Framer Motion |
| **Authentication** | NextAuth.js v4, bcryptjs |
| **Payments** | Stripe API |
| **Emails** | Resend |
| **Charts** | Recharts |

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and npm/yarn installed. You will also need a MongoDB cluster, a Google Cloud project (for OAuth), a Stripe account, and a Resend API key.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mhaseebhassan/Saas-SmartSpend.git
    cd Saas-SmartSpend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and populate it with your API keys:
    ```env
    # Application URL
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # MongoDB Database
    MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smartspend

    # Authentication
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_super_secret_key
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # Stripe Payments
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    STRIPE_PRO_PRICE_ID=price_...

    # Email (Resend)
    RESEND_API_KEY=re_...
    EMAIL_FROM=notifications@yourdomain.com
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚢 Deployment (Vercel)

SmartSpend is pre-configured and optimized for Vercel deployment. 

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add all your `.env.local` variables to the Vercel Environment Variables settings.
4. Deploy!

### Configuring Cron Jobs

Recurring expenses require the Vercel Cron Job to be active. The repository includes a `vercel.json` file that automatically configures the `/api/expenses/process-recurring` endpoint to run daily at Midnight UTC.

Ensure your Vercel project is on the Pro plan or has cron jobs enabled to utilize this feature.

## 🛡 Security & Design

*   **Atomic API Routes**: Every API route enforces strict session validation and gracefully catches errors to prevent data leaks.
*   **Error Boundaries**: Robust `error.tsx` handlers ensure that UI crashes are contained, presenting a friendly fallback rather than breaking the app.
*   **Dark Mode Native**: Designed specifically for dark-mode, utilizing the `#0F1117` background and `#6366F1` indigo accents to reduce eye strain and provide a highly modern aesthetic.

## 🔒 Security & Quality Audits

*   **TypeScript Migration:** The entire codebase was recently migrated from JavaScript to strict TypeScript, introducing robust generic types for Mongoose schemas (`FilterQuery<any>`) and strongly-typed API route parameters (`Promise<{ id: string }>`) compliant with Next.js 16.
*   **Swarm Verification:** The project has been audited by an automated 10-subagent swarm, which resulted in the implementation of critical security patches (IP spoofing mitigation, timing-attack prevention in Auth credentials, case-sensitivity fixes in middleware) and optimizations (Mongoose indexing, ARIA accessibility, responsive layout fixes).

---
<div align="center">
  <i>Developed meticulously by Haseeb.</i>
</div>
