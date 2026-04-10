import { Box } from "@mui/material"
import React from "react"
import { useSSContext } from "./SSGame"
import imgSoldat from './soldat.gif';

export const PSIZE=100;

const SSPerso = () => {
    const { perso, vitesse } = useSSContext(); // Supposons que 'vies' soit un nombre entre 1 et 3
  
    return (
      <Box
        sx={{
          position: 'absolute',
          top: perso.y,
          left: perso.x,
        }}
      >
        {/* Bordures concentriques pour représenter les vies */}
        {perso.vie >= 1 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: -20,
              width: PSIZE,
              height: PSIZE,
              borderRadius: 20,
              border: '3px ridge red',
              boxShadow: '0 0 0 3px red', // Pour la 1ème vie
            }}
          />
        )} 
        {perso.vie >= 2 && (
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                left: -30,
                width: PSIZE+20,
                height: PSIZE+20,
                borderRadius: 20,
                border: '3px ridge green',
                boxShadow: '0 0 0 3px green', // Pour la 2ème vie
              }}
            />
          )}
        {perso.vie >= 3 && (
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              left: -40,
              width: PSIZE+40,
              height: PSIZE+40,
              borderRadius: 20,
              border: '3px ridge blue',
              boxShadow: '0 0 0 3px blue', // Pour la 3ème vie
            }}
          />
        )}
  
        <img src={imgSoldat} width={PSIZE} height={PSIZE} />
      </Box>
    );
  };
export default SSPerso;