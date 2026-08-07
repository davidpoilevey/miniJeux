import { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Avatar, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { keyframes } from '@mui/material/styles';

import imgVous from '../poker/avatars/imgVous.png';
import imgJohn from '../poker/avatars/imgJohn.png';
import imgNatacha from '../poker/avatars/imgNatacha.png';
import imgKevin from '../poker/avatars/imgKevin.png';

// —————————————————————————————————————————————————————————————
//  Le 421 — mini-jeu de dés, 2 à 4 joueurs, contre l'IA
//  Structure : N manches, le gagnant de chaque manche marque
//  la valeur de sa combinaison. Meilleur score au bout = vainqueur.
//  Lancers : jusqu'à 3 jets libres, on garde les dés qu'on veut.
// —————————————————————————————————————————————————————————————

// Roster partagé (mêmes têtes que Poker / Président / Belote)
const ROSTER = [
  { id: 'vous',    name: 'Vous',    avatar: imgVous,    color: '#1565C0', isHuman: true,  greedy: 0 },
  { id: 'john',    name: 'John',    avatar: imgJohn,    color: '#B71C1C', isHuman: false, greedy: 0.7 },
  { id: 'natacha', name: 'Natacha', avatar: imgNatacha, color: '#6A1B9A', isHuman: false, greedy: 0.3 },
  { id: 'kevin',   name: 'Kevin',   avatar: imgKevin,   color: '#1B5E20', isHuman: false, greedy: 0.9 },
];

const PIP = {
  1: [0,0,0, 0,1,0, 0,0,0],
  2: [1,0,0, 0,0,0, 0,0,1],
  3: [1,0,0, 0,1,0, 0,0,1],
  4: [1,0,1, 0,0,0, 1,0,1],
  5: [1,0,1, 0,1,0, 1,0,1],
  6: [1,0,1, 1,0,1, 1,0,1],
};

const rollOne = () => Math.ceil(Math.random() * 6);
const roll3 = () => [rollOne(), rollOne(), rollOne()];
const freq = (dice) => dice.reduce((m, d) => (m[d] = (m[d] || 0) + 1, m), {});

// ————— Évaluation d'une main —————
// Retourne { key, value, label, rank } — rank sert à départager.
function evalHand(dice) {
  const s = [...dice].sort((a, b) => a - b);
  const [a, b, c] = s;

  if (a === 1 && b === 2 && c === 4) return { key: '421',      value: 10, label: 'Le 421',        rank: 1000 };
  if (a === b && b === c)             return a === 1
    ? { key: 'brelanAs', value: 7, label: "Brelan d'as",       rank: 900 }
    : { key: 'brelan',   value: a, label: `Brelan de ${a}`,    rank: 800 + a };
  if (b === a + 1 && c === b + 1)     return { key: 'suite',    value: 2,  label: `Suite ${a}-${b}-${c}`, rank: 700 + c };
  if (a === 1 && b === 1)             return { key: 'paireAs',  value: 2,  label: `Paire d'as (+${c})`,   rank: 660 + c };
  if (a === 1 && b === 2 && c === 2)  return { key: 'nenette',  value: 2,  label: 'La Nénette',     rank: 650 };

  // Point ordinaire : les as priment, puis les gros dés.
  const aces = dice.filter(d => d === 1).length;
  const desc = [...dice].sort((x, y) => y - x);
  const tie = desc[0] * 10 + desc[1] + desc[2] / 10;
  return { key: 'point', value: 1, label: `Point ${desc.join('-')}`, rank: 200 + aces * 100 + tie };
}

// ————— IA : quels dés garder ? —————
// L'alcool brouille le jugement : au-delà de quelques shots, l'IA gaffe.
function aiKeepMask(dice, greedy, shots = 0) {
  const keep = optimalKeep(dice, greedy);
  const blunder = Math.min(shots * 0.2, 0.75); // proba de bourde d'ivrogne
  if (Math.random() < blunder) {
    const i = Math.floor(Math.random() * 3);
    keep[i] = !keep[i]; // garde un dé pourri ou relance un bon dé
  }
  return keep;
}

// Décision optimale (à jeun)
function optimalKeep(dice, greedy) {
  const f = freq(dice);
  // 421 en approche : garder les 4/2/1 utiles
  const need = { 4: 1, 2: 1, 1: 1 };
  const has421bits = dice.filter(d => need[d]).length;
  const keep = [false, false, false];

  // Cherche un brelan/paire (valeur la plus fréquente)
  const bestPairVal = Object.keys(f)
    .filter(v => f[v] >= 2)
    .sort((x, y) => f[y] - f[x] || y - x)[0];

  if (bestPairVal) {
    dice.forEach((d, i) => { if (d === +bestPairVal) keep[i] = true; });
    // On garde aussi un as isolé, ça vaut de l'or
    dice.forEach((d, i) => { if (d === 1 && !keep[i]) keep[i] = true; });
    return keep;
  }

  // Pas de paire : si on tient au moins 2 briques du 421, on les garde
  if (has421bits >= 2) {
    const used = { 4: false, 2: false, 1: false };
    dice.forEach((d, i) => { if (need[d] && !used[d]) { keep[i] = true; used[d] = true; } });
    return keep;
  }

  // Sinon on garde les as, sinon le plus gros dé (les prudents gardent plus)
  const aces = dice.map((d, i) => d === 1 ? i : -1).filter(i => i >= 0);
  if (aces.length) { aces.forEach(i => keep[i] = true); return keep; }
  const maxIdx = dice.indexOf(Math.max(...dice));
  keep[maxIdx] = true;
  if (greedy < 0.5) { // joueur prudent garde aussi le 2e plus gros
    const second = dice.map((d, i) => i).filter(i => i !== maxIdx).sort((x, y) => dice[y] - dice[x])[0];
    if (dice[second] >= 5) keep[second] = true;
  }
  return keep;
}

function aiSatisfied(dice) {
  const h = evalHand(dice);
  return h.key === '421' || h.key === 'brelanAs' || (h.key === 'brelan' && h.value >= 5);
}

// Simule le tour complet de l'IA, renvoie les dés finaux + nb de lancers
function aiPlayTurn(greedy, shots = 0) {
  let dice = roll3();
  let rolls = 1;
  while (rolls < 3 && !aiSatisfied(dice)) {
    const keep = aiKeepMask(dice, greedy, shots);
    dice = dice.map((d, i) => keep[i] ? d : rollOne());
    rolls++;
  }
  return { dice, rolls };
}

// ————— Composants visuels —————
const Die = ({ value, size = 54, held = false, rolling = false, clickable = false, onClick, color }) => {
  const isAce = value === 1;
  const pips = PIP[value] || Array(9).fill(0);
  return (
    <div
      onClick={clickable ? onClick : undefined}
      style={{
        width: size, height: size, background: '#fdfdf7',
        borderRadius: size * 0.16,
        border: held ? `3px solid ${color || '#f0c040'}` : isAce ? '2px solid #cc0000' : '1.5px solid #cfcfc4',
        boxShadow: held ? `0 0 14px ${color || '#f0c040'}aa` : '0 4px 9px rgba(0,0,0,.35)',
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'repeat(3,1fr)',
        padding: size * 0.09, gap: size * 0.02,
        transform: held ? 'translateY(-8px) scale(1.05)' : rolling ? 'rotate(-6deg)' : 'none',
        transition: 'transform .12s, box-shadow .15s, border-color .15s',
        cursor: clickable ? 'pointer' : 'default',
        userSelect: 'none', flexShrink: 0,
      }}
    >
      {pips.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p === 1 && <div style={{
            width: isAce ? '52%' : '64%', height: isAce ? '52%' : '64%', borderRadius: '50%',
            background: isAce ? '#cc0000' : '#1a1a2e',
            boxShadow: isAce ? '0 0 4px #cc000088' : undefined,
          }} />}
        </div>
      ))}
    </div>
  );
};

