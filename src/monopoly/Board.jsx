import imgToto from '../bitLife/images/M/jeune/avatar6.png';
import imgAlb from '../bitLife/images/M/vieux/avatar4.png';
import imgLucie from '../bitLife/images/M/adulte/avatar2.png';
import imgJoueur from '../DSCN0013.jpg';

export const boardLayout = [
  // --- Ligne du haut (de gauche à droite) ---
  [
    { id: "parcGratuit", order:20, name: "La Meinau", type: "special" },
    { id: "schweig", order:21, name: "Schweighouse", price: 1200, colorGroup: "orangered", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "chance1", order:22, name: "Chance", type: "special" },
    { id: "brumath", order:23, name: "Brumath", price: 1400, colorGroup: "orangered", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "haguenau", order:24, name: "Haguenau", price: 1800, colorGroup: "orangered", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "gareNord", order:25, name: "Gare routiere", price: 2000, type: "gare", colorGroup: "gray", flex: 1 },
    { id: "mutzig", order:26, name: "Mutzig", price: 2000, colorGroup: "yellow", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "Eguisheim", order:27, name: "Eguisheim", price: 2200, colorGroup: "yellow", owner: null, hypotheque: false, type: "propriete", maisons:0 },
      { id: "compElec", order:28, name: "Knack Inc", price: 1800, type: "compagnie" },
    { id: "selestat", order:29, name: "Selestat", price: 2400, colorGroup: "yellow", owner: null, hypotheque: false, type: "propriete", maisons:0 },

    { id: "allezEnPrison", order:30, name: "Allez en taule",  type: "special" },
  ],

  // --- 1 : colonne droite, rangée 1 (haut -> bas) ---
  [
    { id: "ribeau", order:19, name: "Ribeauvillé", price: 1000, colorGroup: "orange", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "spacer_r1", flex: 1, type:'spacer' },
    { id: "Munster", order:31, name: "Munster", price: 2500, colorGroup: "green", owner: null, hypotheque: false, type: "propriete", maisons:0 },
  ],

  // --- 2 ---
  [
    { id: "Saverne", order:18, name: "Saverne", price: 900, colorGroup: "orange", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "spacer_r2", flex: 1, type:'spacer'  },
    { id: "commu2", order:32, name: "Caisse Comm",  type: "special" },
  ],

  // --- 3 ---
  [
    { id: "chance3", order:17, name: "Chance", type: "special" },
  { id: "spacer_r3", flex: 1 , type:'spacer' },
    { id: "kb", order:33, name: "Kaysersberg", price: 2600, colorGroup: "green", owner: null, hypotheque: false, type: "propriete", maisons:0 },
  ],

  // --- 4 ---
  [
       { id: "wissem", order:16, name: "Wissembourg", price: 1800, colorGroup: "orange", owner: null, hypotheque: false, type: "propriete", maisons:0 },
 { id: "spacer_r4", flex: 1 , type:'spacer' },
   { id: "mulhouse", order:34, name: "Mulhouse", price: 2800, colorGroup: "green", owner: null, hypotheque: false, type: "propriete", maisons:0 },
   ],

  // --- 5 ---
  [
      { id: "gareMarch", order:15, name: "Gare marchandise", price: 2000, type: "gare", colorGroup: "gray", owner: null, hypotheque: false, typeLabel: "gare" },
    { id: "spacer_r5", flex: 1 , type:'spacer' },
      { id: "dices", name:"", flex: 1 , type:'special' },
        { id: "spacer_b5", flex: 1 , type:'spacer' },
   { id: "gareEst", order:35, name: "Gare centrale", price: 2000, type: "gare", colorGroup: "gray", owner: null, hypotheque: false, typeLabel: "gare" },
   ],

  // --- 6 ---
  [
    { id: "schilik", order:14, name: "Schiltigheim", price: 600, colorGroup: "hotpink", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "spacer_r6", flex: 1 , type:'spacer' },
    { id: "chance6", order:36, name: "Chance", type: "special" } ],

  // --- 7 ---
  [
    { id: "krauter", order:13, name: "Krautergersheim", price: 1000, colorGroup: "hotpink", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "spacer_r7", flex: 1, type:'spacer'  },
    { id: "colmar", order:37, name: "Colmar", price: 3500, colorGroup: "royalblue", owner: null, hypotheque: false, type: "propriete", maisons:0 },
  ],

  // --- 8 ---
  [
   { id: "compEau", order:12, name: "Heineken", price: 1800, type: "compagnie", owner: null, hypotheque: false },
  
    { id: "spacer_r8", flex: 1 , type:'spacer' },
   { id: "taxe", order:38, name: "Taxe", type: "special" },
 ],

  // --- 9 ---
  [
      { id: "illkirch", order:11, name: "Illkirch", price: 1600, colorGroup: "hotpink", owner: null, hypotheque: false, type: "propriete", maisons:0 },
 
    { id: "spacer_r9", flex: 1 , type:'spacer' },
    { id: "strasbourg", order:39, name: "Strasbourg", price: 4000, colorGroup: "royalblue", owner: null, hypotheque: false, type: "propriete", maisons:0 },
  ],

  // --- 10 : ligne du bas (11 cases, gauche -> droite) ---
  [
    { id: "prison", order:10, name: "Prison ", type: "special" },
      { id: "mase", order:9, name: "Masevaux", price: 1400, colorGroup: "lightblue", owner: null, hypotheque: false, type: "propriete", maisons:0 },
   { id: "chance2", order:8, name: "Chance", type: "special" },
     { id: "Guebwiller", order:7, name: "Guebwiller", price: 1200, colorGroup: "lightblue", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "Thann", order:6, name: "Thann", price: 1000, colorGroup: "lightblue", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "gareLyon", order:5, name: "Gare de triage", price: 2000, type: "gare", colorGroup: "gray", flex: 1 },
    { id: "impots", order:4, name: "Impôts", type: "special" },
    
    { id: "marienthal", order:3, name: "Marienthal", price: 600, colorGroup: "brown", owner: null, hypotheque: false, type: "propriete", maisons:0 },
    { id: "commu1", order:2, name: "Caisse Comm", type: "special" },
    { id: "Oberhoffen", order:1, name: "Oberhoffen", price: 400, colorGroup: "brown", owner: null, hypotheque: false, type: "propriete", maisons:0 },
     { id: "depart", name: "Départ", type: "special", order:0},
  ],
];


