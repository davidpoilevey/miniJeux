import { useState, useEffect, useCallback } from 'react';
import fondTel from './images/fondTel.jpg';
import { PROVERBES } from './ProverbeData';
import { GameOver } from '../ChuckNorrisFact';

const MODES = [
  { key: 'facile',  label: '🌸 Facile',  count: 20,  color: '#10b981', desc: '20 questions' },
  { key: 'medium',  label: '🔥 Medium',  count: 50,  color: '#f59e0b', desc: '50 questions' },
  { key: 'expert',  label: '💀 Expert',  count: null, color: '#ef4444', desc: 'Les 140+ !' },
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildQuestion = (proverbe) => ({
  debut: proverbe.debut,
  fin: proverbe.fin,
  choix: shuffle([proverbe.fin, ...proverbe.leurres]),
});

const buildDeck = (count) => {
  const all = shuffle([...PROVERBES]).map(buildQuestion);
  return count ? all.slice(0, count) : all;
};

const panelStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  fontFamily: 'Georgia, serif',
  padding: '20px 16px 28px',
  width: '100%', maxWidth: 420,
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(10px)',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  marginTop: 8,
};

export const Proverbe = () => {
  const [difficulty, setDifficulty] = useState(null); // null = menu
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [choisi, setChoisi] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const current = deck[index];
  const total = deck.length;
  const done = index >= total && total > 0;

  const startGame = (mode) => {
    setDeck(buildDeck(mode.count));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setChoisi(null);
    setGameOver(false);
    setDifficulty(mode.key);
  };

  const backToMenu = () => {
    setDifficulty(null);
    setGameOver(false);
  };

  const handleChoix = useCallback((choix) => {
    if (selected !== null) return;
    const correct = choix === current.fin;
    setChoisi(choix);
    setSelected(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);
  }, [selected, current]);

  useEffect(() => {
    if (selected === null) return;
    const t = setTimeout(() => {
      if (index + 1 >= total) {
        setGameOver(true);
      } else {
        setIndex(i => i + 1);
        setSelected(null);
        setChoisi(null);
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [selected, index, total]);

  const wrapper = (children) => (
    <div style={{
      minHeight: '100dvh',
      backgroundImage: `url(${fondTel})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: 16,
      overflowY: 'auto',
    }}>
      {children}
    </div>
  );

  // ── Écran menu ──
  if (!difficulty) {
    return wrapper(
      <div style={panelStyle}>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#92400e', marginBottom: 6, letterSpacing: 1 }}>
          📖 Proverbes
        </div>
        <div style={{ fontSize: 15, color: '#78716c', marginBottom: 28, textAlign: 'center' }}>
          Complète le proverbe, la réplique ou la chanson !
        </div>
        {MODES.map((mode) => (
          <button
            key={mode.key}
            onClick={() => startGame(mode)}
            style={{
              width: '100%', marginBottom: 14,
              padding: '18px 20px',
              fontSize: 20, fontFamily: 'Georgia, serif', fontWeight: 'bold',
              background: mode.color, color: 'white',
              border: 'none', borderRadius: 16, cursor: 'pointer',
              boxShadow: `0 4px 12px ${mode.color}66`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span>{mode.label}</span>
            <span style={{ fontSize: 14, opacity: 0.9, fontFamily: 'sans-serif' }}>{mode.desc}</span>
          </button>
        ))}
      </div>
    );
  }

  // ── Écran jeu ──
  return wrapper(
    <div style={panelStyle}>
      <GameOver
        open={gameOver}
        gameName="Proverbes"
        score={Math.round((score / total) * 100)}
        handleClose={backToMenu}
        handleRestart={backToMenu}
      />

      {/* Titre + bouton retour menu */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 'bold', color: '#92400e' }}>📖 Proverbes</div>
        <button onClick={backToMenu} style={{
          fontSize: 13, color: '#78716c', background: 'transparent',
          border: '1px solid #d6d3d1', borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
        }}>← Menu</button>
      </div>

      {/* Progression */}
      <div style={{ fontSize: 14, color: '#78716c', marginBottom: 10 }}>
        {Math.min(index + 1, total)} / {total} — Score : {score}
      </div>

      {/* Barre de progression */}
      <div style={{ width: '100%', height: 8, background: '#e7e5e4', borderRadius: 8, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{
          width: `${(index / total) * 100}%`,
          height: '100%', background: '#f59e0b', borderRadius: 8,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Début du proverbe */}
      <div style={{
        fontSize: 22, fontWeight: 'bold', color: '#1c1917',
        textAlign: 'center', marginBottom: 28, lineHeight: 1.4, minHeight: 64,
      }}>
        {done ? '🎉 Terminé !' : `« ${current.debut} »`}
      </div>

      {/* Boutons réponses */}
      {!done && current.choix.map((choix) => {
        let bg = '#fef3c7', border = '2px solid #fbbf24', color = '#1c1917';
        if (selected !== null) {
          if (choix === current.fin)                              { bg = '#d1fae5'; border = '2px solid #10b981'; color = '#065f46'; }
          else if (choix === choisi && selected === 'wrong')     { bg = '#fee2e2'; border = '2px solid #ef4444'; color = '#7f1d1d'; }
          else                                                    { bg = '#f5f5f4'; border = '2px solid #d6d3d1'; color = '#a8a29e'; }
        }
        return (
          <button key={choix} onClick={() => handleChoix(choix)} style={{
            width: '100%', marginBottom: 12,
            padding: '16px 20px',
            fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 'bold', textAlign: 'center',
            background: bg, border, color,
            borderRadius: 14, cursor: selected ? 'default' : 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease', lineHeight: 1.3,
          }}>
            {choix}
          </button>
        );
      })}

      {selected === 'correct' && <div style={{ fontSize: 22, color: '#10b981', fontWeight: 'bold', marginTop: 4 }}>✅ Bravo !</div>}
      {selected === 'wrong' && (
        <div style={{ fontSize: 16, color: '#ef4444', fontWeight: 'bold', marginTop: 4, textAlign: 'center' }}>
          ❌ C'était : <em>« {current.fin} »</em>
        </div>
      )}

      {done && (
        <button onClick={backToMenu} style={{
          marginTop: 12, padding: '16px 40px',
          fontSize: 18, fontWeight: 'bold',
          background: '#f59e0b', color: 'white',
          border: 'none', borderRadius: 14,
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
        }}>
          🔄 Rejouer
        </button>
      )}
    </div>
  );
};

export default Proverbe;
