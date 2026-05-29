import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid email or password");
                }
                await connectDB();
                const user = await User.findOne({ email: credentials.email });
                if (!user) {
                    // Prevent timing attacks for user enumeration
                    await bcrypt.compare(credentials.password, "$2a$10$dummyHashStringWhichIs29CharsLong");
                    throw new Error("Invalid email or password");
                }
                if (user.deletedAt) throw new Error("This account has been deleted");
                if (!user.password) {
                    await bcrypt.compare(credentials.password, "$2a$10$dummyHashStringWhichIs29CharsLong");
                    throw new Error("Please login with Google");
                }
                const isMatch = await bcrypt.compare(credentials.password, user.password);
                if (!isMatch) throw new Error("Invalid email or password");
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    isPro: user.isPro,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await connectDB();
                try {
                    const existingUser = await User.findOne({ email: user.email });
                    if (existingUser && existingUser.deletedAt) {
                        return false; // Prevent login for deleted accounts
                    }
                    if (!existingUser) {
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            provider: "google",
                        });
                    }
                    return true;
                } catch (error) {
                    console.log("Error saving user", error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).isPro = token.isPro;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            if (user) {
                if (account?.provider === "google") {
                    await connectDB();
                    const dbUser = await User.findOne({ email: user.email });
                    if (dbUser) {
                        token.id = dbUser._id.toString();
                        token.isPro = dbUser.isPro;
                    }
                } else {
                    token.id = user.id;
                    token.isPro = (user as any).isPro;
                }
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