// ————— Le verre à shot (CSS pur) —————
// Alternative : remplacer <ShotGlass/> par <img src="https://…/shots.gif"/>
const culSec = keyframes`
  0%, 60%, 100% { transform: rotate(0deg); }
  75% { transform: rotate(-42deg) translateY(-2px); }
  88% { transform: rotate(-42deg) translateY(-2px); }
`;
const ShotGlass = ({ h = 26, fill = 0.66, animate = false }) => {
  const w = h * 0.62;
  return (
    <Box sx={{
      width: w, height: h, position: 'relative', flexShrink: 0,
      transformOrigin: '80% 100%',
      animation: animate ? `${culSec} 1.6s ease-in-out infinite` : 'none',
    }}>
      {/* le verre (silhouette évasée) */}
      <Box sx={{
        position: 'absolute', inset: 0,
        clipPath: 'polygon(14% 0, 86% 0, 78% 100%, 22% 100%)',
        background: 'linear-gradient(90deg, rgba(200,225,255,.30), rgba(255,255,255,.07) 42%, rgba(200,225,255,.30))',
        boxShadow: 'inset 0 0 4px rgba(255,255,255,.45)',
        overflow: 'hidden',
      }}>
        {/* l'alcool ambré */}
        <Box sx={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: `${fill * 100}%`,
          background: 'linear-gradient(180deg, #f4b84e, #c56a1a)',
        }} />
        {/* reflet de surface */}
        <Box sx={{ position: 'absolute', left: '10%', right: '10%', top: `${(1 - fill) * 100}%`, height: 2, background: 'rgba(255,255,255,.55)' }} />
      </Box>
    </Box>
  );
};

