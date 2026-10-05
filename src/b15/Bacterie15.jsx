import React, { useCallback, useRef, useState } from 'react';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import { Soupe } from './engine/Soupe';
import { DEFAULT_PARAMS, MILIEUX, PARAM_GROUPS } from './engine/params';
import { COUCHES_DEFAUT } from './ui/peindre';
import Gelose from './ui/Gelose';
import Panneau from './ui/Panneau';
import Reglages from './ui/Reglages';

// Bactérie 15.5 — l'aboutissement de la série. Zéro joueur : on regarde.
// Lire bacterie15.5.md avant de toucher au moteur.

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5dff8a' },
    background: { default: '#05080d', paper: '#0b1118' },
  },
  typography: { fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace' },
});

export default function Bacterie15() {
  const soupeRef = useRef(null);
  if (!soupeRef.current) soupeRef.current = new Soupe();

  const [enMarche, setEnMarche] = useState(true);
  const [mode, setMode] = useState('regime');
  const [couches, setCouches] = useState(COUCHES_DEFAUT);
  const [stats, setStats] = useState(soupeRef.current.stats);
  const [selection, setSelection] = useState(null);
  const [params, setParams] = useState(soupeRef.current.params);
  const [reglagesOuverts, setReglagesOuverts] = useState(false);
  const [milieu, setMilieu] = useState('standard');

  const changerParam = useCallback((cle, valeur) => {
    soupeRef.current.params[cle] = valeur;
    setParams({ ...soupeRef.current.params });
  }, []);

  // Un milieu = défauts + ses écarts, versé à chaud : on regarde la population s'adapter.
  const changerMilieu = (id) => {
    const m = MILIEUX.find((x) => x.id === id);
    const soupe = soupeRef.current;
    PARAM_GROUPS.forEach((g) => g.params.forEach(([cle]) => { soupe.params[cle] = DEFAULT_PARAMS[cle]; }));
    Object.assign(soupe.params, m.params);
    soupe.raconter(`${m.emoji} Changement de milieu : ${m.nom}`);
    setParams({ ...soupe.params });
    setMilieu(id);
  };

  const recommencer = () => {
    soupeRef.current = new Soupe({ ...soupeRef.current.params });
    setSelection(null);
    setStats(soupeRef.current.stats);
  };

  const soupe = soupeRef.current;
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        height: '100vh', '@supports (height: 100dvh)': { height: '100dvh' },
        display: 'flex', flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default', color: 'text.primary',
        overflow: { xs: 'auto', md: 'hidden' },
      }}>
        <Box sx={{ flex: 1, display: 'flex', p: { xs: 1, md: 3 }, minHeight: { xs: '55vh', md: 0 } }}>
          <Gelose
            soupeRef={soupeRef}
            enMarche={enMarche}
            mode={mode}
            couches={couches}
            ticksParFrame={params.ticksParFrame}
            selection={selection}
            onSelection={setSelection}
            onStats={setStats}
          />
        </Box>
        <Panneau
          stats={stats}
          historique={soupe.historique}
          chronique={soupe.chronique}
          enMarche={enMarche}
          onToggle={() => setEnMarche((v) => !v)}
          onRecommencer={recommencer}
          onReglages={() => setReglagesOuverts(true)}
          ticksParFrame={params.ticksParFrame}
          onVitesse={(v) => changerParam('ticksParFrame', v)}
          mode={mode}
          onMode={setMode}
          couches={couches}
          onCouches={setCouches}
          selection={selection}
          milieu={milieu}
          onMilieu={changerMilieu}
        />
        <Reglages ouvert={reglagesOuverts} onFermer={() => setReglagesOuverts(false)} params={params} onChange={changerParam} />
      </Box>
    </ThemeProvider>
  );
}
