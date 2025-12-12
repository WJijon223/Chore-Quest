import React, { useState, useEffect } from 'react';
import { ParchmentCard, FantasyButton } from '../components/FantasyUI';
import { GeminiAPICall, User, Boss, BossState } from '../types';
import { getGeminiAPICalls, addBoss } from '../services/firebase';
import { Clipboard, Edit, Swords } from 'lucide-react';
import BossOverview from '../components/BossOverview';

interface HistoryPageProps {
  user: User;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ user }) => {
  const [history, setHistory] = useState<GeminiAPICall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.id) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const historyData = await getGeminiAPICalls(user.id);
        setHistory(historyData);
      } catch (error) {
        console.error("Failed to fetch Gemini API history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.id]);

  const extractUserDescription = (prompt: string): string => {
    const match = prompt.match(/household cleaning task: \"(.*?)\"/);
    return match ? match[1] : prompt;
  };

  const handleReuse = (prompt: string) => {
    navigator.clipboard.writeText(extractUserDescription(prompt));
    alert('Description copied to clipboard!');
  };

  const handleEditAndResend = (prompt: string) => {
    // Navigate to a page where the user can edit and resend the prompt
    console.log("Edit and resend functionality not implemented yet.");
  };

  const handleResummon = async (response: string) => {
    if (!user) return;

    try {
        const bossData = JSON.parse(response);

        const imageUrl = `https://loremflickr.com/320/240/monster,fantasy/all?random=${Date.now()}`;

        const newBoss: Omit<Boss, 'id'> = {
            name: bossData.name || "Unknown Beast",
            description: bossData.bossDescription || "A mysterious entity.",
            image: imageUrl,
            totalHealth: bossData.healthPoints || 100,
            currentHealth: bossData.healthPoints || 100,
            state: BossState.ALIVE,
            levelRequirement: bossData.levelRequirement || 1,
            chores: bossData.chores.map((c: any, index: number) => ({
                id: `gen-${Date.now()}-${index}`,
                title: c.title,
                xp: c.xpReward,
                damage: c.damage || 20,
                completed: false,
                difficulty: c.difficulty,
                estimatedTime: c.minutes
            }))
        };

        await addBoss(user.id, newBoss);
        alert(`${newBoss.name} has been resummoned and added to your active bosses!`);

    } catch (e) {
        console.error("Failed to resummon boss:", e);
        alert("Failed to resummon boss. The data might be corrupted.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-serif font-bold text-parchment-900 text-center">Gemini API History</h1>
      {loading ? (
        <p className="text-center text-parchment-800 italic">Loading history...</p>
      ) : history.length === 0 ? (
        <p className="text-center text-parchment-800 italic">No history found.</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <ParchmentCard key={item.id} title={`Query from ${item.timestamp.toDate().toLocaleString()}`}>
              <div>
                <h3 className="font-bold font-serif text-lg text-parchment-900">Your Quest:</h3>
                <p className="text-parchment-800 mb-4">{extractUserDescription(item.prompt)}</p>
                <details className="mb-4">
                    <summary className="font-bold font-serif text-lg text-parchment-900 cursor-pointer">Full AI Prompt:</summary>
                    <pre className="text-xs bg-parchment-200 p-2 rounded whitespace-pre-wrap font-sans">
                        {item.prompt}
                    </pre>
                </details>
                <h3 className="font-bold font-serif text-lg text-parchment-900">Generated Boss:</h3>
                <BossOverview response={item.response} />
                <div className="flex justify-end gap-2 mt-4">
                  <FantasyButton size="sm" onClick={() => handleReuse(item.prompt)}>
                    <Clipboard size={16} />
                    Re-use
                  </FantasyButton>
                  <FantasyButton size="sm" onClick={() => handleEditAndResend(item.prompt)}>
                    <Edit size={16} />
                    Edit & Resend
                  </FantasyButton>
                  <FantasyButton size="sm" onClick={() => handleResummon(item.response)}>
                    <Swords size={16} />
                    Resummon
                  </FantasyButton>
                </div>
              </div>
            </ParchmentCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
