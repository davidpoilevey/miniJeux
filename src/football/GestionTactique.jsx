import { useState } from 'react';
import { TACTICS } from './engine/tactics';
import { FORMATIONS, DEFAULT_FORMATION } from './data/formations';
import { MY_SQUAD } from './data/roster';

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  surface:          '#131313',
  surfaceLow:       '#1b1b1b',
  surfaceContainer: '#1f1f1f',
  surfaceHigh:      '#2a2a2a',
  surfaceHighest:   '#353535',
  primary:          '#56e472',
  primaryDark:      '#34c759',
  secondary:        '#adc6ff',
  secondaryBg:      '#4b8eff',
  onPrimary:        '#003911',
  onSecondary:      '#00285c',
  onSurface:        '#e2e2e2',
  muted:            '#bccbb8',
  white10:          'rgba(255,255,255,0.10)',
  white15:          'rgba(255,255,255,0.15)',
};

const FONT = {
  headline: "'Space Grotesk', sans-serif",
  body:     "'Manrope', sans-serif",
  label:    "'Lexend', sans-serif",
};

const GRADIENT = `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`;

// ─── Role → visual ────────────────────────────────────────────────────────────

const ROLE_VIS = {
  gk:  { color: '#34C759', label: 'GK', size: 18 },
  def: { color: '#4b8eff', label: 'DEF', size: 15 },
  mid: { color: '#FFD60A', label: 'MID', size: 15 },
  fwd: { color: '#FF3B30', label: 'FWD', size: 15 },
};

// ─── Tactic aggressiveness score (pour le visuel) ─────────────────────────────
// Basé sur forwardPush withBall : -0.55 → 0 → +0.40

function aggroScore(tactic) {
  return tactic.withBall.forwardPush;  // -0.55 ... +0.40
}

// Normalise aggroScore dans [0, 1] sur la plage observée
const AGGRO_MIN = -0.55;
const AGGRO_MAX = 0.40;
function aggroNorm(t) {
  return (aggroScore(t) - AGGRO_MIN) / (AGGRO_MAX - AGGRO_MIN);
}

// Couleur de l'indicateur : bleu (défensif) → vert (offensif)
function aggroColor(t) {
  const n = aggroNorm(t);
  if (n < 0.40) return C.secondary;   // défensif → bleu
  if (n < 0.60) return '#FFD60A';     // neutre → jaune
  return C.primary;                   // offensif → vert
}

// ─── Pitch SVG ────────────────────────────────────────────────────────────────
// Accepte `tactic` pour afficher le décalage de position basé sur
// withoutBall.forwardPush — même formule que l'engine :
//   homeX = clamp(bx + forwardPush * FW, ...)
// En espace normalisé : nx_tactique = clamp(nx + forwardPush, 0, 1)

