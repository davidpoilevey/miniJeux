// Base de données des puzzles d'échecs célèbres
const CHESS_PUZZLES = {
  // MAT DU COULOIR SIMPLE - Position réelle et coordonnées vérifiées
  'back_rank_mate_simple': {
    name: "Mat du couloir",
    difficulty: 'beginner',
    type: 'mate_in_1',
    description: "Les Blancs jouent et mat en 1 coup",
    solution: "1.Rd8#",
    theme: "mat_couloir",
    position: [
      [{type: 'roi', couleur: 'black', hasMoved: false, x: 0, y: 0, id: 'roib'}, null, null, null, null, null, null, null],
      [{type: 'pion', couleur: 'black', hasMoved: false, x: 0, y: 1, id: 'pionb1'}, {type: 'pion', couleur: 'black', hasMoved: false, x: 1, y: 1, id: 'pionb2'}, {type: 'pion', couleur: 'black', hasMoved: false, x: 2, y: 1, id: 'pionb3'}, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, {type: 'tour', couleur: 'white', hasMoved: false, x: 3, y: 7, id: 'tourw'}, null, null, null, {type: 'roi', couleur: 'white', hasMoved: true, x: 7, y: 7, id: 'roiw'}]
    ],
    hint: "Le roi noir est bloqué par ses propres pions sur la première rangée...",
    moves: [
      { 
        from: { row: 7, col: 3 }, // Tour blanche en d1
        to: { row: 0, col: 3 },   // vers d8
        notation: "Rd8#",
        isPlayerMove: true
      }
    ]
  },

"puzzle_41_ineluctable": {
  "name": "Inéluctable",
  "difficulty": "intermediate",
  "type": "mate_in_2",
  "description": "Les Blancs jouent et mat en 2 coups",
  "solution": "1. Dd8+ Rf4 2. Dd4#",
  "theme": "mate_in_2",
  "position": [
    // Rangée 8 (row 0)
    [null, null, null, null, null, { "type": "reine", "couleur": "white", "hasMoved": true, "x": 5, "y": 0, "id": "damew" }, null, null],
    // Rangée 7 (row 1)
    [null, null, {type:'cavalier', couleur:'white', x:2, y:1, id:'cavw'}, null, null, null, null, null],
    // Rangée 6 (row 2)
    [null, null, null, null, { "type": "pion", "couleur": "black", "hasMoved": true, "x": 4, "y": 2, "id": "pionb2" }, null, { "type": "reine", "couleur": "black", "hasMoved": true, "x": 6, "y": 2, "id": "dameb" }, { "type": "pion", "couleur": "black", "hasMoved": true, "x": 7, "y": 2, "id": "pionb1" }],
    // Rangée 5 (row 3)
    [null, null, null, null, { "type": "roi", "couleur": "black", "hasMoved": true, "x": 4, "y": 3, "id": "roib" }, null, { "type": "pion", "couleur": "black", "hasMoved": true, "x": 5, "y": 3, "id": "pionb3" }, null],
    // Rangée 4 (row 4)
    [null, null, null, null, { "type": "pion", "couleur": "black", "hasMoved": true, "x": 4, "y": 4, "id": "pionb4" }, null, { "type": "pion", "couleur": "white", "hasMoved": true, "x": 6, "y": 4, "id": "pionw1" }, null],
    // Rangée 3 (row 5)
    [null, null, null, null,  { "type": "pion", "couleur": "white", "hasMoved": true, "x": 4, "y": 5, "id": "pionw2" }, null,null, { "type": "pion", "couleur": "white", "hasMoved": true, "x": 7, "y": 5, "id": "pionw3" }],
    // Rangée 2 (row 6)
    [null, null, null, null, null, { "type": "pion", "couleur": "white", "hasMoved": true, "x": 5, "y": 6, "id": "pionw4" },  { "type": "roi", "couleur": "white", "hasMoved": true, "x": 6, "y": 6, "id": "roiw" }, null],
    // Rangée 1 (row 7)
    [null, null, null, null, null, null, null, null]
  ],
  "hint": "Un coup de dame centralisé provoque la fuite du roi... et elle revient sur la diagonale.",
  "moves": [
    {
      "from": { "row": 0, "col": 5 },  // f8
      "to": { "row": 0, "col": 3 },    // d8
      "notation": "Dd8+",
      "isPlayerMove": true
    },
    {
      "from": { "row": 2, "col": 4 },  // pion e6
      "to": { "row": 1, "col": 4 },    // e7
      "notation": "e7",
      "isPlayerMove": false
    },
    {
      "from": { "row": 0, "col": 3 },  // d8
      "to": { "row": 4, "col": 3 },    // d4
      "notation": "Dd4#",
      "isPlayerMove": true
    }
  ]
},
'puzzle_42_coordinated_mate': {
    name: "Mat coordonné",
    difficulty: 'intermediate',
    type: 'mate_in_2',
    description: "Les Blancs jouent et mat en 2 coups",
    solution: "1.Fb7+ Rb8 2.Cc6#",
    theme: "mat_coordonne",
    position: [
      // Rangée 8 (row 0): roi noir c8, tour noire f8
      [null, null, {type: 'roi', couleur: 'black', hasMoved: true, x: 2, y: 0, id: 'roib'}, null, null, {type: 'tour', couleur: 'black', hasMoved: false, x: 5, y: 0, id: 'tourb1'}, null, null],
      // Rangée 7 (row 1): tour blanche d7
      [null, null, null, {type: 'tour', couleur: 'white', hasMoved: false, x: 3, y: 1, id: 'tourw'}, null, null, null, null],
      // Rangée 6 (row 2): fou blanc c6, pion noir h6
      [null, null, {type: 'fou', couleur: 'white', hasMoved: false, x: 2, y: 2, id: 'fouw'}, null, null, null, null, {type: 'pion', couleur: 'black', hasMoved: false, x: 7, y: 2, id: 'pionb'}],
      // Rangée 5 (row 3): cavalier blanc e5, tour noire f5
      [null, null, null, null, {type: 'cavalier', couleur: 'white', hasMoved: false, x: 4, y: 3, id: 'cavalierw'}, null, {type: 'tour', couleur: 'black', hasMoved: false, x: 6, y: 3, id: 'tourb2'},  null],
      // Rangées vides
      [null, null, null, null, null, null, null, null],
      // Rangée 3 (row 5): roi blanc h3
      [null, null, null, null, null, null, null, {type: 'roi', couleur: 'white', hasMoved: true, x: 7, y: 5, id: 'roiw'}],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null]
    ],
    hint: "Le fou peut forcer le roi dans un coin où le cavalier donnera mat...",
    moves: [
      { 
        from: { row: 2, col: 2 }, // Fou blanc en c6
        to: { row: 1, col: 1 },   // vers b7 (échec)
        notation: "Fb7+",
        isPlayerMove: true
      },
      { 
        from: { row: 0, col: 2 }, // Roi noir en c8
        to: { row: 0, col: 1 },   // forcé vers b8 (seul coup légal)
        notation: "Rb8",
        isPlayerMove: false
      },
      { 
        from: { row: 3, col: 4 }, // Cavalier blanc en e5
        to: { row: 2, col: 2 },   // vers c6 pour mat
        notation: "Cc6#",
        isPlayerMove: true
      }
    ]
  }
