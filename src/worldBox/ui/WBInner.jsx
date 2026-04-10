import {
  Box, Button, ButtonGroup, Chip, Collapse, Divider, IconButton,
  LinearProgress, MenuItem, Popover, Select, Slider,
  Tab, Tabs, Tooltip, Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import {
  CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from 'recharts';
import { useWB } from "../WBContext";
import WBCalibrator from "./WBCalibrator";
import WBCanvas from "./WBCanvas";

const RIGHT_W = 280;

// ── Palette dorée ─────────────────────────────────────────────
const GOLD = {
  main:    '#C9A84C',
  light:   '#F0D060',
  dark:    '#8B6914',
  faint:   'rgba(201,168,76,0.12)',
  border:  'rgba(201,168,76,0.28)',
  bg:      '#1c1810',
  paper:   '#534828',
  paperAlt:'#2a2415',
};

// sx réutilisables
const sxCard = {
  px: 1.5, py: 0.75,
  borderRadius: 1,
  bgcolor: GOLD.faint,
  border: `1px solid ${GOLD.border}`,
  display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64,
};

const sxLabel = { fontSize: 10, color: GOLD.main, letterSpacing: 0.5, textTransform: 'uppercase' };
const sxValue = { fontSize: 18, fontWeight: 700, color: GOLD.light, lineHeight: 1.2 };

// ── Carte stat ────────────────────────────────────────────────
function StatCard({ label, value, icon }) {
  return (
    <Box sx={sxCard}>
      <Typography sx={{ ...sxLabel, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {icon && <span>{icon}</span>}{label}
      </Typography>
      <Typography sx={sxValue}>{value}</Typography>
    </Box>
  );
}

// ── Barre de besoin ───────────────────────────────────────────
function NeedBar({ label, value, color }) {
  return (
    <Box sx={{ minWidth: 110 }}>
      <Typography sx={{ fontSize: 10, color: GOLD.main, letterSpacing: 0.3 }}>
        {label} <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(value)}</span>
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, value)}
        sx={{ height: 5, borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.08)',
              '& .MuiLinearProgress-bar': { bgcolor: color } }}
      />
    </Box>
  );
}

