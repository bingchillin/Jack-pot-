import type { AuthProvider } from "@refinedev/core";
import { cookies } from "next/headers";

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const authProviderServer: Pick<AuthProvider, "check"> = {
  check: async () => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const user = cookieStore.get("user")?.value;

    if (!token || !user) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    try {
      // Check if token is expired
      if (isTokenExpired(token)) {
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }

      const parsedUser = JSON.parse(user);
      
      // Check if user is admin
      if (parsedUser.idRole !== 1) {
        return {
          authenticated: false,
          redirectTo: "/login",
          error: {
            name: "UnauthorizedError",
            message: "You don't have permission to access the backoffice",
          },
        };
      }

      return {
        authenticated: true,
      };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },
};
