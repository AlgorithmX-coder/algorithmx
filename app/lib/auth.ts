import NextAuth, { CredentialsSignin } from "next-auth";
import { clientIp, loginAllowed, loginFailed } from "./rateLimit";
import { LOGIN_LIMITED_CODE, PUPIL_LOCKED_CODE } from "./rateLimitWords";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authorisePupil } from "./pupilAuth";
import { findUserByEmail } from "./emailIdentity";

/* A refusal the sign-in form can tell apart from a wrong password: NextAuth
   returns `code` from signIn() to the browser. */
class LoginLimited extends CredentialsSignin {
  code = LOGIN_LIMITED_CODE;
}
class PupilLocked extends CredentialsSignin {
  code = PUPIL_LOCKED_CODE;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;
        /* Too many wrong passwords for this address or from this IP: refuse
           before checking, so guessing stops paying. */
        const limitEmail = String(credentials.email).trim().toLowerCase();
        const ip = clientIp(request);
        if (!(await loginAllowed(limitEmail, ip)).ok) throw new LoginLimited();

        /* Case-insensitive: "Me@x.com" and "me@x.com" are one person. */
        const user = await findUserByEmail(credentials.email);

        if (!user || !user.hashedPassword) {
          await loginFailed(limitEmail, ip);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) {
          await loginFailed(limitEmail, ip);
          return null;
        }

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
      async authorize(credentials, request) {
        const id = credentials?.childProfileId;
        const raw = credentials?.sequence;
        if (typeof id !== "string" || typeof raw !== "string") return null;

        let sequence: unknown;
        try {
          sequence = JSON.parse(raw);
        } catch {
          return null;
        }

        const res = await authorisePupil(id, sequence, clientIp(request));
        if (!res.ok && res.reason === "locked") throw new PupilLocked();
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