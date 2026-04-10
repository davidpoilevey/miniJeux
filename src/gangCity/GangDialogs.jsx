
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip, IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Stack,
  Tooltip,
  Avatar,
  Grid,
  LinearProgress
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { AttachMoney, MoreVert, Refresh , ResetTv, Shield, SwapHoriz, Visibility, Warning } from "@mui/icons-material";
import { ALL_SPECIALITES, computeGirlIncome, getUnavailabilityReason, isGirlUnavailable, useMaqCity } from "./GangContext";
import { BONUS_POOL } from "./MarketView";
import { useEffect, useRef, useState } from "react";
import { OnBoardingStep } from "../OnBoardingContext";

// ─── Helpers ────────────────────────────────────────────────────────────────

const riskLabel = (value) =>
  value < 0.2 ? 'Faible' : value < 0.5 ? 'Modéré' : 'Élevé';

const riskColor = (value) =>
  value < 0.2 ? '#4caf50' : value < 0.5 ? '#ff9800' : '#f44336';

const demandLabel = (value) =>
  value < 0.7 ? 'Peu demandé' : value < 1.2 ? 'Correct' : 'Très recherché';

const demandColor = (value) =>
  value < 0.7 ? '#ef5350' : value < 1.2 ? '#78909c' : '#66bb6a';

/** Petit indicateur coloré horizontal (mini progress bar) */
const IndicatorBar = ({ value, color, max = 1 }) => (
  <Box
    sx={{
      width: 48,
      height: 6,
      borderRadius: 3,
      background: '#2a2a2a',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        width: `${Math.min((value / max) * 100, 100)}%`,
        height: '100%',
        background: color,
        borderRadius: 3,
        transition: 'width 0.3s ease',
      }}
    />
  </Box>
);


// ─── Composant principal ────────────────────────────────────────────────────

export const DistrictPopup = ({ district }) => {
  const { state, assignGirlToDistrict, applyBonusToDistrict } = useMaqCity();

  // ── Filles disponibles (non assignées ailleurs) ──
  const availableGirls = state.girls.filter(
    (g) => g.assignedDistrictId !== district.id
  );

  // ── Bonus applicables au district (encore actifs dans l'inventory du joueur) ──
  const districtBonuses = [];
  state.bonuses.forEach((b) => {
    const def = BONUS_POOL.find((x) => x.id === b.poolId);
    if (def != null && def.target === 'district' && def.duree > 0)
      districtBonuses.push({...def, id:b.id, poolId:def.id});
  });

  // ── Tri : filles compatibles d'abord, puis incompatibles (disabled) ──
  const sortedGirls = [...availableGirls].sort((a, b) => {
    const aOk = district.possibleFor.includes(a.profile) ? 0 : 1;
    const bOk = district.possibleFor.includes(b.profile) ? 0 : 1;
    return aOk - bOk;
  });

  return (
    <Box
      sx={{
        p: 2.5,
        width: 320,
        background: '#1a1a1e',
        borderRadius: 12,
        color: '#e0e0e0',
        border: '1px solid #2e2e35',
      }}
    >
      {/* ── Titre + mensuel ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
          {district.label}
        </Typography>
        <Tooltip title="Loyer mensuel">
          <Chip
            label={`${district.mensuel} €/tour`}
            size="small"
            sx={{
              background: '#2a2a2e',
              color: '#ff7043',
              border: '1px solid #3a3a42',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          />
        </Tooltip>
      </Box>

      {/* ── Demande par profil ── */}
      <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.8, display: 'block' }}>
        Demande
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', mb: 1.5 }}>
        {Object.entries(district.demand).map(([profil, val]) => (
          <Chip
            key={profil}
            label={`${profil} · ${demandLabel(val)}`}
            size="small"
            sx={{
              background: '#23232a',
              color: demandColor(val),
              border: `1px solid ${demandColor(val)}33`,
              fontSize: '0.68rem',
              fontWeight: 500,
            }}
          />
        ))}
      </Box>

      {/* ── Risques ── */}
      <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.6, display: 'block' }}>
        Risques
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#aaa', minWidth: 70 }}>Police</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IndicatorBar value={district.risk.police} color={riskColor(district.risk.police)} />
            <Typography variant="caption" sx={{ color: riskColor(district.risk.police), minWidth: 50, textAlign: 'right' }}>
              {riskLabel(district.risk.police)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#aaa', minWidth: 70 }}>Violence</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IndicatorBar value={district.risk.violence} color={riskColor(district.risk.violence)} />
            <Typography variant="caption" sx={{ color: riskColor(district.risk.violence), minWidth: 50, textAlign: 'right' }}>
              {riskLabel(district.risk.violence)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#2e2e35', my: 1.5 }} />

      {/* ── Assignation de filles ── */}
       <OnBoardingStep
        stepId="paolo"
        message="Vous n'avez pas de filles a affecter, allez dans la zone de Recrutement et parlez a Paolo de ma part"
      >
      <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.8, display: 'block' }}>
        Affecter une fille <span style={{ color: '#555', textTransform: 'none', letterSpacing: 0 }}>— {district.entree} € d'entrée</span>
      </Typography>
