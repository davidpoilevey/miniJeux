import React, { useState, useEffect } from 'react';
import { GameOver } from '../ChuckNorrisFact';
import imgMerde from '../catrpg/assets/gipsy.png';
import imgMoi from './images/photoDPY.jpg';
import imgAv from '../bitLife/images/F/adulte/joueur.png';
import imgRod from '../catrpg/assets/rod.jpg';
import imgSev from '../catrpg/assets/sev.jpg';
import { IfNotMobile, useIsMobile } from '../hookGame';

// Pool de symboles disponibles (tu peux les customiser !)
const SYMBOL_POOL = [
  '🎮', '🎲',
  { type: 'image', src: imgRod, alt: 'rod' },
  { type: 'image', src: imgSev, alt: 'm' },
  { type: 'image', src: imgMerde, alt: 'm' },
  { type: 'image', src: imgMoi, alt: 'moi' },
  { type: 'image', src: imgAv, alt: 'eve' }
  , '🎯', '🎪', '🎨', '🎭', '🎺', '🎸',

  '⚽', '🏀', '🎾', '🏈', '⚾', '🥎', '🏐', '🏉',
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '⭐', '🌟', '✨', '💫', '🌙', '☀️', '🌈', '☁️',
  '❤️', '💚', '💙', '💜', '🧡', '💛', '🖤', '🤍'
];

const DobbleGame = () => {
  const [cards, setCards] = useState([]);
  const [playerCard, setPlayerCard] = useState(null);
  const [centerCard, setCenterCard] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [message, setMessage] = useState('');
  const [difficulty, setDifficulty] = useState('normal'); // easy, normal, hard
  const [deck, setDeck] = useState([]);
const isMobile = useIsMobile();
const cardSize = isMobile ? Math.min(200, window.innerWidth - 40) : 280;
     const [gameOver, setGameOver] = useState(false);

  // Difficulté : nombre de symboles par carte
const SYMBOLS_PER_CARD = {
  easy: 4,    // 3+1 = 4 symboles -> 13 cartes
  normal: 6,  // 5+1 = 6 symboles -> 31 cartes
  hard: 8     // 7+1 = 8 symboles -> 57 cartes
};

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
  }, [timeLeft, gameState]);

  // Génère un jeu de cartes Dobble valide