export  const joueursDeBase = [
    { id: 'joueur', name: 'Vous', color: 'red', image:imgJoueur, position: 'top-left', caseNo: 0, argent: 15000, proprietes: [], items:[] },
    { id: 'albert', name: 'Albert', color: 'blue', image:imgAlb, position: 'top-right', caseNo: 0, argent: 15000, proprietes: [] , items:[]},
    { id: 'lucie', name: 'Lucie', color: 'green', image:imgLucie, position: 'bottom-left', caseNo: 0, argent: 15000, proprietes: [] , items:[] },
    { id: 'toto', name: 'Johnny', color: 'violet', image:imgToto, position: 'bottom-right', caseNo: 0, argent: 15000, proprietes: [] , items:[] }
];


export const cartesCommu = [
  { id: "avance_depart", texte: "Avancez jusqu'à la case Départ (encaissez 2000 $).", action: "avancer_depart" },
  { id: "fonds_noel", texte: "Le fonds de Noël arrive à échéance — encaissez 1000 $.", action: "recevoir", params: { montant: 1000 } },
  { id: "soiree_gala", texte: "Soirée de gala — encaissez 500 $ de chaque joueur pour les places de la soirée d'ouverture.", action: "collecter_autres", params: { montant: 500 } },
  { id: "vente_actions", texte: "De la vente d'actions, vous obtenez 450 $.", action: "recevoir", params: { montant: 450 } },
  { id: "remboursement_impot", texte: "Remboursement d'impôt sur le revenu — encaissez 200 $.", action: "recevoir", params: { montant: 200 } },
  { id: "erreur_banque", texte: "Erreur bancaire en votre faveur — encaissez 2000 $.", action: "recevoir", params: { montant: 2000 } },
  { id: "concours_beaute", texte: "Vous avez gagné le deuxième prix d'un concours de beauté — encaissez 100 $.", action: "recevoir", params: { montant: 100 } },
  { id: "heritage", texte: "Vous héritez de 1000 $.", action: "recevoir", params: { montant: 1000 } },
  { id: "services_rendus", texte: "Recevez 250 $ pour services rendus.", action: "recevoir", params: { montant: 250 } },
  { id: "assurance_vie", texte: "L'assurance-vie arrive à échéance — encaissez 1000 $.", action: "recevoir", params: { montant: 1000 } },
  { id: "taxe_scolaire", texte: "Payez la taxe scolaire de 1500 $.", action: "payer", params: { montant: 1500 } },
  { id: "frais_medecin", texte: "Frais de médecin — payez 500 $.", action: "payer", params: { montant: 500 } },
  { id: "reparation_rue", texte: "Vous êtes taxé pour les réparations de la rue — 400 $ par maison et 1150 $ par hôtel.", action: "payer_reparations", params: { maison: 400, hotel: 1150 } },
  { id: "frais_hopital", texte: "Payez les frais d'hôpital de 1000 $.", action: "payer", params: { montant: 1000 } },
  { id: "aller_prison", texte: "Allez en prison — allez directement en prison — ne passez pas par la case Départ — n'encaissez pas 2000 $.", action: "aller_prison" },
  { id: "carte_sortie", texte: "Sortez de prison gratuitement. (Cette carte peut être conservée jusqu'à ce qu'elle soit utilisée ou vendue.)", action: "carte_sortie" },
];

