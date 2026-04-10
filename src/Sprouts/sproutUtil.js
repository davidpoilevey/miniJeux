import { ADNHandler } from "../genetic/ADNPlante";



/**
 * A voir : parfois des bois disparaissent et des feuilles ne sont plus connectees
 *  - implementer un chngement de direction tous les N cycles
 * optimisation, c'est pas encore ca
 */

export const LIMIT_POURRI =200;
export const NRJDEPART = 48;

const ORGMATTER_PAR_CELL = { bois: 5, feuille: 3, racine: 2, mycelium: 1 };


const getPositionsAutourDe = (GRIDSIZE, position, onlyPerpendiculaire = false, doubleRange=false) => {
    let pos = [{ top: position.top, left: position.left + GRIDSIZE }
        , { top: position.top, left: position.left - GRIDSIZE }
        , { top: position.top + GRIDSIZE, left: position.left }
        , { top: position.top - GRIDSIZE, left: position.left }
    ]
    if (!onlyPerpendiculaire) {
        pos = pos.concat([{ top: position.top + GRIDSIZE, left: position.left + GRIDSIZE }
            , { top: position.top + GRIDSIZE, left: position.left - GRIDSIZE }
            , { top: position.top - GRIDSIZE, left: position.left + GRIDSIZE }
            , { top: position.top - GRIDSIZE, left: position.left - GRIDSIZE }]);
        if(doubleRange)
            pos = pos.concat([{ top: position.top + GRIDSIZE*2, left: position.left + GRIDSIZE*2 }
        ,{ top: position.top + GRIDSIZE*2, left: position.left + GRIDSIZE }
        ,{ top: position.top + GRIDSIZE*2, left: position.left}
        ,{ top: position.top + GRIDSIZE*2, left: position.left - GRIDSIZE*2 }
        ,{ top: position.top + GRIDSIZE*2, left: position.left - GRIDSIZE }
        ,{ top: position.top + GRIDSIZE, left: position.left -GRIDSIZE*2}
        ,{ top: position.top + GRIDSIZE, left: position.left +GRIDSIZE*2}
        ,{ top: position.top - GRIDSIZE, left: position.left -GRIDSIZE*2}
        ,{ top: position.top - GRIDSIZE, left: position.left +GRIDSIZE*2}
        ,{ top: position.top - GRIDSIZE*2, left: position.left + GRIDSIZE*2 }
        ,{ top: position.top - GRIDSIZE*2, left: position.left + GRIDSIZE }
        ,{ top: position.top - GRIDSIZE*2, left: position.left}
        ,{ top: position.top - GRIDSIZE*2, left: position.left - GRIDSIZE*2 }
        ,{ top: position.top - GRIDSIZE*2, left: position.left - GRIDSIZE }
    ]);
    }
    return pos;
}
const produit = (terrainHelper, matiere, position, qty) => {
    terrainHelper.addOnTerrain(matiere, position, qty);
}
const pompe = (terrain, matiere, position, qty = 1) => {
    // chercher dans les 9 cases autour la matiere
    return terrain.pompeFromTerrain(matiere, position, qty);

}
const tauxPourri = (terrain, position) => {
return terrain.qtyIn(position, 'pourri');
};
const calculRendement = ({ cellules, adnHandler, terrain, posLibre, libereGraine, GRIDSIZE,COUTDELAVIE }) => {
    let total = 0;
    const rendementMyc = adnHandler.read10('ratioMycelium');
    const rendementRacine = adnHandler.read10('ratioRacines');
    const rendementFeuille = adnHandler.read10('rendementSolaire');
    for (let c in cellules) {
        const type = cellules[c].type;
        if (type === 'bois') {
            //si un bois n'est pas entouré de au moins 2 membre de son organisme, il meurt
            const posAutour = getPositionsAutourDe(GRIDSIZE, cellules[c].position, true);
            let voisins = 0;
            for (let p = 0; p < posAutour.length; p++) {
                const sideCell = posLibre(posAutour[p], true);
                if (sideCell != null && sideCell.type !== 'bois') {
                    voisins++;
                }
            }
            if (voisins < 1)
                cellules[c].dead = true;
        }
        if (type === 'racine') {
            // energie = 10 vient de orgMatter concentration. produit pourri, si plus rien a pomper, la cellule meurt
            const posAutour = getPositionsAutourDe(GRIDSIZE, cellules[c].position,false,true);
            let nrjProduite = 0;
            for (let p = 0; p < posAutour.length; p++) {
                nrjProduite+= pompe(terrain, 'orgMatter', posAutour[p],rendementRacine);
            }
            if (nrjProduite <= rendementRacine/2)
                cellules[c].dead = true;
            else {
                total += nrjProduite;
                total -= COUTDELAVIE;
            }
        }
        if (type === 'mycelium') {
            // energie = 10 vient de pourri concentration. si plus rien a pomper, la cellule meurt
            const posAutour = getPositionsAutourDe(GRIDSIZE,cellules[c].position,false,true);
            let nrjProduite = 0;
            for (let p = 0; p < posAutour.length; p++) {
                nrjProduite+= pompe(terrain, 'pourri', posAutour[p],rendementMyc);
            }
            if (nrjProduite <= rendementMyc/2)
                cellules[c].dead = true;
            else {
                total += nrjProduite;
                total -= COUTDELAVIE;
            }
        }
        if (type === 'sprout') {
            const nrjProduite = pompe(terrain, 'orgMatter', cellules[c].position) - COUTDELAVIE ;

            total += nrjProduite;
            // meurt si plus de 2 autres sprout a cote
            const posAutour = getPositionsAutourDe(GRIDSIZE,cellules[c].position);
            let voisins = 0;
            for (let p = 0; p < posAutour.length; p++) {
                const onPosLibre = posLibre(posAutour[p], true);
                if (onPosLibre?.type === 'sprout') {
                    voisins++;
                }
            }
            if (voisins > 2)
                cellules[c].dead = true;
        }
        if (type === 'feuille') {
            // energie = 10 vient naturellement, produit orgMatter
           
            const posAutour = getPositionsAutourDe(GRIDSIZE,cellules[c].position);
            for (let p = 0; p < posAutour.length; p++) {
                produit(terrain, 'orgMatter', posAutour[p], rendementFeuille);
                if(posLibre(posAutour[p]))
                    total += 1
                if (tauxPourri(terrain, posAutour[p]) > 0)
                    cellules[c].dead = true;
            }
            // si y a du pourri, elle meurt

        }
        if (type === 'graine') {
            const posAutour = getPositionsAutourDe(GRIDSIZE,cellules[c].position, true);
            let canGerme = true;
            for (let p = 0; p < posAutour.length; p++) {
                const onPosLibre = posLibre(posAutour[p], true);
                if (onPosLibre != null && onPosLibre.type !== 'bois' && onPosLibre.type !== 'graine') {
                    canGerme = false;
                    break;
                }
            }
            if (canGerme) {
                libereGraine(cellules[c], adnHandler);
                cellules[c].dead = true;
            }
        }
    }
    return total;
}

