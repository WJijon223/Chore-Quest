import React, { useState, useEffect } from 'react';
import { Boss, BossState, User, Chore } from '../types';
import { ParchmentCard, FantasyButton, ProgressBar } from '../components/FantasyUI';
import { Skull, CheckSquare, Sparkles, Filter, Swords, Clock, HeartCrack } from 'lucide-react';
import { generateBossFromDescription } from '../services/geminiService';
import { addBoss, updateBoss } from '../services/firebase';
import { updateUserXP } from '../services/xpService';

interface BossPageProps {
  bosses: Boss[];
  user: User;
}

const BossPage: React.FC<BossPageProps> = ({ bosses, user }) => {
  const [selectedBossId, setSelectedBossId] = useState<string | null>(bosses[0]?.id || null);
  const [filter, setFilter] = useState<'ALL' | 'ALIVE' | 'DEFEATED'>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (!selectedBossId && bosses.length > 0) {
      setSelectedBossId(bosses[0].id);
    }
  }, [bosses, selectedBossId]);

  const selectedBoss = bosses.find(b => b.id === selectedBossId);

  const filteredBosses = bosses.filter(b => {
    if (filter === 'ALL') return true;
    return b.state === filter;
  });

  const handleGenerate = async () => {
    if (!prompt || !user) return;
    setIsGenerating(true);
    try {
      const partialBoss = await generateBossFromDescription(prompt, user.id);
      const newBoss: Omit<Boss, 'id'> = {
        name: partialBoss.name || "Unknown Beast",
        description: partialBoss.description || "A mysterious entity.",
        image: partialBoss.image || `https://loremflickr.com/320/240/monster,fantasy/all?random=${Date.now()}`,
        totalHealth: partialBoss.totalHealth || 100,
        currentHealth: partialBoss.totalHealth || 100,
        state: BossState.ALIVE,
        levelRequirement: 1,
        chores: partialBoss.chores as Chore[] || []
      };
      const newBossId = await addBoss(user.id, newBoss);
      setSelectedBossId(newBossId);
      setPrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChoreCompletion = async (choreId: string) => {
    if (!selectedBoss || !user) return;

    const choreToUpdate = selectedBoss.chores.find(c => c.id === choreId);
    if (!choreToUpdate || choreToUpdate.completed) return;

    await updateUserXP(user, choreToUpdate.xp);

    const updatedChores = selectedBoss.chores.map(c => 
      c.id === choreId ? { ...c, completed: true } : c
    );

    const newHealth = selectedBoss.currentHealth - choreToUpdate.damage;
    const isDefeated = newHealth <= 0;

    const updatedBoss: Partial<Boss> = {
      chores: updatedChores,
      currentHealth: isDefeated ? 0 : newHealth,
      state: isDefeated ? BossState.DEFEATED : selectedBoss.state
    };

    await updateBoss(user.id, selectedBoss.id, updatedBoss);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-fade-in">
      
      {/* Left Panel: Boss List */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        
        {/* Summoning Area */}
        <ParchmentCard className="bg-parchment-300">
           <h3 className="font-serif font-bold text-parchment-900 mb-2 flex items-center gap-2">
             <Sparkles className="text-purple-600" size={18} /> Summon Boss via AI
           </h3>
           <div className="flex gap-2">
             <input 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="e.g. Clean the garage..." 
               className="flex-1 bg-parchment-100 border border-parchment-800 p-2 text-sm rounded-sm"
             />
             <FantasyButton onClick={handleGenerate} disabled={isGenerating} className="px-3">
                {isGenerating ? '...' : '+'}
             </FantasyButton>
           </div>
        </ParchmentCard>

        {/* Filter */}
        <div className="flex gap-2 p-1 bg-parchment-800/10 rounded-lg">
           {(['ALL', 'ALIVE', 'DEFEATED'] as const).map((f) => (
             <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1 text-xs font-serif font-bold rounded transition-colors ${filter === f ? 'bg-parchment-800 text-gold shadow-md' : 'text-parchment-900 hover:bg-parchment-800/20'}`}
             >
               {f}
             </button>
           ))}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 scroll-bar">
          {filteredBosses.map(boss => (
            <div 
              key={boss.id}
              onClick={() => setSelectedBossId(boss.id)}
              className={`
                cursor-pointer p-4 border-2 rounded-lg transition-all relative overflow-hidden group
                ${selectedBossId === boss.id 
                  ? 'border-gold bg-parchment-100 shadow-[inset_0_0_20px_rgba(255,179,0,0.2)]' 
                  : 'border-parchment-800 bg-parchment-200 hover:bg-parchment-100'}
              `}
            >
              <div className="flex items-center gap-4 relative z-10">
                <img src={boss.image} alt={boss.name} className={`w-12 h-12 rounded bg-black object-cover border border-parchment-800 ${boss.state === BossState.DEFEATED ? 'grayscale opacity-50' : 'sepia'}`} />
                <div className="flex-1">
                  <h4 className={`font-serif font-bold ${boss.state === BossState.DEFEATED ? 'line-through text-parchment-800/60' : 'text-parchment-900'}`}>{boss.name}</h4>
                  <p className="text-xs text-parchment-800">Lvl {boss.levelRequirement} Threat</p>
                </div>
                {boss.state === BossState.DEFEATED && <Skull className="text-parchment-800/40" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Boss Detail (The Battle Arena) */}
      <div className="flex-1 h-full flex flex-col">
        {selectedBoss ? (
          <ParchmentCard className="h-full flex flex-col overflow-hidden relative p-0">
             {/* Boss Header Image - Reduced height from h-48 to h-32 */}
             <div className="h-32 w-full relative shrink-0">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <img src={selectedBoss.image} alt={selectedBoss.name} className="w-full h-full object-cover sepia-[.4]" />
                <div className="absolute bottom-3 left-6 z-20">
                  <h2 className="text-2xl font-serif font-bold text-parchment-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {selectedBoss.name}
                  </h2>
                </div>
                {selectedBoss.state === BossState.DEFEATED && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <h1 className="text-5xl text-red-700 font-serif font-black border-4 border-red-700 p-2 transform -rotate-12">DEFEATED</h1>
                  </div>
                )}
             </div>

             <div className="p-6 pt-4 flex-1 flex flex-col overflow-hidden">
               {/* Boss Stats - Compacted */}
               <div className="mb-4 space-y-2 shrink-0">
                 <p className="font-serif italic text-sm text-parchment-900/80 mb-2 border-l-4 border-gold pl-3 line-clamp-2">
                   "{selectedBoss.description}"
                 </p>
                 <ProgressBar 
                   current={selectedBoss.currentHealth} 
                   max={selectedBoss.totalHealth} 
                   type="health" 
                   label="Boss Health"
                 />
               </div>

               {/* Chores Grid - Scrollable */}
               <div className="flex-1 overflow-y-auto scroll-bar pr-2">
                 <h3 className="font-serif font-bold text-xl mb-4 text-parchment-900 border-b-2 border-parchment-800 pb-2 uppercase tracking-widest sticky top-0 bg-parchment-200 z-10 shadow-sm">
                   Required Attacks
                 </h3>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
                   {selectedBoss.chores.map(chore => (
                     <div key={chore.id} className={`
                        flex flex-col items-center justify-between text-center p-3 rounded-lg border-2 shadow-md transition-all group min-h-[180px]
                        ${chore.completed 
                           ? 'bg-parchment-200/50 border-parchment-800/40 opacity-80' 
                           : 'bg-parchment-100 border-parchment-800 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-gold'
                        }
                     `}>
                       {/* Title */}
                       <p className={`font-serif font-black text-sm leading-tight h-10 flex items-center justify-center w-full ${chore.completed ? 'line-through text-parchment-800/60' : 'text-parchment-900'}`}>
                         {chore.title}
                       </p>

                       {/* Action Button */}
                       <button 
                         onClick={() => handleChoreCompletion(chore.id)}
                         className={`
                           h-16 w-16 shrink-0 flex items-center justify-center rounded-full border-2 transition-all duration-300 my-2 shadow-inner
                           ${chore.completed 
                             ? 'bg-green-700 border-green-900 text-parchment-100' 
                             : 'bg-parchment-200 border-parchment-800 text-parchment-800 hover:bg-danger hover:text-white hover:border-red-900 hover:scale-110'
                           }
                           ${selectedBoss.state === BossState.DEFEATED || chore.completed ? 'cursor-not-allowed opacity-50' : ''}
                         `}
                        disabled={selectedBoss.state === BossState.DEFEATED || chore.completed}
                       >
                         {chore.completed ? <CheckSquare size={32} /> : <Swords size={32} className={!chore.completed ? "animate-pulse" : ""} />}
                       </button>
                       
                       {/* Stats Footer */}
                       <div className="w-full space-y-2">
                         <div className="flex justify-center gap-2">
                           <span className="font-bold font-serif text-xs text-gold-dim bg-parchment-800/10 px-2 py-0.5 rounded border border-parchment-800/20" title="Experience Reward">
                             +{chore.xp} XP
                           </span>
                           <span className="font-bold font-serif text-xs text-red-700 bg-red-100/50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1" title="Boss Damage">
                             <HeartCrack size={10} /> -{chore.damage}
                           </span>
                         </div>
                         
                         <div className="flex justify-center gap-2 text-[10px] font-bold uppercase tracking-wide text-parchment-800/80">
                           <span className="flex items-center gap-0.5 bg-parchment-300 px-1.5 py-0.5 rounded-full">
                             <Clock size={10} /> {chore.estimatedTime}m
                           </span>
                           <span className={`
                             px-1.5 py-0.5 rounded-full border
                             ${chore.difficulty === 'Hard' ? 'text-red-800 bg-red-100 border-red-200' : 
                               chore.difficulty === 'Medium' ? 'text-yellow-800 bg-yellow-100 border-yellow-200' : 
                               'text-green-800 bg-green-100 border-green-200'}
                           `}>{chore.difficulty}</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
             
          </ParchmentCard>
        ) : (
          <div className="h-full flex items-center justify-center opacity-50">
            <p className="font-serif text-xl">Select a boss to view details...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BossPage;