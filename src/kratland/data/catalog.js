/**
 * catalog.js — Données statiques de Kratland (jamais en base PocketBase).
 *
 * Contient les définitions de types : pièces, bâtiments, items, rencontres.
 * La logique dynamique (qui est où, qui possède quoi) est dans kratPlayers /
 * kratBuildings / kratNpcs / kratItems.
 */

// ─── Pièces ───────────────────────────────────────────────────────────────────

export const ROOM_DEFINITIONS = {
  entrance: { id: 'entrance', label: 'Entrée',   icon: 'meeting_room', description: 'Le seuil du bâtiment, entre ceux qui partent et ceux qui arrivent.' },
  shop:     { id: 'shop',     label: 'Boutique', icon: 'storefront',   description: 'Provisions, équipements et curiosités à vendre.'                    },
  sleeping: { id: 'sleeping', label: 'Chambre',  icon: 'bed',          description: 'Un lit, quatre murs. Le repos et la récupération.'                  },
  prison:   { id: 'prison',   label: 'Cellule',  icon: 'lock',         description: 'Quatre murs et des barreaux. Les gardes ne rigolent pas.'            },
}

/**
 * Configurations de pièces par clé.
 * Stocké sur kratBuildings.roomConfig → jamais les pièces elles-mêmes.
 */
export const ROOM_CONFIGS = {
  entrance:          ['entrance'],
  entrance_shop:     ['entrance', 'shop'],
  entrance_shop_bed: ['entrance', 'shop', 'sleeping'],
  entrance_bed:      ['entrance', 'sleeping'],
  entrance_prison:   ['entrance', 'prison'],
}

/** Construit le tableau de pièces depuis la clé roomConfig d'un bâtiment. */
export function buildRooms(roomConfig) {
  const ids = ROOM_CONFIGS[roomConfig] ?? ['entrance']
  return ids.map(id => ROOM_DEFINITIONS[id])
}

// ─── Types de bâtiments ───────────────────────────────────────────────────────

export const BUILDING_TYPES = {
  taverne: { label: 'Taverne',  icon: 'local_bar'       },
  mairie:  { label: 'Mairie',   icon: 'account_balance' },
  forge:   { label: 'Forge',    icon: 'hardware'        },
  marche:  { label: 'Marché',   icon: 'storefront'      },
  temple:  { label: 'Temple',   icon: 'temple_hindu'    },

  pharmacie: { label: 'Pharmacie', icon: 'local_pharmacy' },
  clinique:  { label: 'Clinique',  icon: 'medical_services' },
  cybercafe: { label: 'Cybercafé', icon: 'computer' },
  garage:    { label: 'Garage',    icon: 'directions_car' },
  bibliotheque:{ label: 'Bibliothèque', icon: 'menu_book' },
  laboratoire:{ label: 'Laboratoire', icon: 'science' },
  maison:    { label: 'Maison',    icon: 'home' },
}

// ─── Actions contextuelles par type de bâtiment et par pièce ─────────────────
//
// Toutes les instances d'un même type partagent les mêmes actions.
// Chaque action est scopée à une roomId — seules les actions de la pièce active
// sont affichées. 'exit' est un id réservé → déclenche exitBuilding().

