# SmartSpend - Personal Finance SaaS

![SmartSpend Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop)

> **The intelligent, premium dashboard for modern finance tracking.**  
> Built with Next.js 13+, Tailwind CSS, and Framer Motion.

## ✨ Features

- **Premium UI**: "Linear-style" deep slate dark mode, glassmorphism, and spring physics animations.
- **Smart Budgets**: Set category limits and visualize progress with gradient bars.
- **Expense Tracking**: Add, edit, and filter expenses with a buttery-smooth interface.
- **Visual Analytics**: Interactive Recharts for spending trends and category breakdowns.
- **Authentication**: Secure Google OAuth and Credentials login via NextAuth.js.
- **Data Security**: Per-user data isolation with MongoDB.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Database**: MongoDB + Mongoose
- **Auth**: NextAuth.js v4
- **Charts**: Recharts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Instance (Local or Atlas)
- Google Cloud Console Credentials (for OAuth)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/smart-spend.git
    cd smart-spend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Rename `.env.example` to `.env.local` and add your keys:
    ```bash
    MONGODB_URI=mongodb://localhost:27017/smart-spend
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_super_secret_key
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000).

## 📸 Screenshots

| Dashboard | Expenses |
|-----------|----------|
| ![Dashboard Screenshot](/public/dashboard-ss.png) | ![Expenses Screenshot](/public/expenses-ss.png) |

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
