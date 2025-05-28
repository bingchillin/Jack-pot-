"use client";

import { DataProvider } from "@refinedev/core";
import dataProviderSimpleRest from "@refinedev/simple-rest";


const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const dataProvider = dataProviderSimpleRest(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api");

export const customDataProvider: DataProvider = {
  ...dataProvider,

  getOne: async ({ resource, id }) => {
    if (resource === "persons") {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/person/${id}`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      return { data };
    }
    return dataProvider.getOne({ resource, id });
  },

  create: async ({ resource, variables }) => {
    if (resource === "persons") {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/person`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(variables),
      });
      const data = await response.json();
      return { data };
    }
    return dataProvider.create({ resource, variables });
  },

  update: async ({ resource, id, variables }) => {
    if (resource === "persons") {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/person/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(variables),
      });
      const data = await response.json();
      return { data };
    }
    return dataProvider.update({ resource, id, variables });
  },

  deleteOne: async ({ resource, id }) => {
    if (resource === "persons") {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/person/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (response.status === 200) {
        return { data: {} };
      }
      const data = await response.json();
      return { data };
    }
    return dataProvider.deleteOne({ resource, id });
  },
};