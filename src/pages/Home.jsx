import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import MainFeature from '../components/MainFeature';
import getIcon from '../utils/iconUtils';

const Home = ({ darkMode }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1", color: "#4f46e5" },
    { id: 2, name: "Player 2", color: "#0d9488" }
  ]);
  
  const DiceIcon = getIcon('Dice3');
  const TrophyIcon = getIcon('Trophy');
  const SwordIcon = getIcon('Swords');

  const handleStartGame = () => {
    setGameStarted(true);
    toast.success("Game started! Roll the dice to begin your adventure!");
  };

  const handleEndGame = (winner) => {
    setGameStarted(false);
    toast.success(`🏆 Congratulations! ${winner} has won the game!`);
  };

  const handleNameChange = (id, newName) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, name: newName } : player
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-4 md:px-8 lg:px-12 bg-white dark:bg-surface-800 shadow-sm border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-gradient-to-br from-primary to-secondary w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <DiceIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              SlitherUp
            </h1>
          </div>
          
          <div className="flex space-x-4">
            {!gameStarted && (
              <button 
                onClick={handleStartGame}
                className="btn btn-primary flex items-center gap-2"
                aria-label="Start New Game"
              >
                <SwordIcon className="w-5 h-5" />
                <span>Start Game</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 md:px-8 py-6 md:py-10">
        {!gameStarted ? (
          <div className="max-w-3xl mx-auto">
            <div className="card mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Welcome to SlitherUp!</h2>
              <p className="text-surface-600 dark:text-surface-300 mb-6 text-center">
                A digital version of the classic Snake and Ladder board game for two players. 
                Roll the dice, climb the ladders, avoid the snakes, and be the first to reach the end!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {players.map((player) => (
                  <div key={player.id} className="p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                    <label className="block mb-2 font-medium">
                      {player.id === 1 ? "First" : "Second"} Player Name:
                    </label>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handleNameChange(player.id, e.target.value)}
                      className="w-full p-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-primary-light dark:focus:border-primary-light"
                      placeholder={`Player ${player.id}`}
                    />
                    <div className="mt-3 flex items-center">
                      <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: player.color }}></div>
                      <span>Token Color</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={handleStartGame}
                  className="btn btn-primary flex items-center gap-2 text-lg py-3 px-8"
                >
                  <SwordIcon className="w-5 h-5" />
                  <span>Start Game</span>
                </button>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-4">How to Play</h3>
              <ul className="space-y-2 text-surface-600 dark:text-surface-300 list-disc pl-5">
                <li>Players take turns rolling a dice and moving their tokens along the numbered path.</li>
                <li>Landing on a ladder allows players to climb up to a higher number.</li>
                <li>Landing on a snake sends players down to a lower number.</li>
                <li>The first player to reach square 100 wins the game!</li>
              </ul>
            </div>
          </div>
        ) : (
          <MainFeature 
            players={players} 
            onEndGame={handleEndGame}
            darkMode={darkMode}
          />
        )}
      </main>
      
      <footer className="w-full py-4 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 text-center text-surface-500 dark:text-surface-400 text-sm">
          <p>© {new Date().getFullYear()} SlitherUp - A digital snake and ladder game for two players</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;