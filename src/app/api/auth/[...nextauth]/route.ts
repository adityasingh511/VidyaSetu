import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { AuthServices } from '@/modules/auth/auth.service';
import { SetCookies } from '@/lib/auth/cookies';

// 1. WE EXPORT THE OPTIONS SO OTHER FILES CAN SEE THEM
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider !== 'google' || !user.email) {
        return false;
      }

      try {
        const result = await AuthServices.handleGoogleService({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          providerAccountId: account!.providerAccountId,
        });

        await SetCookies.setAuthCookies(
          result.accessToken,
          result.refreshToken,
        );

        return true;
      } catch (error) {
        return false;
      }
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  }
};

// 2. WE PASS THOSE OPTIONS TO NEXTAUTH
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };