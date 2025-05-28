"use client";

import type { AuthProvider } from "@refinedev/core";

const ADMIN_ROLE_ID = 1; // Assuming 1 is the admin role ID

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const authProviderClient: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      // Check if user is admin
      if (data.user.idRole !== ADMIN_ROLE_ID) {
        return {
          success: false,
          error: {
            name: "UnauthorizedError",
            message: "You don't have permission to access the backoffice",
          },
        };
      }

      // Store the complete auth data
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return {
        success: true,
        redirectTo: "/persons",
      };
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
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refresh_token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    try {
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Try to refresh the token
        if (refreshToken) {
          const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
          } else {
            // If refresh fails, logout
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            return {
              authenticated: false,
              redirectTo: "/login",
            };
          }
        } else {
          // No refresh token available, logout
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return {
            authenticated: false,
            redirectTo: "/login",
          };
        }
      }

      const parsedUser = JSON.parse(user);
      
      // Check if user is admin
      if (parsedUser.idRole !== ADMIN_ROLE_ID) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        return {
          authenticated: false,
          redirectTo: "/login",
          error: {
            name: "UnauthorizedError",
            message: "You don't have permission to access the backoffice",
          },
        };
      }

      // Verify token by making a request to a protected endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return {
          authenticated: true,
        };
      }

      // If token is invalid, clear storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    const parsedUser = JSON.parse(user);
    return parsedUser.idRole;
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    return JSON.parse(user);
  },

  onError: async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token on 401
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            return { error: null }; // Retry the failed request
          }
        } catch {
          // If refresh fails, logout
        }
      }

      // If no refresh token or refresh failed, logout
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      return {
        logout: true,
        redirectTo: "/login",
      };
    }

    return { error };
  },
};
