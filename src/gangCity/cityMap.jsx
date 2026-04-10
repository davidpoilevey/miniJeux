import { Avatar, Box, Popover, Tooltip, Typography } from "@mui/material";
import { useMaqCity } from "./GangContext";
import imgStrass from './strass.png';
import { DISTRICTS_UI } from "./District";
import { useState } from "react";
import { DistrictPopup } from "./GangDialogs";
import { OnBoardingStep } from "../OnBoardingContext";

export const CityView = () => {
  const { state } = useMaqCity();

  return (
    <Box sx={{ p: 2, background:'#e1c680' }}>
      <Typography variant="h6">Carte de la ville</Typography>

      <CityMap />
 <OnBoardingStep
  stepId="welcome"
  message="Bienvenue dans Maq-City, vous incarnez un maquereau et vous devez gagnez un maximum de pognon en preservant l'integrité des filles sous votre responsabilité. "
></OnBoardingStep>
 <OnBoardingStep
  stepId="welcome2"
  message="C'est la carte de Strasbourg, cliquez sur un quartier "
></OnBoardingStep>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Tour {state.turn} — Argent : {state.money} €
      </Typography>
    </Box>
  );
};

const MAP_WIDTH = 1600;
const MAP_HEIGHT = 900;
const CityMap = () => {

const [selectedDistrict, setSelectedDistrict] = useState(null);
const [anchorEl, setAnchorEl] = useState(null);

const onDistrictClick = (event, district) => {
  setAnchorEl(event.currentTarget);
  setSelectedDistrict(district);
};

const closePopup = () => {
  setAnchorEl(null);
  setSelectedDistrict(null);
};
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: MAP_WIDTH,
        aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
        margin: '0 auto',
        position: 'relative',
        backgroundImage: 'url('+imgStrass+')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '2px solid rgba(255,255,255,0.2)'
      }}
    >
      <DistrictLayers onDistrictClick={onDistrictClick}/>
      <Popover
  open={Boolean(anchorEl)}
  anchorEl={anchorEl}
  onClose={closePopup}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  transformOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  {selectedDistrict && (
    <DistrictPopup district={selectedDistrict} />
  )}
</Popover>

    </Box>
  );
};


// ─── Helpers ────────────────────────────────────────────────────────────────

/** Couleur du bord avatar selon stress + fatigue combined */
const girlBorderColor = (girl) => {
  const total = (girl.stress ?? 0) + (girl.fatigue ?? 0);
  if (total > 150) return '#a506a5'; // rouge
  if (total > 100) return '#f44336'; // rouge
  if (total > 60)  return '#ff9800'; // orange
  return '#4caf50';                  // vert
};


/** Génère les badges pour un district donné.
 *  Chaque badge est un objet : { key, content, tooltip }
 *  → on rajoute juste un nouvel item ici pour chaque nouveau type d'info
 */
