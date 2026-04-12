import { useState } from 'react';
import { MY_SQUAD, TRANSFER_MARKET } from './data/roster';
import TransfertDialog from './TransfertDialog';

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
  white5:           'rgba(255,255,255,0.05)',
  black60:          'rgba(0,0,0,0.6)',
};

const FONT = {
  headline: "'Space Grotesk', sans-serif",
  body:     "'Manrope', sans-serif",
  label:    "'Lexend', sans-serif",
};

const GRADIENT = `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`;

// ─── Role badge colors ────────────────────────────────────────────────────────

const ROLE_BADGE = {
  gk:  { bg: C.primary,      color: C.onPrimary  },
  def: { bg: C.secondary,    color: C.onSecondary },
  mid: { bg: C.primary,      color: C.onPrimary  },
  fwd: { bg: C.primary,      color: C.onPrimary  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBox({ label, value }) {
  return (
    <div style={{
      background: C.surfaceHighest,
      padding: '12px',
      borderRadius: '8px',
      borderBottom: `2px solid ${C.primary}`,
    }}>
      <div style={{ fontFamily: FONT.label, fontSize: '10px', color: C.secondary, opacity: 0.6, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT.headline, fontWeight: 700, fontSize: '24px', color: C.onSurface }}>
        {value}
      </div>
    </div>
  );
}

function PlayerRow({ player, isSelected, onClick }) {
  const badge = ROLE_BADGE[player.role] || ROLE_BADGE.mid;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        background: isSelected ? C.surfaceHighest : C.surfaceLow,
        cursor: 'pointer',
        transition: 'background 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = C.surfaceHighest; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = C.surfaceLow; }}
    >
      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          {/* Initials avatar */}
          <div style={{
            width: 48, height: 48, borderRadius: '8px',
            background: C.surfaceHigh,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: FONT.headline, fontWeight: 700, fontSize: '14px', color: C.primary }}>
              {player.name.split('.')[0]?.trim() || player.name[0]}
            </span>
          </div>
          {/* Role badge */}
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            background: badge.bg, color: badge.color,
            fontSize: '10px', fontFamily: FONT.label, fontWeight: 700,
            padding: '1px 4px', borderRadius: '3px',
          }}>
            {player.roleCode}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: FONT.headline, fontWeight: 700, fontSize: '18px', lineHeight: 1.2 }}>
            {player.name}
          </div>
          <div style={{ fontFamily: FONT.label, fontSize: '10px', color: C.secondary, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>
            {player.roleLabel}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FONT.label, fontSize: '10px', color: C.secondary, opacity: 0.5 }}>FORME</div>
          <div style={{ fontFamily: FONT.headline, fontWeight: 700, color: C.primary }}>{player.forme}%</div>
        </div>
        <div style={{
          width: 40, height: 40,
          background: GRADIENT,
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT.headline, fontWeight: 800, fontSize: '18px',
          color: C.onPrimary,
        }}>
          {player.overall}
        </div>
      </div>
    </div>
  );
}

