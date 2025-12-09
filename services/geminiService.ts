import { GoogleGenAI, Type } from "@google/genai";
import { Boss, Chore, BossState } from "../types";

// NOTE: Since the prompt requested "no functionality right now" but "focus on design",
// This service file is set up for the future integration but returns mock data structure for now
// to prevent API errors without a valid key in the demo environment.

// In a real scenario, ensure process.env.API_KEY is set.
const apiKey = process.env.API_KEY || 'dummy_key';
const ai = new GoogleGenAI({ apiKey });

export const generateBossFromDescription = async (description: string): Promise<Partial<Boss>> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Returning mock generated boss.");
    return {
      name: "The Generated Grime Lord",
      description: description,
      totalHealth: 100,
      chores: [
        { id: 'gen1', title: 'Sweeping Strike', xp: 50, damage: 25, difficulty: 'Medium', estimatedTime: 15, completed: false },
        { id: 'gen2', title: 'Mop the Abyss', xp: 75, damage: 35, difficulty: 'Hard', estimatedTime: 25, completed: false }
      ]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a fantasy boss based on this household cleaning task: "${description}". 
      Also generate 3-5 sub-tasks (chores) that act as attacks to defeat it.
      For each chore, determine a damage value (integer between 10-50) that represents how much health it removes from the boss.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            bossDescription: { type: Type.STRING },
            healthPoints: { type: Type.INTEGER },
            chores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  xpReward: { type: Type.INTEGER },
                  damage: { type: Type.INTEGER, description: "Amount of health to remove from boss (10-50)" },
                  difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                  minutes: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    return {
      name: data.name,
      description: data.bossDescription,
      totalHealth: data.healthPoints || 100,
      currentHealth: data.healthPoints || 100,
      state: BossState.ALIVE,
      levelRequirement: 1,
      chores: data.chores.map((c: any, index: number) => ({
        id: `gen-${Date.now()}-${index}`,
        title: c.title,
        xp: c.xpReward,
        damage: c.damage || 20,
        completed: false,
        difficulty: c.difficulty,
        estimatedTime: c.minutes
      }))
    };

  } catch (error) {
    console.error("AI Generation failed", error);
    throw error;
  }
};