</OnBoardingStep>
      {sortedGirls.length === 0 && (
        <Typography variant="body2" sx={{ color: '#555', fontStyle: 'italic', py: 1 }}>
          Aucune fille disponible
        </Typography>
      )}
        <OnBoardingStep
        stepId="affecterFille"
        message="Maintenant vous pouvez affecter Paolo a ce quartier, iel va commencer a bosser pour vous"
      ></OnBoardingStep>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {sortedGirls.map((girl) => {
          const isProfileOk = district.possibleFor.includes(girl.profile);
          const isUnavailable = isGirlUnavailable(girl); // vérifie fatigue / état
          const disabled = !isProfileOk || isUnavailable;

          const tooltipText = !isProfileOk
            ? `Profil "${girl.profile}" non accepté ici`
            : isUnavailable
            ? 'Cette fille ne peut pas travailler en ce moment'
            : '';

          return (
            <Tooltip key={girl.id} title={tooltipText} placement="left">
              {/* Box wrapper nécessaire pour que le Tooltip fonctionne sur un Button disabled */}
              <Box>
                <Button
                  fullWidth
                  disabled={disabled}
                  size="small"
                  variant="outlined"
                  onClick={() => assignGirlToDistrict(girl.id, district.id)}
                  sx={{
                    justifyContent: 'flex-start',
                    gap: 1,
                    px: 1,
                    py: 0.6,
                    borderColor: disabled ? '#2a2a2e' : '#3a3a42',
                    color: disabled ? '#444' : '#ddd',
                    background: disabled ? '#1e1e22' : '#23232a',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'all 0.2s',
                    '&:hover:not(:disabled)': {
                      borderColor: '#ff7043',
                      background: '#2a2520',
                    },
                    '&.Mui-disabled': {
                      color: '#444 !important',
                      borderColor: '#2a2a2e !important',
                    },
                  }}
                >
                  <Avatar
                    src={girl.image}
                    sx={{
                      width: 28,
                      height: 28,
                      border: disabled ? '1px solid #333' : '1px solid #ff7043',
                      filter: disabled ? 'grayscale(1)' : 'none',
                    }}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'flex-start' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit', lineHeight: 1.3 }}>
                      {girl.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem', lineHeight: 1.2 }}>
                      {girl.profile}
                      {!isProfileOk && ' · ✗ incompatible'}
                    </Typography>
                  </Box>
                  {/* Prix d'entrée à droite */}
                  <Typography variant="caption" sx={{ color: '#66bb6a', fontWeight: 600, fontSize: '0.72rem' }}>
                    +{district.entree} €
                  </Typography>
                </Button>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* ── Bonus district ── */}
      {districtBonuses.length > 0 && (
        <>
          <Divider sx={{ borderColor: '#2e2e35', my: 1.5 }} />
          <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.8, display: 'block' }}>
            Bonus disponibles
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
            {districtBonuses.map((bonus) => (
              <Button
                key={bonus.id}
                size="small"
                variant="outlined"
                onClick={() => {
                  applyBonusToDistrict(bonus.id,bonus.poolId, district.id);
                }}
                sx={{
                  fontSize: '0.7rem',
                  px: 1,
                  py: 0.3,
                  borderColor: '#3a5a3a',
                  color: '#81c784',
                  background: '#1e261e',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#81c784',
                    background: '#253325',
                  },
                }}
              >
                {bonus.name}
                <Chip
                  label={`${bonus.duree} tours`}
                  size="small"
                  sx={{
                    ml: 0.7,
                    background: '#1a1a1e',
                    color: '#66bb6a',
                    fontSize: '0.6rem',
                    height: 16,
                  }}
                />
              </Button>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export const MoreMenu = ({ fairePret, reset})=>{

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  return <>
 <IconButton
        aria-label="more"
        aria-controls="more-menu"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => {fairePret() }}>        
          <ListItemIcon><AttachMoney fontSize="small" /></ListItemIcon>
          Emprunter a la pegre
        </MenuItem>
        <MenuItem onClick={() => { reset(); }}>
          <ListItemIcon><ResetTv fontSize="small" /></ListItemIcon>
          Reset
        </MenuItem>
        {/* Ajoute d'autres actions ici */}
      </Menu>
       </>
}


// ─── Helpers ────────────────────────────────────────────────────────────────

const money = (v) => `${v >= 0 ? '+' : ''}${v.toLocaleString()} €`;

/** Couleur selon positif / négatif */
const netColor = (v) => (v >= 0 ? '#66bb6a' : '#ef5350');

/** Icône + couleur pour chaque type d'event */
const EVENT_STYLE = {
  arrestation:     { icon: '🚨', bg: '#3a1a1a', border: '#c62828' },
  descente:        { icon: '🚔', bg: '#2e2218', border: '#ff9800' },
  amende:          { icon: '📜', bg: '#2e2218', border: '#ff9800' },
  client_violent:  { icon: '💢', bg: '#3a1a1a', border: '#c62828' },
  conflit_filles:  { icon: '⚡', bg: '#2e2218', border: '#ff9800' },
  maquereau_rival: { icon: '🗡️', bg: '#3a1a1a', border: '#c62828' },
};

const EVENT_MESSAGES = {
  arrestation:     (e) => `${e.girlName} a été arrêtée dans ${e.districtLabel}.`,
  descente:        (e) => `Descente de police dans ${e.districtLabel} — les clients ont fui.`,
  amende:          (e) => `Amende pour activité illicite dans ${e.districtLabel}.`,
  client_violent:  (e) => `Un client violent s'est en est pris à ${e.girlName}.`,
  conflit_filles:  (e) => `Altercation entre les filles de ${e.districtLabel}.`,
  maquereau_rival: (e) => `Un rival convoite ${e.districtLabel} — ${e.girlName} est sous pression.`,
};


// ─── Sous-composants ────────────────────────────────────────────────────────

/** Ligne financière simple : label à gauche, montant coloré à droite */
const StatLine = ({ label, value, color, subtle }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.35 }}>
    <Typography variant="caption" sx={{ color: subtle ? '#555' : '#aaa', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.68rem' }}>
      {label}
    </Typography>
    <Typography variant="caption" sx={{ color: color || netColor(value), fontWeight: 700, fontSize: '0.78rem' }}>
      {money(value)}
    </Typography>
  </Box>
);

/** Une ligne de détail par fille dans un accordion de district */
const GirlLine = ({ girl }) => {
  const style = girl.modifiers?.unavailable
    ? { bg: '#1e1e22', border: '#2a2a2e', nameColor: '#555' }
    : { bg: '#23232a', border: '#2e2e35', nameColor: '#ddd' };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 1.2,
        py: 0.7,
        borderRadius: 6,
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      <Box>
        <Typography variant="caption" sx={{ color: style.nameColor, fontWeight: 600 }}>
          {girl.name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#555', ml: 0.6 }}>
          ({girl.profile})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.3 }}>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.6rem' }}>
            Demande ×{(girl.modifiers?.demand ?? 1).toFixed(1)}
          </Typography>
          {girl.modifiers?.clientele != null && girl.modifiers.clientele < 1 && (
            <Typography variant="caption" sx={{ color: '#ff9800', fontSize: '0.6rem' }}>
              Clientèle {Math.round(girl.modifiers.clientele * 100)}%
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: '#d06274', fontSize: '0.6rem' }}>
            Nb passes {(girl.modifiers?.nbPasses ?? 0).toFixed(0)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#ab2f2f', fontSize: '0.6rem' }}>
            Stress {(girl.modifiers?.stress ?? 0).toFixed(0)}%
          </Typography>
          <Typography variant="caption" sx={{ color: '#a2a1a1', fontSize: '0.6rem' }}>
            Fatigue {(girl.modifiers?.fatigue ?? 0).toFixed(0)}%
          </Typography>
          {girl.modifiers?.specialites&&<Box>
            {girl.modifiers?.specialites.map(sp=>{
              return <Chip key={sp}
            label={sp}
            size="small"
            sx={{ background: '#f3966b', color: '#181717', border: '1px solid #37378a', fontSize: '0.58rem', height: 18 }}
          />
            })} 
            </Box>}

        </Box>
      </Box>
      <Typography variant="caption" sx={{ color: netColor(girl.net), fontWeight: 700, fontSize: '0.75rem' }}>
        {money(girl.net)}
      </Typography>
    </Box>
  );
};

/** Bloc d'un événement qui s'est produit ce tour */
const EventBlock = ({ event, districtLabel }) => {
  const style = EVENT_STYLE[event.eventId] || { icon: '❓', bg: '#2a2a2e', border: '#3a3a42' };
  const messageFn = EVENT_MESSAGES[event.eventId];
  const message = messageFn
    ? messageFn({ ...event, districtLabel })
    : `Événement inconnu : ${event.eventId}`;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        px: 1.2,
        py: 0.8,
        borderRadius: 6,
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      <Typography sx={{ fontSize: '1rem', lineHeight: 1.4, flexShrink: 0 }}>{style.icon}</Typography>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: '#ddd', fontWeight: 600, fontSize: '0.72rem' }}>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.3 }}>
          <Chip
            label={event.riskType === 'police' ? '🚔 Police' : '💢 Violence'}
            size="small"
            sx={{
              background: '#1a1a1e',
              color: event.riskType === 'police' ? '#ef5350' : '#ff9800',
              border: `1px solid ${event.riskType === 'police' ? '#ef535033' : '#ff980033'}`,
              fontSize: '0.58rem',
              height: 18,
            }}
          />
          <Chip
            label={event.girlName}
            size="small"
            sx={{ background: '#1a1a1e', color: '#aaa', border: '1px solid #2e2e35', fontSize: '0.58rem', height: 18 }}
          />
        </Box>
      </Box>
    </Box>
  );
};