const generateDobbleCards = (numSymbolsPerCard) => {
  // Utilisation d'un plan projectif pour garantir qu'il y a EXACTEMENT 1 symbole commun
  // entre chaque paire de cartes
  
  const n = numSymbolsPerCard - 1; // Ordre du plan projectif
  const totalSymbols = n * n + n + 1;
  const totalCards = totalSymbols; // Même nombre de cartes que de symboles
  
  // Utiliser les symboles disponibles
  const symbols = SYMBOL_POOL.slice(0, totalSymbols);
  const cards = [];
  
  // Première carte : les n+1 premiers symboles
  cards.push(symbols.slice(0, n + 1));
  
  // n cartes suivantes : chacune contient le symbole 0 et des symboles selon un pattern
  for (let i = 0; i < n; i++) {
    const card = [symbols[0]];
    for (let j = 0; j < n; j++) {
      card.push(symbols[1 + n * j + i]);
    }
    cards.push(card);
  }
  
  // n² cartes restantes : pattern plus complexe
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const card = [symbols[i + 1]];
      for (let k = 0; k < n; k++) {
        card.push(symbols[n + 1 + n * k + ((i * k + j) % n)]);
      }
      cards.push(card);
    }
  }
  
  // Mélanger les symboles dans chaque carte pour plus de fun
  return cards.map(card => {
    const shuffled = [...card];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
};

  const startGame = () => {
    const numSymbols = SYMBOLS_PER_CARD[difficulty];
    const newDeck = generateDobbleCards(numSymbols);
    setDeck([...newDeck]);
    setPlayerCard(newDeck[Math.floor(Math.random() * newDeck.length-1)+1]); // éviter la première carte
    setCenterCard(newDeck[0]);
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
    setMessage('Trouve le symbole commun !');
  };

  const endGame = () => {
    setGameState('gameOver');
    setGameOver(true);
    setMessage(`Partie terminée ! Score final : ${score}`);
  };

  const handleSymbolClick = (symbol) => {
    if (gameState !== 'playing') return;

    // Vérifier si le symbole est présent dans les deux cartes
    if (playerCard.includes(symbol) && centerCard.includes(symbol)) {
      // Bonne réponse !
      setScore(score + 10);
      setMessage('✅ Bien joué ! +10 points');
      
      // Nouvelle carte au centre
      const remainingDeck = deck.filter(card => card !== playerCard && card !== centerCard);
      if (remainingDeck.length === 0) {
        // Régénérer le deck
        const numSymbols = SYMBOLS_PER_CARD[difficulty];
        const newDeck = generateDobbleCards(numSymbols);
        setDeck([...newDeck]);
        setCenterCard(newDeck[0]);
      } else {
        setCenterCard(remainingDeck[Math.floor(Math.random() * remainingDeck.length)]);
      }
      // shuffle player card
      setPlayerCard(pc=>{
 const shuffled = [...pc];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
      })
     
      
      // Bonus de temps
      if(difficulty!='easy')
      setTimeLeft(prev => Math.min(prev + 1, 99));
    } else {
      // Mauvaise réponse
      setScore(Math.max(0, score - 5));
      setMessage('❌ Raté ! -5 points');
      setTimeLeft(prev => Math.max(0, prev - 2));
    }
  };

  const renderCard = (cardSymbols, isPlayerCard) => {
    if (!cardSymbols) return null;

    const positions = generateCircularPositions(cardSymbols.length, cardSize);

    const cardStyle = {
      width: `${cardSize}px`,
      height: `${cardSize}px`,
      borderRadius: '50%',
      backgroundColor: isPlayerCard ? '#fef3c7' : '#dbeafe',
      border: `4px solid ${isPlayerCard ? '#f59e0b' : '#3b82f6'}`,
      position: 'relative',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    return (
      <div style={cardStyle}>
        {cardSymbols.map((symbol, index) => {
          const pos = positions[index];
          const rotation = Math.random() * 90;
          const size = 40 + Math.random() * 20;
          const isImage = typeof symbol === 'object' && symbol.type === 'image';
          const symbolStyle = {
            position: 'absolute',
            fontSize: `${size * (cardSize / 280)}px`,
            cursor: isPlayerCard ? 'pointer' : 'default',
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transition: 'transform 1s ease',
            userSelect: 'none'
          };

          return (
            <div
    key={index}
    style={symbolStyle}
    onClick={() => isPlayerCard && handleSymbolClick(symbol)}
    onMouseEnter={(e) => isPlayerCard && (e.target.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1.2)`)}
    onMouseLeave={(e) => isPlayerCard && (e.target.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`)}
  >
    {isImage ? (
      <img 
        src={symbol.src} 
        alt={symbol.alt}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}
      />
    ) : (
      symbol
    )}
  </div>
          );
        })}
      </div>
    );
  };

  const generateCircularPositions = (count, cardSize) => {
    const positions = [];
    const centerRadius = 35; // Rayon du cercle de distribution
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const radius = i === 0 ? 0 : centerRadius; // Premier symbole au centre
      
      positions.push({
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle)
      });
    }
    
    return positions;
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: isMobile?'2px':'20px',
    fontFamily: 'Arial, sans-serif'
  };

  const titleStyle = {
    fontSize: '48px',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: isMobile?'2px':'20px',
    marginTop: isMobile?'2px':'20px',
    
    textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
  };

  const hudStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginBottom: isMobile?'10px':'30px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white'
  };

  const statStyle = {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '10px 20px',
    borderRadius: '10px',
    minWidth: '120px',
    textAlign: 'center'
  };

  const gameAreaStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: isMobile ? '16px' : '60px',
    marginTop: isMobile ? '8px' : '40px',
  };

  const messageStyle = {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fde047',
    marginBottom: '20px',
    minHeight: '30px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  };

  const buttonStyle = {
    backgroundColor: '#10b981',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    padding: '15px 40px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
  };

  const menuStyle = {
    maxWidth: '600px',
    margin: isMobile?'auto':'100px auto',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: isMobile?'4px':'40px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
  };

  const difficultyButtonStyle = (diff) => ({
    backgroundColor: difficulty === diff ? '#3b82f6' : '#e5e7eb',
    color: difficulty === diff ? 'white' : '#374151',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    margin: '0 10px'
  });

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🎯 DOBBLE 🎯</h1>
  <GameOver open={gameOver} score={score}  gameName="Dobble"
                        handleClose={() => { setGameOver(false); }}
                         handleRestart={startGame} />
      {gameState === 'menu' && (
        <div style={menuStyle}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#1f2937' }}>
            Bienvenue !
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '30px', color: '#6b7280' }}>
            Trouve le symbole commun entre ta carte et la carte centrale !
          </p>
          
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#374151' }}>
              Difficulté :
            </h3>
            <button
              style={difficultyButtonStyle('easy')}
              onClick={() => setDifficulty('easy')}
            >
              Facile (4 symboles)
            </button>
            <button
              style={difficultyButtonStyle('normal')}
              onClick={() => setDifficulty('normal')}
            >
              Normal (6 symboles)
            </button>
            <button
              style={difficultyButtonStyle('hard')}
              onClick={() => setDifficulty('hard')}
            >
              Difficile (8 symboles)
            </button>
          </div>

          <button
            style={buttonStyle}
            onClick={startGame}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            🚀 Commencer
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <div style={hudStyle}>
            <div style={statStyle}>
              ⏱️ {timeLeft}s
            </div>
            <div style={statStyle}>
              🏆 {score} pts
            </div>
          </div>

          <div style={messageStyle}>{message}</div>

          <div style={gameAreaStyle}>
            <div style={{ textAlign: 'center' }}>
             {!isMobile && <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>
                Ta carte - Clique sur le symbole commun !
              </div>}
              {renderCard(playerCard, true)}
            </div>
        <IfNotMobile>
          
            <div style={{ fontSize: '60px', color: 'white' }}>⚡</div>

        </IfNotMobile>
            <div style={{ textAlign: 'center' }}>
               <IfNotMobile>
               <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>
                Carte centrale
              </div>
               </IfNotMobile>
              {renderCard(centerCard, false)}
            </div>
          </div>
        </>
      )}

      {gameState === 'gameOver' && (
        <div style={menuStyle}>
          <h2 style={{ fontSize: '40px', marginBottom: '20px', color: '#1f2937' }}>
            Partie terminée !
          </h2>
          <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '30px' }}>
            {score} points
          </p>
          <button
            style={buttonStyle}
            onClick={() => setGameState('menu')}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            🔄 Rejouer
          </button>
        </div>
      )}
    </div>
  );
};

export default DobbleGame;