import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
  Chip,
  Divider,
  LinearProgress,
  Fade,
  Grow,
} from '@mui/material';
import {
  LocalFireDepartment as FireIcon,
  Medication as PillIcon,
  Vaccines as InjectionIcon,
  Flight as SpaceshipIcon,
  FlashOn as ElectricIcon,
} from '@mui/icons-material';
import { useGlobalScores } from '../../App';
import { PublishScore } from '../../pocketbaseScores';

const SUICIDE_METHODS = [
  {
    id: 'poison',
    name: 'Breuvage Sacré',
    icon: '💊',
    cursor: '💊',
    description: 'Un cocktail de cyanure dans du jus de fruits (classique Jim Jones)',
    phrase: 'Buvez et rejoignez l\'Éternité !',
    color: '#9c27b0',
  },
  {
    id: 'fire',
    name: 'Purification par le Feu',
    icon: '🔥',
    cursor: '🔥',
    description: 'Immolation collective dans le temple (style Temple Solaire)',
    phrase: 'Les flammes purificatrices nous transformeront !',
    color: '#ff6f00',
  },
  {
    id: 'injection',
    name: 'Injection Divine',
    icon: '💉',
    cursor: '💉',
    description: 'Sérum d\'ascension injecté (méthode "médicale")',
    phrase: 'Le sérum d\'immortalité est prêt !',
    color: '#2196f3',
  },
  {
    id: 'spaceship',
    name: 'Vaisseau Spatial',
    icon: '🚀',
    cursor: '🛸',
    description: 'Quitter l\'enveloppe corporelle pour rejoindre le vaisseau (Heaven\'s Gate)',
    phrase: 'Le vaisseau-mère nous attend derrière la comète !',
    color: '#00bcd4',
  },
  {
    id: 'electric',
    name: 'Électrochoc Transcendantal',
    icon: '⚡',
    cursor: '⚡',
    description: 'Ascension par décharge électrique (totalement barré)',
    phrase: 'Le courant cosmique nous propulsera vers la 12ème dimension !',
    color: '#ffd700',
  },
];

const GURU_FATES = [
  {
    id: 'bahamas',
    name: 'Fuir aux Bahamas',
    icon: '🏝️',
    description: 'Partir avec tout l\'argent sous une nouvelle identité',
    ending: 'Vous sirotez un cocktail sur une plage privée des Bahamas. L\'argent ne fait pas le bonheur, mais il aide.',
  },
  {
    id: 'police',
    name: 'Se rendre à la police',
    icon: '🚔',
    description: 'Assumer la responsabilité de vos actes',
    ending: 'Vous êtes condamné à perpétuité. Au moins, vous avez la conscience tranquille... ou pas.',
  },
  {
    id: 'die',
    name: 'Mourir avec le groupe',
    icon: '☠️',
    description: 'Le vrai leader meurt avec ses disciples',
    ending: 'Vous rejoignez vos disciples dans "l\'au-delà". Spoiler : il n\'y a rien.',
  },
  {
    id: 'newidentity',
    name: 'Changer d\'identité',
    icon: '🎭',
    description: 'Recommencer une nouvelle vie, nouvelle secte',
    ending: 'Vous êtes maintenant "Maître Cosmos" et vous recrutez déjà à Sedona, Arizona.',
  },
  {
    id: 'fake',
    name: 'Simuler sa mort',
    icon: '👻',
    description: 'Disparaître sans laisser de traces',
    ending: 'Officiellement mort. En réalité, vous élevez des chèvres au Népal.',
  },
];

const SERMON_FRAGMENTS = {
  intro: [
    'Mes bien-aimés, le moment est venu...',
    'Frères et sœurs, l\'heure de la transcendance a sonné...',
    'Disciples de la lumière, écoutez-moi...',
    'Le temps de l\'éveil final est arrivé...',
  ],
  middle: [
    'Les forces obscures nous pourchassent !',
    'Le portail interdimensionnel s\'ouvre ce soir !',
    'Les prophéties se réalisent sous nos yeux !',
    'La matrice va s\'effondrer dans 48 heures !',
  ],
  climax: [
    'Seuls ceux qui franchissent le voile MAINTENANT seront sauvés !',
    'Nous devons quitter nos enveloppes charnelles pour ascensionner !',
    'C\'est notre dernière chance d\'atteindre l\'immortalité !',
    'Le vaisseau-mère ne nous attendra pas !',
  ],
};

const AscensionView = ({ gameState, reset, onBack }) => {
  const [phase, setPhase] = useState('preparation'); // preparation, sermon, game, results
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedFate, setSelectedFate] = useState(null);
  const [sermonParts, setSermonParts] = useState([]);
  
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [touchedFollowers, setTouchedFollowers] = useState(new Set());
  const followerPositions = useRef([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });

  // Initialise les positions des adeptes
  useEffect(() => {
    if (gameActive && followerPositions.current.length === 0) {
      const positions = gameState.followers.map((f, idx) => ({
        id: f.id,
        emoji: f.emoji,
        x: Math.random() * (window.innerWidth - 100) + 50,
        y: Math.random() * (window.innerHeight - 200) + 100,
        vx: (Math.random() - 0.5)/10,
        vy: (Math.random() - 0.5)/10,
        devotion: f.devotion,
        touched: false,
      }));
      followerPositions.current = positions;
    }
  }, [gameActive]);

  // Timer du jeu
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
        if(touchedFollowers.size>=followerPositions.current.length)
            setTimeLeft(0);
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameActive, timeLeft, touchedFollowers.size]);

  // Animation des adeptes
  useEffect(() => {
    if (!gameActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 150;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update positions
      const prev = followerPositions.current;
      const newFollowerPos = prev.map(f => {
        if (f.touched) return f;

        let newX = f.x + f.vx;
        let newY = f.y + f.vy;
        let newVx = f.vx;
        let newVy = f.vy;

        // Comportement selon dévotion
        if (f.devotion >= 70) {
          // Dévoués : vont vers le curseur
          const dx = mousePos.current.x - f.x;
          const dy = mousePos.current.y - f.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) {
            newVx = (dx / dist) * 1.5;
            newVy = (dy / dist) * 1.5;
          }
        } else if (f.devotion < 40) {
          // Sceptiques : fuient le curseur
          const dx = mousePos.current.x - f.x;
          const dy = mousePos.current.y - f.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            newVx = -Math.max(3, (dx / dist));
            newVy = -Math.max(3, (dy / dist));
          }
        }

        // Rebonds sur les bords
        if (newX < 0 || newX > canvas.width) newVx *= -1;
        if (newY < 0 || newY > canvas.height) newVy *= -1;
        newX = Math.max(0, Math.min(canvas.width, newX));
        newY = Math.max(0, Math.min(canvas.height, newY));

        // Check collision avec curseur
        const cursorDist = Math.sqrt(
          (mousePos.current.x - newX) ** 2 + (mousePos.current.y - newY) ** 2
        );
        if (cursorDist < 30 && !f.touched) {
          setTouchedFollowers(prev => new Set([...prev, f.id]));
          return { ...f, touched: true };
        }

        return { ...f, x: newX, y: newY, vx: newVx, vy: newVy };
      });
      followerPositions.current=newFollowerPos;

      // Draw followers
      // Draw followers
followerPositions.current.forEach(f => {
  // Trail rouge si touché (AVANT l'emoji)
  if (f.touched) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(f.x, f.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Reset du style et dessin de l'emoji
  ctx.fillStyle = '#ffffff'; // ← AJOUTE CETTE LIGNE
  ctx.font = '24px Arial';
  ctx.globalAlpha = f.touched ? 0.3 : 1;
  ctx.fillText(f.emoji, f.x - 12, f.y + 8);
});

ctx.globalAlpha = 1; // Reset alpha après la boucle

      ctx.globalAlpha = 1;

      // Draw cursor
      ctx.font = '32px Arial';
      ctx.fillText(
        SUICIDE_METHODS.find(m => m.id === selectedMethod)?.cursor || '💀',
        mousePos.current.x - 16,
        mousePos.current.y + 10
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameActive, selectedMethod]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY - 150 };
    };

    if (gameActive) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [gameActive]);

  const startSermon = () => {
    if (!selectedMethod || !selectedFate) {
      alert('Choisissez une méthode et votre destin !');
      return;
    }
    setPhase('sermon');
  };

  const generateSermon = () => {
    const intro = SERMON_FRAGMENTS.intro[Math.floor(Math.random() * SERMON_FRAGMENTS.intro.length)];
    const middle = SERMON_FRAGMENTS.middle[Math.floor(Math.random() * SERMON_FRAGMENTS.middle.length)];
    const climax = SERMON_FRAGMENTS.climax[Math.floor(Math.random() * SERMON_FRAGMENTS.climax.length)];
    const method = SUICIDE_METHODS.find(m => m.id === selectedMethod);
    
    return `${intro} ${middle} ${climax} ${method.phrase}`;
  };

  const startGame = () => {
    setSermonParts([generateSermon()]);
    setPhase('game');
    setGameActive(true);
  };

  const endGame = () => {
    setGameActive(false);
    setPhase('results');
  };
 const { setScore } = useGlobalScores();
  // Calcul du score final
  const calculateFinalScore = () => {
    const deaths = touchedFollowers.size;
    const total = gameState.followers.length;
    const percentage = (deaths / total) * 100;
    const treasury = gameState.treasury;
    
    let multiplier = 1;
    if (percentage === 100) multiplier = 1.5; // Perfectionniste
    else if (percentage >= 90) multiplier = 1.25;
    
    const finalScore = Math.round(deaths * multiplier);
    const legacy = treasury;
    setScore('cultManager', finalScore+Math.round(treasury/1000));
    return { deaths, total, percentage, finalScore, legacy, multiplier };
  };

  // Rendu de la préparation
  const renderPreparation = () => (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4 }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontFamily: '"Cinzel", serif' }}>
        ⚡ LA GRANDE ASCENSION ⚡
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary', fontStyle: 'italic' }}>
        "Le moment de vérité approche. Comment orchestrerez-vous le Grand Départ ?"
      </Typography>

      <Alert severity="warning" sx={{ mb: 4 }}>
        <Typography variant="body2">
          ⚠️ Cette action est <strong>IRRÉVERSIBLE</strong>. Une fois lancée, il n'y a pas de retour en arrière.
          <br />Adeptes disponibles : <strong>{gameState.followers.length}</strong> • 
          Trésor : <strong>${gameState.treasury.toLocaleString()}</strong>
        </Typography>
      </Alert>

      {/* Choix de la méthode */}
      <Typography variant="h5" sx={{ mb: 2, fontFamily: '"Cinzel", serif' }}>
        1. Choisissez la méthode de "transcendance"
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {SUICIDE_METHODS.map(method => (
          <Grid item xs={12} sm={6} md={4} key={method.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedMethod === method.id ? `3px solid ${method.color}` : '1px solid rgba(255,255,255,0.1)',
                '&:hover': { borderColor: method.color },
              }}
              onClick={() => setSelectedMethod(method.id)}
            >
              <CardContent>
                <Typography variant="h4" sx={{ textAlign: 'center', mb: 1 }}>
                  {method.icon}
                </Typography>
                <Typography variant="h6" sx={{ textAlign: 'center', mb: 1, color: method.color }}>
                  {method.name}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '0.85rem' }}>
                  {method.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Choix du destin */}
      <Typography variant="h5" sx={{ mb: 2, fontFamily: '"Cinzel", serif' }}>
        2. Choisissez VOTRE destin
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {GURU_FATES.map(fate => (
          <Grid item xs={12} sm={6} key={fate.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedFate === fate.id ? '3px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                '&:hover': { borderColor: '#ffd700' },
              }}
              onClick={() => setSelectedFate(fate.id)}
            >
              <CardContent>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {fate.icon} {fate.name}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  {fate.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Boutons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={onBack} sx={{ minWidth: 150 }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={startSermon}
          disabled={!selectedMethod || !selectedFate}
          sx={{
            minWidth: 250,
            background: 'linear-gradient(45deg, #d32f2f, #f44336)',
            '&:hover': {
              background: 'linear-gradient(45deg, #b71c1c, #d32f2f)',
            },
          }}
        >
          Commencer le Rituel Final
        </Button>
      </Box>
    </Box>
  );

  // Rendu du sermon
  const renderSermon = () => (
    <Fade in timeout={1000}>
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 8, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 4, fontFamily: '"Cinzel", serif', color: 'error.main' }}>
          LE SERMON FINAL
        </Typography>
        
        <Paper sx={{ p: 4, mb: 4, bgcolor: 'rgba(211, 47, 47, 0.1)', border: '2px solid #d32f2f' }}>
          <Typography variant="h5" sx={{ fontStyle: 'italic', lineHeight: 1.8 }}>
            {generateSermon()}
          </Typography>
        </Paper>

        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Les adeptes sont suspendus à vos lèvres. Le moment est venu.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={startGame}
          sx={{
            minWidth: 300,
            py: 2,
            fontSize: '1.2rem',
            background: 'linear-gradient(45deg, #d32f2f, #f44336)',
            animation: 'pulse 1.5s infinite',
          }}
        >
          Que le Grand Voyage commence
        </Button>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </Box>
    </Fade>
  );

  // Rendu du jeu
  const renderGame = () => (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden', bgcolor: '#0a0a0a' }}>
      {/* HUD */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, p: 2, bgcolor: 'rgba(0,0,0,0.8)', zIndex: 10 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            <Typography variant="h6" color="secondary.light">
              ⏱️ Temps: {timeLeft}s
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 'bold' }}>
              💀 {touchedFollowers.size} / {gameState.followers.length}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'right' }}>
            <Typography variant="h6" color="primary.light">
              {((touchedFollowers.size / gameState.followers.length) * 100).toFixed(0)}%
            </Typography>
          </Grid>
        </Grid>
        <LinearProgress 
          variant="determinate" 
          value={(touchedFollowers.size / gameState.followers.length) * 100}
          sx={{ mt: 1, height: 8, bgcolor: 'rgba(255,255,255,0.1)' }}
          color="error"
        />
      </Box>

      {/* Canvas */}
     <canvas
  ref={canvasRef}
  style={{
    position: 'absolute',
    top: 150,
    left: 0,
    cursor: 'none',
    backgroundColor: '#1a1a2e', // Ajoute un fond au lieu du noir
    filter: touchedFollowers.size > 0 
      ? `saturate(${1 + Math.min(1, (touchedFollowers.size / Math.max(1, gameState.followers.length)))}) 
             hue-rotate(${Math.min(-30, -(touchedFollowers.size / Math.max(1, gameState.followers.length)) * 30)}deg)
             brightness(${1 + (touchedFollowers.size / Math.max(1, gameState.followers.length)) * 0.02})`:'none',
  }}
/>

      {/* Overlay instructions */}
      {timeLeft > 25 && (
        <Fade in timeout={500}>
          <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 3, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.9)', color:'#bbb' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              🎯 Passez le curseur sur les adeptes
            </Typography>
            <Typography variant="body2">
              Certains viendront à vous... d'autres fuiront
            </Typography>
          </Paper>
        </Fade>
      )}
    </Box>
  );

  // Leaderboard historique des sectes
const HISTORICAL_CULTS = [
  { name: 'Temple du Peuple', leader: 'Jim Jones', deaths: 918, year: 1978, location: 'Guyana', method: '💊 Kool-Aid empoisonné' },
  { name: 'Mouvement pour la Restauration des Dix Commandements', leader: 'Joseph Kibweteere', deaths: 778, year: 2000, location: 'Ouganda', method: '🔥 Incendie collectif' },
  { name: 'Les Davidiens', leader: 'David Koresh', deaths: 76, year: 1993, location: 'Waco, Texas', method: '🔥 Siège du FBI' },
  { name: 'Ordre du Temple Solaire', leader: 'Luc Jouret', deaths: 74, year: '1994-1997', location: 'Suisse/Canada/France', method: '🔥 Rituels mortels' },
   { name: 'Nexium (NXIVM)', leader: 'Keith Raniere', deaths: 59, year: '1998-2012', location: 'Etats-Unis/Canada', method: '🔥 Rituels mortels' },
 { name: 'Heaven\'s Gate', leader: 'Marshall Applewhite', deaths: 39, year: 1997, location: 'Californie', method: '💊 Phénobarbital + vodka' },
  { name: 'Aum', leader: 'Shinrikyō', deaths: 20, year: 2002, location: 'Tokyo, Japon', method: '💊 Attentat gaz sarin' },
  { name: 'Mouvement Raelien', leader: 'Rael', deaths: 2, year: 1973, location: 'France', method: '🚀 Enlevement par extra-terrestres' },
  { name: 'Secte de l\'Ouganda', leader: 'Credonia Mwerinde', deaths: 924, year: 2000, location: 'Ouganda', method: '🔥 Massacre + incendie' },
];


