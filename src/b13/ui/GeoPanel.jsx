import { GEO_EVENTS, POSITIONED_EVENTS } from '../world/GeoEvents';
import { useGeo13 } from '../Geo13Context';

const EVENT_BUTTONS = [
  { id: GEO_EVENTS.VOLCANO,        label: 'Volcan',        icon: '🌋' },
  { id: GEO_EVENTS.EARTHQUAKE,     label: 'Séisme',        icon: '⚡' },
  { id: GEO_EVENTS.MOUNTAIN_RANGE, label: 'Orogénèse',     icon: '⛰' },
  { id: GEO_EVENTS.FLOOD,          label: 'Inondation',    icon: '🌊' },
  { id: GEO_EVENTS.DROUGHT,        label: 'Sécheresse',    icon: '☀' },
  { id: GEO_EVENTS.METEOR,         label: 'Météorite',     icon: '☄' },
  { id: GEO_EVENTS.WARMING,        label: 'Réchauffement', icon: '🌡️' },
  { id: GEO_EVENTS.GLACIATION,     label: 'Glaciation',    icon: '🧊' },
  { id: GEO_EVENTS.PREDATOR_BOOST, label: 'Nv. prédateur', icon: '🦖' },
];

const SPEEDS = [
  { label: '●○○', value: 1 },
  { label: '●●○', value: 2 },
  { label: '●●●', value: 3 },
];

const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
  },
  btn: (active) => ({
    padding: '6px 14px',
    background: active ? '#1d4ed8' : '#1f2937',
    border: `1px solid ${active ? '#3b82f6' : '#374151'}`,
    borderRadius: 6,
    color: '#e5e7eb',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'monospace',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }),
  hint: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  separator: {
    width: 1,
    height: 28,
    background: '#374151',
    margin: '0 4px',
  },
  speedLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginRight: 4,
  },
  speedBtn: (active) => ({
    padding: '6px 12px',
    background: active ? '#064e3b' : '#1f2937',
    border: `1px solid ${active ? '#10b981' : '#374151'}`,
    borderRadius: 6,
    color: active ? '#6ee7b7' : '#9ca3af',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'monospace',
    letterSpacing: 2,
  }),
};

// Boutons événements géologiques + contrôle vitesse
export default function GeoPanel() {
  const { activeEvent, setActiveEvent, applyGeoEvent, speed, setSpeed } = useGeo13();

  const handleEventClick = (id) => {
    if (POSITIONED_EVENTS.has(id)) {
      // Mode placement : on toggle la sélection, le clic sur la carte déclenchera l'événement
      setActiveEvent(activeEvent === id ? null : id);
    } else {
      // Événement global : s'applique immédiatement
      applyGeoEvent(id, 0, 0);
    }
  };

  return (
    <div style={styles.root}>
      {EVENT_BUTTONS.map(({ id, label, icon }) => (
        <button
          key={id}
          style={styles.btn(activeEvent === id)}
          onClick={() => handleEventClick(id)}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}

      {activeEvent && (
        <span style={styles.hint}>cliquez sur la carte…</span>
      )}

      <div style={styles.separator} />

    </div>
  );
}
