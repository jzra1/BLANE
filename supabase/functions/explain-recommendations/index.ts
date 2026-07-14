// Deno Edge Function for Gemini 2.5 Flash-Lite Recommendations Explanation
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      }
    });
  }

  try {
    const { bmi, tdee, budget, activeCalories, meals } = await req.json();

    const prompt = `
      You are BLANE (Biological Adaptive Nutrition Engine), a capstone project for Tarlac State University.
      Provide a brief, supportive explanation (max 3 sentences) in plain language for why these recommended meals fit this user.
      
      User Profile:
      - BMI: ${bmi}
      - Target Daily Intake: ${tdee} kcal
      - Daily Budget: ₱${budget} PHP
      - Active Calories Logged: ${activeCalories} kcal
      
      Recommended Meals:
      ${meals.map((m: any) => `- ${m.name} (${m.category}): ₱${m.cost} PHP, ${m.calories} kcal`).join("\n")}
      
      Requirements:
      1. Reference their metrics (e.g. BMI status, budget, active calories).
      2. Keep it conversational but concise.
      3. Do not include markdown headers or list formatting in your reply. Just return the paragraphs.
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250
        }
      })
    });

    const data = await response.json();
    const rationale = data.candidates?.[0]?.content?.parts?.[0]?.text || "Recommended based on your daily targets and available budget.";

    return new Response(JSON.stringify({ rationale }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 500,
    });
  }
});
