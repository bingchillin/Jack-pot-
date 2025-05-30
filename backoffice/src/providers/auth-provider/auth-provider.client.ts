"use client";

import type { AuthProvider } from "@refinedev/core";

const ADMIN_ROLE_ID = 1;

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

const refreshToken = async (refreshToken: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    document.cookie = `token=${data.access_token}; path=/`;
    return true;
  } catch {
    return false;
  }
};

// Check auth state and redirect if needed
const checkAuth = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user || isTokenExpired(token)) {
    clearAuthData();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return false;
  }
  return true;
};

// Initialize auth check
if (typeof window !== "undefined") {
  checkAuth();
  setInterval(checkAuth, 60000);
}

export const authProviderClient: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: data.message || "Invalid credentials",
          },
        };
      }

      if (data.user.idRole !== ADMIN_ROLE_ID) {
        return {
          success: false,
          error: {
            name: "UnauthorizedError",
            message: "You don't have permission to access the backoffice",
          },
        };
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `token=${data.access_token}; path=/`;
      document.cookie = `user=${JSON.stringify(data.user)}; path=/`;
      
      return { success: true, redirectTo: "/persons" };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Something went wrong",
        },
      };
    }
  },

  logout: async () => {
    clearAuthData();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refresh_token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      return { authenticated: false, redirectTo: "/login" };
    }

    try {
      if (isTokenExpired(token)) {
        if (refreshToken && await refreshToken(refreshToken)) {
          return { authenticated: true };
        }
        clearAuthData();
        return { authenticated: false, redirectTo: "/login" };
      }

      const parsedUser = JSON.parse(user);
      if (parsedUser.idRole !== ADMIN_ROLE_ID) {
        clearAuthData();
        return {
          authenticated: false,
          redirectTo: "/login",
          error: {
            name: "UnauthorizedError",
            message: "You don't have permission to access the backoffice",
          },
        };
      }

      return { authenticated: true };
    } catch (error) {
      clearAuthData();
      return { authenticated: false, redirectTo: "/login" };
    }
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    return JSON.parse(user).idRole;
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    return JSON.parse(user);
  },

  onError: async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken && await refreshToken(refreshToken)) {
        return { error: null };
      }
      clearAuthData();
      return { logout: true, redirectTo: "/login" };
    }
    return { error };
  },
};
