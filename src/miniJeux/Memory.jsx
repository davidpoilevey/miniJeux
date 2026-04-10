import React, { useState, useCallback } from 'react';
import { GameOver } from '../ChuckNorrisFact';
import fondTel from './images/fondTel.jpg';
import imgBruno from './images/memBruno.png';
import imgChristel from './images/memChristel.png';
import imgDav from './images/memDav.png';
import imgMickey from './images/memMickey.png';
import imgMitch from './images/memMitch.png';
import imgNicolas from './images/memNicolas.png';
import imgSand from './images/memSandr.png';
import imgSev from './images/memSev.png';
import imgRod from './images/memRod.png';
import imgThib from './images/memThib.png';
import imglea from './images/memLea.png';
import imgRob from './images/memRobin.png';
import imgMarg from './images/memMargo.png';
import imgMeme from './images/memMeme.png';

// ── Photos : simples URLs résolues par webpack à l'import ─────────────────
const PHOTOS = [
  imgBruno, imgChristel, imgDav, imgMarg, imgMeme, imgMickey,
  imgMitch, imgNicolas, imgRob, imglea, imgRod, imgSand, imgSev, imgThib,
];

// ── Configurations de difficulté ───────────────────────────────────────────
const CONFIGS = [
  { label: 'Facile',    rows: 2, cols: 3, multiplier: 1, emoji: '😊', color: '#059669' },
  { label: 'Moyen',     rows: 3, cols: 4, multiplier: 2, emoji: '🙂', color: '#2563eb' },
  { label: 'Difficile', rows: 4, cols: 4, multiplier: 3, emoji: '😤', color: '#d97706' },
  { label: 'Expert',    rows: 4, cols: 7, multiplier: 4, emoji: '🤯', color: '#dc2626' },
];

// ── Génération du deck mélangé ─────────────────────────────────────────────
function buildDeck(rows, cols) {
  const pairCount = (rows * cols) / 2;
  const indices = Array.from({ length: pairCount }, (_, i) => i % PHOTOS.length);
  const doubled = [...indices, ...indices];
  // Fisher-Yates shuffle
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled.map((imageIndex, id) => ({ id, imageIndex, flipped: false, matched: false }));
}

// ── Style dos de carte (partagé) ───────────────────────────────────────────
const cardFace = (extra = {}) => ({
  position: 'absolute', width: '100%', height: '100%',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  borderRadius: 10,
  overflow: 'hidden',
  ...extra,
});

