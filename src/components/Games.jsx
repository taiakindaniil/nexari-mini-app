import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

const Games = () => {
  const { addCoins } = useGame();
  const [activeGame, setActiveGame] = useState(null);

  // Star Catch Game State
  const [starScore, setStarScore] = useState(0);
  const [starGameRunning, setStarGameRunning] = useState(false);
  const [rocketPosition, setRocketPosition] = useState(50);
  const [stars, setStars] = useState([]);
  const [starGameOver, setStarGameOver] = useState(false);
  const starCanvasRef = useRef(null);
  const starAnimationRef = useRef(null);
  const starIntervalRef = useRef(null);
  const starGameRunningRef = useRef(false);
  const rocketPositionRef = useRef(50);

  // Cake Game State
  const [cakeScore, setCakeScore] = useState(0);
  const [cakeStack, setCakeStack] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [_cakeGameRunning, setCakeGameRunning] = useState(false); // Used for React lifecycle sync
  const [cakeGameOver, setCakeGameOver] = useState(false);
  const cakeAnimationRef = useRef(null);
  const cakeGameRunningRef = useRef(false);

  // Race Game State
  const [raceVehicles, setRaceVehicles] = useState([]);
  const [raceResult, setRaceResult] = useState('');
  const [raceRunning, setRaceRunning] = useState(false);
  const [vehiclePositions, setVehiclePositions] = useState([0, 0]);

  // Mine Game State
  const [mineBoard, setMineBoard] = useState([]);
  const [mineRevealed, setMineRevealed] = useState(0);
  const [mineGameOver, setMineGameOver] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);

  const vehicles = [
    "https://freepngimg.com/thumb/bmw/22658-4-bmw-m3-photos.png",
    "https://img2.clipart-library.com/27/picture-of-airplane-clipart/picture-of-airplane-clipart-20.png",
    "https://www.pngmart.com/files/23/Sailboat-PNG-Pic.png",
    "https://clipart-library.com/2023/15153-illustration-of-an-army-tank-pv.png",
    "https://i2.wp.com/webstockreview.net/images/motorcycle-clipart-svg-5.png"
  ];

  const getVehicleName = (src) => {
    if (src.includes("bmw")) return "Car";
    if (src.includes("airplane")) return "Airplane";
    if (src.includes("Sailboat")) return "Ship";
    if (src.includes("tank")) return "Tank";
    if (src.includes("motorcycle")) return "Bike";
    return "Transport";
  };

  // Star Catch Game Functions
  const startStarGame = () => {
    setActiveGame('stars');
    setStarScore(0);
    setStarGameRunning(true);
    starGameRunningRef.current = true;
    setStarGameOver(false);
    setRocketPosition(50);
    rocketPositionRef.current = 50;
    setStars([]);
    spawnStars();
    animateStarBackground();
  };

  const endStarGame = (isQuit = false) => {
    setStarGameRunning(false);
    starGameRunningRef.current = false;
    setStarGameOver(true);
    setStars([]);
    if (starIntervalRef.current) clearInterval(starIntervalRef.current);
    if (starAnimationRef.current) cancelAnimationFrame(starAnimationRef.current);
    
    if (!isQuit && starScore > 0) {
      const reward = Math.floor(starScore * 10);
      addCoins(reward);
    }
  };

  const spawnStars = () => {
    let spawnRate = 1200;
    let globalSpeed = 4;

    const spawnLoop = () => {
      if (!starGameRunningRef.current) return;

      const newStar = {
        id: Date.now() + Math.random(),
        x: Math.random() * (window.innerWidth - 40),
        y: 0,
        speed: Math.min(globalSpeed += 0.02, 8)
      };

      setStars(prev => [...prev, newStar]);

      if (spawnRate > 300) spawnRate -= 50;
      starIntervalRef.current = setTimeout(spawnLoop, spawnRate);
    };

    spawnLoop();
    animateStars();
  };

  const animateStars = () => {
    const animate = () => {
      if (!starGameRunningRef.current) return;

      setStars(prevStars => {
        const updatedStars = prevStars.map(star => ({
          ...star,
          y: star.y + star.speed
        })).filter(star => {
          if (star.y > window.innerHeight + 50) {
            return false;
          }
          return true;
        });

        // Check for collisions
        const currentRocketPosition = rocketPositionRef.current;
        const rocketCenterX = (currentRocketPosition / 100) * window.innerWidth;
        const rocketX = rocketCenterX - 40;
        const rocketWidth = 80;
        const rocketY = window.innerHeight - 100;
        const rocketHeight = 80;

        const collisionStars = [];
        const remainingStars = updatedStars.filter(star => {
          const starX = star.x;
          const starY = star.y;
          const starSize = 40;

          // Collision detection with margin
          const collisionMargin = 30;
          
          const horizontalOverlap = (
            (starX >= rocketX - collisionMargin && starX <= rocketX + rocketWidth + collisionMargin) ||
            (starX + starSize >= rocketX - collisionMargin && starX + starSize <= rocketX + rocketWidth + collisionMargin) ||
            (starX <= rocketX - collisionMargin && starX + starSize >= rocketX + rocketWidth + collisionMargin)
          );
          
          const verticalOverlap = (
            (starY >= rocketY - collisionMargin && starY <= rocketY + rocketHeight + collisionMargin) ||
            (starY + starSize >= rocketY - collisionMargin && starY + starSize <= rocketY + rocketHeight + collisionMargin) ||
            (starY <= rocketY - collisionMargin && starY + starSize >= rocketY + rocketHeight + collisionMargin)
          );
          
          const collision = horizontalOverlap && verticalOverlap;

          if (collision) {
            collisionStars.push(star);
            return false;
          }
          return true;
        });

        // Update score for collected stars - increment by 1 for each collision
        if (collisionStars.length > 0) {
          setStarScore(prev => prev + 1);
        }

        // Check if any star reached the bottom (game over)
        const gameOverStar = updatedStars.find(star => star.y > window.innerHeight - 20);
        if (gameOverStar) {
          endStarGame();
          return [];
        }

        return remainingStars;
      });

      starAnimationRef.current = requestAnimationFrame(animate);
    };

    starAnimationRef.current = requestAnimationFrame(animate);
  };

  const animateStarBackground = () => {
    const canvas = starCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const starArray = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: Math.random() * 0.4 + 0.2
    }));

    const animate = () => {
      if (!starGameRunningRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      
      starArray.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      starAnimationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  // Cake Game Functions
  const startCakeGame = () => {
    setActiveGame('cake');
    setCakeScore(0);
    setCakeGameRunning(true);
    cakeGameRunningRef.current = true;
    setCakeGameOver(false);
    setCurrentBlock(null);
    
    // Clean up any existing animation
    if (cakeAnimationRef.current) {
      cancelAnimationFrame(cakeAnimationRef.current);
      cakeAnimationRef.current = null;
    }
    
    const gameWidth = Math.min(window.innerWidth, 400);
    const baseBlock = {
      left: gameWidth / 2 - 75,
      width: 150,
      bottom: 0
    };
    setCakeStack([baseBlock]);
    
    // Start creating moving block after a short delay
    setTimeout(() => {
      createMovingBlock([baseBlock], true);
    }, 500);
  };

  const createMovingBlock = (stack, forceRun = false) => {
    if (!cakeGameRunningRef.current && !forceRun) {
      return;
    }
    
    const last = stack[stack.length - 1];
    const direction = Math.random() < 0.5 ? 1 : -1;
    const speed = cakeScore >= 10 
      ? (Math.random() * 1.5 + 2.8) * direction
      : (Math.random() * 0.8 + 1.8) * direction;

    const gameWidth = Math.min(window.innerWidth, 400);
    const newBlock = {
      width: last.width,
      bottom: last.bottom + 30,
      x: direction === 1 ? -100 : gameWidth + 100,
      speed: speed
    };

    setCurrentBlock(newBlock);
    
    // Start animation immediately
    console.log('Starting animation...');
    moveCakeBlock(newBlock);
  };

  const moveCakeBlock = (initialBlock) => {
    let blockPosition = initialBlock.x;
    const gameWidth = Math.min(window.innerWidth, 400);
    let isFirstFrame = true;
    
    const animate = () => {
      if (!isFirstFrame && !cakeGameRunningRef.current) {
        console.log('Animation stopped: game not running');
        return;
      }
      
      if (isFirstFrame) {
        console.log('First animation frame, speed:', initialBlock.speed);
        isFirstFrame = false;
      }

      blockPosition += initialBlock.speed;
      console.log('Block position:', blockPosition);

      if ((initialBlock.speed > 0 && blockPosition > gameWidth + 100) ||
          (initialBlock.speed < 0 && blockPosition + initialBlock.width < -100)) {
        console.log('Block went off screen');
        endCakeGame();
        return;
      }

      setCurrentBlock(prev => prev ? {...prev, x: blockPosition} : null);
      cakeAnimationRef.current = requestAnimationFrame(animate);
    };

    cakeAnimationRef.current = requestAnimationFrame(animate);
  };

  const placeCakeBlock = () => {
    if (!currentBlock || !cakeGameRunningRef.current) return;

    // Stop current animation
    if (cakeAnimationRef.current) {
      cancelAnimationFrame(cakeAnimationRef.current);
      cakeAnimationRef.current = null;
    }

    const last = cakeStack[cakeStack.length - 1];
    const overlapLeft = Math.max(currentBlock.x, last.left);
    const overlapRight = Math.min(currentBlock.x + currentBlock.width, last.left + last.width);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      endCakeGame();
      return;
    }

    const newBlock = {
      left: overlapLeft,
      width: overlapWidth,
      bottom: currentBlock.bottom
    };

    const newStack = [...cakeStack, newBlock];
    setCakeStack(newStack);
    setCurrentBlock(null);
    setCakeScore(prev => prev + 1);
    
    // Create next block after a short delay
    setTimeout(() => {
      if (cakeGameRunningRef.current) {
        createMovingBlock(newStack, true);
      }
    }, 100);
  };

  const endCakeGame = (isQuit = false) => {
    setCakeGameRunning(false);
    cakeGameRunningRef.current = false;
    setCakeGameOver(true);
    setCurrentBlock(null);
    
    // Clean up animation
    if (cakeAnimationRef.current) {
      cancelAnimationFrame(cakeAnimationRef.current);
      cakeAnimationRef.current = null;
    }
    
    if (!isQuit && cakeScore > 0) {
      const reward = Math.floor(cakeScore * 15);
      addCoins(reward);
    }
  };

  // Race Game Functions
  const startRaceGame = () => {
    setActiveGame('race');
    setRaceResult('');
    setRaceRunning(false);
    setVehiclePositions([0, 0]);
    
    const shuffled = [...vehicles].sort(() => 0.5 - Math.random());
    setRaceVehicles([shuffled[0], shuffled[1]]);
  };

  const chooseVehicle = (choice) => {
    setRaceRunning(true);
    
    const outcome = Math.random();
    const playerShouldWin = outcome < 0.45;
    
    const baseSpeed = 0.6;
    const variation = 0.4;
    let speed1, speed2;

    if ((choice === 0 && playerShouldWin) || (choice === 1 && !playerShouldWin)) {
      speed1 = baseSpeed + variation;
      speed2 = baseSpeed + 0.2;
    } else {
      speed1 = baseSpeed + 0.2;
      speed2 = baseSpeed + variation;
    }

    const finishLine = window.innerWidth * 0.8;
    let pos1 = 0, pos2 = 0;

    const animate = () => {
      pos1 += speed1;
      pos2 += speed2;
      setVehiclePositions([pos1, pos2]);

      if (pos1 >= finishLine || pos2 >= finishLine) {
        const winner = pos1 > pos2 ? 0 : 1;
        const winName = getVehicleName(raceVehicles[winner]);
        const isWin = winner === choice;
        
        setRaceResult(isWin 
          ? `Вы выиграли! Победил: ${winName}` 
          : `Вы проиграли. Победил: ${winName}`
        );
        
        if (isWin) {
          addCoins(100);
        }
        
        setTimeout(() => {
          setRaceRunning(false);
        }, 2000);
      } else {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Mine Game Functions
  const initMineGame = () => {
    setActiveGame('mine');
    setMineRevealed(0);
    setMineGameOver(false);
    setShieldActive(false);
    
    const size = 8;
    const mineCount = 10;
    const newBoard = [];

    // Create empty board
    for (let y = 0; y < size; y++) {
      newBoard[y] = [];
      for (let x = 0; x < size; x++) {
        newBoard[y][x] = {
          mine: false,
          revealed: false,
          bonus: null
        };
      }
    }

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if (!newBoard[y][x].mine && !newBoard[y][x].bonus) {
        newBoard[y][x].mine = true;
        minesPlaced++;
      }
    }

    // Place bonuses
    const placeBonuses = (type, count) => {
      let placed = 0;
      while (placed < count) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        const cell = newBoard[y][x];
        if (!cell.mine && !cell.bonus) {
          cell.bonus = type;
          placed++;
        }
      }
    };

    placeBonuses('reveal-area', 3);
    placeBonuses('shield', 2);

    setMineBoard(newBoard);
  };

  const clickMineCell = (x, y) => {
    if (mineGameOver) return;

    const newBoard = [...mineBoard];
    const cell = newBoard[y][x];

    if (cell.revealed) return;

    if (cell.mine) {
      if (shieldActive) {
        setShieldActive(false);
        return;
      }
      
      setMineGameOver(true);
      // Reveal all mines
      for (let yy = 0; yy < 8; yy++) {
        for (let xx = 0; xx < 8; xx++) {
          if (newBoard[yy][xx].mine) {
            newBoard[yy][xx].revealed = true;
          }
        }
      }
    } else {
      cell.revealed = true;
      
      if (cell.bonus === 'shield') {
        setShieldActive(true);
        cell.bonus = null;
      }
      
      if (cell.bonus === 'reveal-area') {
        // Reveal 5 random hidden cells temporarily
        const hiddenCells = [];
        for (let yy = 0; yy < 8; yy++) {
          for (let xx = 0; xx < 8; xx++) {
            if (!newBoard[yy][xx].revealed) {
              hiddenCells.push({x: xx, y: yy});
            }
          }
        }
        
        const toReveal = hiddenCells.slice(0, 5);
        toReveal.forEach(pos => {
          newBoard[pos.y][pos.x].tempRevealed = true;
        });
        
        setTimeout(() => {
          const updatedBoard = [...mineBoard];
          toReveal.forEach(pos => {
            if (!updatedBoard[pos.y][pos.x].revealed) {
              updatedBoard[pos.y][pos.x].tempRevealed = false;
            }
          });
          setMineBoard(updatedBoard);
        }, 2000);
        
        cell.bonus = null;
      }
      
      setMineRevealed(prev => prev + 1);
      
      // Check win condition
      const totalCells = 64;
      const totalMines = 10;
      if (mineRevealed + 1 === totalCells - totalMines) {
        setMineGameOver(true);
        addCoins(200);
      }
    }

    setMineBoard(newBoard);
  };

  // Touch handlers for star game
  const handleStarTouch = (e) => {
    if (!starGameRunning) return;
    const touch = e.touches[0];
    const newPosition = (touch.clientX / window.innerWidth) * 100;
    const clampedPosition = Math.max(5, Math.min(95, newPosition));
    setRocketPosition(clampedPosition);
    rocketPositionRef.current = clampedPosition; // Update ref too
  };

  // Star collision detection is now handled in animateStars function

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (starIntervalRef.current) clearInterval(starIntervalRef.current);
      if (starAnimationRef.current) cancelAnimationFrame(starAnimationRef.current);
      if (cakeAnimationRef.current) cancelAnimationFrame(cakeAnimationRef.current);
    };
  }, []);

  const closeGame = () => {
    // Clean up all animations
    if (starIntervalRef.current) clearInterval(starIntervalRef.current);
    if (starAnimationRef.current) cancelAnimationFrame(starAnimationRef.current);
    if (cakeAnimationRef.current) {
      cancelAnimationFrame(cakeAnimationRef.current);
      cakeAnimationRef.current = null;
    }
    
    setActiveGame(null);
    endStarGame(true);
    endCakeGame(true);
    setRaceRunning(false);
    setMineGameOver(false);
  };

  if (activeGame === 'stars') {
    return (
      <div className="game-overlay">
        <canvas ref={starCanvasRef} className="star-background" />
        <button className="quit-game-btn" onClick={closeGame}>✕ Quit</button>
        <div className="game-score">Score: {starScore}</div>
        <div 
          className="star-game-area"
          onTouchMove={handleStarTouch}
          onMouseMove={(e) => {
            if (!starGameRunning) return;
            const newPosition = (e.clientX / window.innerWidth) * 100;
            const clampedPosition = Math.max(5, Math.min(95, newPosition));
            setRocketPosition(clampedPosition);
            rocketPositionRef.current = clampedPosition;
          }}
        >
          {stars.map(star => (
            <img
              key={star.id}
              src="https://em-content.zobj.net/source/telegram/386/star_2b50.webp"
              className="falling-star"
              style={{
                left: `${star.x}px`,
                top: `${star.y}px`
              }}
              alt="Star"
            />
          ))}
          <img
            src="https://clipart-library.com/images/Bcgje7dc8.png"
            className="rocket"
            style={{ left: `${rocketPosition}%` }}
            alt="Rocket"
          />
        </div>
        {starGameOver && (
          <div className="game-over-modal">
            <div className="modal-content">
              <h2>Game Over!</h2>
              <p>Your score: {starScore}</p>
              <button onClick={closeGame}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeGame === 'cake') {
    return (
      <div className="game-overlay cake-game">
        <button className="quit-game-btn" onClick={closeGame}>✕ Quit</button>
        <div className="game-score">Score: {cakeScore}</div>
        <div className="cake-game-area" onClick={placeCakeBlock}>
          {cakeStack.map((block, index) => (
            <div
              key={index}
              className={`cake-block cake-color-${index % 5}`}
              style={{
                left: `${block.left}px`,
                width: `${block.width}px`,
                bottom: `${block.bottom}px`
              }}
            />
          ))}
          {currentBlock && (
            <div
              className={`cake-block moving-block cake-color-${cakeStack.length % 5}`}
              style={{
                left: `${currentBlock.x}px`,
                width: `${currentBlock.width}px`,
                bottom: `${currentBlock.bottom}px`
              }}
            />
          )}
        </div>
        {cakeGameOver && (
          <div className="game-over-modal">
            <div className="modal-content">
              <h2>Game Over!</h2>
              <p>Your score: {cakeScore}</p>
              <p>Reward: {cakeScore * 15} diamonds</p>
              <button onClick={closeGame}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeGame === 'race') {
    return (
      <div className="game-overlay race-game">
        <button className="quit-game-btn" onClick={closeGame}>✕</button>
        <h1>Choose who wins</h1>
        <div className="race-tracks">
          <div className="race-track">
            <img
              src={raceVehicles[0]}
              className="race-vehicle"
              style={{ transform: `translateX(${vehiclePositions[0]}px)` }}
              alt="Vehicle 1"
            />
          </div>
          <div className="race-track">
            <img
              src={raceVehicles[1]}
              className="race-vehicle"
              style={{ transform: `translateX(${vehiclePositions[1]}px)` }}
              alt="Vehicle 2"
            />
          </div>
        </div>
        {!raceRunning && !raceResult && (
          <div className="race-choices">
            <button onClick={() => chooseVehicle(0)}>
              {getVehicleName(raceVehicles[0])}
            </button>
            <button onClick={() => chooseVehicle(1)}>
              {getVehicleName(raceVehicles[1])}
            </button>
          </div>
        )}
        {raceResult && (
          <div className="race-result">{raceResult}</div>
        )}
      </div>
    );
  }

  if (activeGame === 'mine') {
    return (
      <div className="game-overlay mine-game">
        <button className="quit-game-btn" onClick={closeGame}>✕ Quit</button>
        <h1>💣 Minefield</h1>
        <div className="mine-stats">
          <div>Open cells: {mineRevealed}</div>
          {shieldActive && <div className="shield-indicator">🛡️ Protection is active</div>}
        </div>
        <div className="mine-board">
          {mineBoard.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`mine-cell ${cell.revealed ? 'revealed' : ''} ${
                  cell.mine && cell.revealed ? 'mine' : ''
                } ${cell.bonus === 'reveal-area' && cell.revealed ? 'reveal-area' : ''} ${
                  cell.bonus === 'shield' && cell.revealed ? 'shield' : ''
                } ${cell.tempRevealed ? 'temp-revealed' : ''}`}
                onClick={() => clickMineCell(x, y)}
              >
                {cell.revealed && cell.mine ? '💣' : ''}
                {cell.tempRevealed && cell.mine ? '💣' : ''}
              </div>
            ))
          )}
        </div>
        <button onClick={initMineGame}>🔄 New game</button>
        {mineGameOver && (
          <div className="game-over-modal">
            <div className="modal-content">
              <h2>{mineRevealed === 54 ? 'You Win!' : 'Game Over!'}</h2>
              <p>Cells opened: {mineRevealed}</p>
              {mineRevealed === 54 && <p>Reward: 200 diamonds</p>}
              <button onClick={closeGame}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="games-container visible">
      <div className="games-title">Minigames</div>
      <div className="games-grid">
        <div className="game-card" onClick={startStarGame}>
          <img 
            src="https://em-content.zobj.net/source/telegram/386/video-game_1f3ae.webp" 
            alt="Star Catch" 
            className="game-image"
          />
          <div className="game-name">Catch Stars</div>
          <button className="game-play-btn">Play</button>
        </div>
        
        <div className="game-card" onClick={startCakeGame}>
          <img 
            src="https://em-content.zobj.net/source/telegram/386/memo_1f4dd.webp" 
            alt="Cake Stack" 
            className="game-image"
          />
          <div className="game-name">Stack Cake</div>
          <button className="game-play-btn">Play</button>
        </div>
        
        <div className="game-card" onClick={startRaceGame}>
          <img 
            src="https://em-content.zobj.net/source/telegram/386/trophy_1f3c6.webp" 
            alt="Race" 
            className="game-image"
          />
          <div className="game-name">Race</div>
          <button className="game-play-btn">Play</button>
        </div>
        
        <div className="game-card" onClick={initMineGame}>
          <img 
            src="https://em-content.zobj.net/source/telegram/386/bomb_1f4a3.webp" 
            alt="Minefield" 
            className="game-image"
          />
          <div className="game-name">Minefield</div>
          <button className="game-play-btn">Play</button>
        </div>
      </div>
    </div>
  );
};

export default Games; 