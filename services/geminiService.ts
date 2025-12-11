import { GoogleGenAI } from "@google/genai";

// This is a placeholder for the actual implementation.
// For now, it returns a mock boss.

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey});

export const generateBossFromDescription = async (description: string) => {
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("Called AI with:", description)

    // This is a mock response
    return {
        name: "The Grime Lord (Generated)",
        description: "A foul beast born of neglected cleaning tasks.",
        totalHealth: 100,
        chores: [
            { id: 'gen1', title: 'Sweep the Dust Bunnies', xp: 50, damage: 25, difficulty: 'Medium', estimatedTime: 15, completed: false },
            { id: 'gen2', title: 'Mop the Sticky Floor', xp: 75, damage: 35, difficulty: 'Hard', estimatedTime: 25, completed: false },
        ]
    };
};