'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Color } from '@/lib/game-client/DataModel';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameSettings, setGameSettings] = useState({
    preferredColor: 'random',
    timer: false,
    initialTime: 5,
    timerIncrement: 0,
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const handleCreateRoom = async () => {
    if (!token) return;
    
    setIsCreatingRoom(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameRules: {
            hostPreferredColor: gameSettings.preferredColor === 'random' 
              ? undefined 
              : (gameSettings.preferredColor === 'white' ? Color.White : Color.Black),
            timer: gameSettings.timer,
            initialTime: gameSettings.timer ? gameSettings.initialTime * 60 : undefined,
            timerIncrement: gameSettings.timer ? gameSettings.timerIncrement : undefined,
          },
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create room');
      }
      
      const data = await response.json();
      router.push(`/game/${data.roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      router.push(`/game/${roomId.trim()}`);
    }
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setGameSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? Number(value) 
          : value
    }));
  };

  if (!isAuthenticated || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Chess Now</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.fullName}</span>
            <button
              onClick={() => router.push('/profile')}
              className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Profile
            </button>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Game Panel */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Create a New Game</h2>
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="preferredColor" className="block text-sm font-medium text-gray-700">
                      Preferred Color
                    </label>
                    <select
                      id="preferredColor"
                      name="preferredColor"
                      value={gameSettings.preferredColor}
                      onChange={handleSettingChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="random">Random</option>
                      <option value="white">White</option>
                      <option value="black">Black</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="timer"
                      name="timer"
                      type="checkbox"
                      checked={gameSettings.timer}
                      onChange={handleSettingChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="timer" className="ml-2 block text-sm text-gray-900">
                      Enable Timer
                    </label>
                  </div>
                  
                  {gameSettings.timer && (
                    <>
                      <div>
                        <label htmlFor="initialTime" className="block text-sm font-medium text-gray-700">
                          Initial Time (minutes)
                        </label>
                        <input
                          type="number"
                          name="initialTime"
                          id="initialTime"
                          min="1"
                          max="60"
                          value={gameSettings.initialTime}
                          onChange={handleSettingChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="timerIncrement" className="block text-sm font-medium text-gray-700">
                          Increment (seconds)
                        </label>
                        <input
                          type="number"
                          name="timerIncrement"
                          id="timerIncrement"
                          min="0"
                          max="60"
                          value={gameSettings.timerIncrement}
                          onChange={handleSettingChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleCreateRoom}
                    disabled={isCreatingRoom}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isCreatingRoom ? 'Creating...' : 'Create Game'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Join Game Panel */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Join a Game</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                      Room ID
                    </label>
                    <input
                      type="text"
                      name="roomId"
                      id="roomId"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter room ID"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleJoinRoom}
                    disabled={!roomId.trim()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Join Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}