import type { NextAuthOptions } from "next-auth";

import { logger } from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  providers: [],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  events: {
    async signIn({ user }) {
      // Never log emails, tokens, or credentials.
      logger.info("Staff sign-in event", {
        module: "auth",
        function: "events.signIn",
        userId: user.id,
      });
    },
    async signOut({ token }) {
      logger.info("Staff sign-out event", {
        module: "auth",
        function: "events.signOut",
        userId: typeof token?.sub === "string" ? token.sub : undefined,
      });
    },
  },
  logger: {
    error(code, metadata) {
      logger.error("Auth.js error", {
        module: "auth",
        errorCode: String(code),
        meta: {
          // Auth.js metadata can contain sensitive fields — keep high-level only.
          hasMetadata: metadata != null,
        },
      });
    },
    warn(code) {
      logger.warn("Auth.js warning", {
        module: "auth",
        errorCode: String(code),
      });
    },
    debug(code, metadata) {
      logger.debug("Auth.js debug", {
        module: "auth",
        errorCode: String(code),
        meta: { hasMetadata: metadata != null },
      });
    },
  },
};
