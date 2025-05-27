"use client";

import { DataProvider } from "@refinedev/core";
import dataProviderSimpleRest from "@refinedev/simple-rest";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
//const API_URL = "https://api.fake-rest.refine.dev";

export const dataProvider = dataProviderSimpleRest(API_URL);

export const customDataProvider: DataProvider = {
    ...dataProvider,
  
    getOne: async ({ resource, id }) => {
      if (resource === "persons") {
        const response = await fetch(`${API_URL}/person/${id}`);
        const data = await response.json();
        return { data };
      }
      return dataProvider.getOne({ resource, id });
    },
  
    create: async ({ resource, variables }) => {
      if (resource === "persons") {
        const response = await fetch(`${API_URL}/person`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
        });
        const data = await response.json();
        return { data };
      }
      return dataProvider.create({ resource, variables });
    },
  
    update: async ({ resource, id, variables }) => {
      if (resource === "persons") {
        const response = await fetch(`${API_URL}/person/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
        });
        const data = await response.json();
        return { data };
      }
      return dataProvider.update({ resource, id, variables });
    },
  
    deleteOne: async ({ resource, id }) => {
      if (resource === "persons") {
        const response = await fetch(`${API_URL}/person/${id}`, {
          method: "DELETE",
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