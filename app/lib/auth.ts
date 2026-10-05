import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authorisePupil } from "./pupilAuth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),

    /* A child signs in with a profile id and three pictures, never an email
       and never a typed password.

       Separate from the provider above on purpose: pupil accounts carry
       synthetic addresses, and nothing should be able to reach one by
       guessing an email. Nothing here puts an address into the browser
       either, so a class code cannot be turned into a list of logins.

       The first sign-in for a pupil CLAIMS the account by setting the
       pictures, which is why this provider writes. app/lib/pupilAuth.ts says
       why that is the right trade at this age and what mitigates it. */
    Credentials({
      id: "pupil",
      name: "pupil",
      credentials: {
        childProfileId: { label: "Pupil", type: "text" },
        sequence: { label: "Pictures", type: "text" },
      },
      async authorize(credentials) {
        const id = credentials?.childProfileId;
        const raw = credentials?.sequence;
        if (typeof id !== "string" || typeof raw !== "string") return null;

        let sequence: unknown;
        try {
          sequence = JSON.parse(raw);
        } catch {
          return null;
        }

        const res = await authorisePupil(id, sequence);
        if (!res.ok) return null;
        /* No email on the session: a pupil has none worth carrying, and the
           synthetic one should not travel to the browser. */
        return { id: res.userId, name: res.name };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.sub = user.id;
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: { ...session.user, id: token.sub },
    }),
  },
});