// ── PopulationChart ───────────────────────────────────────────
function PopulationChart() {
  const { tick, engineRef } = useWB();
  const engine  = engineRef.current;
  const history = engine?._populationHistory?.slice() ?? [];
  const em      = engine?.em;

  if (history.length < 2 || !em) return (
    <Box sx={{ px: 1.5, py: 0.75, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
        En attente de données…
      </Typography>
    </Box>
  );

  // Collecte les villages avec leur couleur
  const villages = em.query('Village').map(vid => {
    const v = em.getComponent(vid, 'Village');
    return { name: v.groupId, color: v.color ?? GOLD.main };
  });

  return (
    <Box sx={{ px: 0.5, pt: 0.5, pb: 0.5 }}>
      <Typography sx={{ ...sxLabel, px: 1, mb: 0.5 }}>Population par village</Typography>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={history} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="tick"
            stroke="rgba(255,255,255,0.25)"
            tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.35)' }}
            tickCount={5}
          />
          <YAxis
            stroke="rgba(255,255,255,0.25)"
            tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.35)' }}
            allowDecimals={false}
          />
          <RTooltip
            contentStyle={{
              backgroundColor: '#1c1810',
              border: `1px solid ${GOLD.border}`,
              fontSize: 11,
              color: GOLD.light,
            }}
            labelStyle={{ color: GOLD.main, fontWeight: 700 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
            formatter={(value) => (
              <span style={{ color: villages.find(v => v.name === value)?.color ?? GOLD.main }}>
                {value}
              </span>
            )}
          />
          {villages.map(({ name, color }) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ── StatsPanel ────────────────────────────────────────────────
function StatsPanel() {
  const { tick, engineRef } = useWB();
  const em = engineRef.current?.em;
  const [floraOpen, setFloraOpen] = useState(false);

  let plantCount = 0, mineralCount = 0, humanCount = 0, buildingCount = 0, villageCount = 0;
  let byType = {};
  const births      = engineRef.current?._births      ?? 0;
  const deaths      = engineRef.current?._deaths      ?? 0;
  const deathCauses = engineRef.current?._deathCauses ?? {};

  if (em) {
    humanCount    = em.query('Inhabitant').length;
    buildingCount = em.query('Building').length;
    villageCount  = em.query('Village').length;

    for (const id of em.query('Position', 'Resource', 'Species')) {
      const sp  = em.getComponent(id, 'Species');
      const res = em.getComponent(id, 'Resource');
      if (sp.type === 'plant')   plantCount++;
      if (sp.type === 'mineral') mineralCount++;
      byType[res.type] = (byType[res.type] ?? 0) + 1;
    }
  }

  return (
    <Box sx={{ px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Ligne principale */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'stretch' }}>
        <StatCard label="Tick"       value={tick}         icon="⏱" />
        <StatCard label="Habitants"  value={humanCount}   icon="👤" />
        <StatCard label="Naissances" value={births}       icon="🍼" />
        <Box sx={{ ...sxCard, alignItems: 'flex-start', minWidth: 80 }}>
          <Typography sx={{ ...sxLabel, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span>💀</span>Morts
          </Typography>
          <Typography sx={sxValue}>{deaths}</Typography>
          {Object.entries(deathCauses).map(([cause, n]) => (
            <Typography key={cause} sx={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
              {cause} : {n}
            </Typography>
          ))}
        </Box>
        <StatCard label="Bâtiments"  value={buildingCount} icon="🏠" />
        <StatCard label="Villages"   value={villageCount}  icon="🏘" />

        <Divider orientation="vertical" flexItem sx={{ borderColor: GOLD.border, mx: 0.5 }} />

        <StatCard label="Plantes"    value={plantCount}   icon="🌿" />
        <StatCard label="Minéraux"   value={mineralCount} icon="⛏" />

        {/* Bouton collapse flore */}
        <Tooltip title={floraOpen ? 'Masquer le détail' : 'Détail flore & minéraux'}>
          <Box
            onClick={() => setFloraOpen(o => !o)}
            sx={{
              ...sxCard, cursor: 'pointer', minWidth: 32,
              '&:hover': { bgcolor: 'rgba(201,168,76,0.22)' },
            }}
          >
            <Typography sx={{ ...sxLabel, fontSize: 14 }}>{floraOpen ? '▲' : '▼'}</Typography>
          </Box>
        </Tooltip>
      </Box>

      {/* Détail flore/minéraux (collapse) */}
      <Collapse in={floraOpen}>
        <Box sx={{
          display: 'flex', gap: 1.5, flexWrap: 'wrap',
          px: 1, py: 0.75, borderRadius: 1,
          bgcolor: GOLD.faint, border: `1px solid ${GOLD.border}`,
        }}>
          {Object.entries(byType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <Box key={type} sx={{ textAlign: 'center', minWidth: 48 }}>
                <Typography sx={{ fontSize: 10, color: GOLD.main }}>{type}</Typography>
                <Typography sx={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{count}</Typography>
              </Box>
            ))
          }
        </Box>
      </Collapse>

      <Divider sx={{ borderColor: GOLD.border, mx: -1.5 }} />
      <PopulationChart />
    </Box>
  );
}

// ── Popover "More" ────────────────────────────────────────────
function MorePopover({ anchorEl, onClose }) {
  const { seaLevel, setSeaLevel, generateNewWorld,
          saveGame, loadSave, clearSave, hasSave, tick } = useWB();
  const open = Boolean(anchorEl);

  const paperSx = {
    p: 2,
    bgcolor: GOLD.paper,
    border: `1px solid ${GOLD.border}`,
    minWidth: 230,
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: paperSx } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography sx={{ ...sxLabel, mb: 0.5 }}>Niveau de la mer : {seaLevel}</Typography>
          <Slider size="small" min={5} max={60} step={1}
            value={seaLevel} onChange={(_, v) => setSeaLevel(v)}
            sx={sliderSx} />
        </Box>

        <Divider sx={{ borderColor: GOLD.border }} />

        <Button variant="outlined" size="small"
          onClick={() => { generateNewWorld(); onClose(); }}
          sx={outlinedBtnSx}>
          🌍 Nouveau monde
        </Button>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="outlined" size="small" onClick={saveGame} sx={outlinedBtnSx}>
            💾 Sauvegarder
          </Button>
          <Button variant="outlined" size="small" disabled={!hasSave} onClick={loadSave} sx={outlinedBtnSx}>
            📂 Charger
          </Button>
          {hasSave && (
            <Typography sx={{ fontSize: 11, color: GOLD.main, cursor: 'pointer',
              textDecoration: 'underline', '&:hover': { color: GOLD.light } }}
              onClick={clearSave}>
              ✕ effacer
            </Typography>
          )}
        </Box>
        {hasSave && (
          <Typography sx={{ fontSize: 11, color: '#6dbf67' }}>
            💾 auto-save actif (tick {tick - (tick % 50)})
          </Typography>
        )}
      </Box>
    </Popover>
  );
}

// ── sx réutilisables pour les contrôles ───────────────────────
const sliderSx = {
  color: GOLD.main,
  '& .MuiSlider-thumb': { bgcolor: GOLD.light, width: 12, height: 12 },
  '& .MuiSlider-rail':  { bgcolor: 'rgba(201,168,76,0.25)' },
};

const outlinedBtnSx = {
  borderColor: GOLD.border,
  color: GOLD.main,
  fontSize: 12,
  '&:hover': { borderColor: GOLD.light, color: GOLD.light, bgcolor: GOLD.faint },
};

const containedBtnSx = (active) => ({
  bgcolor: active ? GOLD.main : 'transparent',
  color:   active ? GOLD.bg   : GOLD.main,
  borderColor: GOLD.border,
  fontSize: 12,
  '&:hover': { bgcolor: active ? GOLD.light : GOLD.faint },
});

// ── Barre de contrôles (verticale, dans la right bar) ────────
function ControlsStrip() {
  const { isRunning, toggleRun, speed, setSpeed, cellSize, setCellSize } = useWB();
  const [moreAnchor, setMoreAnchor] = useState(null);

  return (
    <Box sx={{
      px: 1.5, py: 0.75, flexShrink: 0,
      borderBottom: `1px solid ${GOLD.border}`,
      bgcolor: GOLD.paper,
      display: 'flex', flexDirection: 'column', gap: 0.75,
    }}>
      {/* Ligne 1 : Play + Vitesse + More */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={isRunning ? 'Pause' : 'Démarrer'}>
          <Button variant="contained" size="small" onClick={toggleRun}
            sx={{
              minWidth: 36, px: 0.75,
              bgcolor: isRunning ? '#b45309' : '#15803d',
              '&:hover': { bgcolor: isRunning ? '#d97706' : '#16a34a' },
              fontWeight: 700, fontSize: 14,
            }}>
            {isRunning ? '⏸' : '▶'}
          </Button>
        </Tooltip>

        <ButtonGroup size="small" variant="outlined"
          sx={{ '& .MuiButtonGroup-grouped': { borderColor: GOLD.border } }}>
          {[1, 2, 3].map(v => (
            <Tooltip key={v} title={v === 1 ? 'Lent' : v === 2 ? 'Normal' : 'Rapide'}>
              <Button onClick={() => setSpeed(v)} sx={containedBtnSx(speed === v)}>
                {v === 1 ? '🐢' : v === 2 ? '🐇' : '⚡'}
              </Button>
            </Tooltip>
          ))}
        </ButtonGroup>

        <Box sx={{ flex: 1 }} />
        <Tooltip title="Plus d'options">
          <Button variant="outlined" size="small"
            onClick={e => setMoreAnchor(e.currentTarget)}
            sx={{ ...outlinedBtnSx, minWidth: 32, px: 0.75 }}>
            ⚙
          </Button>
        </Tooltip>
      </Box>

      {/* Ligne 2 : Zoom */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 11, color: GOLD.main, whiteSpace: 'nowrap' }}>
          🔍 {cellSize}px
        </Typography>
        <Slider size="small" min={6} max={48} step={2}
          value={cellSize} onChange={(_, v) => setCellSize(v)}
          sx={{ flex: 1, ...sliderSx }} />
      </Box>

      <MorePopover anchorEl={moreAnchor} onClose={() => setMoreAnchor(null)} />
    </Box>
  );
}

// ── VillageInfo ───────────────────────────────────────────────
function VillageInfo({ vid, em }) {
  if (!vid || !em) return null;
  const pos     = em.getComponent(vid, 'Position');
  const village = em.getComponent(vid, 'Village');
  if (!village) return null;
  const { stockpile, buildings, communityNeeds, currentPlan, gatherOrder } = village;
  const members = em.query('Inhabitant', 'Group')
    .filter(id => em.getComponent(id, 'Group').groupId === village.groupId);

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', p: 1.5, alignItems: 'flex-start' }}>
      {/* Identité */}
      <Box sx={{ minWidth: 120 }}>
        <Typography sx={{ ...sxLabel, mb: 0.5 }}>{village.groupId}</Typography>
        {pos && <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>({pos.x}, {pos.y})</Typography>}
        <Typography sx={{ fontSize: 12, color: GOLD.light, mt: 0.25 }}>{members.length} habitant(s)</Typography>
        <Box sx={{ mt: 0.75, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {currentPlan && (
            <Chip size="small"
              label={`🔨 ${currentPlan.label ?? currentPlan.buildingId} — ${
                Object.keys(currentPlan.missing ?? {}).length === 0
                  ? '✓ prêt'
                  : Object.entries(currentPlan.missing).map(([r,n])=>`${n} ${r}`).join(', ')
              }`}
              sx={{ bgcolor: 'rgba(180,83,9,0.3)', color: '#fbbf24', fontSize: 10, height: 20 }}
            />
          )}
          {gatherOrder && (
            <Chip size="small" label={`📦 Collecte: ${gatherOrder}`}
              sx={{ bgcolor: 'rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: 10, height: 20 }} />
          )}
          {!currentPlan && !gatherOrder && (
            <Chip size="small" label="😌 Stable"
              sx={{ bgcolor: GOLD.faint, color: GOLD.main, fontSize: 10, height: 20 }} />
          )}
        </Box>
      </Box>

      {/* Stockpile */}
      <Box sx={{ minWidth: 110 }}>
        <Typography sx={{ ...sxLabel, mb: 0.5 }}>Stockpile</Typography>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {Object.entries(stockpile).filter(([,v]) => v > 0).map(([k, v]) => (
            <Chip key={k} size="small" label={`${k}: ${Math.floor(v)}`}
              sx={{ bgcolor: GOLD.faint, color: GOLD.light, borderColor: GOLD.border,
                    fontSize: 10, height: 18 }} variant="outlined" />
          ))}
          {Object.values(stockpile).every(v => v === 0) &&
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>vide</Typography>}
        </Box>
      </Box>

      {/* Bâtiments */}
      <Box sx={{ minWidth: 110 }}>
        <Typography sx={{ ...sxLabel, mb: 0.5 }}>Bâtiments</Typography>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {Object.entries(buildings).map(([k, v]) => (
            <Chip key={k} size="small" label={`${k} ×${v}`}
              sx={{ bgcolor: 'rgba(34,197,94,0.15)', color: '#86efac',
                    borderColor: 'rgba(34,197,94,0.3)', fontSize: 10, height: 18 }} variant="outlined" />
          ))}
          {Object.keys(buildings).length === 0 &&
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>aucun</Typography>}
        </Box>
      </Box>

      {/* Besoins communautaires */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 140 }}>
        <Typography sx={{ ...sxLabel, mb: 0.25 }}>Besoins</Typography>
        <NeedBar label="Abri"         value={communityNeeds.shelter       ?? 0} color="#90caf9" />
        <NeedBar label="Nourriture"   value={communityNeeds.food_security ?? 0} color="#a5d6a7" />
        <NeedBar label="Communauté"   value={communityNeeds.community     ?? 0} color="#ffcc80" />
        <NeedBar label="Culture"      value={communityNeeds.culture       ?? 0} color="#f48fb1" />
        <NeedBar label="Connaissance" value={communityNeeds.knowledge     ?? 0} color="#ce93d8" />
        <NeedBar label="Commerce"     value={communityNeeds.commerce      ?? 0} color="#80cbc4" />
        <NeedBar label="Défense"      value={communityNeeds.defense       ?? 0} color="#ef9a9a" />
      </Box>
    </Box>
  );
}

// ── VillagePanel ──────────────────────────────────────────────
function VillagePanel() {
  const { tick, engineRef } = useWB();
  const em = engineRef.current?.em;
  const [selectedVid, setSelectedVid] = useState(null);

  if (!em) return null;
  const vids = em.query('Village');
  if (vids.length === 0) return (
    <Box sx={{ p: 1.5 }}>
      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Aucun village.</Typography>
    </Box>
  );

  const vid = selectedVid ?? vids[0];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 1.5, pt: 0.75 }}>
        <Select
          size="small"
          value={vid}
          onChange={e => setSelectedVid(e.target.value)}
          sx={{
            fontSize: 12, minWidth: 180,
            bgcolor: GOLD.faint, color: GOLD.light,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: GOLD.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: GOLD.main },
            '& .MuiSvgIcon-root': { color: GOLD.main },
          }}
        >
          {vids.map(id => {
            const v   = em.getComponent(id, 'Village');
            const pos = em.getComponent(id, 'Position');
            const n   = em.query('Inhabitant', 'Group')
              .filter(mid => em.getComponent(mid, 'Group').groupId === v?.groupId).length;
            return (
              <MenuItem key={id} value={id} sx={{ fontSize: 12 }}>
                {v?.groupId} — ({pos?.x},{pos?.y}) · {n} hab.
              </MenuItem>
            );
          })}
        </Select>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <VillageInfo vid={vid} em={em} key={`${vid}-${tick}`} />
      </Box>
    </Box>
  );
}

// ── SelectionPanel ────────────────────────────────────────────
function SelectionPanel() {
  const { selected, engineRef } = useWB();
  const em = engineRef.current?.em;

  if (selected === null || !em) {
    return (
      <Box sx={{ p: 1.5 }}>
        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
          Cliquez sur un habitant, un village ou une ressource.
        </Typography>
      </Box>
    );
  }

  const pos      = em.getComponent(selected, 'Position');
  const species  = em.getComponent(selected, 'Species');
  const res      = em.getComponent(selected, 'Resource');
  const age      = em.getComponent(selected, 'Age');
  const stats    = em.getComponent(selected, 'Stats');
  const needs    = em.getComponent(selected, 'Needs');
  const state    = em.getComponent(selected, 'State');
  const group    = em.getComponent(selected, 'Group');
  const village  = em.getComponent(selected, 'Village');
  const building = em.getComponent(selected, 'Building');

  if (village) return <VillageInfo vid={selected} em={em} />;

  if (building) {
    const hpPct = Math.round(((building.hp ?? 200) / (building.maxHp ?? 200)) * 100);
    const hpColor = hpPct > 60 ? '#4ade80' : hpPct > 25 ? '#fb923c' : '#f87171';
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', p: 1.5, alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Chip label={building.label ?? building.type} size="small"
            sx={{ bgcolor: 'rgba(34,197,94,0.2)', color: '#86efac', fontSize: 11 }} />
          <Chip label={`🏘 ${building.groupId}`} size="small"
            sx={{ bgcolor: GOLD.faint, color: GOLD.main, fontSize: 11 }} />
          {pos && <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>({pos.x}, {pos.y})</Typography>}
        </Box>
        <Box sx={{ minWidth: 130 }}>
          <Typography sx={{ fontSize: 10, color: GOLD.main, letterSpacing: 0.3 }}>
            PV <span style={{ color: hpColor, fontWeight: 700 }}>{building.hp ?? 200}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}> / {building.maxHp ?? 200}</span>
          </Typography>
          <LinearProgress variant="determinate" value={hpPct}
            sx={{ height: 6, borderRadius: 1, mt: 0.25,
                  bgcolor: 'rgba(255,255,255,0.08)',
                  '& .MuiLinearProgress-bar': { bgcolor: hpColor } }}
          />
          {hpPct < 50 && (
            <Typography sx={{ fontSize: 10, color: '#f87171', mt: 0.5 }}>⚔ Sous attaque</Typography>
          )}
        </Box>
      </Box>
    );
  }

  if (group) {
    const STATE_ICONS = { idle:'😴', moving:'🚶', resting:'💤', praying:'🙏', cultivating:'🌱', working:'⛏', gather:'🧺', return:'📦' };
    const stateKey   = state?.task?.action ?? state?.current ?? 'idle';
    const stateLabel = state
      ? `${STATE_ICONS[state.current] ?? ''} ${state.current}${state.task?.action ? ` › ${state.task.action}` : ''}${state.timer ? ` (${state.timer})` : ''}`
      : '—';
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', p: 1.5, alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 110 }}>
          <Chip
            label={group.role === 'chief' ? '👑 Chef' : group.role}
            size="small"
            sx={group.role === 'chief'
              ? { bgcolor: 'rgba(201,168,76,0.3)', color: GOLD.light, fontSize: 11 }
              : { bgcolor: 'rgba(255,255,255,0.08)', color: '#ccc', fontSize: 11 }}
          />
          <Chip label={`Groupe ${group.groupId}`} size="small"
            sx={{ bgcolor: GOLD.faint, color: GOLD.main, fontSize: 11 }} />
          <Chip label={stateLabel} size="small"
            sx={{ bgcolor: 'rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: 11 }} />
          {pos && <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>({pos.x}, {pos.y})</Typography>}
          {age && (
            <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
              Âge {Math.floor(age.age)}/{age.maxAge}
            </Typography>
          )}
          {state?.target && (
            <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
              → ({state.target.x}, {state.target.y})
            </Typography>
          )}
        </Box>

        {needs && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 130 }}>
            <Typography sx={{ ...sxLabel, mb: 0.25 }}>Besoins</Typography>
            <NeedBar label="Faim"    value={needs.hunger}      color="#fb923c" />
            <NeedBar label="Énergie" value={needs.energy}      color="#4ade80" />
            <NeedBar label="Social"  value={needs.social}      color="#60a5fa" />
            <NeedBar label="Foi"     value={needs.foi ?? 0}    color="#fbbf24" />
          </Box>
        )}

        {stats && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 130 }}>
            <Typography sx={{ ...sxLabel, mb: 0.25 }}>Stats</Typography>
            <NeedBar label="Force"        value={stats.force}        color="#f87171" />
            <NeedBar label="Intelligence" value={stats.intelligence} color="#c084fc" />
            <NeedBar label="Charme"       value={stats.charme}       color="#f472b6" />
            <NeedBar label="Perception"   value={stats.perception}   color="#22d3ee" />
          </Box>
        )}
      </Box>
    );
  }

  // Ressource
  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', p: 1.5, alignItems: 'flex-start' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {species && <Chip label={species.type} size="small"
          sx={{ bgcolor: GOLD.faint, color: GOLD.main, fontSize: 11 }} />}
        {res && <Chip label={res.type} size="small"
          sx={{ bgcolor: 'rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: 11 }} />}
        {pos && <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>({pos.x}, {pos.y})</Typography>}
        {age && <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Âge {Math.floor(age.age)}/{age.maxAge}</Typography>}
        {res?.reserve != null && (
          <Box sx={{ minWidth: 110, mt: 0.25 }}>
            <Typography sx={{ fontSize: 10, color: GOLD.main }}>
              Réserve <span style={{ color: res.reserve <= 5 ? '#fb923c' : '#4ade80', fontWeight: 700 }}>
                {res.reserve}
              </span>/{res.maxReserve ?? 20}
            </Typography>
            <LinearProgress variant="determinate"
              value={Math.round((res.reserve / (res.maxReserve ?? 20)) * 100)}
              sx={{ height: 4, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.08)',
                    '& .MuiLinearProgress-bar': { bgcolor: res.reserve <= 5 ? '#fb923c' : '#4ade80' } }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Layout principal ──────────────────────────────────────────
export function WBInner() {
  const [tab, setTab] = useState(0);
  const { selected } = useWB();
  const calibrating = tab === 3;

  const prevSelected = useRef(null);
  if (selected !== null && selected !== prevSelected.current) {
    prevSelected.current = selected;
    if (tab !== 1) setTab(1);
  }
  if (selected === null) prevSelected.current = null;

  const tabsSx = {
    minHeight: 36,
    bgcolor: GOLD.paper,
    borderBottom: `1px solid ${GOLD.border}`,
    '& .MuiTab-root': {
      minHeight: 36, py: 0.5, fontSize: 16, minWidth: 0,
      color: 'rgba(243, 239, 120, 0.45)',
      '&.Mui-selected': { color: GOLD.light },
    },
    '& .MuiTabs-indicator': { bgcolor: GOLD.main, height: 2 },
  };

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'row', bgcolor: GOLD.bg }}>

      {/* Zone canvas / calibrateur */}
      {!calibrating && (
        <Box sx={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          <WBCanvas />
        </Box>
      )}
      {calibrating && (
        <Box sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <WBCalibrator />
        </Box>
      )}

      {/* Right bar */}
      <Box sx={{
        width: RIGHT_W, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        borderLeft: `1px solid ${GOLD.border}`,
        bgcolor: GOLD.paper,
      }}>
        {!calibrating && <ControlsStrip />}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={tabsSx}>
          <Tooltip title="Statistiques"  placement="bottom"><Tab label="📊" /></Tooltip>
          <Tooltip title="Sélection"     placement="bottom"><Tab label="🎯" /></Tooltip>
          <Tooltip title="Villages"      placement="bottom"><Tab label="🏘" /></Tooltip>
          {/* debug: <Tooltip title="Calibration" placement="bottom"><Tab label="🎨" /></Tooltip> */}
        </Tabs>

        {!calibrating && (
          <Box sx={{ flex: 1, overflow: 'auto', bgcolor: GOLD.bg }}>
            {tab === 0 && <StatsPanel />}
            {tab === 1 && <SelectionPanel />}
            {tab === 2 && <VillagePanel />}
          </Box>
        )}
      </Box>
    </Box>
  );
}