export const CONTEXTUAL_ACTIONS = {
  taverne: {
    entrance: [
      { id: 'exit',  label: 'Sortir dans la ville', icon: 'door_front', primary: true },
    ],
    shop: [
      { id: 'caisse', label: 'Braquer la caisse', icon: 'point_of_sale', primary: true,
        illegal: true,
        description: "Le patron a le dos tourné. Sa caisse traîne là, entrouverte.",
        successChance: 0.60,
        reward: { gold: { min: 40, max: 100 } },
        onSuccess: { reputation: -3 },
        onFailure: { reputation: -8 },
        competenceBonus: 'discretion',
        successMessage: "Vous glissez la main dans la caisse sans vous faire remarquer.",
        failMessage: "Le patron vous a vu. Vous êtes jeté dehors — et votre réputation en prend un coup.",
      },
      { id: 'rumor', label: 'Répandre une Rumeur', icon: 'theater_comedy', primary: false,
        description: "Les murs ont des oreilles. Et une taverne en a encore plus.",
        form: [
          { key: 'text',   label: 'La rumeur', multiline: true, required: true,  placeholder: "Il paraît que..." },
          { key: 'target', label: 'Cible',     multiline: false, required: false, placeholder: "Personne ou lieu visé (optionnel)" },
        ],
        pbCollection: 'kratNews',
        newsType: 'rumor',
        onSuccess: { reputation: 1 },
        successMessage: "La rumeur commence à circuler. On vous approuve d'un air entendu.",
      },
      { id: 'work',  label: 'Ramasser les ivrognes (et le reste)', icon: 'mop', primary: false, salary: 50, forme: -10, faim: -4, reputation: -2 },
    ],
    sleeping: [
      { id: 'sleep_floor', label: 'Dormir par terre', icon: 'night_shelter', primary: false,
        auto: true, confirmLabel: 'Se coucher',
        description: "Le plancher froid comme litière. Votre dos s'en souviendra.",
        onSuccess: { forme: 3, faim: -2, reputation: -1, pointsDivins: 2 },
        successMessage: "Vous vous réveillez courbaturé mais vaguement moins épuisé.",
      },
      { id: 'sleep_room', label: 'Louer une chambre (10g)', icon: 'bed', primary: true,
        auto: true, confirmLabel: 'Louer',
        description: "Un lit propre, une nuit au chaud. Le luxe, c'est relatif.",
        condition: state => state.player.gold >= 10,
        onSuccess: { forme: 10, gold: -10, pointsDivins: 5 },
        successMessage: "Vous vous réveillez reposé. La nuit valait ses 10 pièces.",
      },
      { id: 'sleep_bnb', label: 'Bed & Breakfast (25g)', icon: 'free_breakfast', primary: false,
        auto: true, confirmLabel: 'Réserver',
        description: "Lit, repos, et petit-déjeuner au réveil. On ne se refuse rien.",
        condition: state => state.player.gold >= 25,
        onSuccess: { forme: 12, faim: 6, gold: -25, pointsDivins: 8 },
        successMessage: "Réveil tranquille, œufs brouillés et lumière du matin. Presque la vie.",
      },
    ],
  },

  maison: {
    entrance: [
      { id: 'exit',  label: 'Sortir dans la ville', icon: 'door_front', primary: true },
    ]
    , sleeping: [
      { id: 'sleep_floor', label: 'Dormir par terre', icon: 'night_shelter', primary: false,
        auto: true, confirmLabel: 'Se coucher',
        description: "Le plancher froid comme litière. Votre dos s'en souviendra.",
        onSuccess: { forme: 5, faim: -2, reputation: -1, pointsDivins: 2 },
        successMessage: "Vous vous réveillez courbaturé mais vaguement moins épuisé.",
      },
      { id: 'sleep_room', label: 'Dormir dans un lit (necessite lit)', icon: 'bed', primary: true,
        auto: true, confirmLabel: 'Louer',
        description: "Un lit propre, une nuit au chaud. Le luxe, c'est relatif. Sinon ca s'achete au marché",
        condition: state => state.player.inventaire.find(item => item.typeId === 'lit'),
        onSuccess: { forme: 10, gold: -10, pointsDivins: 5 },
        successMessage: "Vous vous réveillez reposé. La nuit valait ses 10 pièces.",
      },
      { id: 'coffre', label: 'Ouvrir le coffre', icon: 'lock_open', primary: false },
    ],
  },
  mairie: {
    entrance: [
      { id: 'exit', label: 'Sortir dans la ville', icon: 'door_front', primary: true,
        
      },
      { id: 'candidature', label: 'Devenir maire', icon: 'gavel', primary: false,
        condition: state => !state.city.mayor,
        description: "La ville est sans maire. Il n'en faut peut-être pas plus pour prétendre au poste.",
        successChance: 0.60,
        competenceBonus: 'mentalisme',
        onSuccess: { reputation: 10 },
        successMessage: "La ville vous acclame. Vous êtes désormais le maire de cette cité !",
        failMessage: "Le peuple ne semble pas convaincu. Votre candidature est rejetée.",
      }, { id: 'coupDetat', label: 'Coup d\'état', icon: 'gavel', primary: true, illegal:true,
        condition: state => state.city.mayor,
        description: "Le maire actuel aest un connard ! Il est temps de le dégager manu militari.",
        successChance: 0.10,
        onSuccess: { reputation: 12 },
        onFailure: { reputation: -12 },
        successMessage: "La ville vous acclame. Vous êtes désormais le maire de cette cité !",
        failMessage: "Le policier municipal vous ris au nez. Allez, en taule !",
      },

    ],
    prison: [
      { id: 'evasion', label: "Tenter de s'évader", icon: 'directions_run', primary: true,
        description: "Les barreaux semblent solides. Mais les gardes ont aussi des pauses café.",
        successMessage: "Dans la confusion, vous vous glissez hors de la cellule !",
        failMessage: "Le garde vous rattrape alors que vous franchissez la porte. Vous êtes épuisé.",
      },
    ],
    shop:[
      { id: 'bureauDuMaire', label: 'Bureau du Maire', icon: 'account_balance', primary: true,
        condition: state => state.city.mayor === state.player.name,
      },
    ]
  },
  forge: {
    entrance: [
      { id: 'exit',   label: 'Sortir dans la ville',  icon: 'door_front', primary: false },
    ],
    shop: [
      { id: 'costaud',  label: 'Engager un garde du corps',                icon: 'fitness_center',   primary: true  },
      { id: 'caisse', label: 'Braquer la caisse', icon: 'point_of_sale', primary: false,
        illegal: true,
        description: "Le forgeron s'est absenté un instant. Mais il est solide comme l'acier...",
        successChance: 0.40,
        reward: { gold: { min: 80, max: 220 } },
        onSuccess: { reputation: -4 },
        onFailure: { reputation: -12 },
        competenceBonus: 'discretion',
        successMessage: "Mission accomplie. La caisse du forgeron était bien garnie.",
        failMessage: "Le forgeron vous attrape par le col. Vous ne l'aurez pas deux fois.",
      },
      { id: 'work',   label: "Souffler les braises jusqu'à l'évanouissement", icon: 'whatshot', primary: false, salary: 75, forme: -15, faim: -6, reputation: 1 },
    ],
  },
  marche: {
    entrance: [
      { id: 'exit', label: 'Sortir dans la ville', icon: 'door_front',    primary: true },
    ],
    shop: [
      { id: 'caisse', label: 'Braquer la caisse', icon: 'point_of_sale', primary: false,
        illegal: true,
        description: "Le marché est animé. Dans la confusion, une occasion se présente.",
        successChance: 0.55,
        reward: { gold: { min: 60, max: 160 } },
        onSuccess: { reputation: -3 },
        onFailure: { reputation: -10 },
        competenceBonus: 'discretion',
        successMessage: "Personne n'a rien vu. Le flot de la foule vous a couvert.",
        failMessage: "Un cri, des regards. Vous vous enfuyez sans rien.",
      },
      { id: 'work', label: 'Décharger des caisses de fumier frais', icon: 'local_shipping', primary: false, salary: 40, forme: -8, faim: -5, reputation: -2 },
    ],
  },
  temple: {
    entrance: [
      { id: 'exit',   label: 'Sortir dans la ville', icon: 'door_front',         primary: true },
      { id: 'donate', label: 'Faire un don',    
             icon: 'volunteer_activism',  auto: true
             , confirmLabel: "Donner de l'argent",
        description: "Votre générosité envers les divinités pourrait vous porter chance... ou pas.",
        onSuccess: {gold: { min: -100, max: -10 }, reputation: 1, pointsDivins: 1 },
        successMessage: "Vous faites un don à la hauteur de votre foi. Vous sentez une présence bienveillante.",
    primary: false },
    ],
    sleeping: [
      { id: 'pray',   label: 'Prier',                icon: 'self_improvement',   primary: true  },
    ],
  },

  pharmacie: {
    entrance: [
      { id: 'exit', label: 'Sortir', icon: 'door_front', primary: true },
    ],
    shop: [
      { id: 'consult',  label: 'Demander conseil',        icon: 'question_answer',  primary: false },
        { id: 'caisse', label: 'Braquer la caisse', icon: 'point_of_sale', primary: false,
        illegal: true,
        description: "La pharmacie est remplie de choses qui se revendent... En profiter ?",
        successChance: 0.35,
        reward: { gold: { min: 60, max: 160 } },
        onSuccess: { reputation: -2 },
        onFailure: { reputation: -10 },
        competenceBonus: 'discretion',
        successMessage: "Personne n'a rien vu. Le flot de la foule vous a couvert.",
        failMessage: "Un cri, des regards. Vous vous enfuyez sans rien.",
      },
      { id: 'work',     label: 'Trier les déchets biologiques non identifiés', icon: 'recycling', primary: false, salary: 55, forme: -8, faim: -3, reputation: 0 },
    ],
  },

  cybercafe: {
    entrance: [
      { id: 'exit', label: 'Sortir', icon: 'door_front' , primary: true },
    ],
    shop: [
      { id: 'connect',       label: 'Se connecter au réseau',     icon: 'wifi',     primary: true  },
      { id: 'hack_terminal', label: 'Utiliser un terminal',        icon: 'terminal', primary: false },
      { id: 'buy_data',      label: 'Acheter des données',         icon: 'dns',      primary: false },
      { id: 'work',          label: 'Modérer des forums de haine (sans lunettes)', icon: 'monitor', primary: false, salary: 65, forme: -5, faim: -2, reputation: -5 },
    ],
  },

  garage: {
    entrance: [
      { id: 'exit', label: 'Sortir', icon: 'door_front', primary: true },
    ],
    shop: [
      { id: 'repair_vehicle',  label: 'Réparer véhicule',    icon: 'build',       primary: true  },
      { id: 'work',            label: "Vider l'huile de vidange à mains nues", icon: 'car_repair', primary: false, salary: 70, forme: -12, faim: -5, reputation: 0 },
    ],
  },

  bibliotheque: {
    entrance: [
      { id: 'exit', label: 'Sortir', icon: 'door_front', primary: true },
    ],
    shop: [
      { id: 'read_book',   label: 'Lire un livre',             icon: 'menu_book', primary: true  },
      { id: 'learn_skill', label: 'Étudier une compétence',    icon: 'school',    primary: false },
      { id: 'research',    label: 'Faire une recherche',       icon: 'search',    primary: false },
      { id: 'work',        label: 'Reclasser 3000 fiches sous silence absolu', icon: 'sort', primary: false, salary: 25, forme: -6, faim: -2, reputation: 3 },
    ],
    sleeping: [
      { id: 'sleep_floor', label: 'Dormir par terre', icon: 'night_shelter', primary: false,
        auto: true, confirmLabel: 'Se coucher',
        description: "Le plancher froid comme litière. Votre dos s'en souviendra.",
        onSuccess: { forme: 3, faim: -2, reputation: -1, pointsDivins: 2 },
        successMessage: "Vous vous réveillez courbaturé mais vaguement moins épuisé.",
      },
      { id: 'sleep_hamac', label: 'Hamac entre les étagères', icon: 'beach_access', primary: true,
        auto: true, confirmLabel: "S'installer",
        description: "Quelqu'un a installé un hamac entre Philosophie et Botanique. Génie absolu.",
        onSuccess: { forme: 7, faim: -1, pointsDivins: 3 },
        successMessage: "Vous vous réveillez avec une idée vague et l'odeur du papier dans les narines.",
      },
    ],
  },

  laboratoire: {
    entrance: [
      { id: 'exit', label: 'Sortir', icon: 'door_front' , primary: true },
    ],
    shop: [
      { id: 'craft',      label: 'Créer une substance',   icon: 'science',    primary: true  },
      { id: 'experiment', label: 'Expérimenter',          icon: 'biotech',    primary: false },
      { id: 'identify',   label: 'Identifier un objet',   icon: 'visibility', primary: false },
      { id: 'work',       label: 'Nettoyer les cuves de synthèse (sans EPI)', icon: 'cleaning_services', primary: false, salary: 90, forme: -12, faim: -3, reputation: -1 },
    ],
  },

}



