import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { WG_UNITS } from "../data/units";
import { WG_UPGRADES } from "../data/upgrades";

import { useWG } from "../WarGameContext";

const UnitAvatar = ({images, type, size = 40 }) => {
  const src = images[type].src;
  return src ? (
    <Box
      component="img"
      src={src}
      alt={type}
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        imageRendering: 'pixelated',
        flexShrink: 0,
        borderRadius: 1,
        bgcolor: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(201,168,76,0.15)',
        p: '2px',
      }}
    />
  ) : (
    <Box sx={{ width: size, height: size, flexShrink: 0, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }} />
  );
};

const BUYABLE_UNITS = WG_UNITS.filter(u => u.type !== 'zone');

const STAT_LABELS = { movement: 'Mvt', attack: 'Att', defense: 'Déf', range: 'Portée' };

const effectLabel = (effect) => {
  const { type, ...stats } = effect;
  const unitName = type === 'all' ? 'Toutes unités' : (WG_UNITS.find(u => u.type === type)?.name ?? type);
  const statsStr = Object.entries(stats)
    .map(([k, v]) => `+${v} ${STAT_LABELS[k] ?? k}`)
    .join(', ');
  return `${unitName} : ${statsStr}`;
};

// Label de section réutilisable
const SectionLabel = ({ children }) => (
  <Typography
    variant="caption"
    display="block"
    sx={{
      mb: 1,
      color: 'primary.main',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      fontWeight: 700,
      fontSize: '0.65rem',
    }}
  >
    {children}
  </Typography>
);

