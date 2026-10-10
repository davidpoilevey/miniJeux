import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Chip, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Switch, Typography } from '@mui/material';
import { Jardin } from './engine/Jardin';
import { dessiner } from './ui/dessiner';

const panel = { bgcolor: '#17272b', border: '1px solid #2c4245', borderRadius: 3, p: 2 };

export default function B17() {
  const garden = useRef(null);
  if (!garden.current) garden.current = new Jardin();
  const canvas = useRef(null), container = useRef(null);
  const [running, setRunning] = useState(true), [speed, setSpeed] = useState(1);
  const [layer, setLayer] = useState('vivant'), [selected, setSelected] = useState(null);
  const [stats, setStats] = useState(garden.current.stats), [rain, setRain] = useState(1);
  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const latest = useRef({ running, speed, layer, selected });
  latest.current = { running, speed, layer, selected };

  useEffect(() => {
    const resize = () => {
      const element = canvas.current, box = container.current;
      if (!element || !box) return;
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, box.clientWidth);
      element.width = Math.round(width * dpr);
      element.height = Math.round(width * garden.current.H / garden.current.W * dpr);
    };
    const observer = new ResizeObserver(resize); observer.observe(container.current); resize();
    let frames = 0;
    const interval = setInterval(() => {
      const state = latest.current, world = garden.current;
      if (state.running) for (let k = 0; k < state.speed; k++) world.step();
      const element = canvas.current;
      if (element) dessiner(element.getContext('2d'), world, element.width, element.height, state);
      if (++frames % 6 === 0) setStats(world.stats);
    }, 40);
    return () => { clearInterval(interval); observer.disconnect(); };
  }, []);

  const inspect = event => {
    const rect = canvas.current.getBoundingClientRect(), world = garden.current;
    const x = Math.floor((event.clientX - rect.left) / rect.width * world.W);
    const y = Math.floor((event.clientY - rect.top) / rect.height * world.H);
    let found = null;
    for (let radius = 0; radius < 3 && !found; radius++) for (let dy = -radius; dy <= radius && !found; dy++) for (let dx = -radius; dx <= radius && !found; dx++) {
      if (world.inside(x + dx, y + dy)) {
        const i = world.index(x + dx, y + dy);
        found = world.occupied[i] || -world.sporeAt[i] || null;
      }
    }
    setSelected(found);
  };
  const changeRain = value => {
    garden.current.rain = value; setRain(value);
    if (value === 0) {
      garden.current.weatherEnabled = false; garden.current.shower = null; setWeatherEnabled(false);
    }
    setStats(garden.current.stats);
  };
  const reset = () => {
    garden.current = new Jardin(); garden.current.rain = rain; garden.current.weatherEnabled = weatherEnabled;
    setSelected(null); setStats(garden.current.stats);
  };
  const plant = garden.current.plants.get(selected);
  const spore = selected < 0 ? garden.current.spores.get(-selected) : null;
  const connections = plant ? [...garden.current.grafts.values()].filter(g => g.a === plant.id || g.b === plant.id) : [];
  const buttonStyle = { borderColor: '#45625d', color: '#d5eee2', textTransform: 'none' };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0d191c', color: '#e4eee7', p: { xs: 1.5, md: 3 }, fontFamily: 'system-ui' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
        <Box>
          <Typography sx={{ color: '#9daf9f', fontSize: 11, letterSpacing: 3 }}>B17 · PREMIÈRE EXPÉRIENCE</Typography>
          <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif', mt: 0.5 }}>Les jardins des liens</Typography>
          <Typography sx={{ color: '#a7bcb6', mt: 0.5, fontSize: 13 }}>Une paroi, plusieurs lignées. Pousser, partager, tenir debout.</Typography>
        </Box>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button variant="outlined" sx={buttonStyle} onClick={() => setRunning(value => !value)}>{running ? 'Pause' : 'Reprendre'}</Button>
          <Button variant="outlined" sx={buttonStyle} onClick={() => setSpeed(value => value === 1 ? 4 : value === 4 ? 12 : 1)}>Vitesse ×{speed}</Button>
          <Button variant="outlined" sx={buttonStyle} onClick={reset}>Nouvelle paroi</Button>
        </Stack>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 285px' }, gap: 2 }}>
        <Box>
          <Box sx={{ ...panel, p: 1.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5} gap={1}>
              <Typography sx={{ color: '#e3cf91', fontSize: 12 }}>↓ La lumière arrive d’en haut</Typography>
              <FormControl size="small" sx={{ minWidth: 140, '& .MuiInputBase-root, & .MuiSvgIcon-root': { color: '#d4e4dd' }, '& fieldset': { borderColor: '#42605d' }, '& label': { color: '#a7bcb6' } }}>
                <InputLabel id="b17-layer">Observer</InputLabel>
                <Select labelId="b17-layer" label="Observer" value={layer} onChange={event => setLayer(event.target.value)}>
                  <MenuItem value="vivant">Les plantes</MenuItem><MenuItem value="eau">L’eau disponible</MenuItem><MenuItem value="lumiere">La lumière</MenuItem><MenuItem value="nutriments">Les nutriments</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Box ref={container}>
              <canvas ref={canvas} onClick={inspect} aria-label="Paroi végétale : cliquer une plante pour inspecter ses réserves et ses greffes" style={{ display: 'block', width: '100%', borderRadius: 12, cursor: 'crosshair' }} />
            </Box>
            <Typography sx={{ mt: 1.5, fontSize: 12, color: '#a7bcb6' }}>Sol brun : réserve minérale · Une couleur par lignée · Cercles dorés : greffes · Losanges : spores · Flux bleus : eau · Flux jaunes : énergie · Flux orange : nutriments</Typography>
          </Box>
          <Box sx={{ ...panel, mt: 2 }}>
            <Typography sx={{ mb: 1, fontSize: 14 }}>Changer les conditions</Typography>
            <Typography sx={{ color: '#a7bcb6', fontSize: 12, mb: 1.5 }}>La lumière vient du haut, les nutriments du bas. Sans appui, les plantes tombent ; une greffe peut les retenir et les nourrir.</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {[[1, 'Fissures alimentées'], [0.25, 'Eau rare'], [0, 'Assécher la paroi']].map(([value, label]) => (
                <Button key={value} aria-pressed={rain === value} variant={rain === value ? 'contained' : 'outlined'} sx={{ ...buttonStyle, bgcolor: rain === value ? '#285a4b' : undefined }} onClick={() => changeRain(value)}>{label}</Button>
              ))}
            </Stack>
            <Typography sx={{ color: '#a7bcb6', fontSize: 12, mt: 1 }}>Assécher coupe aussi les averses spontanées. L’eau déjà présente reste disponible.</Typography>
            <FormControlLabel sx={{ mt: 1, '& .MuiTypography-root': { fontSize: 13 } }} label="Averses spontanées" control={<Switch checked={weatherEnabled} onChange={event => {
              garden.current.weatherEnabled = event.target.checked; setWeatherEnabled(event.target.checked);
            }} />} />
            <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
              <Button variant="outlined" sx={buttonStyle} onClick={() => { garden.current.startShower('general'); setStats(garden.current.stats); }}>Pluie générale</Button>
              <Button variant="outlined" sx={buttonStyle} onClick={() => { garden.current.startShower('local'); setStats(garden.current.stats); }}>Averse locale</Button>
            </Stack>
            <Typography aria-live="polite" sx={{ color: stats.shower ? '#73dcff' : '#a7bcb6', fontSize: 12, mt: 1 }}>{stats.shower ? `${stats.shower} en cours` : weatherEnabled ? 'Les prochaines averses arriveront à des moments irréguliers.' : 'Les spores attendent le retour de l’eau et de la lumière.'}</Typography>
          </Box>
        </Box>
        <Stack gap={2}>
          <Box sx={panel}>
            <Typography sx={{ color: '#a7bcb6', fontSize: 12, mb: 1 }}>CYCLE {stats.tick}</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {[`${stats.plants} plantes`, `${stats.lineages} lignées actives`, `${stats.grafts} greffes`, `${stats.cells} cellules`, `${stats.spores} spores`].map(label => <Chip key={label} label={label} size="small" sx={{ bgcolor: '#263d37', color: '#d6eadc' }} />)}
            </Stack>
            <Typography sx={{ fontSize: 12, color: '#a7bcb6', mt: 1.5 }}>{stats.births} naissances · {stats.deaths} morts · Génération {stats.generation}</Typography>
            <Typography sx={{ fontSize: 12, color: '#a7bcb6', mt: 0.5 }}>{stats.grounded} plantes au sol · {stats.falling} en chute<br />{stats.falls} pertes d’appui · {stats.fragments} fragments détachés<br />{stats.grafted} greffes formées · {stats.broken} ruptures</Typography>
            <Typography sx={{ fontSize: 12, color: '#a7bcb6', mt: 0.5 }}>{stats.dormantLineages} lignées en dormance · {stats.awakenings} réveils · {stats.showers} averses</Typography>
          </Box>
          <Box sx={panel}>
            <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: 20, mb: 1 }}>{plant ? `Plante ${plant.id}` : spore ? `Spore de la plante ${spore.sourceId}` : selected < 0 ? 'Spore germée ou disparue' : selected ? 'Plante disparue' : 'Approchez-vous'}</Typography>
            {plant ? <>
              <Typography sx={{ fontSize: 13, color: '#b1c6bd' }}>Lignée {plant.lineage} · génération {plant.generation}<br />{plant.cells.length} cellules · âge {plant.age}<br />Énergie {plant.energy.toFixed(2)} · eau {plant.water.toFixed(2)}<br />Nutriments {plant.nutrients.toFixed(2)} · {plant.falling ? 'en chute' : plant.grounded ? 'au sol' : plant.supported ? 'soutenue' : 'cherche un appui'}<br />{plant.stress ? `En difficulté depuis ${plant.stress} cycles` : 'Réserves vitales disponibles'}</Typography>
              <Typography sx={{ fontSize: 12, mt: 1.5 }}>Par cycle : +{plant.photo.toFixed(3)} énergie captée · +{plant.intake.toFixed(3)} eau prélevée / −{plant.waterUse.toFixed(3)} utilisée · +{plant.mineralIntake.toFixed(3)} nutriments</Typography>
              <Typography sx={{ color: '#a7bcb6', fontSize: 12, mt: 1.5 }}>Tendances héritées : hauteur {(plant.traits.vertical * 100).toFixed(0)} % · ramification {(plant.traits.branching * 100).toFixed(0)} % · partage {(plant.traits.sharing * 100).toFixed(0)} %</Typography>
              {connections.map(g => <Typography key={g.key} sx={{ fontSize: 12, mt: 1, color: '#e3cf91' }}>↔ Plante {g.a === plant.id ? g.b : g.a} · eau {((g.a === plant.id ? -1 : 1) * g.water).toFixed(3)} · énergie {((g.a === plant.id ? -1 : 1) * g.energy).toFixed(3)} · nutriments {((g.a === plant.id ? -1 : 1) * (g.nutrients || 0)).toFixed(3)} / cycle</Typography>)}
              {!connections.length && <Typography sx={{ fontSize: 12, mt: 1 }}>Aucune greffe active.</Typography>}
              <Button size="small" sx={buttonStyle} onClick={() => setSelected(null)}>Voir tout le jardin</Button>
            </> : spore ? <>
              <Typography sx={{ fontSize: 13, color: '#b1c6bd' }}>Lignée {spore.lineage} · génération {spore.generation}<br />En dormance depuis {spore.age} cycles<br />Énergie conservée {spore.energy.toFixed(3)}<br />Lumière {(garden.current.light[garden.current.index(spore.x, spore.y)] * 100).toFixed(0)} % · eau locale {garden.current.water[garden.current.index(spore.x, spore.y)].toFixed(3)}</Typography>
              <Typography sx={{ fontSize: 12, mt: 1 }}>{spore.favorable ? `${spore.favorable} / 15 cycles favorables avant germination.` : 'Attend une place libre, de l’eau et assez de lumière.'}</Typography>
              <Button size="small" sx={buttonStyle} onClick={() => setSelected(null)}>Voir tout le jardin</Button>
            </> : <Typography sx={{ fontSize: 13, color: '#a7bcb6' }}>Cliquez une plante ou une spore pour suivre sa lignée. Les spores conservent son génome pendant les périodes défavorables.</Typography>}
          </Box>
          <Box sx={panel}>
            <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: 20, mb: 1 }}>Ce qui se passe</Typography>
            {!stats.plants && <Typography sx={{ color: '#e3cf91', fontSize: 13, mb: 1 }}>{stats.spores ? 'Le jardin sommeille : des spores peuvent encore se réveiller.' : 'La paroi est éteinte. Aucune lignée ne subsiste.'}</Typography>}
            {garden.current.events.slice(0, 7).map((event, i) => <Typography key={`${event.tick}-${i}`} sx={{ fontSize: 12, color: i === 0 ? '#d5e6da' : '#92aaa0', py: 0.65, borderBottom: '1px solid #2c4245' }}>{event.tick} · {event.text}</Typography>)}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