,  "puzzle_61_sacrifice": {
    "name": "Brilliant Sacrifice",
    "difficulty": "advanced",
    "type": "mate_in_3",
    "description": "Les Blancs jouent et font mat en 5 coups",
    "solution": "1.Dxf7+ Txf7 2.Txf7+ Rc8 3.Ta8#",
    "theme": "sacrifice",
    "position": [
      // Rangée 8 (row 0): tour noire f8
      [null, null, null, null, null, {type: 'tour', couleur: 'black', hasMoved: false, x: 5, y: 0, id: 'tourb1'}, null, null],
      
      // Rangée 7 (row 1): pion noir b7, roi noir d7, pion noir f7
      [null, null, {type: 'pion', couleur: 'black', hasMoved: false, x: 2, y: 1, id: 'pionb1'}, {type: 'roi', couleur: 'black', hasMoved: true, x: 3, y: 1, id: 'roib'}, null, {type: 'pion', couleur: 'black', hasMoved: false, x: 5, y: 1, id: 'pionb2'}, null, null],
      
      // Rangée 6 (row 2): fou noir a6, pion noir c6, reine blanche f6
      [null, {type: 'fou', couleur: 'black', hasMoved: false, x: 1, y: 2, id: 'foub1'}, null, {type: 'pion', couleur: 'black', hasMoved: false, x: 3, y: 2, id: 'pionb3'}, null, {type: 'reine', couleur: 'white', hasMoved: false, x: 5, y: 2, id: 'damew'}, null, null],
      
      // Rangée 5 (row 3): pion noir a5, fou blanc c5, pion noir e5
      [null, {type: 'pion', couleur: 'black', hasMoved: false, x: 1, y: 3, id: 'pionb4'}, null, {type: 'fou', couleur: 'white', hasMoved: false, x: 3, y: 3, id: 'fouw1'}, {type: 'pion', couleur: 'black', hasMoved: false, x: 4, y: 3, id: 'pionb5'}, null, null, null],
      
      // Rangée 4 (row 4): fou blanc a4, fou noir d4, pion blanc g4
      [null, {type: 'pion', couleur: 'white', hasMoved: false, x: 1, y: 4, id: 'fouw2'}, null, null, {type: 'fou', couleur: 'black', hasMoved: false, x: 4, y: 4, id: 'foub2'},  null, {type: 'pion', couleur: 'white', hasMoved: false, x: 6, y: 4, id: 'pionw1'}, null],
      
      // Rangée 3 (row 5): roi blanc a3, pion blanc b3, tour blanche f3
      [null, {type: 'roi', couleur: 'white', hasMoved: true, x: 1, y: 5, id: 'roiw'}, {type: 'pion', couleur: 'white', hasMoved: false, x: 2, y: 5, id: 'pionw2'}, null, null, {type: 'tour', couleur: 'white', hasMoved: false, x: 5, y: 5, id: 'tourw1'},null, null],
      
      // Rangée 2 (row 6): reine noire d2
      [null, null, null,null, {type: 'reine', couleur: 'black', hasMoved: false, x: 4, y: 6, id: 'dameb'},  null, null, null],
      
      // Rangée 1 (row 7): tour blanche a1
      [{type: 'tour', couleur: 'white', hasMoved: false, x: 0, y: 7, id: 'tourw2'}, null, null, null, null, null, null, null]
    ],
    "hint": "Un sacrifice de dame peut ouvrir la voie au mat...",
    "moves": [
      {
        "from": { "row": 2, "col": 5 }, // Dame blanche en f6
        "to": { "row": 1, "col": 5 }, // prend le pion en f7 (échec)
        "notation": "Dxf7+",
        "isPlayerMove": true
      },
      {
        "from": { "row": 0, "col": 5 }, // Tour noire en f8
        "to": { "row": 1, "col": 5 }, // prend la dame en f7
        "notation": "Txf7",
        "isPlayerMove": false
      },
      {
        "from": { "row": 5, "col": 5 }, // Tour blanche en f3
        "to": { "row": 1, "col": 5 }, // prend la tour en f7 (échec)
        "notation": "Txf7+",
        "isPlayerMove": true
      },
      {
        "from": { "row": 1, "col": 3 }, // Roi noir en d7
        "to": { "row": 0, "col": 2 }, // vers c8
        "notation": "Rc8",
        "isPlayerMove": false
      },
      {
        "from": { "row": 7, "col": 0 }, // Tour blanche en a1
        "to": { "row": 0, "col": 0 }, // vers a8 pour mat
        "notation": "Ta8#",
        "isPlayerMove": true
      }
    ]
  },
 "puzzle_38_xray": { 
  "name": "Astucieux",
  "difficulty": "intermediate",
  "type": "mate_in_2",
  "description": "Les Blancs jouent et mat en 2 coups",
  "solution": "1. Cg7+ Rg5 2. Dh4#",
  "theme": "Mat en deux",
  "position": [
    // Rangée 8 (row 0)
    [null, null, null, null, null, null, { "type": "tour", "couleur": "white", "hasMoved": false, "x": 6, "y": 0, "id": "tourw1" }, null],
    // Rangée 7 (row 1)
    [null, null, null, null, null, { "type": "pion", "couleur": "black", "hasMoved": false, "x": 6, "y": 1, "id": "pionb1" }, null,{ "type": "cavalier", "couleur": "black", "hasMoved": true, "x": 7, "y": 1, "id": "cavalierb1" }],
    // Rangée 6 (row 2)
    [null, null, null, null, { "type": "cavalier", "couleur": "white", "hasMoved": true, "x": 4, "y": 2, "id": "cavalierw1" }, null, { "type": "pion", "couleur": "black", "hasMoved": false, "x": 6, "y": 2, "id": "pionb2" }, null],
    // Rangée 5 (row 3)
    [null, null, null, null, null, { "type": "roi", "couleur": "black", "hasMoved": true, "x": 5, "y": 3, "id": "roib" },null,null],
    // Rangée 4 (row 4)
    [{ "type": "pion", "couleur": "black", "hasMoved": false, "x": 0, "y": 4, "id": "pionb3" }, null, null, { "type": "reine", "couleur": "white", "hasMoved": false, "x": 3, "y": 4, "id": "damew" }, null, null, null, null],
    // Rangée 3 (row 5)
    [null, { "type": "tour", "couleur": "black", "hasMoved": false, "x": 1, "y": 5, "id": "tourb1" }, null, null, null, { "type": "reine", "couleur": "black", "hasMoved": false, "x": 5, "y": 5, "id": "dameb" }, { "type": "pion", "couleur": "white", "hasMoved": false, "x": 6, "y": 5, "id": "pionw3" }, null],
    // Rangée 2 (row 6)
    [null, null, null, null, null,  { "type": "pion", "couleur": "white", "hasMoved": false, "x": 5, "y": 6, "id": "pionw1" },null, { "type": "pion", "couleur": "white", "hasMoved": false, "x": 7, "y": 6, "id": "pionw2" }],
    // Rangée 1 (row 7)
    [null, null, null, null, null, null, { "type": "roi", "couleur": "white", "hasMoved": false, "x": 6, "y": 7, "id": "roiw" }, null]
  ],
  "hint": "Un échec en g7 oblige le roi à bouger... la suite est simple !",
  "moves": [
    {
      "from": { "row": 2, "col": 4 }, // Cavalier e6 -> g7
      "to": { "row": 1, "col": 6 },
      "notation": "Cg7+",
      "isPlayerMove": true
    },
    {
      "from": { "row": 3, "col": 5 }, // Roi noir f5 -> g5
      "to": { "row": 3, "col": 6 },
      "notation": "Rg5",
      "isPlayerMove": false
    },
    {
      "from": { "row": 4, "col": 3 }, // Dame blanche d4 -> h4
      "to": { "row": 4, "col": 7 },
      "notation": "Dh4#",
      "isPlayerMove": true
    }
  ]
}
,
'puzzle_37_xray': {
    name: "Rayons X",
    difficulty: 'intermediate',
    type: 'mate_in_2',
    description: "Les Blancs jouent et mat en 2 coups",
    solution: "1.Th8+ Fxh8 2.Txh8#",
    theme: "mat en deux",
    position: [
      // Rangée 8 (row 0): tour noire a8, tour noire f8, roi noir g8
      [{type: 'tour', couleur: 'black', hasMoved: false, x: 0, y: 0, id: 'tourb1'}, null, null, null, null, {type: 'tour', couleur: 'black', hasMoved: false, x: 5, y: 0, id: 'tourb2'}, {type: 'roi', couleur: 'black', hasMoved: true, x: 6, y: 0, id: 'roib'}, null],
      // Rangée 7 (row 1): pion noir a7, fou noir g7
      [{type: 'pion', couleur: 'black', hasMoved: false, x: 0, y: 1, id: 'pionb1'}, null, null, null, null, null, {type: 'fou', couleur: 'black', hasMoved: false, x: 6, y: 1, id: 'foub'}, null],
      // Rangée 6 (row 2): pion noir b6, fou blanc f6, pion noir g6
      [null, {type: 'pion', couleur: 'black', hasMoved: false, x: 1, y: 2, id: 'pionb2'}, null, null, null, {type: 'fou', couleur: 'white', hasMoved: false, x: 5, y: 2, id: 'fouw'}, {type: 'pion', couleur: 'black', hasMoved: false, x: 6, y: 2, id: 'pionb3'}, null],
      // Rangée 5 (row 3): pion noir d5, dame noire e5
      [null, null, null, {type: 'pion', couleur: 'black', hasMoved: false, x: 3, y: 3, id: 'pionb4'}, {type: 'dame', couleur: 'black', hasMoved: false, x: 4, y: 3, id: 'dameb'}, null, null, null],
      // Rangée 4 (row 4): pion noir d4
      [null, null, null, {type: 'pion', couleur: 'black', hasMoved: false, x: 3, y: 4, id: 'pionb5'}, null, null, null, null],
      // Rangée 3 (row 5): pion blanc e3, tour blanche h3
      [null, null, null, null, {type: 'pion', couleur: 'white', hasMoved: false, x: 4, y: 5, id: 'pionw1'}, null, null, {type: 'tour', couleur: 'white', hasMoved: false, x: 7, y: 5, id: 'tourw1'}],
      // Rangée 2 (row 6): pion blanc a2, cavalier blanc d2
      [{type: 'pion', couleur: 'white', hasMoved: false, x: 0, y: 6, id: 'pionw2'}, null, null, {type: 'cavalier', couleur: 'white', hasMoved: false, x: 3, y: 6, id: 'cavalierw'}, null, null, null, null],
      // Rangée 1 (row 7): roi blanc c1, tour blanche h1
      [null, null, {type: 'roi', couleur: 'white', hasMoved: true, x: 2, y: 7, id: 'roiw'}, null, null, null, null, {type: 'tour', couleur: 'white', hasMoved: false, x: 7, y: 7, id: 'tourw2'}]
    ],
    hint: "Une tour peut se sacrifier pour que l'autre donne mat...",
    moves: [
      { 
        from: { row: 5, col: 7 }, // Tour blanche en h3
        to: { row: 0, col: 7 },   // vers h8 (échec)
        notation: "Th8+",
        isPlayerMove: true
      },
      { 
        from: { row: 1, col: 6 }, // Fou noir en g7
        to: { row: 0, col: 7 },   // prend la tour en h8
        notation: "Fxh8",
        isPlayerMove: false
      },
      { 
        from: { row: 7, col: 7 }, // Tour blanche en h1
        to: { row: 0, col: 7 },   // prend le fou en h8 pour mat
        notation: "Txh8#",
        isPlayerMove: true
      }
    ]
  }
  , "puzzle_40_mate_in_2": {
  "name": "Mat en 2 sur la 8e rangée",
  "difficulty": "intermediate",
  "type": "mate_in_2",
  "description": "Les Blancs jouent et mat en 2 coups",
  "solution": "1. Th8+ Rg7 2. Dh7#",
  "theme": "mate_in_2",
  "position": [
    // Rangée 8 (row 0)
    [{ "type": "tour", "couleur": "black", "hasMoved": false, "x": 0, "y": 0, "id": "tourb1" }, null, { "type": "tour", "couleur": "black", "hasMoved": false, "x": 2, "y": 0, "id": "tourb2" }, null, null, { "type": "roi", "couleur": "black", "hasMoved": true, "x": 5, "y": 0, "id": "roib" }, null, null],
    // Rangée 7 (row 1)
    [null, null, null, null, null, { "type": "cavalier", "couleur": "black", "hasMoved": false, "x": 5, "y": 1, "id": "cavalierb1" }, null, null],
    // Rangée 6 (row 2)
    [{ "type": "pion", "couleur": "black", "hasMoved": true, "x": 0, "y": 2, "id": "pionb1" }, null, null, { "type": "tour", "couleur": "white", "hasMoved": false, "x": 3, "y": 2, "id": "tourw1" }, null, null, null, { "type": "tour", "couleur": "white", "hasMoved": false, "x": 7, "y": 2, "id": "tourw2" }],
    // Rangée 5 (row 3)
    [null, null, null, null, { "type": "pion", "couleur": "black", "hasMoved": true, "x": 4, "y": 3, "id": "pionb3" }, { "type": "reine", "couleur": "white", "hasMoved": true, "x": 5, "y": 3, "id": "damew" }, null, null],
    // Rangée 4 (row 4)
    [null, null, null, null, null, { "type": "reine", "couleur": "black", "hasMoved": true, "x": 6, "y": 4, "id": "dameb" }, null, null],
    // Rangée 3 (row 5)
    [null, null, { "type": "pion", "couleur": "white", "hasMoved": true, "x": 2, "y": 5, "id": "pionw1" }, null, null, null, null, { "type": "pion", "couleur": "white", "hasMoved": true, "x": 7, "y": 5, "id": "pionw2" }],
    // Rangée 2 (row 6)
    [null, null, null, null, null, { "type": "pion", "couleur": "white", "hasMoved": true, "x": 5, "y": 6, "id": "pionw4" }, { "type": "pion", "couleur": "white", "hasMoved": true, "x": 6, "y": 6, "id": "pionw5" }, null],
    // Rangée 1 (row 7)
    [null, null, null, null, null, null, { "type": "roi", "couleur": "white", "hasMoved": true, "x": 6, "y": 7, "id": "roiw" }, null]
  ],
  "hint": "La tour monte en h8 pour forcer le roi noir à g7, puis la diagonale f5–h7 termine le travail.",
  "moves": [
    {
      "from": { "row": 2, "col": 7 },   // Tour blanche h6
      "to": { "row": 0, "col": 7 },     // h8 (échec)
      "notation": "Th8+",
      "isPlayerMove": true
    },
    {
      "from": { "row": 0, "col": 5 },   // Roi noir f8
      "to": { "row": 1, "col": 6 },     // g7
      "notation": "Rg7",
      "isPlayerMove": false
    },
    {
      "from": { "row": 3, "col": 5 },   // Dame blanche f5
      "to": { "row": 1, "col": 7 },     // h7 (mat)
      "notation": "Dh7#",
      "isPlayerMove": true
    }
  ]
},


};


