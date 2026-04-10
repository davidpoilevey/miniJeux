import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Carte } from './Card';
import tvImg from './tapisVert.jpg';

export const TapisVert = ({ communityCards , gameStage, banque, currentMise, userMain}) => {
  return (
    <div style={{ textAlign: 'center', backgroundImage: `url(${tvImg})`, backgroundSize:'cover'
    ,opacity:0.9, padding: '20px', borderRadius: '10px',width:'100%' }}>
      <Box style={{  backgroundColor: 'rgba(25, 155, 15, 0.5)', marginBottom: '20px',}}>
       
          <Typography variant="h4" style={{ color: '#0f0' }}>
            Tapis vert
          </Typography>
          <Typography variant="h6" style={{ color: '#aaf' }}>
            Montant du tapis : {banque}
          </Typography>
          <Typography variant="h6" style={currentMise==0?null:{ color: '#ddad0f' }}>
            Mise courante : {currentMise}
          </Typography>
        </Box>
        <Box style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0' }}>
          {communityCards != null && Object.entries(communityCards).map(([stage, cards]) => (
            <div key={stage} style={{ width: '20%' }}>
              {cards.map((card, index) => (

                <Card key={index} variant="outlined" 
                style={{ backgroundColor: 'rgba(255,255,255,0.2)',  marginBottom: '10px', zIndex:index
                  , display:'flex', flexDirection:'column'
                ,position:'relative',top:`-${index*30}px`, left:index*2+'px' }}>
                  <CardContent sx={{flex:1}}>
                    
                    <Carte card={card} retourne={!(gameStage!=='pre-flop' && (stage==='flop'||gameStage===stage || gameStage==='river'))}/>
                 

                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </Box>
     
      <Typography variant='h5'  sx={{backgroundColor:'rgba(100,255,100,0.5)'}}>Votre main actuelle : {userMain}</Typography>
    </div>
  );
};