const getDistrictBadges = (district, girls, state) => {
  const badges = [];

  // ── Badge : filles présentes ──
  if (girls.length > 0) {
    badges.push({
      key: 'girls',
      tooltip: girls.map((g) => {
        const arrested = g.arrestedUntilTurn != null && state.turn < g.arrestedUntilTurn;
        return arrested ? `${g.name} (🔒 jusqu'au tour ${g.arrestedUntilTurn})` : g.name;
      }).join(', '),
      content: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {girls.map((girl, i) => {
            const arrested = girl.arrestedUntilTurn != null && state.turn < girl.arrestedUntilTurn;
            return (
              <Box
                key={girl.id}
                sx={{
                  position: 'relative',
                  ml: i > 0 ? -1 : 0,
                  zIndex: girls.length - i,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.25)', zIndex: '999 !important' },
                }}
              >
                <Avatar
                  src={girl.image}
                  alt={girl.name}
                  sx={{
                    width: 48,
                    height: 48,
                    border: `2px solid ${arrested ? '#555' : girlBorderColor(girl)}`,
                    boxShadow: arrested ? 'none' : `0 0 6px ${girlBorderColor(girl)}66`,
                    filter: arrested ? 'grayscale(1) brightness(0.6)' : 'none',
                    opacity: arrested ? 0.7 : 1,
                  }}
                />
                {arrested && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      pointerEvents: 'none',
                    }}
                  >
                    🔒
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      ),
    });
  }


  // ── Badge : clientèle (smiley coloré selon niveau) ──
  const clientele = district.clientele ?? 1;
  if (clientele <= 1) {
    const emoji = clientele < 0.5 ? '😟' : clientele < 0.8 ? '😐' : '😊';
    const color = clientele < 0.5 ? '#f44336' : clientele < 0.8 ? '#ff9800' : '#66bb6a';
    const bgColor = clientele < 0.5 ? '#3a1a1a' : clientele < 0.8 ? '#2e2218' : '#1e2e1e';

    badges.push({
      key: 'clientele',
      tooltip: `Clientèle : ${Math.round(clientele * 100)}%`,
      content: (
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: bgColor,
            border: `2px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            boxShadow: `0 0 6px ${color}44`,
          }}
        >
          {emoji}
        </Box>
      ),
    });
  }

  // ── Badge : mutations actives (clienteleLoss récente, stressAllGirls, rentModifier) ──
  const mutations = [];
  if (district.currentModifiers?.clienteleLoss && district.currentModifiers?.clienteleLoss > 0) {
    mutations.push({ label: '📉 Clientèle', color: '#ff9800' });
  }
  if (district.currentModifiers?.stressAllGirls && district.currentModifiers?.stressAllGirls > 0) {
    mutations.push({ label: '⚡ Stress', color: '#ef5350' });
  }
  if (district.currentModifiers?.pub) {
    mutations.push({ label: '💰 Pub', color: '#5082ef' });
  }
  if (district.currentModifiers?.secu) {
    mutations.push({ label: 'Securité', color: '#2fb920' });
  }
  
  if (district.currentModifiers?.rentModifier && district.currentModifiers?.rentModifier !== 1) {
    const isGood = district.currentModifiers?.rentModifier < 1;
    mutations.push({
      label: `💰 Loyer ×${district.currentModifiers?.rentModifier.toFixed(1)}`,
      color: isGood ? '#66bb6a' : '#ef5350',
    });
  }

  if (mutations.length > 0) {
    badges.push({
      key: 'mutations',
      tooltip: mutations.map((m) => m.label).join(' · '),
      content: (
        <Box sx={{ display: 'flex', gap: 0.3 }}>
          {mutations.map((mut, i) => (
            <Box
              key={i}
              sx={{
                px: 0.6,
                py: 0.2,
                borderRadius: 4,
                background: '#1a1a1e',
                border: `1px solid ${mut.color}44`,
                fontSize: '0.6rem',
                color: mut.color,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {mut.label}
            </Box>
          ))}
        </Box>
      ),
    });
  }

  return badges;
};

// ─── Composant principal ────────────────────────────────────────────────────

export const DistrictLayers = ({ onDistrictClick }) => {
  const { state } = useMaqCity();

  return (
    <>
      {state.districts.map((d) => {
        const ui = DISTRICTS_UI[d.id];
        if (!ui) return null;

        const girlsHere = state.girls.filter((g) => g.assignedDistrictId === d.id);
        const badges = getDistrictBadges(d, girlsHere, state);
        const isOccupied = girlsHere.length > 0;

        return (
          <Box
            key={d.id}
            onClick={(e) => onDistrictClick(e, d)}
            sx={{
              position: 'absolute',
              left: `${ui.x * 100}%`,
              top: `${ui.y * 100}%`,
              width: `${ui.w * 100}%`,
              height: `${ui.h * 100}%`,
              border: `2px dashed ${isOccupied ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)'}`,
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.6,
              bgcolor: isOccupied ? 'rgba(30,30,40,0.45)' : 'rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                border: '2px dashed rgba(255,255,255,0.7)',
                boxShadow: 'inset 0 0 18px rgba(255,255,255,0.06)',
              },
            }}
          >
            {/* Label du quartier */}
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 4,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(2px)',
              }}
            >
              <span style={{ color: '#ddd', fontSize: '0.72rem', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                {d.label}
              </span>
            </Box>

            {/* Badges (avatars, bonus, conflits…) */}
            {badges.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {badges.map((badge) => (
                  <Tooltip key={badge.key} title={badge.tooltip} placement="bottom" arrow>
                    <Box>{badge.content}</Box>
                  </Tooltip>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
};