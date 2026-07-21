import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Prefer internal Docker URL on the server (avoids Elastic IP hairpin failures).
        // API_URL is http://crmserver:8000/api → /login
        // BACKEND_API_URL is http://crmserver:8000 → /api/login
        const loginUrl = process.env.API_URL
          ? `${process.env.API_URL}/login`
          : process.env.BACKEND_API_URL
            ? `${process.env.BACKEND_API_URL}/api/login`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/login`;

        try {
          const res = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          const data = await res.json().catch(() => ({}));

          if (res.status === 401) throw new Error("Invalid email or password");

          if (res.status === 200 && data.token) {
            // return everything you need to seed the JWT
            return {
              ...data,
              role: data.user.role || "guest",
              Stoken: data.token
            };
          }

          console.error("[auth] login failed", res.status, data);
          return null;
        } catch (e) {
          console.error("[auth] login error", loginUrl, e.message);
          throw new Error(e.message);
        }
      }
    })
  ],

  session: {
    strategy: "jwt",
    maxAge: 10 * 60 * 60 // 10 hrs
  },

  pages: {
    signIn: "/login"
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // First login
      if (user) {
        token.name = user.user.name;
        token.id = user.user.id;
        token.email = user.user.email;
        token.role = user.role;
        token.accessToken = user.Stoken;
        token.isEmailVerified = user.user.isEmailVerified;
        token.company = user.user.companyId;
        token.plan = user.user.plan;
      }

      // session.update() path
      if (trigger === "update" && session) {
        // Whatever you pass to session.update({...}) will be in `session` here.
        if (session.user) {
          token.name = session.user.name ?? token.name;
          token.role = session.user.role ?? token.role;
          token.company = session.user.company ?? token.company;
          token.plan = session.user.plan ?? token.plan;
          token.isEmailVerified =
            session.user.isEmailVerified ?? token.isEmailVerified;
          if (session.user.enabledProducts) {
            token.enabledProducts = session.user.enabledProducts;
          }
        }
        if (session.accessToken) token.accessToken = session.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.isEmailVerified = token.isEmailVerified;
        session.user.company = token.company;
        session.user.plan = token.plan;
        session.user.enabledProducts = token.enabledProducts;
      }
      session.accessToken = token.accessToken;
      return session;
    }
  }
};

export default NextAuth(authOptions);
