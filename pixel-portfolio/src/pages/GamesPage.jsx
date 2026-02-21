import React, { useState, useEffect, useRef } from 'react';
import './GamesPage.css';

// ============================================
// GAME 1: PIXEL CLICKER (Cookie Clicker Style)
// ============================================
const PixelClicker = ({ onGameEnd }) => {
  const [clicks, setClicks] = useState(0);
  const [score, setScore] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [upgrades, setUpgrades] = useState({ dblClick: 0, autoClick: 0, superClick: 0 });
  const [autoClickActive, setAutoClickActive] = useState(false);
  const [particles, setParticles] = useState([]);
  const clickZoneRef = useRef(null);

  // Auto clicker
  useEffect(() => {
    if (!autoClickActive || upgrades.autoClick === 0) return;
    const interval = setInterval(() => {
      setScore(s => s + clickPower * upgrades.autoClick);
    }, 500);
    return () => clearInterval(interval);
  }, [autoClickActive, upgrades.autoClick, clickPower]);

  const handleClick = (e) => {
    const newScore = score + clickPower;
    setScore(newScore);
    setClicks(clicks + 1);

    // Particle effect
    if (clickZoneRef.current) {
      const rect = clickZoneRef.current.getBoundingClientRect();
      const particle = {
        id: Math.random(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        value: `+${clickPower}`,
      };
      setParticles(prev => {
        const updated = [...prev, particle];
        setTimeout(() => setParticles(p => p.filter(a => a.id !== particle.id)), 1000);
        return updated;
      });
    }
  };

  const buyUpgrade = (type, cost) => {
    if (score >= cost) {
      setScore(score - cost);
      setUpgrades(prev => ({ ...prev, [type]: prev[type] + 1 }));
      
      if (type === 'autoClick') {
        setAutoClickActive(true);
      }
      
      if (type === 'dblClick') {
        setClickPower(clickPower * 1.5);
      }
    }
  };

  const upgradeCosts = {
    dblClick: Math.ceil(10 * Math.pow(1.15, upgrades.dblClick)),
    autoClick: Math.ceil(50 * Math.pow(1.2, upgrades.autoClick)),
    superClick: Math.ceil(100 * Math.pow(1.3, upgrades.superClick)),
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>🖱️ Pixel Clicker</h2>
        <div className="game-stats">
          <div>Score: <strong>{Math.floor(score)}</strong></div>
          <div>Clicks: <strong>{clicks}</strong></div>
          <div>Power: <strong>{clickPower.toFixed(1)}</strong></div>
        </div>
      </div>

      <div
        ref={clickZoneRef}
        className="click-zone"
        onClick={handleClick}
      >
        <div className="click-target">CLICK!</div>
        {particles.map(p => (
          <div
            key={p.id}
            className="particle floating-up"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
            }}
          >
            {p.value}
          </div>
        ))}
      </div>

      <div className="upgrade-shop">
        <h3>⬆️ Upgrades</h3>
        <div className="upgrades-grid">
          <button
            className={`upgrade-btn ${score < upgradeCosts.dblClick ? 'disabled' : ''}`}
            onClick={() => buyUpgrade('dblClick', upgradeCosts.dblClick)}
            disabled={score < upgradeCosts.dblClick}
          >
            <div>2x Power</div>
            <div className="cost">{Math.ceil(upgradeCosts.dblClick)} pts</div>
            <div className="count">x{upgrades.dblClick}</div>
          </button>

          <button
            className={`upgrade-btn ${score < upgradeCosts.autoClick ? 'disabled' : ''}`}
            onClick={() => buyUpgrade('autoClick', upgradeCosts.autoClick)}
            disabled={score < upgradeCosts.autoClick}
          >
            <div>🤖 Auto Click</div>
            <div className="cost">{Math.ceil(upgradeCosts.autoClick)} pts</div>
            <div className="count">x{upgrades.autoClick}</div>
          </button>

          <button
            className={`upgrade-btn ${score < upgradeCosts.superClick ? 'disabled' : ''}`}
            onClick={() => buyUpgrade('superClick', upgradeCosts.superClick)}
            disabled={score < upgradeCosts.superClick}
          >
            <div>💥 Super Click</div>
            <div className="cost">{Math.ceil(upgradeCosts.superClick)} pts</div>
            <div className="count">x{upgrades.superClick}</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// GAME 2: RHYTHM GAME (Simple Beat Following)
// ============================================
const RhythmGame = ({ onGameEnd }) => {
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [notes, setNotes] = useState([]);
  const [nextNoteId, setNextNoteId] = useState(0);
  const containerRef = useRef(null);

  // Simple beat pattern
  const beatPattern = ['A', 'S', 'D', 'F', 'D', 'S', 'A', 'F'];
  const [currentBeat, setCurrentBeat] = useState(0);

  // Generate notes on beat
  useEffect(() => {
    if (!gameActive) return;
    const interval = setInterval(() => {
      const beat = beatPattern[currentBeat % beatPattern.length];
      const newNote = {
        id: nextNoteId,
        key: beat,
        position: 0,
        created: Date.now(),
      };
      setNotes(prev => [...prev, newNote]);
      setCurrentBeat(c => c + 1);
      setNextNoteId(id => id + 1);
    }, 500);

    return () => clearInterval(interval);
  }, [gameActive, currentBeat, nextNoteId]);

  // Animate notes falling
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setNotes(prev => {
        return prev
          .map(note => ({ ...note, position: note.position + 3 }))
          .filter(note => note.position < 400);
      });
    }, 20);

    return () => clearInterval(animationInterval);
  }, []);

  // End game after 30 seconds
  useEffect(() => {
    const timeout = setTimeout(() => setGameActive(false), 30000);
    return () => clearTimeout(timeout);
  }, []);

  const handleKeyPress = (e) => {
    if (!gameActive) return;
    const key = e.key.toUpperCase();
    if (!['A', 'S', 'D', 'F'].includes(key)) return;

    e.preventDefault();

    // Check if note matches
    const hitNote = notes.find(n => n.key === key && n.position > 320 && n.position < 380);
    if (hitNote) {
      setScore(score + 10 + combo);
      setCombo(combo + 1);
      setNotes(prev => prev.filter(n => n.id !== hitNote.id));
    } else {
      setCombo(0);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [notes, gameActive, score, combo]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>🎵 Rhythm Rider</h2>
        <div className="game-stats">
          <div>Score: <strong>{score}</strong></div>
          <div>Combo: <strong>{combo}</strong></div>
          <div>Time: <strong>{gameActive ? '...' : 'DONE!'}</strong></div>
        </div>
      </div>

      <div className="rhythm-container">
        <div className="notes-area">
          {notes.map(note => (
            <div
              key={note.id}
              className="note falling"
              style={{ top: `${note.position}px` }}
            >
              {note.key}
            </div>
          ))}
          <div className="hit-line" />
        </div>

        <div className="key-guides">
          {['A', 'S', 'D', 'F'].map(key => (
            <div key={key} className="key-guide">
              {key}
            </div>
          ))}
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '10px' }}>
        Press A, S, D, or F when notes reach the line!
      </p>

      {!gameActive && (
        <div className="game-over">
          <h3>🎉 Game Over!</h3>
          <p>Final Score: {score}</p>
          <p>Best Combo: {combo}</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// GAME 3: PARTICLE SANDBOX (Drag & Drop)
// ============================================
const ParticleSandbox = ({ onGameEnd }) => {
  const [particles, setParticles] = useState([]);
  const [gravity, setGravity] = useState(0.3);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Physics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        return prev.map(p => {
          let newVy = p.vy + gravity;
          let newY = p.y + newVy;

          // Bounce off floor
          if (newY > 400) {
            newY = 400;
            newVy = -newVy * 0.7;
          }

          return { ...p, y: newY, vy: newVy };
        });
      });
    }, 30);

    return () => clearInterval(interval);
  }, [gravity]);

  const addParticle = (e) => {
    if (draggingId !== null) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newParticle = {
      id: Math.random(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 20 + 10,
      color: ['#FFB6C1', '#B0E0E6', '#DDA0DD', '#FFD1A3'][Math.floor(Math.random() * 4)],
    };

    setParticles(prev => [...prev, newParticle]);
  };

  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const particle = particles.find(p => p.id === id);
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - rect.left - particle.x,
      y: e.clientY - rect.top - particle.y,
    });
  };

  const handleMouseMove = (e) => {
    if (draggingId === null) return;
    const rect = containerRef.current.getBoundingClientRect();
    setParticles(prev =>
      prev.map(p =>
        p.id === draggingId
          ? { ...p, x: e.clientX - rect.left - dragOffset.x, y: e.clientY - rect.top - dragOffset.y, vy: 0 }
          : p
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>💫 Particle Sandbox</h2>
        <div className="game-stats">
          <div>Particles: <strong>{particles.length}</strong></div>
          <div>
            Gravity:
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(parseFloat(e.target.value))}
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="sandbox-container"
        onClick={addParticle}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {particles.map(particle => (
          <div
            key={particle.id}
            className="sandbox-particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              cursor: draggingId === particle.id ? 'grabbing' : 'grab',
            }}
            onMouseDown={(e) => handleMouseDown(e, particle.id)}
          />
        ))}
        <div className="sandbox-ground" />
      </div>

      <p style={{ textAlign: 'center', fontSize: '11px', marginTop: '10px' }}>
        Click to spawn particles • Drag to move • Adjust gravity slider
      </p>
    </div>
  );
};

