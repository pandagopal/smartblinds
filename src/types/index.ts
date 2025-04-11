// Define user roles for the application
export type UserRole = "customer" | "vendor" | "itops" | "admin";

// Define user structure with role
export interface User {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// User session with role
export interface UserSession {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
}

// Session type
export interface Session {
  user?: UserSession;
  expires: string;
}
