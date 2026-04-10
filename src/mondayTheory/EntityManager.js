
import RestaurantIcon from "@mui/icons-material/Restaurant";
import BedIcon from "@mui/icons-material/Bed";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import GroupsIcon from "@mui/icons-material/Groups";
import workIcon from "@mui/icons-material/Engineering";
import ShowerIcon from "@mui/icons-material/Shower";
import { Box, Typography, Popover } from "@mui/material";
import { useState } from "react";
import { SpriteRegistry } from "./data";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalBarIcon from "@mui/icons-material/LocalBar";

const needIcons = {
  hunger: RestaurantIcon,
  energy: BedIcon,
  work: workIcon,
  fun: SportsEsportsIcon,
  social: GroupsIcon,
  hygiene: ShowerIcon,
  funCat: SportsEsportsIcon,
  thirst: RestaurantIcon
};

export const mentalStateIcons = {
  stress: PsychologyIcon,
  maladie: LocalHospitalIcon,
  luxure: FavoriteIcon,
  intoxication: LocalBarIcon
};

export function getMentalStateColor(key, value) {
  // Différentes logiques de couleur selon le type
  switch (key) {
    case "stress":
      if (value > 70) return "#fc6c2f"; // rouge
      if (value > 40) return "#ffc800"; // orange
      return "#eaff07"; // jaune
    
    case "maladie":
      if (value > 70) return "#d32f2f"; // rouge foncé
      if (value > 40) return "#f57c00"; // orange
      return "#ffb300"; // jaune
    
    case "luxure":
      if (value > 80) return "#e91e63"; // rose vif
      if (value > 60) return "#ec407a"; // rose
      return "#f48fb1"; // rose clair
    
    case "intoxication":
      if (value > 70) return "#7b1fa2"; // violet foncé
      if (value > 40) return "#9c27b0"; // violet
      return "#ba68c8"; // violet clair
    
    default:
      return getColor(value); // fallback sur la fonction existante
  }
}
const getColor = (value) => {
  if (value > 80) return "#e53935";   // critique
  if (value > 60) return "#fb8c00";   // warning
  if (value > 30) return "#e0e00c";   // warning
  return "#43a047";                   // ok
};

export function EntityRenderer({ entity, cellSize }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const size = entity.position.width || entity.growth?.size || cellSize;
  const needs = entity.needs;
  const mentalState = entity.mentalState;

  // Trouver le besoin le plus urgent
  const mostUrgentNeed = needs
    ? Object.entries(needs)
        .filter(([_, need]) => need.value > 50)
        .sort((a, b) => b[1].value - a[1].value)[0]
    : null;

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box
      sx={{
        position: "absolute",
        left: entity.position.x,
        top: entity.position.y,
        width: size,
        height: size,
        pointerEvents: "auto", // Changé pour permettre le hover
        cursor: "pointer"
      }}
      onMouseEnter={handlePopoverOpen}
      onMouseLeave={handlePopoverClose}
    >
      {/* Sprite */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          background: `url(${SpriteRegistry[entity.spriteId]})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center"
        }}
      />

      {/* Badge du besoin le plus urgent */}
      {mostUrgentNeed && (
        <Box
          sx={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            mb: 0.5
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              px: 0.5,
              py: 0.3,
              bgcolor: "rgba(0,0,0,0.8)",
              borderRadius: 1,
              border: `2px solid ${getColor(mostUrgentNeed[1].value)}`
            }}
          >
            {needIcons[mostUrgentNeed[0]] && (
              <Box
                component={needIcons[mostUrgentNeed[0]]}
                sx={{ 
                  fontSize: 14, 
                  color: getColor(mostUrgentNeed[1].value) 
                }}
              />
            )}
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: "bold",
                color: getColor(mostUrgentNeed[1].value)
              }}
            >
              {Math.round(mostUrgentNeed[1].value)}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Popover détaillé */}
      <Popover
        sx={{
          pointerEvents: "none"
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Box sx={{ p: 2, minWidth: 200, bgcolor: "background.paper" }}>
          {/* En-tête avec le nom/type */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            {entity.type.toUpperCase()}
          </Typography>

          {/* Section Needs */}
          {needs && (
            <>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
                Besoins :
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
                {Object.entries(needs).map(([key, need]) => {
                  const Icon = needIcons[key];
                  const color = getColor(need.value);
                  
                  return (
                    <Box
                      key={key}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {Icon && <Icon sx={{ fontSize: 16, color }} />}
                        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                          {key}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 6,
                            bgcolor: "grey.300",
                            borderRadius: 1,
                            overflow: "hidden"
                          }}
                        >
                          <Box
                            sx={{
                              width: `${need.value}%`,
                              height: "100%",
                              bgcolor: color,
                              transition: "width 0.3s"
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color, fontWeight: "bold", minWidth: 25 }}>
                          {Math.round(need.value)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </>
          )}

          {/* Section Mental State */}
          {mentalState && Object.values(mentalState).some(v => v > 0) && (
            <>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
                État mental :
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {Object.entries(mentalState)
                  .filter(([_, value]) => value > 0)
                  .map(([key, value]) => {
                    const Icon = mentalStateIcons[key];
                    const color = getMentalStateColor(key, value);
                    
                    return (
                      <Box
                        key={key}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {Icon && <Icon sx={{ fontSize: 16, color }} />}
                          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                            {key}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 6,
                              bgcolor: "grey.300",
                              borderRadius: 1,
                              overflow: "hidden"
                            }}
                          >
                            <Box
                              sx={{
                                width: `${value}%`,
                                height: "100%",
                                bgcolor: color,
                                transition: "width 0.3s"
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color, fontWeight: "bold", minWidth: 25 }}>
                            {Math.round(value)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            </>
          )}

          {/* Info additionnelle : currentGoal */}
          {entity.currentGoal && (
            <Box sx={{ mt: 1.5, pt: 1, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Objectif : <strong>{entity.currentGoal}</strong>
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </Box>
  );
}