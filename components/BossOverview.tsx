import React from 'react';
import { ParchmentCard } from './FantasyUI';

interface BossOverviewProps {
  response: string; // The JSON string response from the Gemini API
}

const BossOverview: React.FC<BossOverviewProps> = ({ response }) => {
  try {
    const bossData = JSON.parse(response);

    return (
      <ParchmentCard title={bossData.name} className="text-parchment-800">
        <p className="mb-2">{bossData.bossDescription}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <strong>Health:</strong> {bossData.healthPoints}
            </div>
            <div>
                <strong>Level Req:</strong> {bossData.levelRequirement || 1}
            </div>
        </div>
        <div className="mt-4">
          <h4 className="font-bold font-serif text-md">Chores:</h4>
          <ul className="list-disc list-inside space-y-1">
            {bossData.chores.map((chore: any, index: number) => (
              <li key={index} className="text-parchment-700">
                <strong className="text-parchment-800">{chore.title}</strong> - {chore.damage} DMG | {chore.xpReward} XP
                <br />
                <span className="italic text-xs">({chore.difficulty}, {chore.minutes} min)</span>
              </li>
            ))}
          </ul>
        </div>
      </ParchmentCard>
    );
  } catch (error) {
    console.error("Failed to parse boss data from Gemini response:", error);
    // If parsing fails, display the raw response
    return (
        <ParchmentCard title="Corrupted Data" className="text-parchment-800">
            <p>Could not display boss overview. Raw data:</p>
            <pre className="whitespace-pre-wrap text-xs bg-parchment-200 p-2 rounded">
                {response}
            </pre>
        </ParchmentCard>
    )
  }
};

export default BossOverview;