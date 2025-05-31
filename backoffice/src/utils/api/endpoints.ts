export const getResourceEndpoint = (resource: string): string => {
  const resourceMappings: { [key: string]: string } = {
    persons: "person",
    "plant-types": "plant-type",
    "event-parties": "event-party",
    "object-profiles": "object-profile",
    "parameter-types": "parameter-type",
};

  return resourceMappings[resource] || resource;
};
