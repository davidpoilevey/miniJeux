import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useC14 } from '../C14Context';
import { ADNHandler } from '../../genetic/ADNPlante';
import { readTraits } from '../plants/PlantADN';
import { drawFlower, drawFruit } from '../plants/PlantRenderer';

// Taille du canvas de preview (en px)
const PV = 80;

const s = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.60)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  card: {
    background: '#111827',
    border: '1px solid #374151',
    borderRadius: 12,
    padding: '22px 26px',
    minWidth: 270, maxWidth: 350,
    display: 'flex', flexDirection: 'column', gap: 14,
    fontFamily: 'monospace', color: '#e5e7eb',
    boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
  },
  header: { display: 'flex', alignItems: 'center', gap: 14 },
  preview: {
    width: PV, height: PV, flexShrink: 0,
    borderRadius: 8, background: '#0a0f1a',
    border: '1px solid #374151',
  },
  titleBlock: { display: 'flex', flexDirection: 'column', gap: 4 },
  title: { fontSize: 15, fontWeight: 'bold', color: '#6ee7b7', margin: 0 },
  subtitle: { fontSize: 11, color: '#6b7280' },
  row: { display: 'flex', gap: 8 },
  btn: (color, disabled) => ({
    flex: 1, padding: '9px 14px', borderRadius: 6,
    border: 'none', cursor: disabled ? 'default' : 'pointer',
    background: disabled ? '#1f2937' : color,
    color: disabled ? '#4b5563' : '#fff',
    fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold',
    opacity: disabled ? 0.7 : 1,
    transition: 'background 0.15s',
  }),
  closeBtn: {
    alignSelf: 'flex-end', padding: '4px 12px',
    borderRadius: 4, border: '1px solid #374151',
    background: 'transparent', color: '#6b7280',
    fontFamily: 'monospace', fontSize: 11, cursor: 'pointer',
    marginTop: 2,
  },
  feedback: { fontSize: 12, color: '#6ee7b7', textAlign: 'center', padding: '4px 0' },
  likedBadge: { fontSize: 11, color: '#6ee7b7' },
};

export default function C14InteractionModal() {
  const {
    selectedFlower, setSelectedFlower,
    selectedFruit,  setSelectedFruit,
    plants, hasLiked,
    likeFlower, fecondFlower, germerFruit,
  } = useC14();

  const [liking,   setLiking]   = useState(false);
  const [feedback, setFeedback] = useState(null);
  const canvasRef = useRef(null);
  const prevKeyRef = useRef(null);

  // Réinitialise feedback quand la sélection change
  const selKey = selectedFlower?.id ?? selectedFruit?.id ?? null;
  if (selKey !== prevKeyRef.current) {
    prevKeyRef.current = selKey;
    if (feedback !== null) setFeedback(null);
  }

  const isFlower = selectedFlower != null;
  const isOpen   = isFlower || selectedFruit != null;

  const close = () => {
    setSelectedFlower(null);
    setSelectedFruit(null);
    setFeedback(null);
  };

  // Fermeture sur Échap
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Dessin dans le canvas de preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, PV, PV);

    const plant = isFlower
      ? plants.find(p => p.id === selectedFlower.plantId)
      : plants.find(p => p.id === selectedFruit.plantId);
    if (!plant) return;

    const traits = readTraits(new ADNHandler(plant.adn));

    if (isFlower) {
      const fl = plant.flowers.find(f => f.id === selectedFlower.id);
      if (fl) drawFlower(ctx, { ...fl, x: 0, y: 0 }, traits, PV, false);
    } else {
      const fr = plant.fruits.find(f => f.id === selectedFruit.id);
      if (fr) drawFruit(ctx, { ...fr, x: 0, y: 0 }, traits, PV);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selKey, isOpen, plants]);

  if (!isOpen) return null;

  const selectedPlant = isFlower
    ? plants.find(p => p.id === selectedFlower.plantId)
    : plants.find(p => p.id === selectedFruit.plantId);
  const selectedFl   = isFlower
    ? selectedPlant?.flowers.find(f => f.id === selectedFlower.id)
    : null;
  const alreadyLiked = isFlower
    ? hasLiked(selectedFlower.plantId, selectedFlower.id)
    : false;

  const handleLike = async () => {
    if (!isFlower || liking || alreadyLiked) return;
    setLiking(true);
    const result = await likeFlower(selectedFlower.plantId, selectedFlower.id);
    if (result.ok) {
      setFeedback('♥ Likée !');
    } else if (result.reason === 'already_liked') {
      setFeedback('✓ Déjà likée');
    } else {
      setFeedback('Erreur réseau');
    }
    setLiking(false);
  };

  const handleFecond = async () => {
    await fecondFlower(selectedFlower.plantId, selectedFlower.id);
    setFeedback('🌺 Fécondée — le pollen a été déposé !');
  };

  const handleGerme = async () => {
    await germerFruit(selectedFruit.plantId, selectedFruit.id);
    setFeedback('🌱 Germination déclenchée !');
  };

  const modal = (
    <div style={s.backdrop} onClick={close}>
      <div style={s.card} onClick={e => e.stopPropagation()}>

        <div style={s.header}>
          <canvas ref={canvasRef} width={PV} height={PV} style={s.preview} />
          <div style={s.titleBlock}>
            <p style={s.title}>{isFlower ? 'Fleur' : 'Fruit'}</p>
            {selectedPlant && (
              <span style={s.subtitle}>
                Plante #{(isFlower ? selectedFlower.plantId : selectedFruit.plantId).slice(-6)}
                {isFlower && selectedFl ? ` · ${selectedFl.likes || 0} ♥` : ''}
                {isFlower && selectedPlant ? ` · ${selectedPlant.likes} total` : ''}
              </span>
            )}
            {alreadyLiked && !feedback && (
              <span style={s.likedBadge}>✓ Déjà likée</span>
            )}
          </div>
        </div>

        {feedback ? (
          <span style={s.feedback}>{feedback}</span>
        ) : isFlower ? (
          <div style={s.row}>
            {!alreadyLiked && (
              <button type="button" style={s.btn('#7c3aed', liking)}
                onClick={handleLike} disabled={liking}>
                {liking ? '…' : '♥ Liker'}
              </button>
            )}
            <button type="button" style={s.btn('#166534', false)} onClick={handleFecond}>
              🌺 Féconder
            </button>
          </div>
        ) : (
          <button type="button" style={s.btn('#92400e', false)} onClick={handleGerme}>
            🌱 Faire germer
          </button>
        )}

        <button type="button" style={s.closeBtn} onClick={close}>✕ Fermer</button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
