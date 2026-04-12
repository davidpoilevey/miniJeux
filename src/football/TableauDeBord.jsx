// ─── TableauDeBord ────────────────────────────────────────────────────────────
// Affiché quand matchEnCours === false.
// Colonne gauche  : prochain match (VS) + bouton Lancer
// Colonne droite  : sélecteur d'adversaire (liste des clubs)
// Bas de page     : stats clés + historique (données futures)

import { useState, useEffect } from 'react';
import { OPP_STYLES } from './data/oppStyles';

function useIsMobile(bp = 700) {
  const [mobile, setMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const handler = e => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [bp]);
  return mobile;
}

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
  onPrimary:        '#003911',
  onSurface:        '#e2e2e2',
  error:            '#ffb4ab',
  white05:          'rgba(255,255,255,0.05)',
  white50:          'rgba(255,255,255,0.5)',
};

const FONT = {
  headline: "'Space Grotesk', sans-serif",
  body:     "'Manrope', sans-serif",
  label:    "'Lexend', sans-serif",
};

const GRADIENT = `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`;

const glass = {
  background:              'rgba(19, 19, 19, 0.65)',
  backdropFilter:          'blur(20px)',
  WebkitBackdropFilter:    'blur(20px)',
};

// ─── Étoiles de forme ─────────────────────────────────────────────────────────

