import bcrypt from "bcryptjs";
import dns from "node:dns";
import fs from "node:fs";
import mongoose from "mongoose";

if (fs.existsSync(".env.local")) {
  const envFile = fs.readFileSync(".env.local", "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DNS_SERVERS = process.env.MONGODB_DNS_SERVERS;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required. Load .env.local or set it before running npm run seed.");
}

if (MONGODB_DNS_SERVERS && MONGODB_URI.startsWith("mongodb+srv://")) {
  dns.setServers(MONGODB_DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean));
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    provider: { type: String, default: "credentials" },
    isPro: { type: Boolean, default: true },
    currency: { type: String, default: "USD" },
    dateFormat: { type: String, default: "MM/DD/YYYY" },
    onboardingComplete: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true },
    icon: String,
    monthlyLimit: { type: Number, default: 0 },
    lastAlertSentAt: Date,
  },
  { timestamps: true }
);

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, maxlength: 100 },
    isRecurring: { type: Boolean, default: false },
    recurrenceInterval: { type: String, enum: ["weekly", "monthly", null], default: null },
    isPaused: { type: Boolean, default: false },
    lastProcessedAt: Date,
    parentExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: "Expense", default: null },
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["budget", "recurring", "subscription", "info", "general"],
      default: "general",
    },
    isRead: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    month: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
const Budget = mongoose.models.Budget || mongoose.model("Budget", budgetSchema);

const demoPassword = "SmartSpend123!";

const testUsers = [
  { name: "Haseeb Demo", email: "demo@smartspend.test", isPro: true, multiplier: 1 },
  { name: "Maya Analyst", email: "maya@smartspend.test", isPro: true, multiplier: 0.72 },
  { name: "Omar Budgeter", email: "omar@smartspend.test", isPro: false, multiplier: 1.18 },
];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function main() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  const password = await bcrypt.hash(demoPassword, 10);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (const testUser of testUsers) {
    const user = await User.findOneAndUpdate(
      { email: testUser.email },
      {
        name: testUser.name,
        email: testUser.email,
        password,
        provider: "credentials",
        isPro: testUser.isPro,
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
        onboardingComplete: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Promise.all([
      Category.deleteMany({ userId: user._id }),
      Expense.deleteMany({ userId: user._id }),
      Notification.deleteMany({ userId: user._id }),
      Budget.deleteMany({ userId: user._id }),
    ]);

    const scale = (value) => Math.round(value * testUser.multiplier * 100) / 100;
    const categories = await Category.insertMany([
      { userId: user._id, name: "Groceries", color: "#10B981", icon: "food", monthlyLimit: scale(620) },
      { userId: user._id, name: "Transport", color: "#3B82F6", icon: "transport", monthlyLimit: scale(280) },
      { userId: user._id, name: "Housing", color: "#6366F1", icon: "housing", monthlyLimit: scale(1800) },
      { userId: user._id, name: "Health", color: "#EF4444", icon: "health", monthlyLimit: scale(350) },
      { userId: user._id, name: "Entertainment", color: "#EC4899", icon: "entertainment", monthlyLimit: scale(220) },
      { userId: user._id, name: "Investments", color: "#F59E0B", icon: "investments", monthlyLimit: scale(900) },
    ]);

    const byName = Object.fromEntries(categories.map((category) => [category.name, category]));

    await Budget.insertMany([
      { userId: user._id, category: "All", limit: scale(4170), month: currentMonth },
      ...categories.map((category) => ({
        userId: user._id,
        category: category.name,
        limit: category.monthlyLimit,
        month: currentMonth,
      })),
    ]);

    await Expense.insertMany([
      { userId: user._id, categoryId: byName.Housing._id, description: "Apartment rent", amount: scale(1650), date: daysAgo(2), note: "Downtown lease", isRecurring: true, recurrenceInterval: "monthly", lastProcessedAt: daysAgo(2) },
      { userId: user._id, categoryId: byName.Groceries._id, description: "Whole Foods weekly shop", amount: scale(142.35), date: daysAgo(1), note: "Meal prep", isRecurring: false },
      { userId: user._id, categoryId: byName.Groceries._id, description: "Farmers market", amount: scale(54.2), date: daysAgo(5), isRecurring: false },
      { userId: user._id, categoryId: byName.Transport._id, description: "Fuel refill", amount: scale(61.8), date: daysAgo(3), isRecurring: false },
      { userId: user._id, categoryId: byName.Transport._id, description: "Metro pass", amount: scale(48), date: daysAgo(9), isRecurring: true, recurrenceInterval: "monthly", lastProcessedAt: daysAgo(9) },
      { userId: user._id, categoryId: byName.Health._id, description: "Gym membership", amount: scale(69), date: daysAgo(7), isRecurring: true, recurrenceInterval: "monthly", lastProcessedAt: daysAgo(7) },
      { userId: user._id, categoryId: byName.Health._id, description: "Pharmacy", amount: scale(37.6), date: daysAgo(12), isRecurring: false },
      { userId: user._id, categoryId: byName.Entertainment._id, description: "Netflix", amount: scale(15.49), date: daysAgo(4), isRecurring: true, recurrenceInterval: "monthly", lastProcessedAt: daysAgo(4) },
      { userId: user._id, categoryId: byName.Entertainment._id, description: "Dinner with friends", amount: scale(88.75), date: daysAgo(6), isRecurring: false },
      { userId: user._id, categoryId: byName.Investments._id, description: "Index fund contribution", amount: scale(650), date: daysAgo(10), isRecurring: true, recurrenceInterval: "monthly", lastProcessedAt: daysAgo(10) },
      { userId: user._id, categoryId: byName.Investments._id, description: "Emergency fund transfer", amount: scale(200), date: daysAgo(14), isRecurring: false },
      { userId: user._id, categoryId: byName.Groceries._id, description: "Coffee beans", amount: scale(24.5), date: daysAgo(0), isRecurring: false },
    ]);

    await Notification.insertMany([
      {
        userId: user._id,
        title: "Housing budget near limit",
        message: "Rent has used most of your monthly housing allocation.",
        type: "budget",
        isRead: false,
        link: "/dashboard/budgets",
      },
      {
        userId: user._id,
        title: "Recurring expenses processed",
        message: "SmartSpend processed rent, Netflix, gym, and investment recurring items.",
        type: "recurring",
        isRead: false,
        link: "/dashboard/recurring",
      },
    ]);

    console.log(`Seeded ${testUser.name} <${testUser.email}>`);
  }

  console.log(`Demo password: ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
