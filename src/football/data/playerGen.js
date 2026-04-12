// ─── Générateur de joueurs ─────────────────────────────────────────────────────
// Produit des joueurs UI-compatibles (GestionJoueurs) ET moteur-compatibles.
// Chaque joueur contient : id, name, role, nx, ny, roleLabel, roleCode,
//   overall, forme, estimatedPrice, tacticRoles, stats { vitesse, tir, passe, forme }

import { generateStats } from './playerStats';
import { FORMATIONS, DEFAULT_FORMATION } from './formations';

// ── Pools de noms ──────────────────────────────────────────────────────────────

const FIRST = [
  'Luca', 'Marco', 'Carlos', 'David', 'Antoine', 'Pablo', 'Kevin', 'Sergio',
  'Thomas', 'Julian', 'Alex', 'Matteo', 'Roberto', 'Hugo', 'Karim', 'Angel',
  'Eden', 'Toni', 'Sadio', 'Erling', 'Vinicius', 'Pedri', 'Jude', 'Jamal',
  'Bukayo', 'Florian', 'Rayan', 'Ibrahim', 'Ousmane', 'Achraf', 'Federico',
  'Nicolo', 'Rodri', 'Martin', 'Gavi', 'Xavi', 'Andres', 'Rafael', 'Bruno',
  'Nuno', 'Diogo', 'Bernardo', 'Phil', 'Kyle', 'Trent', 'Stefan', 'Leroy',
];

const LAST = [
  'Silva', 'Müller', 'García', 'Dupont', 'Ramos', 'Costa', 'Fernandez',
  'Braun', 'Rossi', 'Leblanc', 'Vidal', 'Benzema', 'Salah', 'Iniesta',
  'De Bruyne', 'Alaba', 'Thiago', 'Kroos', 'Modric', 'Nkunku', 'Wirtz',
  'Kudus', 'Sancho', 'Diaz', 'Nunez', 'Osimhen', 'Lautaro', 'Valverde',
  'Hernandez', 'Torres', 'Gomez', 'Ferreira', 'Ribeiro', 'Alves', 'Pereira',
  'Santos', 'Becker', 'Militao', 'Reyes', 'Soriano', 'Mendes', 'Cancelo',
  'Foden', 'Walker', 'Robertson', 'Gnabry', 'Sane', 'Musiala', 'Davies',
];

// ── Métadonnées par rôle ───────────────────────────────────────────────────────

const ROLE_META = {
  gk:  { label: 'Gardien de but',    code: 'GK', tacticRoles: ['Libero', 'Relanceur']                       },
  def: { label: 'Défenseur Central', code: 'CB', tacticRoles: ['Axial', 'Latéral', 'Stoppeur']              },
  mid: { label: 'Milieu de terrain', code: 'CM', tacticRoles: ['Box-to-Box', 'Meneur', 'Récupérateur']      },
  fwd: { label: 'Attaquant',         code: 'FW', tacticRoles: ['Avant-Centre', 'Ailier', 'Faux 9']          },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomName(used) {
  let name;
  let tries = 0;
  do {
    const f = FIRST[Math.floor(Math.random() * FIRST.length)];
    const l = LAST [Math.floor(Math.random() * LAST.length)];
    name = `${f[0]}. ${l.toUpperCase()}`;
    tries++;
  } while (used.has(name) && tries < 60);
  used.add(name);
  return name;
}

// Overall simplifié sur les 4 stats actives du moteur
function computeOvr(stats) {
  return Math.round((stats.vitesse + stats.tir + stats.passe + stats.forme) / 4);
}

function mkPlayer(role, nx, ny, id, used) {
  const stats  = generateStats(role);
  const meta   = ROLE_META[role] || ROLE_META.mid;
  return {
    id,
    name:           randomName(used),
    role,
    nx, ny,
    roleLabel:      meta.label,
    roleCode:       meta.code,
    overall:        computeOvr(stats),
    forme:          stats.forme,        // dupliqué pour accès direct (UI)
    estimatedPrice: null,
    tacticRoles:    [...meta.tacticRoles],
    stats,                              // { vitesse, tir, passe, forme }
  };
}

// ── API publique ───────────────────────────────────────────────────────────────

/**
 * Génère une équipe de 13 joueurs (11 titulaires + 2 remplaçants).
 *
 * @param {string} formationKey  Clé dans FORMATIONS (ex: '4-4-2')
 * @param {0|1}    teamSide      0 = notre équipe (attaque → droite)
 *                               1 = adversaire  (positions miroir)
 * @param {number} startId       Premier id à assigner
 */
export function generateTeam(formationKey = DEFAULT_FORMATION, teamSide = 0, startId = 1) {
  const form = FORMATIONS[formationKey];
  if (!form) throw new Error(`Formation inconnue : ${formationKey}`);

  const used = new Set();

  // Titulaires : positions de la formation, miroir si teamSide=1
  const players = form.players.map((p, i) => {
    const nx = teamSide === 1 ? 1 - p.nx : p.nx;
    return mkPlayer(p.role, nx, p.ny, startId + i, used);
  });

  // 2 remplaçants (1 milieu + 1 attaquant)
  const subSlots = [
    { role: 'mid', nx: teamSide === 1 ? 0.58 : 0.42, ny: 0.50 },
    { role: 'fwd', nx: teamSide === 1 ? 0.32 : 0.68, ny: 0.50 },
  ];
  subSlots.forEach((s, i) => {
    players.push(mkPlayer(s.role, s.nx, s.ny, startId + 11 + i, used));
  });

  return players; // 13 joueurs
}

/**
 * Génère N joueurs pour le marché des transferts.
 * Chaque joueur a un champ `price` (M€) calculé depuis son overall.
 *
 * @param {number} count    Nombre de joueurs
 * @param {number} startId  Premier id à assigner
 */
export function generateMarket(count = 10, startId = 500) {
  // Distribution équilibrée des rôles
  const rolePool = ['gk', 'def', 'def', 'def', 'mid', 'mid', 'mid', 'fwd', 'fwd', 'fwd'];
  const used = new Set();

  return rolePool.slice(0, count).map((role, i) => {
    const stats   = generateStats(role);
    const overall = computeOvr(stats);
    const meta    = ROLE_META[role] || ROLE_META.mid;
    const price   = parseFloat((overall * 0.22 + Math.random() * 18 + 2).toFixed(1));

    return {
      id:             startId + i,
      name:           randomName(used),
      role,
      nx: 0, ny: 0,
      roleLabel:      meta.label,
      roleCode:       meta.code,
      overall,
      forme:          stats.forme,
      estimatedPrice: price,
      price,
      tacticRoles:    [...meta.tacticRoles],
      stats,
    };
  });
}
