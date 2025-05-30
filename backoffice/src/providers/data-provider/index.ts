"use client";

import { DataProvider } from "@refinedev/core";
import dataProviderSimpleRest from "@refinedev/simple-rest";
import { getResourceEndpoint } from "../../utils/api/endpoints";
import { getHeaders, handleResponse } from "../../utils/api/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const dataProvider = dataProviderSimpleRest(API_URL);

export const customDataProvider: DataProvider = {
  ...dataProvider,

  getList: async ({ resource, pagination, filters, sorters }) => {
    const endpoint = getResourceEndpoint(resource);
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
    const endpoint = getResourceEndpoint(resource);
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      headers: getHeaders(),
    });

    const data = await handleResponse(response, () => 
      customDataProvider.getOne({ resource, id })
    );

    // Handle different response structures
    const result = data.data || data;
    return { data: result };
  },

  create: async ({ resource, variables }) => {
    const endpoint = getResourceEndpoint(resource);
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
    const endpoint = getResourceEndpoint(resource);
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
    const endpoint = getResourceEndpoint(resource);
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