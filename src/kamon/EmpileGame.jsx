import React, { useState, useEffect } from 'react';
import EmpileBoard from './EmpileBoard';

const EmpileGame = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing'
  const [savedGameExists, setSavedGameExists] = useState(false);

  useEffect(() => {
    // Vérifier s'il y a une sauvegarde
    const checkSavedGame = () => {
        
      try {
        const saved = localStorage.getItem("empile-savegame");
        setSavedGameExists(!!saved);
      } catch (error) {
        setSavedGameExists(false);
      }
    };
    checkSavedGame();
  }, []);

  const handleNewGame = () => {
    // Supprimer la sauvegarde existante
    try {
      localStorage.deleteItem('empile-savegame');
    } catch (error) {
      console.log('Pas de sauvegarde à supprimer');
    }
    setGameState('playing');
  };

  const handleLoadGame = () => {
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  if (gameState === 'menu') {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{
          fontSize: 72,
          color: 'white',
          marginBottom: 20,
          textShadow: '4px 4px 8px rgba(0,0,0,0.3)',
          letterSpacing: 4
        }}>
          EMPILE
        </h1>
        
        <p style={{
          fontSize: 20,
          color: 'rgba(255,255,255,0.9)',
          marginBottom: 60,
          textAlign: 'center',
          maxWidth: 500
        }}>
          Empilez les pièces de même couleur , quand la pile de couleur atteint 10 elle disparait.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <button
            onClick={handleNewGame}
            style={{
              padding: '20px 60px',
              fontSize: 24,
              fontWeight: 'bold',
              color: 'white',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              borderRadius: 50,
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              minWidth: 300
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
            }}
          >
            🎮 Nouveau Jeu
          </button>

          {savedGameExists && (
            <button
              onClick={handleLoadGame}
              style={{
                padding: '20px 60px',
                fontSize: 24,
                fontWeight: 'bold',
                color: 'white',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                borderRadius: 50,
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                minWidth: 300
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
              }}
            >
              📂 Charger Partie
            </button>
          )}
        </div>

        <p style={{
          marginTop: 80,
          fontSize: 14,
          color: 'rgba(255,255,255,0.6)'
        }}>
          La partie est sauvegardée automatiquement à chaque niveau
        </p>
      </div>
    );
  }

  return <EmpileBoard onBackToMenu={handleBackToMenu} loadSavedGame={gameState === 'playing'} />;
};

export default EmpileGame;