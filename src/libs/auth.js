import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

function resolveLoginBase() {
  if (process.env.API_URL) {
    // API_URL is http://crmserver:8000/api
    return process.env.API_URL.replace(/\/$/, "");
  }
  if (process.env.BACKEND_API_URL) {
    return `${process.env.BACKEND_API_URL.replace(/\/$/, "")}/api`;
  }
  return `${process.env.NEXT_PUBLIC_API_URL}/api`;
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        handoffToken: { label: "Handoff Token", type: "text" }
      },
      async authorize(credentials) {
        const base = resolveLoginBase();

        try {
          if (credentials?.handoffToken) {
            const res = await fetch(`${base}/login-impersonation`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ handoffToken: credentials.handoffToken })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.token) {
              throw new Error(data.message || "Invalid impersonation handoff");
            }
            return {
              ...data,
              role: data.user.role || "guest",
              Stoken: data.token,
              impersonation: data.impersonation || true
            };
          }

          const { email, password } = credentials || {};
          const loginUrl = `${base}/login`;

          const res = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          const data = await res.json().catch(() => ({}));

          if (res.status === 401) throw new Error("Invalid email or password");

          if (res.status === 200 && data.token) {
            return {
              ...data,
              role: data.user.role || "guest",
              Stoken: data.token
            };
          }

          console.error("[auth] login failed", res.status, data);
          return null;
        } catch (e) {
          console.error("[auth] login error", e.message);
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
      if (user) {
        token.name = user.user.name;
        token.id = user.user.id;
        token.email = user.user.email;
        token.role = user.role;
        token.accessToken = user.Stoken;
        token.isEmailVerified = user.user.isEmailVerified;
        token.company = user.user.companyId;
        token.plan = user.user.plan;
        token.impersonation = user.impersonation || null;
      }

      if (trigger === "update" && session) {
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
          if (session.user.enabledModules) {
            token.enabledModules = session.user.enabledModules;
          }
          if (session.user.planModules) {
            token.planModules = session.user.planModules;
          }
        }
        if (session.accessToken) token.accessToken = session.accessToken;
      }

      if (user?.workspace?.enabledModules?.length) {
        token.enabledModules = user.workspace.enabledModules;
        token.enabledProducts = user.workspace.enabledModules;
      }
      if (user?.workspace?.planModules?.length) {
        token.planModules = user.workspace.planModules;
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
        session.user.enabledModules = token.enabledModules;
        session.user.planModules = token.planModules;
        session.user.impersonation = token.impersonation;
      }
      session.accessToken = token.accessToken;
      return session;
    }
  }
};

export default NextAuth(authOptions);
