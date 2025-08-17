
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalyzedRecipe } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this context, we assume the key is always available.
  console.warn("API key not found. Gemini service will not be available.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        foodName: { type: Type.STRING, description: "نام غذا یا دستور پخت." },
        servingSize: { type: Type.STRING, description: "اندازه سروینگ، مثلا 'برای ۲ نفر' یا '۱ کاسه'." },
        calories: { type: Type.NUMBER, description: "مجموع کالری تخمینی." },
        protein: { type: Type.NUMBER, description: "مجموع پروتئین تخمینی به گرم." },
        carbs: { type: Type.NUMBER, description: "مجموع کربوهیدرات تخمینی به گرم." },
        fat: { type: Type.NUMBER, description: "مجموع چربی تخمینی به گرم." },
        ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "لیست مواد اولیه شناسایی شده."
        }
    },
    required: ["foodName", "servingSize", "calories", "protein", "carbs", "fat", "ingredients"]
};


export const analyzeRecipeWithGemini = async (recipeText: string): Promise<AnalyzedRecipe | null> => {
  if (!API_KEY) {
    console.error("Gemini API key is not configured.");
    return null;
  }

  try {
    const prompt = `
      لطفا اطلاعات تغذیه‌ای دستور پخت زیر را به عنوان یک متخصص تغذیه تحلیل کن. 
      اطلاعات شامل نام غذا، اندازه سروینگ، کالری، پروتئین، کربوهیدرات و چربی کل را به صورت تخمینی محاسبه کن.
      پاسخ باید فقط به فرمت JSON باشد.
      دستور پخت:
      ---
      ${recipeText}
      ---
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });
    
    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);
    
    return parsedJson as AnalyzedRecipe;

  } catch (error) {
    console.error("Error analyzing recipe with Gemini:", error);
    return null;
  }
};
