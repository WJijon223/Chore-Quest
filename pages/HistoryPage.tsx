import React, { useState, useEffect } from 'react';
import { ParchmentCard, FantasyButton } from '../components/FantasyUI';
import { GeminiAPICall, User } from '../types';
import { getGeminiAPICalls } from '../services/firebase';
import { Clipboard, Edit } from 'lucide-react';

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

  const handleReuse = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    alert('Prompt copied to clipboard!');
  };

  const handleEditAndResend = (prompt: string) => {
    // Navigate to a page where the user can edit and resend the prompt
    console.log("Edit and resend functionality not implemented yet.");
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
                <h3 className="font-bold font-serif text-lg text-parchment-900">Prompt:</h3>
                <p className="text-parchment-800 mb-4">{item.prompt}</p>
                <h3 className="font-bold font-serif text-lg text-parchment-900">Response:</h3>
                <p className="text-parchment-800">{item.response}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <FantasyButton size="sm" onClick={() => handleReuse(item.prompt)}>
                    <Clipboard size={16} />
                    Re-use
                  </FantasyButton>
                  <FantasyButton size="sm" onClick={() => handleEditAndResend(item.prompt)}>
                    <Edit size={16} />
                    Edit & Resend
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
