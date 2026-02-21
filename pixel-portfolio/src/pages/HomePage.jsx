import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [faceState, setFaceState] = useState("idle");
  const [blinking, setBlinking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredButton, setHoveredButton] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  const [inputText, setInputText] = useState("");

  const faceContainerRef = useRef(null);
  const blinkTimeoutRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      } catch (e) {
        console.warn("Audio failed:", e);
      }
    }
  }, []);

  // Blink animation
  useEffect(() => {
    if (faceState === "idle" || faceState === "looking") {
      const randomBlink = () => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 150);
        blinkTimeoutRef.current = setTimeout(
          randomBlink,
          Math.random() * 3000 + 2000,
        );
      };
      randomBlink();
      return () => clearTimeout(blinkTimeoutRef.current);
    }
  }, [faceState]);

  // Tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setFaceState("wakeup");
        setTimeout(() => setFaceState("idle"), 800);
      } else {
        setFaceState("sleep");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Mouse tracking for face
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!faceContainerRef.current) return;

      const rect = faceContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const distance = 8;

      setMousePos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });

      if (faceState === "idle" || faceState === "looking") {
        setFaceState("looking");
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => setFaceState("idle"), 2000);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [faceState]);

  // Sound effects
  const playSound = (type) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    try {
      if (type === "hover") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      console.warn("Sound error:", e);
    }
  };

  // Button handlers
  const handleButtonHover = (buttonName) => {
    setHoveredButton(buttonName);
    playSound("hover");

    const states = {
      about: "curious",
      work: "determined",
      contact: "happy",
      games: "excited",
    };
    setFaceState(states[buttonName] || "idle");
  };

  const handleButtonLeave = () => {
    setHoveredButton(null);
    setFaceState("idle");
  };

  const handleFaceClick = () => {
    setClickCount((prev) => prev + 1);
    playSound("click");
    setFaceState("surprised");

    if (clickCount + 1 === 10) {
      setFaceState("broken");
      setTimeout(() => {
        setFaceState("idle");
        setClickCount(0);
      }, 2000);
    } else {
      setTimeout(() => setFaceState("idle"), 800);
    }
  };

  // Easter egg keyboard detection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (inputText.toLowerCase().includes("hello")) {
          setFaceState("waving");
          setTimeout(() => setFaceState("idle"), 1000);
        } else if (inputText.toLowerCase().includes("angry")) {
          setFaceState("angry");
          setTimeout(() => setFaceState("idle"), 1200);
        }
        setInputText("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputText]);

  // Get face expression SVG
  const FaceExpression = ({ state, blinking, mousePos }) => {
    const eyeOffset = blinking ? { x: 0, y: 0 } : mousePos;

    const expressions = {
      idle: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <rect
            x="20"
            y="20"
            width="8"
            height="8"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <rect
            x="36"
            y="20"
            width="8"
            height="8"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <rect
            x={24 + eyeOffset.x}
            y={23 + eyeOffset.y}
            width="3"
            height="3"
            fill="#000"
          />
          <rect
            x={40 + eyeOffset.x}
            y={23 + eyeOffset.y}
            width="3"
            height="3"
            fill="#000"
          />
          <line x1="20" y1="42" x2="44" y2="42" stroke="#000" strokeWidth="2" />
          <line x1="44" y1="42" x2="44" y2="44" stroke="#000" strokeWidth="2" />
        </svg>
      ),
      looking: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <rect
            x="20"
            y="20"
            width="8"
            height="8"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <rect
            x="36"
            y="20"
            width="8"
            height="8"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <rect
            x={24 + eyeOffset.x}
            y={23 + eyeOffset.y}
            width="3"
            height="3"
            fill="#000"
          />
          <rect
            x={40 + eyeOffset.x}
            y={23 + eyeOffset.y}
            width="3"
            height="3"
            fill="#000"
          />
          <line x1="20" y1="42" x2="44" y2="42" stroke="#000" strokeWidth="2" />
          <line x1="44" y1="42" x2="44" y2="44" stroke="#000" strokeWidth="2" />
        </svg>
      ),
      curious: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
            transform="rotate(-5 32 32)"
          />
          <rect
            x="20"
            y="16"
            width="8"
            height="10"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <rect
            x="36"
            y="20"
            width="8"
            height="8"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <rect x="24" y="20" width="3" height="3" fill="#000" />
          <rect x="40" y="23" width="3" height="3" fill="#000" />
          <polyline
            points="20,44 32,46 44,44"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
        </svg>
      ),
      determined: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <line x1="20" y1="22" x2="28" y2="24" stroke="#000" strokeWidth="2" />
          <line x1="36" y1="22" x2="44" y2="24" stroke="#000" strokeWidth="2" />
          <rect x="24" y="23" width="2" height="2" fill="#000" />
          <rect x="40" y="23" width="2" height="2" fill="#000" />
          <line x1="20" y1="42" x2="44" y2="42" stroke="#000" strokeWidth="2" />
        </svg>
      ),
      happy: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <circle cx="24" cy="24" r="4" fill="#000" />
          <circle cx="40" cy="24" r="4" fill="#000" />
          <circle cx="14" cy="38" r="3" fill="#FFB6C1" opacity="0.6" />
          <circle cx="50" cy="38" r="3" fill="#FFB6C1" opacity="0.6" />
          <polyline
            points="20,40 32,48 44,40"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
        </svg>
      ),
      excited: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <circle
            cx="24"
            cy="22"
            r="5"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <circle
            cx="40"
            cy="22"
            r="5"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <circle cx="24" cy="22" r="2" fill="#000" />
          <circle cx="40" cy="22" r="2" fill="#000" />
          <circle cx="14" cy="36" r="4" fill="#FFB6C1" opacity="0.7" />
          <circle cx="50" cy="36" r="4" fill="#FFB6C1" opacity="0.7" />
          <polyline
            points="18,44 32,50 46,44"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
        </svg>
      ),
      surprised: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <circle
            cx="24"
            cy="22"
            r="6"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <circle
            cx="40"
            cy="22"
            r="6"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <circle cx="24" cy="22" r="3" fill="#000" />
          <circle cx="40" cy="22" r="3" fill="#000" />
          <circle cx="32" cy="44" r="4" fill="#000" />
        </svg>
      ),
      waving: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <circle cx="24" cy="24" r="4" fill="#000" />
          <circle cx="40" cy="24" r="4" fill="#000" />
          <circle cx="14" cy="38" r="3" fill="#FFB6C1" opacity="0.6" />
          <circle cx="50" cy="38" r="3" fill="#FFB6C1" opacity="0.6" />
          <polyline
            points="20,40 32,46 44,40"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
          <rect
            x="48"
            y="12"
            width="8"
            height="8"
            fill="#FFD1A3"
            stroke="#000"
            strokeWidth="1"
          />
          <polyline
            points="52,12 56,8 58,10 56,14"
            fill="none"
            stroke="#000"
            strokeWidth="1"
          />
        </svg>
      ),
      angry: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <line x1="18" y1="18" x2="26" y2="22" stroke="#000" strokeWidth="2" />
          <line x1="38" y1="18" x2="46" y2="22" stroke="#000" strokeWidth="2" />
          <rect x="24" y="23" width="2" height="2" fill="#000" />
          <rect x="40" y="23" width="2" height="2" fill="#000" />
          <line x1="24" y1="44" x2="40" y2="44" stroke="#000" strokeWidth="2" />
        </svg>
      ),
      broken: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <line x1="20" y1="20" x2="28" y2="28" stroke="#000" strokeWidth="2" />
          <line x1="28" y1="20" x2="20" y2="28" stroke="#000" strokeWidth="2" />
          <line x1="36" y1="20" x2="44" y2="28" stroke="#000" strokeWidth="2" />
          <line x1="44" y1="20" x2="36" y2="28" stroke="#000" strokeWidth="2" />
          <line x1="20" y1="42" x2="44" y2="46" stroke="#000" strokeWidth="2" />
        </svg>
      ),
      sleep: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <line x1="20" y1="24" x2="28" y2="24" stroke="#000" strokeWidth="2" />
          <line x1="36" y1="24" x2="44" y2="24" stroke="#000" strokeWidth="2" />
          <polyline
            points="20,42 32,46 44,42"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
          <text x="48" y="16" fontSize="12" fill="#000">
            Z
          </text>
        </svg>
      ),
      wakeup: (
        <svg viewBox="0 0 64 64" className="face-svg">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            fill="#FFD1A3"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <circle
            cx="24"
            cy="24"
            r="5"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <circle
            cx="40"
            cy="24"
            r="5"
            fill="#FFF"
            stroke="#000"
            strokeWidth="1"
          />
          <circle cx="24" cy="24" r="2" fill="#000" />
          <circle cx="40" cy="24" r="2" fill="#000" />
          <polyline
            points="20,42 32,46 44,42"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
        </svg>
      ),
    };

    return expressions[state] || expressions.idle;
  };

  return (
    <div className="home-page">
      <div className="pixel-bg" />

      <div className="container">
        {/* Face Section */}
        <div className="face-section">
          <div
            ref={faceContainerRef}
            className={`face-container ${faceState} ${blinking ? "blinking" : ""}`}
            onClick={handleFaceClick}
            title="Click me!"
            style={{
              "--shadow-offset-x": `${mousePos.x}px`,
              "--shadow-offset-y": `${mousePos.y}px`,
            }}
          >
            <FaceExpression
              state={faceState}
              blinking={blinking}
              mousePos={blinking ? { x: 0, y: 0 } : mousePos}
            />
          </div>

          {/* Text Bubble */}
          <div
            className={`text-bubble ${faceState !== "idle" ? "active" : ""}`}
          >
            <div className="bubble-content">
              {faceState === "curious" && "What brings you here?"}
              {faceState === "determined" && "Let's see what I built!"}
              {faceState === "happy" && "Get in touch! 💌"}
              {faceState === "excited" && "Let's play games!"}
              {faceState === "waving" && "Hey there! 👋"}
              {faceState === "angry" && "RAAAAWR! 😤"}
              {faceState === "surprised" && "Ouch!"}
              {faceState === "looking" && "I see you..."}
              {faceState === "broken" && "System error! ...jk"}
              {faceState === "sleep" && "Zzz..."}
              {faceState === "wakeup" && "Oh, welcome back!"}
              {faceState === "idle" && "Click me!"}
            </div>
            <div className="bubble-tail" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="welcome-section">
          <h1 className="title">Welcome!</h1>
          <p className="subtitle">
            I'm a pixel artist & developer crafting interactive experiences.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="button-group">
          {[
            { name: "about", label: "📖 About" },
            { name: "work", label: "🎨 Work" },
            { name: "games", label: "🎮 Games", navigate: "/games" },
            { name: "contact", label: "💬 Contact" },
          ].map((btn) => (
            <button
              key={btn.name}
              className={`pixel-button ${hoveredButton === btn.name ? "hovered" : ""}`}
              onMouseEnter={() => handleButtonHover(btn.name)}
              onMouseLeave={handleButtonLeave}
              onClick={() => {
                playSound("click");
                if (btn.navigate) {
                  navigate(btn.navigate);
                }
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Easter Egg Input - Hidden */}
        <input
          type="text"
          placeholder="Type for easter eggs"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ display: "none" }}
          autoFocus
        />
      </div>
    </div>
  );
};

export default HomePage;
