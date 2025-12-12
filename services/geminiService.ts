import { GoogleGenAI, Type } from "@google/genai";
import { Boss, Chore, BossState } from "../types";
import { addGeminiAPICall } from "./firebase";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const getDndMonsterImage = async (): Promise<string> => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/monsters");
    const data = await response.json();
    const monsters = data.results;
    
    let monsterData;
    let imageUrl;

    // Keep trying until we find a monster with an image
    while (!imageUrl) {
        const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
        const monsterResponse = await fetch(`https://www.dnd5eapi.co${randomMonster.url}`);
        monsterData = await monsterResponse.json();
        if (monsterData.image) {
            imageUrl = `https://www.dnd5eapi.co${monsterData.image}`;
        }
    }
    return imageUrl;
  } catch (error) {
    console.error("Failed to fetch D&D monster image, returning fallback.", error);
    // Return a fallback image in case the API fails
    return `https://loremflickr.com/320/240/monster,fantasy/all?random=${Date.now()}`;
  }
};

export const generateBossFromDescription = async (description: string, userId: string): Promise<Partial<Boss>> => {
  const imageUrl = await getDndMonsterImage();
  const prompt = `Generate a fantasy boss based on this household cleaning task: "${description}". 
  Also generate 3-5 sub-tasks (chores) that act as attacks to defeat it.
  For each chore, determine a damage value (integer between 10-50) that represents how much health it removes from the boss.
  The boss health should equal the sum of all chore damage values.
  Return JSON.`;

  if (!apiKey) {
    console.warn("No API Key found. Returning mock generated boss.");
    const mockName = "The Generated Grime Lord";
    return {
      name: mockName,
      description: description,
      totalHealth: 100,
      image: imageUrl,
      chores: [
        { id: 'gen1', title: 'Sweeping Strike', xp: 50, damage: 25, difficulty: 'Medium', estimatedTime: 15, completed: false },
        { id: 'gen2', title: 'Mop the Abyss', xp: 75, damage: 35, difficulty: 'Hard', estimatedTime: 25, completed: false }
      ]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
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
    
    await addGeminiAPICall(userId, { prompt, response: response.text });

    if (!data.name || !data.chores || data.chores.length === 0) {
        throw new Error("AI response is missing critical data (name or chores).");
    }

    return {
      name: data.name,
      description: data.bossDescription,
      image: imageUrl,
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
    // Return a fallback boss if AI generation fails, but in a defeated state.
    return {
      name: "The Error-Spawned Ogre",
      description: "A bug in the system has summoned this beast! Defeat it by fixing the error.",
      image: imageUrl,
      totalHealth: 100,
      currentHealth: 0,
      state: BossState.DEFEATED,
      levelRequirement: 1,
      chores: []
    };
  }
};
