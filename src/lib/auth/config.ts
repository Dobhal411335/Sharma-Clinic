import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};
