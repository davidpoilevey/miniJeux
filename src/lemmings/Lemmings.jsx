import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { Stage, Layer, Rect, Circle, Line, Text, Group } from 'react-konva';
import { LEVELS } from './levels';
import { assignSkill, createGame, isActive, MAX_FALL, releaseBlocker, SKILLS, stepGame, TICK_MS } from './engine';

const CELL = 12;
const COLORS = { '#': '#85563d', X: '#39465c', B: '#d8aa61' };

function Lemming({ lemming: l, tick, selected }) {
  const stride = tick % 2 ? 2 : -2;
  return <Group x={(l.x + 0.5) * CELL} y={(l.y + 1) * CELL}>
    {selected && <Circle x={0} y={-12} radius={17} stroke="#ffe18b" strokeWidth={1.5} />}
    <Line points={[-3, -5, -3 + stride, -1, 1 + stride, -1]} stroke="#f9edbe" strokeWidth={3} />
    <Line points={[3, -5, 3 - stride, -1, 6 - stride, -1]} stroke="#f9edbe" strokeWidth={3} />
    <Rect x={-5} y={-15} width={10} height={11} fill={l.status === 'blocking' ? '#db7099' : '#547ce6'} cornerRadius={2} />
    <Rect x={-4} y={-22} width={9} height={8} fill="#ffe1b4" cornerRadius={2} />
    <Rect x={-6} y={-25} width={13} height={5} fill="#8fe66c" />
    <Rect x={l.direction > 0 ? 2 : -3} y={-18} width={2} height={2} fill="#152238" />
    {l.status === 'blocking' && <Line points={[-10, -12, 10, -12]} stroke="#ffe1b4" strokeWidth={3} />}
    {l.status === 'digging' && <Line points={[4, -10, 9, -3, 5, 0, 12, 0]} stroke="#f5cd70" strokeWidth={2} />}
    {l.status === 'building' && <Rect x={l.direction * 8 - 3} y={-10} width={7} height={4} fill="#f5cd70" />}
  </Group>;
}