// ─── Compétences ─────────────────────────────────────────────────────────────
//
// Clé = identifiant stocké dans kratPlayers.stats.competences
// Valeur = bonus (positif) ou limitation (négatif) appliqué à certains ordres.

export const COMPETENCES = {
  discretion:   { label: 'Discrétion',   icon: 'visibility_off'    },
  informatique: { label: 'Informatique', icon: 'memory' },
  mentalisme:   { label: 'Mentalisme',   icon: 'psychology_alt'    },
  alchimie:     { label: 'Alchimie',     icon: 'science'           },
  navigation:   { label: 'Navigation',   icon: 'explore'           },
  combat:       { label: 'Combat',       icon: 'swords'            },
  medecine:     { label: 'Médecine', icon: 'medical_services' },
    survie:       { label: 'Survie', icon: 'forest' },
  marchandage:  { label: 'Marchandage', icon: 'price_check' },

  // Ajouts
  closeCombat:  { label: 'Combat rapproché', icon: 'sports_martial_arts' },
  tir:          { label: 'Tir', icon: 'gps_fixed' },

  magieFeu:   { label: 'Magie du Feu',   icon: 'local_fire_department' },
  magieEau:   { label: 'Magie de l\'Eau',   icon: 'water_drop' },
  magieTerre: { label: 'Magie de la Terre', icon: 'landslide'  },
  magieVent:  { label: 'Magie du Vent',     icon: 'air'        },
}