function MarketCard({ player, onNegociate }) {
  return (
    <div style={{
      background: C.surfaceContainer,
      borderRadius: '12px',
      borderLeft: `4px solid rgba(75,142,255,0.45)`,
      overflow: 'hidden',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = C.surfaceHigh}
      onMouseLeave={e => e.currentTarget.style.background = C.surfaceContainer}
    >
      {/* Top : identité + OVR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 14px 10px' }}>
        <div style={{
          width: 42, height: 42,
          background: C.surfaceHighest,
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={C.secondary}>
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT.headline, fontWeight: 700, fontSize: '15px', color: C.onSurface, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {player.name}
          </div>
          <div style={{ fontFamily: FONT.label, fontSize: '10px', color: C.muted, marginTop: '1px' }}>
            {player.roleLabel}
          </div>
        </div>
        {/* OVR badge */}
        <div style={{
          background: 'linear-gradient(135deg, #56e472, #34c759)',
          color: C.onPrimary,
          fontFamily: FONT.headline, fontWeight: 800, fontSize: '15px',
          width: 38, height: 38, borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {player.overall}
        </div>
      </div>

      {/* Prix */}
      <div style={{ padding: '0 14px 12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontFamily: FONT.headline, fontSize: '22px', fontWeight: 700, color: C.primary }}>
          ${player.price}M
        </span>
        <span style={{ fontFamily: FONT.label, fontSize: '10px', color: C.muted }}>
          + 5% commission
        </span>
      </div>

      {/* Bouton Négocier — pleine largeur, bien visible */}
      <button
        onClick={() => onNegociate(player)}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, rgba(75,142,255,0.22), rgba(75,142,255,0.10))',
          borderTop: `1px solid rgba(75,142,255,0.2)`,
          color: C.secondary,
          fontFamily: FONT.label, fontWeight: 700, fontSize: '12px',
          padding: '12px',
          border: 'none', cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(75,142,255,0.30)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(75,142,255,0.22), rgba(75,142,255,0.10))'; e.currentTarget.style.color = C.secondary; }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
        </svg>
        Négocier le transfert
      </button>
    </div>
  );
}

function PlayerDetail({ player }) {
  if (!player) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '32px', textAlign: 'center',
        color: C.muted, opacity: 0.4, minHeight: '300px',
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '16px' }}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <p style={{ fontFamily: FONT.label, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Sélectionne un joueur
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: C.surfaceHigh,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      border: `1px solid ${C.white5}`,
    }}>
      {/* Banner */}
      <div style={{
        height: 144,
        position: 'relative',
        background: `linear-gradient(135deg, ${C.surfaceContainer} 0%, ${C.surface} 100%)`,
        overflow: 'hidden',
      }}>
        {/* Decorative pitch circle */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 96, height: 96, borderRadius: '50%',
          border: `2px solid rgba(86,228,114,0.1)`,
          pointerEvents: 'none',
        }}/>
        {/* Fade overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to top, ${C.surfaceHigh}, transparent)`,
        }}/>
        {/* Name */}
        <div style={{ position: 'absolute', bottom: 16, left: 24 }}>
          <div style={{ fontFamily: FONT.label, fontSize: '10px', color: C.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>
            Détails du Joueur
          </div>
          <h3 style={{ fontFamily: FONT.headline, fontSize: '28px', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
            {player.name}
          </h3>
        </div>
        {/* Overall badge */}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          width: 52, height: 52, borderRadius: '10px',
          background: GRADIENT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT.headline, fontWeight: 800, fontSize: '22px',
          color: C.onPrimary,
        }}>
          {player.overall}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <StatBox label="Tir"     value={player.stats.tir} />
          <StatBox label="Passe"   value={player.stats.passe} />
          <StatBox label="Vitesse" value={player.stats.vitesse} />
          <StatBox label="Forme"   value={`${player.stats.forme}%`} />
        </div>

        {/* Tactic roles */}
        {player.tacticRoles?.length > 0 && (
          <div>
            <div style={{ fontFamily: FONT.label, fontSize: '10px', color: C.secondary, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Rôle Tactique
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {player.tacticRoles.map(r => (
                <span key={r} style={{
                  background: '#d8e2ff', color: '#001a41',
                  padding: '4px 12px', borderRadius: '20px',
                  fontFamily: FONT.label, fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase',
                }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        {player.estimatedPrice != null && (
          <div>
            <div style={{ fontFamily: FONT.label, fontSize: '10px', color: C.secondary, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Prix Estimé
            </div>
            <div style={{ fontFamily: FONT.headline, fontSize: '20px', fontWeight: 700, color: C.primary }}>
              ${player.estimatedPrice}M
            </div>
          </div>
        )}

        {/* CTA */}
        <button style={{
          width: '100%',
          background: GRADIENT,
          color: C.onPrimary,
          fontFamily: FONT.headline, fontWeight: 700, fontSize: '14px',
          padding: '12px',
          borderRadius: '12px',
          border: 'none', cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          boxShadow: `0 8px 24px rgba(86,228,114,0.2)`,
          transition: 'transform 0.1s',
        }}>
          Assigner Tactique
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GestionJoueurs({ squad = MY_SQUAD, market = TRANSFER_MARKET, budget, onTransfer }) {
  const [selectedId,   setSelectedId]   = useState(squad[0]?.id ?? null);
  const [dialogPlayer, setDialogPlayer] = useState(null);   // joueur en cours de négociation

  const selected = squad.find(p => p.id === selectedId) ?? null;

  function handleAccept(player) {
    onTransfer?.(player);   // callback vers le parent pour déduire le budget, etc.
    setDialogPlayer(null);
  }

  return (
    <>
    <div style={{ overflowY: 'auto', paddingBottom: '16px', flex: 1, position: 'relative' }}>
      <div style={{
        padding: '0 16px',
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '32px',
        marginTop: '24px',
      }}>

        {/* ── Left column ── */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Mon Effectif */}
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: FONT.headline, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0 }}>
                Mon Effectif
              </h2>
              <span style={{ fontFamily: FONT.label, fontSize: '11px', color: C.secondary, opacity: 0.6 }}>
                {squad.length} JOUEURS
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {squad.map(p => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  isSelected={p.id === selectedId}
                  onClick={() => setSelectedId(p.id)}
                />
              ))}
            </div>
          </section>

          {/* Marché des transferts */}
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: FONT.headline, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0 }}>
                Marché des Transferts
              </h2>
              <span style={{ fontFamily: FONT.label, fontSize: '11px', color: C.primary, fontWeight: 700, cursor: 'pointer' }}>
                TOUT VOIR
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {market.map(p => (
                <MarketCard key={p.id} player={p} onNegociate={setDialogPlayer} />
              ))}
            </div>
          </section>
        </div>

        {/* ── Right column: detail panel ── */}
        <aside style={{ gridColumn: 'span 4', position: 'sticky', top: '112px', alignSelf: 'start' }}>
          <PlayerDetail player={selected} />
        </aside>
      </div>
    </div>

    {/* ── Dialog de transfert ── */}
    {dialogPlayer && (
      <TransfertDialog
        player={dialogPlayer}
        budget={budget}
        onAccept={handleAccept}
        onRefuse={() => setDialogPlayer(null)}
      />
    )}
    </>
  );
}
