import {
  Box,
  SpeedDial,
  SpeedDialAction,
  Typography
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import PlayIcon from "@mui/icons-material/PlayArrow";
import FuseeIcon from "@mui/icons-material/RocketLaunch";
import { setTimeScale } from "./systems/TimeSystem";
import SettingsIcon from "@mui/icons-material/Settings";

export const SpeedMonday=({world})=>{

    const actions = [
    { icon: <PauseIcon />, name: "Pause", action: () => setTimeScale(world, 0) },
    { icon: <PlayIcon />, name: "x1", action: () => setTimeScale(world, 0.5) },
    { icon: <FastForwardIcon />, name: "x5", action: () => setTimeScale(world, 2) },
    { icon: <FuseeIcon />, name: "x10", action: () => setTimeScale(world, 4) },
    { icon: <SaveIcon />, name: "Save", action: () => console.log("save") },
    { icon: <SettingsIcon />, name: "Options", action: () => console.log("options") }
  ];
    return <SpeedDial
  ariaLabel="Game Menu"
  icon={<TimeIcon world={world} />}
  sx={{
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 1200
  }}
>
  {actions.map((a) => (
    <SpeedDialAction
      key={a.name}
      icon={a.icon}
      tooltipTitle={a.name}
      onClick={a.action}
    />
  ))}
</SpeedDial>

}

const TimeIcon = ({ world }) => (
  <Box
    sx={{
      width: 56,
      height: 56,
      borderRadius: "50%",
      bgcolor: "primary.main",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      lineHeight: 1.1,
      textAlign: "center",
      p: 0.5
    }}
  >
    <Typography variant="caption" sx={{ fontSize: 10 }}>
      Day {world.time.day}
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
      {String(world.time.hour).padStart(2, "0")}:
      {String(world.time.minute).padStart(2, "0")}
    </Typography>
  </Box>
);
