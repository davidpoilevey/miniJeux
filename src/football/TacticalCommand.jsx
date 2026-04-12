import { useState, useCallback } from 'react';
import FootballCoach from './FootballCoach';
import GestionJoueurs from './GestionJoueurs';
import TableauDeBord from './TableauDeBord';
import GestionTactique from './GestionTactique';
import { CLUBS } from './data/clubs';
import { generateTeam, generateMarket } from './data/playerGen';

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  surface:    '#131313',
  surfaceHigh:'#2a2a2a',
  highest:    '#353535',
  primary:    '#56e472',
  primaryDark:'#34c759',
  secondary:  '#adc6ff',
  onPrimary:  '#003911',
  onSurface:  '#e2e2e2',
  white5:     'rgba(255,255,255,0.05)',
};

const FONT = {
  headline: "'Space Grotesk', sans-serif",
  label:    "'Lexend', sans-serif",
  body:     "'Manrope', sans-serif",
};

const GRADIENT = `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`;

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconStade = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3C7 3 3 5.69 3 9v6c0 3.31 4 6 9 6s9-2.69 9-6V9c0-3.31-4-6-9-6zm0 2c3.87 0 7 1.79 7 4s-3.13 4-7 4-7-1.79-7-4 3.13-4 7-4zm0 14c-3.87 0-7-1.79-7-4v-1.27C6.81 14.84 9.27 15.5 12 15.5s5.19-.66 7-1.77V15c0 2.21-3.13 4-7 4z"/>
  </svg>
);

const IconPlayers = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const IconTactic = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
  </svg>
);

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'stade',    label: 'Stade',    Icon: IconStade   },
  { id: 'joueurs',  label: 'Joueurs',  Icon: IconPlayers },
  { id: 'tactique', label: 'Tactique', Icon: IconTactic  },
];

// ─── Header ───────────────────────────────────────────────────────────────────

function AppHeader({ argent, date, morale }) {
  const argentFmt = argent.toFixed(1);
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      backgroundColor: C.surface,
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2px solid rgba(86,228,114,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={C.primary}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: FONT.headline, fontSize: '20px', fontWeight: 700,
            color: C.primary, textTransform: 'uppercase', letterSpacing: '0.02em',
            margin: 0,
          }}>
            Tactical Command
          </h1>
        </div>

        {/* Budget · date · morale */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          fontFamily: FONT.headline, fontSize: '13px', fontWeight: 600,
        }}>
          <span style={{ color: C.primary }}>💰 {argentFmt}M€</span>
          <span style={{ color: C.secondary, opacity: 0.7 }}>|</span>
          <span style={{ color: C.onSurface, opacity: 0.8 }}>{date}</span>
          <span style={{ color: C.secondary, opacity: 0.7 }}>|</span>
          <span style={{ color: morale >= 80 ? C.primary : C.secondary }}>{morale}% MORALE</span>
        </div>
      </div>
      <div style={{ height: 1, background: `linear-gradient(to bottom, ${C.highest}, transparent)` }} />
    </header>
  );
}

// ─── Bottom navigation ────────────────────────────────────────────────────────