const RECAP = [
  { label: 'Le 421',       dice: '4·2·1',        val: 10, note: 'la reine' },
  { label: "Brelan d'as",  dice: '1·1·1',        val: 7,  note: 'trois as' },
  { label: 'Brelan',       dice: '6·6·6 → 2·2·2', val: '2-6', note: '= la valeur' },
  { label: 'Suite',        dice: '4·5·6 …1·2·3', val: 2,  note: 'consécutifs' },
  { label: "Paire d'as",   dice: '1·1·x',        val: 2,  note: 'deux as' },
  { label: 'La Nénette',   dice: '2·2·1',        val: 2,  note: 'la mal-aimée' },
  { label: 'Point',        dice: 'le reste',     val: 1,  note: 'as > gros dés' },
];

const RecapPanel = () => (
  <Box sx={{
    width: 232, flexShrink: 0, bgcolor: '#fbf6e4', borderRadius: 3, p: 1.5,
    border: '1px solid #e0d5a8', alignSelf: 'flex-start',
    boxShadow: '0 6px 18px rgba(0,0,0,.25)',
  }}>
    <Typography sx={{ fontWeight: 800, color: '#7a5a10', mb: 1, textAlign: 'center', letterSpacing: .5 }}>
      🎲 Combinaisons
    </Typography>
    {RECAP.map((r, i) => (
      <Box key={r.label} sx={{
        display: 'flex', alignItems: 'center', gap: 1, py: 0.7,
        borderTop: i ? '1px dashed #e0d5a8' : 'none',
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: '#4a3a10', lineHeight: 1.1 }}>{r.label}</Typography>
          <Typography sx={{ fontSize: 11, color: '#9a854a', fontFamily: 'monospace' }}>{r.dice} · {r.note}</Typography>
        </Box>
        <Box sx={{
          minWidth: 30, textAlign: 'center', bgcolor: '#7a5a10', color: '#fbf6e4',
          borderRadius: 1.5, px: 0.8, py: 0.2, fontWeight: 800, fontSize: 13,
        }}>{r.val}</Box>
      </Box>
    ))}
    <Typography sx={{ fontSize: 10.5, color: '#9a854a', mt: 1, textAlign: 'center', fontStyle: 'italic' }}>
      du plus fort au plus faible
    </Typography>
  </Box>
);