// ─── Types d'items ────────────────────────────────────────────────────────────
//
// typeId (clé) = référence stockée dans kratItems.typeId
// Les propriétés (label, icon, effets) ne quittent jamais le client.

export const ITEM_TYPES = {

  // ───── Nourriture

  gold: {
    label: 'Or',
    icon: 'currency_exchange',
    type: 'consumable',
    effects: { gold: +1 },
    prix: 1,
    stackable: true,
    maxStack: 1000,
    inBuildingShop: 'mine',
  },
  pain: {
    label: 'Pain',
    icon: 'bakery_dining',
    type: 'consumable',
    effects: { faim: +2 },
    prix: 4,
    stackable: true,
    maxStack: 10,
    inBuildingShop: 'marche',
  },

  fromage: {
    label: 'Fromage',
    icon: 'lunch_dining',
    type: 'consumable',
    effects: { faim: +3 },
    prix: 6,
    stackable: true,
    inBuildingShop: 'marche',
  },

  ration: {
    label: 'Ration militaire',
    icon: 'inventory_2',
    type: 'consumable',
    effects: { faim: +5 },
    prix: 12,
    inBuildingShop: 'taverne',
  },

  cafe: {
    label: 'Café noir',
    icon: 'coffee',
    type: 'consumable',
    effects: { forme: +2 },
    prix: 5,
    inBuildingShop: 'taverne',
  },

  biere: {
    label: 'Bière',
    icon: 'sports_bar',
    type: 'consumable',
    effects: { forme: +1, faim: +1 },
    prix: 5,
    inBuildingShop: 'taverne',
  },
// ───── Repas de taverne

ragout: {
  label: 'Ragoût du jour',
  icon: 'soup_kitchen',
  type: 'consumable',
  effects: { faim: +6, forme: +2 },
  prix: 12,
  stackable: false,
  inBuildingShop: 'taverne',
},

plat_viande: {
  label: 'Plat de viande grillée',
  icon: 'restaurant',
  type: 'consumable',
  effects: { faim: +8, forme: +3 },
  prix: 18,
  inBuildingShop: 'taverne',
},

soupe_legumes: {
  label: 'Soupe de légumes',
  icon: 'ramen_dining',
  type: 'consumable',
  effects: { faim: +5 },
  prix: 10,
  inBuildingShop: 'taverne',
},

assiette_fromages: {
  label: 'Assiette de fromages',
  icon: 'lunch_dining',
  type: 'consumable',
  effects: { faim: +4, reputation: +1 },
  prix: 14,
  inBuildingShop: 'taverne',
},

dessert_maison: {
  label: 'Dessert maison',
  icon: 'icecream',
  type: 'consumable',
  effects: { forme: +2, charisme: +1 },
  prix: 9,
  inBuildingShop: 'taverne',
},

festin_taverne: {
  label: 'Festin complet',
  icon: 'dinner_dining',
  type: 'consumable',
  effects: { faim: +12, forme: +5 },
  prix: 35,
  rarete: 'uncommon',
  inBuildingShop: 'taverne',
},
// ───── Services adultes (abstraits gameplay)

  lit: {
    label: 'Lit',
    icon: 'bedroom_baby',
    type: 'material',
    prix: 600,
    stackable: false,
    inBuildingShop: 'marche',
  },
compagnie_standard: {
  label: 'Petite pipe',
  icon: 'favorite',
  type: 'service',
  effects: { forme: +1},
  prix: 40,
  rarete: 'common',
  stackable: false,
  inBuildingShop: 'taverne',
},

compagnie_luxe: {
  label: 'Pute de luxe',
  icon: 'diamond',
  type: 'service',
  effects: { forme: +6, reputation: +2 },
  prix: 120,
  rarete: 'uncommon',
  inBuildingShop: 'taverne',
},

compagnie_influence: {
  label: 'Orgie',
  icon: 'groups',
  type: 'service',
  effects: { reputation: -4 },
  prix: 250,
  rarete: 'rare',
  inBuildingShop: 'taverne',
},

// -- vehicules

  cheval: {
    label: 'Cheval de trait',
    icon: '',
    type: 'vehicle',
    effects: { vitesse: 0.9 },
    prix: 90,
    rarete: 'common',
    inBuildingShop: 'garage',
  },
  trottinette: {
    label: 'Trottinette',
    icon: '',
    type: 'vehicle',
    effects: { vitesse: 0.8 },
    prix: 90,
    rarete: 'rare',
    inBuildingShop: 'garage',
  },
  autruche_de_course: {
    label: 'Autruche de fonction',
    icon: 'cruelty_free',
    type: 'vehicle',
    effects: { vitesse: 0.4,}, // Très rapide, mais tourne quand elle veut
    prix: 300,
    rarete: 'rare',
    inBuildingShop: 'garage',
  }
  ,palanquin_uber: {
    label: 'Palanquin porté par des stagiaires',
    icon: 'groups',
    type: 'vehicle',
    effects: { vitesse: 0.9 }, // Très lent, mais permet de porter énormément de loot
    prix: 500,
    rarete: 'epic',
    inBuildingShop: 'garage',
  }
  ,caddie_des_steppes: {
    label: 'Caddie de supermarché tuné',
    icon: 'shopping_cart',
    type: 'vehicle',
    effects: { vitesse: 0.6 }, // Rapide en descente, mais fait un boucan d'enfer
    prix: 45,
    rarete: 'common',
    inBuildingShop: 'garage',
  },
// ───── Objets illégaux

faux_papiers: {
  label: 'Faux papiers',
  icon: 'badge',
  type: 'illegal',
  effects: { reputation: -1 },
  prix: 300,
  rarete: 'rare',
  tags: ['illegal'],
    inBuildingShop: 'garage',
},

cle_maitre: {
  label: 'Clé maître illégale',
  icon: 'vpn_key',
  type: 'illegal',
  effects: {  },
  prix: 450,
  rarete: 'rare',
    inBuildingShop: 'garage',
  tags: ['illegal'],
},

virus_usb: {
  label: 'Clé USB infectée',
  icon: 'bug_report',
  type: 'illegal',
  effects: {  },
  prix: 520,
  rarete: 'rare',
    inBuildingShop: 'cybercafe'
},

arme_interdite: {
  label: 'Arme interdite',
  icon: 'dangerous',
  type: 'weapon',
  effects: { bonusForce: +4 },
  prix: 900,
  rarete: 'epic',
    inBuildingShop: 'forge',
  tags: ['illegal'],
},

substance_interdite: {
  label: 'Substance interdite',
  icon: 'science',
  type: 'illegal',
  effects: { forme: +8, reputation: -2 },
  prix: 700,
  rarete: 'epic',
  tags: ['illegal'],
    inBuildingShop: 'laboratoire',
},

artefact_vole: {
  label: 'Artefact volé',
  icon: 'diamond',
  type: 'illegal',
  effects: { reputation: +3 },
  prix: 1500,
  rarete: 'epic',
  tags: ['illegal'],
    inBuildingShop: 'marche',
},

  // ───── Pharmacie

  herbes: {
    label: 'Herbes médicinales',
    icon: 'potted_plant',
    type: 'consumable',
    effects: { forme: +2 },
    prix: 12,
    stackable: true,
    inBuildingShop: 'pharmacie',
  },

  bandage: {
    label: 'Bandage',
    icon: 'healing',
    type: 'consumable',
    effects: { forme: +4 },
    prix: 15,
    inBuildingShop: 'pharmacie',
  },

  medikit: {
    label: 'Medikit',
    icon: 'medical_services',
    type: 'consumable',
    effects: { forme: +8 },
    prix: 45,
    rarete: 'uncommon',
    inBuildingShop: 'clinique',
  },

  antidote: {
    label: 'Antidote',
    icon: 'science',
    type: 'consumable',
    effects: { forme: +3 },
    prix: 30,
    inBuildingShop: 'pharmacie',
  },

  // ───── Livres
 
  // --- Physique & Survie ---
  livre_discretion: {
    label: 'Guide de la discrétion',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'discretion' },
    prix: 90,
    rarete: 'uncommon',
    inBuildingShop: 'bibliotheque',
  },
  livre_survie: {
    label: 'Manuel de survie en milieu hostile',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'survie' },
    prix: 75,
    rarete: 'common',
    inBuildingShop: 'bibliotheque',
  },
  livre_navigation: {
    label: 'Atlas des constellations',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'navigation' },
    prix: 120,
    rarete: 'uncommon',
    inBuildingShop: 'bibliotheque',
  },

  // --- Combat ---
  livre_combat: {
    label: 'L\'Art de la Guerre',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'combat' },
    prix: 150,
    rarete: 'rare',
    inBuildingShop: 'bibliotheque',
  },
  livre_closeCombat: {
    label: 'Maîtrise du corps à corps',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'closeCombat' },
    prix: 110,
    rarete: 'uncommon',
    inBuildingShop: 'bibliotheque',
  },
  livre_tir: {
    label: 'Théorie de la trajectoire',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'tir' },
    prix: 110,
    rarete: 'uncommon',
    inBuildingShop: 'bibliotheque',
  },

  // --- Intellect & Technique ---
  livre_informatique: {
    label: 'Architecture des systèmes binaires',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'informatique' },
    prix: 200,
    rarete: 'rare',
    inBuildingShop: 'bibliotheque',
  },
  livre_medecine: {
    label: 'Codex Anatomia',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'medecine' },
    prix: 180,
    rarete: 'rare',
    inBuildingShop: 'bibliotheque',
  },
  livre_alchimie: {
    label: 'Traité des transmutations',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'alchimie' },
    prix: 160,
    rarete: 'rare',
    inBuildingShop: 'bibliotheque',
  },

  // --- Social & Mental ---
  livre_mentalisme: {
    label: 'Secrets de l\'esprit',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'mentalisme' },
    prix: 250,
    rarete: 'epic',
    inBuildingShop: 'bibliotheque',
  },
  livre_marchandage: {
    label: 'Le petit manuel de la négociation',
    icon: 'menu_book',
    type: 'book',
    effects: { competence: 'marchandage' },
    prix: 80,
    rarete: 'common',
    inBuildingShop: 'bibliotheque',
  },

  // --- Magies Elementaires ---
  livre_magieFeu: {
    label: 'Grimoire des flammes éternelles',
    icon: 'auto_stories',
    type: 'book',
    effects: { competence: 'magieFeu' },
    prix: 300,
    rarete: 'epic',
    inBuildingShop: 'bibliotheque',
  },
  livre_magieEau: {
    label: 'Livre des courants et marées',
    icon: 'auto_stories',
    type: 'book',
    effects: { competence: 'magieEau' },
    prix: 300,
    rarete: 'epic',
    inBuildingShop: 'bibliotheque',
  },
  livre_magieTerre: {
    label: 'Chants de la roche',
    icon: 'auto_stories',
    type: 'book',
    effects: { competence: 'magieTerre' },
    prix: 300,
    rarete: 'epic',
    inBuildingShop: 'bibliotheque',
  },
  livre_magieVent: {
    label: 'Le souffle de l\'invisible',
    icon: 'auto_stories',
    type: 'book',
    effects: { competence: 'magieVent' },
    prix: 300,
    rarete: 'epic',
    inBuildingShop: 'bibliotheque',
  },



  // ───── Équipement médiéval

  epee_simple: {
    label: 'Épée simple',
    icon: 'swords',
    type: 'weapon',
    effects: { bonusForce: +1 },
    prix: 60,
    inBuildingShop: 'forge',
  },

  epee_longue: {
    label: 'Épée longue',
    icon: 'swords',
    type: 'weapon',
    effects: { bonusForce: +2 },
    prix: 120,
    rarete: 'uncommon',
    inBuildingShop: 'forge',
  },

  dague: {
    label: 'Dague',
    icon: 'swords',
    type: 'weapon',
    effects: { bonusForce: +1 },
    prix: 40,
    inBuildingShop: 'forge',
  },

  armure_cuir: {
    label: 'Armure cuir',
    icon: 'shield',
    type: 'equipment',
    effects: { bonusForce: +1 },
    inBuildingShop: 'forge',
    prix: 75,
  },

  armure_metal: {
    label: 'Armure métal',
    icon: 'shield',
    type: 'equipment',
    rarete: 'epic',
    effects: { bonusForce: +2 },
    inBuildingShop: 'forge',
    prix: 160,
  },

  // ───── Futur proche

  tablette: {
    label: 'Tablette numérique',
    icon: 'tablet',
    type: 'consumable',
    effects: { intelligence: +1 },
    prix: 200,
    rarete: 'uncommon',
    inBuildingShop: 'cybercafe',
  },

  drone: {
    label: 'Mini-drone',
    icon: 'flight',
    type: 'consumable',
    effects: { perception: +2 },
    prix: 350,
    inBuildingShop: 'cybercafe',
    rarete: 'rare',
  },

  cle_usb: {
    label: 'Clé USB cryptée',
    icon: 'usb',
    type: 'techno',
    inBuildingShop: 'cybercafe',
    effects: {},
    prix: 60,
  },

  // ───── Matériaux

  fer_brut: {
    label: 'Fer brut',
    icon: 'construction',
    type: 'material',
    prix: 40,
    stackable: true,
    inBuildingShop: 'forge',
  },
  planche: {
    label: 'Planche de bois',
    icon: 'construction',
    type: 'material',
    prix: 20,
    stackable: true,
    inBuildingShop: 'marche',
  },

  cuir: {
    label: 'Cuir',
    icon: 'texture',
    type: 'material',
    inBuildingShop: 'marche',
    prix: 18,
    stackable: true,
  },

  plastique: {
    label: 'Plastique',
    icon: 'texture',
    type: 'material',
    inBuildingShop: 'marche',
    prix: 22,
    stackable: true,
  },

  peauDeChat: {
    label: 'Peau de chat',
    icon: 'cats',
    type: 'material',
    illegal: true,
    prix: 18,
    stackable: true,
  },
  poudre_alchimique: {
    label: 'Poudre alchimique',
    icon: 'science',
    type: 'material',
    prix: 35,
    stackable: true,
    inBuildingShop: 'laboratoire',
  },

  cristal: {
    label: 'Cristal énergétique',
    icon: 'diamond',
    type: 'material',
    prix: 90,
    inBuildingShop: 'laboratoire',
    rarete: 'rare',
  },

}