function FormStars({ forme, size = 11 }) {
  return (
    <span style={{ fontSize: size, letterSpacing: '1px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < forme ? '#ffd700' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
    </span>
  );
}

// ─── Carte de club ────────────────────────────────────────────────────────────

// Version desktop (liste verticale)
function ClubCard({ club, selected, onSelect }) {
  const style = OPP_STYLES[club.style] ?? {};
  const bg = selected ? 'rgba(86,228,114,0.10)' : 'rgba(27,27,27,0.85)';
  return (
    <button
      onClick={() => onSelect(club.id)}
      style={{
        ...glass, background: bg,
        border:       selected ? `1px solid ${C.primary}` : '1px solid rgba(255,255,255,0.04)',
        borderRadius: '10px', padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', color: C.onSurface, transition: 'all 0.15s',
        width: '100%', textAlign: 'left',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(53,53,53,0.7)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <span style={{ fontSize: '20px', flexShrink: 0 }}>{club.country}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: FONT.headline, fontWeight: 700, fontSize: '13px',
            color: selected ? C.primary : C.onSurface,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {club.name}
          </div>
          <div style={{ fontFamily: FONT.label, fontSize: '10px', color: C.secondary, opacity: 0.75, marginTop: '1px' }}>
            {style.emoji} {style.label}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0, marginLeft: '8px' }}>
        <FormStars forme={club.forme} />
        <div style={{ fontFamily: FONT.label, fontSize: '11px', fontWeight: 700, color: C.primaryDark }}>
          +{club.reward}M€
        </div>
      </div>
    </button>
  );
}

// Version mobile (pill horizontal scrollable)
function ClubPill({ club, selected, onSelect }) {
  const bg = selected ? 'rgba(86,228,114,0.15)' : 'rgba(42,42,42,0.9)';
  return (
    <button
      onClick={() => onSelect(club.id)}
      style={{
        flexShrink: 0,
        background: bg,
        border: selected ? `1.5px solid ${C.primary}` : '1.5px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '8px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
        cursor: 'pointer', color: C.onSurface, transition: 'all 0.15s',
        minWidth: '70px',
      }}
    >
      <span style={{ fontSize: '18px', lineHeight: 1 }}>{club.country}</span>
      <span style={{
        fontFamily: FONT.headline, fontWeight: 700, fontSize: '10px',
        color: selected ? C.primary : C.onSurface,
        whiteSpace: 'nowrap',
      }}>
        {club.abbr}
      </span>
      <FormStars forme={club.forme} size={8} />
    </button>
  );
}

// ─── Bloc stat ────────────────────────────────────────────────────────────────

function StatBlock({ label, value, unit, sub, subColor, barValue }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ fontFamily: FONT.label, fontSize: '10px', color: C.secondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT.headline, fontSize: '30px', fontWeight: 700, color: C.onSurface, lineHeight: 1 }}>
        {value}
        {unit && <span style={{ color: C.primary, fontSize: '14px' }}>{unit}</span>}
      </div>
      {barValue != null && (
        <div style={{ height: 4, borderRadius: 2, background: C.surfaceHighest, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${barValue}%`, background: C.primary, borderRadius: 2 }} />
        </div>
      )}
      {sub && (
        <div style={{ fontFamily: FONT.label, fontSize: '10px', color: subColor || C.primary }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Ligne historique ─────────────────────────────────────────────────────────

function HistoryRow({ opponent, venue, score, result }) {
  const isWin  = result === 'WIN';
  const isLoss = result === 'LOSS';
  const accent = isWin ? C.primary : isLoss ? C.error : C.secondary;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px',
      background: C.surfaceLow,
      borderRadius: '8px',
      borderLeft: `2px solid ${accent}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontFamily: FONT.label, fontSize: '12px', fontWeight: 700, color: C.onSurface }}>
          {opponent}
        </span>
        <span style={{ fontFamily: FONT.label, fontSize: '10px', color: C.secondary }}>
          {venue}
        </span>
      </div>
      <div style={{ fontFamily: FONT.headline, fontWeight: 700, color: accent }}>
        {score}
      </div>
      <div style={{
        background: `${accent}1a`,
        color: accent,
        fontFamily: FONT.label, fontSize: '10px', fontWeight: 700,
        padding: '2px 8px', borderRadius: '4px',
      }}>
        {result}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * TableauDeBord
 *
 * Props :
 *   clubs          {Club[]}  liste des clubs avec équipes pré-générées
 *   selectedClubId {number|null}
 *   onSelectClub   {fn(id)}
 *   selectedClub   {Club|null}  club sélectionné complet
 *   myTeamName     {string}
 *   onGoToMatch    {fn}
 *   stats          {object}  optionnel
 *   history        {Array}   optionnel
 */
export default function TableauDeBord({
  clubs        = [],
  selectedClubId = null,
  onSelectClub,
  selectedClub = null,
  myTeamName   = 'Tactical FC',
  onGoToMatch,
  stats,
  history,
}) {
  const isMobile = useIsMobile();
  const oppStyle = selectedClub ? OPP_STYLES[selectedClub.style] : null;
  const canPlay  = selectedClub !== null;

  const s = stats ?? {
    possession:  58.4,
    buts:        14,
    butsLabel:   '+2.4 vs prév.',
    cleanSheets: 3,
    efficacite:  12.5,
  };

  const h = history ?? [
    { opponent: 'LIV', venue: 'A', score: '2 – 0', result: 'WIN'  },
    { opponent: 'ARS', venue: 'H', score: '1 – 0', result: 'WIN'  },
    { opponent: 'CHE', venue: 'A', score: '1 – 3', result: 'LOSS' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>

      {/* ── Fond stade simulé ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: -1,
        background: 'radial-gradient(ellipse 120% 60% at 50% 20%, rgba(20,50,20,0.9) 0%, rgba(13,13,13,1) 65%)',
        pointerEvents: 'none',
      }}/>

      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: isMobile ? '16px 12px 16px' : '32px 24px 32px',
        display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '24px',
      }}>

        {/* ── Hero : VS + sélecteur adversaire ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '8fr 4fr',
          gap: isMobile ? '12px' : '24px',
          alignItems: 'start',
        }}>

          {/* Bloc VS */}
          <div style={{
            ...glass,
            borderRadius: '12px',
            padding: isMobile ? '16px' : '32px',
            borderLeft: `4px solid ${canPlay ? C.primary : C.surfaceHighest}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            position: 'relative', overflow: 'hidden',
            transition: 'border-color 0.3s',
          }}>
            {/* Badge */}
            {!isMobile && (
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <span style={{
                  background: 'rgba(86,228,114,0.15)', color: C.primary,
                  padding: '4px 12px', borderRadius: '20px',
                  fontFamily: FONT.label, fontSize: '11px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Prochain Match
                </span>
              </div>
            )}

            {/* Teams */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: isMobile ? '12px' : '32px',
              padding: isMobile ? '8px 0' : '24px 0',
            }}>
              {/* Notre équipe */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: FONT.headline, fontSize: isMobile ? '20px' : '32px', fontWeight: 700,
                  color: C.onSurface, textTransform: 'uppercase',
                  fontStyle: 'italic', letterSpacing: '-0.02em', margin: 0,
                }}>
                  {myTeamName}
                </h3>
                {!isMobile && (
                  <p style={{ fontFamily: FONT.label, fontSize: '12px', color: C.secondary, marginTop: '4px' }}>
                    DOMICILE
                  </p>
                )}
              </div>

              {/* VS */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: FONT.headline, fontSize: isMobile ? '28px' : '44px', fontWeight: 800, color: C.primary, lineHeight: 1 }}>
                  VS
                </div>
                {!isMobile && (
                  <div style={{ fontFamily: FONT.label, color: C.white50, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '6px' }}>
                    {selectedClub
                      ? new Date().toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).toUpperCase()
                      : 'À PLANIFIER'
                    }
                  </div>
                )}
              </div>

              {/* Adversaire */}
              <div style={{ flex: 1, textAlign: 'right' }}>
                {selectedClub ? (
                  <>
                    <h3 style={{
                      fontFamily: FONT.headline, fontSize: isMobile ? '16px' : '28px', fontWeight: 700,
                      color: C.onSurface, textTransform: 'uppercase',
                      fontStyle: 'italic', letterSpacing: '-0.02em', margin: 0,
                    }}>
                      {selectedClub.country} {isMobile ? selectedClub.abbr : selectedClub.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                      <FormStars forme={selectedClub.forme} size={isMobile ? 9 : 12} />
                      {!isMobile && (
                        <span style={{ fontFamily: FONT.label, fontSize: '11px', color: C.secondary }}>
                          {oppStyle?.emoji} {oppStyle?.label}
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: FONT.label, fontSize: isMobile ? '10px' : '11px', color: C.primaryDark, marginTop: '3px', fontWeight: 700 }}>
                      +{selectedClub.reward}M€
                    </p>
                  </>
                ) : (
                  <h3 style={{
                    fontFamily: FONT.headline, fontSize: isMobile ? '24px' : '32px', fontWeight: 700,
                    color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase',
                    fontStyle: 'italic', letterSpacing: '-0.02em', margin: 0,
                  }}>
                    ???
                  </h3>
                )}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? '12px' : '24px', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={canPlay ? onGoToMatch : undefined}
                disabled={!canPlay}
                style={{
                  background:   canPlay ? GRADIENT : C.surfaceHighest,
                  color:        canPlay ? C.onPrimary : 'rgba(255,255,255,0.3)',
                  fontFamily:   FONT.headline, fontWeight: 700, fontSize: isMobile ? '14px' : '16px',
                  padding:      isMobile ? '12px 32px' : '16px 48px',
                  borderRadius: '6px', border: 'none',
                  cursor:       canPlay ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  boxShadow:    canPlay ? '0 8px 32px rgba(86,228,114,0.25)' : 'none',
                  transition:   'all 0.2s',
                  width:        isMobile ? '100%' : 'auto',
                }}
              >
                {canPlay ? 'Lancer le Match ▶' : 'Choisir un adversaire →'}
              </button>
            </div>
          </div>

          {/* ── Sélecteur d'adversaire ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: FONT.label, fontSize: '11px', fontWeight: 700,
                color: C.secondary, textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Adversaires
              </span>
              {selectedClub && (
                <button
                  onClick={() => onSelectClub(null)}
                  style={{
                    fontFamily: FONT.label, fontSize: '10px', fontWeight: 700,
                    color: C.error, opacity: 0.7, background: 'none',
                    border: 'none', cursor: 'pointer', letterSpacing: '0.04em',
                  }}
                >
                  Annuler
                </button>
              )}
            </div>

            {isMobile ? (
              /* Mobile : pills horizontales scrollables */
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '8px',
              }}>
                {clubs.map(club => (
                  <ClubPill
                    key={club.id}
                    club={club}
                    selected={club.id === selectedClubId}
                    onSelect={onSelectClub}
                  />
                ))}
              </div>
            ) : (
              /* Desktop : liste verticale scrollable */
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '6px',
                maxHeight: '420px', overflowY: 'auto',
                paddingRight: '4px',
                scrollbarWidth: 'thin',
                scrollbarColor: `${C.surfaceHighest} transparent`,
              }}>
                {clubs.map(club => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    selected={club.id === selectedClubId}
                    onSelect={onSelectClub}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Stats + Historique ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? '12px' : '24px' }}>

          {/* Statistiques clés */}
          <div style={{ ...glass, borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{
                fontFamily: FONT.headline, fontSize: '18px', fontWeight: 700,
                textTransform: 'uppercase', color: C.onSurface, margin: 0,
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ width: 4, height: 24, background: C.primary, display: 'inline-block', borderRadius: 2 }}/>
                Statistiques Clés
              </h2>
              <span style={{ fontFamily: FONT.label, fontSize: '11px', color: C.secondary, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Derniers 5 Matchs
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '16px' : '24px' }}>
              <StatBlock label="Possession Moy." value={s.possession} unit="%" barValue={s.possession} />
              <StatBlock label="Buts Marqués"    value={s.buts}       sub={s.butsLabel} />
              <StatBlock label="Clean Sheets"    value={String(s.cleanSheets).padStart(2,'0')} sub="Top 3 League" subColor={C.secondary} />
              <StatBlock label="Efficacité Tirs" value={s.efficacite} unit="%" barValue={s.efficacite} />
            </div>
          </div>

          {/* Historique */}
          <div style={{ ...glass, borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: FONT.headline, fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', color: C.onSurface, margin: 0 }}>
                Historique
              </h2>
              <button style={{ fontFamily: FONT.label, fontSize: '11px', color: C.primary, fontWeight: 700, textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
                Voir Tout
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {h.map((m, i) => (
                <HistoryRow key={i} {...m} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
