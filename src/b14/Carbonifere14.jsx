import { C14Provider, useC14, WORLD_NAMES } from './C14Context';
import C14Canvas from './ui/C14Canvas';
import C14Panel from './ui/C14Panel';
import C14TopBar from './ui/C14TopBar';
import C14InteractionModal from './ui/C14InteractionModal';

export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0a0f1a',
    color: '#e5e7eb',
    fontFamily: 'monospace',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    background: '#111827',
    borderBottom: '1px solid #1e3a2f',
    flexShrink: 0,
    minHeight: 36,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6ee7b7',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 11,
    color: '#9daec6',
  },
  canvasWrapper: {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(10,15,26,0.85)',
    fontSize: 14,
    color: '#6ee7b7',
    zIndex: 10,
    flexDirection: 'column',
    gap: 10,
  },
};

function Inner() {
  const { loading} = useC14();

  return (
    <div style={styles.root}>
      <C14TopBar/>

      <div style={styles.canvasWrapper}>
        {loading && (
          <div style={styles.loadingOverlay}>
            <span>🌱</span>
            <span>Chargement depuis le serveur…</span>
          </div>
        )}
        <C14Canvas />
      </div>

      <C14Panel />
      <C14InteractionModal />
    </div>
  );
}

export default function Carbonifere14() {
  return (
    <C14Provider>
      <Inner />
    </C14Provider>
  );
}