const posFor = (cote, pos, GRIDSIZE) => {
    if (cote === 'haut')
        return { top: Math.round(pos.top) - GRIDSIZE, left: Math.round(pos.left) };
    if (cote === 'bas')
        return { top: Math.round(pos.top) + GRIDSIZE, left: Math.round(pos.left) };
    if (cote === 'gauche')
        return { top: Math.round(pos.top), left: Math.round(pos.left) - GRIDSIZE };
    if (cote === 'droite')
        return { top: Math.round(pos.top), left: Math.round(pos.left) + GRIDSIZE };
}





const TYPES = {
    'graine': {
        cout: 100
    }, 'feuille': {
        cout: 2
    }, 'mycelium': {
        cout: 10
    }, 'racine': {
        cout: 5
    }
}

const checkSides = ['haut', 'bas', 'gauche', 'droite'];
const deconnecte = (cellules, sprout,GRIDSIZE) => {
    const connected = [];
    const visited = [];
    const listDePos = cellules.map(c => c.position);
    const exploreConnexions = (currentPosition) => {
        if (visited.find(pos=>(pos.top==currentPosition.top&&pos.left==currentPosition.left))) return; // Cas de base: position déjà visitée
        visited.push(currentPosition);
        connected.push(currentPosition);

        for (let c = 0; c < checkSides.length; c++) {
            const cote = checkSides[c];
            const sidePos = posFor(cote, currentPosition,GRIDSIZE);
            if (listDePos.find(pos=>(pos.top==sidePos.top&&pos.left==sidePos.left))) {
                exploreConnexions(sidePos);
            }
        }
    };

    exploreConnexions(sprout.position);
    // recuperer les cellule qui ont leur position dans connected connected;
    const connectedCells = cellules.filter(cell => connected.find(pos=>(pos.top==cell.position.top&&pos.left==cell.position.left)));
    const disconnectedCells = cellules.filter(cell => !connected.find(pos=>(pos.top==cell.position.top&&pos.left==cell.position.left)));

    return [connectedCells, disconnectedCells];
};