export const cartesChance = [
  { id: "reculer3", texte: "Reculez de 3 cases.", action: "reculer", params: { nb: 3 } },
  { id: "st_charles", texte: "On vous attend a Schiltigheim — si vous passez par la case Départ, encaissez 2000 $.", action: "avancer_case", params: { case: "schilik" } },
  { id: "illinois", texte: "Allez a Haguenau — si vous passez par la case Départ, encaissez 2000 $.", action: "avancer_case", params: { case: "haguenau" } },
  { id: "depart", texte: "Avancez jusqu'à la case Départ (encaissez 2000 $).", action: "avancer_depart" },
  { id: "reading_rr", texte: "Faites le marché de noel de Strasbourg  — Rendez-vous A Strass.", action: "avancer_case", params: { case: "strasbourg" } },
  { id: "boardwalk", texte: "Il faut aller a Marienthal pour le dentiste, recevez 2000$ en passant par la case depart.", action: "avancer_case", params: { case: "marienthal" } },
  { id: "service_proche", texte: "Avancez votre pion jusqu'à la compagnie de services publics la plus proche. Si elle n'est pas possédée, vous pouvez l'acheter. Si elle est possédée, lancez les dés et payez au propriétaire dix fois le montant obtenu.", action: "service_plus_proche" },
  { id: "dividende", texte: "La banque vous verse un dividende de 500 $.", action: "recevoir", params: { montant: 500 } },
  { id: "pret_echeance", texte: "Votre bâtiment et prêt arrivent à échéance — encaissez 1500 $.", action: "recevoir", params: { montant: 1500 } },
  { id: "president", texte: "Vous avez été élu président du conseil d'administration — payez 500 $ à chaque joueur.", action: "payer_autres", params: { montant: 500 } },
  { id: "taxe_pauvres", texte: "Payez la taxe des pauvres de 150 $.", action: "payer", params: { montant: 150 } },
  { id: "reparations", texte: "Faites des réparations générales sur toutes vos propriétés — pour chaque maison, payez 250 $ — pour chaque hôtel, 1000 $.", action: "payer_reparations", params: { maison: 250, hotel: 1000 } },
  { id: "aller_prison", texte: "Allez en prison — allez directement en prison — ne passez pas par la case Départ — n'encaissez pas 2000 $.", action: "aller_prison" },
  { id: "carte_sortie", texte: "Sortez de prison gratuitement. (Cette carte peut être conservée jusqu'à ce qu'elle soit utilisée ou vendue.)", action: "carte_sortie" },
];



  export const getPrixMaison = (colorGroup) => {
    const prix = {
      'brown': 500,
      'lightblue': 500,
      'hotpink': 1000,
      'orange': 1000,
      'orangered': 1500,
      'yellow': 1500,
      'green': 2000,
      'royalblue': 2000
    };
    return prix[colorGroup] || 1000;
  };