// ─── Géographie des villes (statique) ────────────────────────────────────────
//
// Dimensions de la grille, sorties, position sur la carte du monde.
// Tout le reste (nom, maire, bâtiments) vient de PocketBase (kratCities / kratBuildings).

export const CITY_GEO = {
  haguenau:   { id: 'haguenau',   width: 18, height: 12,  exits: ['0,4', '4,6'],  worldPos: '10,7'  },
  strasbourg: { id: 'strasbourg', width: 20, height: 15, exits: ['0,5', '8,0'],  worldPos: '14,8'  },
  paris:      { id: 'paris',      width: 20, height: 20, exits: ['0,7', '10,0'], worldPos: '2,3'   },
  washington: { id: 'washington', width: 25, height: 10, exits: ['0,7', '10,0'], worldPos: '12,12' },
}

// ─── Assets des bâtiments (statique) ─────────────────────────────────────────
//
// Description narrative et image de la pièce.
// Tout le reste (nom, type, roomConfig, cityId, position) vient de PocketBase (kratBuildings).

// ─── Templates de spawn de PNJ ───────────────────────────────────────────────
// ─── Vitesse de déplacement selon le véhicule en inventaire ─────────────────
// Retourne le meilleur multiplicateur vitesse trouvé (le plus petit = le plus rapide).
// Sans véhicule → 1.0 (coût inchangé).

