import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

const MainFeature = ({ players, onEndGame, darkMode }) => {
  // Initialize icons
  const DiceIcon = getIcon('Dice6');
  const ArrowUpIcon = getIcon('ArrowUp');
  const ArrowDownIcon = getIcon('ArrowDown');
  const TrophyIcon = getIcon('Trophy');
  const RepeatIcon = getIcon('RotateCcw');
  const FlagIcon = getIcon('Flag');
  
  // Game state
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [positions, setPositions] = useState([1, 1]);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameLog, setGameLog] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  
  // Board configuration
  const boardSize = 10;
  const totalSquares = boardSize * boardSize;
  const lastSquare = totalSquares;
  
  // Define snakes and ladders
  const specialSquares = {
    // Ladders: Key is start, value is end
    4: 14,
    9: 31,
    21: 42,
    28: 84,
    51: 67,
    72: 91,
    
    // Snakes: Key is start, value is end
    17: 7,
    54: 34,
    62: 19,
    64: 60,
    87: 36,
    93: 73,
    95: 75,
    99: 78
  };
  
  const logRef = useRef(null);
  
  // Auto-scroll the game log when new entries are added
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [gameLog]);
  
  // Check for winner
  useEffect(() => {
    if (positions.some(pos => pos >= lastSquare)) {
      const winnerIndex = positions.findIndex(pos => pos >= lastSquare);
      setWinner(players[winnerIndex].name);
    }
  }, [positions, players, lastSquare]);
  
  // Create and populate the board
  const createBoard = () => {
    const squares = [];
    
    // Create squares in a snake pattern
    for (let row = boardSize - 1; row >= 0; row--) {
      const isEvenRow = (boardSize - 1 - row) % 2 === 0;
      
      for (let col = 0; col < boardSize; col++) {
        const actualCol = isEvenRow ? col : boardSize - 1 - col;
        const squareNumber = row * boardSize + actualCol + 1;
        
        // Check if this square has a snake or ladder
        const hasSpecial = squareNumber in specialSquares;
        const isSnake = hasSpecial && specialSquares[squareNumber] < squareNumber;
        const isLadder = hasSpecial && specialSquares[squareNumber] > squareNumber;
        
        // Determine square color based on position
        let bgClass = "bg-white dark:bg-surface-800";
        if ((row + actualCol) % 2 === 0) {
          bgClass = "bg-surface-100 dark:bg-surface-700";
        }
        
        // Add special styling for snakes and ladders
        if (isSnake) {
          bgClass += " border-red-400 dark:border-red-600 border-2";
        } else if (isLadder) {
          bgClass += " border-green-400 dark:border-green-600 border-2";
        }
        
        squares.push(
          <div 
            key={squareNumber} 
            className={`board-square aspect-square ${bgClass}`}
            data-number={squareNumber}
          >
            <span className="text-xs md:text-sm font-semibold">{squareNumber}</span>
            
            {/* Show snake or ladder indicator */}
            {isSnake && (
              <div className="absolute bottom-1 right-1">
                <ArrowDownIcon className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
              </div>
            )}
            {isLadder && (
              <div className="absolute bottom-1 right-1">
                <ArrowUpIcon className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
              </div>
            )}
            
            {/* Player tokens */}
            {positions.map((position, playerIndex) => (
              position === squareNumber && (
                <div
                  key={`player-${playerIndex}`}
                  className="player-token token-move"
                  style={{ 
                    backgroundColor: players[playerIndex].color,
                    borderColor: darkMode ? "#fff" : "#000",
                    left: playerIndex === 0 ? "35%" : "65%",
                    top: "50%",
                    zIndex: 10
                  }}
                ></div>
              )
            ))}
          </div>
        );
      }
    }
    
    return squares;
  };

  // Function to roll the dice
  const rollDice = () => {
    if (isRolling || isMoving || winner) return;
    
    setIsRolling(true);
    
    // Simulate dice roll animation
    const rollAnimation = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 100);
    
    // Stop animation after a delay
    setTimeout(() => {
      clearInterval(rollAnimation);
      const finalDiceValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalDiceValue);
      
      // Log the dice roll
      addToGameLog(`${players[currentPlayerIndex].name} rolled a ${finalDiceValue}`);
      
      // Move the player
      movePlayer(finalDiceValue);
      
      setIsRolling(false);
    }, 1000);
  };
  
  // Function to move player
  const movePlayer = async (steps) => {
    setIsMoving(true);
    const currentPos = positions[currentPlayerIndex];
    const newPos = Math.min(currentPos + steps, lastSquare);
    
    // Update positions
    const newPositions = [...positions];
    newPositions[currentPlayerIndex] = newPos;
    setPositions(newPositions);
    
    // Wait for token animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check for special squares
    if (newPos in specialSquares && newPos < lastSquare) {
      const specialDestination = specialSquares[newPos];
      const isSnake = specialDestination < newPos;
      
      // Log the special event
      if (isSnake) {
        addToGameLog(`${players[currentPlayerIndex].name} landed on a snake at ${newPos} and slid down to ${specialDestination}`);
        toast.error(`Oh no! ${players[currentPlayerIndex].name} landed on a snake!`, { icon: "🐍" });
      } else {
        addToGameLog(`${players[currentPlayerIndex].name} landed on a ladder at ${newPos} and climbed up to ${specialDestination}`);
        toast.success(`Yay! ${players[currentPlayerIndex].name} found a ladder!`, { icon: "🪜" });
      }
      
      // Wait before moving to special destination
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update position again
      newPositions[currentPlayerIndex] = specialDestination;
      setPositions(newPositions);
      
      // Wait for token animation
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Check for winner
    if (newPositions[currentPlayerIndex] >= lastSquare) {
      setWinner(players[currentPlayerIndex].name);
      addToGameLog(`🏆 ${players[currentPlayerIndex].name} has won the game!`);
      toast.success(`🏆 ${players[currentPlayerIndex].name} has won the game!`, { 
        autoClose: 5000,
        hideProgressBar: false
      });
    } else {
      // Switch to the next player
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    }
    
    setIsMoving(false);
  };
  
  // Function to add entry to game log
  const addToGameLog = (message) => {
    setGameLog(prev => [...prev, { message, timestamp: new Date() }]);
  };
  
  // Function to reset the game
  const resetGame = () => {
    setPositions([1, 1]);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setWinner(null);
    setGameLog([{ message: "Game restarted", timestamp: new Date() }]);
    toast.info("Game has been reset. Start fresh!");
  };
  
  // Function to end the game and return to the home screen
  const endGame = () => {
    if (winner) {
      onEndGame(winner);
    } else {
      toast.info("Game ended without a winner");
      onEndGame("No winner");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Game Board Section */}
      <div className="flex-grow lg:w-2/3">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold">SlitherUp Game Board</h2>
            <div className="flex space-x-2">
              <button
                onClick={resetGame}
                className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/30"
                aria-label="Reset Game"
              >
                <RepeatIcon className="w-5 h-5" />
              </button>
              <button
                onClick={endGame}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30"
                aria-label="End Game"
              >
                <FlagIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Game Board Grid with Ladder */}
          <div className="grid grid-cols-10 gap-0.5 md:gap-1 border border-surface-300 dark:border-surface-600 rounded-xl overflow-hidden relative">
            {createBoard()}
            
            {/* Ladder from square 4 to square 14 */}
            <div 
              className="ladder"
              style={{
                width: '180%',
                left: '35%',
                top: '75%',
                transform: 'rotate(-38deg)',
                transformOrigin: 'left center',
              }}
              aria-label="Ladder from square 4 to square 14"
            >
              <div className="absolute -top-3 -left-3 bg-green-500 text-white text-xs px-1 rounded-full">
                4→14
              </div>
            </div>
            
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center">
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-green-400 dark:border-green-600 bg-surface-100 dark:bg-surface-700 mr-2"></div>
              <span className="text-sm">Ladder (Move Up)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-red-400 dark:border-red-600 bg-surface-100 dark:bg-surface-700 mr-2"></div>
              <span className="text-sm">Snake (Move Down)</span>
            </div>
            {players.map((player, index) => (
              <div key={index} className="flex items-center">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full mr-2" style={{ backgroundColor: player.color }}></div>
                <span className="text-sm">{player.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Game Controls and Info Section */}
      <div className="lg:w-1/3">
        <div className="grid grid-cols-1 gap-6">
          {/* Current Player and Dice */}
          <div className="card">
            <AnimatePresence mode="wait">
              {winner ? (
                <motion.div
                  key="winner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrophyIcon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">
                    {winner} Wins!
                  </h3>
                  <p className="text-surface-600 dark:text-surface-300 mb-4">
                    Congratulations! You've reached the end of the board!
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={resetGame}
                      className="btn btn-primary"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={endGame}
                      className="btn border border-surface-300 dark:border-surface-600 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600"
                    >
                      Exit Game
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h3 className="text-xl font-semibold mb-4">Current Turn</h3>
                  <div className="flex items-center mb-6">
                    <div 
                      className="w-8 h-8 rounded-full mr-3"
                      style={{ backgroundColor: players[currentPlayerIndex].color }}
                    ></div>
                    <span className="text-lg font-medium">{players[currentPlayerIndex].name}'s Turn</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-20 h-20 rounded-xl bg-white dark:bg-surface-700 shadow-soft flex items-center justify-center text-3xl font-bold mb-4 ${isRolling ? 'dice-animation' : ''}`}
                    >
                      {diceValue || <DiceIcon className="w-10 h-10 text-surface-400" />}
                    </div>
                    
                    <button
                      onClick={rollDice}
                      disabled={isRolling || isMoving || winner !== null}
                      className={`btn btn-primary w-full py-3 ${(isRolling || isMoving) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isRolling ? 'Rolling...' : isMoving ? 'Moving...' : 'Roll Dice'}
                    </button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                    {players.map((player, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${
                          currentPlayerIndex === index 
                            ? 'border-primary dark:border-primary-light bg-primary/10 dark:bg-primary/20' 
                            : 'border-surface-200 dark:border-surface-700'
                        }`}
                      >
                        <div className="text-sm text-surface-500 dark:text-surface-400">
                          {player.name}
                        </div>
                        <div className="font-bold">
                          Position: {positions[index]}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Game Log */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-3">Game Log</h3>
            <div 
              ref={logRef}
              className="h-48 overflow-y-auto scrollbar-hide border border-surface-200 dark:border-surface-700 rounded-lg p-3 bg-surface-50 dark:bg-surface-900"
            >
              {gameLog.length === 0 ? (
                <p className="text-surface-500 text-center py-4">Game log will appear here...</p>
              ) : (
                <ul className="space-y-2">
                  {gameLog.map((entry, index) => (
                    <li key={index} className="text-sm pb-2 border-b border-surface-200 dark:border-surface-700 last:border-0">
                      <span className="text-surface-500 dark:text-surface-400 text-xs">
                        {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <div>{entry.message}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Game Instructions */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-3">How to Play</h3>
            <ul className="text-sm space-y-2 text-surface-600 dark:text-surface-300">
              <li>• Roll the dice on your turn to move your token</li>
              <li>• Land on a ladder to climb up!</li>
              <li>• Land on a snake and you'll slide down</li>
              <li>• First player to reach square 100 wins</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainFeature;