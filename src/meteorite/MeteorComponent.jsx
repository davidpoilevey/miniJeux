import { Box, Button, Paper, Typography } from "@mui/material"
import meteor1 from './images/meteor1.png';
import meteor2 from './images/meteor2.png';
import meteor4 from './images/meteor4.png';
import meteor5 from './images/meteor5.png'; 
import lune2 from './images/lune2.png';
import lune3 from './images/lune3.png';
import lune4 from './images/lune4.png';

import naineRouge from './images/nainerouge.png';

import planete1 from './images/planete1.png';
import planete3 from './images/planete3.png';
import planete9 from './images/planete9.png';
import gazeuse1 from './images/gazeuse1.png';
import gazeuse2 from './images/gazeuse2.gif';
import gazeuse3 from './images/gazeuse3.png';
import giantblue from './images/giantblue.png';
import giantblue3 from './images/supergiant.gif';
import giantblue4 from './images/supergiant2.png';
import neutron1 from './images/neutronStar.gif';
import neutron2 from './images/neutron2.png';
import neutron3 from './images/neutron-star.gif';
import giantRouge2 from './images/giantRouge.gif';
import naineBrune from './images/naineBrune.png';
import naineBrune2 from './images/brune2.jpg';
import soleil2 from './images/soleil2.png';
import soleil3 from './images/soleil3.png';
import soleilblanc from './images/soleilblanc.png';
import soleilrouge from './images/soleilrouge.png';
import trounoir1 from './images/trounoir1.png';
import trounoir2 from './images/trounoirStellaire.png';
import trounoir3 from './images/trounoir3.png';
import trounoir4 from './images/trounoir4.png';

import debris1 from './images/debris1.png';
import debris2 from './images/debris2.png';
import debris3 from './images/debrisEnflamme.png';


// La taille à l'écran ne dépend plus du stade : elle suit la progression (log) entre minMass et maxMass
// evaporation : fraction de masse perdue par seconde (on ne redescend jamais sous minMass)
const vent = (rate) => ({ rate, label: 'Vent stellaire', color: '#FFD27F' });
const hawking = (rate) => ({ rate, label: 'Rayonnement de Hawking', color: '#B39DFF' });

export const STAGES = [
    { name: 'Débris', minMass: 0, maxMass: 100, color: '#444444', glow: '#999999'},
    { name: 'Météorite', minMass: 100, maxMass: 500, color: '#666666', glow: '#bbbbbb' },
    { name: 'Astéroïde', minMass: 500, maxMass: 2000, color: '#990009', glow: '#dddddd'},
    { name: 'Planétoïde', minMass: 2000, maxMass: 6000, color: '#9f942f', glow: '#dbdb38'},
    { name: 'Planète Rocheuse', minMass: 6000, maxMass: 200000, color: '#4682B4', glow: '#5F9FD4' },
    { name: 'Géante Gazeuse', minMass: 200000, maxMass: 1000000, color: '#B8860B', glow: '#DAA520'  },
    { name: 'Naine Brune', minMass: 1000000, maxMass: 50000000, color: '#926c0b', glow: '#c58027'  },
    { name: 'Étoile Naine', minMass: 50000000, maxMass: 1000000000, color: '#d5650f', glow: '#e7681a', evaporation: vent(0.008) },
    { name: 'Étoile Moyenne', minMass: 1000000000, maxMass: 5000000000, color: '#c3c010', glow: '#eaea3c', evaporation: vent(0.010) },
    { name: 'Géante Rouge', minMass: 5000000000, maxMass: 90000000000, color: '#cf0d2a', glow: '#e34771', evaporation: vent(0.012) },
    { name: 'Supergéante', minMass: 90000000000, maxMass: 1000000000000, color: '#c8c054', glow: '#ebe8ab', evaporation: vent(0.014) },
    { name: 'Étoile à Neutrons', minMass: 1000000000000, maxMass: 10000000000000, color: '#24a3ce', glow: '#42b4d6', evaporation: { rate: 0.017, label: 'Rayonnement', color: '#9FE8FF' } },
    { name: 'Trou Noir Stellaire', minMass: 10000000000000, maxMass: 1000000000000000, color: '#0b0bb8', glow: '#515be3', evaporation: hawking(0.02) },
    // Atteindre maxMass ici = victoire
    { name: 'Trou Noir Supermassif', minMass: 1000000000000000, maxMass: 1e17, color: '#222222', glow: '#000000', evaporation: hawking(0.025) }
];

