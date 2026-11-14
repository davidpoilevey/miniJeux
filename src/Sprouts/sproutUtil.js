import { ADNHandler } from "../genetic/ADNPlante";



/**
 * A voir :
 *  - implementer un chngement de direction tous les N cycles
 */

export const LIMIT_POURRI =200;
const TAUX_MUTATION_SPROUT = 0.01;
const SEUIL_SAUT_MIN = 400, SEUIL_SAUT_VARIATION = 400;// energie avant de se reproduire
const MATURITE_MIN = 20, MATURITE_VARIATION = 25;// taille adulte, en cellules

const ORGMATTER_PAR_CELL = { sprout: 5, apex: 3, bois: 5, feuille: 3, racine: 2, mycelium: 1, graine: 2 };

const cle = position => position.top + ',' + position.left;


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
        ,{ top: position.top, left: position.left -GRIDSIZE*2}
        ,{ top: position.top, left: position.left +GRIDSIZE*2}
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
    const positionsOrganisme = new Set(cellules.map(cell => cle(cell.position)));
    for (let c in cellules) {
        const type = cellules[c].type;
        if (type === 'bois') {
            //si un bois n'est pas entouré de au moins 2 membre de son organisme (bois compris), c'est une branche morte
            const posAutour = getPositionsAutourDe(GRIDSIZE, cellules[c].position, true);
            let voisins = 0;
            for (let p = 0; p < posAutour.length; p++) {
                if (positionsOrganisme.has(cle(posAutour[p]))) {
                    voisins++;
                }
            }
            if (voisins < 2)
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
        if (type === 'sprout' || type === 'apex') {
            const nrjProduite = pompe(terrain, 'orgMatter', cellules[c].position) - COUTDELAVIE ;

            total += nrjProduite;
            // meurt si plus de 2 autres tetes a cote
            const posAutour = getPositionsAutourDe(GRIDSIZE,cellules[c].position);
            let voisins = 0;
            for (let p = 0; p < posAutour.length; p++) {
                const onPosLibre = posLibre(posAutour[p], true);
                if (onPosLibre?.type === 'sprout' || onPosLibre?.type === 'apex') {
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
    }, 'apex': {
        cout: 20
    }
}

// ce que chaque type de cellule sait exploiter : c'est la physique, le genome ne fait que doser
const AFFINITES = {
    feuille: { espace: 1.5, matiere: 0, pourri: -2, reserve: 0 },
    racine: { espace: 0, matiere: 2, pourri: -0.5, reserve: 0 },
    mycelium: { espace: 0, matiere: 0, pourri: 3, reserve: 0 },
    graine: { espace: 0.5, matiere: 0, pourri: 0, reserve: 1.5 },
    apex: { espace: 1, matiere: 0, pourri: -0.5, reserve: 1.5 },
};
const SEUIL_BOURGEON = 1;

// ce que percoit le sprout de la case ou il pourrait bourgeonner, chaque capteur entre 0 et 1
const capteurs = (terrain, position, GRIDSIZE, posLibre, reserve) => {
    const autour = getPositionsAutourDe(GRIDSIZE, position);
    const portee = getPositionsAutourDe(GRIDSIZE, position, false, true).concat([position]);
    let matiere = 0, pourri = 0;
    portee.forEach(p => {
        matiere += terrain.qtyOf('orgMatter', p);
        pourri += terrain.qtyOf('pourri', p);
    });
    return {
        espace: autour.filter(p => posLibre(p)).length / autour.length,
        matiere: Math.min(1, matiere / LIMIT_POURRI),
        pourri: Math.min(1, pourri / LIMIT_POURRI),
        reserve: Math.min(1, reserve),
    };
}

// score = l'inne (propre a chaque cote) + ce que le type sait tirer de l'environnement, dose par le genome
const choisitBourgeon = (adnHandler, cote, sens, nrj, pourriProche) => {
    let meilleur = null, meilleurScore = SEUIL_BOURGEON;
    for (let type in TYPES) {
        if (nrj - TYPES[type].cout <= 0)
            continue;
        if (type === 'feuille' && pourriProche)
            continue; // pas de feuilles pres du pourri
        let score = adnHandler.readFloat('bourgeon_' + type + '_' + cote);
        for (let capteur in sens)
            score += AFFINITES[type][capteur] * adnHandler.readFloat('sensible_' + type + '_' + capteur) * sens[capteur];
        if (score > meilleurScore) {
            meilleur = type;
            meilleurScore = score;
        }
    }
    return meilleur;
}

const checkSides = ['haut', 'bas', 'gauche', 'droite'];
const deconnecte = (cellules, sprout,GRIDSIZE) => {
    const positions = new Set(cellules.map(c => cle(c.position)));
    const connected = new Set();
    const exploreConnexions = (currentPosition) => {
        if (connected.has(cle(currentPosition))) return; // Cas de base: position déjà visitée
        connected.add(cle(currentPosition));

        for (let c = 0; c < checkSides.length; c++) {
            const sidePos = posFor(checkSides[c], currentPosition,GRIDSIZE);
            if (positions.has(cle(sidePos))) {
                exploreConnexions(sidePos);
            }
        }
    };

    exploreConnexions(sprout.position);
    // recuperer les cellule qui ont leur position dans connected
    const connectedCells = cellules.filter(cell => connected.has(cle(cell.position)));
    const disconnectedCells = cellules.filter(cell => !connected.has(cle(cell.position)));

    return [connectedCells, disconnectedCells];
};

export const lifeCycle = ({ gridMap, organismes, setGridMap, setOrganismes
    , frameHeight = 600, frameWidth = 1000, cycle = 1, gridSize, coutDeLaVie }) => {
    // on ne copie que les cellules, l'ADN n'est jamais modifie
    const oldOrganismes = organismes.map(org => ({
        ...org, cellules: org.cellules.map(cell => ({ ...cell, position: { ...cell.position } }))
    }));
    const GRIDSIZE=gridSize;
    const maxTop = Math.floor((frameHeight - GRIDSIZE) / GRIDSIZE) * GRIDSIZE;
    const maxLeft = Math.floor((frameWidth - GRIDSIZE) / GRIDSIZE) * GRIDSIZE;
    const terrainHelper = new TerrainHelper(gridMap, frameWidth, frameHeight);
    const newOrganismes = [];
    let countCurrent = 1;
    // qui occupe quelle case, tenu a jour pendant tout le cycle
    const occupation = new Map();
    for (const orga of oldOrganismes)
        for (const cell of orga.cellules)
            occupation.set(cle(cell.position), { cell, org: orga });
    const occupe = (cell, org) => occupation.set(cle(cell.position), { cell, org });
    const libere = (cell) => {
        if (occupation.get(cle(cell.position))?.cell === cell)
            occupation.delete(cle(cell.position));
    }
    const posLibre = (positionToCkeck, asCell = false) => {
        if (positionToCkeck.top <= 0 || positionToCkeck.left <= 0
            || positionToCkeck.top > (frameHeight - GRIDSIZE) || positionToCkeck.left > (frameWidth - GRIDSIZE))
            return asCell ? null : false;//quand on demande asCell, on veut du null si y a un mur
        const occupant = occupation.get(cle(positionToCkeck));
        if (occupant == null)
            return asCell ? null : true;
        else
            return asCell ? occupant.cell : false;

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
    const detruit = (org) => {
        org.cellules.forEach(cell => {
            libere(cell);
            foutLaMerde(cell);
        });
        org.detruit = true; // s'il n'a pas encore joue ce cycle, il sautera son tour
        const idx = newOrganismes.indexOf(org);
        if (idx >= 0)
            newOrganismes.splice(idx, 1);
    }
    // renvoie l'energie donnee a la pousse, 0 si la graine n'a pas pu s'installer
    const libereGraine = (graine, adnHandler, force=0, parent=null) => {
        let grainePosition = { ...graine.position };
        if (force||adnHandler.readBool('jumpingGraine')) {
            // chaque graine part dans sa direction, la portee est propre a la lignee
            const numero = parent.nbGraines = (parent.nbGraines || 0) + 1;
            const angle = adnHandler.readFloat('vecteurSaut' + numero) * 2 * Math.PI;
            const portee = 2 + adnHandler.readFloat('porteeSaut') * 6;
            grainePosition = {
                top: Math.min(maxTop, Math.max(GRIDSIZE, grainePosition.top + Math.round(Math.sin(angle) * portee) * GRIDSIZE)),
                left: Math.min(maxLeft, Math.max(GRIDSIZE, grainePosition.left + Math.round(Math.cos(angle) * portee) * GRIDSIZE))
            };
        }
        const occupant = occupation.get(cle(grainePosition));
        if (occupant != null && occupant.cell !== graine) {
            // retombe sur son parent : graine perdue
            if (occupant.org === parent)
                return 0;
            // sinon detruit l'organisme a la place
            detruit(occupant.org);
        }
        const nrj = adnHandler.readFloat('NRJDEPART') * 50 + 40;
        const pousse = { position: grainePosition, type: 'sprout' };
        const nouvelOrg = {
            cellules: [pousse]
            , nrj
            , id: 'graine' + cycle + '-' + countCurrent++
            , adn: adnHandler.mutatedVersion(TAUX_MUTATION_SPROUT)
        };
        newOrganismes.push(nouvelOrg);
        occupe(pousse, nouvelOrg);
        return nrj;
    }
    for (let org of oldOrganismes) {
        if (org.detruit)
            continue; // ecrase par une graine pendant ce cycle

        const newOrg = org;
        const adnHandler = new ADNHandler(newOrg.adn);
        let currentNrj = org.nrj;
        const seuilSaut = Math.round(adnHandler.readFloat('seuilAutoReproduction')*SEUIL_SAUT_VARIATION+SEUIL_SAUT_MIN);
        const maturite = MATURITE_MIN + Math.round(adnHandler.readFloat('maturite') * MATURITE_VARIATION);// nb de cellules avant de se reproduire
       
        // collecte d'energie
        currentNrj += calculRendement({
            cellules: newOrg.cellules, adnHandler
            , terrain: terrainHelper, posLibre, GRIDSIZE, COUTDELAVIE:coutDeLaVie
            , libereGraine: (graine, adn) => libereGraine(graine, adn, 0, newOrg)
        });
        if (currentNrj < 0) {
            // MORT de l'organisme entier, tout pourrit sauf les graines qui se liberent
            newOrg.cellules.forEach(libere);
            for (let cell of newOrg.cellules) {
                if (cell.type === 'graine') {
                    if (!cell.dead) // une graine morte a deja germé
                        libereGraine(cell, adnHandler, true, newOrg);
                }
                else
                    foutLaMerde(cell);
            }
            continue;
        }
        else {
            // sinon, suivre ADN
            // les cellules mortes pourrissent
            newOrg.cellules.filter(c => c.dead).forEach(cell => {
                libere(cell);
                if (cell.type !== 'graine')
                    foutLaMerde(cell);
            });
            newOrg.cellules = newOrg.cellules.filter(c => !c.dead);
            const sprout = newOrg.cellules.find(c => c.type === 'sprout');
            const sproutPosition = sprout?.position;
            if (sprout == null) {
                // bras Mort, tout meurt et pourrit... Sauf les graines qui se liberent
                newOrg.cellules.forEach(libere);
                for (let cell of newOrg.cellules) {
                    if (cell.type === 'graine')
                        libereGraine(cell, adnHandler, 0, newOrg);
                    else
                        foutLaMerde(cell);
                }
                continue;
            }
            else {
                if(currentNrj>seuilSaut && newOrg.cellules.length>=maturite){
                    // autoreproduction si trop d'nrj, l'energie de la pousse est prise au parent
                    currentNrj -= libereGraine({type:'graine',position:sproutPosition}, adnHandler, true, newOrg);
                }
                // enlever celles qui ne sont plus connectees au sprout
                const [connectedCells, deconnectedCells] = deconnecte(newOrg.cellules, sprout,GRIDSIZE);
                newOrg.cellules = connectedCells;
                deconnectedCells.forEach(libere);
                // liberer les graines si y en a et faire pourrir le reste
                const graines = deconnectedCells.filter(c => c.type === 'graine');
                if (graines.length > 0) {
                    for (let g = 0; g < graines.length; g++)
                        libereGraine(graines[g], adnHandler, 0, newOrg);
                }
                const aJeter = deconnectedCells.filter(c => c.type !== 'graine');
                aJeter.forEach(cell => (foutLaMerde(cell)));
            }
            // chaque tete pousse a son tour, la principale d'abord, toutes sur la meme reserve
            const tetes = newOrg.cellules.filter(c => c.type === 'sprout' || c.type === 'apex');
            let nouvelles = [];
            for (const tete of tetes) {
                const buds = [];
                const branches = [];
                // chaque apex a sa propre danse, sinon toutes les tetes partiraient du meme cote
                const danse = tete.numero ? cycle + 'apex' + tete.numero + '-' : cycle + 'bougeVersQuelCote-';
                let moveVers = null,moveVersOppose=null;
                let essayIndex = 1;
                while (moveVers == null && essayIndex <= 4) {
                    let essaye = null;
                    const probaBouge = adnHandler.readFloat(danse + essayIndex);
                    if (probaBouge < 0.25) essaye = 'haut';
                    else if (probaBouge < 0.50) essaye = 'gauche';
                    else if (probaBouge < 0.75) essaye = 'bas';
                    else essaye = 'droite';
                    if (!posLibre(posFor(essaye, tete.position,GRIDSIZE)))
                        essayIndex++;
                    else
                        {
                            moveVers = essaye;
                            moveVersOppose=essaye=='haut'?'bas':essaye=='bas'?'haut'
                            :essaye=='gauche'?'droite':'gauche';
                        }
                }

                for (let c = 0; c < checkSides.length; c++) {
                    const cote = checkSides[c];
                    if (moveVers === cote)
                        continue;
                    const toPosition = posFor(cote, tete.position,GRIDSIZE);
                    if (!posLibre(toPosition))
                        continue;
                    const sens = capteurs(terrainHelper, toPosition, GRIDSIZE, posLibre, currentNrj / seuilSaut);
                    const pourriProche = getPositionsAutourDe(GRIDSIZE,toPosition).some(p => tauxPourri(terrainHelper, p) > 0);
                    const type = choisitBourgeon(adnHandler, cote, sens, currentNrj, pourriProche);
                    if (type != null) {
                        const bud = { type: type, position: toPosition };
                        if (type === 'apex')
                            bud.numero = newOrg.nbApex = (newOrg.nbApex || 0) + 1;
                        branches.push(cote);
                        buds.push(bud);
                        occupe(bud, newOrg);
                        currentNrj -= TYPES[type].cout;
                    }
                }

                // bouge seulement si y a du neuf
                if (buds.length > 0 && moveVers != null && posLibre(posFor(moveVers, tete.position,GRIDSIZE))) {
                    // la tete devient bois et avance
                    branches.push(moveVers);
                    branches.push(moveVersOppose);
                    const bois = { type: 'bois', position: tete.position, branches:branches };
                    libere(tete);
                    tete.position = posFor(moveVers, tete.position,GRIDSIZE);
                    occupe(tete, newOrg);
                    occupe(bois, newOrg);
                    buds.push(bois);
                }
                nouvelles = nouvelles.concat(buds);
            }
            newOrg.cellules = newOrg.cellules.concat(nouvelles);

            if (currentNrj > TYPES.graine.cout * 4 && newOrg.cellules.length >= maturite) {
                // adulte avec bcq d'energie, si y a des graines, on s'en separe
                const graine = newOrg.cellules.find(c => c.type === 'graine');
                if (graine) {
                    currentNrj -= TYPES.graine.cout;
                    newOrg.cellules = newOrg.cellules.filter(c => c !== graine);
                    libereGraine(graine, adnHandler, 0, newOrg);
                    libere(graine);
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





// terrain clairseme : on ne stocke que les cases ou il y a quelque chose
class TerrainHelper {
    constructor(gridMap, frameWidth, frameHeight) {
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.terrainOrgMatter = new Map();
        gridMap['orgMatter']?.forEach(tile => this.terrainOrgMatter.set(cle(tile), { ...tile }));
        this.terrainPourri = new Map();
        gridMap['pourri']?.forEach(tile => this.terrainPourri.set(cle(tile), { ...tile }));
    }
    stock(matiere) {
        if (matiere === 'pourri') return this.terrainPourri;
        if (matiere === 'orgMatter') return this.terrainOrgMatter;
    }
    updatePourri(){
        const gridMap={orgMatter:[], pourri:[]};
        this.terrainOrgMatter.forEach(tile => {
            if (tile.qty > LIMIT_POURRI) {
                this.addOnTerrain('pourri', tile, LIMIT_POURRI);
                tile.qty = 0;
            }
            if (tile.qty > 0)
                gridMap.orgMatter.push(tile);
        });
        this.terrainPourri.forEach(tile => {
            if (tile.qty > 0)
                gridMap.pourri.push(tile);
        });
        return gridMap;
    }
    
    qtyIn(position){
        return this.qtyOf('pourri', position);
    }
    qtyOf(matiere, position){
        return this.stock(matiere)?.get(cle(position))?.qty ?? 0;
    }
    addOnTerrain(matiere, position, qty) {
        const stock = this.stock(matiere);
        if (stock == null || position.top < 0 || position.left < 0
            || position.top >= this.frameHeight || position.left >= this.frameWidth)
            return;
        const tile = stock.get(cle(position));
        if (tile)
            tile.qty += qty;
        else
            stock.set(cle(position), { top: position.top, left: position.left, qty });
    }
    pompeFromTerrain(matiere, position, qty) {
        const tile = this.stock(matiere)?.get(cle(position));
        if (tile == null || tile.qty <= 0)
            return 0;
        const pompe = Math.min(tile.qty, qty);
        tile.qty -= pompe;
        return pompe / 2;
    }

}
