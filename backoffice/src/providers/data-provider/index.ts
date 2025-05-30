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
  if (!refreshToken) return false;

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
    return true;
  } catch {
    return false;
  }
};

const handleResponse = async (response: Response, retry: () => Promise<any>) => {
  if (response.status === 401) {
    const refreshed = await handleAuthError();
    if (refreshed) {
      return retry();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Authentication required");
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
};

export const dataProvider = dataProviderSimpleRest(API_URL);

export const customDataProvider: DataProvider = {
  ...dataProvider,

  getList: async ({ resource, pagination, filters, sorters }) => {
    const endpoint = resource === "persons" ? "person" : resource;
    const response = await fetch(`${API_URL}/${endpoint}`, {
      headers: getHeaders(),
    });

    const data = await handleResponse(response, () => 
      customDataProvider.getList({ resource, pagination, filters, sorters })
    );

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
    const endpoint = resource === "persons" ? "person" : resource;
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      headers: getHeaders(),
    });

    const data = await handleResponse(response, () => 
      customDataProvider.getOne({ resource, id })
    );

    return { data };
  },

  create: async ({ resource, variables }) => {
    const endpoint = resource === "persons" ? "person" : resource;
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(variables),
    });

    const data = await handleResponse(response, () => 
      customDataProvider.create({ resource, variables })
    );

    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const endpoint = resource === "persons" ? "person" : resource;
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(variables),
    });

    const data = await handleResponse(response, () => 
      customDataProvider.update({ resource, id, variables })
    );

    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const endpoint = resource === "persons" ? "person" : resource;
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    await handleResponse(response, () => 
      customDataProvider.deleteOne({ resource, id })
    );

    return { data: { idPerson: id } as any };
  },
};