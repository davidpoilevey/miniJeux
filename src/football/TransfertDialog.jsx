// ─── TransfertDialog ──────────────────────────────────────────────────────────
// Modale de négociation de transfert.
// S'affiche par-dessus GestionJoueurs avec backdrop-blur sur le fond.
//
// Props :
//   player    {object}   joueur du marché (TRANSFER_MARKET shape)
//   budget    {number}   budget disponible (optionnel, pour validation)
//   onAccept  {fn}       (player) → transfert accepté
//   onRefuse  {fn}       ()       → offre refusée / fermée

const C = {
  surface:          '#131313',
  surfaceLow:       '#1b1b1b',
  surfaceLowest:    '#0e0e0e',
  surfaceContainer: '#1f1f1f',
  surfaceHigh:      '#2a2a2a',
  surfaceHighest:   '#353535',
  primary:          '#56e472',
  primaryDark:      '#34c759',
  secondary:        '#adc6ff',
  secondaryBg:      '#4b8eff',
  onPrimary:        '#003911',
  onSurface:        '#e2e2e2',
  muted:            '#bccbb8',
  error:            '#ffb4ab',
  errorBg:          '#93000a',
  outlineVariant:   '#3d4a3c',
};

const FONT = {
  headline: "'Space Grotesk', sans-serif",
  body:     "'Manrope', sans-serif",
  label:    "'Lexend', sans-serif",
};

const GRADIENT = `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`;

const ROLE_LABEL = { gk: 'GK', def: 'DEF', mid: 'MID', fwd: 'ATT' };

// ─── Icônes SVG ───────────────────────────────────────────────────────────────

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.18-7.18 1.41 1.41L10 16.5z"/>
  </svg>
);

const IconRefuse = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
  </svg>
);

const IconTransfer = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
  </svg>
);

// ─── Composant principal ──────────────────────────────────────────────────────

export default function TransfertDialog({ player, budget, onAccept, onRefuse }) {
  if (!player) return null;

  const commission   = Math.round(player.price * 0.05 * 10) / 10;
  const totalCost    = Math.round((player.price + commission) * 10) / 10;
  const canAfford    = budget == null || totalCost <= budget;
  const roleLabel    = ROLE_LABEL[player.role] ?? player.roleCode ?? '—';

  // Arrière-plan : bloquer le scroll et fermer sur clic backdrop
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onRefuse?.();
  }

  return (
    /* ── Overlay ── */
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(14,14,14,0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* ── Panel ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '480px',
          background: 'rgba(53,53,53,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: `1px solid rgba(61,74,60,0.3)`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
      >

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(to right, rgba(75,142,255,0.15), transparent)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <IconTransfer />
              <span style={{
                fontFamily: FONT.label, fontSize: '10px', fontWeight: 700,
                color: C.secondary, textTransform: 'uppercase', letterSpacing: '0.2em',
              }}>
                Alerte Mercato
              </span>
            </div>
            <h2 style={{
              fontFamily: FONT.headline, fontSize: '22px', fontWeight: 700,
              color: C.onSurface, margin: 0, lineHeight: 1.2,
            }}>
              Négociation de transfert
            </h2>
          </div>
          <button
            onClick={onRefuse}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: `${C.onSurface}80`, padding: '4px',
              borderRadius: '6px', display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.onSurface}
            onMouseLeave={e => e.currentTarget.style.color = `${C.onSurface}80`}
          >
            <IconClose />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '24px' }}>

          {/* Player card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: C.surfaceHighest,
                border: `2px solid rgba(86,228,114,0.25)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <span style={{
                  fontFamily: FONT.headline, fontSize: '28px', fontWeight: 800,
                  color: C.primary, opacity: 0.7,
                }}>
                  {player.name[0]}
                </span>
              </div>
              {/* OVR badge */}
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                background: GRADIENT,
                color: C.onPrimary,
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT.label, fontSize: '10px', fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>
                {player.overall}
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontFamily: FONT.headline, fontSize: '20px', fontWeight: 700,
                color: C.onSurface, textTransform: 'uppercase', margin: '0 0 6px',
              }}>
                {player.name}
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  fontFamily: FONT.label, fontSize: '11px', fontWeight: 700,
                  color: C.secondary,
                  background: 'rgba(75,142,255,0.12)',
                  padding: '2px 8px', borderRadius: '4px',
                }}>
                  {roleLabel}
                </span>
                <span style={{ fontFamily: FONT.label, fontSize: '11px', color: C.muted }}>
                  {player.roleLabel}
                </span>
              </div>
              <p style={{
                fontFamily: FONT.body, fontSize: '13px',
                color: `${C.onSurface}99`, marginTop: '8px', lineHeight: 1.5,
              }}>
                Un joueur convoité disponible sur le marché des transferts.{' '}
                <span style={{ color: C.primary, fontWeight: 700 }}>
                  Recrutement immédiat possible.
                </span>
              </p>
            </div>
          </div>

          {/* Montant + budget */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
            marginBottom: '24px',
          }}>
            <div style={{ background: C.surfaceLow, padding: '14px 16px', borderRadius: '10px' }}>
              <p style={{ fontFamily: FONT.label, fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Montant du transfert
              </p>
              <p style={{ fontFamily: FONT.headline, fontSize: '24px', fontWeight: 700, color: C.primary, margin: 0 }}>
                ${player.price}M
              </p>
            </div>
            <div style={{
              background: C.surfaceLow, padding: '14px 16px', borderRadius: '10px',
              border: canAfford ? 'none' : `1px solid ${C.error}40`,
            }}>
              <p style={{ fontFamily: FONT.label, fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Coût total (+ 5%)
              </p>
              <p style={{
                fontFamily: FONT.headline, fontSize: '24px', fontWeight: 700,
                color: canAfford ? C.onSurface : C.error, margin: 0,
              }}>
                ${totalCost}M
              </p>
              {!canAfford && (
                <p style={{ fontFamily: FONT.label, fontSize: '9px', color: C.error, marginTop: '2px' }}>
                  Budget insuffisant
                </p>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => onAccept?.(player)}
              disabled={!canAfford}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: canAfford ? GRADIENT : C.surfaceHighest,
                color: canAfford ? C.onPrimary : C.muted,
                fontFamily: FONT.label, fontWeight: 700, fontSize: '13px',
                padding: '16px',
                borderRadius: '10px', border: 'none',
                cursor: canAfford ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                boxShadow: canAfford ? `0 4px 20px rgba(86,228,114,0.25)` : 'none',
                transition: 'transform 0.1s',
              }}
              onMouseDown={e => { if (canAfford) e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <IconCheck />
              Accepter le transfert
            </button>

            <button
              onClick={onRefuse}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: C.surfaceHighest,
                color: C.error,
                fontFamily: FONT.label, fontWeight: 700, fontSize: '13px',
                padding: '16px',
                borderRadius: '10px',
                border: `1px solid rgba(255,180,171,0.25)`,
                cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,180,171,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = C.surfaceHighest}
            >
              <IconRefuse />
              Refuser
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '12px 24px',
          background: 'rgba(14,14,14,0.4)',
          borderTop: `1px solid rgba(61,74,60,0.15)`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: FONT.label, fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Commission agent : 5% (${commission}M)
          </span>
          <button style={{
            fontFamily: FONT.label, fontSize: '10px', color: C.secondary,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            background: 'none', border: 'none', cursor: 'pointer',
          }}>
            Détails du contrat
          </button>
        </div>
      </div>
    </div>
  );
}
