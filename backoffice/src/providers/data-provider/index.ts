"use client";

import { DataProvider } from "@refinedev/core";
import dataProviderSimpleRest from "@refinedev/simple-rest";
import { getResourceEndpoint } from "../../utils/api/endpoints";
import { getHeaders, handleResponse } from "../../utils/api/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const dataProvider = dataProviderSimpleRest(API_URL);

// Define the contact status update type
interface ContactStatusUpdate {
  status: 'accepted' | 'rejected' | 'blocked' | 'pending' | 'unblocked';
}

// Type guard to check if an object has a status property
function isContactStatusUpdate(obj: unknown): obj is ContactStatusUpdate {
  return typeof obj === 'object' && obj !== null && 'status' in obj;
}

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

    // Handle contacts resource which returns { data, total }
    if (resource === 'contacts') {
      return {
        data: data.data || [],
        total: data.total || 0,
      };
    }

    // Always sort roles by ID
    if (resource === 'roles') {
      data.sort((a: any, b: any) => a.idRole - b.idRole);
    }
    // Sort other resources by ID if no sorters are provided
    else if (!sorters || sorters.length === 0) {
      data.sort((a: any, b: any) => {
        // Handle different ID field names
        const idA = a.idPerson || a.idPlantType || 0;
        const idB = b.idPerson || b.idPlantType || 0;
        return idA - idB;
      });
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
    // Special handling for contact status updates
    if (resource === 'contacts' && isContactStatusUpdate(variables)) {
      const endpoint = getResourceEndpoint(resource);
      let actionEndpoint = '';
      
      switch (variables.status) {
        case 'accepted':
          actionEndpoint = `${endpoint}/${id}/accept`;
          break;
        case 'rejected':
          actionEndpoint = `${endpoint}/${id}/reject`;
          break;
        case 'blocked':
          actionEndpoint = `${endpoint}/${id}/block`;
          break;
        case 'unblocked':
          actionEndpoint = `${endpoint}/${id}/unblock`;
          break;
        default:
          // For other updates, use the standard PATCH endpoint
          actionEndpoint = `${endpoint}/${id}`;
      }

      const response = await fetch(`${API_URL}/${actionEndpoint}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(variables),
      });

      const data = await handleResponse(response, () => 
        customDataProvider.update({ resource, id, variables })
      );

      return { data };
    }

    // Default update behavior for other resources
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

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // For DELETE requests, we don't need to parse the response
    // Just return the deleted ID
    return { data: { id } as any };
  },
};