export function getSpeedMultiplier(inventaire = []) {
  let best = 1.0
  for (const slot of inventaire) {
    const def = ITEM_TYPES[slot.typeId]
    if (def?.type === 'vehicle' && def.effects?.vitesse != null) {
      if (def.effects.vitesse < best) best = def.effects.vitesse
    }
  }
  return best
}

// Chaque entrée décrit un type de PNJ instanciable via actions.spawnNpc(template).
// Champs obligatoires  : name, role, stats, hp
// Champs optionnels    : action, avatarUrl, icon, label, description, maxInGroupe

export const NPC_SPAWN_TEMPLATES = {
  policier: {
    name:        'Policier Municipal',
    role:        'bodyguard',
    action:      'Embaucher',
    avatarUrl:   '',
    stats:       { force: 6, intelligence: 2, charisme: 2 },
    hp:          { current: 12, max: 12 },
    label:       'Policier Municipal',
    description: "Agent d'ordre public chargé de protéger le maire.",
    icon:        'local_police',
    maxInGroupe: 5,
  },
  bodyguard: {
    name:        'Colosse Dmitri',
    role:        'bodyguard',
    action:      'Suivre',
    avatarUrl:   'https://papillon-paragliders.com/wp-content/uploads/2021/08/bodyguard.png',
    stats:       { force: 9, intelligence: 3, charisme: 2 },
    hp:          { current: 20, max: 20 },
    label:       'Garde du corps',
    description: "Un colosse aux bras comme des jambons. Il vous suivra partout, sans poser de questions.",
    icon:        'security',
    maxInGroupe: 2,
  },
  // soldat: { name: 'Soldat', role: 'guard', stats: { force: 8, intelligence: 2, charisme: 1 }, hp: { current: 16, max: 16 }, icon: 'shield', maxInGroupe: 10 },
  // bimbo:  { name: 'Bimbo',  role: 'escort', stats: { force: 2, intelligence: 3, charisme: 9 }, hp: { current: 8, max: 8 },  icon: 'favorite', maxInGroupe: 3 },
}