export const WGCasernePanel = () => {
  const { currentMission, credits, purchasedUnits, buyUnit, sellUnit, acquiredUpgrades, buyUpgrade, images } = useWG();
  const [tab, setTab] = useState(0);

  const freeUnits = currentMission
    ? currentMission.playerUnitTypes
        .map(type => WG_UNITS.find(u => u.type === type))
        .filter(Boolean)
    : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>

      {/* ── En-tête ── */}
      <Box sx={{
        px: 4, py: 3,
        background: 'linear-gradient(180deg, rgba(201,168,76,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Typography variant="overline" sx={{ color: 'primary.light', letterSpacing: '0.2em', fontSize: '0.7rem' }}>
          Préparation
        </Typography>
        <Typography variant="h4" sx={{
          textTransform: 'uppercase',
          color: 'primary.main',
          textShadow: '0 2px 12px rgba(201,168,76,0.25)',
          lineHeight: 1.1,
        }}>
          Caserne
        </Typography>
        {currentMission ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Mission : <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{currentMission.name}</Box> — préparez vos troupes avant le départ.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Consultez les unités et améliorations disponibles. Sélectionnez une mission pour jouer.
          </Typography>
        )}
      </Box>

      {/* ── Corps ── */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>

          {/* ── Colonne gauche : votre armée + améliorations acquises ── */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Votre armée
              </Typography>

              {freeUnits.length > 0 && (
                <>
                  <SectionLabel>Unités de mission (gratuites)</SectionLabel>
                  <List dense disablePadding>
                    {freeUnits.map((unit, i) => (
                      <ListItem key={i} disableGutters sx={{ gap: 1, py: 0.75 }}>
                        <UnitAvatar images={images} type={unit.type} />
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600}>{unit.name}</Typography>}
                          secondary={`Att ${unit.attack} · Déf ${unit.defense} · Mvt ${unit.movement} · Portée ${unit.range}`}
                        />
                        <Chip size="small" label="Gratuit" color="success" variant="outlined" />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {purchasedUnits.length > 0 && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <SectionLabel>Unités achetées</SectionLabel>
                  <List dense disablePadding>
                    {purchasedUnits.map(unit => (
                      <ListItem key={unit._purchaseId} disableGutters sx={{ gap: 1, py: 0.75 }}>
                        <UnitAvatar images={images} type={unit.type} />
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600}>{unit.name}</Typography>}
                          secondary={`Att ${unit.attack} · Déf ${unit.defense} · Mvt ${unit.movement} · Portée ${unit.range}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            title={`Vendre (+${unit.cost} cr)`}
                            onClick={() => sellUnit(unit._purchaseId)}
                            sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(224,82,82,0.12)' } }}
                          >
                            ✕
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {freeUnits.length === 0 && purchasedUnits.length === 0 && (
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1, fontStyle: 'italic' }}>
                  Aucune unité pour l'instant.
                </Typography>
              )}

              {acquiredUpgrades.length > 0 && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <SectionLabel>Améliorations actives</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {acquiredUpgrades.map(upId => {
                      const up = WG_UPGRADES.find(u => u.id === upId);
                      return up ? (
                        <Chip
                          key={upId}
                          size="small"
                          label={up.name}
                          color="warning"
                          variant="outlined"
                        />
                      ) : null;
                    })}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* ── Colonne droite : catalogue tabulé ── */}
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>

              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Unités" />
                <Tab label={`Améliorations${acquiredUpgrades.length ? ` (${acquiredUpgrades.length})` : ''}`} />
              </Tabs>

              {/* ── Onglet Unités ── */}
              {tab === 0 && (
                <List dense disablePadding sx={{ overflowY: 'auto' }}>
                  {BUYABLE_UNITS.map(unit => {
                    const canAfford = credits >= unit.cost;
                    return (
                      <ListItem key={unit.type} disableGutters divider sx={{ gap: 1, py: 1 }}>
                        <UnitAvatar images={images} type={unit.type} />
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight="bold">{unit.name}</Typography>
                              <Chip size="small" label={`${unit.cost} cr`} variant="outlined"
                                sx={{ borderColor: 'primary.dark', color: 'primary.light' }} />
                            </Box>
                          }
                          secondary={`Att ${unit.attack} · Déf ${unit.defense} · Mvt ${unit.movement} · Portée ${unit.range}`}
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            disabled={!canAfford}
                            onClick={() => buyUnit(unit.type)}
                          >
                            Acheter
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              )}

              {/* ── Onglet Améliorations ── */}
              {tab === 1 && (
                <List dense disablePadding sx={{ overflowY: 'auto' }}>
                  {WG_UPGRADES.map(up => {
                    const owned    = acquiredUpgrades.includes(up.id);
                    const canAfford = credits >= up.cost;
                    return (
                      <ListItem key={up.id} disableGutters divider sx={{ py: 1 }}>
                       <SpriteIcon spriteImage={images['upgrades'].src} spriteKey={up.id}
                        imageWidth={800} imageHeight={346}/>
                        <ListItemText
                          sx={{ ml: 1.5 }}
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" fontWeight="bold">{up.name}</Typography>
                              <Chip size="small" label={`${up.cost} cr`} variant="outlined"
                                sx={{ borderColor: 'primary.dark', color: 'primary.light' }} />
                              <Chip size="small" label={effectLabel(up.effect)} color="warning" variant="outlined" />
                            </Box>
                          }
                          secondary={up.description}
                        />
                        <ListItemSecondaryAction>
                          {owned ? (
                            <Chip size="small" label="Acquis" color="success" />
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              disabled={!canAfford}
                              onClick={() => buyUpgrade(up.id)}
                            >
                              Acquérir
                            </Button>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              )}

            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};


const SPRITE_COLS = 10;
const SPRITE_ROWS = 5;
const ICON_SIZE = 48; // taille d'affichage

const SPRITE_MAP = {
  armure_renforcee:      [1,1],
  lames_acier:           [2, 0],
  carquois_leger:        [4, 3],
  arc_long:              [1, 3],
  fleches_trempees:      [4,1],
  formation_tortue:      [9, 3],
  charge_legionnaire:    [0,0],
  poudre_noire:          [8, 3],
  boulets_explosifs:     [4, 0],
  prieres_protection:    [1, 0],
  mousquets_precision:   [3, 4],
  poudre_mousquet:       [9, 1],
  montures_guerre:       [8,1],
  lance_charge:          [4,4],
  projectiles_explosifs: [0,1],
  torsion_catapulte:     [8, 0],
  boulons_acier:         [0,2],
  ravitaillement:        [9, 4],
};

function SpriteIcon({ spriteImage, spriteKey, imageWidth, imageHeight }) {
  const [col, row] = SPRITE_MAP[spriteKey] ?? [0, 0];

  const scaleX = ICON_SIZE / (imageWidth / SPRITE_COLS);
  const scaleY = ICON_SIZE / (imageHeight / SPRITE_ROWS);

  return (
    <div style={{
      width: ICON_SIZE,
      height: ICON_SIZE,
      backgroundImage: `url(${spriteImage})`,
      backgroundSize: `${imageWidth * scaleX}px ${imageHeight * scaleY}px`,
      backgroundPosition: `-${col * ICON_SIZE}px -${row * ICON_SIZE}px`,
      backgroundRepeat: 'no-repeat',
      flexShrink: 0,
      borderRadius: 4,
    }} />
  );
}