function PitchSVG({ formation, tactic }) {
  const W      = 560;          // viewBox width
  const H      = 360;          // viewBox height
  const PAD    = 20;           // inner padding
  const FW_SVG = W - PAD * 2; // 520 — équivalent de FW dans l'engine
  const FH_SVG = H - PAD * 2;

  // forwardPush de la tactique courante (sans balle = position de base)
  const fp = tactic?.withoutBall?.forwardPush ?? 0;
  const hasShift = Math.abs(fp) > 0.02;

  // Calcule le shiftPx clamped pour un joueur (sauf GK)
  function getShift(p) {
    if (p.role === 'gk') return 0;
    const cxBase    = PAD + p.nx * FW_SVG;
    const cxTactic  = Math.min(Math.max(cxBase + fp * FW_SVG, PAD + 9), W - PAD - 9);
    return cxTactic - cxBase;
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Définitions (marqueurs flèche) ── */}
      <defs>
        {Object.entries(ROLE_VIS).map(([role, v]) => (
          <marker key={role}
            id={`arrow-${role}`}
            markerWidth="5" markerHeight="5"
            refX="4" refY="2.5" orient="auto"
          >
            <path d="M0,0 L0,5 L5,2.5 z" fill={v.color} opacity="0.45"/>
          </marker>
        ))}
      </defs>

      {/* ── Fond gazon ── */}
      <rect width={W} height={H} fill="#1a2e1a" rx="10"/>

      {/* Texture bandes alternées */}
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <rect key={i}
          x={PAD + i * (FW_SVG / 10)} y={PAD}
          width={FW_SVG / 10} height={FH_SVG}
          fill={i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}
        />
      ))}

      {/* ── Lignes du terrain ── */}
      <g stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none">
        <rect x={PAD} y={PAD} width={FW_SVG} height={FH_SVG} rx="2"/>
        <line x1={W/2} y1={PAD} x2={W/2} y2={H - PAD}/>
        <circle cx={W/2} cy={H/2} r={50}/>
        <circle cx={W/2} cy={H/2} r={2} fill="rgba(255,255,255,0.2)" stroke="none"/>
        <rect x={PAD}           y={H/2 - 72} width={80} height={144}/>
        <rect x={W - PAD - 80} y={H/2 - 72} width={80} height={144}/>
        <rect x={PAD}           y={H/2 - 32} width={30} height={64}/>
        <rect x={W - PAD - 30} y={H/2 - 32} width={30} height={64}/>
        <rect x={PAD - 10}     y={H/2 - 20} width={10} height={40} strokeOpacity={0.5}/>
        <rect x={W - PAD}      y={H/2 - 20} width={10} height={40} strokeOpacity={0.5}/>
        <path d={`M ${PAD + 80} ${H/2 - 25} A 40 40 0 0 1 ${PAD + 80} ${H/2 + 25}`} strokeOpacity={0.4}/>
        <path d={`M ${W-PAD-80} ${H/2 - 25} A 40 40 0 0 0 ${W-PAD-80} ${H/2 + 25}`} strokeOpacity={0.4}/>
      </g>

      {/* ── Couche fantôme : position de base + flèches de déplacement ── */}
      {hasShift && formation.players.map((p, i) => {
        if (p.role === 'gk') return null;
        const vis       = ROLE_VIS[p.role] ?? ROLE_VIS.mid;
        const cx        = PAD + p.nx * FW_SVG;
        const cy        = PAD + p.ny * FH_SVG;
        const shift     = getShift(p);
        const cxTactic  = cx + shift;
        const arrowPad  = shift > 0 ? -4 : 4; // recule la pointe du trait

        return (
          <g key={`ghost-${i}`} opacity={0.4} style={{ pointerEvents: 'none' }}>
            {/* Cercle fantôme (position de base) */}
            <circle cx={cx} cy={cy} r={vis.size * 0.72}
              fill="none" stroke={vis.color} strokeWidth="1.2"
              strokeDasharray="3,2.5"
            />
            {/* Trait directionnel */}
            {Math.abs(shift) > 8 && (
              <line
                x1={cx + (shift > 0 ? vis.size * 0.8 : -vis.size * 0.8)} y1={cy}
                x2={cxTactic + arrowPad}                                   y2={cy}
                stroke={vis.color} strokeWidth="1"
                strokeDasharray="4,3"
                markerEnd={`url(#arrow-${p.role})`}
              />
            )}
          </g>
        );
      })}

      {/* ── Couche joueurs : position tactique animée ── */}
      {formation.players.map((p, i) => {
        const vis   = ROLE_VIS[p.role] ?? ROLE_VIS.mid;
        const cx    = PAD + p.nx * FW_SVG;
        const cy    = PAD + p.ny * FH_SVG;
        const r     = vis.size;
        const shift = getShift(p);

        return (
          <g key={`player-${i}`}
            style={{
              transform:  `translateX(${shift}px)`,
              transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
              cursor: 'pointer',
            }}
          >
            {/* Halo */}
            <circle cx={cx} cy={cy} r={r + 5} fill={vis.color} opacity={0.15}/>
            {/* Corps */}
            <circle cx={cx} cy={cy} r={r}
              fill={vis.color} stroke="rgba(255,255,255,0.25)" strokeWidth="2"
            />
            {/* Numéro */}
            <text x={cx} y={cy + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={p.role === 'mid' ? '#000' : '#fff'}
              fontSize={r * 0.75} fontFamily={FONT.headline} fontWeight="700"
            >
              {i + 1}
            </text>
            {/* Label rôle */}
            <text x={cx} y={cy + r + 9}
              textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize="7" fontFamily={FONT.label} fontWeight="700"
              style={{ pointerEvents: 'none' }}
            >
              {vis.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Tactic card ──────────────────────────────────────────────────────────────

function TacticCard({ id, tactic, isActive, isPending, onClick }) {
  const aggro  = aggroNorm(tactic);
  const color  = aggroColor(tactic);
  const active = isActive || isPending;

  return (
    <button
      onClick={() => onClick(id)}
      style={{
        background:  active ? `${color}18` : C.surfaceContainer,
        border:      `1px solid ${active ? color : C.white10}`,
        borderRadius: '10px',
        padding:     '12px 8px',
        cursor:      'pointer',
        display:     'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        transition:  'all 0.15s',
        position:    'relative',
        overflow:    'hidden',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.surfaceHigh; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = C.surfaceContainer; }}
    >
      {/* Key shortcut badge */}
      <div style={{
        position: 'absolute', top: 6, right: 6,
        background: active ? color : C.surfaceHighest,
        color:      active ? (tactic.key === 'g' ? '#003911' : C.onPrimary) : C.muted,
        fontFamily: FONT.label, fontSize: '9px', fontWeight: 700,
        padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase',
      }}>
        {tactic.key}
      </div>

      {/* Aggressiveness dot */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: color,
        boxShadow: active ? `0 0 8px ${color}` : 'none',
      }}/>

      {/* Label */}
      <div style={{
        fontFamily: FONT.headline, fontSize: '11px', fontWeight: 700,
        color: active ? color : C.onSurface, textAlign: 'center',
        lineHeight: 1.2,
      }}>
        {tactic.label}
      </div>

      {/* Aggro bar */}
      <div style={{ width: '80%', height: 3, background: C.surfaceHighest, borderRadius: 2 }}>
        <div style={{
          width: `${aggro * 100}%`, height: '100%',
          background: color, borderRadius: 2,
          transition: 'width 0.3s',
        }}/>
      </div>
    </button>
  );
}

// ─── Tactic detail panel ──────────────────────────────────────────────────────

function TacticDetail({ id, tactic }) {
  if (!tactic) return null;

  const flags = [
    tactic.stealBonus && { key: 'stealBonus', label: 'Tacle bonus', color: '#FF9F0A' },
    tactic.holdBall   && { key: 'holdBall',   label: 'Conservation', color: C.secondary },
    tactic.cross      && { key: 'cross',      label: 'Centre aile',  color: C.primary   },
    tactic.markOpp    && { key: 'markOpp',    label: 'Marquage indiv.', color: '#FF3B30' },
  ].filter(Boolean);

  function ParamRow({ label, withBall, withoutBall, min, max, color = C.primary }) {
    const normW  = (withBall    - min) / (max - min);
    const normWo = (withoutBall - min) / (max - min);
    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontFamily: FONT.label, fontSize: '9px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
          <span style={{ fontFamily: FONT.label, fontSize: '9px', color: C.muted }}>
            <span style={{ color }}>{withBall > 0 ? '+' : ''}{withBall.toFixed(2)}</span>
            {' / '}
            <span style={{ color: C.secondary, opacity: 0.7 }}>{withoutBall > 0 ? '+' : ''}{withoutBall.toFixed(2)}</span>
          </span>
        </div>
        {/* withBall bar */}
        <div style={{ height: 4, background: C.surfaceHighest, borderRadius: 2, marginBottom: 3, position: 'relative' }}>
          {/* Zero marker */}
          {min < 0 && (
            <div style={{ position: 'absolute', left: `${(-min/(max-min))*100}%`, top: -1, bottom: -1, width: 1, background: C.white10 }}/>
          )}
          <div style={{
            position: 'absolute',
            left:  min < 0 ? `${(-min/(max-min))*100}%` : '0%',
            width: `${Math.abs(normW - (min < 0 ? -min/(max-min) : 0)) * 100}%`,
            height: '100%', background: color, borderRadius: 2,
            ...(withBall < 0 && min < 0 ? { left: `${normW*100}%`, width: `${(-min/(max-min) - normW) * 100}%` } : {}),
          }}/>
        </div>
        {/* withoutBall bar, dimmer */}
        <div style={{ height: 3, background: C.surfaceHighest, borderRadius: 2, position: 'relative', opacity: 0.5 }}>
          {min < 0 && (
            <div style={{ position: 'absolute', left: `${(-min/(max-min))*100}%`, top: -1, bottom: -1, width: 1, background: C.white10 }}/>
          )}
          <div style={{
            position: 'absolute',
            left:  min < 0 ? `${(-min/(max-min))*100}%` : '0%',
            width: `${Math.abs(normWo - (min < 0 ? -min/(max-min) : 0)) * 100}%`,
            height: '100%', background: C.secondary, borderRadius: 2,
            ...(withoutBall < 0 && min < 0 ? { left: `${normWo*100}%`, width: `${(-min/(max-min) - normWo) * 100}%` } : {}),
          }}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: C.surfaceLow,
      borderRadius: '10px',
      padding: '14px',
      borderLeft: `3px solid ${aggroColor(tactic)}`,
      marginTop: '12px',
    }}>
      <div style={{ fontFamily: FONT.label, fontSize: '9px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        Paramètres — <span style={{ color: aggroColor(tactic) }}>{tactic.label}</span>
        <span style={{ opacity: 0.5 }}> (vert = avec balle / bleu = sans)</span>
      </div>

      <ParamRow
        label="Position avant (forwardPush)"
        withBall={tactic.withBall.forwardPush}
        withoutBall={tactic.withoutBall.forwardPush}
        min={-0.55} max={0.40}
        color={aggroColor(tactic)}
      />
      <ParamRow
        label="Attraction ballon (ballW)"
        withBall={tactic.withBall.ballW}
        withoutBall={tactic.withoutBall.ballW}
        min={0} max={1}
        color={C.primary}
      />
      <ParamRow
        label="Vitesse (speedMul)"
        withBall={tactic.withBall.speedMul}
        withoutBall={tactic.withoutBall.speedMul}
        min={0.5} max={1.7}
        color={C.secondary}
      />

      {flags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          {flags.map(f => (
            <span key={f.key} style={{
              background: `${f.color}20`, color: f.color,
              fontFamily: FONT.label, fontSize: '9px', fontWeight: 700,
              padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase',
            }}>
              {f.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * GestionTactique
 *
 * Props (optionnel) :
 *   activeTactic     {string}  ID tactique actif en jeu  (ex: 'attack')
 *   activeFormation  {string}  ID formation active       (ex: '4-4-2')
 *   onConfirm        {fn}      (tacticId, formationId) → appelé au clic Confirmer
 *   squad            {Array}   liste joueurs pour les noms sur le terrain
 */
export default function GestionTactique({
  activeTactic    = 'attack',
  activeFormation = DEFAULT_FORMATION,
  onConfirm,
  squad,
}) {
  const [pendingTactic,    setPendingTactic]    = useState(activeTactic);
  const [pendingFormation, setPendingFormation] = useState(activeFormation);

  const isDirty = pendingTactic !== activeTactic || pendingFormation !== activeFormation;
  const currentFormation = FORMATIONS[pendingFormation] ?? FORMATIONS[DEFAULT_FORMATION];
  const currentTactic    = TACTICS[pendingTactic];

  function handleConfirm() {
    onConfirm?.(pendingTactic, pendingFormation);
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>
      <div style={{
        maxWidth: '1440px', margin: '0 auto',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '16px',
        height: 'calc(100vh - 160px)',
        minHeight: '500px',
      }}>

        {/* ── Panneau gauche : gestion ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>

          {/* Header */}
          <div style={{
            background: C.surfaceContainer,
            borderRadius: '12px',
            padding: '16px',
          }}>
            <h2 style={{
              fontFamily: FONT.headline, fontSize: '16px', fontWeight: 700,
              color: C.primary, textTransform: 'uppercase', margin: '0 0 16px',
              borderLeft: `4px solid ${C.primary}`, paddingLeft: '10px',
            }}>
              Management
            </h2>

            {/* Sélecteur formation */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontFamily: FONT.label, fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                Formation Active
              </label>
              <select
                value={pendingFormation}
                onChange={e => setPendingFormation(e.target.value)}
                style={{
                  width: '100%',
                  background: C.surfaceHighest, color: C.onSurface,
                  border: 'none', borderRadius: '8px',
                  padding: '10px 14px',
                  fontFamily: FONT.body, fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {Object.entries(FORMATIONS).map(([id, f]) => (
                  <option key={id} value={id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Bouton confirmer */}
            <button
              onClick={handleConfirm}
              disabled={!isDirty}
              style={{
                width: '100%',
                background: isDirty ? GRADIENT : C.surfaceHighest,
                color:      isDirty ? C.onPrimary : C.muted,
                fontFamily: FONT.headline, fontWeight: 700, fontSize: '13px',
                padding: '14px',
                borderRadius: '8px', border: 'none',
                cursor: isDirty ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                transition: 'all 0.2s',
                boxShadow: isDirty ? `0 4px 16px rgba(86,228,114,0.2)` : 'none',
              }}
            >
              {isDirty ? 'Confirmer Tactique' : 'Tactique Active'}
            </button>
          </div>

          {/* Grille des tactiques */}
          <div style={{ background: C.surfaceContainer, borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontFamily: FONT.label, fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Choisir une Tactique
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.entries(TACTICS).map(([id, t]) => (
                <TacticCard
                  key={id}
                  id={id}
                  tactic={t}
                  isActive={id === activeTactic}
                  isPending={id === pendingTactic && id !== activeTactic}
                  onClick={setPendingTactic}
                />
              ))}
            </div>

            {/* Détail de la tactique sélectionnée */}
            {currentTactic && (
              <TacticDetail id={pendingTactic} tactic={currentTactic} />
            )}
          </div>
        </aside>

        {/* ── Terrain SVG ── */}
        <section style={{
          background: '#0e1a0e',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          border: `3px solid ${C.surfaceHighest}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PitchSVG formation={currentFormation} tactic={currentTactic} />

          {/* Overlay bas gauche : légende rôles */}
          <div style={{
            position: 'absolute', bottom: 16, left: 16,
            background: 'rgba(19,19,19,0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '10px',
            padding: '10px 14px',
            border: `1px solid ${C.white10}`,
            display: 'flex', gap: '16px', alignItems: 'center',
          }}>
            {Object.entries(ROLE_VIS).map(([role, v]) => (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color }}/>
                <span style={{ fontFamily: FONT.label, fontSize: '9px', color: C.onSurface, textTransform: 'uppercase' }}>
                  {v.label}
                </span>
              </div>
            ))}
          </div>

          {/* Overlay bas droit : formation active */}
          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            background: 'rgba(19,19,19,0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '10px',
            padding: '10px 16px',
            border: `1px solid ${C.white10}`,
            display: 'flex', gap: '20px', alignItems: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: FONT.headline, fontSize: '18px', fontWeight: 700, color: C.primary }}>
                {pendingFormation}
              </div>
              <div style={{ fontFamily: FONT.label, fontSize: '8px', color: C.muted, textTransform: 'uppercase' }}>
                Formation
              </div>
            </div>
            <div style={{ width: 1, height: 28, background: C.white10 }}/>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: FONT.headline, fontSize: '13px', fontWeight: 700, color: aggroColor(currentTactic) }}>
                {currentTactic?.label ?? '—'}
              </div>
              <div style={{ fontFamily: FONT.label, fontSize: '8px', color: C.muted, textTransform: 'uppercase' }}>
                Tactique
              </div>
            </div>
          </div>

          {/* Indicateur "modifié" */}
          {isDirty && (
            <div style={{
              position: 'absolute', top: 16, right: 16,
              background: `rgba(86,228,114,0.15)`,
              border: `1px solid ${C.primary}`,
              borderRadius: '20px',
              padding: '4px 12px',
              fontFamily: FONT.label, fontSize: '10px', fontWeight: 700,
              color: C.primary, textTransform: 'uppercase',
            }}>
              Non confirmé
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
