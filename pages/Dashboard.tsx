import React from 'react';
import { ParchmentCard, ProgressBar, FantasyButton } from '../components/FantasyUI';
import { User, Friend } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MOCK_CHART_DATA } from '../constants';
import { Users, Search, Shield, Trophy } from 'lucide-react';

interface DashboardProps {
  user: User;
  friends: Friend[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, friends }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section - Centered Profile */}
      <div className="flex flex-col gap-6 items-center justify-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-parchment-800 overflow-hidden shadow-xl bg-parchment-300">
            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover sepia-[.3]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gold text-parchment-900 font-bold w-10 h-10 flex items-center justify-center rounded-full border-2 border-parchment-800 shadow-md">
            {user.level}
          </div>
        </div>
        
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-serif font-bold text-parchment-900 mb-4">{user.username}</h1>
          <div className="flex flex-col gap-2">
             <ProgressBar current={user.currentXP} max={user.xpToNextLevel} type="xp" label="Experience to Next Level" />
             <div className="flex justify-center gap-8 text-sm text-parchment-800/80 font-serif mt-1">
               <span className="flex items-center gap-2"><Trophy size={14} /> Bosses Defeated: {user.bossesDefeated}</span>
               <span className="flex items-center gap-2"><Shield size={14} /> Rank: Squire</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Left Column: Stats */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <ParchmentCard title="Weekly Activity">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffb300" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ffb300" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4b483" />
                  <XAxis dataKey="name" stroke="#5d4037" tick={{fontFamily: 'serif'}} />
                  <YAxis stroke="#5d4037" tick={{fontFamily: 'serif'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f4e4bc', borderColor: '#5d4037', fontFamily: 'serif' }}
                    itemStyle={{ color: '#3e2723' }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#5d4037" fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ParchmentCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <ParchmentCard title="Recent Trophies" className="flex items-center justify-center min-h-[150px]">
                <div className="text-center opacity-50">
                   <Trophy size={48} className="mx-auto mb-2 text-parchment-800" />
                   <p className="font-serif italic">No recent trophies earned.</p>
                </div>
             </ParchmentCard>
             <ParchmentCard title="Next Quest" className="flex items-center justify-center min-h-[150px]">
                <div className="text-center">
                   <Shield size={48} className="mx-auto mb-2 text-danger" />
                   <p className="font-serif font-bold text-lg">The Garage Hydra</p>
                   <p className="text-sm italic text-parchment-800">Requires Level 6</p>
                </div>
             </ParchmentCard>
          </div>
        </div>

        {/* Right Column: Friends */}
        <div className="h-full">
           <ParchmentCard title="Companions" className="h-full flex flex-col">
             <div className="flex gap-2 mb-4 shrink-0">
               <input 
                  type="text" 
                  placeholder="Find ally..." 
                  className="flex-1 bg-parchment-100 border-b border-parchment-800 p-1 text-sm focus:outline-none bg-transparent placeholder-parchment-800/50"
               />
               <button className="text-parchment-800 hover:text-gold"><Search size={20} /></button>
             </div>
             
             <ul className="space-y-4 flex-1 overflow-y-auto pr-2 scroll-bar">
               {friends.map(friend => (
                 <li key={friend.id} className="flex items-center gap-3 p-2 hover:bg-parchment-300/50 rounded transition-colors cursor-pointer border border-transparent hover:border-parchment-400">
                    <div className="relative">
                       <img src={friend.avatar} alt={friend.username} className="w-10 h-10 rounded-full border border-parchment-800 sepia-[.2]" />
                       <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-parchment-100 ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </div>
                    <div className="flex-1">
                      <p className="font-serif font-bold text-parchment-900 leading-tight">{friend.username}</p>
                      <p className="text-xs text-parchment-800 uppercase">Lvl {friend.level}</p>
                    </div>
                    <Users size={16} className="text-parchment-400" />
                 </li>
               ))}
             </ul>
             
             <div className="mt-6 pt-4 border-t border-parchment-800/20 text-center shrink-0">
               <FantasyButton variant="ghost" className="w-full text-sm">View Leaderboard</FantasyButton>
             </div>
           </ParchmentCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;