// Fonction utilitaire pour vérifier les coordonnées
function verifyPuzzleCoordinates(puzzle) {
  console.log(`Vérification du puzzle: ${puzzle.name}`);
  
  puzzle.moves.forEach((move, index) => {
    const fromPiece = puzzle.position[move.from.row][move.from.col];
    console.log(`Coup ${index + 1}: ${move.notation}`);
    console.log(`  De (${move.from.row}, ${move.from.col}): ${fromPiece ? fromPiece.type + '_' + fromPiece.couleur : 'vide'}`);
    console.log(`  Vers (${move.to.row}, ${move.to.col})`);
  });
}

// Vous pouvez utiliser cette fonction pour vérifier :
// Object.values(CHESS_PUZZLES).forEach(verifyPuzzleCoordinates);



// Système de gestion des puzzles
class PuzzleManager {
  constructor() {
    this.currentPuzzle = null;
    this.attempts = 0;
    this.hintsUsed = 0;
    this.solved = false;
    this.timeStarted = null;
    this.currentMoveIndex=0;
    this.playerMoves = []; // Historique des coups du joueur
    this.playerStats = {
      solved: 0,
      totalAttempts: 0,
      totalTimeSpent:0,
      averageTime: 0,
      difficulty: {
        beginner: { solved: 0, attempted: 0 },
        intermediate: { solved: 0, attempted: 0 },
        expert: { solved: 0, attempted: 0 }
      }
    };
  }