export const lifeCycle = ({ gridMap, organismes, setGridMap, setOrganismes
    , frameHeight = 600, frameWidth = 1000, cycle = 1, gridSize, coutDeLaVie }) => {
    const oldOrganismes = JSON.parse(JSON.stringify(organismes));
    const GRIDSIZE=gridSize;
    const newGridMap = JSON.parse(JSON.stringify(gridMap));
    const terrainHelper = new TerrainHelper(newGridMap, frameWidth, frameHeight);
    const newOrganismes = [];
    let countCurrent = 1;
    const positionMap = [];
    for (let o = 0; o < oldOrganismes.length; o++) {
        const orga = oldOrganismes[o];
        for (let c = 0; c < orga.cellules.length; c++) {
            const cell = orga.cellules[c];
            positionMap.push({ top: cell.position.top, left: cell.position.left, cell: cell })
        }
    }
    const posLibre = (positionToCkeck, asCell = false) => {
        if (positionToCkeck.top <= 0 || positionToCkeck.left <= 0
            || positionToCkeck.top > (frameHeight - GRIDSIZE) || positionToCkeck.left > (frameWidth - GRIDSIZE))
            return asCell ? null : false;//quand on demande asCell, on veut du null si y a un mur
        const pMap = positionMap.find(pm => (pm.top === positionToCkeck.top && pm.left === positionToCkeck.left))
        if (pMap == null)
            return asCell ? null : true;
        else
            return asCell ? pMap.cell : false;

    }
    const libereGraine = (graine, adnHandler, force=0) => {
        let grainePosition = { ...graine.position };
        if (force||adnHandler.readBool('jumpingGraine')) {
            const distanceTop = Math.ceil(adnHandler.read10('sautDeGraineTop') - 5);
            const distanceLeft = Math.ceil(adnHandler.read10('sautDeGraineLeft') - 5);
            const cibleTop = grainePosition.top + (distanceTop * GRIDSIZE);
            const cibleLeft=grainePosition.left + (distanceLeft * GRIDSIZE);
            if (!posLibre({top:cibleTop, left:cibleLeft}))
               {
                // detruit l'organisme a la place, les jeunes d'abord
               
                    const orgaCibleIdx = newOrganismes.findIndex(org=>{
                        const inCells = org.cellules.filter(c=>(c.position.top===cibleTop&&c.position.left===cibleLeft));
                        return (inCells.length>0)
                    })
                    if(orgaCibleIdx>=0){
                        newOrganismes[orgaCibleIdx].cellules.forEach(cell=>(foutLaMerde(cell)))
                        newOrganismes.splice(orgaCibleIdx,1);
                    }
               }
                grainePosition={top:cibleTop,left:cibleLeft}
        }
        newOrganismes.push({
            cellules: [{ position: grainePosition, type: 'sprout' }]
            , nrj: adnHandler.readFloat('NRJDEPART') * 50 + 40
            , id: 'graine' + cycle + '-' + countCurrent++
            , adn: adnHandler.mutatedVersion()
        })
    }
    const foutLaMerde = (cell) => {
        const qteDeMerde = ORGMATTER_PAR_CELL[cell.type];
        produit(terrainHelper, 'orgMatter', cell.position, qteDeMerde);// la ou etais la cell
        // et autour
        const posAutour = getPositionsAutourDe(GRIDSIZE,cell.position);
        for (let p = 0; p < posAutour.length; p++) {
            produit(terrainHelper, 'orgMatter', posAutour[p], qteDeMerde / 2);
        }
    }
    for (let org of oldOrganismes) {

        const newOrg = org;
        const adnHandler = new ADNHandler(newOrg.adn);
        let currentNrj = org.nrj;
        const seuilSaut = Math.round(adnHandler.readFloat('seuilAutoReproduction')*200+100);// entre 100 et 300
       
        // collecte d'energie
        currentNrj += calculRendement({
            cellules: newOrg.cellules, adnHandler
            , terrain: terrainHelper, posLibre, libereGraine, GRIDSIZE, COUTDELAVIE:coutDeLaVie
        });
        if (currentNrj < 0) {
            // MORT de l'organisme entier sauf les graines
         
            for (let cell of newOrg.cellules) {
                if(cell.type==='sprout')
                    continue;
                if(cell.type==='graine')
                {
                    libereGraine(cell, adnHandler, true);
                    continue;
                }
                foutLaMerde(cell);
                const qteDeMerde = ORGMATTER_PAR_CELL[cell.type];
                produit(terrainHelper, 'orgMatter', cell.position, qteDeMerde);// la ou etais la cell
                // et autour
                const posAutour = getPositionsAutourDe(GRIDSIZE,cell.position);
                for (let p = 0; p < posAutour.length; p++) {
                    produit(terrainHelper, 'orgMatter', posAutour[p], qteDeMerde / 2);
                }
            }
            continue;
        }
        else {
            // sinon, suivre ADN
            const buds = [];
            const branches = [];
            // remove deads
            newOrg.cellules = newOrg.cellules.filter(c => !c.dead);
            const sprout = newOrg.cellules.find(c => c.type === 'sprout');
            const sproutPosition = sprout?.position;
            if (sprout == null) {
                // bras Mort, tout meurt et laisse un max de pourri... Sauf les graines qui se liberent
                const graines = newOrg.cellules.filter(c => c.type === 'graine');
                if (graines.length > 0) {
                    for (let g = 0; g < graines.length; g++)
                        libereGraine(graines[g], adnHandler);
                }
                continue;
            }
            else {
                if(currentNrj>seuilSaut){
                    // autoreproduction si trop d'nrj
                    libereGraine({type:'graine',position:sproutPosition}, adnHandler, true);
                    currentNrj-=NRJDEPART;
                }
                // enlever celles qui ne sont plus connectees au sprout
                const [connectedCells, deconnectedCells] = deconnecte(newOrg.cellules, sprout,GRIDSIZE);
                newOrg.cellules = connectedCells;
                // liberer les graines si y en a et faire pourrir le reste
                const graines = deconnectedCells.filter(c => c.type === 'graine');
                if (graines.length > 0) {
                    for (let g = 0; g < graines.length; g++)
                        libereGraine(graines[g], adnHandler);
                }
                const aJeter = deconnectedCells.filter(c => c.type !== 'graine');
                aJeter.forEach(cell => (foutLaMerde(cell)));
            }
            let moveVers = null,moveVersOppose=null;
            let essayIndex = 1;
            while (moveVers == null && essayIndex <= 4) {
                let essaye = null;
                const probaBouge = adnHandler.readFloat(cycle + 'bougeVersQuelCote-' + essayIndex);
                if (probaBouge < 0.25) essaye = 'haut';
                else if (probaBouge < 0.50) essaye = 'gauche';
                else if (probaBouge < 0.75) essaye = 'bas';
                else essaye = 'droite';
                if (moveVers !== 'bougePas') {
                    if (!posLibre(posFor(essaye, sprout.position,GRIDSIZE)))
                        essayIndex++;
                    else
                        {
                            moveVers = essaye;
                            moveVersOppose=essaye=='haut'?'bas':essaye=='bas'?'haut'
                            :essaye=='gauche'?'droite':'gauche';
                        }
                }
            }
            let moved = false;

            for (let c = 0; c < checkSides.length; c++) {
                const cote = checkSides[c];
                if (!moved && moveVers === cote) {

                    moved = true;
                    continue;
                }
                else {

                    const proba = adnHandler.readFloat('bourgeonEn' + cote);
                    for (let type in TYPES) {
                        const LIMITS_Type = adnHandler.readFloat('proba_for_' + type);
                        if (proba > LIMITS_Type && currentNrj - TYPES[type].cout > 0 && posLibre(posFor(cote, sproutPosition,GRIDSIZE))) {
                            const toPosition = posFor(cote, sproutPosition,GRIDSIZE);
                            let cancel=false;
                            if (type === 'feuille') {
                                // pas de feuilles pres du pourri
                                const posAutour = getPositionsAutourDe(GRIDSIZE,toPosition);
                                for (let p = 0; p < posAutour.length; p++) {
                                    if (tauxPourri(terrainHelper,posAutour[p]) > 0)
                                       {
                                        cancel=true;
                                        break;
                                       } 
                                }
                            }
                            if(!cancel){
                                branches.push(cote);
                                buds.push({
                                    type: type
                                    , position: toPosition
                                })
                                currentNrj -= TYPES[type].cout;
                            }
                            break; // break from types
                        }
                    }
                }

            }


            if (buds.length > 0) {
                // bouge seulement si y a du neuf
                if (moved)
                    newOrg.cellules.forEach(cell => {
                        if (cell.type === 'sprout' && posLibre(posFor(moveVers, cell.position,GRIDSIZE))) {
                            // sprout devient bois et nouveau sprout en position
                            branches.push(moveVers);
                            branches.push(moveVersOppose);
                            buds.push({ type: 'bois', position: cell.position, branches:branches });
                            cell.position = posFor(moveVers, cell.position,GRIDSIZE);
                        }
                    });
                newOrg.cellules = newOrg.cellules.concat(buds);
            }

            if (currentNrj > TYPES.graine.cout * 4) {
                // on a bcq d'energie, si y a des graines, on les tire ou on s'en separe TODO
                const graines = newOrg.cellules.filter(c => c.type === 'graine');
                if (graines.length > 0) {
                    currentNrj -= TYPES.graine.cout;
                    libereGraine(graines[0], adnHandler);
                }
            }
            newOrg.nrj = Math.floor(currentNrj);

        }
        // a la fin on recupere l'energie
        newOrganismes.push(newOrg);

    }
    setOrganismes(newOrganismes);



    // updateTerrainPourri 
   const updatedTerrain = terrainHelper.updatePourri();
    setGridMap(updatedTerrain);
}





