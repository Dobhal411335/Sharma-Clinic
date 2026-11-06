export type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
export type SiteCode = "IN" | "COM";
export type SiteRole = "VIEWER" | "EDITOR" | "ADMIN" | "SUPER_ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
}

export interface AuthSite {
  id: string;
  code: SiteCode;
  name: string;
  role: SiteRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthMe {
  user: AuthUser;
  sites: AuthSite[];
}
