import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function rateLimit(ip: string) {
    const now = Date.now();
    const limit = 10;
    const windowMs = 15 * 60 * 1000;

    let record = rateLimitMap.get(ip);
    if (!record) {
        record = {
            count: 1,
            resetTime: now + windowMs,
        };
        rateLimitMap.set(ip, record);
        return { success: true, remaining: limit - 1, resetTime: record.resetTime };
    }

    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
        return { success: true, remaining: limit - 1, resetTime: record.resetTime };
    }

    if (record.count >= limit) {
        return { success: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count += 1;
    return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isLogin = pathname.startsWith("/api/auth/callback/credentials") || pathname.startsWith("/api/auth/signin");
    const isRegister = pathname === "/api/register";

    if (isLogin || isRegister) {
        const forwardedFor = req.headers.get("x-forwarded-for");
        const realIp = req.headers.get("x-real-ip");
        const ip = realIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1");

        const rate = rateLimit(ip);
        if (!rate.success) {
            return NextResponse.json(
                { message: "Too many requests. Please try again after 15 minutes." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil((rate.resetTime - Date.now()) / 1000).toString(),
                    },
                }
            );
        }
    }

    const lowerPathname = pathname.toLowerCase();
    if (lowerPathname.startsWith("/api/")) {
        const isAuthRoute = lowerPathname.startsWith("/api/auth/");
        const isWebhook = lowerPathname === "/api/stripe/webhook";
        const isRegisterRoute = lowerPathname === "/api/register";
        const isProcessRecurring = lowerPathname === "/api/expenses/process-recurring";

        if (!isAuthRoute && !isWebhook && !isRegisterRoute && !isProcessRecurring) {
            const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
            if (!token) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
