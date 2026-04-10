import { Box, Button, Paper, Typography } from "@mui/material"

import { loadMeteor, STAGES } from "./MeteorComponent";

export const LevelUpPending = ({ availableVariants, pendingStage, confirmImageAndAdvance, mass }) => {
    const savedGame = loadMeteor();
    const hasSavedGame = savedGame !== null && pendingStage === 0;

    const handleLoadGame = () => {
        if (savedGame) {
            confirmImageAndAdvance(null, savedGame); // Passe la sauvegarde au lieu d'un variant
        }
    };

    return (
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
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                borderRadius: '8px'
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: 'rgba(30, 30, 30, 0.95)',
                    border: '2px solid #ffc107',
                    maxWidth: 700
                }}
            >
                {pendingStage === 0 ? (
                    <>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#ffc107' }}>
                            Vous commencez comme {STAGES[pendingStage]?.name}.
                            Percutez de plus petits que vous pour grossir jusqu'au trou noir
                        </Typography>

                        {/* Bouton de chargement si sauvegarde disponible */}
                        {hasSavedGame && (
                            <Box sx={{ mb: 3 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleLoadGame}
                                    sx={{
                                        backgroundColor: '#4caf50',
                                        color: '#fff',
                                        px: 4,
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            backgroundColor: '#45a049',
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                                        },
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    📂 Continuer la partie sauvegardée
                                </Button>
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#9e9e9e' }}>
                                    Stage: {STAGES[savedGame.currentStageIndex]?.name} | Masse: {Math.floor(savedGame.player.mass)}
                                </Typography>
                                <Box sx={{ 
                                    width: '60%', 
                                    height: '1px', 
                                    backgroundColor: '#555', 
                                    mx: 'auto', 
                                    my: 2 
                                }} />
                                <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                                    Ou recommencez une nouvelle partie :
                                </Typography>
                            </Box>
                        )}
                    </>
                ) : (
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#ffc107' }}>
                        Évolution : {STAGES[pendingStage]?.name}
                    </Typography>
                )}

                <Typography variant="body1" sx={{ mb: 3, color: '#9e9e9e' }}>
                    {pendingStage === 0 && hasSavedGame ? 'Choisissez votre point de départ' : 'Choisissez votre nouveau corps céleste'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
                    {availableVariants.map((variant) => (
                        <Paper
                            key={variant.id}
                            elevation={4}
                            onClick={() => confirmImageAndAdvance(variant)}
                            sx={{
                                width: 180,
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                                border: '2px solid transparent',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    borderColor: '#00bcd4',
                                    transform: 'translateY(-10px)',
                                    boxShadow: '0 10px 20px rgba(0, 188, 212, 0.5)'
                                }
                            }}
                        >
                            <Box sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}>
                                <img src={variant.img} style={{ width: '100%', borderRadius: '50%' }} alt={variant.name} />
                            </Box>

                            <Typography variant="h6" sx={{ color: '#fff', fontSize: '1rem' }}>{variant.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mb: 1, minHeight: 40 }}>
                                {variant.description}
                            </Typography>

                            {/* Affichage des mini-stats */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '0.75rem' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Vitesse:</span>
                                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>×{variant.stats.speedMult}</span>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Croissance:</span>
                                    <span style={{ color: '#2196f3', fontWeight: 'bold' }}>×{variant.stats.growthMult}</span>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Force:</span>
                                    <span style={{ color: '#f35621', fontWeight: 'bold' }}>×{variant.stats.power}</span>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Box>

                {pendingStage !== 0 && (
                    <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                        Masse actuelle: {Math.floor(mass).toLocaleString()}
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};



export const MiniMap = ({ player, bodies, worldSize, updateState }) => {
  const mapSize = 150; // Taille de la mini-map en pixels
  const scale = mapSize / worldSize;
 const playerx = (player.x * scale) % mapSize;
 const playery = (player.y * scale) % mapSize;
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: mapSize,
        height: mapSize,
        backgroundColor: 'rgba(10, 14, 39, 0.9)',
        border: '2px solid rgba(0, 188, 212, 0.5)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}
    >
      {/* Grille de fond */}
      <svg width={mapSize} height={mapSize} style={{ position: 'absolute' }}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 188, 212, 0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={mapSize} height={mapSize} fill="url(#grid)" />
        
        {/* Cercle de scan */}
        <circle
          cx={mapSize / 2}
          cy={mapSize / 2}
          r={mapSize / 2 - 2}
          fill="none"
          stroke="rgba(0, 188, 212, 0.3)"
          strokeWidth="1"
        />
        
        {/* Bodies */}
        {bodies.map((body, i) => {
          const x = (body.x * scale) % mapSize;
          const y = (body.y * scale) % mapSize;
          const size = Math.max(2, Math.min(8, Math.sqrt(body.mass) * 0.3));
          const isDanger = body.mass > player.mass;
          const isSatellite = !isDanger && body.mass > (player.mass/4);
          
          return (
            <g key={i}>
              {/* Lueur pour les gros objets dangereux */}
              {isDanger && (
                <circle
                  cx={x}
                  cy={y}
                  r={size * 2}
                  fill="rgba(255, 71, 87, 0.2)"
                  stroke="none"
                />
              )}
              
              {/* Point du body */}
              <circle
                cx={x}
                cy={y}
                r={size}
                fill={isSatellite ? '#FFD700' : (isDanger ? '#FF4757' : body.color || '#4682B4')}
                stroke={isDanger ? '#FF4757' : 'rgba(255, 255, 255, 0.3)'}
                strokeWidth="0.5"
                opacity={isDanger ? 1 : 0.7}
              />
              
              {/* Pulse pour les très dangereux */}
              {isDanger && body.mass > player.mass * 1.5 && (
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill="none"
                  stroke="#FF4757"
                  strokeWidth="1"
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    from={size}
                    to={size * 3}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
        
        {/* Joueur (toujours au centre) */}
        <g>
          {/* Cercle extérieur */}
          <circle
            cx={playerx}
            cy={playery}
            r="6"
            fill="none"
            stroke="#4ECDC4"
            strokeWidth="1.5"
          />
          {/* Point central */}
          <circle
            cx={playerx}
            cy={playery}
            r="3"
            fill="#4ECDC4"
          />
          {/* Direction */}
          <line
            x1={playerx}
            y1={playery}
            x2={playerx + Math.cos(Math.atan2(player.vy, player.vx)) * 8}
            y2={playery + Math.sin(Math.atan2(player.vy, player.vx)) * 8}
            stroke="#95E1D3"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        
        {/* Effet de scan rotatif */}
        <line
          x1={mapSize / 2}
          y1={mapSize / 2}
          x2={mapSize / 2}
          y2="2"
          stroke="rgba(0, 188, 212, 0.4)"
          strokeWidth="1"
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from={`0 ${mapSize / 2} ${mapSize / 2}`}
            to={`360 ${mapSize / 2} ${mapSize / 2}`}
            dur="4s"
            repeatCount="indefinite"
          />
        </line>
      </svg>
      
      {/* Légende */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 4, 
        left: 4, 
        right: 4,
        fontSize: '0.6rem',
        color: '#aaa',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1
      }}>
        <span style={{ color: '#4ECDC4' }}>●</span>
        <span style={{ color: '#4682B4' }}>● Safe</span>
        <span style={{ color: '#FF4757' }}>● Danger</span>
      </Box>
    </Box>
  );
};