// ─── Image par type de bâtiment (fallback quand BUILDING_ASSETS n'a pas d'image) ─

export const BUILDING_TYPE_IMAGES = {
  taverne: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJB_0hPX6ea31og9BmxEg3MMF-pse76T2VeGXZEWoIa3ajDrFIHpshsmm08QPhle7eMAPiDByfTQ-fHT5MemKaBTaeS4nQIUHrMe5raV4NQ6aC2RBMpx7KLjVb4sqrwjHwZtjccY63dE2BpHXVkjiLrl0pE9BsZzTe8imm_lplPfuqK3qDZniumzM9YunpjOpVqoW5Ir-5O2Mqhjb1iXKZ5LZnuT2aQnXNFUnfGfloG0KAA6VLnRD2k0j914-PHzKpQCDC1H_Mvsbw',
  marche:  'https://www.pucesdeparissaintouen.com/wp-content/uploads/2020/10/dab7bd3d-cac4-4c29-8128-db8d00e59552_1.jpg',
  // À compléter : mairie, forge, temple, bibliotheque, pharmacie, clinique, cybercafe, garage, laboratoire
  mairie:'https://cdn.paris.fr/paris/2020/09/28/huge-916eeb5eebcfa9106a1309c9e17b2507.jpg',
  forge:'https://www.battlemerchant.com/media/image/10/24/bf/2007_mainpicturea6p4ZlWcf5jcG.jpg',
 
  temple:'https://www.angouleme-tourisme.com/wp-content/uploads/wpetourisme/16253569-diaporama-1200x800.jpg',
  bibliotheque:'https://www.carnets-de-traverse.com/blog/wp-content/uploads/2018/07/00-Blog-Voyage-Bibliotheque-Monde-Inspiration-954x477.jpg',
  pharmacie:'https://monuniverspharmacie.fr/wp-content/uploads/2023/05/test-1.jpg',
  clinique:'https://meditrust.io/wp-content/uploads/2023/10/hopital.jpg',
  cybercafe:'https://thumbs.dreamstime.com/b/joueurs-dans-un-cybercaf%C3%A9-%C3%A9clair%C3%A9-au-n%C3%A9on-412881673.jpg',
  garage:'https://www.aurus-compta.fr/wp-content/uploads/2022/09/ouvrir-un-garage-automobile.jpg',
  laboratoire:'https://www.galveston.com/wp-content/uploads/2019/08/The-Witchery-800x600.jpg',
  maison: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&auto=format&fit=crop',
}

export const BUILDING_ASSETS = {
  'gilded-griffin': {
    description:  "Le feu de l'âtre crépite, enveloppant la salle d'un parfum de faisan rôti et d'ale épicée.",
    roomImageUrl: null,
  },
  'mairie': {
    description:  "Un bâtiment sévère où se décident les affaires de la cité.",
    roomImageUrl: null,
  },
}

// ─── Système de rôles ─────────────────────────────────────────────────────────

export const ROLE_ATTACKS = {
  griffes:    { label: 'Griffes',             dmgMin: 2,  dmgMax: 6,  icon: 'back_hand'           },
  morsure:    { label: 'Morsure',             dmgMin: 3,  dmgMax: 8,  icon: 'pets'                },
  epee:       { label: 'Épée',                dmgMin: 4,  dmgMax: 10, icon: 'hardware'            },
  nunchaku:   { label: 'Nunchaku',            dmgMin: 3,  dmgMax: 9,  icon: 'sports_martial_arts' },
  dague:      { label: 'Dague',               dmgMin: 2,  dmgMax: 7,  icon: 'cut'                 },
  couteau:    { label: 'Couteau',             dmgMin: 2,  dmgMax: 6,  icon: 'cut'                 },
  coup_masse: { label: 'Coup de masse',       dmgMin: 5,  dmgMax: 12, icon: 'gavel'               },
  gifle:      { label: 'Gifle',               dmgMin: 1,  dmgMax: 4,  icon: 'front_hand'          },
  stylo:      { label: 'Stylo (mortel)',      dmgMin: 1,  dmgMax: 3,  icon: 'edit'                },
  rapport:    { label: 'Rapport accablant',   dmgMin: 2,  dmgMax: 5,  icon: 'description'         },
  injonction: { label: 'Injonction admin.',   dmgMin: 0,  dmgMax: 2,  icon: 'gavel', special: 'freeze' },
  jet_pierre: { label: 'Jet de pierre',       dmgMin: 1,  dmgMax: 5,  icon: 'circle'              },
  sortilege:  { label: 'Sortilège',           dmgMin: 2,  dmgMax: 8,  icon: 'auto_fix_high'       },
  poing:      { label: 'Poing',               dmgMin: 1,  dmgMax: 4,  icon: 'sports_martial_arts' },
}