  // Charger un puzzle
  loadPuzzle(puzzleKey) {
    this.currentPuzzle = CHESS_PUZZLES[puzzleKey];
    this.attempts = 0;
    this.hintsUsed = 0;
    this.solved = false;
    this.timeStarted = Date.now();
    this.currentMoveIndex=0;
    this.playerMoves = [];
    if (!this.currentPuzzle) {
      throw new Error(`Puzzle '${puzzleKey}' non trouvé`);
    }

    console.log(`🧩 Puzzle chargé: ${this.currentPuzzle.name}`);
    console.log(`🎯 ${this.currentPuzzle.description}`);
    console.log(`⭐ Difficulté: ${this.currentPuzzle.difficulty}`);

    // Mettre à jour les stats
    this.playerStats.difficulty[this.currentPuzzle.difficulty].attempted++;

    return {
      name: this.currentPuzzle.name,
      description: this.currentPuzzle.description,
      difficulty: this.currentPuzzle.difficulty,
      theme: this.currentPuzzle.theme,
      position: this.currentPuzzle.position
    };
  }

  getCurrentExpectedMove() {
    if (!this.currentPuzzle || this.currentMoveIndex >= this.currentPuzzle.moves.length) {
      return null;
    }

    const move = this.currentPuzzle.moves[this.currentMoveIndex];
    return move?.isPlayerMove ? move : null;
  }
  // Vérifier si le coup joué est correct
 validateMove(move) {
    if (!this.currentPuzzle || this.solved) {
      return { valid: false, message: "Aucun puzzle en cours" };
    }

    // Chercher le prochain coup que le joueur doit jouer
    const expectedMove = this.getCurrentExpectedMove();
    
    if (!expectedMove) {
      return { valid: false, message: "Aucun coup attendu du joueur" };
    }

    this.attempts++;
    
    const isCorrect = (
      move.from.row === expectedMove.from.row &&
      move.from.col === expectedMove.from.col &&
      move.to.row === expectedMove.to.row &&
      move.to.col === expectedMove.to.col
    );

    if (isCorrect) {
      // Enregistrer le coup du joueur
      this.playerMoves.push({
        ...move,
        moveIndex: this.currentMoveIndex,
        notation: expectedMove.notation
      });

      // Avancer dans la séquence
      this.currentMoveIndex++;

      // Jouer automatiquement les coups de l'adversaire
      const autoMoves = this.playAutomaticMoves();

      // Vérifier si le puzzle est terminé
      if (this.currentMoveIndex >= this.currentPuzzle.moves.length) {
        return this.completePuzzle(autoMoves);
      }

      // Puzzle pas encore fini, attendre le prochain coup du joueur
      const nextExpectedMove = this.getCurrentExpectedMove();
      return {
        valid: true,
        solved: false,
        message: `✅ Bon coup ! ${expectedMove.notation}`,
        autoMoves: autoMoves,
        nextExpectedMove: nextExpectedMove,
        moveIndex: this.currentMoveIndex,
        totalMoves: this.currentPuzzle.moves.length
      };

    } else {
      return this.handleIncorrectMove(expectedMove);
    }
  }

