export const getResourceEndpoint = (resource: string): string => {
  const resourceMappings: { [key: string]: string } = {



    persons: "person",
    "plant-types": "plant-type",
    "event-parties": "event-party",
    "object-profiles": "object-profile",
    "parameter-types": "parameter-type",
    "plants": "plants",
    "roles": "role",
  "objects": "object",
};

  return resourceMappings[resource] || resource;
};
