-- BLANE Database Schema Initialization
-- Based on DOST-FNRI PhilFCT and Tarlac City market needs.

-- Enable Row-Level Security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    age INT CHECK (age > 0),
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    height_cm DECIMAL(5,2) CHECK (height_cm > 0),
    activity_factor DECIMAL(4,3) DEFAULT 1.375 CHECK (activity_factor >= 1.2 AND activity_factor <= 2.5),
    daily_budget_php DECIMAL(10,2) DEFAULT 300.00,
    dietary_restrictions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update their own profile" 
    ON public.profiles 
    FOR ALL 
    USING (auth.uid() = id);

-- 2. Daily Health Metrics (Body Feedback Loop)
CREATE TABLE public.daily_metrics (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE DEFAULT CURRENT_DATE NOT NULL,
    weight_kg DECIMAL(5,2) CHECK (weight_kg > 0),
    active_calories_kcal INT DEFAULT 0 CHECK (active_calories_kcal >= 0),
    sleep_hours DECIMAL(4,2) CHECK (sleep_hours >= 0),
    water_ml INT DEFAULT 0 CHECK (water_ml >= 0),
    calculated_bmi DECIMAL(4,2),
    calculated_tdee INT,
    daily_calorie_target INT,
    health_score INT CHECK (health_score >= 0 AND health_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, log_date)
);

-- Enable RLS for Daily Metrics
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and edit their own metrics"
    ON public.daily_metrics
    FOR ALL
    USING (auth.uid() = profile_id);

-- 3. Recipes Table (PhilFCT data)
CREATE TABLE public.recipes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    calories_kcal INT NOT NULL CHECK (calories_kcal >= 0),
    protein_g DECIMAL(5,2) DEFAULT 0 CHECK (protein_g >= 0),
    fat_g DECIMAL(5,2) DEFAULT 0 CHECK (fat_g >= 0),
    carbs_g DECIMAL(5,2) DEFAULT 0 CHECK (carbs_g >= 0),
    allergens TEXT[] DEFAULT '{}',
    category TEXT CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snack')),
    source_db TEXT DEFAULT 'PhilFCT',
    base_cost_php DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Recipes (Public Read-Only, Authenticated Write)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to recipes" ON public.recipes FOR SELECT USING (true);

-- 4. Markets Table (Tarlac City Coordinates)
CREATE TABLE public.markets (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Markets
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to markets" ON public.markets FOR SELECT USING (true);

-- 5. Market Inventory & Pricing Matrix (GeoMarket Scanner)
CREATE TABLE public.market_inventory (
    id BIGSERIAL PRIMARY KEY,
    market_id BIGINT NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    price_php DECIMAL(10,2) NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    seasonality_months INT[] DEFAULT '{1,2,3,4,5,6,7,8,9,10,11,12}', -- Month indices (1-12)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Market Inventory
ALTER TABLE public.market_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to inventory" ON public.market_inventory FOR SELECT USING (true);
