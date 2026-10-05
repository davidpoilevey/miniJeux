import React, { useCallback, useRef, useState } from 'react';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import { Evolution } from './engine/Evolution';
import { DEFAULT_PARAMS } from './engine/params';
import Piste from './ui/Piste';
import Panneau from './ui/Panneau';
import Galerie from './ui/Galerie';
import Reglages from './ui/Reglages';

// Bactérie 16 — les marcheurs. Zéro joueur : des corps évoluent pour avancer.
// Lire bacterie16.md avant de toucher au moteur.

const CLE_SAUVEGARDE = 'bacterie16-sauvegarde';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffb300' },
    background: { default: '#0b0f14', paper: '#121820' },
  },
  typography: { fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' },
});

const lireSauvegarde = () => {
  try { return localStorage.getItem(CLE_SAUVEGARDE); } catch { return null; }
};

export default function Bacterie16() {
  const evoRef = useRef(null);
  if (!evoRef.current) evoRef.current = new Evolution({ ...DEFAULT_PARAMS });

  const [enMarche, setEnMarche] = useState(true);
  const [params, setParams] = useState(evoRef.current.params);
  const [stats, setStats] = useState({ generation: 1, t: 0, record: 0 });
  const [champion, setChampion] = useState(null);
  const [reglagesOuverts, setReglagesOuverts] = useState(false);
  const [aSauvegarde, setASauvegarde] = useState(() => !!lireSauvegarde());
  const [message, setMessage] = useState('');

  const changerParam = useCallback((cle, valeur) => {
    evoRef.current.params[cle] = valeur;
    setParams({ ...evoRef.current.params });
  }, []);

  const remplacer = (evo) => {
    evoRef.current = evo;
    setParams(evo.params);
    setChampion(null);
    setStats({ generation: evo.generation, t: 0, record: evo.record.distance });
  };

  const recommencer = () => {
    if (evoRef.current.generation > 5 && !window.confirm('Repartir de zéro ? Les champions actuels seront perdus (pensez à sauver).')) return;
    remplacer(new Evolution({ ...evoRef.current.params }));
  };

  const charger = (texte) => {
    try {
      const s = JSON.parse(texte);
      if (s.jeu !== 'bacterie16') throw new Error('pas une sauvegarde de Bactérie 16');
      remplacer(new Evolution({ ...DEFAULT_PARAMS, ...s.params }, s));
      setMessage(`Génération ${s.generation} rechargée.`);
    } catch (err) {
      setMessage(`Chargement impossible : ${err.message}`);
    }
  };

  const sauver = () => {
    try {
      localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(evoRef.current.exporter()));
      setASauvegarde(true);
      setMessage(`Génération ${evoRef.current.generation} sauvée dans le navigateur.`);
    } catch (err) {
      setMessage(`Sauvegarde impossible : ${err.message}`);
    }
  };

  const exporter = () => {
    const evo = evoRef.current;
    const blob = new Blob([JSON.stringify(evo.exporter())], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bacterie16-gen${evo.generation}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const evo = evoRef.current;
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        height: '100vh', '@supports (height: 100dvh)': { height: '100dvh' },
        display: 'flex', flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default', color: 'text.primary',
        overflow: { xs: 'auto', md: 'hidden' },
      }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, md: 2 }, minWidth: 0, minHeight: { xs: '75vh', md: 0 } }}>
          <Piste
            evoRef={evoRef}
            enMarche={enMarche}
            vitesse={params.vitesse}
            turbo={params.turbo}
            champion={champion}
            onQuitterReplay={() => setChampion(null)}
            onStats={setStats}
          />
          <Galerie
            champions={evo.champions}
            especesParId={evo.especesParId}
            choisi={champion}
            onChoisir={setChampion}
            version={stats.generation}
          />
        </Box>
        <Panneau
          evo={evo}
          stats={stats}
          version={stats.generation}
          enMarche={enMarche}
          onToggle={() => setEnMarche((v) => !v)}
          onRecommencer={recommencer}
          onReglages={() => setReglagesOuverts(true)}
          params={params}
          onParam={changerParam}
          onSauver={sauver}
          onCharger={() => charger(lireSauvegarde())}
          aSauvegarde={aSauvegarde}
          onExporter={exporter}
          onImporter={(f) => f.text().then(charger)}
          message={message}
        />
        <Reglages ouvert={reglagesOuverts} onFermer={() => setReglagesOuverts(false)} params={params} onChange={changerParam} />
      </Box>
    </ThemeProvider>
  );
}
