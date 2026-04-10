import React, { useState } from "react";
import { Avatar, Box } from "@mui/material";
import * as materialIcons from '@mui/icons-material';
import MeeDialog from "./MeeDialog";

const Mee = ({ mee, isStatic , onClick=()=>{}}) => {

  const positionStyle = isStatic
    ? { position: "relative", width: 46, height: 46 }
    : { position: "absolute", left: mee.x + 10, top: mee.y, width: 32, height: 32 };

  const IconComponent = materialIcons[mee.icon];
  const lastMemory = mee.memoire[mee.memoire.length - 1]?.resultat;
  let textBubble = null, colorBubble = null;
  switch (lastMemory) {
    case 'ok': textBubble = 'Copain!'; colorBubble = '#9eefd5'; break;
    case 'subi': textBubble = 'Aie!'; colorBubble = '#f9988f'; break;
    case 'echec': textBubble = 'Shit'; colorBubble = '#e9a8af'; break;
    case 'sex': textBubble = 'yeahhh'; colorBubble = '#e9b8e0'; break;
    case 'reussi': textBubble = 'Muhaha'; colorBubble = '#a978df'; break;
    case 'exploite': textBubble = 'Ouinn'; colorBubble = '#99d8cf'; break;
    case 'profiteur': textBubble = 'Donne'; colorBubble = '#f9988f'; break;
    case 'trahison': textBubble = 'Connard'; colorBubble = '#f9f89f'; break;
    case 'généreux': textBubble = 'Prenez mes amis'; colorBubble = '#f9f8ff'; break;

    default: textBubble = null;
  }

  return (
    <>
      <Box
        sx={{
          ...positionStyle,
          background: mee.color,
          borderRadius: "50%",
          border: "2px solid #333",
          display: "flex", flexDirection: 'column',
          textAlign: "center",
          justifyContent: "center",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: 2,
          transition: "transform 0.1s",
          "&:hover": { transform: "scale(1.12)" }
        }}
        onClick={()=>{
          onClick(mee);
         } }
      >
        <MeeBubble text={textBubble} colorBubble={colorBubble} />
        {mee.avatar==null?<IconComponent sx={{ zIndex: 2, fontSize: positionStyle.width - 4 }} />
        :<Avatar src={require(`../bitLife/images/${mee.avatar}`)} />}
        <ClanFlag clan={mee.maisonId} size={isStatic ? 42 : 28} height={isStatic ? 12 : 8} />
      </Box>
    </>
  );
};

export default Mee;



const MeeBubble = ({ text,colorBubble }) => {
  if (!text) return null;
  return (
    <Box
      sx={{
        position: 'absolute',
        top: -18,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: colorBubble||'white',
        color: '#333',
        px: 1,
        py: 0.3,
        borderRadius: 2,
        fontSize: 12,
        boxShadow: 1,
        border: '1px solid #bbb',
        whiteSpace: 'nowrap',
        zIndex: 2,
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '6px 6px 0 6px',
          borderStyle: 'solid',
          borderColor: '#fff transparent transparent transparent',
          filter: 'drop-shadow(0 1px 1px #bbb)',
        }
      }}
    >
      {text}
    </Box>
  );
};



export const ClanFlag = ({  clan, size = 54, height = 10, ...boxprops }) => {
  if (!clan) return null;
  return (
    <Box
    {...boxprops}
      sx={{
        width: size,
        minHeight: height,
        borderRadius: "2px 2px 4px 4px",
        border: "1.5px solid #333",
        background: clan.color,
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        mb: "2px"
      }}
      title={clan.name}
    />
  );
};