export const stageIndexForMass = (mass) => {
  for (let i = STAGES.length - 1; i > 0; i--) {
    if (mass >= STAGES[i].minMass) return i;
  }
  return 0;
};

export const getRandomVariantFromMass = (mass) => {
  const stageIndex = stageIndexForMass(mass);
  const variants = STAGE_VARIANTS[stageIndex];
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];
  return { ...randomVariant, stageIndex };
};
export function getVariantById(id) {
  for (const stage of Object.values(STAGE_VARIANTS)) {
    const found = stage.find(v => v.id === id);
    if (found) return found;
  }
  return null;
}

export const STAGE_VARIANTS = {
  0: [ // Débris
    {
      id: 'debris1',
      name: 'Caillou',
      img: debris1,
      description: 'Un morceau de roche standard, équilibré et stable.',
      stats: { speedMult: 1, growthMult: 1, power: 1 }
    },
    {
      id: 'gravier',
      name: 'Tas de gravier',
      img: debris2,
      description: 'S\'agglomère facilement avec d\'autres poussières.',
      stats: { speedMult: 0.8, growthMult: 1.5, power: 0.8 }
    },
    {
      id: 'debrisEnflamme',
      name: 'Noyau de fer',
      img: debris3,
      description: 'Dense et rapide, il percute avec force.',
      stats: { speedMult: 1.4, growthMult: 0.7, power: 1.5 }
    }
  ],

  1: [ // Météorite
    {
      id: 'meteor1',
      name: 'Météorite ferreux',
      img: meteor1,
      description: 'Composition métallique offrant une grande vitesse de pointe.',
      stats: { speedMult: 1.3, growthMult: 0.9, power: 1.2 }
    },
    {
      id: 'meteor2',
      name: 'Météorite poussiéreux',
      img: meteor2,
      description: 'Capture les particules environnantes par simple contact.',
      stats: { speedMult: 0.9, growthMult: 1.6, power: 0.8 }
    }
  ],

  2: [ // Astéroïdes
    {
      id: 'meteor4',
      name: 'Astéroïde rocheux',
      img: meteor4,
      description: 'Une masse imposante capable de briser de plus petits corps.',
      stats: { speedMult: 1.0, growthMult: 1.0, power: 1.4 }
    },
    {
      id: 'meteor5',
      name: 'Comète',
      img: meteor5,
      description: 'Sillage de glace réduisant la friction spatiale.',
      stats: { speedMult: 1.6, growthMult: 1.1, power: 0.7 }
    }
  ],

  3: [ // Lunes
    {
      id: 'lune2',
      name: 'Titan',
      img: lune2,
      description: 'Atmosphère épaisse facilitant la capture de matière.',
      stats: { speedMult: 0.8, growthMult: 1.7, power: 1.1 }
    },
    {
      id: 'lune3',
      name: 'Phobos',
      img: lune3,
      description: 'Petite et agile, esquive facilement les dangers.',
      stats: { speedMult: 1.5, growthMult: 0.8, power: 0.9 }
    },
    {
      id: 'lune4',
      name: 'Lune terrestre',
      img: lune4,
      description: 'Equilibre parfait entre attraction et mobilité.',
      stats: { speedMult: 1.1, growthMult: 1.1, power: 1.1 }
    }
  ],

  4: [ // Planètes Rocheuses
    {
      id: 'planete1',
      name: 'Mars',
      img: planete1,
      description: 'Noyau riche en minéraux, favorisant la puissance d\'impact.',
      stats: { speedMult: 1.2, growthMult: 0.9, power: 1.4 }
    },
    {
      id: 'planete3',
      name: 'Terre',
      img: planete3,
      description: 'Système complexe permettant une croissance organique rapide.',
      stats: { speedMult: 1.0, growthMult: 1.5, power: 1.0 }
    },
    {
      id: 'planete9',
      name: 'Planète Nine',
      img: planete9,
      description: 'Exilée et froide, elle glisse silencieusement dans le vide.',
      stats: { speedMult: 1.4, growthMult: 1.1, power: 0.8 }
    }
  ],

  5: [ // Planètes Gazeuses
    {
      id: 'gazeuse1',
      name: 'Géante sulfureuse',
      img: gazeuse1,
      description: 'Gaz corrosifs qui attirent violemment les débris.',
      stats: { speedMult: 0.7, growthMult: 1.8, power: 1.3 }
    },
    {
      id: 'gazeuse2',
      name: 'Jupiter',
      img: gazeuse2,
      description: 'Le roi des planètes. Une gravité dévastatrice.',
      stats: { speedMult: 0.9, growthMult: 1.4, power: 1.6 }
    },
    {
      id: 'gazeuse3',
      name: 'Uranus',
      img: gazeuse3,
      description: 'Inclinaison unique offrant une trajectoire imprévisible.',
      stats: { speedMult: 1.3, growthMult: 1.2, power: 0.9 }
    }
  ],

  6: [ // Naines brunes
    {
      id: 'naineBrune',
      name: 'Naine brune',
      img: naineBrune,
      description: 'Une étoile ratée, mais une planète extrêmement dense.',
      stats: { speedMult: 1.0, growthMult: 1.3, power: 1.4 }
    },
    {
      id: 'naineBrune2',
      name: 'Étoile avortée',
      img: naineBrune2,
      description: 'Proche de la fusion, elle dégage une chaleur attractive.',
      stats: { speedMult: 1.1, growthMult: 1.6, power: 1.2 }
    }
  ],

  7: [ // Naines rouges
    {
      id: 'naineRouge',
      name: 'Naine rouge',
      img: naineRouge,
      description: 'Petite étoile à la longévité et croissance exemplaire.',
      stats: { speedMult: 1.1, growthMult: 1.7, power: 1.0 }
    },
    {
      id: 'soleilrouge',
      name: 'Alpha du Centaure',
      img: soleilrouge,
      description: 'Double influence gravitationnelle augmentant la puissance.',
      stats: { speedMult: 1.0, growthMult: 1.1, power: 1.8 }
    }
  ],

  8: [ // Soleil moyen
    {
      id: 'soleil2',
      name: 'Soleil',
      img: soleil2,
      description: 'Étoile jaune stable, le standard de la puissance solaire.',
      stats: { speedMult: 1.1, growthMult: 1.2, power: 1.3 }
    },
    {
      id: 'soleil3',
      name: 'Étoile de type G',
      img: soleil3,
      description: 'Rayonnement intense facilitant l\'absorption de masse.',
      stats: { speedMult: 0.9, growthMult: 1.6, power: 1.2 }
    },
    {
      id: 'soleilblanc',
      name: 'Sirius',
      img: soleilblanc,
      description: 'Étoile blanche brillante et extrêmement rapide.',
      stats: { speedMult: 1.7, growthMult: 1.0, power: 1.1 }
    }
  ],

  9: [ // Géante rouge
    {
      id: 'giantRouge2',
      name: 'Bételgeuse',
      img: giantRouge2,
      description: 'En fin de vie, son expansion est inévitable et massive.',
      stats: { speedMult: 0.6, growthMult: 2.0, power: 1.5 }
    }
  ],

  10: [ // Supergéantes
    {
      id: 'giantblue',
      name: 'Géante bleue',
      img: giantblue,
      description: 'Énergie pure. Très rapide mais difficile à contrôler.',
      stats: { speedMult: 1.8, growthMult: 0.8, power: 1.5 }
    },
    {
      id: 'giantblue3',
      name: 'Supergéante rouge',
      img: giantblue3,
      description: 'Volume colossal dévorant tout sur son passage.',
      stats: { speedMult: 0.7, growthMult: 1.9, power: 1.7 }
    },
    {
      id: 'giantblue4',
      name: 'Supergéante jaune',
      img: giantblue4,
      description: 'Équilibre instable entre taille et vitesse.',
      stats: { speedMult: 1.2, growthMult: 1.3, power: 1.3 }
    }
  ],

  11: [ // Neutrons / Pulsars
    {
      id: 'neutron1',
      name: 'Naine blanche',
      img: neutron1,
      description: 'Résidu stellaire compact et extrêmement dense.',
      stats: { speedMult: 1.4, growthMult: 1.0, power: 1.6 }
    },
    {
      id: 'neutron2',
      name: 'Étoile à neutrons',
      img: neutron2,
      description: 'Une cuillère à café de cette étoile pèse un milliard de tonnes.',
      stats: { speedMult: 1.1, growthMult: 0.9, power: 2.0 }
    },
    {
      id: 'neutron3',
      name: 'Pulsar',
      img: neutron3,
      description: 'Rotation frénétique expulsant des jets d\'énergie.',
      stats: { speedMult: 1.9, growthMult: 0.8, power: 1.4 }
    }
  ],

  12: [ // Trous noirs stellaires
    {
      id: 'trounoir1',
      name: 'Trou noir itinérant',
      img: trounoir1,
      description: 'Invisible et rapide, il surgit pour tout engloutir.',
      stats: { speedMult: 1.8, growthMult: 1.2, power: 1.5 }
    },
    {
      id: 'trounoir3',
      name: 'Trou noir stellaire',
      img: trounoir3,
      description: 'L\'effondrement final. Gravité absolue.',
      stats: { speedMult: 1.0, growthMult: 1.5, power: 2.0 }
    }
  ],

  13: [ // Trous noirs supermassifs
    {
      id: 'trounoir2',
      name: 'Trou noir supermassif',
      img: trounoir2,
      description: 'Le centre d\'une galaxie. Rien ne lui échappe.',
      stats: { speedMult: 0.8, growthMult: 2.0, power: 2.0 }
    },
    {
      id: 'trounoir4',
      name: 'Trou noir galactique',
      img: trounoir4,
      description: 'L\'entité ultime consommant des systèmes entiers.',
      stats: { speedMult: 1.2, growthMult: 1.8, power: 1.8 }
    }
  ]
};