  playAutomaticMoves() {
    const autoMoves = [];
    
    // Continuer tant qu'il y a des coups automatiques à jouer
    while (
      this.currentMoveIndex < this.currentPuzzle.moves.length &&
      !this.currentPuzzle.moves[this.currentMoveIndex].isPlayerMove
    ) {
      const autoMove = this.currentPuzzle.moves[this.currentMoveIndex];
      autoMoves.push(autoMove);
      this.currentMoveIndex++;
    }

    return autoMoves;
  }

  completePuzzle(autoMoves) {
    this.solved = true;
    const timeSpent = Math.floor((Date.now() - this.timeStarted) / 1000);
    
    // Mettre à jour les stats
    this.playerStats.solved++;
    this.playerStats.totalAttempts += this.attempts;
    this.playerStats.totalTimeSpent += timeSpent;
    this.playerStats.difficulty[this.currentPuzzle.difficulty].solved++;
    
    const score = this.calculateScore(timeSpent);

    return {
      valid: true,
      solved: true,
      message: `🎉 Excellent ! Puzzle résolu en ${this.attempts} coup(s) et ${timeSpent}s`,
      solution: this.currentPuzzle.solution,
      autoMoves: autoMoves,
      playerMoves: this.playerMoves,
      score: score,
      timeSpent: timeSpent
    };
  }

