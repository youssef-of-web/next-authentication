import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import LinkedinProvider from "next-auth/providers/linkedin";
import InstagramProvider from "next-auth/providers/instagram";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";

import axios from "axios";

export default async function Auth(req, res) {
  const providers = [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "text", placeholder: "youssef@live.fr" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const user = await axios
          .post("http://localhost:5500/api/login", credentials)
          .then((res) => res.data);

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    LinkedinProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    InstagramProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // ...add more providers here
  ];
  return NextAuth(req, res, {
    session: {
      strategy: "jwt",
      maxAge: 24 * 60 * 60,
      updateAge: 60 * 60,
    },
    adapter: PrismaAdapter(prisma),
    providers,
    callbacks: {
      async session({ session, user, token }) {
        if (token?.accessToken) {
          session.accessToken = token.accessToken;
        }
        if (token?.profile) {
          session.profile = token.profile;
        }
        return session;
      },
      async jwt({ token, user, account, profile, isNewUser }) {
        if (account?.type === "credentials") {
          token.accessToken = user.token;
        } else {
          if (account) {
            token.accessToken = account.access_token;
          }
          if (profile) {
            token.profile = profile;
          }
        }
        return token;
      },
    },
  });
}
