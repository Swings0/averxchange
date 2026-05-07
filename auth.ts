import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        const email = (credentials?.email as string) ?? "";
        const password = (credentials?.password as string) ?? "";

        if (!email || !password) return null;

        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection("users").findOne({ email });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username || user.fullName || "User",

          // ✅ FIX: include role (IMPORTANT)
          role: user.role || "user",
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
});