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
  
  // Helper functions to calculate square positions
  const getSquarePosition = (squareNumber) => {
    // Convert square number (1-100) to row (0-9) and column (0-9)
    const squareIndex = squareNumber - 1;
    const rowFromTop = Math.floor(squareIndex / boardSize);
    const row = boardSize - 1 - rowFromTop; // Convert to row from bottom (0-9)
    
    // Determine column based on row (odd rows go right to left)
    let col;
    if (rowFromTop % 2 === 0) {
      // Even rows (from bottom) go left to right
      col = squareIndex % boardSize;
    } else {
      // Odd rows (from bottom) go right to left
      col = boardSize - 1 - (squareIndex % boardSize);
    }

    return { row, col, rowFromTop };
  };
  
  // Component to render snakes and ladders
  const SnakesAndLadders = () => {
    // Helper function to get pixel position for a square
    const getSquarePixelPosition = (squareNumber, offset = { x: 0, y: 0 }) => {
      // Get the grid position (row, col) first
      const pos = getSquarePosition(squareNumber);
      
      // Each square is 10% of board width/height
      const squareSize = 10;
      
      // Calculate center point in percentage coordinates
      // The key insight: we need to account for the snake pattern layout
      // where even and odd rows have different directions
      let x, y;
      
      // Y-coordinate is straightforward (based on row from top)
      y = (pos.rowFromTop * squareSize) + (squareSize / 2);
      
      // X-coordinate depends on whether the row goes left-to-right or right-to-left
      if (pos.rowFromTop % 2 === 0) {
        // Even rows from top (0, 2, 4...) go left to right
        x = (pos.col * squareSize) + (squareSize / 2);
      } else {
        // Odd rows from top (1, 3, 5...) go right to left
        x = ((boardSize - 1 - pos.col) * squareSize) + (squareSize / 2);
      }
      
      return { 
        x: x + (offset.x || 0), 
        y: y + (offset.y || 0),
        row: pos.row,
        col: pos.col,
        rowFromTop: pos.rowFromTop
      };
    };
    
    const elements = [];
    
    Object.entries(specialSquares).forEach(([start, end], index) => {
      const startSquare = parseInt(start);
      const endSquare = parseInt(end);
      const isLadder = endSquare > startSquare;
      
      // Get accurate pixel positions considering the snake pattern
      const startPos = getSquarePixelPosition(startSquare);
      const endPos = getSquarePixelPosition(endSquare);
      const startX = startPos.x;
      const startY = startPos.y;
      const endX = endPos.x;
      const endY = endPos.y;
      
      // Calculate offsets for better visual connection
      if (isLadder) {
        // Calculate dimensions for ladder
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        const width = 30; // Width between ladder rails

        // Draw enhanced ladder
        elements.push(
          <div
            key={`ladder-${startSquare}-${endSquare}`}
            className="ladder-container"
            style={{
              width: `${width}px`,
              height: `${distance}%`,
              left: `${startX - (width/2)/10}%`,
              top: `${startY}%`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: 'center top',
            }}
            aria-label={`Ladder from square ${startSquare} to ${endSquare}`}
          >
            {/* Left rail */}
            <div className="ladder-rail left"></div>
            
            {/* Right rail */}
            <div className="ladder-rail right"></div>
            
            {/* Ladder steps */}
            {Array.from({ length: Math.max(3, Math.floor(distance / 5)) }).map((_, i) => (
              <div
                key={`step-${i}`}
                className="ladder-step"
                style={{ 
                  top: `${(i + 1) * (100 / (Math.max(3, Math.floor(distance / 5)) + 1))}%`,
                }}
              ></div>
            ))}
            
            {/* Start number indicator */}
            <div className="absolute -bottom-6 -left-3 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full z-20 shadow-md">
              {startSquare}
            </div>
            
            {/* End number indicator */}
            <div className="absolute -top-6 -right-3 bg-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full z-20 shadow-md">
              {endSquare}
            </div>
          </div>
        );
      } else {
        // Calculate dimensions for snake
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        // Assign different snake colors based on index
        const snakeColors = ['', 'snake-red', 'snake-purple', 'snake-blue'];
        const colorIndex = index % snakeColors.length;
        const snakeColorClass = snakeColors[colorIndex];
        
        // Draw enhanced snake with curves
        // For a more realistic snake, we want it to have some curves
        // We'll create multiple segments with slight variations in angles
        
        // Determine number of segments based on distance
        const numSegments = Math.max(3, Math.floor(distance / 10));
        const segmentLength = distance / numSegments;
        
        // Create snake head at the start position
        elements.push(
          <div
            key={`snake-head-${startSquare}-${endSquare}`}
            className={`snake-head ${snakeColorClass}`}
            style={{
              left: `${startX - 1.4}%`,
              top: `${startY - 1}%`,
              transform: `rotate(${angle}deg)`,
            }}
          >
            <div className="snake-eye left"></div>
            <div className="snake-eye right"></div>
            <div className="snake-tongue"></div>
          </div>
        );
        
        // Create snake body with multiple segments
        for (let i = 0; i < numSegments; i++) {
          // Calculate segment position and angle
          // We add some randomness to make the snake look more natural
          const segmentStart = i * segmentLength;
          const segmentAngle = angle + (Math.sin(i * (Math.PI / numSegments)) * 15);
          
          // Calculate position
          const segX = startX + (deltaX * (i / numSegments));
          const segY = startY + (deltaY * (i / numSegments));
          
          elements.push(
            <div
              key={`snake-segment-${startSquare}-${endSquare}-${i}`}
              className={`snake-body ${snakeColorClass}`}
              style={{
                width: `${segmentLength + 0.5}%`,
                left: `${segX}%`,
                top: `${segY}%`,
                transform: `rotate(${segmentAngle}deg)`,
                transformOrigin: 'left center',
                animationDelay: `${i * 0.2}s`,
              }}
            ></div>
          );
          
          // Add scales for detail
          for (let j = 1; j < 4; j++) {
            elements.push(
              <div
                key={`snake-scale-${startSquare}-${endSquare}-${i}-${j}`}
                className="snake-scale"
                style={{
                  left: `${segX + ((segmentLength * j) / 4) * Math.cos(segmentAngle * (Math.PI / 180))}%`,
                  top: `${segY + ((segmentLength * j) / 4) * Math.sin(segmentAngle * (Math.PI / 180))}%`,
                  transform: `translateX(-50%) rotate(${segmentAngle + 90}deg)`,
                }}
              ></div>
            );
          }
        }
        
        // Add number indicators
        elements.push(
          <div
            key={`snake-start-indicator-${startSquare}`}
            className="absolute z-30 shadow-md bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full"
            style={{
              left: `${startX - 1}%`,
              top: `${startY - 3}%`,
            }}
          >
              {startSquare}
            </div>
        );
        
        elements.push(
          <div
            key={`snake-end-indicator-${endSquare}`}
            className="absolute z-30 shadow-md bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full"
            style={{
              left: `${endX + 1}%`,
              top: `${endY + 1}%`,
            }}
          >
              {endSquare}
            </div>
        );
      }
    });
    
    return elements;
  };
  
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
        let bgClass = "bg-surface-150 dark:bg-surface-700 hover:bg-surface-160 dark:hover:bg-surface-600";
        if ((row + actualCol) % 2 === 0) {
          bgClass = "bg-surface-170 dark:bg-surface-800 hover:bg-surface-180 dark:hover:bg-surface-700";
        }

        // Special styling for first and last square
        if (squareNumber === 1) {
          bgClass = "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40 border-green-300 dark:border-green-700";
        }
        
        if (squareNumber === totalSquares) {
          bgClass = "bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/40 border-amber-300 dark:border-amber-700";
        }
        
        // Add shadow for 3D effect
        bgClass += " shadow-board-inner";
        
        
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
            data-square={squareNumber}
          >
            <span className="text-xs md:text-sm font-semibold">{squareNumber}</span>
            
            {/* Show basic snake or ladder indicator on square */}
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
                  key={`player-token-${playerIndex}-${position}`}
                  className="player-token token-move"
                  style={{ 
                    backgroundColor: players[playerIndex].color,
                    borderColor: darkMode ? "#fff" : "#000",
                    left: playerIndex === 0 ? "30%" : "70%",
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
          <div className="game-board p-2">
            <div className="grid grid-cols-10 gap-0.5 md:gap-1 relative">{createBoard()}</div>
            <SnakesAndLadders />
            
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
          {/* Legend */}
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
                    {/* New 3D Dice with realistic faces */}
                    <div className="dice-container mb-6">
                      <div className={`dice ${isRolling ? 'rolling' : ''}`} style={{
                        transform: diceValue ? `rotateX(${getDiceRotation(diceValue).x}deg) rotateY(${getDiceRotation(diceValue).y}deg)` : 'rotateX(0deg) rotateY(0deg)'
                      }}>
                        {/* Face 1 */}
                        <div className="dice-face" style={{
                          transform: 'rotateY(0deg) translateZ(35px)'
                        }}>
                          <div className="dice-dot" style={{
                            top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
                          }}></div>
                        </div>
                        
                        {/* Face 2 */}
                        <div className="dice-face" style={{
                          transform: 'rotateY(-90deg) translateZ(35px)'
                        }}>
                          <div className="dice-dot" style={{
                            top: '25%', left: '25%', transform: 'translate(-50%, -50%)'
                          }}></div>
                          <div className="dice-dot" style={{
                            bottom: '25%', right: '25%', transform: 'translate(50%, 50%)'
                          }}></div>
                        </div>
                        
                        {/* Face 3 */}
                        <div className="dice-face" style={{
                          transform: 'rotateX(90deg) translateZ(35px)'
                        }}>
                          <div className="dice-dot" style={{
                            top: '25%', left: '25%', transform: 'translate(-50%, -50%)'
                          }}></div>
                          <div className="dice-dot" style={{
                            top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
                          }}></div>
                          <div className="dice-dot" style={{
                            bottom: '25%', right: '25%', transform: 'translate(50%, 50%)'
                          }}></div>
                        </div>
                        
                        {/* Face 4 */}
                        <div className="dice-face" style={{
                          transform: 'rotateY(90deg) translateZ(35px)'
                        }}>
                          <div className="dice-dot" style={{
                            top: '25%', left: '25%', transform: 'translate(-50%, -50%)'
                          }}></div>
                          <div className="dice-dot" style={{
                            top: '25%', right: '25%', transform: 'translate(50%, -50%)'
                          }}></div>
                          <div className="dice-dot" style={{
                            bottom: '25%', left: '25%', transform: 'translate(-50%, 50%)'
                          }}></div>
                          <div className="dice-dot" style={{
                            bottom: '25%', right: '25%', transform: 'translate(50%, 50%)'
                          }}></div>
                        </div>
                        
                        {/* Face 5 */}
                        <div className="dice-face" style={{
                          transform: 'rotateY(180deg) translateZ(35px)'
                        }}>
                          <div className="dice-dot" style={{ top: '25%', left: '25%', transform: 'translate(-50%, -50%)' }}></div>
                          <div className="dice-dot" style={{ top: '25%', right: '25%', transform: 'translate(50%, -50%)' }}></div>
                          <div className="dice-dot" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
                          <div className="dice-dot" style={{ bottom: '25%', left: '25%', transform: 'translate(-50%, 50%)' }}></div>
                          <div className="dice-dot" style={{ bottom: '25%', right: '25%', transform: 'translate(50%, 50%)' }}></div>
                        </div>
                        
                        {/* Face 6 */}
                        <div className="dice-face" style={{
                          transform: 'rotateX(-90deg) translateZ(35px)'
                        }}>
                          <div className="dice-dot" style={{ top: '25%', left: '25%', transform: 'translate(-50%, -50%)' }}></div>
                          <div className="dice-dot" style={{ top: '25%', right: '25%', transform: 'translate(50%, -50%)' }}></div>
                          <div className="dice-dot" style={{ top: '50%', left: '25%', transform: 'translate(-50%, -50%)' }}></div>
                          <div className="dice-dot" style={{ top: '50%', right: '25%', transform: 'translate(50%, -50%)' }}></div>
                          <div className="dice-dot" style={{ bottom: '25%', left: '25%', transform: 'translate(-50%, 50%)' }}></div>
                          <div className="dice-dot" style={{ bottom: '25%', right: '25%', transform: 'translate(50%, 50%)' }}></div>
                        </div>
                      </div>
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
    </div>

  // Helper function to get the rotation values for the dice based on the value
  function getDiceRotation(value) {
    switch(value) {
      case 1: return { x: 0, y: 0 }; // Front face
      case 2: return { x: 0, y: -90 }; // Right face
      case 3: return { x: 90, y: 0 }; // Top face
      case 4: return { x: 0, y: 90 }; // Left face
      case 5: return { x: 0, y: 180 }; // Back face
      case 6: return { x: -90, y: 0 }; // Bottom face
      default: return { x: 0, y: 0 };
    }
  }
  );

}

export default MainFeature;