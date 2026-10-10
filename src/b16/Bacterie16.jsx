import React, { useCallback, useRef, useState } from 'react';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import { Evolution, decrireHeritage } from './engine/Evolution';
import { DEFAULT_PARAMS } from './engine/params';
import Piste from './ui/Piste';
import Panneau from './ui/Panneau';
import Galerie from './ui/Galerie';
import Reglages from './ui/Reglages';
import Catalogue from './ui/CatalogueChampions';
import { ajouterAuCatalogue, ecrireCatalogue, fusionnerCatalogue, lireCatalogue } from './ui/fiches';
import { lireCorps, texteVersAdn } from './engine/corps';

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
  const [catalogue, setCatalogue] = useState(lireCatalogue);
  const [catalogueOuvert, setCatalogueOuvert] = useState(false);

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

  // ── Catalogue des champions ──
  // Sans argument : le meilleur marcheur de la partie (le record)
  const garder = (ch) => {
    const evo = evoRef.current;
    const champion = ch || evo.champions.reduce((a, b) => (b.distance > a.distance ? b : a), evo.champions[0]);
    if (!champion) { setMessage('Pas encore de champion : attendez la fin de la première course.'); return; }
    try {
      const ascendance = decrireHeritage(champion.heritage, evo.fondateurs, 3);
      const [fiches, fiche] = ajouterAuCatalogue(catalogue, champion, evo.especesParId[champion.espece], evo.params, ascendance);
      setCatalogue(fiches);
      setMessage(fiche
        ? `📌 ${fiche.nom} (${fiche.distance.toFixed(1)} m) rejoint le catalogue.`
        : 'Ce champion est déjà au catalogue.');
    } catch (err) {
      setMessage(`Catalogue impossible : ${err.message}`);
    }
  };

  const revoirFiche = (f) => {
    const adn = texteVersAdn(f.adn);
    setChampion({ catalogue: true, adn, corps: lireCorps(adn), distance: f.distance, generation: f.generation, nom: f.nom, teinte: f.teinte });
    setCatalogueOuvert(false);
  };

  const supprimerFiche = (f) => {
    if (!window.confirm(`Retirer ${f.nom} du catalogue ? Son génome sera perdu (sauf export).`)) return;
    setCatalogue(ecrireCatalogue(catalogue.filter((g) => g.id !== f.id)));
  };

  const courseDesChampions = () => {
    if (evoRef.current.generation > 5 && !window.confirm('Lancer la course des champions ? La partie en cours sera perdue (pensez à sauver).')) return;
    remplacer(new Evolution({ ...evoRef.current.params }, null, catalogue));
    setCatalogueOuvert(false);
    setEnMarche(true);
  };

  const exporterCatalogue = () => telecharger({ jeu: 'bacterie16', catalogue }, 'bacterie16-catalogue.json');

  const importerCatalogue = (f) => f.text().then((texte) => {
    try {
      const s = JSON.parse(texte);
      if (s.jeu !== 'bacterie16') throw new Error('pas un fichier de Bactérie 16');
      if (!Array.isArray(s.catalogue)) throw new Error("pas un catalogue (c'est peut-être une sauvegarde de partie)");
      const importees = s.catalogue;
      const avant = catalogue.length;
      const fiches = fusionnerCatalogue(catalogue, importees);
      setCatalogue(fiches);
      setMessage(`${fiches.length - avant} champion(s) importé(s).`);
    } catch (err) {
      setMessage(`Import impossible : ${err.message}`);
    }
  });

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

  const exporter = () => telecharger(evoRef.current.exporter(), `bacterie16-gen${evoRef.current.generation}.json`);

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
            onGarder={garder}
            onStats={setStats}
          />
          <Galerie
            champions={evo.champions}
            especesParId={evo.especesParId}
            fondateurs={evo.fondateurs}
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
          onGarder={() => garder()}
          nbCatalogue={catalogue.length}
          onCatalogue={() => setCatalogueOuvert(true)}
        />
        <Catalogue
          ouvert={catalogueOuvert}
          onFermer={() => setCatalogueOuvert(false)}
          fiches={catalogue}
          params={params}
          onRevoir={revoirFiche}
          onSupprimer={supprimerFiche}
          onCourse={courseDesChampions}
          onExporter={exporterCatalogue}
          onImporter={importerCatalogue}
        />
        <Reglages ouvert={reglagesOuverts} onFermer={() => setReglagesOuverts(false)} params={params} onChange={changerParam} />
      </Box>
    </ThemeProvider>
  );
}

function telecharger(donnees, nom) {
  const blob = new Blob([JSON.stringify(donnees)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nom;
  a.click();
  URL.revokeObjectURL(a.href);
}
