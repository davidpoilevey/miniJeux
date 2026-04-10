import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
export const TILE_SIZE = 30;
export const VITESSE_FOURMI = 500;// plus c'est bas + c'est rapide... 1000=1seconde

const TILE_CHOICES = [{ type: 'herbe', color: 'lightgreen' }, { type: 'herbe', color: 'green' }
    , { type: 'sucre', color: 'silver' }
    , { type: 'rocher', color: 'black' }, { type: 'eau', color: 'aqua' }];

const TilesContext = createContext();

export const useTilesContext = () => {
    const context = useContext(TilesContext);
    if (!context) {
        throw new Error('useTilesContext must be used within a TilesProvider');
    }
    return context;
};
export const TilesProvider = ({ nbRows, nbColumns,configuration, children }) => {

    const tiles = useRef();
    const fourmiID = useRef(0);
    const [stateTiles, setStateTiles] = useState();
    const [fourmiProduction, setProduction] = useState([]);
    useEffect(() => {
        if (stateTiles != null)
            tiles.current = stateTiles;
    }, [stateTiles]);

    useEffect(() => {
        const tsl = generateGroupedRandomTiles(nbRows, nbColumns);

        if(configuration?.colonies!=null)
        {
            configuration.colonies.forEach((colonie,idx)=>{

    // on met la colonie au hasard
                const tileColony = tsl[Math.floor(Math.random() * tsl.length)][Math.floor(Math.random() * tsl[0].length)];
                tileColony.type = 'colonie';
                tileColony.id = colonie.name;
                tileColony.reserve = colonie.reserve||100;
                tileColony.pheromone = { ['colonie'+colonie.name]: 10000 };
            })
        }

        tiles.current = tsl;
        setStateTiles(tsl);
    }, [configuration?.colonies]);

    const produitFourmis = (colonieConfig) => {
        const colonie = getColonie(colonieConfig.name);
        colonie.reserve = Number(colonie.reserve)
        if (colonie != null && colonie.reserve > colonieConfig.PONCTION_PAR_FOURMI) {
            colonie.reserve -= colonieConfig.PONCTION_PAR_FOURMI;
            fourmiID.current++;
            setProduction(p=>(p.concat({ x: colonie.col * TILE_SIZE, y: colonie.row * TILE_SIZE
                , id:fourmiID.current++
                , equipe:colonie.id })));// nouvelle fourmi
            replaceTile(colonie);
        }
    }
    const updatePheromone = () => {
        if (tiles.current == null)
            return;
        const newTiles = tiles.current.map(tileRow => {
            return tileRow.map(tile => {
                const newtile = { ...tile };
                if (tile.pheromone != null) {
                    newtile.pheromone = {};
                    if (tile.type === 'colonie')
                        newtile.pheromone['colonie'+tile.id] = 1000;
                    const pheros = Object.keys(tile.pheromone);
                    for (let p = 0; p < pheros.length; p++) {
                        const phValue = tile.pheromone[pheros[p]] ?? 0;
                        if (phValue > 0)
                            newtile.pheromone[pheros[p]] = phValue - 1;
                    }
                }
                if(newtile.puceron!=null) // reanimate puceron
                   {
                    newtile.puceron=true;
                    // plante s'affaiblit
                    if(newtile.type==='eau')
                      {
                          newtile.contenu--;
                          if(newtile.contenu<=0){
                            newtile.type='herbe';
                          }
                      }
                   } 
                return newtile;
            });
        });
        tiles.current = newTiles;
        setStateTiles(newTiles);

    }
    useEffect(() => {
        const intervalId = setInterval(() => {
            setProduction([]);
            updatePheromone();
            configuration.colonies.forEach(colonie=>{

                produitFourmis(colonie);
            })
        }, configuration.TAUX_PRODUCTION); //update TAUX_PRODUCTION fois par seconde
       // produitFourmis();
        // Nettoie l'intervalle lors du démontage du composant
        return () => clearInterval(intervalId);
    }, [configuration.colonies]);

    const replaceTile = (newTilesArg) => {
        // remplace selon l'id
        const newTile = (newTilesArg instanceof Array)?newTilesArg:[newTilesArg];
        const newTiles = tiles.current.map(tileRow => {
            return tileRow.map(tile => {
                const foundTile = newTile.find(t=>(t.id===tile.id));
                if (foundTile!=null)
                    return foundTile;
                else
                    return tile;
            });
        });
        tiles.current = newTiles;
        setStateTiles(newTiles);
    }
    
    const getColonie = (cname) => {
        if (tiles.current == null)
            return null;
        for (let i = 0; i < tiles.current.length; i++) {
            for (let j = 0; j < tiles.current[i].length; j++) {
                if (tiles.current[i][j].type === 'colonie' && cname===tiles.current[i][j].id) {
                    return tiles.current[i][j];
                }
            }
        }
        return null;
    }
    const getTile = (newRow, newCol) => {
        if (tiles.current == null)
            return null;
        // Vérification pour s'assurer que les indices sont dans les limites de la carte
        if (newRow >= 0 && newRow < tiles.current.length && newCol >= 0 && newCol < tiles.current[0].length) {
            const tileType = tiles.current[newRow][newCol];
            // Fais quelque chose avec le type de tuile trouvé
            return tileType;
        }
        return null;
    }
    const findTarget = ({ position, autour = 1, connaitTarget }) => {
        //   let targetX= position.x + Math.random() * TILE_SIZE;
        //  let targetY = position.y + Math.random() * TILE_SIZE;

        let target = position.target;
        const pragmatique = position.status === 'Remplie' || (position.pragmatique ?? Math.random() < configuration.pragmatisme);
       

        // Fonction pour trouver la cible en explorant les tuiles voisines

        const { row, col } = getTileIndices(position.x, position.y, TILE_SIZE);
        const casesInteressante = [];
        const casesPossible = [];
        const lastCase = position.lastCase;
        // Exemple : Explorer les tuiles voisines
        for (let i = -autour; i <= autour; i++) {
            for (let j = -autour; j <= autour; j++) {
                const newRow = row + i;
                const newCol = col + j;
                const tile = getTile(newRow, newCol);
                if (tile == null || (tile.row === row && tile.col === col))
                    continue;
                if (tile.type != 'rocher')
                    casesPossible.push(tile);
                // on oublie des interessant la derniere case ou on etait
                if(lastCase===tile.id)
                    continue;
                if ((tile.type === 'sucre' || tile.pheromone?.sucre > 0 || tile.puceron) && position.status !== 'Remplie') {
                    if (pragmatique || tile.type === 'sucre')
                        casesInteressante.push(tile);
                }
                else if (position.status === 'Remplie') {
                    // cherche pheromone de maison
                    if (tile.type === 'colonie' || tile.pheromone?.['colonie'+position.equipe] > 0) {
                        if (pragmatique || tile.type === 'colonie')
                            casesInteressante.push(tile);
                    }
                }
            }
        }
        // 1x sur 10 elle fait ce qu'elle veut
        if (casesInteressante.length > 0) {
            // sort par interet
            casesInteressante.sort((c1, c2) => {

                const c1Connu=connaitTarget(position.id,c1);
                const c2Connu=connaitTarget(position.id,c2);
                let defaultRet = (c1Connu&&!c2Connu)?-1
                    :((!c1Connu&&c2Connu)?1:0)

                if (position.status === 'Remplie') {

                    if (c1.type === 'colonie')
                        return -1;
                    if (c2.type === 'colonie')
                        return 1;
                    if (c1.pheromone?.['colonie'+position.equipe] < c2.pheromone?.['colonie'+position.equipe])
                        return 1;
                        if (c1.pheromone?.['colonie'+position.equipe] > c2.pheromone?.['colonie'+position.equipe])
                            return -1;
                    return defaultRet;
                }
                else {
                    // cherche phero sucre
                    if (c1.type === 'sucre' || c2.type === 'colonie')
                        return -1;
                    if (c2.type === 'sucre' || c1.type === 'colonie')
                        return 1;

                    if (c1.pheromone?.sucre < c2.pheromone?.sucre)
                        return 1;
                        if (c1.pheromone?.sucre > c2.pheromone?.sucre)
                            return -1;
                    return defaultRet;
                }
            });

            target = casesInteressante[0];
            if(target.id===position.lastCase&&casesInteressante.length>1)
            target =  casesInteressante[Math.floor(Math.random() * casesInteressante.length-1)+1];
        }
        else if (casesPossible.length > 0)
          {
            //target = casesPossible[Math.floor(Math.random() * casesPossible.length)];
            // // si y a le choix, on prend celles qui a le moins de pheromones de ce qu'on transporte
            casesPossible.sort((c1,c2)=>{
                const c1Connu=connaitTarget(position.id,c1);
                const c2Connu=connaitTarget(position.id,c2);
                let defaultRet = (c1Connu&&!c2Connu)?-1
                    :((!c1Connu&&c2Connu)?1:0)
              
                const c1c=(c1.pheromone?.['colonie'+position.equipe]??0);
                const c2c=(c2.pheromone?.['colonie'+position.equipe]??0);
                const c1s=(c1.pheromone?.sucre??0);
                const c2s=(c2.pheromone?.sucre??0);
                if (position.status === 'Remplie'){
                    return c1s>c2s?-1:(c1s<c2s?1:defaultRet);
                }
                if (position.status !== 'Remplie'){
                    return c1c>c2c?-1:(c1c<c2c?1:defaultRet);
                }
                return defaultRet;
            })
             target = casesPossible[0];// choisit la + interessante
             if(target.id===position.lastCase&&casesPossible.length>1)// sauf si c'est la precedente
                target =  casesPossible[Math.floor(Math.random() * casesPossible.length-1)+1];

          } 
       
        return [0, 0, target];
    }

    const value = {
        tiles: stateTiles, fourmiProduction,
        getTile, findTarget, replaceTile
        // Ajoute d'autres fonctions ou informations liées aux tuiles si nécessaire
    };

    return <TilesContext.Provider value={value}>{children}</TilesContext.Provider>;
};


