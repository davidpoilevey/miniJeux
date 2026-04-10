// data/maps.js

export const TILE_SIZE = 32;
export const MAP_WIDTH = 30*TILE_SIZE;
export const MAP_HEIGHT = 30*TILE_SIZE;

export const mapsByName = {
  test: {
    name: 'test', nuit:true,
    tileMap: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1], // ← 2 = sortie
      [1, 0, 0, 0, 1], // 9 = coffre
      [1, 0, 0, 0, 1],
      [1, 0, 4, 4, 4,4,4,4,0,1],
      [1, 0, 4, 4, 4,4,4,4,0,1],
      [1, 0, 4, 4, 4,4,4,4,0,1],
      [1, 0, 0, 0, 0,0,0,0,0,1],
      [1, 1, 1, 1, 1],
    ],
    exits: {
      '2,2': {
        targetZone: 'village',
        spawn: { x: 1, y: 1 } // coordonnées dans la nouvelle map
      }
    }
    ,interactions: {
    '3,3': { dialogueId: 'coffre1' },
    '2,2': { dialogueId: 'porteA', keyRequired: 'cle_or' }
  }
  , foreground:{
'1,2':{tileType:'dechirable', dialogueId:'murDechirable'},
'2,1':{tileType:'dechirable', dialogueId:'murDechirable'},
'2,2':{tileType:'rocher', dialogueId:'porteA'},

'3,1':{tileType:'arbre', state:"plein"},
'5,2':{tileType:'pommier'},
'6,4':{tileType:'souche'}, // champignon buisson trou
'7,2':{tileType:'caillou'},
'6,6':{tileType:'trou'},
}
  }
  , labyrintheGPT:{
    name:'labyrintheGPT' , nuit:true
    , tileMap: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ,[0,"R","LR","LR","LR","LR","LR","LR","LR","LR","LR","BL",0,"BR","LR","BL",0,"BR","LR","LR","LR","BL",0,"BR","LR","LR","LR","LR","LR","BL"]
      ,[0,0,0,0,0,0,0,0,0,0,0,"TB",0,"TB",0,"TB",0,"TB",0,0,0,"TB",0,"TB",0,0,0,0,0,"TB"]
      ,[0,"BR","LR","LR","LR","LR","LR","L",0,"BR","LR","TL",0,"TB",0,"TB",0,"TB",0,"B",0,"TR","LR","TL",0,"BR","LR","LR","LR","TL"]
      ,[0,"TB",0,0,0,0,0,0,0,"TB",0,0,0,"TB",0,"TB",0,"TB",0,"TB",0,0,0,0,0,"TB",0,0,0,0]
      ,[0,"TBR",0,"LR","LR","LR","LR","LR","LR","TL",0,"R","LR","TBL",0,"TR","LR","TL",0,"TBR","LR","BL",0,"BR","LR","TL",0,"BR","LR","BL"]
      ,[0,"TB",0,0,0,0,0,0,0,0,0,0,0,"TB",0,0,0,0,0,"TB",0,"TB",0,"TB",0,0,0,"TB",'coffre',"TB"]
      ,[0,"TB",0,"BR","LR","LR","LR","L",0,"BR","LR","BLR","LR","TL",0,"R","LR","BL",0,"TB",0,"TR","LR","TL",0,"BR","LR","TBL",0,"TB"]
      ,[0,"TB",0,"TB",0,0,0,0,0,"TB",0,"TB",0,0,0,0,0,"TB",0,"TB",0,0,0,0,0,"TB",0,"TB",0,"TB"]
      ,[0,"TB",0,"TBR","LR","LR","LR","LR","LR","TL",0,"TB",0,"BR","LR","BL",0,"TB",0,"TR","LR","LR","LR","BL",0,"T",0,"TB",0,"TB"]
      ,[0,"TB",0,"TB",0,0,0,0,0,0,0,"TB",0,"TB",0,"TB",0,"TB",0,0,0,0,0,"TB",0,0,0,"TB",0,"TB"]
      ,[0,"TB",0,"TR","LR","BL",0,"BR","LR","LR","LR","TL",0,"TB",0,"TBR","LR","TL",0,"BR","LR","LR","LR","TL",0,"BR","LR","TL",0,"TB"]
      ,[0,"TB",0,0,0,"TB",0,"TB",0,0,0,0,0,"TB",0,"TB",0,0,0,"TB",0,0,0,0,0,"TB",0,0,0,"TB"]
      ,[0,"TR","LR","BL",0,"TB",0,"TR","LR","BL",0,"BR","LR","TL",0,"TB",0,"BR","LR","TL",0,"R","LR","LR","LR","TBLR","LR","BL",0,"TB"]
      ,[0,0,0,"TB",0,"TB",0,0,0,"TB",0,"TB",0,0,0,"TB",0,"TB",0,0,0,0,0,0,0,"TB",0,"TB",0,"TB"]
      ,[0,"BR","LR","TL",0,"T",0,"BR","LR","TL",0,"TBR","LR","BL",0,"T",0,"TB",0,"BR","LR","LR","LR","BL",0,"T",0,"TB",0,"TB"]
      ,[0,"TB",0,0,0,0,0,"TB",0,0,0,"TB",0,"TB",0,0,0,"TB",0,"TB",0,0,0,"TB",0,0,0,"TB",0,"TB"]
      ,[0,"TR","LR","LR","LR","BL",0,"TBR","LR","BL",0,"T",0,"TR","LR","BL",0,"TR","LR","TL",0,"B",0,"TR","LR","BL",0,"TB",0,"TB"]
      ,[0,"LR",0,0,0,"TB",0,"TB",0,"TB",0,0,0,0,0,"TB",0,0,0,0,0,"TB",0,0,0,"TB",0,"TB",0,"TB"]
      ,[0,"B",0,"BR","LR","TL",0,"TB",0,"TB",0,"BR",0,"BL",0,"TBR","LR","LR","LR","BLR","LR","TL",0,"BR","LR","TL",0,"TB",0,"T"]
      ,[0,"TB",0,"TB",0,0,0,"TB",0,"TB",0,"TB",0,"TB",0,"TB",0,0,0,"TB",0,0,0,"TB",0,0,0,"TB",0,0]
      ,[0,"TB",0,"TR","LR","BL",0,"T",0,"TR","LR","TBL",0,"TB",0,"TR","LR","BL",0,"TB",0,"BR","LR","TL",0,"R","LR","TLR","LR","BL"]
      ,[0,"TB",0,0,0,"TB",0,0,0,0,0,"TB",0,"TB",0,0,0,"TB",0,"TB",0,"TB",0,0,0,0,0,0,0,"TB"]
      ,[0,"TBR","LR","L",0,"TR","LR","LR","LR","BL",0,"T",0,"TBR","LR","BL",0,"T",0,"TBR",0,"TL",0,"BR","LR","BL",0,"BR","LR","TBL"]
      ,[0,"TB",0,0,0,0,0,0,0,"TB",0,0,0,"TB",0,"TB",0,0,0,"TB",0,0,0,"TB",0,"TB",0,"TB",0,"TB"]
      ,[0,"TBR","LR","BLR","LR","LR","LR","L",0,"TR","LR","BL",0,"TB",0,"TR","LR","BL",0,"TR","LR","LR","LR","TL",0,"TR","LR","TL",0,"TB"]
      ,[0,"TB",0,"TB",0,0,0,0,0,0,0,"TB",0,"TB",0,0,0,"TB",0,0,0,0,0,0,0,0,0,0,0,"TB"]
      ,[0,"TB",0,"TR","LR","LR","LR","BLR","LR","L",0,"TB",0,"T",0,"BR","LR","TL",0,"BR","LR","LR","LR","LR","LR","BLR","LR","L",0,"TB"]
      ,[0,"TB",0,0,0,0,0,"TB",0,0,0,0,0,0,0,"TB",0,0,0,0,0,0,0,0,0,"TB",0,0,0,"TB"]
      ,[0,"TR","LR","LR","LR","L",0,"TR","LR","LR","LR","TLR","LR","LR","LR","TL",0,"R","LR","TLR","LR","LR","LR","L",0,"TR","LR","LR","LR","TL"]
    ]
    , exits:{
      '29,6':{
        targetZone:'labyrintheGPT'
        , spawn:{ y:28, x:16}
      },
      '2,0':{
        targetZone:'etage'
        , spawn:{ y:16, x:20}
      },
      '29,16':{
        targetZone:'labyrintheGPT'
        , spawn:{ y:28, x:6}
      }
      ,'29,24':{
        targetZone:'labyrintheGPT'
        , spawn:{ y:20, x:28}
      }
      ,'20,29':{
        targetZone:'labyrintheGPT'
        , spawn:{ y:28, x:24}
      }
    }
    , foreground:{
      '10,2':{tileType:'tonnerre'},
      '18,4':{tileType:'coffre'},
      '4,29':{tileType:'vieuxSage'},
      '26,5':{tileType:'tonnerre'},
      '19,12':{tileType:'2'},
      '23,20':{tileType:'2'},
      '26,2':{tileType:'coussin',ratio:1.5},
      '28,2':{tileType:'croqs'},
      '28,11':{tileType:'dechirable'},
      '28,19':{tileType:'dechirable'},
      '16,15':{tileType:'tonnerre'},
      '21,18':{tileType:'tonnerre'},
      '18,23':{tileType:'tonnerre'},
    }
    , interactions:{
     '18,4': { dialogueId: 'cleLabyrinthe' ,behaviorType:'coffre',once:true}
     ,'6,28': { behaviorType:'coffre',reward:{croqs:100, inventory:['lanterne']}}
    
      ,'19,12':{dialogueId:'porteFermee', behaviorType:'2', keyRequired:'cleLabyrinthe'}
      ,'23,20':{dialogueId:'porteFermee', behaviorType:'2', keyRequired:'cleLabyrinthe'}
      ,'4,29':{dialogueId:'labyrinthe', behaviorType:'pnj', miaulable:true}
    }
  }
  ,balcon: {
    name: 'balcon',
     questOnEnter: "QuetePrincipale",
    tileMap: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1], 
      [1, 0, 0, 0, 1], 
      [1, 1, 1, 1, 1],
    ],
    exits: {
      '3,5': {
        targetZone: 'chambreParent',
        spawn: { x: 1, y: 2 } // coordonnées dans la nouvelle map
      }
      ,'4,5': {
        targetZone: 'chambreParent',
        spawn: { x: 1, y: 3 } // coordonnées dans la nouvelle map
      }
    }
    ,interactions: {
    '3,4': { dialogueId: 'porteParent', once:true, keyRequired: 'puissanceDuMiaou' },
    '4,4': { dialogueId: 'porteParent', once:true, keyRequired: 'puissanceDuMiaou' },
'7,2':{ dialogueId:'sieste', once:true},
  }, foreground:{
'3,4':{tileType:'2'},
'4,4':{tileType:'2'},
'1,1':{tileType:'buisson'},
'8,1':{tileType:'tableCarre'},
'7,2':{tileType:'coussin', ratio:2}
}
  },
  chambreParent: {
    name: 'chambreParent', questOnEnter: "missionMarathon",
    tileMap: [
      [1, 1, 1, 1,1,1,1, 1],
      [1, 0, 100, 100,0, 0,0,1],
      [2, 0, 0, 0,0, 0,0,2],
      [2, 0, 0, 0,0, 0,0,1],
      [1, 0, 0, 0,0, 0,0,1],
      [1, 0, 0, 0,0,0,0, 1],
      [1, 0, 0, 0,0,0,0,1],
      [1, 0, 0, 0,0, 0,0,1],
      [1, 1, 1, 1,1, 1,1,1],
    ],
    exits: { '2,0': {
        targetZone: 'balcon',
        spawn: { x: 3, y: 3 } // coordonnées dans la nouvelle map
      },'3,0': {
        targetZone: 'balcon',
        spawn: { x: 3, y: 4 } // coordonnées dans la nouvelle map
      },'2,8': {
        targetZone: 'etage',
        spawn: { x: 0, y: 13 } // coordonnées dans la nouvelle map
      }
    }
     ,interactions: {
      '7,1': { dialogueId: 'croqsTuto', once:true, behaviorType:'croqs' }
      ,'7,3':{ dialogueId:'sieste', once:true}
      ,'1,2':{ dialogueId:'missionMarathon',behaviorType:'declenchable', miaulable:true}
    }
    , foreground:{
      '0,2':{tileType:'armoireVide'},
      '7,1':{tileType:'croqs'},
    '3,2':{tileType:'301'},
    '7,3':{tileType:'coussin'},
    '7,6':{tileType:'alcool'},
    }

  },
  cave:{
    name:'cave',nuit:true,
    tileMap:[
      ['X', 'X','X', 'X', 'X','X', 'X','X', 'X', 'X', 'X', 'X','X', 'X', 'X', 'X', 'X','X', 'X', 'X'],
      ['X', 100, 100, 100, 100, 100, 100, 0, 'X', 0, 0, 'X', 'X', 0, 0, 0, 0, 0, 'X', 'X',],
      ['X', 100, 100, 100, 100, 100, 100, 0, 'X', 0, 0,'X', 'X', 0, 0, 0, 0, 0, 'X', 'X',],
      ['X', 100, 100, 100, 100, 100, 100, 0, 'X', 0, 0, 'X', 'X', 0, 0, 0, 0, 0, 'X', 'X',],
      ['X', 0, 0, 0, 0, 0, 0, 0, 'X', 0, 0, 'X', 'X', 0, 0, 0, 0, 0, 'X', 'X',],
      ['X', 0, 0, 0, 0, 0, 0, 0, 'X', 0, 0, 'X', 'X', 0, 0, 0, 0, 0, 'X', 'X',],
      ['X', 2, 0, 0, 0, 0, 0, 0, 'X', 0, 0, 'X', 'X', 0, 0, 0, 0, 0, 'X', 'X',],
      ['X', 0, 0, 0, 0, 0, 0, 0, 'X', 0, 0, 'X', 'X', 0, 0, 0, 0, 0, 'X', 'X',],
      ['X', 100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 'X', 'X', 0, 0, 0, 0, 0, 'X', 'X',],
      ['X', 100, 100, 0, 0, 0, 0, 0, 0, 0, 0,'X', 'X','X', 'X', 'X', 'X', 0,'X', 'X',],
      ['X', 100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 'X','X','X','X', 'X','X', 2, 'X', 'X',],
      ['X', 100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 'X','X', 0, 0, 0, 0, 0, 0, 'X'],
      ['X', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'X','X', 0, 0, 0, 0, 0, 0, 'X'],
      ['X', 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 'X','X', 0, 0, 0, 0, 0, 0, 'X'],
      ['X', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'X','X', 0, 0, 0, 0, 0, 0, 2],
      ['X', 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 'X','X', 0, 0, 0, 0, 0, 0, 'X'],
      ['X', 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 'X','X', 0, 0, 0, 0, 0, 0, 'X'],
      ['X', 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 'X','X', 0, 0, 0, 0, 0, 0, 'X'],
      ['X', 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 'X','X', 0, 0, 0, 0, 0, 0, 'X'],
      [ 'X', 'X','X', 'X', 'X', 'X', 'X','X', 'X', 'X', 'X', 'X','X', 'X', 'X', 'X', 'X','X', 'X', 'X']
    ]
    , exits:{
      '6,0':{
        targetZone:'jardin', spawn:{x:4,y:10}
      },
      '1,9':{
        targetZone:'rdc', spawn:{x:8,y:13}
      },
      '14,20':{
        targetZone:'jardin', spawn:{x:14,y:13}
      }
    }
    , foreground:{
      // cote jardin
     '2,15':{tileType:'griffe', ratio:2},
 '13,14':{tileType:'armoire', ratio:2},
 '18,18':{tileType:'coussin', ratio:1.5},
 '18,15':{tileType:'rat'},
 '16,14':{tileType:'sale'},
 '8,13':{tileType:'gipsy'},
 '1,17':{tileType:'gipsy'},
 '1,13':{tileType:'gipsy'},
 '11,13':{tileType:'croqs'}
 // cote maison
  ,'1,9':{tileType:'110', ratio:2},
 '3,2':{tileType:'sale'},
 '2,7':{tileType:'piquant'},
 '14,5':{tileType:'dechirable'},
 '14,6':{tileType:'tonnerre'},
 '7,9':{tileType:'tonnerre'},
 '3,9':{tileType:'tonnerre'},
 '1,7':{tileType:'gipsy'},
 '6,1':{tileType:'2', dialogueId:'vasistas',keyRequired:'cleJardin',once:true},//vasistas
 '1,1':{tileType:'armoire', ratio:2},
 '1,4':{tileType:'armoire', ratio:2},
 '16,7':{tileType:'armoireVide', ratio:2},
 '7,1':{tileType:'canape', ratio:2},
 '17,1':{tileType:'coussin', ratio:2},
 '17,3':{tileType:'lavaboPlein', ratio:2},
 '18,3':{tileType:'alcool', duree:10000},
 
 
    },

    interactions:{
 '10,17':{behaviorType:'2', dialogueId:'porteFermee'
  ,once:true, keyRequired:'codeArme'},
 '8,13':{behaviorType:'sale'},
 '1,17':{behaviorType:'piquant'},
 '1,13':{behaviorType:'sale'},
 '14,6':{dialogueId:'tutoTonnerre',behaviorType:'tonnerre', once:true},
 '2,15':{dialogueId:'armeChatonPrez', once:true, behaviorType:'pickable', state:10,item:"armeChaton"},
 '15,14':{dialogueId:'bordelCave', behaviorType:'declenchable'},
 '18,15':{dialogueId:'ratShaman', behaviorType:'declenchable'},
    }
  },
  etage:{
    name:'etage', questOnEnter: "escalier",
    tileMap:[
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 100, 100, 100, 100, 'TB', 0,0, 'TB', 1, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 0,100, 100, 100, 100, 'TB', 0, 0,'TB',  1, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 0, 100, 100, 100, 100, 'T', 0, 0,'T',  1, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
      [1, 1, 1, 1, 1, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 100, 100, 100, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 100, 100, 100, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
      [5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
      [5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
    , exits: { '12,0': {
        targetZone: 'chambreParent',
        spawn: { x: 7, y: 3 } // coordonnées dans la nouvelle map
      },'13,0': {
        targetZone: 'chambreParent',
        spawn: { x: 7, y: 3 } // coordonnées dans la nouvelle map
      },'14,0': {
        targetZone: 'chambreParent',
        spawn: { x: 7, y: 3 } // coordonnées dans la nouvelle map
      }
      ,'16,10': {
        targetZone: 'rdc',
        spawn: { x: 7, y: 22 } // coordonnées dans la nouvelle map
      }
      ,'16,11': {
        targetZone: 'rdc',
        spawn: { x: 7, y: 22 } // coordonnées dans la nouvelle map
      }
    
    }
    , foreground:{
      '15,10':{tileType:'110', ratio:2},
      '15,11':{tileType:'2'},//escalier
      '17,10':{tileType:'110', ratio:2},
      '14,17':{tileType:'2'},//chambre rodolphe
      '3,20':{tileType:'dechirable'}, //mur dechirable
      '3,21':{tileType:'dechirable'},      '3,22':{tileType:'dechirable'},      '3,23':{tileType:'dechirable'},      '2,23':{tileType:'dechirable'},
      '1,23':{tileType:'dechirable'},      '2,20':{tileType:'dechirable'},      '1,20':{tileType:'dechirable'},
      '5,22':{tileType:'302'},//lit beige
      '6,25':{tileType:'coussin', ratio:1.5},
      '5,8':{tileType:'maman',ratio:2},
      '2,12':{tileType:'wc',ratio:2},
      '3,12':{tileType:'sale'},
      '3,1':{tileType:'baignoire', ratio:3},
      '12,25':{tileType:'tableCarre', ratio:2},
      '17,28':{tileType:'coffre'},
      '15,14':{tileType:'fauteuil', ratio:2},
      '13,21':{tileType:'fauteuilBureau', ratio:2},
      '15,15':{tileType:'rod', ratio:2},
      '1,16':{tileType:'armoire', ratio:2},
      '1,7':{tileType:'armoireVide', ratio:2},
 '3,7':{tileType:'alcool', duree:10000},
 '3,8':{tileType:'potion'},
 '3,14':{tileType:'alcool', duree:15000},
      
      '5,17':{tileType:'vase'},
      '1,21':{tileType:'coffre', ratio:2},//coffretMegaphone
      '8,9':{tileType:'lavabo', ratio:2}
    }
    , interactions:{
      '15,10':{dialogueId:'queteEscalier'
        , once: true // aussi possible, startNode:"actionCachee"
        , keyRequired:'accesEscalierEtage'
        , behaviorType:'2'
        , openMessage:'Bravo, tu peux descendre maintenant'},
      '15,11':{dialogueId:'queteEscalier', once: true, keyRequired:'accesEscalierEtage'
        , behaviorType:'2', openMessage:'Bravo, tu peux descendre maintenant'},
      '11,12':{dialogueId:'porteSalleDeBain',keyRequired:'cleSalleDeBain'},
       '11,17':{dialogueId:'tutoDechirable', once:true},
       '1,21':{dialogueId:'coffretMegaphone',},
       '15,16':{dialogueId:'rodolphe', behaviorType:'pnj', miaulable:true},
       '14,17':{ dialogueId: 'porteFermee', behaviorType:'2', once:true, keyRequired:'cleRodolphe' },
       '4,29':{dialogueId:'parLaFenetre', miaulable:true, behaviorType:'declenchable'},
       '5,29':{dialogueId:'parLaFenetre', miaulable:true, behaviorType:'declenchable'},
       '17,28':{behaviorType:"coffre", dialogueId:"boiteARod"
        , keyRequired: 'cleLaby',
    reward: { inventory: ['cleOr'] }},
       '3,17':{behaviorType:"vase"  },
      '5,8':{dialogueId:'mamanSdb',  miaulable:true}
      , '9,9':{dialogueId:'lavabo', state:"vide", behaviorType:"recipient"}
    }
  },

  village: {
    name: 'village',
    tileMap: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 5, 5, 0, 1],
      [1, 5, 5, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 2, 0, 2, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ],
    exits: { '6,3': {
        targetZone: 'vallee',
        spawn: { x: 10, y: 1 } // coordonnées dans la nouvelle map
      }
    }
     ,interactions: {
      '6,1': { dialogueId: 'papa' },
      '6,3': { dialogueId: 'maman' }
    }

  },
  vallee:{
    name:'vallee'
    , tileMap:[
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 5, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
            ,
    exits: {

    }
  }
  ,rdc: {
  name: 'rdc', questOnEnter: "mysterePlacard",
  tileMap: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 5, 1, 3, 3, 3, 3, 3, 3, 1],
            [1, 5, 1, 3, 3, 3, 3, 3, 3, 1],
            [1, 5, 1, 3, 3, 3, 3, 3, 3, 1],
            [1, 1, 1, 3, 3, 3, 3, 3, 3, 1],
            [1, 0, 1, 3, 3, 3, 3, 3, 3, 1],
            [1, 0, 1, 3, 3, 3, 3, 3, 3, 1],
            [1, 0, 1, 3, 3, 3, 3, 3, 3, 1],
            [1, 0, 0, 3, 3, 3, 3, 3, 3, 0],
            [1, 0, 1, 3, 3, 3, 3, 3, 3, 1],
            [1, 1, 1, 3, 3, 3, 3, 3, 3, 1],
            [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 1, 2, 1],
            [1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 1, 1, 1],
            [1, 0, 0, 1, 0, 0, 0, 1, 1, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 0, 1, 1, 1, 1]
  ],
  exits:{
    '20,8':{ 
       targetZone: 'etage',
        spawn: { x: 11, y: 13 }
      }, '8,10':{ 
       targetZone: 'salon',//salon
        spawn: { x: 2, y: 5 }
      }, '22,10':{ 
       targetZone: 'salon',//salon
        spawn: { x: 2, y: 18 }
      }, '24,5':{ 
       targetZone: 'exterieur',
        spawn: { x: 17, y: 20 }
      }, '17,8':{ 
       targetZone: 'cave',
        spawn: { x: 10, y: 5 }
      },

  },
  foreground: {
  '1,7': { tileType: 'frigo' },
  '8,2': { tileType: '2' },
  '5,1': { tileType: 'coffre', name:"porteSecrete" },
  '8,9': { tileType: '2' }, //porte salon haut
  '22,9': { tileType: '2' }, //porte salon bas
  '10,8': { tileType: 'robot', name:'robotCroquette' },
  '4,5': { tileType: 'vase' },
  '14,1': { tileType: 'gipsy' },//gipsy
  '12,1': { tileType: 'wc', ratio:2 },//WC
  '16,1': { tileType: 'PQ'},//PQ
  '13,3': { tileType: '2' },//porteWC
  '23,5': { tileType: '2' },//porte ext
  '10,7': { tileType: 'croqs' },//croquette
  '16,8': { tileType: '110'},//escalieCave
  '19,8': { tileType: '110'} //escalier etage
  ,'3,3':{tileType:'101'} // 
  ,'0,3':{tileType:'cuisiniere', ratio:1.5} 
  ,'5,7':{tileType:'frigo2', ratio:2} 
  ,'5,8':{tileType:'radio'} 
  ,'22,1':{tileType:'potionDegueu', ratio:2} //potionDegueu
  ,'9,1':{tileType:'alcool', ratio:2}
  ,'19,1':{tileType:'coussin', ratio:2} //coussin
},

interactions: {
  '1,4':{dialogueId:'attentionChaud', behaviorType:'declenchableVide'},
  '4,5': {  behaviorType:'vase'},
  '5,8':{dialogueId:'tutoActionnable', once:true},
  '5,1':{dialogueId:'coffreDuPlacard',  behaviorType:'coffre'},
  '16,1': {  behaviorType:'pickable', state:10,item:"PQ"},
  '13,1': { behaviorType: 'sale' },//WC
  '19,1':{ dialogueId:'sieste', once:true},
  '14,1': { behaviorType: 'pnj' , dialogueId:'gipsy'},//gipsy
  '1,7': { dialogueId: 'frigo', behaviorType:'coffre', keyRequired:'cleFrigo' },
  '10,8': { dialogueId: 'robotCroquette' , behaviorType:'declenchable', keyRequired:'motDePasseRobot',  miaulable:true},
  '8,2': {
      dialogueId: 'placardAThon', keyRequired:'code_robot',
      once: false,
      miaulable: true
    },

  '8,9': { dialogueId: 'porteFermee', behaviorType:'2', once:true, keyRequired:'cleSalon' },//haut
  '22,9': { dialogueId: 'porteFermee',behaviorType:'2',once:true,  keyRequired:'cleSalon' },//bas
  '13,3': { dialogueId: 'porteWC', behaviorType:'2', keyRequired:'cleWC'  },
  '23,5': { dialogueId: 'porteFermee',once:true, behaviorType:'2', keyRequired:'accesExterieur' },
  '10,7': { dialogueId: 'croquette', behaviorType:'croqs' }, // peut être un effet
  '16,8': {
    dialogueId: 'porteFermee',behaviorType:'2',once:true, 
    keyRequired: 'autorisationDescenteCave'
  },
  '20,8': {
    dialogueId: 'escalierEtage',
    keyRequired: 'accesEscalierEtage'
  }
}

}
, salon:{
  name:'salon', questOnEnter: "papaOuvre",
  tileMap:[
    ['B', 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ['B', 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 4, 4, 4, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 4, 4, 4, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 4, 4, 4, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 4, 4, 4, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
    ,  exits: {
      '5,0':{
        targetZone:'rdc', spawn:{x:8,y:9}
      },
      '16,0':{
        targetZone:'rdc', spawn:{x:8,y:22}
      },
      '1,13':{
        targetZone:'jardin', spawn:{x:8,y:4}
      },
    
    } 
    , foreground:{
      '5,5':{tileType:'101', ratio:2},// table ronde
      '13,7':{tileType:'102', ratio:2},// table basse
      '5,1':{tileType:'2'},
      '16,1':{tileType:'2'},
      '3,13':{tileType:'buisson'},
      '9,3':{tileType:'feu'},
      '10,3':{tileType:'feu'},
      '3,14':{tileType:'potionDegueu'},
      '3,2':{tileType:'armoire'},
      '3,3':{tileType:'armoire'},
      '3,8':{tileType:'alcool'},
      '12,2':{tileType:'canape', ratio:2},
      '10,11':{tileType:'fauteuil', ratio:2},
      '5,15':{tileType:'2'},
      '14,15':{tileType:'2'},
      '12,13':{tileType:'coussin', ratio:1.5},
      '18,4':{tileType:'croqs'},
      '1,22':{tileType:'barbecue'},
      '1,16':{tileType:'copain'},
      '13,2':{tileType:'coussin', ratio:2},//dechirable
      '14,8':{tileType:'vase'},
      '14,9':{tileType:'alcool'},
      '18,17':{tileType:'potionDegueu'},
      '18,19':{tileType:'potionDegueu'},
      '18,20':{tileType:'potion'},
      '18,21':{tileType:'potionDegueu'},
      '18,22':{tileType:'potionDegueu'},

      '17,11':{tileType:'tele', ratio:2},
      '5,7':{tileType:'papa', ratio:1.5},
    }
    , interactions:{
      '5,1':{ keyRequired:'cleSalon'},
      '16,1':{ keyRequired:'cleSalon'},
      '9,3':{dialogueId:'attentionChaud', behaviorType:'declenchableVide'},
      '10,3':{dialogueId:'attentionChaud', behaviorType:'declenchableVide'},
      '3,14':{behaviorType:'piquant'},
      '3,2':{behaviorType:'sale'},
      '14,8':{behaviorType:'vase'},
      '14,15':{dialogueId: 'porteFermee', behaviorType:'2', once:true, keyRequired:'cleTerrasse'},
      '5,15':{dialogueId: 'porteFermee', behaviorType:'2', once:true, keyRequired:'cleTerrasse'},
    '1,14':{dialogueId: 'porteFermee', behaviorType:'2', once:true, keyRequired:'cleJardin'},
      '18,4':{dialogueId:'croqsARemuer', behaviorType:'croqs'},
      '13,2':{dialogueId:'patounerCanape', behaviorType:'dechirable', once:true},// coussin a gratter
      
      '18,12':{dialogueId:'uneTele', miaulable:true, behaviorType:'declenchable'},//tele
      '5,7':{dialogueId:'parlerPapa', miaulable:true, position:{row:5,col:7}},
      '1,22':{behaviorType:'coffre', dialogueId:'barbecue'},
      '1,16':{dialogueId:'salutCopain',behaviorType:'declenchable',moveWith:'copain', miaulable:true}
    }
}
, jardin:{
   name:'jardin', questOnEnter: "SaleMatou",
  tileMap:[
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
    [1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
    [1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [1, 1, 4, 4, 4, 4, 4, 4, 4, '2', 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 0, 2, 4, 4, 4, 4, 4, 1],
    [1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1],
    [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
    [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
    [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]
  , exits: {
  '4,9': {
    targetZone: 'salon',
    spawn: { x: 14, y: 1 }
  },
  '13,12': {
    targetZone: 'cave',
    spawn: { x: 18, y: 14 }
  }
},
foreground: {
//DECO
'5,4':{tileType:'maison', ratio:2},
'1,18':{tileType:'caillou'},//surprise
'3,14':{tileType:'rocher'},
'8,18':{tileType:'rocher'},

'16,3':{tileType:'arbre'},
'11,15':{tileType:'pommier'},
'3,3':{tileType:'caillou'},
'17,18':{tileType:'champignon'},
'8,15':{tileType:'buisson'},
'18,18':{tileType:'caillou'},//secret ?
'17,15':{tileType:'champignon'},
'16,13':{tileType:'champignon'},
'18,10':{tileType:'champignon'},
'17,8':{tileType:'champignon'},
'16,5':{tileType:'champignon'},
'3,17':{tileType:'champignon'},// escargot
'14,16':{tileType:'trou'}, //chasseInsecte

// interacts
  '2,1': { tileType: 'copain', ratio:1.5, position: { row: 2, col: 1 } },
  '13,13': { tileType: '2' },//portecave
  '16,0': { tileType: 'saleMatou', ratio:3 },
},
interactions: {
  '4,9': {dialogueId: 'porteFermee', behaviorType:'2', once:true, keyRequired:'cleTerrasse'},

  '17,6': {  behaviorType:'pickable', state:10,item:"champignon", removeItem:'16,1'},
'17,15':{ behaviorType:'pickable', state:10,item:"champignon", removeItem:'17,15'},
'17,18':{ behaviorType:'pickable', state:10,item:"champignon", removeItem:'17,18'},
'16,13':{ behaviorType:'pickable', state:10,item:"champignon", removeItem:'16,13'},
'18,10':{ behaviorType:'pickable', state:10,item:"champignon", removeItem:'18,10'},
'17,8':{ behaviorType:'pickable', state:10,item:"champignon", removeItem:'17,8'},
'16,5':{ behaviorType:'pickable', state:10,item:"champignon", removeItem:'16,5'},
  '13,13': {
    dialogueId: 'porteCave',
    keyRequired:'cleCave',// aucune cle n'existe, il faut un code
    behaviorType: '2'
  },
  '3,17': { // Escargot
    dialogueId: 'insecteQuiBourdonne',
    miaulable:true,
    behaviorType: 'declenchable'
  },
  '14,16': {
    dialogueId: 'chasseInsecte',
    miaulable:true,
    behaviorType: 'declenchable'
  },
  '3,3': { // le caillou degueu
    dialogueId: 'caillouDegueu',
    once:true,
    behaviorType: 'declenchable'
  },
  '18,18':{

    dialogueId: 'coleoptereSacre',
    behaviorType: 'coffre'
  },
  '1,18': {
    dialogueId: 'surpriseJardin',
    once:true,
    behaviorType: 'coffre'
  },
  '3,1': {
    dialogueId: 'salutCopainDehors',
    behaviorType: 'pnj',
    miaulable: true,
    moveWith: 'copain',
    position: { row: 2, col: 1 }
  },
  '16,1': {
    dialogueId: 'saleMatouFinal',once:true,
    behaviorType: 'pnj', // ou saleMatou si y a besoin
    miaulable: true
  },
  '17,2': {
    dialogueId: 'saleMatouFinal',
    behaviorType: 'pnj', // ou saleMatou si y a besoin
    miaulable: true
  },
  '18,2': {
    dialogueId: 'saleMatouFinal',
    behaviorType: 'pnj', // ou saleMatou si y a besoin
    miaulable: true
  }
}

}

};
