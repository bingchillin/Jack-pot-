-- Test Plant Care Scores for Automatic Scoring System
-- This script inserts test data to verify the automatic scoring works correctly

-- Insert test scores for the last few days to simulate a week of data
-- Replace '1' with actual plant IDs from your object_profile table

-- 7 days ago (for weekly calculation baseline)
INSERT INTO plant_care_score (
    id_object_profile,
    score_date,
    daily_score,
    weekly_score,
    moisture_score,
    temperature_score,
    light_score,
    ph_score,
    consistency_bonus,
    improvement_bonus,
    daily_message,
    weekly_message,
    sensor_data,
    is_perfect_day,
    is_perfect_week,
    created_at,
    updated_at
) VALUES (
    1, -- Replace with actual plant ID
    CURRENT_DATE - INTERVAL '7 days',
    22,
    150,
    8,  -- Good moisture score
    7,  -- Good temperature score
    5,  -- Good light score
    3,  -- Good pH score
    1,  -- Consistency bonus
    0,  -- No improvement bonus
    'Great job! Keep up the good work!',
    'Great week! Your consistency is impressive!',
    '{"moisture": 68.0, "temperature": 21.5, "light": 62.0, "ph": 6.3}',
    false,
    false,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
);

-- 6 days ago
INSERT INTO plant_care_score (
    id_object_profile,
    score_date,
    daily_score,
    weekly_score,
    moisture_score,
    temperature_score,
    light_score,
    ph_score,
    consistency_bonus,
    improvement_bonus,
    daily_message,
    weekly_message,
    sensor_data,
    is_perfect_day,
    is_perfect_week,
    created_at,
    updated_at
) VALUES (
    1, -- Replace with actual plant ID
    CURRENT_DATE - INTERVAL '6 days',
    24,
    160,
    9,  -- Very good moisture score
    8,  -- Perfect temperature score
    5,  -- Good light score
    3,  -- Good pH score
    1,  -- Consistency bonus
    1,  -- Improvement bonus
    'Great job! Keep up the good work!',
    'Great week! Your consistency is impressive!',
    '{"moisture": 72.0, "temperature": 23.0, "light": 58.0, "ph": 6.1}',
    false,
    false,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
);

-- 5 days ago
INSERT INTO plant_care_score (
    id_object_profile,
    score_date,
    daily_score,
    weekly_score,
    moisture_score,
    temperature_score,
    light_score,
    ph_score,
    consistency_bonus,
    improvement_bonus,
    daily_message,
    weekly_message,
    sensor_data,
    is_perfect_day,
    is_perfect_week,
    created_at,
    updated_at
) VALUES (
    1, -- Replace with actual plant ID
    CURRENT_DATE - INTERVAL '5 days',
    26,
    170,
    10, -- Perfect moisture score
    8,  -- Perfect temperature score
    6,  -- Perfect light score
    3,  -- Good pH score
    2,  -- Consistency bonus
    1,  -- Improvement bonus
    'Excellent! Your plant care is outstanding!',
    'Outstanding week! You''re a plant care master!',
    '{"moisture": 75.0, "temperature": 24.0, "light": 65.0, "ph": 6.5}',
    true,
    false,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
);

-- 4 days ago
INSERT INTO plant_care_score (
    id_object_profile,
    score_date,
    daily_score,
    weekly_score,
    moisture_score,
    temperature_score,
    light_score,
    ph_score,
    consistency_bonus,
    improvement_bonus,
    daily_message,
    weekly_message,
    sensor_data,
    is_perfect_day,
    is_perfect_week,
    created_at,
    updated_at
) VALUES (
    1, -- Replace with actual plant ID
    CURRENT_DATE - INTERVAL '4 days',
    25,
    175,
    10, -- Perfect moisture score
    8,  -- Perfect temperature score
    5,  -- Good light score
    4,  -- Perfect pH score
    2,  -- Consistency bonus
    0,  -- No improvement bonus
    'Excellent! Your plant care is outstanding!',
    'Outstanding week! You''re a plant care master!',
    '{"moisture": 73.0, "temperature": 22.5, "light": 60.0, "ph": 6.8}',
    true,
    false,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
);

-- 3 days ago
INSERT INTO plant_care_score (
    id_object_profile,
    score_date,
    daily_score,
    weekly_score,
    moisture_score,
    temperature_score,
    light_score,
    ph_score,
    consistency_bonus,
    improvement_bonus,
    daily_message,
    weekly_message,
    sensor_data,
    is_perfect_day,
    is_perfect_week,
    created_at,
    updated_at
) VALUES (
    1, -- Replace with actual plant ID
    CURRENT_DATE - INTERVAL '3 days',
    27,
    180,
    10, -- Perfect moisture score
    8,  -- Perfect temperature score
    6,  -- Perfect light score
    4,  -- Perfect pH score
    2,  -- Consistency bonus
    1,  -- Improvement bonus
    'Excellent! Your plant care is outstanding!',
    'Outstanding week! You''re a plant care master!',
    '{"moisture": 76.0, "temperature": 24.5, "light": 68.0, "ph": 6.9}',
    true,
    false,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
);

-- 2 days ago
INSERT INTO plant_care_score (
    id_object_profile,
    score_date,
    daily_score,
    weekly_score,
    moisture_score,
    temperature_score,
    light_score,
    ph_score,
    consistency_bonus,
    improvement_bonus,
    daily_message,
    weekly_message,
    sensor_data,
    is_perfect_day,
    is_perfect_week,
    created_at,
    updated_at
) VALUES (
    1, -- Replace with actual plant ID
    CURRENT_DATE - INTERVAL '2 days',
    28,
    185,
    10, -- Perfect moisture score
    8,  -- Perfect temperature score
    6,  -- Perfect light score
    4,  -- Perfect pH score
    2,  -- Consistency bonus
    2,  -- Improvement bonus
    'Excellent! Your plant care is outstanding!',
    'Outstanding week! You''re a plant care master!',
    '{"moisture": 77.0, "temperature": 25.0, "light": 70.0, "ph": 7.0}',
    true,
    false,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
);

-- Yesterday (for today's comparison)
INSERT INTO plant_care_score (
    id_object_profile,
    score_date,
    daily_score,
    weekly_score,
    moisture_score,
    temperature_score,
    light_score,
    ph_score,
    consistency_bonus,
    improvement_bonus,
    daily_message,
    weekly_message,
    sensor_data,
    is_perfect_day,
    is_perfect_week,
    created_at,
    updated_at
) VALUES (
    1, -- Replace with actual plant ID
    CURRENT_DATE - INTERVAL '1 day',
    25,
    190,
    10, -- Perfect moisture score
    8,  -- Perfect temperature score
    5,  -- Good light score
    4,  -- Perfect pH score
    2,  -- Consistency bonus
    1,  -- Improvement bonus
    'Excellent! Your plant care is outstanding!',
    'Outstanding week! You''re a plant care master!',
    '{"moisture": 72.5, "temperature": 23.2, "light": 65.8, "ph": 6.4}',
    true,
    false,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
);

-- Note: Today's score will be automatically calculated and inserted by the system
-- when you trigger the daily scoring service or when the app starts

-- To test the system:
-- 1. Run this SQL script to insert historical data
-- 2. Open the app and tap the orange "schedule" button to trigger daily scoring
-- 3. Check the database to see if today's score was automatically created
-- 4. The daily popup should show today's score with yesterday's sensor data for comparison 