  handleIncorrectMove(expectedMove) {
    let message = `❌ Pas le bon coup. Essai ${this.attempts}`;
    
    // Indices progressifs selon les tentatives
    if (this.attempts === 2) {
      message += `\n💡 Indice: ${this.currentPuzzle.hint}`;
      this.hintsUsed++;
    } else if (this.attempts === 4) {
      message += `\n🔍 La pièce à jouer est sur ${this.formatSquare(expectedMove.from)}`;
      this.hintsUsed++;
    } else if (this.attempts === 6) {
      message += `\n🎯 Solution: ${this.currentPuzzle.solution}`;
    }

    return {
      valid: false,
      solved: false,
      message: message,
      attempts: this.attempts,
      expectedMove: expectedMove
    };
  }


  // Obtenir un indice
  getHint() {
    if (!this.currentPuzzle) return "Aucun puzzle en cours";
    
    this.hintsUsed++;
    
    if (this.hintsUsed === 1) {
      return `💡 ${this.currentPuzzle.hint}`;
    } else if (this.hintsUsed === 2) {
      return `🔍 Regardez la pièce sur ${this.formatSquare(this.currentPuzzle.moves[0].from)}`;
    } else if (this.hintsUsed === 3 && this.currentPuzzle.moves.length>1) {
      return `🔍 Faut tout te dire ?.. Ensuite c'est ${this.formatSquare(this.currentPuzzle.moves[2].from)}`;
    } else {
      return `🎯 Solution complète: ${this.currentPuzzle.solution} ${this.hintsUsed}`;
    }
  }