// ————— Écran principal —————
export default function Le421() {
  const [phase, setPhase] = useState('setup'); // setup | playing | mancheEnd | gameEnd
  const [nbPlayers, setNbPlayers] = useState(3);
  const [nbManches, setNbManches] = useState(5);

  const [players, setPlayers] = useState([]);       // {..roster, score}
  const [manche, setManche] = useState(1);
  const [turnIdx, setTurnIdx] = useState(0);        // index dans players
  const [results, setResults] = useState({});       // id -> {dice, hand, rolls}

  const [dice, setDice] = useState([1, 1, 1]);
  const [held, setHeld] = useState([false, false, false]);
  const [rollsUsed, setRollsUsed] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [mancheWinner, setMancheWinner] = useState(null);

  const timers = useRef([]);
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);
  const aiLaunched = useRef(null); // évite un double-lancement du tour IA (StrictMode)

  const current = players[turnIdx];

  // ————— Lancement de partie —————
  const startGame = () => {
    const chosen = ROSTER.slice(0, nbPlayers).map(p => ({ ...p, score: 0, shots: 0 }));
    setPlayers(chosen);
    setManche(1);
    startManche(chosen, 1);
  };

  const startManche = (plist, m) => {
    setResults({});
    setMancheWinner(null);
    setManche(m);
    setPhase('playing');
    beginTurn(plist, 0);
  };

  const beginTurn = (plist, idx) => {
    setTurnIdx(idx);
    setDice([1, 1, 1]);
    setHeld([false, false, false]);
    setRollsUsed(0);
  };

  // ————— Animation d'un jet —————
  const animateRoll = (finalDice, keepMask, cb) => {
    setRolling(true);
    let ticks = 0;
    const iv = setInterval(() => {
      setDice(d => d.map((v, i) => keepMask[i] ? v : rollOne()));
      if (++ticks >= 6) {
        clearInterval(iv);
        setDice(finalDice);
        setRolling(false);
        cb && cb();
      }
    }, 60);
  };

  // ————— Tour humain —————
  const humanRoll = () => {
    if (rolling || rollsUsed >= 3) return;
    const keepMask = rollsUsed === 0 ? [false, false, false] : held;
    const finalDice = dice.map((v, i) => keepMask[i] ? v : rollOne());
    animateRoll(finalDice, keepMask, () => setRollsUsed(u => u + 1));
  };

  const toggleHold = (i) => {
    if (rolling || rollsUsed === 0) return;
    setHeld(h => h.map((v, j) => j === i ? !v : v));
  };

  const validateHuman = () => {
    if (rolling || rollsUsed === 0) return;
    recordResult(current.id, dice, rollsUsed);
  };

  // ————— Tour IA (auto) —————
  const runAiTurn = () => {
    const { dice: finalDice, rolls } = aiPlayTurn(current.greedy, current.shots);
    // On rejoue visuellement les jets successifs pour l'ambiance
    let step = 0;
    const showStep = () => {
      if (step >= rolls) {
        timers.current.push(setTimeout(() => recordResult(current.id, finalDice, rolls), 650));
        return;
      }
      // dé approximatif à chaque étape (le dernier = vrai résultat)
      const shown = step === rolls - 1 ? finalDice : roll3();
      animateRoll(shown, [false, false, false], () => {
        setRollsUsed(step + 1);
        step++;
        timers.current.push(setTimeout(showStep, 550));
      });
    };
    timers.current.push(setTimeout(showStep, 500));
  };

  const recordResult = (id, finalDice, rolls) => {
    const hand = evalHand(finalDice);
    const nextResults = { ...results, [id]: { dice: finalDice, hand, rolls } };
    setResults(nextResults);
    const nextIdx = turnIdx + 1;
    if (nextIdx < players.length) {
      timers.current.push(setTimeout(() => beginTurn(players, nextIdx), 500));
    } else {
      timers.current.push(setTimeout(() => resolveManche(nextResults), 500));
    }
  };

  // ————— Fin de manche —————
  const resolveManche = (finalResults) => {
    // tri stable par rang croissant : le 1er = pire main, le dernier = meilleure
    const sorted = [...players].sort((a, b) => finalResults[a.id].hand.rank - finalResults[b.id].hand.rank);
    const loser = sorted[0];
    const winner = sorted[sorted.length - 1];
    const gain = finalResults[winner.id].hand.value;
    const updated = players.map(p => {
      const np = { ...p };
      if (p.id === winner.id) np.score += gain;
      if (p.id === loser.id) np.shots += 1; // le perdant boit un coup 🥃
      return np;
    });
    setPlayers(updated);
    setMancheWinner({
      player: winner, gain, hand: finalResults[winner.id].hand,
      loser, loserHand: finalResults[loser.id].hand,
    });
    setPhase('mancheEnd');
  };

  const nextManche = () => {
    if (manche >= nbManches) { setPhase('gameEnd'); return; }
    startManche(players, manche + 1);
  };

  // Déclenche le tour de l'IA quand c'est à elle de jouer
  useEffect(() => {
    if (phase !== 'playing' || !current || current.isHuman || rolling) return;
    if (results[current.id]) return;
    if (rollsUsed !== 0) return; // tour déjà en cours
    const key = `${manche}-${turnIdx}`;
    if (aiLaunched.current === key) return; // déjà lancé pour ce tour
    aiLaunched.current = key;
    runAiTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, turnIdx, current]);

  // ——————————————————————————————————————————— RENDER —————
  if (phase === 'setup') {
    return (
      <Comptoir>
        <Box sx={{ textAlign: 'center', color: '#fff', maxWidth: 460, mx: 'auto', mt: 4 }}>
          <Typography sx={{ fontSize: 64, fontWeight: 900, letterSpacing: 4, textShadow: '0 4px 12px rgba(0,0,0,.5)' }}>421</Typography>
          <Typography sx={{ opacity: .85, mb: 4 }}>Le jeu de dés du comptoir</Typography>

          <SetupRow label="Joueurs">
            <ToggleButtonGroup exclusive value={nbPlayers} onChange={(e, v) => v && setNbPlayers(v)} size="small">
              {[2, 3, 4].map(n => <ToggleButton key={n} value={n} sx={tbSx}>{n}</ToggleButton>)}
            </ToggleButtonGroup>
          </SetupRow>

          <SetupRow label="Manches">
            <ToggleButtonGroup exclusive value={nbManches} onChange={(e, v) => v && setNbManches(v)} size="small">
              {[3, 5, 7, 10].map(n => <ToggleButton key={n} value={n} sx={tbSx}>{n}</ToggleButton>)}
            </ToggleButtonGroup>
          </SetupRow>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
            {ROSTER.slice(0, nbPlayers).map(p => (
              <Box key={p.id} sx={{ textAlign: 'center' }}>
                <Avatar src={p.avatar} sx={{ width: 52, height: 52, border: `3px solid ${p.color}`, mx: 'auto' }} />
                <Typography sx={{ fontSize: 12, mt: 0.5 }}>{p.name}</Typography>
              </Box>
            ))}
          </Box>

          <Button onClick={startGame} variant="contained" size="large"
            sx={{ mt: 4, px: 5, py: 1.2, fontWeight: 800, fontSize: 18, bgcolor: '#f0c040', color: '#3a2a00', '&:hover': { bgcolor: '#f5cf5a' } }}>
            Lancer la partie 🎲
          </Button>
        </Box>
      </Comptoir>
    );
  }

  if (phase === 'gameEnd') {
    const ranking = [...players].sort((a, b) => b.score - a.score);
    const champ = ranking[0];
    return (
      <Comptoir>
        <Box sx={{ textAlign: 'center', color: '#fff', maxWidth: 460, mx: 'auto', mt: 5 }}>
          <Typography sx={{ fontSize: 40, mb: 1 }}>🏆</Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 900, color: '#f0c040' }}>{champ.name} remporte la partie !</Typography>
          <Box sx={{ mt: 3, mx: 'auto', maxWidth: 320 }}>
            {ranking.map((p, i) => (
              <Box key={p.id} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1, my: 0.7,
                bgcolor: i === 0 ? 'rgba(240,192,64,.18)' : 'rgba(255,255,255,.06)', borderRadius: 2,
              }}>
                <Typography sx={{ width: 22, fontWeight: 800 }}>{i + 1}</Typography>
                <Avatar src={p.avatar} sx={{ width: 36, height: 36, border: `2px solid ${p.color}` }} />
                <Typography sx={{ flex: 1, textAlign: 'left', fontWeight: 700 }}>{p.name}</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: 20, color: '#f0c040' }}>{p.score}</Typography>
              </Box>
            ))}
          </Box>
          <Button onClick={() => setPhase('setup')} variant="contained"
            sx={{ mt: 4, px: 4, fontWeight: 800, bgcolor: '#f0c040', color: '#3a2a00', '&:hover': { bgcolor: '#f5cf5a' } }}>
            Rejouer
          </Button>
        </Box>
      </Comptoir>
    );
  }

  // phase playing / mancheEnd
  const isHumanTurn = phase === 'playing' && current?.isHuman && !rolling;
  // quand t'es rincé, c'est toute la salle qui tangue (le récap reste net)
  const human = players.find(p => p.isHuman);
  const screenBlur = human ? Math.min(human.shots * 1.4, 6) : 0;
  return (
    <Comptoir>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', maxWidth: 1000, mx: 'auto', flexWrap: 'wrap' }}>
        {/* Colonne jeu */}
        <Box sx={{ flex: 1, minWidth: 340, filter: screenBlur ? `blur(${screenBlur}px)` : 'none', transition: 'filter .4s' }}>
          {/* Bandeau manche + scores */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
              Manche {manche} / {nbManches}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
              {players.map(p => (
                <Box key={p.id} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.3, borderRadius: 2,
                  bgcolor: p.id === current?.id && phase === 'playing' ? 'rgba(240,192,64,.25)' : 'rgba(0,0,0,.25)',
                  border: p.id === current?.id && phase === 'playing' ? '1px solid #f0c040' : '1px solid transparent',
                }}>
                  <Avatar src={p.avatar} sx={{ width: 24, height: 24 }} />
                  <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{p.score}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Tapis des joueurs */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {players.map((p, idx) => {
              const res = results[p.id];
              const active = phase === 'playing' && idx === turnIdx;
              const showDice = active ? dice : res?.dice;
              const isWin = mancheWinner?.player.id === p.id;
              const isLoser = mancheWinner?.loser?.id === p.id;
              return (
                <Box key={p.id} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2, borderRadius: 3,
                  bgcolor: isWin ? 'rgba(240,192,64,.24)' : active ? 'rgba(255,214,140,.15)' : 'rgba(28,16,6,.45)',
                  border: isWin ? '2px solid #f0c040' : active ? `2px solid ${p.color}` : '2px solid rgba(214,168,96,.18)',
                  boxShadow: active || isWin ? '0 6px 16px rgba(0,0,0,.4)' : '0 2px 6px rgba(0,0,0,.3)',
                  backdropFilter: 'blur(1px)',
                  transition: 'all .2s',
                }}>
                  <Box sx={{ textAlign: 'center', width: 62, flexShrink: 0 }}>
                    <Avatar src={p.avatar} sx={{ width: 44, height: 44, mx: 'auto', border: `2px solid ${p.color}` }} />
                    <Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 700, mt: 0.3 }}>{p.name}</Typography>
                    {p.shots > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3, mt: 0.3 }}>
                        <ShotGlass h={16} />
                        <Typography sx={{ color: '#f4b84e', fontSize: 11, fontWeight: 800 }}>×{p.shots}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                    {showDice
                      ? showDice.map((v, i) => (
                          <Die key={i} value={v} size={active ? 96 : 58}
                            held={active && held[i]} rolling={active && rolling} color={p.color}
                            clickable={active && isHumanTurn && rollsUsed > 0}
                            onClick={() => toggleHold(i)} />
                        ))
                      : <Typography sx={{ color: 'rgba(255,255,255,.4)', fontStyle: 'italic', alignSelf: 'center' }}>
                          {active ? '' : 'en attente…'}
                        </Typography>}
                  </Box>

                  <Box sx={{ width: 118, textAlign: 'right', flexShrink: 0 }}>
                    {res && <>
                      <Typography sx={{ color: '#f0c040', fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>{res.hand.label}</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,.6)', fontSize: 11 }}>{res.rolls} lancer{res.rolls > 1 ? 's' : ''}</Typography>
                    </>}
                    {active && phase === 'playing' && !res &&
                      <Typography sx={{ color: '#f0c040', fontSize: 13, fontWeight: 700 }}>
                        {rollsUsed === 0 ? 'à jouer' : `jet ${rollsUsed}/3`}
                      </Typography>}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Barre d'actions */}
          <Box sx={{ mt: 2, minHeight: 56, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {phase === 'playing' && isHumanTurn && (
              <>
                {rollsUsed < 3 && (
                  <Button onClick={humanRoll} variant="contained"
                    sx={{ px: 4, py: 1.2, fontWeight: 800, fontSize: 16, bgcolor: '#f0c040', color: '#3a2a00', '&:hover': { bgcolor: '#f5cf5a' } }}>
                    {rollsUsed === 0 ? 'Lancer 🎲' : `Relancer (${3 - rollsUsed} restant${3 - rollsUsed > 1 ? 's' : ''})`}
                  </Button>
                )}
                {rollsUsed > 0 && (
                  <Button onClick={validateHuman} variant="outlined"
                    sx={{ px: 3, py: 1.2, fontWeight: 800, color: '#fff', borderColor: '#fff', '&:hover': { borderColor: '#f0c040', color: '#f0c040' } }}>
                    Je m'arrête ✓
                  </Button>
                )}
                {rollsUsed > 0 && rollsUsed < 3 &&
                  <Typography sx={{ width: '100%', textAlign: 'center', color: 'rgba(255,255,255,.6)', fontSize: 12 }}>
                    Clique un dé pour le garder, puis relance le reste
                  </Typography>}
              </>
            )}
            {phase === 'playing' && !isHumanTurn && !rolling &&
              <Typography sx={{ color: 'rgba(255,255,255,.7)', fontStyle: 'italic' }}>{current?.name} réfléchit…</Typography>}

            {phase === 'mancheEnd' && mancheWinner && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#fff', fontSize: 17, mb: 1 }}>
                  🎉 <b style={{ color: '#f0c040' }}>{mancheWinner.player.name}</b> gagne la manche avec <b>{mancheWinner.hand.label}</b> (+{mancheWinner.gain})
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
                  <ShotGlass h={30} animate />
                  <Typography sx={{ color: '#f4b84e', fontSize: 15 }}>
                    <b>{mancheWinner.loser.name}</b> a la pire main (<i>{mancheWinner.loserHand.label}</i>) → cul sec ! 🥃
                  </Typography>
                </Box>
                <Button onClick={nextManche} variant="contained"
                  sx={{ px: 4, py: 1.1, fontWeight: 800, bgcolor: '#f0c040', color: '#3a2a00', '&:hover': { bgcolor: '#f5cf5a' } }}>
                  {manche >= nbManches ? 'Voir le classement' : 'Manche suivante →'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <RecapPanel />
      </Box>
    </Comptoir>
  );
}

// ————— Habillage —————
const Comptoir = ({ children }) => (
  <Box sx={{
    minHeight: '100%', p: 2, position: 'relative', overflow: 'hidden',
    fontFamily: '"Georgia", "Times New Roman", serif',
    background: [
      // halo chaud de la lampe suspendue au-dessus du comptoir
      'radial-gradient(120% 70% at 50% -8%, rgba(255,196,110,.38), rgba(255,196,110,0) 55%)',
      // vignette : les bords du bar plongent dans la pénombre
      'radial-gradient(130% 120% at 50% 45%, rgba(20,10,0,0) 38%, rgba(15,8,2,.62) 100%)',
      // lattes du comptoir en bois
      'repeating-linear-gradient(91deg, #6f4626 0px, #6f4626 56px, #64401f 56px, #64401f 60px)',
      // teinte de fond du bois verni
      'linear-gradient(180deg, #6a4526 0%, #4c331c 60%, #3c2716 100%)',
    ].join(', '),
  }}>
    {/* filet de laiton du comptoir, comme le rebord d'un vrai zinc */}
    <Box sx={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      boxShadow: 'inset 0 3px 0 rgba(214,168,96,.35), inset 0 -60px 90px rgba(0,0,0,.35)',
    }} />
    <Box sx={{ position: 'relative' }}>{children}</Box>
  </Box>
);

const SetupRow = ({ label, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 1.5, px: 1 }}>
    <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
    {children}
  </Box>
);

const tbSx = {
  color: '#fff', borderColor: 'rgba(255,255,255,.3)', fontWeight: 800, px: 2,
  '&.Mui-selected': { bgcolor: '#f0c040', color: '#3a2a00', '&:hover': { bgcolor: '#f5cf5a' } },
};