export function saveMeteor(world) {
    // Les effets visuels et les traînées ne valent pas la peine d'être sauvegardés
    const { particles, absorbing, view, ...rest } = world;
    const data = JSON.stringify({ ...rest, bodies: rest.bodies.map(({ trail, ...body }) => body) });
    try {
        localStorage.setItem("meteor", data);
    } catch (e) {
        console.warn("Sauvegarde impossible :", e);
    }
}
export function clearMeteor() {
    localStorage.removeItem("meteor");
}
export function loadMeteor() {
    try {
        const data = localStorage.getItem("meteor");
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}
export const GameOverBox=({score, resetGame, continueGame, getStage})=>{

    return  <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            borderRadius: '8px'
                        }}
                    >
                        <Paper
                            elevation={8}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                                color:'#fff555',
                                border: '2px solid #f44336'
                            }}
                        >
                            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#f44336', fontSize: { xs: '1.8rem', md: '3rem' } }}>
                                Collision Fatale!
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Score Final: <span style={{ color: '#00bcd4' }}>{score}</span>
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                Stade atteint: <span style={{ color: '#9c27b0' }}>{getStage()}</span>
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={resetGame}
                                sx={{
                                    backgroundColor: '#00bcd4',
                                    '&:hover': { backgroundColor: '#0097a7' },
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 1.5
                                }}
                            >
                               Recommencer
                            </Button> <Button
                                variant="contained"
                                size="large"
                                onClick={continueGame}
                                sx={{
                                    backgroundColor: '#5b9c66ff',
                                    '&:hover': { backgroundColor: '#0097a7' },
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 1.5
                                }}
                            >
                               Continuer (score/2)
                            </Button>
                        </Paper>
                    </Box>
}


export const InstructionBox=({})=>{


 return <Box sx={{ mt: 3, maxWidth: 600, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                        🚀 Visez avec la souris, maintenez Espace ou le clic (le doigt sur mobile) pour propulser
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                        ⚡ Absorbez les corps plus petits pour grossir
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: '#FFA502' }}>
                        ⚠️ Contour orange : vous perdez la moitié de votre masse.
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f44336' }}>
                        Rouge pulsant : mortel
                    </Typography>
                </Box>
            </Box>
}