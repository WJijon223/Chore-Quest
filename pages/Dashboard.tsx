import React, { useState, useEffect } from 'react';
import { ParchmentCard, ProgressBar, FantasyButton } from '../components/FantasyUI';
import { User, Friend, FriendRequest } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MOCK_CHART_DATA } from '../constants';
import { Users, Search, Shield, Trophy, UserPlus, Check, X } from 'lucide-react';
import { 
    searchUsersByUsername, 
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    declineFriendRequest
} from '../services/firebase';

interface DashboardProps {
  user: User;
  friends: Friend[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, friends }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
      if (!user.id) return;
      const fetchRequests = async () => {
          try {
            const requests = await getFriendRequests(user.id);
            setFriendRequests(requests);
          } catch (error) {
            console.error("Failed to fetch friend requests:", error);
          }
      };
      fetchRequests();
      const interval = setInterval(fetchRequests, 30000); // Poll for new requests
      return () => clearInterval(interval);
  }, [user.id]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchMessage('');
    setSearchResults([]);
    try {
      const results = await searchUsersByUsername(searchQuery.trim());
      const filteredResults = results.filter(u => u.id !== user.id && !friends.some(f => f.id === u.id));
      if (filteredResults.length === 0) {
        setSearchMessage('No heroes found by that name.');
      } else {
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error("Error searching for users:", error);
      setSearchMessage('An error occurred while searching.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddFriend = async (targetUser: User) => {
      if (!user.id || !targetUser.id) return;
      try {
        await sendFriendRequest(user.id, targetUser.id);
        alert(`Friend request sent to ${targetUser.username}!`);
        setSearchResults(prev => prev.filter(u => u.id !== targetUser.id));
      } catch (error: any) {
        alert(error.message);
      }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
      if (!request.from || !user.id) return;
      try {
        await acceptFriendRequest(request.id, request.from, user.id);
        setFriendRequests(prev => prev.filter(r => r.id !== request.id));
        // Note: You might want to trigger a refresh of the friends list here
      } catch (error) {
          console.error("Error accepting request:", error);
      }
  };

  const handleDeclineRequest = async (request: FriendRequest) => {
      try {
        await declineFriendRequest(request.id);
        setFriendRequests(prev => prev.filter(r => r.id !== request.id));
      } catch (error) {
          console.error("Error declining request:", error);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left & Center Columns */}
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

        {/* Right Column: Companions */}
        <div className="lg:col-span-1 h-full">
           <ParchmentCard title="Companions" className="h-full flex flex-col">
            <div className="flex gap-2 mb-4 shrink-0">
              <input 
                type="text" 
                placeholder="Find ally..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-parchment-100 border-b border-parchment-800 p-1 text-sm focus:outline-none bg-transparent placeholder-parchment-800/50"
              />
              <button onClick={handleSearch} className="text-parchment-800 hover:text-gold disabled:opacity-50" disabled={searchLoading}>
                {searchLoading ? <div className="animate-spin w-5 h-5 border-t-2 border-parchment-800 rounded-full"></div> : <Search size={20} />}
              </button>
            </div>

            {/* Search and Request Section */}
            <div className="mb-4 space-y-3">
              {searchMessage && <p className="text-center text-sm italic text-parchment-800/80">{searchMessage}</p>}
              {searchResults.length > 0 && (
                <ul className="space-y-2">
                    {searchResults.map(foundUser => (
                    <li key={foundUser.id} className="flex items-center gap-3 p-2 bg-parchment-200/50 rounded animate-fade-in-fast">
                        <img src={foundUser.avatar} alt={foundUser.username} className="w-8 h-8 rounded-full sepia-[.2]" />
                        <div className="flex-1">
                          <p className="font-serif font-bold text-sm leading-tight">{foundUser.username}</p>
                          <p className="text-xs text-parchment-800">Lvl {foundUser.level}</p>
                        </div>
                        <FantasyButton size="sm" variant="ghost" onClick={() => handleAddFriend(foundUser)}><UserPlus size={16} /></FantasyButton>
                    </li>
                    ))}
                </ul>
              )}

              {friendRequests.length > 0 && (
                  <div>
                      <p className="font-serif text-sm text-parchment-800/90 mb-2 pt-2 border-t border-parchment-800/20">Pending Requests</p>
                      <ul className="space-y-2">
                          {friendRequests.map(request => (
                              request.fromUser && (
                                <li key={request.id} className="flex items-center gap-2 p-2 bg-parchment-200/50 rounded animate-fade-in-fast">
                                    <img src={request.fromUser.avatar} alt={request.fromUser.username} className="w-8 h-8 rounded-full sepia-[.2]" />
                                    <div className="flex-1">
                                      <p className="font-serif font-bold text-sm leading-tight">{request.fromUser.username}</p>
                                    </div>
                                    <FantasyButton size="sm" variant="ghost" onClick={() => handleAcceptRequest(request)}><Check size={16} className="text-green-600"/></FantasyButton>
                                    <FantasyButton size="sm" variant="ghost" onClick={() => handleDeclineRequest(request)}><X size={16} className="text-danger"/></FantasyButton>
                                </li>
                              )
                          ))}
                      </ul>
                  </div>
              )}
            </div>
             
             <p className="font-serif text-sm text-parchment-800/90 mb-2 border-t border-parchment-800/20 pt-2">Your Party</p>
             <ul className="space-y-4 flex-1 overflow-y-auto pr-2 scroll-bar">
               {friends.length > 0 ? (
                 friends.map(friend => (
                   <li key={friend.id} className="flex items-center gap-3 animate-fade-in-fast">
                      <div className="relative shrink-0">
                         <img src={friend.avatar} alt={friend.username} className="w-10 h-10 rounded-full sepia-[.2]" />
                         <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-parchment-100 ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-serif font-bold text leading-tight">{friend.username}</p>
                        <p className="text-xs text-parchment-800">Lvl {friend.level}</p>
                      </div>
                   </li>
                 ))
               ) : (
                 <p className="text-center text-sm italic text-parchment-800/80 pt-4">Your party is empty. Go on an adventure and find some allies!</p>
               )}
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