// ─── computeAlerts (corrigé) ────────────────────────────────────────────────

export const computeAlerts = (report) => {
  const alerts = [];
  const { summary, byDistrict, byGirl, turn } = report;

  // Perte globale
  if (summary.net < 0) {
    alerts.push({ type: 'danger', message: 'Le réseau perd de l\'argent ce tour.' });
  }

  // Quartiers non rentables
  byDistrict.forEach((d) => {
    if (d.girls.length > 0 && d.net < 0) {
      alerts.push({ type: 'warning', message: `${d.label} coûte plus qu'il ne rapporte.` });
    }
    // Clientèle dégradée
    if (d.clientele != null && d.clientele < 0.7) {
      alerts.push({ type: 'warning', message: `Clientèle de ${d.label} à ${Math.round(d.clientele * 100)}%.` });
    }
  });

  // Par fille — on lit bien dans modifiers
  byGirl.forEach((g) => {
    if (g.net < 0) {
      alerts.push({ type: 'info', message: `${g.name} ne couvre pas ses frais.` });
    }

    const stress  = g.modifiers?.stress  ?? 0;
    const fatigue = g.modifiers?.fatigue ?? 0;

    if (stress >= 90)      alerts.push({ type: 'danger',  message: `${g.name} est en stress critique.` });
    else if (stress >= 80) alerts.push({ type: 'warning', message: `${g.name} est sous forte pression.` });

    if (fatigue >= 90)      alerts.push({ type: 'danger',  message: `${g.name} est épuisée.` });
    else if (fatigue >= 80) alerts.push({ type: 'warning', message: `${g.name} est proche de l'épuisement.` });

    if (g.modifiers?.unavailable) {
      alerts.push({ type: 'danger', message: `${g.name} est indisponible ce tour.${g.modifiers?.unavailabilityReason}` });
    }
  });

  // Loyers trop lourds
  if (summary.income > 0 && Math.abs(summary.rent) > summary.income * 0.6) {
    alerts.push({ type: 'warning', message: 'Les loyers grignotent la majorité des revenus.' });
  }

  return alerts;
};