const generateGroupedRandomTiles = (nbRows, nbColumns) => {
    const tiles = [];
    const tileTypes = [];
    const getMajorityType = (neighborTypes) => {
        // Compte le nombre d'occurrences de chaque type dans l'environnement
        const typeCounts = {};
        neighborTypes.forEach((type) => {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        // Trouve le type majoritaire (le plus fréquent)
        const maxCount = Math.max(...Object.values(typeCounts));
        const majorityTypes = Object.keys(typeCounts).filter((type) => typeCounts[type] === maxCount);

        // Si un seul type est majoritaire, retourne ce type, sinon retourne null
        if (majorityTypes.length > 1) {
            return majorityTypes[Math.floor(Math.random() * majorityTypes.length)];
        }
        return majorityTypes.length === 1 ? majorityTypes[0] : null;
    };
    // une premiere passe au hasard
    for (let row = 0; row < nbRows; row++) {
        const rowTiles = [];
        const trow = [];
        for (let col = 0; col < nbColumns; col++) {


            // Choix du type de tuile en fonction de la règle
            const tile = {
                ...TILE_CHOICES[Math.floor(Math.random() * TILE_CHOICES.length)],
                total: 10,
                contenu: 10,
                id: row + '-' + col,
                row: row,
                col: col,
            };
                // on rajoute des pucerons au hasard sur l'herbe
        if(Math.random()<0.2&&tile.type==='herbe'){
            tile.puceron=true;
        }
            trow.push(tile.type);
            rowTiles.push(tile);
        }
        tileTypes.push(trow);
        tiles.push(rowTiles);
    }
    // une 2eme passe pour rassembler

    for (let row = 0; row < nbRows; row++) {
        for (let col = 0; col < nbColumns; col++) {
            // Récupère les types des 8 cases autour de la case actuelle
            const neighborTypes = [];
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (newRow >= 0 && newRow < nbRows && tileTypes[newRow] != null && newCol >= 0 && newCol < nbColumns && tileTypes[newRow][newCol] != null) {
                        neighborTypes.push(tileTypes[newRow][newCol]);
                    }
                }
            }

            // Trouve le type majoritaire dans l'environnement
            const majorityType = getMajorityType(neighborTypes);

            // 75% de chance que le type soit le même que le type majoritaire de l'environnement
            const shouldFollowMajority = Math.random() < 0.75;
            if (shouldFollowMajority)
                tiles[row][col].type = majorityType;
        }
    }




    return tiles;
};

// Fonction pour convertir des coordonnées en pixels en indices de tuile
export const getTileIndices = (x, y, tileSize) => {
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    return { row, col };
};