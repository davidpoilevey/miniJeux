import { useC14, WORLD_NAMES } from '../C14Context';
import { styles } from '../Carbonifere14';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Alert } from '@mui/material';

function useDayFactor() {
  const compute = () => {
    const now = new Date();
    const h = now.getUTCHours() + now.getUTCMinutes() / 60;
    return 0.1 + 0.9 * 0.5 * (1 + Math.cos((h - 12) / 12 * Math.PI));
  };
  const [dayFactor, setDayFactor] = useState(compute);
  useEffect(() => {
    const id = setInterval(() => setDayFactor(compute()), 60_000);
    return () => clearInterval(id);
  }, []);
  return dayFactor;
}

const s = {
  stat: { color: '#6ee7b7', fontWeight: 'bold' },
  label: { color: '#6b7280', marginRight: 3 },
  zoomBtn: {
    padding: '4px 13px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#374151', color: '#e5e7eb',
    fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold',
    lineHeight: 1, touchAction: 'manipulation',
    minWidth: 36, minHeight: 32,
  },
  zoomVal: {
    color: '#e5e7eb', fontWeight: 'bold', minWidth: 28,
    textAlign: 'center', fontSize: 13,
  },
  worldBtn: (active) => ({
    padding: '2px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: active ? '#1d4ed8' : '#1f2937',
    color: active ? '#fff' : '#6b7280',
    fontFamily: 'monospace', fontSize: 11,
  }),
};

export default function C14TopBar() {
  const {
    tick, worldSeed,
    worldIds, selectedWorldId, setSelectedWorldId,
    statsCache, seaLevel,
    cellSize, setCellSize,
    resetWorld, serverStatus,
  } = useC14();
  const [resetTarget, setResetTarget] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState(null);
  const confirmReset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      const result = await resetWorld(resetTarget);
      setNotice(result.ok
        ? { severity: 'success', text: `Reset de ${WORLD_NAMES[resetTarget]} envoyé. Le nouveau monde apparaîtra après traitement par le serveur.` }
        : { severity: 'error', text: 'Impossible d’envoyer le reset. Réessaie dans un instant.' });
      if (result.ok) setResetTarget(null);
    } finally {
      setResetting(false);
    }
  };
  const dayFactor = useDayFactor();
  const sunIcon = dayFactor > 0.75 ? '☀️' : dayFactor > 0.4 ? '🌤️' : dayFactor > 0.15 ? '🌙' : '🌑';

  return (
    <div style={styles.header}>
      <span style={styles.title}>🌿 CARBONIFÈRE XIV</span>

      {/* Sélecteur de monde */}
      {worldIds.map(id => (
        <button type="button" key={id} onClick={() => setSelectedWorldId(id)} style={s.worldBtn(selectedWorldId === id)}>
          {WORLD_NAMES[id] ?? id}
        </button>
      ))}

      <div style={{ width: 1, height: 20, background: '#374151', margin: '0 4px' }} />

      {/* Zoom */}
      <button type="button" style={s.zoomBtn} onClick={() => setCellSize(cellSize - 2)}>−</button>
      <span style={s.zoomVal}>{cellSize}</span>
      <button type="button" style={s.zoomBtn} onClick={() => setCellSize(cellSize + 2)}>+</button>
      <button type="button" style={s.worldBtn(false)} disabled={!selectedWorldId || serverStatus !== 'ok' || resetting}
        onClick={() => setResetTarget(selectedWorldId)}>↻ Repartir de zéro</button>

      <div style={{ width: 1, height: 20, background: '#374151', margin: '0 4px' }} />

      {/* Stats plantes */}
      <span><span style={s.label}>🌿</span><span style={s.stat}>{statsCache.alive}</span></span>
      <span><span style={s.label}>🌸</span><span style={s.stat}>{statsCache.flowers}</span></span>
      <span><span style={s.label}>🍎</span><span style={s.stat}>{statsCache.fruits}</span></span>

      <div style={{ width: 1, height: 20, background: '#374151', margin: '0 4px' }} />

      {/* Stats monde */}
      <span><span style={s.label}>🌡️</span><span style={s.stat}>{statsCache.avgTemp ?? '—'}°</span></span>
      <span><span style={s.label}>💧</span><span style={s.stat}>{statsCache.avgHum ?? '—'}%</span></span>
      <span><span style={s.label}>🌊</span><span style={s.stat}>{seaLevel}</span></span>

      {/* Jour/nuit + seed/tick — à droite */}
      <span style={{ ...styles.subtitle, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span title={`Lumière : ${Math.round(dayFactor * 100)}%`}>
          {sunIcon} {Math.round(dayFactor * 100)}%
        </span>
        {worldSeed !== null && <span>seed {worldSeed} · tick {tick}</span>}
      </span>
      <Dialog open={Boolean(resetTarget)} onClose={() => { if (!resetting) setResetTarget(null); }}>
        <DialogTitle>Recréer {WORLD_NAMES[resetTarget]} ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Le relief, les plantes et l’historique de cette planète seront effacés.
            Un nouveau monde sera généré avec 80 plantes et un compteur remis à zéro.
            Cette action est irréversible et s’applique à tous les visiteurs.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={resetting} onClick={() => setResetTarget(null)}>Annuler</Button>
          <Button color="error" disabled={resetting} onClick={confirmReset}>
            {resetting ? 'Envoi…' : 'Recréer cette planète'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={10000} onClose={() => setNotice(null)}>
        {notice ? <Alert severity={notice.severity} onClose={() => setNotice(null)}>{notice.text}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}