function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '12px 16px 24px',
      backgroundColor: 'rgba(19,19,19,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(53,53,53,0.5)',
      borderRadius: '16px 16px 0 0',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
    }}>
      {TABS.map(({ id, label, Icon }) => {
        const active = id === activeTab;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px', padding: '4px 24px',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              background:  active ? GRADIENT : 'transparent',
              color:       active ? C.onPrimary : C.secondary,
              opacity:     active ? 1 : 0.7,
              transition:  'all 0.15s',
              fontFamily:  FONT.label, fontSize: '10px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            <Icon />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────

/**
 * TacticalCommand – composant racine, gère tout l'état du jeu.
 *
 * États principaux :
 *   argent         {number}   budget disponible en M€
 *   equipe         {Player[]} 13 joueurs de notre équipe (11 + 2 remplaçants)
 *   equipeAdverse  {Player[]} 13 joueurs du club sélectionné
 *   selectedClub   {Club}     club adverse complet (avec style, forme, reward…)
 *
 * À brancher plus tard :
 *   → passer equipe + equipeAdverse + selectedClub.style à FootballCoach
 */
export default function TacticalCommand() {

  // ── Navigation & match ──────────────────────────────────────────────────────
  const [activeTab,       setActiveTab]       = useState('stade');
  const [matchEnCours,    setMatchEnCours]    = useState(false);
  const [activeTactic,    setActiveTactic]    = useState('attack');
  const [activeFormation, setActiveFormation] = useState('4-4-2');

  // ── Données du club ─────────────────────────────────────────────────────────
  const [argent, setArgent] = useState(45.2);
  const [morale]            = useState(92);

  // Équipe du joueur : générée une seule fois à l'init (ids 1–13)
  const [equipe, setEquipe] = useState(() => generateTeam('4-4-2', 0, 1));

  // Marché des transferts : 10 joueurs (ids 500–509)
  const [transfertMarche, setTransfertMarche] = useState(() => generateMarket(10, 500));

  // Clubs adverses + leurs équipes pré-générées (ids 200–394)
  const [clubs] = useState(() =>
    CLUBS.map((club, i) => ({
      ...club,
      equipe: generateTeam('4-4-2', 1, 200 + i * 13),
    }))
  );

  // Club adverse sélectionné par le joueur
  const [selectedClubId, setSelectedClubId] = useState(null);

  // ── Dérivés ─────────────────────────────────────────────────────────────────
  const selectedClub   = clubs.find(c => c.id === selectedClubId) ?? null;
  const equipeAdverse  = selectedClub?.equipe ?? [];

  // Date courante formatée
  const date = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short',
  }).toUpperCase();

  // ── Callbacks ───────────────────────────────────────────────────────────────

  const handleGoToMatch = useCallback(() => {
    if (!selectedClub) return;
    setMatchEnCours(true);
  }, [selectedClub]);

  const handleMatchEnded = useCallback(({ result } = {}) => {
    setMatchEnCours(false);
    if (selectedClub && result) {
      const reward = selectedClub.reward ?? 0;
      const gain   = result === 'win'  ? reward
                   : result === 'draw' ? reward / 2
                   :                     reward / 4;
      setArgent(a => parseFloat((a + gain).toFixed(1)));
    }
  }, [selectedClub]);

  /**
   * Transfert d'un joueur du marché vers notre effectif.
   * Déduit le prix du budget, ajoute le joueur, retire du marché.
   */
  const handleTransfer = useCallback((player) => {
    setArgent(a => parseFloat((a - (player.price || 0)).toFixed(1)));
    setEquipe(e => [...e, { ...player, estimatedPrice: null, price: undefined }]);
    setTransfertMarche(m => m.filter(p => p.id !== player.id));
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

  const stadeContent = matchEnCours
    ? (
        /* FootballCoach reçoit tout ce qu'il faut — branchements à faire */
        <FootballCoach
          onMatchEnded={handleMatchEnded}
          equipe={equipe}
          equipeAdverse={equipeAdverse}
          styleAdverse={selectedClub?.style}
        />
      )
    : (
        <TableauDeBord
          clubs={clubs}
          selectedClubId={selectedClubId}
          onSelectClub={setSelectedClubId}
          selectedClub={selectedClub}
          onGoToMatch={handleGoToMatch}
          myTeamName="Tactical FC"
        />
      );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      backgroundColor: C.surface, color: C.onSurface,
      fontFamily: FONT.body, userSelect: 'none',
    }}>
      <AppHeader argent={argent} date={date} morale={morale} />

      {/* Zone de contenu — place pour la barre de navigation fixe */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '96px' }}>

        {/* Stade : tableau de bord ↔ match en cours */}
        {activeTab === 'stade' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {stadeContent}
          </div>
        )}

        {/* Joueurs — effectif + marché */}
        {activeTab === 'joueurs' && (
          <GestionJoueurs
            squad={equipe}
            market={transfertMarche}
            budget={argent}
            onTransfer={handleTransfer}
          />
        )}

        {/* Tactique */}
        {activeTab === 'tactique' && (
          <GestionTactique
            activeTactic={activeTactic}
            activeFormation={activeFormation}
            onConfirm={(tacticId, formationId) => {
              setActiveTactic(tacticId);
              setActiveFormation(formationId);
            }}
          />
        )}

      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
