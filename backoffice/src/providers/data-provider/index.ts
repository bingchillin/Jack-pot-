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

export const dataProvider = dataProviderSimpleRest(API_URL);

export const customDataProvider: DataProvider = {
  ...dataProvider,

  getList: async ({ resource, pagination, filters, sorters }) => {
    if (resource === "persons") {
      const response = await fetch(`${API_URL}/person`, {
        headers: getHeaders(),
      });
      const responseData = await response.json();

      // Handle both array and object response formats
      const data = Array.isArray(responseData) ? responseData : responseData.data || [];
      
      return {
        data,
        total: data.length,
      };
    }
    return dataProvider.getList({ resource, pagination, filters, sorters });
  },

  getOne: async ({ resource, id }) => {
    if (resource === "persons") {
      const response = await fetch(`${API_URL}/person/${id}`, {
        headers: getHeaders(),
      });
      const responseData = await response.json();
      
      // Handle both direct object and nested data response
      const data = responseData.data || responseData;
      return { data };
    }
    return dataProvider.getOne({ resource, id });
  },

  create: async ({ resource, variables }) => {
    if (resource === "persons") {
      const response = await fetch(`${API_URL}/person`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(variables),
      });
      const responseData = await response.json();
      
      // Handle both direct object and nested data response
      const data = responseData.data || responseData;
      return { data };
    }
    return dataProvider.create({ resource, variables });
  },

  update: async ({ resource, id, variables }) => {
    if (resource === "persons") {
      const response = await fetch(`${API_URL}/person/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(variables),
      });
      const responseData = await response.json();
      
      // Handle both direct object and nested data response
      const data = responseData.data || responseData;
      return { data };
    }
    return dataProvider.update({ resource, id, variables });
  },

  deleteOne: async ({ resource, id }) => {
    if (resource === "persons") {
      const response = await fetch(`${API_URL}/person/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (response.status === 200) {
        return { data: {} };
      }
      const responseData = await response.json();
      
      // Handle both direct object and nested data response
      const data = responseData.data || responseData;
      return { data };
    }
    return dataProvider.deleteOne({ resource, id });
  },
};