// Rendu des résultats
const renderResults = () => {
  const score = calculateFinalScore();
  const method = SUICIDE_METHODS.find(m => m.id === selectedMethod);
  const fate = GURU_FATES.find(f => f.id === selectedFate);
  
  // Insère le score dans le leaderboard
  const playerEntry = {
    name: 'Le Cercle Intérieur', // Ou utilise gameState.cultName si tu l'ajoutes
    leader: 'Vous',
    deaths: score.deaths,
    year: 2026,
    location: 'Localisation inconnue',
    method: `${method.icon} ${method.name}`,
    isPlayer: true,
  };
  
  const fullLeaderboard = [...HISTORICAL_CULTS, playerEntry]
    .sort((a, b) => b.deaths - a.deaths)
    .slice(0, 10);
  
  const playerRank = fullLeaderboard.findIndex(entry => entry.isPlayer) + 1;
  
  // Achievements
  const achievements = [];
  if (score.percentage === 100) {
    achievements.push({ icon: '🏆', name: 'Perfectionniste', desc: '100% de participation' });
  }
  if (score.percentage >= 90) {
    achievements.push({ icon: '⭐', name: 'Très Convaincant', desc: '+90% de taux de réussite' });
  }
  if (score.deaths >= 100) {
    achievements.push({ icon: '💀', name: 'Hécatombe', desc: '100+ victimes' });
  }
  if (gameState.treasury >= 1000000) {
    achievements.push({ icon: '💰', name: 'Millionnaire', desc: 'Trésor > $1M' });
  }
  if (selectedFate === 'bahamas') {
    achievements.push({ icon: '🏝️', name: 'Profiteur', desc: 'Parti avec le magot' });
  }
  if (selectedFate === 'die') {
    achievements.push({ icon: '☠️', name: 'Martyr', desc: 'Mort avec les disciples' });
  }
  if (gameState.day >= 365) {
    achievements.push({ icon: '📅', name: 'Longévité', desc: 'Survécu 1 an' });
  }
  if (gameState.heat < 30) {
    achievements.push({ icon: '🕵️', name: 'Furtif', desc: 'Heat final < 30%' });
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>

      {/* Title avec effet dramatique */}
      <Grow in timeout={1000}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 2, 
              fontFamily: '"Cinzel", serif',
              background: 'linear-gradient(45deg, #d32f2f, #f44336)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            GAME OVER
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            "{fate.ending}"
          </Typography>
        </Box>
      </Grow>

      {/* Stats principales */}
      <Fade in timeout={1500}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(211, 47, 47, 0.1)', border: '2px solid #d32f2f' }}>
              <Typography variant="h3" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                {score.deaths}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Âmes "transcendées"
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'error.light' }}>
                {score.percentage.toFixed(1)}% de taux de réussite
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255, 215, 0, 0.1)', border: '2px solid #ffd700' }}>
              <Typography variant="h3" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                ${(score.legacy / 1000).toFixed(0)}k
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Héritage collecté
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'secondary.light' }}>
                ${Math.round(score.legacy / score.deaths)} par victime
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(156, 39, 176, 0.1)', border: '2px solid #9c27b0' }}>
              <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {gameState.day}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Jours de règne
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'primary.light' }}>
                Notoriété finale: {gameState.notoriety}%
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255, 152, 0, 0.1)', border: '2px solid #ff9800' }}>
              <Typography variant="h3" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                {fate.icon}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {fate.name}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'warning.light' }}>
                Heat final: {gameState.heat}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      {/* Leaderboard */}
      <Fade in timeout={2000}>
        <Paper sx={{ p: 4, mb: 4, bgcolor: 'rgba(0, 0, 0, 0.6)', border: '2px solid #ffd700' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3, 
              textAlign: 'center', 
              fontFamily: '"Cinzel", serif',
              color: 'secondary.main',
            }}
          >
            🏆 CLASSEMENT DES SECTES MEURTRIÈRES 🏆
          </Typography>

          <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {fullLeaderboard.map((entry, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 2,
                  mb: 1,
                  bgcolor: entry.isPlayer ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: entry.isPlayer ? '2px solid #ffd700' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  animation: entry.isPlayer ? 'pulse 2s infinite' : 'none',
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={1}>
                    <Typography variant="h5" sx={{ color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'text.primary' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1" sx={{ fontWeight: entry.isPlayer ? 'bold' : 'normal', color: entry.isPlayer ? 'secondary.main' : 'text.primary' }}>
                      {entry.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {entry.leader} • {entry.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {entry.year}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                      {entry.method}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                      {entry.deaths}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: playerRank <= 3 ? 'secondary.main' : 'text.primary', mb: 1 }}>
              {playerRank <= 3 && '🎉 '}
              Votre classement : {playerRank}
              {playerRank === 1 ? 'er' : 'ème'} sur {fullLeaderboard.length}
              {playerRank <= 3 && ' 🎉'}
            </Typography>
            
            {playerRank === 1 && (
              <Typography variant="body2" sx={{ color: 'secondary.main', fontStyle: 'italic' }}>
                Félicitations ? Vous avez battu Jim Jones. Quelle accomplissement...
              </Typography>
            )}
            {playerRank <= 3 && playerRank > 1 && (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Sur le podium des pires sectes de l'histoire. Bravo (?)
              </Typography>
            )}
            {playerRank > 5 && (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Même pas dans le top 5. Il faudra faire mieux la prochaine fois...
              </Typography>
            )}
          </Box>
        </Paper>
      </Fade>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Fade in timeout={2500}>
          <Paper sx={{ p: 4, mb: 4, bgcolor: 'rgba(156, 39, 176, 0.1)', border: '1px solid #9c27b0' }}>
            <Typography variant="h5" sx={{ mb: 2, fontFamily: '"Cinzel", serif' }}>
              🏅 Achievements Débloqués
            </Typography>
            <Grid container spacing={2}>
              {achievements.map((ach, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>{ach.icon}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{ach.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{ach.desc}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Fade>
      )}

      {/* Détails de la méthode */}
      <Fade in timeout={3000}>
        <Paper sx={{ p: 4, mb: 4, bgcolor: 'rgba(0, 0, 0, 0.3)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>📋 Rapport de l'incident</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Méthode employée :</Typography>
              <Typography variant="body1">{method.icon} {method.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Taux de participation :</Typography>
              <Typography variant="body1">{score.percentage.toFixed(1)}% ({score.deaths}/{score.total})</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Multiplicateur de score :</Typography>
              <Typography variant="body1">×{score.multiplier}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Statut légal :</Typography>
              <Typography variant="body1" sx={{ color: 'error.main' }}>
                {selectedFate === 'police' ? '🚔 En détention' : '🚨 Mandat d\'arrêt international'}
              </Typography>
            </Grid>
          </Grid>

          {score.percentage < 100 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {score.total - score.deaths} adepte{score.total - score.deaths > 1 ? 's ont' : ' a'} survécu. 
                {score.total - score.deaths > 5 && ' Ils témoigneront probablement contre vous.'}
              </Typography>
            </Alert>
          )}
        </Paper>
      </Fade>

      {/* Message final sarcastique */}
      <Fade in timeout={3500}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            {score.deaths > 500 && '"L\'histoire se souviendra de vous... malheureusement."'}
            {score.deaths > 100 && score.deaths <= 500 && '"Au moins, vous avez marqué l\'histoire."'}
            {score.deaths <= 100 && '"Même les pires sectes font mieux. Dommage."'}
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Ce jeu est une satire. Les vraies sectes ont causé des tragédies réelles.
            <br />
            Si vous ou quelqu'un que vous connaissez êtes impliqué dans un groupe suspect, cherchez de l'aide.
          </Typography>
        </Box>
      </Fade>

      {/* Publication classement mondial */}
      <Box sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
        <PublishScore gameName="cultManager" score={score.deaths + Math.round(score.legacy / 1000)} darkMode={false} />
      </Box>

      {/* Bouton de fin */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={reset}
          sx={{
            minWidth: 250,
            background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
          }}
        >
          Recommencer (nouvelle secte)
        </Button>
      </Box>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </Box>
  );
};

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {phase === 'preparation' && renderPreparation()}
      {phase === 'sermon' && renderSermon()}
      {phase === 'game' && renderGame()}
      {phase === 'results' && renderResults()}
    </Box>
  );
};

export default AscensionView;