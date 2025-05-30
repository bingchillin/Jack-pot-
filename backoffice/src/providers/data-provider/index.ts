"use client";

import { DataProvider } from "@refinedev/core";
import dataProviderSimpleRest from "@refinedev/simple-rest";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleAuthError = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (refreshToken) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
  }
  return false;
};

export const dataProvider = dataProviderSimpleRest(API_URL);

export const customDataProvider: DataProvider = {
  ...dataProvider,

  getList: async ({ resource, pagination, filters, sorters }) => {
    // Handle special cases for non-RESTful endpoints
    if (resource === "persons") {
      const response = await fetch(`${API_URL}/person`, {
        headers: getHeaders(),
      });

      if (response.status === 401) {
        const refreshed = await handleAuthError();
        if (refreshed) {
          return customDataProvider.getList({ resource, pagination, filters, sorters });
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Authentication required");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch ${resource}`);
      }

      const responseData = await response.json();
      const data = Array.isArray(responseData) ? responseData : responseData.data || [];
      
      // Sort data by ID if no sorters are provided
      if (!sorters || sorters.length === 0) {
        data.sort((a: { idPerson: number }, b: { idPerson: number }) => a.idPerson - b.idPerson);
      }
      
      return {
        data,
        total: data.length,
      };
    }

    // Handle other resources
    const response = await fetch(`${API_URL}/${resource}`, {
      headers: getHeaders(),
    });

    if (response.status === 401) {
      const refreshed = await handleAuthError();
      if (refreshed) {
        return customDataProvider.getList({ resource, pagination, filters, sorters });
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource}`);
    }

    const responseData = await response.json();
    const data = Array.isArray(responseData) ? responseData : responseData.data || [];
    
    // Sort data by ID if no sorters are provided
    if (!sorters || sorters.length === 0) {
      data.sort((a: { idPerson: number }, b: { idPerson: number }) => a.idPerson - b.idPerson);
    }
    
    return {
      data,
      total: data.length,
    };
  },

  getOne: async ({ resource, id }) => {
    // Handle special cases for non-RESTful endpoints
    const endpoint = resource === "persons" ? "person" : resource;
    
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      headers: getHeaders(),
    });

    if (response.status === 401) {
      const refreshed = await handleAuthError();
      if (refreshed) {
        return customDataProvider.getOne({ resource, id });
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource}/${id}`);
    }

    const responseData = await response.json();
    const data = responseData.data || responseData;
    return { data };
  },

  create: async ({ resource, variables }) => {
    // Handle special cases for non-RESTful endpoints
    const endpoint = resource === "persons" ? "person" : resource;
    
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(variables),
    });

    if (response.status === 401) {
      const refreshed = await handleAuthError();
      if (refreshed) {
        return customDataProvider.create({ resource, variables });
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      throw new Error(`Failed to create ${resource}`);
    }

    const responseData = await response.json();
    const data = responseData.data || responseData;
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    // Handle special cases for non-RESTful endpoints
    const endpoint = resource === "persons" ? "person" : resource;
    
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(variables),
    });

    if (response.status === 401) {
      const refreshed = await handleAuthError();
      if (refreshed) {
        return customDataProvider.update({ resource, id, variables });
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      throw new Error(`Failed to update ${resource}/${id}`);
    }

    const responseData = await response.json();
    const data = responseData.data || responseData;
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    // Handle special cases for non-RESTful endpoints
    const endpoint = resource === "persons" ? "person" : resource;
    
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (response.status === 401) {
      const refreshed = await handleAuthError();
      if (refreshed) {
        return customDataProvider.deleteOne({ resource, id });
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      throw new Error(`Failed to delete ${resource}/${id}`);
    }

    // Return the deleted item's data
    return { data: { idPerson: id } as any };
  },
};