export default function Lemmings({ levels = LEVELS }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = levels[levelIndex];
  const [game, setGame] = useState(() => createGame(level));
  const [paused, setPaused] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [skill, setSkill] = useState('digger');
  const [hovered, setHovered] = useState(null);
  const [notice, setNotice] = useState('Choisis une capacité, puis touche un lemming pour lui donner un métier.');
  const [width, setWidth] = useState(768);
  const container = useRef(null);
  const stage = useRef(null);
  const gameRef = useRef(game);
  gameRef.current = game;
  const scale = width / (level.width * CELL);

  useEffect(() => {
    const observer = new ResizeObserver(entries => setWidth(Math.max(1, entries[0].contentRect.width)));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || game.result) return undefined;
    const interval = setInterval(() => setGame(current => stepGame(current, level)), TICK_MS / speed);
    return () => clearInterval(interval);
  }, [paused, speed, level, game.result]);

  const terrainRuns = useMemo(() => {
    const runs = [];
    game.terrain.forEach((row, y) => {
      for (let x = 0; x < row.length;) {
        const material = row[x];
        const start = x++;
        while (x < row.length && row[x] === material) x++;
        if (material !== '.') runs.push({ x: start, y, w: x - start, material });
      }
    });
    return runs;
  }, [game.terrain]);

  function nearestLemming() {
    const point = stage.current?.getPointerPosition();
    if (!point) return null;
    const x = point.x / scale;
    const y = point.y / scale;
    return gameRef.current.lemmings.filter(isActive)
      .map(l => ({ l, distance: Math.hypot((l.x + 0.5) * CELL - x, (l.y + 0.1) * CELL - y) }))
      .filter(item => item.distance <= 25)
      .sort((a, b) => a.distance - b.distance)[0]?.l ?? null;
  }

  function giveSkill() {
    const l = nearestLemming();
    if (!l) return;
    if (l.status === 'blocking') {
      const next = releaseBlocker(gameRef.current, l.id);
      gameRef.current = next;
      setGame(next);
      setNotice('Bloqueur libéré ! Il reprend sa marche. Aucune capacité supplémentaire consommée.');
      return;
    }
    const next = assignSkill(gameRef.current, l.id, skill);
    if (next === gameRef.current) {
      setNotice('Il faut un marcheur posé au sol et une capacité disponible. On ne creuse que la terre brune.');
    } else {
      gameRef.current = next;
      setGame(next);
      setNotice(`${SKILLS[skill].label} assigné ! ${SKILLS[skill].help}`);
    }
  }

  function restart(index = levelIndex) {
    setLevelIndex(index);
    const fresh = createGame(levels[index]);
    gameRef.current = fresh;
    setGame(fresh);
    setPaused(true);
    setHovered(null);
    setNotice('Tout le monde est de retour dans la trappe. Cette fois, on les sauve ?');
  }

  const remaining = Math.max(0, Math.ceil(level.timeSeconds - game.tick * TICK_MS / 1000));
  const active = game.lemmings.filter(isActive).length;
  return <Box sx={{ minHeight: '100%', bgcolor: '#111b2c', color: '#edf3ff', p: { xs: 1.5, sm: 3 }, pb: 5 }}>
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Typography sx={{ color: '#9de181', letterSpacing: 3, fontSize: 12, fontWeight: 800 }}>LEMMINGS · PREMIER PROTO</Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: 25, sm: 34 } }}>{level.title}</Typography>
      <Typography sx={{ color: '#b5c3d8', mt: 1, mb: 2 }}>{level.hint}</Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
        {[`Sauvés : ${game.saved} / ${level.required}`, `En piste : ${active}`, `À sortir : ${level.total - game.released}`, `Perdus : ${game.lost}`, `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`].map(label =>
          <Chip key={label} label={label} sx={{ bgcolor: '#23334b', color: '#edf3ff' }} />)}
      </Stack>

      <Box ref={container} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 12px 40px #0005', lineHeight: 0 }}>
        <Stage ref={stage} width={width} height={level.height * CELL * scale} scaleX={scale} scaleY={scale}
          onClick={giveSkill} onTap={giveSkill}
          onMouseMove={() => setHovered(nearestLemming()?.id ?? null)} onMouseLeave={() => setHovered(null)}>
          <Layer listening={false}>
            <Rect width={level.width * CELL} height={level.height * CELL} fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: level.height * CELL }} fillLinearGradientColorStops={[0, '#17233d', 1, '#334059']} />
            {Array.from({ length: 22 }, (_, i) => <Circle key={i} x={(i * 137 + 31) % (level.width * CELL)} y={(i * 41 + 12) % 105} radius={i % 3 === 0 ? 1.5 : 1} fill="#c6dbed" opacity={0.5} />)}
            {terrainRuns.map(run => <Group key={`${run.x}-${run.y}`}>
              <Rect x={run.x * CELL} y={run.y * CELL} width={run.w * CELL} height={CELL} fill={COLORS[run.material]} />
              <Line points={[run.x * CELL, run.y * CELL + 1, (run.x + run.w) * CELL, run.y * CELL + 1]} stroke={run.material === '#' ? '#bb8354' : run.material === 'B' ? '#ffe1a1' : '#52627a'} strokeWidth={1} />
            </Group>)}
            <Group x={level.spawn.x * CELL} y={(level.spawn.y - 2) * CELL}>
              <Rect x={-12} width={36} height={18} fill="#b99a72" cornerRadius={3} />
              <Rect x={-6} y={12} width={24} height={8} fill="#0b1424" />
              <Text x={-22} y={-13} text="ENTRÉE" fontSize={10} fill="#d9c8a8" />
            </Group>
            <Group x={level.exit.x * CELL} y={level.exit.y * CELL}>
              <Rect width={level.exit.width * CELL} height={level.exit.height * CELL} fill="#94df84" opacity={0.2} cornerRadius={10} />
              <Rect x={5} y={3} width={level.exit.width * CELL - 10} height={level.exit.height * CELL - 3} fill="#112e29" stroke="#a1ec91" strokeWidth={3} cornerRadius={[12, 12, 0, 0]} />
              <Text x={-5} y={-15} text="SORTIE" fontSize={11} fill="#b9f2a4" />
            </Group>
            {game.lemmings.filter(isActive).map(l => <Lemming key={l.id} lemming={l} tick={game.tick} selected={hovered === l.id} />)}
            {(paused || game.result) && <Group>
              <Rect width={level.width * CELL} height={level.height * CELL} fill="#08111c" opacity={0.35} />
              <Text x={0} y={level.height * CELL - 50} width={level.width * CELL} align="center" fontSize={20} fontStyle="bold" fill="#fff3ca"
                text={game.result === 'won' ? 'Bravo ! La troupe est sauvée.' : game.result === 'lost' ? 'Oh non… On recommence ?' : game.tick === 0 ? 'Prêt ? Appuie sur « Lancer la troupe ».' : 'Pause · tu peux encore attribuer une capacité.'} />
            </Group>}
          </Layer>
        </Stage>
      </Box>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
        {Object.entries(SKILLS).map(([key, info]) => <Tooltip key={key} title={info.help}>
          <span><Button aria-pressed={skill === key} disabled={game.skills[key] <= 0 || !!game.result} onClick={() => { setSkill(key); setNotice(info.help); }}
            variant={skill === key ? 'contained' : 'outlined'} sx={{ minHeight: 48, borderColor: '#677b99', color: skill === key ? '#10202b' : '#edf3ff', bgcolor: skill === key ? '#a9e78c' : undefined, '&:hover': { bgcolor: skill === key ? '#b9f59c' : '#25364c' }, '&.Mui-disabled': { color: '#758297', borderColor: '#36445a' } }}>
            {info.symbol} {info.label} · {game.skills[key]}
          </Button></span>
        </Tooltip>)}
      </Stack>
      <Typography role="status" sx={{ color: '#cbd6e7', minHeight: 44, mt: 1.5, fontSize: 14 }}>{notice}</Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Button variant="contained" disabled={!!game.result} onClick={() => setPaused(value => !value)}>
          {paused ? game.tick === 0 ? 'Lancer la troupe' : 'Reprendre' : 'Pause'}
        </Button>
        <Button variant="outlined" aria-pressed={speed === 2} sx={{ color: '#edf3ff', borderColor: '#677b99' }} onClick={() => setSpeed(value => value === 1 ? 2 : 1)}>Vitesse ×{speed}</Button>
        <Button sx={{ color: '#edf3ff' }} onClick={() => restart()}>Recommencer</Button>
        {game.result === 'won' && levelIndex + 1 < levels.length && <Button variant="contained" onClick={() => restart(levelIndex + 1)}>Niveau suivant</Button>}
      </Stack>
      {game.result && <Typography sx={{ mt: 2, color: game.result === 'won' ? '#a9e78c' : '#ffbdab', fontWeight: 700 }}>
        {game.saved} sur {level.total} sauvés · objectif : {level.required}. {game.result === 'won' ? 'Mission accomplie !' : 'La trappe a encore des volontaires.'}
      </Typography>}
      <Typography sx={{ mt: 3, color: '#90a4be', fontSize: 13 }}>
        Terre brune : creusable · Roche grise : indestructible · Une chute de plus de {MAX_FALL} cases est fatale.
        {' '}Clique à nouveau sur un bloqueur rose pour le libérer, quelle que soit la capacité sélectionnée.
        {' '}Les métiers s’attribuent aux marcheurs au sol. Astuce : mets en pause pour viser tranquillement.
      </Typography>
    </Box>
  </Box>;
}