class TerrainHelper {
    constructor(gridMap, frameWidth, frameHeight) {
        // const rws=Math.round(frameWidth/GRIDSIZE);
        // const cls=Math.round(frameHeight/GRIDSIZE);
        this.terrainOrgMatter = Array.from({ length: frameHeight }, () =>
            Array.from({ length: frameWidth }, () => 0)
        )
        if (gridMap['orgMatter'] != null)
            gridMap['orgMatter'].forEach(tile => {
                this.terrainOrgMatter[tile.top][tile.left] = tile.qty;
            })
        this.terrainPourri = Array.from({ length: frameHeight }, () =>
            Array.from({ length: frameWidth }, () => 0)
        )
        if (gridMap['pourri'] != null)
            gridMap['pourri'].forEach(tile => {
                this.terrainPourri[tile.top][tile.left] = tile.qty;
            })
    }
    updatePourri(){
        const gridMap={orgMatter:[], pourri:[]};
        for(let row=0;row<this.terrainOrgMatter.length;row++){
            for(let col=0;col<this.terrainOrgMatter[row].length;col++){
                if(this.terrainOrgMatter[row][col]>LIMIT_POURRI){
                    this.terrainPourri[row][col]+=LIMIT_POURRI;
                    this.terrainOrgMatter[row][col]=0;
                }
                if(this.terrainOrgMatter[row][col]>0){
                    gridMap.orgMatter.push({top:row,left:col,qty:this.terrainOrgMatter[row][col]});
                }
                if(this.terrainPourri[row][col]>0){
                    gridMap.pourri.push({top:row,left:col,qty:this.terrainPourri[row][col]});
                }
            }
        }
        return gridMap;
    }
    
