import React, { useState, useEffect, useCallback } from 'react';

// ============================================
// GAME SCAFFOLD #1: MEMORY MATCHING GAME
// ============================================
export const MemoryGame = ({ onGameEnd, difficulty = 'easy' }) => {
  const gridSizes = { easy: [4, 3], medium: [4, 4], hard: [6, 4] };
  const [gridSize] = useState(gridSizes[difficulty]);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  // Initialize cards
  useEffect(() => {
    const totalCards = gridSize[0] * gridSize[1];
    const pairs = totalCards / 2;
    const newCards = [];
    
    for (let i = 0; i < pairs; i++) {
      newCards.push(i, i); // Create pairs
    }
    
    setCards(newCards.sort(() => Math.random() - 0.5));
  }, [gridSize]);

  const handleCardClick = useCallback((index) => {
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
  }, [flipped, matched, cards, gameWon, moves]);

  // Check if game is won
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameWon(true);
      onGameEnd?.({ score: moves, result: 'won' });
    }
  }, [matched, cards, moves, onGameEnd]);

  const resetGame = () => {
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
    setCards(cards.sort(() => Math.random() - 0.5));
  };

  const emojis = ['🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎬'];

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Memory Match Game</h2>
      <p>Moves: {moves}</p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize[0]}, 60px)`,
        gap: '10px',
        justifyContent: 'center',
        margin: '20px 0',
      }}>
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(index)}
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: flipped.includes(index) || matched.includes(index) ? '#FFD1A3' : '#8B4513',
              border: '3px solid #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '30px',
              userSelect: 'none',
              transform: flipped.includes(index) ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'all 0.3s ease',
            }}
          >
            {(flipped.includes(index) || matched.includes(index)) && emojis[card]}
          </div>
        ))}
      </div>

      {gameWon && (
        <div style={{ marginTop: '20px' }}>
          <h3>🎉 You Won! Moves: {moves}</h3>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

// ============================================
// GAME SCAFFOLD #2: TYPING SPEED TEST
// ============================================
export const TypingGame = ({ onGameEnd, duration = 60 }) => {
  const words = ['pixel', 'creative', 'design', 'code', 'web', 'develop', 'art', 'animation', 'interactive', 'game', 'fun', 'awesome'];
  
  const [currentWord, setCurrentWord] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameActive, setGameActive] = useState(true);
  const [wpm, setWpm] = useState(0);

  // Timer
  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  const handleInput = (e) => {
    const value = e.target.value;
    setInput(value);

    // Check if word is complete
    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      if (typedWord === words[currentWord]) {
        setScore(score + 1);
        setWpm(Math.round((score + 1) / ((duration - timeLeft) / 60)));
        setCurrentWord((currentWord + 1) % words.length);
      }
      setInput('');
    }
  };

  useEffect(() => {
    if (!gameActive) {
      onGameEnd?.({ score, wpm, timeElapsed: duration - timeLeft });
    }
  }, [gameActive, score, wpm, duration, timeLeft, onGameEnd]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Speed Typing Challenge</h2>
      <h3>Time: {timeLeft}s | Score: {score} | WPM: {wpm}</h3>
      
      <div style={{ fontSize: '24px', marginBottom: '20px', minHeight: '40px' }}>
        <span style={{ color: gameActive ? '#000' : '#ccc' }}>
          {words[currentWord]}
        </span>
      </div>

      <input
        type="text"
        value={input}
        onChange={handleInput}
        disabled={!gameActive}
        placeholder="Start typing..."
        autoFocus
        style={{
          fontSize: '16px',
          padding: '10px',
          border: '2px solid #000',
          width: '200px',
        }}
      />

      {!gameActive && (
        <div style={{ marginTop: '20px' }}>
          <h3>Game Over! Final Score: {score}</h3>
          <p>WPM: {wpm} | Accuracy: {Math.round((score / (currentWord + score)) * 100)}%</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// GAME SCAFFOLD #3: EMOTION ROULETTE
// ============================================
export const EmotionRoulette = ({ emotions = ['happy', 'sad', 'confused', 'angry'], onGameEnd }) => {
  const [spinning, setSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [guessed, setGuessed] = useState(false);
  const [correctGuess, setCorrectGuess] = useState(false);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setGuessed(false);
    setSelectedEmotion(null);

    const rotation = Math.random() * 360;
    const segmentAngle = 360 / emotions.length;
    const selectedIndex = Math.floor(((360 - rotation) % 360) / segmentAngle);

    setTimeout(() => {
      setCurrentRotation(rotation);
      setSelectedEmotion(emotions[selectedIndex]);
      setSpinning(false);
    }, 2000);
  };

  const makeGuess = (emotion) => {
    const isCorrect = emotion === selectedEmotion;
    setCorrectGuess(isCorrect);
    setGuessed(true);
    onGameEnd?.({ guessed: emotion, correct: selectedEmotion, isCorrect });
  };

  const colors = ['#FFD1A3', '#FFB6C1', '#B0E0E6', '#DDA0DD'];

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Emotion Roulette</h2>
      
      <div
        style={{
          width: '200px',
          height: '200px',
          margin: '20px auto',
          borderRadius: '50%',
          border: '8px solid #000',
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(emotions.length))}, 1fr)`,
          transform: `rotate(${currentRotation}deg)`,
          transition: spinning ? 'transform 2s ease-out' : 'none',
        }}
      >
        {emotions.map((emotion, i) => (
          <div
            key={i}
            style={{
              backgroundColor: colors[i % colors.length],
              border: '2px solid #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '5px',
              textAlign: 'center',
            }}
          >
            {emotion}
          </div>
        ))}
      </div>

      <button onClick={spinWheel} disabled={spinning} style={{ marginBottom: '20px' }}>
        {spinning ? 'Spinning...' : 'SPIN!'}
      </button>

      {selectedEmotion && !guessed && (
        <div>
          <p>What emotion is it?</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {emotions.map((emotion) => (
              <button key={emotion} onClick={() => makeGuess(emotion)}>
                {emotion}
              </button>
            ))}
          </div>
        </div>
      )}

      {guessed && (
        <div>
          <h3>{correctGuess ? '✅ Correct!' : '❌ Wrong!'}</h3>
          <p>It was: {selectedEmotion}</p>
          <button onClick={spinWheel}>Spin Again</button>
        </div>
      )}
    </div>
  );
};

