import React, { useRef } from "react";
import { TILE_SIZE, useTilesContext } from "./Tiles";
import { Badge, Box, Fab, Grid, Paper, Typography } from "@mui/material";
import Colonie from "./Colonie";
import imgEau from './images/eau.png';
import imgPuceronA from './images/puceronActif.png';
import imgPuceronIna from './images/puceronInactif.png';
import imgPlanteMalade from './images/planteMalade.png';
import imgRocTL from './images/rocTL.png';
import imgRocT from './images/rocT.png';
import imgRocTR from './images/rocTR.png';
import imgRocTLR from './images/rocTLR.png';
import imgRocL from './images/rocL.png';
import imgRoc from './images/roc.png';
import imgRocR from './images/rocR.png';
import imgRocLR from './images/rocLR.png';
import imgRocBL from './images/rocBL.png';
import imgRocB from './images/rocB.png';
import imgRocBR from './images/rocBR.png';
import imgRocBLR from './images/rocBLR.png';
import imgRocTBL from './images/rocTBL.png';
import imgRocTB from './images/rocB.png';
import imgRocTBR from './images/rocTBR.png';
import imgRocTBLR from './images/rocTBLR.png';

import imgSucre from './images/sucre.png';



const Map = ({ children , getTypeColor}) => {
    const { tiles } = useTilesContext();

    // Génère une grille de tuiles
    const renderTiles = () => {
      if(tiles==null)
        return null;
      return tiles.map((row, rowIndex) => (
        <Grid container key={rowIndex}>
          {row.map((tile, colIndex) => (
            <Grid item key={colIndex}>
             {tile.type==='colonie'?<Colonie name={tile.id} color={getTypeColor(tile.id)} reserve={tile.reserve}/>:<Paper
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: 'lightgreen',
                  display:'flex',alignItems:'center',justifyContent:'center'
                  , position:'relative'
                }}
              >
               {tile.type=='eau'?<Eau puceron={tile.puceron}/>
                :(tile.type==='sucre'?<Sucre contenu={tile.contenu}/>
                :tile.type==='rocher'?<Rocher tiles={tiles} row={rowIndex} col={colIndex}/>
                :null)
              }
              {tile.puceron!=null && <Puceron vivant={tile.puceron}/>}
              {tile.pheromone!=null && <Phero getTypeColor={getTypeColor} pheromone={tile.pheromone}/>}
            
              </Paper>}
            </Grid>
          ))}
        </Grid>
      ));
    };
  
    return (
      <div>
        <Grid container spacing={1}>
          {renderTiles()}
        </Grid>
        {children}
      </div>
    );
  };
  
 export const Puceron = ({vivant, size=TILE_SIZE/2})=>{
   
    return  <div
    style={{
      position:'absolute',
      top:0
,left:0
    }}
  >
    <img alt="puceron" src={vivant?imgPuceronA:imgPuceronIna} height={`${size}px`}/>
    </div>

  }

  const Phero = ({ pheromone , getTypeColor}) => {
    const renderPheromones = () => {
      return Object.entries(pheromone).map(([type, value]) => {
        // Génère une couleur aléatoire pour chaque type de phéromone
        const typeColor = getTypeColor(type) ;
        const size = Math.min(value / 5, 20);
        return (
          <Box
            key={type}
            style={{
              display: 'inline-block',
              borderRadius: '50%',
              width: `${size}px`,
              height: `${size}px`,
              marginRight: '2px',
              backgroundColor: typeColor,
            }}
          >
           
          </Box>
        );
      });
    };
  
    return <div>{renderPheromones()}</div>;
  };
  
  const Eau = ({ puceron, contenu=10 }) => {
    const goodImg = puceron!=null?imgPlanteMalade:imgEau
      return (
        <div
          style={{
            width: `${contenu * TILE_SIZE / 10}px`,
            height: `${contenu * TILE_SIZE / 10}px`,
            backgroundImage: `url(${goodImg})`,
            backgroundSize: 'cover', // Ajuste selon tes besoins
          }}
        />
      );
    };
    const getRocherType = (tiles, row, col) => {
      const hasRocherAbove = row > 0 && tiles[row - 1][col].type === 'rocher';
      const hasRocherBelow = row < tiles.length - 1 && tiles[row + 1][col].type === 'rocher';
      const hasRocherLeft = col > 0 && tiles[row][col - 1].type === 'rocher';
      const hasRocherRight = col < tiles[0].length - 1 && tiles[row][col + 1].type === 'rocher';
    
      let rocherType = '';
    
      if (hasRocherAbove) {
        rocherType += 'T';
      }
      if (hasRocherBelow) {
        rocherType += 'B';
      }
      if (hasRocherLeft) {
        rocherType += 'L';
      }
      if (hasRocherRight) {
        rocherType += 'R';
      }
    
      // Si aucun des côtés n'a de rocher, utilise le type par défaut (par exemple, 'BL')
      return rocherType;
    };
    export const getRocherImage = (rocherType) => {
      switch (rocherType) {
        case 'TL':
          return imgRocTL;
        case 'T':
          return imgRocT;
        case 'TR':
          return imgRocTR;
        case 'TLR':
          return imgRocTLR;
        case 'L':
          return imgRocL;
        case 'R':
            return imgRocR;
        case 'BL':
          return imgRocBL;
        case 'B':
          return imgRocB;
        case 'BR':
          return imgRocBR;
        case 'BLR':
          return imgRocBLR;
        case 'LR':
          return imgRocLR;
        case 'TBL':
          return imgRocTBL;
          case 'TB':
            return imgRocTB;
          case 'TBR':
            return imgRocTBR;
          case 'TBLR':
            return imgRocTBLR;
        default:
          return imgRoc; // Image par défaut
      }
    };
    const Rocher = ({ tiles, row, col }) => {
      const rocherType = getRocherType(tiles, row, col);
    
  const rocherImage = getRocherImage(rocherType);
      return (
        <div
          style={{
            width: TILE_SIZE + 'px',
            height: TILE_SIZE + 'px',
            backgroundImage: `url(${rocherImage})`, // Utilise l'image par défaut (par exemple, 'rocBL') ici
            backgroundSize: 'cover',
          }}
        />
      );
    };
    
  
const Sucre = ({ contenu }) => {
    return (
      <div
        style={{
          width: `${contenu * TILE_SIZE / 10}px`,
          height: `${contenu * TILE_SIZE / 10}px`,
          backgroundImage: `url(${imgSucre})`,
          backgroundSize: 'contain', // Ajuste selon tes besoins
        }}
      />
    );
  };
  
  
  export default Map;