export const ROLE_DEFENSES = {
  blindage:         { label: 'Blindage',         dmgMult: 0.50, icon: 'shield'         },
  esquive:          { label: 'Esquive',           dmgMult: 0.65, icon: 'directions_run' },
  charme:           { label: 'Charme',            dmgMult: 0.75, icon: 'favorite'       },
  analyse_tactique: { label: 'Analyse tactique', dmgMult: 0.70, icon: 'psychology'     },
  injonction_admin: { label: 'Injonction admin.', dmgMult: 1.00, icon: 'gavel', special: 'freeze_attacker' },
}

export const ROLES = {
  monstre:   { cost: 20, label: 'Monstre',   icon: 'pest_control', attacks: ['griffes', 'morsure'],    defenses: []                   },
  gobelin:   { cost: 20, label: 'Gobelin',   icon: 'bug_report',   attacks: ['dague', 'jet_pierre'],   defenses: ['esquive']          },
  bimbo:     { cost: 25, label: 'Bimbo',     icon: 'face',         attacks: ['gifle', 'sortilege'],    defenses: ['charme']           },
  assistant: { cost: 35, label: 'Assistant', icon: 'work',         attacks: ['stylo', 'rapport'],      defenses: ['analyse_tactique'] },
  bodyguard: { cost: 50, label: 'Bodyguard', icon: 'security',     attacks: ['epee', 'nunchaku'],      defenses: ['blindage']         },
  avocat:    { cost: 25, label: 'Avocat',    icon: 'gavel',        attacks: ['stylo', 'injonction'],   defenses: ['injonction_admin'] },
  bandit:    { cost: 0,  label: 'Bandit',    icon: 'person_off',   attacks: ['couteau', 'coup_masse'], defenses: []                   },
}

// Rétrocompatibilité
export const HIRE_COST_BY_ROLE = Object.fromEntries(Object.entries(ROLES).map(([k, v]) => [k, v.cost]))
export const HIRE_COST_DEFAULT = 25

// ─── Rencontres aléatoires (jamais en base) ───────────────────────────────────
export const RANDOM_ENCOUNTERS = {
  city: [
    { id: 'pickpocket', name: 'Pickpocket', stats: { force: 4, intelligence: 6, charisme: 3 }, hp: { current: 8, max: 8 }, loot: { gold: 10 } },
    { id: 'ivrogne', name: 'Ivrogne agressif', stats: { force: 7, intelligence: 2, charisme: 4 }, hp: { current: 12, max: 12 }, loot: { biere: 2, fromage: 1, pain: 1 } },
        { id: 'policier', name: 'Policier', stats: { force: 9, intelligence: 2, charisme: 4 }, hp: { current: 30, max: 30 }, loot: { biere: 1, gold: 5, matraque:1 } },

    // Nouveautés urbaines
    { id: 'mendiant_pro', name: 'Mendiant en auto-entrepreneur', stats: { force: 2, intelligence: 8, charisme: 9 }, hp: { current: 6, max: 6 }, loot: { gold: 50, livre_marchandage: 1 } },
    { id: 'controleur', name: 'Contrôleur de Palanquin', stats: { force: 5, intelligence: 7, charisme: 2 }, hp: { current: 20, max: 20 }, loot: { poudre_alchimique: 1, gold: 5 } },
    { id: 'fanatique', name: 'Prêcheur de la mise à jour 1.2', stats: { force: 3, intelligence: 9, charisme: 10 }, hp: { current: 10, max: 10 }, loot: { dague: 1 } },
    { id: 'rat_pizza', name: 'Rat mutant amateur de pizza', stats: { force: 4, intelligence: 3, charisme: 1 }, hp: { current: 5, max: 5 }, loot: { ration: 1, fromage: 1 } },
    { id: 'influenceur', name: 'Barde influenceur (en plein live)', stats: { force: 2, intelligence: 5, charisme: 12 }, hp: { current: 15, max: 15 }, loot: { compagnie_standard: 1, gold: 100 } },
  ],
  worldmap: [
    { id: 'bandit', name: 'Bandit de grand chemin', stats: { force: 6, intelligence: 4, charisme: 3 }, hp: { current: 15, max: 15 }, loot: { gold: 20 } },
    { id: 'loup', name: 'Loup', stats: { force: 8, intelligence: 1, charisme: 1 }, hp: { current: 18, max: 18 }, loot: { cuir: 1 } },
    { id: 'policier', name: 'Police nationale', stats: { force: 7, intelligence: 5, charisme: 8 }, hp: { current: 40, max: 40 }, loot: {  gold: 15, matraque:1 } },
  
    // Nouveautés sur la carte
    { id: 'vendeur_aspi', name: 'Vendeur d\'aspirateurs à domicile perdu', stats: { force: 4, intelligence: 6, charisme: 8 }, hp: { current: 14, max: 14 }, loot: { livre_mentalisme: 1, gold: 30 } },
    { id: 'golem_pneu', name: 'Golem de vieux pneus recyclés', stats: { force: 12, intelligence: 2, charisme: 1 }, hp: { current: 40, max: 40 }, loot: { plastique: 5, gold: 2 } },
    { id: 'stagiaire_magie', name: 'Stagiaire en Magie du Vent (perte de contrôle)', stats: { force: 3, intelligence: 4, charisme: 5 }, hp: { current: 12, max: 12 }, loot: { livre_magieFeu: 1, livre_magieEau: 1 } },
    { id: 'cycliste_lycra', name: 'Cycliste de l\'extrême en retard', stats: { force: 9, intelligence: 4, charisme: 3 }, hp: { current: 22, max: 22 }, loot: { medikit: 1, casque: 1 } },
    { id: 'licorne_claquee', name: 'Licorne sous anti-dépresseurs', stats: { force: 6, intelligence: 5, charisme: 4 }, hp: { current: 25, max: 25 }, loot: { cuir: 1, plat_viande: 10 } },
  ],
}