// ============================================
// GAME SCAFFOLD #4: CLICK COUNTER (EXPANDABLE)
// ============================================
export const ClickCounter = ({ onMilestone }) => {
  const [clicks, setClicks] = useState(0);
  const [messages, setMessages] = useState([]);

  const milestones = {
    1: "Haha, more!",
    3: "That tickles! 😄",
    5: "Getting excited!",
    7: "STOP! (jk)",
    10: "THAT'S ENOUGH!",
    15: "I'm breakin'! 💥",
    20: "Okay, you win...",
  };

  const handleClick = () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);

    if (milestones[newClicks]) {
      setMessages([...messages, milestones[newClicks]]);
      onMilestone?.(newClicks);
      
      // Clear old messages
      if (messages.length > 3) {
        setMessages(messages.slice(-3));
      }
    }

    // Easter egg at 10
    if (newClicks === 10) {
      // Trigger screen shake, particle burst, etc
      console.log('10 CLICKS! EASTER EGG!');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Click Counter: {clicks}</h3>
      <button
        onClick={handleClick}
        style={{
          padding: '20px 40px',
          fontSize: '16px',
          cursor: 'pointer',
          transform: `scale(${1 + clicks * 0.02})`,
          transition: 'transform 0.1s',
        }}
      >
        Click Me!
      </button>
      <div style={{ marginTop: '20px', height: '60px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ opacity: 0.8, fontSize: '12px' }}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// UTILITY: GAME MODAL WRAPPER
// ============================================
export const GameModal = ({ isOpen, onClose, game, title }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#f5f5f5',
          border: '4px solid #000',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '24px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
        <h2>{title}</h2>
        {game}
      </div>
    </div>
  );
};

// ============================================
// USAGE EXAMPLE IN YOUR HOMEPAGE
// ============================================
/*
import { MemoryGame, TypingGame, EmotionRoulette, GameModal } from './games/GameScaffolds';

export const HomePageWithGames = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [scores, setScores] = useState({});

  const handleGameEnd = (gameType, result) => {
    setScores({ ...scores, [gameType]: result });
    // Show highscore, etc
  };

  return (
    <div>
      {/* Your existing face content */}
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <h2>Mini Games</h2>
        <button onClick={() => setActiveGame('memory')}>🧠 Memory Match</button>
        <button onClick={() => setActiveGame('typing')}>⌨️ Typing Speed</button>
        <button onClick={() => setActiveGame('roulette')}>🎡 Emotion Roulette</button>
      </div>

      <GameModal
        isOpen={activeGame === 'memory'}
        onClose={() => setActiveGame(null)}
        game={<MemoryGame onGameEnd={(r) => handleGameEnd('memory', r)} />}
        title="Memory Matching"
      />

      <GameModal
        isOpen={activeGame === 'typing'}
        onClose={() => setActiveGame(null)}
        game={<TypingGame onGameEnd={(r) => handleGameEnd('typing', r)} />}
        title="Typing Speed Test"
      />

      <GameModal
        isOpen={activeGame === 'roulette'}
        onClose={() => setActiveGame(null)}
        game={<EmotionRoulette onGameEnd={(r) => handleGameEnd('roulette', r)} />}
        title="Emotion Roulette"
      />
    </div>
  );
};
*/
