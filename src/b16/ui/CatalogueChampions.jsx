import React, { useMemo, useRef } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from '@mui/material';
import { DeleteOutline, Download, EmojiEvents, Upload, WarningAmber } from '@mui/icons-material';
import { decrireMorphotype, lireCorps, texteVersAdn } from '../engine/corps';
import { Portrait } from './Galerie';
import { physiqueDifferente } from './fiches';

// Le catalogue : les champions gardés d'une partie à l'autre.
// Clic = replay ; en bas, le grand bouton qui les lâche tous ensemble sur la piste.
const Fiche = ({ fiche, params, onRevoir, onSupprimer }) => {
  const champion = useMemo(() => ({ corps: lireCorps(texteVersAdn(fiche.adn)) }), [fiche.adn]);
  const ecarts = physiqueDifferente(fiche, params);
  return (
    <Box onClick={onRevoir} sx={{
      position: 'relative', cursor: 'pointer', borderRadius: 2, p: 1,
      border: `2px solid hsla(${fiche.teinte}, 60%, 55%, 0.7)`,
      transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-2px)' },
    }}>
      <Portrait champion={champion} espece={fiche} larg={150} haut={90} />
      <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 0.5, color: `hsl(${fiche.teinte}, 70%, 70%)` }}>{fiche.nom}</Typography>
      <Typography sx={{ fontSize: 12 }}>
        {fiche.distance.toFixed(1)} m <span style={{ color: '#8a96a3' }}>· génération {fiche.generation}</span>
      </Typography>
      <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.3 }}>{decrireMorphotype(fiche.morphotype)}</Typography>
      {fiche.ascendance && (
        <Typography sx={{ fontSize: 10.5, lineHeight: 1.3, mt: 0.25, color: '#c9b37a' }}>🧬 {fiche.ascendance}</Typography>
      )}
      <Typography sx={{ fontSize: 10, color: '#6b7a8a' }}>{new Date(fiche.date).toLocaleDateString()}</Typography>
      <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex' }}>
        {ecarts.length > 0 && (
          <Tooltip title={`Élevé avec d'autres réglages physiques (${ecarts.map((k) => `${k} ${fiche.params[k]}`).join(', ')}) : il ne courra peut-être pas aussi bien.`}>
            <WarningAmber sx={{ fontSize: 18, color: '#ffb300', m: 0.5 }} />
          </Tooltip>
        )}
        <Tooltip title="Retirer du catalogue">
          <IconButton size="small" onClick={(ev) => { ev.stopPropagation(); onSupprimer(); }}><DeleteOutline fontSize="small" /></IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default function Catalogue({ ouvert, onFermer, fiches, params, onRevoir, onSupprimer, onCourse, onExporter, onImporter }) {
  const fichier = useRef(null);
  return (
    <Dialog open={ouvert} onClose={onFermer} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        Catalogue des champions
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {fiches.length} champion{fiches.length > 1 ? 's' : ''} gardé{fiches.length > 1 ? 's' : ''} · cliquez-en un pour revoir sa course
        </Typography>
      </DialogTitle>
      <DialogContent>
        {fiches.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: 'text.secondary', fontStyle: 'italic', py: 3 }}>
            Le catalogue est vide. Pendant une partie, « Garder le champion » y range le meilleur marcheur.
            Avec au moins deux champions, on peut lancer la course des champions.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 1.5, pt: 1 }}>
            {fiches.map((f) => (
              <Fiche key={f.id} fiche={f} params={params} onRevoir={() => onRevoir(f)} onSupprimer={() => onSupprimer(f)} />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Tooltip title="Exporter le catalogue (.json)">
          <span><IconButton onClick={onExporter} disabled={!fiches.length}><Download /></IconButton></span>
        </Tooltip>
        <Tooltip title="Importer des champions (.json) : ils s'ajoutent au catalogue">
          <IconButton onClick={() => fichier.current.click()}><Upload /></IconButton>
        </Tooltip>
        <input ref={fichier} type="file" accept="application/json,.json" hidden
          onChange={(e) => { if (e.target.files[0]) onImporter(e.target.files[0]); e.target.value = ''; }} />
        <Box sx={{ flex: 1 }} />
        <Button onClick={onFermer} sx={{ textTransform: 'none' }}>Fermer</Button>
        <Button variant="contained" startIcon={<EmojiEvents />} disabled={fiches.length < 2} onClick={onCourse} sx={{ textTransform: 'none', fontWeight: 700 }}>
          Course des champions ({fiches.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
