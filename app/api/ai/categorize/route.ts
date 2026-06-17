import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Health",
  "Entertainment",
  "Bills & Utilities",
  "Education",
  "Travel",
  "Other",
];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { description } = await req.json();
    if (!description) {
      return NextResponse.json({ category: "Other" });
    }

    const systemPrompt = "You are an expense categorizer. Return ONLY one category from this exact list, nothing else, no punctuation: Food & Dining, Transport, Shopping, Health, Entertainment, Bills & Utilities, Education, Travel, Other";
    const result = await callOpenRouter(description, systemPrompt, 10);

    let matchedCategory = "Other";
    for (const cat of CATEGORIES) {
      if (result.includes(cat)) {
        matchedCategory = cat;
        break;
      }
    }

    return NextResponse.json({ category: matchedCategory });
  } catch (error) {
    console.error("AI categorization error:", error);
    return NextResponse.json({ category: "Other" });
  }
}
