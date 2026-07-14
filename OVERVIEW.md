# Project Overview: BLANE

## Purpose
BLANE (Biological Adaptive Nutrition Engine) is an adaptive nutrition recommendation system designed for adults in Tarlac City, Philippines. It integrates real-time health data (weight, activity, sleep) with local food availability, pricing, and seasonality to generate personalized, affordable, and explainable meal recommendations.

## Project Metadata
- **Status:** Active (Implementation Phase)
- **Owner/Authors:** Ervine Kirby V. Argueza, Xian Karlitos P. Calma, John Carlo H. Dela Cruz, John Edward F. Laxamana
- **Target Institution:** Tarlac State University (College of Computer Studies)
- **Target Date:** July 2026

## Core Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript, Leaflet.js (for map rendering), OpenStreetMap API (nearby markets)
- **Backend:** Node.js, Deno Runtime, TypeScript, Supabase Edge Functions (API, AI request processing)
- **Database:** Supabase PostgreSQL (PostgreSQL database, SQL Editor, Row-Level Security)
- **Real-Time Data:** Supabase Realtime Database (for health data synchronizations)
- **Deployment:** Netlify (frontend hosting), GitHub (version control)
- **AI Integration:** Gemini 2.5 Flash-Lite API via Google AI Studio (Explainable AI module)

## Module Scope & Boundaries

### 1. User Health Adaptation
- **Real-Time Body Feedback Loop:** Recalculates BMI, TDEE, and daily macro/calorie targets (using Mifflin-St Jeor) when weight, sleep, water, and active calories are logged.
- **Health Drift Detection:** Analyzes 7-day health trends to calculate an Overall Health Score (0–100) and displays wellness sparklines.
- **Dynamic Portion Optimizer:** Linearly scales ingredient portions (0.5x – 2.0x) to meet exact calorie targets.

### 2. Food Availability & Optimization
- **GeoMarket Ingredient Scanner:** Locates local markets based on GPS and matches meal plans against a database of local ingredient stock/prices. Recommends substitutes when items are out of stock.
- **Price-Aware Meal Optimizer:** Recommends meals and substitutes that fit within a daily budget set by the user.
- **Seasonal Availability Engine:** Checks Filipino ingredients against a seasonal availability matrix (by month) and suggests in-season alternatives.

### 3. Intelligent Recommendation
- **Explainable AI:** Uses Gemini 2.5 Flash-Lite to output human-readable rationales for why recommended meals match user goals, restrictions, and budget.
- **Constraint-Based Recommendation:** Evaluates recipes against dietary restrictions, allergies, and medical conditions, flagging violations.
- **Recipe Recommendation:** Ranks recipes from a local database based on nutritional profiles and goal match scores.

## Constraints & Limitations
- **Geographic Boundary:** Limited to Tarlac City, Philippines.
- **Nutritional Database:** Based on the DOST-FNRI Philippine Food Composition Tables (PhilFCT).
- **Health Connect Integration:** Limited to Android Health Connect (step count and active calories).
- **No Real-Time Scraping:** Market pricing and availability database must be updated manually.
- **Medical Disclaimer:** The system does not provide medical diagnoses or Medical Nutrition Therapy (MNT).
