-- Add optimal range fields to plant_type table for plant-specific scoring
-- These fields will store the optimal ranges for each sensor type

ALTER TABLE plant_type 
ADD COLUMN IF NOT EXISTS optimal_moisture_min numeric(5, 2),
ADD COLUMN IF NOT EXISTS optimal_moisture_max numeric(5, 2),
ADD COLUMN IF NOT EXISTS optimal_temperature_min numeric(5, 2),
ADD COLUMN IF NOT EXISTS optimal_temperature_max numeric(5, 2),
ADD COLUMN IF NOT EXISTS optimal_light_min numeric(5, 2),
ADD COLUMN IF NOT EXISTS optimal_light_max numeric(5, 2);

-- Add comments to explain the fields
COMMENT ON COLUMN plant_type.optimal_moisture_min IS 'Minimum optimal moisture level for this plant type (percentage)';
COMMENT ON COLUMN plant_type.optimal_moisture_max IS 'Maximum optimal moisture level for this plant type (percentage)';
COMMENT ON COLUMN plant_type.optimal_temperature_min IS 'Minimum optimal temperature for this plant type (celsius)';
COMMENT ON COLUMN plant_type.optimal_temperature_max IS 'Maximum optimal temperature for this plant type (celsius)';
COMMENT ON COLUMN plant_type.optimal_light_min IS 'Minimum optimal light level for this plant type (lux or percentage)';
COMMENT ON COLUMN plant_type.optimal_light_max IS 'Maximum optimal light level for this plant type (lux or percentage)';

-- Update existing plant types with example data
-- Lavender (Mediterranean plant)
UPDATE plant_type 
SET 
    optimal_moisture_min = 30.0,
    optimal_moisture_max = 40.0,
    optimal_temperature_min = 15.0,
    optimal_temperature_max = 24.0,
    optimal_light_min = 60.0,
    optimal_light_max = 80.0
WHERE title = 'Lavender' OR id_plant_type = 1;

-- Add more plant types with their optimal ranges
INSERT INTO plant_type (
    title, 
    description, 
    advise, 
    scientist_name, 
    family_name, 
    type_name, 
    exposition_type, 
    ground_type,
    optimal_moisture_min,
    optimal_moisture_max,
    optimal_temperature_min,
    optimal_temperature_max,
    optimal_light_min,
    optimal_light_max,
    ph_min,
    ph_max
) VALUES 
-- Lavender (if not exists)
('Lavender', 'Mediterranean herb with fragrant purple flowers. Drought-tolerant and loves full sun.', 'Plant in well-draining soil, water sparingly, and provide full sunlight. Prune after flowering to maintain shape.', 'Lavandula', 'Lamiaceae', 'Herb', 'Full Sun', 'Well-draining, sandy', 30.0, 40.0, 15.0, 24.0, 60.0, 80.0, 6.5, 7.5),

-- Monstera (Tropical plant)
('Monstera', 'Tropical plant with distinctive split leaves. Popular houseplant that thrives in humid conditions.', 'Keep soil consistently moist but not soggy, provide bright indirect light, and maintain high humidity.', 'Monstera deliciosa', 'Araceae', 'Tropical', 'Indirect Light', 'Rich, well-draining', 60.0, 80.0, 18.0, 29.0, 20.0, 40.0, 5.5, 6.5),

-- Snake Plant (Succulent)
('Snake Plant', 'Hardy succulent with upright sword-like leaves. Very low maintenance and drought-tolerant.', 'Water sparingly, allow soil to dry between waterings, and provide bright indirect light. Tolerates low light.', 'Sansevieria trifasciata', 'Asparagaceae', 'Succulent', 'Low to Bright', 'Well-draining, sandy', 20.0, 40.0, 15.0, 30.0, 10.0, 60.0, 6.0, 7.0),

-- Peace Lily (Tropical)
('Peace Lily', 'Tropical plant with white flowers and glossy leaves. Excellent air purifier and humidity indicator.', 'Keep soil consistently moist, provide bright indirect light, and maintain high humidity. Leaves droop when thirsty.', 'Spathiphyllum', 'Araceae', 'Tropical', 'Indirect Light', 'Rich, moisture-retaining', 70.0, 90.0, 18.0, 27.0, 30.0, 60.0, 5.5, 6.5),

-- Cactus (Desert)
('Cactus', 'Desert plant adapted to arid conditions. Stores water in its thick stems and requires minimal care.', 'Water very sparingly, provide full sun, and use well-draining soil. Allow soil to completely dry between waterings.', 'Cactaceae', 'Cactaceae', 'Desert', 'Full Sun', 'Sandy, well-draining', 10.0, 30.0, 20.0, 35.0, 70.0, 90.0, 6.0, 7.5)

ON CONFLICT (title) DO NOTHING; 