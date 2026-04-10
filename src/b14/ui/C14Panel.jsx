import { useC14, GEO_EVENTS, POSITIONED_EVENTS } from '../C14Context';

const s = {
  panel: {
    display: 'flex', flexWrap: 'wrap', alignItems: 'center',
    gap: 6, padding: '6px 12px', justifyContent:'space-between',
    background: '#111827', borderTop: '1px solid #374151',
    fontFamily: 'monospace', fontSize: 12, color: '#e5e7eb',
    minHeight: 44,
  },
  btn: (active) => ({
    padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: active ? '#b45309' : '#1f2937',
    color: active ? '#fff' : '#9ca3af',
    fontFamily: 'monospace', fontSize: 11, transition: 'background 0.15s',
  }),
};

const GEO_LABELS = {
  [GEO_EVENTS.VOLCANO]:         '🌋 Volcan',
  [GEO_EVENTS.EARTHQUAKE]:      '🌍 Séisme',
  [GEO_EVENTS.METEOR]:          '☄️ Météorite',
  [GEO_EVENTS.MOUNTAIN_RANGE]:  '⛰️ Montagne',
  [GEO_EVENTS.FLOOD]:           '🌊 Inondation',
  [GEO_EVENTS.DROUGHT]:         '☀️ Sécheresse',
  [GEO_EVENTS.WARMING]:         '🔥 Réchauffement',
  [GEO_EVENTS.GLACIATION]:      '❄️ Glaciation',
  [GEO_EVENTS.DIVERSIFICATION]: '🌱 Diversification',
  [GEO_EVENTS.DISEASE]:         '🦠 Maladie',
};

export default function C14Panel() {
  const { activeEvent, setActiveEvent, applyGeoEvent } = useC14();

  return (
    <div style={s.panel}>
      {Object.entries(GEO_LABELS).map(([type, label]) => (
        <button
          type="button"
          key={type}
          style={s.btn(activeEvent === type)}
          onClick={() => {
            if (POSITIONED_EVENTS.has(type)) {
              setActiveEvent(activeEvent === type ? null : type);
            } else {
              applyGeoEvent(type, null, null);
            }
          }}
          title={type}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