// ─────────────────────────────────────────────────────────────────────────────
export default function Memory() {
  const [phase, setPhase] = useState('setup');
  const [config, setConfig] = useState(null);
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);


  // ── Démarrer une partie ──
  const startGame = (cfg) => {
    setConfig(cfg);
    setCards(buildDeck(cfg.rows, cfg.cols));
    setSelected([]);
    setLocked(false);
    setScore(0);
    setMatchCount(0);
    setIsGameOver(false);
    setPhase('playing');
  };

  // ── Retour au menu ──
  const reset = useCallback(() => {
    setPhase('setup');
    setConfig(null);
    setCards([]);
    setSelected([]);
    setScore(0);
    setMatchCount(0);
    setIsGameOver(false);
  }, []);

  // ── Clic sur une carte ──
  const handleCardClick = (cardId) => {
    if (locked || phase !== 'playing') return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.matched || card.flipped) return;
    if (selected.length === 1 && selected[0] === cardId) return;

    const flippedCards = cards.map(c => c.id === cardId ? { ...c, flipped: true } : c);
    setCards(flippedCards);

    if (selected.length === 0) {
      setSelected([cardId]);
      return;
    }

    // 2ème carte — comparaison
    const [firstId] = selected;
    const firstCard = flippedCards.find(c => c.id === firstId);
    const secondCard = flippedCards.find(c => c.id === cardId);
    setLocked(true);
    setSelected([]);

    if (firstCard.imageIndex === secondCard.imageIndex) {
      // ✅ Paire trouvée
      const newScore = score + 10 * config.multiplier;
      const newMatchCount = matchCount + 1;
      const totalPairs = (config.rows * config.cols) / 2;

      const matched = flippedCards.map(c =>
        c.id === firstId || c.id === cardId ? { ...c, matched: true, flipped: false } : c
      );
      setCards(matched);
      setScore(newScore);
      setMatchCount(newMatchCount);
      setLocked(false);

      if (newMatchCount === totalPairs) {
        setTimeout(() => setIsGameOver(true), 600);
      }
    } else {
      // ❌ Pas de paire
      setScore(s => Math.max(0, s - 2 * config.multiplier));
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.id === firstId || c.id === cardId ? { ...c, flipped: false } : c
        ));
        setLocked(false);
      }, 1100);
    }
  };

  // ── Taille des cartes : ~4 par rangée, flexWrap fait le reste ──
  const CARD_W = Math.min(82, Math.floor((window.innerWidth - 44) / 4));
  const CARD_H = Math.round(CARD_W * 1.3);
  const totalPairs = config ? (config.rows * config.cols) / 2 : 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100dvh',
      backgroundImage: `url(${fondTel})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: 12,
      overflowY: 'auto',
    }}>
      <GameOver
        open={isGameOver}
        score={score}
        gameOverReason="Tu as retrouvé toutes les paires !"
        gameName="memory"
        handleRestart={() => config && startGame(config)}
        handleClose={reset}
      />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontFamily: 'sans-serif', padding: '14px 12px 20px',
        width: '100%', maxWidth: 460,
        background: 'rgba(255,255,255,0.90)',
        borderRadius: 24,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
      }}>

        <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>🃏 Memory</h2>

        {/* ══ Écran de sélection ══════════════════════════════════════════ */}
        {phase === 'setup' && (
          <>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 18px', textAlign: 'center' }}>
              Retournez les cartes et trouvez toutes les paires !
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
              {CONFIGS.map(cfg => (
                <button key={cfg.label} onClick={() => startGame(cfg)} style={{
                  padding: '14px 18px', borderRadius: 16,
                  border: `2px solid ${cfg.color}`,
                  background: 'white', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 17, fontWeight: 'bold', color: cfg.color,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}>
                  <span>{cfg.emoji} {cfg.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 'normal', color: '#6b7280' }}>
                    {(cfg.rows * cfg.cols) / 2} paires
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ══ Partie en cours ═════════════════════════════════════════════ */}
        {phase === 'playing' && config && (
          <>
            {/* En-tête */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', marginBottom: 10,
            }}>
              <span style={{ fontSize: 14, color: '#6b7280' }}>
                {config.emoji} {config.label} &nbsp;·&nbsp;
                <strong style={{ color: '#4c1d95' }}>{matchCount}/{totalPairs}</strong> paires
              </span>
              <span style={{ fontSize: 17, fontWeight: 'bold', color: '#7c3aed' }}>
                {score} pts
              </span>
            </div>

            {/* Cartes — flexWrap, scrollable */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
              gap: 6, userSelect: 'none', width: '100%',
            }}>
              {cards.map(card => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  style={{
                    width: CARD_W, height: CARD_H,
                    perspective: 700,
                    cursor: (card.matched || card.flipped || locked) ? 'default' : 'pointer',
                  }}
                >
                  {/* Conteneur qui tourne */}
                  <div style={{
                    width: '100%', height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                    transition: 'transform 0.45s ease',
                    transform: (card.flipped || card.matched) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}>

                    {/* ── Dos : fondTel ── */}
                    <div style={cardFace({ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' })}>
                      <img src={fondTel} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* ── Face : photo ── */}
                    <div style={cardFace({
                      transform: 'rotateY(180deg)',
                      boxShadow: card.matched
                        ? `0 0 0 3px #059669, 0 2px 8px rgba(0,0,0,0.18)`
                        : '0 2px 8px rgba(0,0,0,0.18)',
                    })}>
                      <img
                        src={PHOTOS[card.imageIndex]}
                        alt={`Enfant ${card.imageIndex + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Coche verte sur les paires trouvées */}
                      {card.matched && (
                        <div style={{
                          position: 'absolute', top: 4, right: 6,
                          fontSize: CARD_W > 60 ? 18 : 13, lineHeight: 1,
                        }}>✅</div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <button onClick={reset} style={{
              marginTop: 16, padding: '10px 20px', fontSize: 14, borderRadius: 12,
              background: '#f3f0ff', color: '#5b21b6', border: '2px solid #c4b5fd',
              cursor: 'pointer', fontWeight: 'bold',
            }}>
              ← Menu
            </button>
          </>
        )}

      </div>
    </div>
  );
}