  // Calculer le score selon performance
  calculateScore(timeSpent) {
    let baseScore = 1000;
    
    // Malus pour les tentatives
    baseScore -= (this.attempts - 1) * 100;
    
    // Malus pour les indices
    baseScore -= this.hintsUsed * 150;
    
    // Bonus selon la difficulté
    const difficultyBonus = {
      beginner: 0,
      intermediate: 200,
      expert: 500
    };
    baseScore += difficultyBonus[this.currentPuzzle.difficulty];
    
    // Bonus temps (moins de 30s = bonus)
    if (timeSpent < 30) baseScore += 200;
    else if (timeSpent < 60) baseScore += 100;
    
    return Math.max(baseScore, 100); // Score minimum de 100
  }

 

  // Obtenir un puzzle aléatoire selon le niveau
  static getRandomPuzzle(difficulty = 'beginner') {
    const suitablePuzzles = Object.keys(CHESS_PUZZLES).filter(
      key => CHESS_PUZZLES[key].difficulty === difficulty
    );
    
    if (suitablePuzzles.length === 0) {
      return Object.keys(CHESS_PUZZLES)[0];
    }
    
    return suitablePuzzles[Math.floor(Math.random() * suitablePuzzles.length)];
  }


  // Formatage des cases
  formatSquare(position) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    return files[position.col] + ranks[position.row];
  }

  // Obtenir les statistiques
  getStats() {
    const totalSolved = this.playerStats.solved;
    const totalAttempted = Object.values(this.playerStats.difficulty)
      .reduce((sum, diff) => sum + diff.attempted, 0);
      
    const successRate = totalAttempted > 0 ? 
      Math.round((totalSolved / totalAttempted) * 100) : 0;

    return {
      ...this.playerStats,
      totalAttempted,
      successRate,
      averageTime: totalSolved > 0 ? 
        Math.round(this.playerStats.totalTimeSpent / totalSolved) : 0,
      averageAttempts: totalSolved > 0 ? 
        Math.round(this.playerStats.totalAttempts / totalSolved) : 0
    };
  }

  // Reset des stats
  resetStats() {
    this.playerStats = {
      solved: 0,
      totalAttempts: 0,
      totalTimeSpent: 0,
      averageTime: 0,
      difficulty: {
        beginner: { solved: 0, attempted: 0 },
        intermediate: { solved: 0, attempted: 0 },
        expert: { solved: 0, attempted: 0 }
      }
    };
  }
}


// Export
export { PuzzleManager, CHESS_PUZZLES };

// Exemple d'utilisation:
/*
const puzzleManager = new PuzzleManager();

// Charger un puzzle
const puzzle = puzzleManager.loadPuzzle('mate_in_2_easy_1');

// Dans ton composant, afficher la position puzzle.position sur l'échiquier

// Quand le joueur joue un coup
const result = puzzleManager.validateMove(playerMove);
if (result.solved) {
  showCelebration(`Score: ${result.score} points !`);
}

// Menu des puzzles
const beginnerPuzzles = PuzzleManager.getPuzzlesByCategory('beginner');
const puzzleOfTheDay = PuzzleManager.getPuzzleOfTheDay();
*/