// ============================================
// GAME 4: TYPING GAME (Word Blast)
// ============================================
const WordBlast = ({ onGameEnd }) => {
  const words = ['pixel', 'code', 'web', 'design', 'art', 'game', 'fun', 'animate', 'interact', 'create', 'build', 'visual'];
  const [gameActive, setGameActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [currentWords, setCurrentWords] = useState([]);
  const [nextWordId, setNextWordId] = useState(0);

  // Spawn words
  useEffect(() => {
    if (!gameActive) return;
    const interval = setInterval(() => {
      const word = words[Math.floor(Math.random() * words.length)];
      setCurrentWords(prev => [...prev, { id: nextWordId, word, y: 0 }]);
      setNextWordId(id => id + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, nextWordId]);

  // Drop words
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWords(prev =>
        prev
          .map(w => ({ ...w, y: w.y + 2 }))
          .filter(w => w.y < 300)
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Timer
  useEffect(() => {
    if (!gameActive) return;
    const timeout = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timeout);
  }, [gameActive]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.endsWith(' ')) {
      const typed = value.trim().toLowerCase();
      const matchedWord = currentWords.find(w => w.word === typed);

      if (matchedWord) {
        setScore(score + 10);
        setCurrentWords(prev => prev.filter(w => w.id !== matchedWord.id));
      }

      setInput('');
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>⌨️ Word Blast</h2>
        <div className="game-stats">
          <div>Score: <strong>{score}</strong></div>
          <div>Time: <strong>{timeLeft}s</strong></div>
          <div>Words: <strong>{currentWords.length}</strong></div>
        </div>
      </div>

      <div className="word-blast-area">
        {currentWords.map(w => (
          <div key={w.id} className="falling-word" style={{ top: `${w.y}px` }}>
            {w.word}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        disabled={!gameActive}
        placeholder="Type words here (space to submit)..."
        className="word-input"
        autoFocus
      />

      {!gameActive && (
        <div className="game-over">
          <h3>🎉 Game Over!</h3>
          <p>Final Score: {score}</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// GAME 5: MEMORY MATCH (Exploration Style)
// ============================================
const MemoryMaze = ({ onGameEnd }) => {
  const [difficulty, setDifficulty] = useState('easy');
  const gridSizes = { easy: [4, 3], medium: [4, 4], hard: [6, 4] };
  const [gridSize] = useState(gridSizes[difficulty]);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    const totalCards = gridSize[0] * gridSize[1];
    const pairs = totalCards / 2;
    const newCards = [];

    for (let i = 0; i < pairs; i++) {
      newCards.push(i, i);
    }

    setCards(newCards.sort(() => Math.random() - 0.5));
  }, [gridSize]);

  const handleCardClick = (index) => {
    if (flipped.includes(index) || matched.includes(index) || gameWon) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
      setMoves(moves + 1);
    }
  };

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameWon(true);
      onGameEnd?.({ score: moves, difficulty });
    }
  }, [matched, cards, moves, difficulty, onGameEnd]);

  const resetGame = () => {
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
    setCards(cards.sort(() => Math.random() - 0.5));
  };

  const emojis = ['🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎬', '🌟', '🍕', '🚀', '🎉'];

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>🧩 Memory Maze</h2>
        <div className="game-stats">
          <div>Moves: <strong>{moves}</strong></div>
          <div>Found: <strong>{matched.length / 2}</strong></div>
          <div>Difficulty: <strong>{difficulty}</strong></div>
        </div>
      </div>

      <div
        className="memory-grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize[0]}, 50px)`,
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className="memory-card"
            onClick={() => handleCardClick(index)}
            style={{
              opacity: flipped.includes(index) || matched.includes(index) ? 1 : 0.7,
            }}
          >
            {(flipped.includes(index) || matched.includes(index)) && emojis[card]}
          </div>
        ))}
      </div>

      {gameWon && (
        <div className="game-over">
          <h3>🎉 You Won!</h3>
          <p>Completed in {moves} moves</p>
          <button onClick={resetGame} style={{ marginTop: '10px' }}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// GAME 6: EXPLORATION GAME (Tiny World)
// ============================================
const TinyWorld = ({ onGameEnd }) => {
  const containerRef = useRef(null);
  const [playerPos, setPlayerPos] = useState({ x: 150, y: 150 });
  const [foundItems, setFoundItems] = useState([]);
  const [message, setMessage] = useState('Welcome to Pixel Land! 🌍');

  const items = [
    { id: 1, x: 50, y: 50, name: '⭐ Star', emoji: '⭐' },
    { id: 2, x: 250, y: 50, name: '🍕 Pizza', emoji: '🍕' },
    { id: 3, x: 300, y: 200, name: '💎 Diamond', emoji: '💎' },
    { id: 4, x: 100, y: 250, name: '🎁 Gift', emoji: '🎁' },
    { id: 5, x: 280, y: 280, name: '🏆 Trophy', emoji: '🏆' },
  ];

  const handleKeyPress = (e) => {
    const step = 15;
    const newPos = { ...playerPos };

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        newPos.y = Math.max(10, playerPos.y - step);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newPos.y = Math.min(330, playerPos.y + step);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newPos.x = Math.max(10, playerPos.x - step);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newPos.x = Math.min(330, playerPos.x + step);
        break;
      default:
        return;
    }

    e.preventDefault();
    setPlayerPos(newPos);

    // Check collision with items
    items.forEach(item => {
      if (
        !foundItems.includes(item.id) &&
        Math.abs(newPos.x - item.x) < 30 &&
        Math.abs(newPos.y - item.y) < 30
      ) {
        setFoundItems([...foundItems, item.id]);
        setMessage(`Found ${item.name}! (${foundItems.length + 1}/5)`);
      }
    });
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, foundItems]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>🗺️ Tiny World</h2>
        <div className="game-stats">
          <div>Found: <strong>{foundItems.length}/5</strong></div>
          <div>Pos: <strong>{playerPos.x.toFixed(0)}, {playerPos.y.toFixed(0)}</strong></div>
        </div>
      </div>

      <div className="world-container">
        <div className="world-grid">
          {items.map(item => (
            <div
              key={item.id}
              className={`world-item ${foundItems.includes(item.id) ? 'collected' : ''}`}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
              }}
              title={item.name}
            >
              {item.emoji}
            </div>
          ))}

          <div
            className="player-char"
            style={{
              left: `${playerPos.x}px`,
              top: `${playerPos.y}px`,
            }}
          >
            🧑
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '10px' }}>
        {message}
      </p>
      <p style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
        Use Arrow Keys or WASD to move • Find all items!
      </p>

      {foundItems.length === 5 && (
        <div className="game-over">
          <h3>🎉 You Found Everything!</h3>
          <p>Amazing explorer! 🌟</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN GAMES PAGE
// ============================================
const GamesPage = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [highScores, setHighScores] = useState({});

  const games = [
    {
      id: 'clicker',
      name: '🖱️ Pixel Clicker',
      description: 'Click to earn points. Buy upgrades. Go infinite!',
      component: PixelClicker,
      tag: 'Clicker',
    },
    {
      id: 'rhythm',
      name: '🎵 Rhythm Rider',
      description: 'Follow the beat with A, S, D, F keys',
      component: RhythmGame,
      tag: 'Rhythm',
    },
    {
      id: 'sandbox',
      name: '💫 Particle Sandbox',
      description: 'Click to spawn • Drag to manipulate physics',
      component: ParticleSandbox,
      tag: 'Physics',
    },
    {
      id: 'wordblast',
      name: '⌨️ Word Blast',
      description: 'Type falling words before they disappear',
      component: WordBlast,
      tag: 'Typing',
    },
    {
      id: 'memory',
      name: '🧩 Memory Maze',
      description: 'Match pairs in this classic memory game',
      component: MemoryMaze,
      tag: 'Puzzle',
    },
    {
      id: 'tinyworld',
      name: '🗺️ Tiny World',
      description: 'Explore and find all hidden items!',
      component: TinyWorld,
      tag: 'Exploration',
    },
  ];

  const handleGameEnd = (gameId, result) => {
    setHighScores({
      ...highScores,
      [gameId]: result,
    });
  };

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🎮 Game Collection</h1>
        <p>Pick a game and have fun! Chill or go chaotic. No pressure.</p>
      </div>

      {!activeGame ? (
        <div className="games-grid">
          {games.map(game => (
            <div
              key={game.id}
              className="game-card"
              onClick={() => setActiveGame(game.id)}
            >
              <div className="game-card-title">{game.name}</div>
              <div className="game-card-desc">{game.description}</div>
              <div className="game-card-tag">{game.tag}</div>
              {highScores[game.id] && (
                <div className="game-card-score">
                  Best: {highScores[game.id].score || highScores[game.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="game-view">
          <button className="back-btn" onClick={() => setActiveGame(null)}>
            ← Back to Games
          </button>
          {games.find(g => g.id === activeGame)?.component && (
            React.createElement(
              games.find(g => g.id === activeGame).component,
              { onGameEnd: (result) => handleGameEnd(activeGame, result) }
            )
          )}
        </div>
      )}
    </div>
  );
};

export default GamesPage;