    qtyIn(position){
        if(this.terrainPourri[position.top]==null||this.terrainPourri[position.top][position.left]==null)
            return 0;
        return this.terrainPourri[position.top][position.left];
    }
    addOnTerrain(matiere, position, qty) {
    
        if (matiere == 'pourri' && this.terrainPourri[position.top]!=null&&this.terrainPourri[position.top][position.left]!=null)
            this.terrainPourri[position.top][position.left] += qty;
        if (matiere == 'orgMatter'&& this.terrainOrgMatter[position.top]!=null&&this.terrainOrgMatter[position.top][position.left]!=null)
            this.terrainOrgMatter[position.top][position.left] += qty;
    }
    pompeFromTerrain(matiere, position, qty) {
        if (matiere === 'pourri') {
            if(this.terrainPourri[position.top]==null||this.terrainPourri[position.top][position.left]==null)
                return 0;
            const currQty = this.terrainPourri[position.top][position.left];
            if (currQty < qty)
                {
                    this.terrainPourri[position.top][position.left]=0;
                    return Math.max(0,currQty-qty);
                }
            else {
                this.terrainPourri[position.top][position.left] -= qty;
                return qty/2;
            }
        }
        if (matiere === 'orgMatter') {
            if(this.terrainOrgMatter[position.top]==null||this.terrainOrgMatter[position.top][position.left]==null)
                return 0;
            const currQty = this.terrainOrgMatter[position.top][position.left];
            if (currQty < qty)
                {
                    this.terrainOrgMatter[position.top][position.left]=0;
                    return Math.max(0,currQty-qty);
                }
            else {
                this.terrainOrgMatter[position.top][position.left] -= qty;
                return qty/2;
            }
        }
    }

}