// ─── Composant principal ────────────────────────────────────────────────────

export const TurnReportDialog = ({ open, onClose, report }) => {
  const [expandedDistrict, setExpandedDistrict] = useState(null);

  if (!report) return null;

  const { summary, byDistrict, byGirl, events = [], turn } = report;
  const alerts = computeAlerts(report);

  // On regroupe les events par district pour les afficher dans chaque accordion
  const eventsByDistrict = {};
  events.forEach((e) => {
    const arr = eventsByDistrict[e.districtId] || [];
    arr.push(e);
    eventsByDistrict[e.districtId] = arr;
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: '#1a1a1e',
          border: '1px solid #2e2e35',
          borderRadius: 12,
          color: '#e0e0e0',
          boxShadow: '0 8px 40px #00000066',
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #2a1a1a 0%, #1a1a1e 100%)',
          borderBottom: '1px solid #2e2e35',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
          px: 2.5,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
            Rapport du tour {turn}
          </Typography>
          <Typography variant="caption" sx={{ color: '#555' }}>
            Bilan financier & événements
          </Typography>
        </Box>
        {/* Net global dans un badge prominent */}
        <Box
          sx={{
            px: 1.5,
            py: 0.6,
            borderRadius: 8,
            background: summary.net >= 0 ? '#1e2e1e' : '#2e1e1e',
            border: `1px solid ${summary.net >= 0 ? '#4caf5044' : '#f4433644'}`,
          }}
        >
          <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.6rem', display: 'block' }}>
            Net
          </Typography>
          <Typography variant="subtitle2" sx={{ color: netColor(summary.net), fontWeight: 700 }}>
            {money(summary.net)}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>

        {/* ── Bilan financier compact ── */}
        <Box
          sx={{
            background: '#23232a',
            border: '1px solid #2e2e35',
            borderRadius: 8,
            px: 1.5,
            py: 1,
            mb: 2,
          }}
        >
          <StatLine label="Revenus" value={summary.income} color="#66bb6a" />
          <StatLine label="Loyers" value={summary.rent} color="#ef5350" />
          {summary.eventDelta !== 0 && summary.eventDelta != null && (
            <StatLine label="Événements" value={summary.eventDelta} color="#ff9800" />
          )}
          <Divider sx={{ borderColor: '#2e2e35', my: 0.6 }} />
          <StatLine label="Résultat net" value={summary.net} />
        </Box>

        {/* ── Alertes ── */}
        {alerts.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#555', textTransform: 'uppercase', letterSpacing: 0.6, mb: 0.6, display: 'block' }}>
              Alertes
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {alerts.map((a, i) => {
                const chipStyle =
                  a.type === 'danger'  ? { bg: '#3a1a1a', color: '#ef5350', border: '#c6282844' }
                : a.type === 'warning' ? { bg: '#2e2218', color: '#ff9800', border: '#ff980044' }
                :                         { bg: '#1e1e22', color: '#78909c', border: '#2e2e35' };

                return (
                  <Chip
                    key={i}
                    label={a.message}
                    size="small"
                    sx={{
                      background: chipStyle.bg,
                      color: chipStyle.color,
                      border: `1px solid ${chipStyle.border}`,
                      fontSize: '0.65rem',
                      height: 22,
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* ── Accordions par quartier ── */}
        <Typography variant="caption" sx={{ color: '#555', textTransform: 'uppercase', letterSpacing: 0.6, mb: 0.8, display: 'block' }}>
          Par quartier
        </Typography>

        <Stack spacing={0.6}>
          {byDistrict.map((d) => {
            const districtEvents = eventsByDistrict[d.districtId] || [];
            const hasEvents = districtEvents.length > 0;

            return (
              <Accordion
                key={d.districtId}
                expanded={expandedDistrict === d.districtId}
                onChange={() => setExpandedDistrict(expandedDistrict === d.districtId ? null : d.districtId)}
                sx={{
                  background: '#23232a',
                  border: `1px solid ${hasEvents ? '#ff980033' : '#2e2e35'}`,
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  '&.MuiAccordion-expanded': {
                    borderColor: hasEvents ? '#ff9800' : '#3a3a42',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#555', fontSize: 18 }} />}
                  sx={{
                    px: 1.5,
                    py: 0.6,
                    minHeight: '42px !important',
                    '& .MuiAccordionSummary-content': { alignItems: 'center', my: '0 !important' },
                  }}
                >
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#ddd', fontWeight: 600, fontSize: '0.75rem' }}>
                      {d.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#555', fontSize: '0.62rem' }}>
                      {d.girls.length} fille(s)
                    </Typography>
                    {hasEvents && (
                      <Chip
                        label={`${districtEvents.length} event${districtEvents.length > 1 ? 's' : ''}`}
                        size="small"
                        sx={{ background: '#2e2218', color: '#ff9800', border: '1px solid #ff980033', fontSize: '0.58rem', height: 16 }}
                      />
                    )}
                    {d.clientele != null && d.clientele < 1 && (
                      <Chip
                        label={`Clientèle ${Math.round(d.clientele * 100)}%`}
                        size="small"
                        sx={{ background: '#2a2218', color: '#ff9800', border: '1px solid #ff980033', fontSize: '0.58rem', height: 16 }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: netColor(d.net), fontWeight: 700, fontSize: '0.75rem' }}>
                    {money(d.net)}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 1.5, pb: 1.2, pt: 0.2 }}>
                  {/* Mini bilan du district */}
                  <Box sx={{ mb: 1 }}>
                    <StatLine label="Revenus" value={d.income} color="#66bb6a" subtle />
                    <StatLine label="Loyers" value={d.rent} color="#ef5350" subtle />
                  </Box>

                  {/* Événements du district */}
                  {hasEvents && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#555', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4, display: 'block' }}>
                        Événements
                      </Typography>
                      <Stack spacing={0.5}>
                        {districtEvents.map((ev, i) => (
                          <EventBlock key={i} event={ev} districtLabel={d.label} />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Détail par fille */}
                  <Stack spacing={0.5}>
                    {byGirl
                      .filter((g) => g.districtId === d.districtId)
                      .map((g) => (
                        <GirlLine key={g.girlId} girl={g} />
                      ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions
        sx={{
          borderTop: '1px solid #2e2e35',
          px: 2.5,
          py: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{
            borderColor: '#3a3a42',
            color: '#aaa',
            fontSize: '0.72rem',
            '&:hover': { borderColor: '#666', color: '#fff' },
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};



// ─── Composant ──────────────────────────────────────────────────────────────

export const GlobalEventDialog = ({ open, event, state, onResolve }) => {
  if (!event) return null;

  // Résoudre les fonctions dynamiques (title, message)
  const title = typeof event.title === 'function' ? event.title(state) : event.title;
  const message = typeof event.message === 'function' ? event.message(state) : event.message;

  const handleChoice = (choice) => {
    const { mutations, message: resultMessage } = choice.consequences(state);
    onResolve({ mutations, resultMessage, eventId: event.id });
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          background: '#1a1a1e',
          border: '2px solid #c62828',
          borderRadius: 12,
          color: '#e0e0e0',
          boxShadow: '0 12px 60px #00000088',
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #3a1a1a 0%, #1a1a1e 100%)',
          borderBottom: '2px solid #c62828',
          py: 2,
          px: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#c62828',
              boxShadow: '0 0 12px #c62828',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.4 },
              },
            }}
          />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      {/* ── Message ── */}
      <DialogContent sx={{ p: 2.5 }}>
        <Typography
          variant="body2"
          sx={{
            color: '#ddd',
            lineHeight: 1.6,
            fontSize: '0.9rem',
            whiteSpace: 'pre-line', // permet les retours ligne dans le message
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <Divider sx={{ borderColor: '#2e2e35' }} />

      {/* ── Choix ── */}
      <DialogActions sx={{ p: 2.5, flexDirection: 'column', gap: 0.8, alignItems: 'stretch' }}>
        {event.choices.map((choice, i) => {
          const label = typeof choice.label === 'function' ? choice.label(state) : choice.label;
          
          // Style différent selon qu'il y a 1 choix (OK simple) ou plusieurs (décision)
          const isSingleChoice = event.choices.length === 1;
          
          return (
            <Button
              key={i}
              fullWidth
              variant={isSingleChoice ? 'contained' : 'outlined'}
              onClick={() => handleChoice(choice)}
              sx={{
                py: 1,
                fontSize: '0.85rem',
                fontWeight: 600,
                borderColor: isSingleChoice ? 'transparent' : i === 0 ? '#4caf50' : '#ef5350',
                color: isSingleChoice ? '#fff' : i === 0 ? '#66bb6a' : '#ef5350',
                background: isSingleChoice
                  ? 'linear-gradient(135deg, #c62828, #b71c1c)'
                  : i === 0
                  ? '#1e2e1e'
                  : '#2e1e1e',
                boxShadow: isSingleChoice ? '0 4px 18px #c6282866' : 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  background: isSingleChoice
                    ? 'linear-gradient(135deg, #e53935, #c62828)'
                    : i === 0
                    ? '#253325'
                    : '#332525',
                  borderColor: i === 0 ? '#66bb6a' : '#ef5350',
                  boxShadow: isSingleChoice ? '0 6px 24px #c6282888' : 'none',
                },
              }}
            >
              {label}
            </Button>
          );
        })}
      </DialogActions>
    </Dialog>
  );
};

export const SPECIALITE_PRICE = 500;


// ─── Dialogue Professionnelle ───────────────────────────────────────────────

export const ProfessionalActionsDialog = ({
  open,
  onClose,
  girl,
  districts,
  playerMoney,
  onRepos,
  onRenvoyer,
  onAssignDistrict,
  onLearnSpecialite,
}) => {
  const [learnMode, setLearnMode] = useState(false);

  if (!girl) return null;

  const missingSpecialites = ALL_SPECIALITES.filter(
    (s) => !(girl.specialites || []).includes(s)
  );

  const handleLearn = (specialite) => {
    if (playerMoney < SPECIALITE_PRICE) return;
    onLearnSpecialite(girl.id, specialite, SPECIALITE_PRICE);
    setLearnMode(false);
    onClose();
  };

  const handleAssign = (districtId) => {
    onAssignDistrict(girl.id, districtId);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => { setLearnMode(false); onClose(); }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#1a1a1e',
          border: '1px solid #2e2e35',
          borderRadius: 12,
          color: '#e0e0e0',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #2a1a1a 0%, #1a1a1e 100%)',
          borderBottom: '1px solid #2e2e35',
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={girl.image} sx={{ width: 40, height: 40, border: '2px solid #c62828' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700 }}>
              {girl.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Actions professionnelles
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {!learnMode ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Assigner à un quartier */}
            <Box>
              <Typography variant="caption" sx={{ color: '#555', textTransform: 'uppercase', letterSpacing: 0.6, mb: 0.6, display: 'block' }}>
                Assigner à un quartier
              </Typography>
              {districts.map((d) => (
                <Button
                  key={d.id}
                  fullWidth
                  size="small"
                  variant="outlined"
                  disabled={girl.assignedDistrictId === d.id}
                  onClick={() => handleAssign(d.id)}
                  sx={{
                    justifyContent: 'space-between',
                    mb: 0.5,
                    fontSize: '0.7rem',
                    py: 0.5,
                    borderColor: girl.assignedDistrictId === d.id ? '#4caf50' : '#3a3a42',
                    color: girl.assignedDistrictId === d.id ? '#66bb6a' : '#ddd',
                    background: girl.assignedDistrictId === d.id ? '#1e2e1e' : '#23232a',
                    '&:hover:not(:disabled)': { borderColor: '#ff7043', background: '#2a2520' },
                    '&.Mui-disabled': { color: '#66bb6a !important', borderColor: '#4caf50 !important' },
                  }}
                >
                  <span>{d.label}</span>
                  {girl.assignedDistrictId === d.id && <Chip label="Actuel" size="small" sx={{ height: 16, fontSize: '0.6rem', background: '#1a1a1e', color: '#66bb6a' }} />}
                </Button>
              ))}
            </Box>

            <Divider sx={{ borderColor: '#2e2e35', my: 0.5 }} />

            {/* Mettre au repos */}
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => { onRepos(girl); onClose(); }}
              sx={{
                fontSize: '0.7rem',
                py: 0.6,
                borderColor: '#2e4a5a',
                color: '#5078ef',
                background: '#1e2026',
                '&:hover': { borderColor: '#507def', background: '#252a35' },
              }}
            >
              🧘🏼 Mettre au repos
            </Button>

            {/* Apprendre une spécialité */}
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => setLearnMode(true)}
              disabled={missingSpecialites.length === 0}
              sx={{
                fontSize: '0.7rem',
                py: 0.6,
                borderColor: '#3a5a3a',
                color: '#81c784',
                background: '#1e261e',
                '&:hover:not(:disabled)': { borderColor: '#81c784', background: '#253325' },
                '&.Mui-disabled': { color: '#555 !important', borderColor: '#2a2a2e !important' },
              }}
            >
              📚 Apprendre une spécialité ({SPECIALITE_PRICE} €)
            </Button>

            <Divider sx={{ borderColor: '#2e2e35', my: 0.5 }} />

            {/* Renvoyer */}
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => { onRenvoyer(girl); onClose(); }}
              sx={{
                fontSize: '0.7rem',
                py: 0.6,
                borderColor: '#5a2e2e',
                color: '#ef5350',
                background: '#261e1e',
                '&:hover': { borderColor: '#ef5350', background: '#332525' },
              }}
            >
              ⛓️‍💥 Renvoyer
            </Button>
          </Box>
        ) : (
          /* Mode apprentissage spécialité */
          <Box>
            <Typography variant="caption" sx={{ color: '#555', mb: 1, display: 'block' }}>
              Choisissez une spécialité à enseigner à {girl.name} ({SPECIALITE_PRICE} € chacune)
            </Typography>
            <Grid container spacing={0.5}>
              {missingSpecialites.map((s) => {
                const canAfford = playerMoney >= SPECIALITE_PRICE;
                return (
                  <Grid item xs={6} key={s}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      disabled={!canAfford}
                      onClick={() => handleLearn(s)}
                      sx={{
                        fontSize: '0.68rem',
                        py: 0.5,
                        borderColor: canAfford ? '#3a5a3a' : '#2a2a2e',
                        color: canAfford ? '#81c784' : '#555',
                        background: canAfford ? '#1e261e' : '#1a1a1e',
                        textTransform: 'none',
                        '&:hover:not(:disabled)': { borderColor: '#81c784', background: '#253325' },
                      }}
                    >
                      {s}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
            <Button
              fullWidth
              size="small"
              onClick={() => setLearnMode(false)}
              sx={{ mt: 1.5, fontSize: '0.7rem', color: '#666' }}
            >
              ← Retour
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #2e2e35', px: 2, py: 1 }}>
        <Button onClick={() => { setLearnMode(false); onClose(); }} size="small" sx={{ color: '#aaa', fontSize: '0.7rem' }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// ─── Dialogue Personnelle ───────────────────────────────────────────────────

export const PersonalActionsDialog = ({
  open,
  onClose,
  girl,
  playerMoney,
  onCaliner,
  onBaiser,
  onLearnSpecialite,
  onOpenMiniGame, 
}) => {
  const [learnMode, setLearnMode] = useState(false);

  if (!girl) return null;

  const missingSpecialites = ALL_SPECIALITES.filter(
    (s) => !(girl.specialites || []).includes(s)
  );

  const handleLearn = (specialite) => {
    if (playerMoney < SPECIALITE_PRICE) return;
    onLearnSpecialite(girl.id, specialite, SPECIALITE_PRICE);
    setLearnMode(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => { setLearnMode(false); onClose(); }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#1a1a1e',
          border: '1px solid #2e2e35',
          borderRadius: 12,
          color: '#e0e0e0',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #2a1a1a 0%, #1a1a1e 100%)',
          borderBottom: '1px solid #2e2e35',
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={girl.image} sx={{ width: 40, height: 40, border: '2px solid #c62828' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700 }}>
              {girl.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Actions personnelles
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {!learnMode ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Câliner */}
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => { onCaliner(girl); onClose(); }}
              sx={{
                fontSize: '0.7rem',
                py: 0.6,
                borderColor: '#2e5a2e',
                color: '#81c784',
                background: '#1e261e',
                '&:hover': { borderColor: '#81c784', background: '#253325' },
              }}
            >
              💖 Câliner
            </Button>

            {/* Baiser */}
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => { onOpenMiniGame(girl); onClose(); }}
              sx={{
                fontSize: '0.7rem',
                py: 0.6,
                borderColor: '#5a2e4a',
                color: '#ce93d8',
                background: '#261e26',
                '&:hover': { borderColor: '#ce93d8', background: '#332535' },
              }}
            >
              🔥 Baiser
            </Button>

            <Divider sx={{ borderColor: '#2e2e35', my: 0.5 }} />

            {/* Apprendre une spécialité */}
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => setLearnMode(true)}
              disabled={missingSpecialites.length === 0}
              sx={{
                fontSize: '0.7rem',
                py: 0.6,
                borderColor: '#3a5a3a',
                color: '#81c784',
                background: '#1e261e',
                '&:hover:not(:disabled)': { borderColor: '#81c784', background: '#253325' },
                '&.Mui-disabled': { color: '#555 !important', borderColor: '#2a2a2e !important' },
              }}
            >
              📚 Apprendre une spécialité ({SPECIALITE_PRICE} €)
            </Button>
          </Box>
        ) : (
          /* Mode apprentissage spécialité */
          <Box>
            <Typography variant="caption" sx={{ color: '#555', mb: 1, display: 'block' }}>
              Choisissez une spécialité à enseigner à {girl.name} ({SPECIALITE_PRICE} € chacune)
            </Typography>
            <Grid container spacing={0.5}>
              {missingSpecialites.map((s) => {
                const canAfford = playerMoney >= SPECIALITE_PRICE;
                return (
                  <Grid item xs={6} key={s}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      disabled={!canAfford}
                      onClick={() => handleLearn(s)}
                      sx={{
                        fontSize: '0.68rem',
                        py: 0.5,
                        borderColor: canAfford ? '#3a5a3a' : '#2a2a2e',
                        color: canAfford ? '#81c784' : '#555',
                        background: canAfford ? '#1e261e' : '#1a1a1e',
                        textTransform: 'none',
                        '&:hover:not(:disabled)': { borderColor: '#81c784', background: '#253325' },
                      }}
                    >
                      {s}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
            <Button
              fullWidth
              size="small"
              onClick={() => setLearnMode(false)}
              sx={{ mt: 1.5, fontSize: '0.7rem', color: '#666' }}
            >
              ← Retour
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #2e2e35', px: 2, py: 1 }}>
        <Button onClick={() => { setLearnMode(false); onClose(); }} size="small" sx={{ color: '#aaa', fontSize: '0.7rem' }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// ─── Configuration ──────────────────────────────────────────────────────────

const PROGRESS_PER_SWIPE = 8;  // combien de % par passage entre les zones
const ZONE_HEIGHT = 120;        // hauteur de chaque zone cible
const CURSOR_SIZE = 48;         // taille du curseur custom
const ZONE_SIZE = 50;
const ZONE_GAP = 300;


// ─── Composant principal ────────────────────────────────────────────────────
const isInsideZone = (x, y, zone) =>
  x >= zone.x &&
  x <= zone.x + ZONE_SIZE &&
  y >= zone.y &&
  y <= zone.y + ZONE_SIZE;

export const IntimacyMiniGame = ({
  open,
  onClose,
  onComplete,
  girl,
  backgroundImage,  // URL de l'image de fond suggestive
  cursorImage,      // URL de l'image du curseur custom
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentZoneState, setCurrentZoneState] = useState(null); // juste pour le visuel
  const lastZoneRef = useRef(null); // <-- useRef pour éviter stale closure
  const containerRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });


  useEffect(() => {
    if (progress >= 100 && !isComplete) {
      setIsComplete(true);
      // Animation de completion, puis appel du callback après 1.5s
      setTimeout(() => {
        onComplete();
        handleClose();
      }, 1500);
    }
  }, [progress, isComplete, onComplete]);

  const handleMouseMove = (e) => {
    if (isComplete || !containerRef.current) return;
setCursorPos({
  x: e.clientX,
  y: e.clientY,
});

  const rect = containerRef.current.getBoundingClientRect();
const mouseX = e.clientX - rect.left;
const mouseY = e.clientY - rect.top;

const centerX = rect.width / 2 - ZONE_SIZE / 2;

//   const topZoneY = `calc(50% - 100px)`;
// const bottomZoneY = `calc(50% + ${100}px)`;
//   const topZoneX = `calc(50% - 80px)`;
// const bottomZoneX = `calc(50% - ${20}px)`;
const topZone = {
  x: centerX-80,
  y: rect.height / 2 -100,
};

const bottomZone = {
  x: centerX-20,
  y: rect.height / 2 + 100,
};

let currentZone = null;

if (isInsideZone(mouseX, mouseY, topZone)) currentZone = 'top';
if (isInsideZone(mouseX, mouseY, bottomZone)) currentZone = 'bottom';

if (currentZone && lastZoneRef.current && currentZone !== lastZoneRef.current) {
  setProgress((p) => Math.min(100, p + PROGRESS_PER_SWIPE));
}

if (currentZone) lastZoneRef.current = currentZone;
setCurrentZoneState(currentZone);

  };

  const handleClose = () => {
    setProgress(0);
    setIsComplete(false);
    lastZoneRef.current = null;
    setCurrentZoneState(null);
    onClose();
  };
  const topZoneY = `calc(50% - 100px)`;
const bottomZoneY = `calc(50% + ${100}px)`;
  const topZoneX = `calc(50% - 80px)`;
const bottomZoneX = `calc(50% - ${20}px)`;


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden',
          cursor: 'none',

        },
      }}
    >
      <Box
        ref={containerRef}
        onMouseMove={handleMouseMove}
        sx={{
          position: 'relative',
          width: '100%',
          height: '70vh',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #2a1a1a 0%, #1a1a1e 100%)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat:'no-repeat',
          cursor: cursorImage ? `url(${cursorImage}) ${CURSOR_SIZE / 2} ${CURSOR_SIZE / 2}, auto` : 'pointer',
          overflow: 'hidden',
          borderRadius: 12,
          border: '2px solid #c62828',
        }}
      >{/* Zone TOP */}
<Box
  sx={{
    position: 'absolute',
    left: topZoneX,
    top: topZoneY,
    transform: 'translateX(-50%)',
    width: ZONE_SIZE,
    height: ZONE_SIZE,
    background:
      currentZoneState === 'top'
        ? 'rgba(255,112,67,0.4)'
        : 'rgba(255,112,67,0.15)',
    border: '2px dashed rgba(255,112,67,0.8)',
    borderRadius: 8,
    transition: 'background 0.15s, transform 0.15s',
    pointerEvents: 'none',
  }}
/>

{/* Zone BOTTOM */}
<Box
  sx={{
    position: 'absolute',
    left: bottomZoneX,
    top: bottomZoneY,
    transform: 'translateX(-50%)',
    width: ZONE_SIZE,
    height: ZONE_SIZE,
    background:
      currentZoneState === 'bottom'
        ? 'rgba(255,112,67,0.4)'
        : 'rgba(255,112,67,0.15)',
    border: '2px dashed rgba(255,112,67,0.8)',
    borderRadius: 8,
    transition: 'background 0.15s, transform 0.15s',
    pointerEvents: 'none',
  }}
/>


        {/* Progress bar */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            maxWidth: 400,
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: 8,
            p: 1.5,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#ddd',
              display: 'block',
              textAlign: 'center',
              mb: 0.5,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {isComplete ? '💖 Complété !' : `${Math.round(progress)}%`}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10,
              borderRadius: 5,
              background: '#2a2a2e',
              '& .MuiLinearProgress-bar': {
                background: isComplete
                  ? 'linear-gradient(90deg, #ff7043, #c62828)'
                  : 'linear-gradient(90deg, #ff7043, #ff9800)',
                borderRadius: 5,
                transition: 'transform 0.3s, background 0.5s',
              },
            }}
          />
        </Box>

        {/* Animation de completion */}
        {isComplete && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              animation: 'fadeIn 0.5s',
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                animation: 'pulse 1s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' },
                },
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: '#ff7043',
                  fontWeight: 700,
                  textShadow: '0 0 20px #ff704388',
                  mb: 1,
                }}
              >
                🔥
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  textShadow: '0 2px 10px #00000088',
                }}
              >
                {girl?.name} est ravie !
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {cursorImage && (
  <Box
    sx={{
      position: 'fixed',
      top: cursorPos.y,
      left: cursorPos.x,
      width: CURSOR_SIZE,
      height: CURSOR_SIZE,
     transform: `
  translate(-50%, -50%)
  scale(${currentZoneState ? 1.25 : 1})
  rotate(${currentZoneState === 'top' ? '-10deg' : '10deg'})
`,

      pointerEvents: 'none',
      zIndex: 2000,
      backgroundImage: `url(${cursorImage})`,
      
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      filter: isComplete
        ? 'drop-shadow(0 0 12px #ff7043)'
        : 'drop-shadow(0 0 6px rgba(255,112,67,0.6))',
      transition: 'filter 0.2s ease',
    }}
  />
)}

    </Dialog>
  );
};