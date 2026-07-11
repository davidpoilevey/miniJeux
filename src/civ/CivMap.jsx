import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Circle, Rect, Image, Line, RegularPolygon, Group } from 'react-konva';


import { focusNextUnit, getDistanceHex, getHexagonPoints, getHexNeighbors, getMovementResult, hexToPixel, moveSelectedUnit } from './utils/hexUtils';
import { useCivContext } from './CivContext';
import ActionMenu from './utils/ActionMenu';
import { AllImageSources } from './utils/imagesImports';
import { usePreloadedImages } from './utils/hooks';
import { CityNameDialog, CivilDialog } from './utils/Dialogs';
import { BARBARE_CIV, CIVILIZATIONS } from './data/civilzationTypes';
import { getTileCost } from './utils/utils';
import { addFeatureInTile, calculateTileYield, FEATURE_YIELD } from './utils/mapGenerator';



const UNIT_SCALE = 2; // ou 1.5 si tu veux tester plus progressivement
const SPRITE_SIZE = 24 * UNIT_SCALE;

export const TILE_SIZE = 40;
export const STAGE_WIDTH = 4000;
export const STAGE_HEIGHT = 2000;

export const getCivMeta = (ownerId) => {
    const civ = [...CIVILIZATIONS, BARBARE_CIV].find(c => c.id === ownerId);
    return civ || { name: 'Inconnu', flag: '❔', color: '#999' };
};


const CivMap = ({ setSelected, handleNavigate }) => {
    const {
        tiles, attaque, attaqueCity, nextTurn, setTiles,
        selectedUnitPos, getCityByTile, playerNation,
        setSelectedUnitPos, addEvent, fxTrigger
        , diplomaticInteraction, setDiplomaticInteraction,
        moveUnit, fortifyUnit, removeUnit, selectCity,
        healAround, detonateNuke, isRunning, setRunning, mapConfig,
        techsUnlocked
    } = useCivContext();

    // 🗺️ Cartographie : le brouillard inexploré laisse deviner le terrain.
    // 🌍 Géographie : la carte entière est révélée (terrain + villes, pas les unités).
    const hasCartographie = techsUnlocked.includes('cartographie');
    const hasGeographie = techsUnlocked.includes('geographie');

    const [selectedTile, setSelectedTile] = useState(null);
    const [showMenuAt, setShowMenuAt] = useState(null);
    const images = usePreloadedImages(AllImageSources);
    const [showCityNameDialog, setShowCityNameDialog] = useState(false);
    const [newCityTile, setNewCityTile] = useState(null);
    const [historyCheck, setHistoryCheck] = useState(true);
    const [effect, setEffect] = useState(null); // { x, y, type }

    // pour les explosions
    useEffect(() => {
        if (!fxTrigger) return;
        setEffect(fxTrigger);
        const timer = setTimeout(() => setEffect(null), 600);
        return () => clearTimeout(timer);
    }, [fxTrigger]);

    // pour les routes
    const roadSegments = useMemo(() => {
        const segments = [];
        // Un Set pour s'assurer que chaque segment n'est ajouté qu'une seule fois
        const drawnSegments = new Set();
        // Une map pour un accès rapide aux tuiles par leurs coordonnées
        const tileMap = new Map(tiles.map(t => [`${t.q},${t.r}`, t]));

        // On parcourt uniquement les tuiles qui ont une route
        const roadTiles = tiles.filter(t => t.hasRoad);

        for (const tile of roadTiles) {
            const neighbors = getHexNeighbors(tile); // Obtenir les voisins

            for (const neighborCoords of neighbors) {
                const neighborTile = tileMap.get(`${neighborCoords.q},${neighborCoords.r}`);

                // Si le voisin existe et a aussi une route
                if (neighborTile && neighborTile.hasRoad) {
                    // Créer une clé unique pour le segment pour éviter les doublons (A->B et B->A)
                    const key1 = `${tile.q},${tile.r}-${neighborTile.q},${neighborTile.r}`;
                    const key2 = `${neighborTile.q},${neighborTile.r}-${tile.q},${tile.r}`;

                    if (!drawnSegments.has(key1) && !drawnSegments.has(key2)) {
                        const startPoint = hexToPixel(tile);
                        const endPoint = hexToPixel(neighborTile);

                        segments.push({
                            key: key1,
                            points: [startPoint.x, startPoint.y, endPoint.x, endPoint.y]
                        });

                        // Marquer ce segment comme dessiné
                        drawnSegments.add(key1);
                    }
                }
            }
        }
        return segments;
    }, [tiles, getHexNeighbors]); // Dépendances du useMemo



    const getTile = (a) => tiles.find(t => t.q === a.q && t.r === a.r)
    const isSameTile = (a, b) => a && b && a.q === b.q && a.r === b.r;

    const handleClick = (tile) => {

        if (selectedUnitPos && !isSameTile(tile, selectedUnitPos)) {
            // avec unit selectionn  click case voisine uniquement

            const unit = selectedUnitPos.unit;
            const start = { q: selectedUnitPos.q, r: selectedUnitPos.r };
            const goal = { q: tile.q, r: tile.r };
            unit.targetDestination = goal;

            const result = getMovementResult(unit, start, goal, tiles);
            if (unit.remainingMovement>0 && result) {
                const { endTile, movementUsed } = result;

                // ✅ on vérifie ici la case d’arrivée réelle
                const destTile = getTile(endTile);

                // ❗ on ne permet l’entrée que si elle est vide !
                if (!destTile.unit && !destTile.hasCity) {
                const startTile = getTile(start);

                     setTiles(prev =>
                            prev.map(tile => {
                                if (tile.q === endTile.q && tile.r === endTile.r) {
                                    // destTile
                                    return { ...tile, unit:  { ...unit, remainingMovement: unit.remainingMovement - movementUsed }};
                                }
                                else if(tile.q === startTile.q && tile.r === startTile.r) {
                                      return { ...tile, unit:null};
                                }
                                else
                                return tile;
                            })
                        );

                    setSelectedUnitPos(null);
                    return;
                }
            }

        }
        if (tile.hasCity) {
            const clickedCity = getCityByTile(tile);
            if (selectedUnitPos) {
                const CIVIL_UNITS = ['diplomate', 'caravane', 'pionnier', 'moine'];
                if ((clickedCity.owner.id === selectedUnitPos.unit.owner.id) || CIVIL_UNITS.includes(selectedUnitPos.unit.type)) {
                    setDiplomaticInteraction({
                        unit: selectedUnitPos,
                        city: clickedCity,
                    });
                    return;
                }
                attaqueCity(tile);
            }
            else {
                if (clickedCity.owner.id === playerNation.id) {
                    selectCity(tile);
                    setSelected('city');
                }
                else addEvent("Vous ne pouvez pas entrer dans une ville qui n'est pas a vous", "error")
            }
            return;
        }
        if (selectedUnitPos) {

            if (tile.q === selectedUnitPos.q && tile.r === selectedUnitPos.r) {
                if (showMenuAt != null) {
                    //unselect
                    setShowMenuAt(null);
                    setSelectedUnitPos(null);
                }
                else {
                    const { x, y } = hexToPixel(tile);
                    setShowMenuAt({ x, y });

                }
                return;
            }
            if (!tile.unit && !tile.hasCity) {

                const tileCost = getTileCost(tile);
                // uniquement les cases voisines ici : sans ce check, un clic lointain
                // sans chemin praticable téléportait l'unité à travers la carte
                const distance = getDistanceHex(selectedUnitPos, tile);
                const canMove = distance === 1 && selectedUnitPos.unit.remainingMovement >= tileCost;

                if (canMove) {
                    moveUnit(selectedUnitPos, tile);
                    if (selectedUnitPos.unit.remainingMovement <= 0)
                        setSelectedUnitPos(null);
                } else {
                    setSelectedUnitPos(null);
                }
            } else if (tile.unit) {
                attaque(tile);
            }

        }
        else {
            setShowMenuAt(null);
            if (tile.unit) {
                if (tile.unit.targetDestination)
                    tile.unit.targetDestination = null;
                setSelectedUnitPos(tile);
            }
            else
                setSelectedTile(tile);
        }
    };

    const onActionClick = action => {
        switch (action.id) {
            case 'fortify':
                fortifyUnit(selectedUnitPos);  setSelectedUnitPos(null); break;
            case 'disband':
                removeUnit(selectedUnitPos); break;
            case 'road':
                // via setTiles, sinon la route n'apparaît qu'au tour suivant
                setTiles(prev =>
                    prev.map(tile =>
                        tile.q === selectedUnitPos.q && tile.r === selectedUnitPos.r
                            ? { ...tile, hasRoad: true }
                            : tile
                    )
                );
                addEvent("route construite");
                 setSelectedUnitPos(null);
                break;
            case 'heal':
            case 'prier':
                healAround(selectedUnitPos);
                break;
            case 'nuke':
                detonateNuke(selectedUnitPos);
                break;
            case 'labour':
                if (!selectedUnitPos.feature) {

                    setTiles(prev =>
                        prev.map(tile => {
                            if (tile.q === selectedUnitPos.q && tile.r === selectedUnitPos.r) {
                                tile.feature='zone';
                                return { ...tile, unit: null, feature: 'zone', yield:calculateTileYield(tile) };
                            }
                            return tile;
                        })
                    );
                    setSelectedUnitPos(null);
                    addEvent("Zone agraire construite");
                }
                break;
            case 'dig':
                if (!selectedUnitPos.feature) {
                    // random
                    if (Math.random() < 0.7) {
                        addFeatureInTile(selectedUnitPos);
                        setTiles(prev =>
                            prev.map(tile => {
                                if (tile.q === selectedUnitPos.q && tile.r === selectedUnitPos.r) {
                                    
                                    return { ...tile, feature: selectedUnitPos.feature, yield:calculateTileYield(selectedUnitPos) };
                                }
                                return tile;
                            })
                        );
                        addEvent("Vous avez rendu cet endroit riche et fertile grace a votre travail", "success")
                    }
                    else {
                        addEvent("Pas de chance, y a rien a cet endroit (1 chance sur 3)", "warning")
                    }
                    removeUnit(selectedUnitPos);
                }
                break;
            case 'city':
                setNewCityTile(selectedUnitPos);
                setShowMenuAt(null);
                setShowCityNameDialog(true);
                //foundCity(selectedUnitPos);
                break;
            default: console.warn('Action inconnue ' + action.id)
        }
        setShowMenuAt(null);
    };
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (isRunning) return; // pas de double tour si on martèle Entrée
                setRunning(true);
                setTimeout(nextTurn, 1);
            } else if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                if (selectedUnitPos == null)
                    return;
                if (selectedUnitPos.unit.remainingMovement > 0 && moveSelectedUnit(e.key, selectedUnitPos, tiles, handleClick))
                    e.preventDefault();
            } else if (e.key === ' ') {

                const nextTile =focusNextUnit(selectedUnitPos, tiles, playerNation);
                if(nextTile!=null){
                    setSelectedUnitPos(nextTile);
                    handleNavigate(nextTile.q, nextTile.r)
                }
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedUnitPos, tiles, playerNation, setSelectedUnitPos, isRunning, nextTurn]);
   
     useEffect(() => {
        

    // Ajoute une entrée fictive
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e) => {
        // L'utilisateur tente de revenir en arrière
        window.history.pushState(null, '', window.location.href);
        alert("Attention avec le scroll vers la gauche !! Dernier avertissement. Changez de vue pour remettre cette securité");
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [historyCheck]);


    return (
        <> 
        {/* <Box ref={mapContainerRef} onScroll={handleScroll} sx={{width: '100%', height: '100%', overflow: 'auto'}}> */}
            <Stage width={mapConfig?.width || STAGE_WIDTH} height={mapConfig?.height || STAGE_HEIGHT}>
            <Layer>
                {tiles.map(tile => {
                    const { x, y } = hexToPixel(tile);
                    const isSelected = selectedTile?.q === tile.q && selectedTile?.r === tile.r;
                    const explored = tile.explored || hasGeographie;

                    const city = tile.hasCity ? getCityByTile(tile) : null;
                    const cityOwner = city?.owner;
                    const cityFlag = cityOwner?.flag;


                    return (
                        <React.Fragment key={`${tile.q},${tile.r}`}>
                            <Group
                                x={x}
                                y={y}
                                clipFunc={(ctx) => {
                                    const points = getHexagonPoints(0, 0, TILE_SIZE);
                                    ctx.beginPath();
                                    ctx.moveTo(points[0].x, points[0].y);
                                    for (let i = 1; i < points.length; i++) {
                                        ctx.lineTo(points[i].x, points[i].y);
                                    }
                                    ctx.closePath();
                                }}
                            >
                                <KonvaImage
                                    x={-TILE_SIZE}
                                    y={-TILE_SIZE}
                                    width={TILE_SIZE * 2}
                                    height={TILE_SIZE * 2}
                                    image={images[tile.type]}
                                    onClick={() => handleClick(tile)}
                                />
                                <Rect
                                    x={-TILE_SIZE}
                                    y={-TILE_SIZE}
                                    width={TILE_SIZE * 2}
                                    height={TILE_SIZE * 2}

                                    listening={false}
                                    fill={explored
                                        ? (tile.visible ? 'transparent' : 'rgba(0,0,0,0.3)')
                                        : (hasCartographie ? 'rgba(0, 0, 0, 0.93)' : 'black')}
                                />
                            </Group>



                            {tile.feature && explored && (
                                <KonvaImage
                                    x={x - SPRITE_SIZE / 2}
                                    y={y - SPRITE_SIZE / 2}
                                    width={SPRITE_SIZE}
                                    height={SPRITE_SIZE}
                                    image={images[tile.feature]}
                                    stroke={isSelected ? 'blue' : null}
                                />

                            )}

                            {/* pas d'espionnage gratuit : une ville n'apparaît que si la zone est explorée */}
                            {tile.hasCity && explored && (
                                <>
                                    <KonvaImage
                                        x={x - SPRITE_SIZE / 2}
                                        y={y - SPRITE_SIZE / 2}
                                        width={SPRITE_SIZE}
                                        height={SPRITE_SIZE}
                                        image={images['city']}
                                        stroke={getCivMeta(cityOwner).color}
                                        strokeWidth={3}
                                        onClick={() => handleClick(tile)}
                                    />

                                    <Group x={x} y={y}>
                                        {/* Fond lisible derrière le texte */}
                                        <Rect
                                            x={-40}
                                            y={0}
                                            width={80}
                                            height={24}
                                            fill="rgba(0, 0, 0, 0.5)"
                                            cornerRadius={4}
                                            listening={false}
                                        />

                                        <Text
                                            x={-40}
                                            y={-10}
                                            text={cityFlag}
                                            fontSize={20}
                                        />
                                        <Text
                                            offsetX={-15}
                                            offsetY={5}
                                            text={city?.population || 0}
                                            fontSize={20}

                                            fill="white"
                                            align="center"
                                        />
                                        <Text
                                            text={city?.name || 'squoi ce bordel'}
                                            fontSize={12}
                                            fill="white"
                                            align="center"
                                            width={80}
                                            offsetX={45}
                                            offsetY={-10}
                                            listening={false}
                                        />

                                        {/* 💤 ville du joueur sans production : ça se voit ! */}
                                        {cityOwner?.id === playerNation.id
                                            && !city?.currentProduction
                                            && (city?.productionQueue?.length || 0) === 0 && (
                                            <Group listening={false}>
                                                <Circle
                                                    x={26}
                                                    y={-26}
                                                    radius={12}
                                                    fill="rgba(198, 40, 40, 0.95)"
                                                    stroke="white"
                                                    strokeWidth={2}
                                                />
                                                <Text
                                                    x={26 - 8}
                                                    y={-26 - 8}
                                                    text="💤"
                                                    fontSize={16}
                                                />
                                            </Group>
                                        )}
                                    </Group>

                                </>

                            )}


                        </React.Fragment>
                    );
                })}
 {/* pour les routes */}
  {roadSegments.map(segment => (
            <Line
                key={segment.key}
                points={segment.points}
                stroke="SaddleBrown"
                strokeWidth={8}
                lineCap="round"
                lineJoin="round"
                listening={false}
            />
        ))}

                {/* pour les units */}
                {tiles.map(tile => {
                    if (!tile.unit || !tile.explored)
                        return null;
                    const unitType = tile.unit;
                    const icon = unitType?.icon || '❓';
                    const { x, y } = hexToPixel(tile);
                    const unitOwner = tile.unit?.owner?.id ?? tile.unit?.owner;
                    const isSelectedUnit = selectedUnitPos && isSameTile(tile, selectedUnitPos);
                    const unitFlag = unitOwner ? getCivMeta(unitOwner).flag : null;
                    const movementLeft = tile.unit.remainingMovement ?? unitType.movement;
                    const hpRatio = tile.unit.hp / tile.unit.hpMax;
const tileid=tile.q+'-'+tile.r;
                    return (
                        <React.Fragment key={tileid}>{images[tile.unit.type] ? (
                            <KonvaImage
                                x={x - SPRITE_SIZE / 2}
                                y={y - SPRITE_SIZE / 2}
                                width={SPRITE_SIZE}
                                height={SPRITE_SIZE}
                                image={images[tile.unit.type]}
                                onClick={() => handleClick(tile)}
                                stroke={isSelectedUnit ? 'red' : null}
                                opacity={tile.unit.remainingMovement === 0 ? 0.4 : 1}
                            />

                        ) : <>

                            <Circle
                                x={x}
                                y={y}
                                radius={12}
                                fill="black"
                                stroke={isSelectedUnit ? 'red' : 'white'}
                                strokeWidth={2}
                                onClick={() => handleClick(tile)}
                            />

                            {/* Icone Unicode */}
                            <Text
                                x={x - 8}
                                y={y - 8}
                                text={icon}
                                fontSize={18}
                                fill="white"
                                onClick={() => handleClick(tile)}
                            />

                        </>}
                            {/* 🔋 Barre de vie */}
                            <Rect
                                x={x - 10}
                                y={y - 22}
                                width={20}
                                height={4}
                                fill="grey"
                                cornerRadius={2}
                            />
                            <Rect
                                x={x - 10}
                                y={y - 22}
                                width={20 * hpRatio}
                                height={4}
                                fill={hpRatio > 0.6 ? 'green' : hpRatio > 0.3 ? 'orange' : 'red'}
                                cornerRadius={2}
                            />

                            <Text
                                x={x - 8}
                                y={y - 28}
                                text={unitFlag}
                                fontSize={14}
                            />

                            {/* 🦶 Mouvements restants (texte) */}
                            {Array.from({ length: unitType.movement }).map((_, i) => (
                                <Circle
                                    key={'c-'+tileid+'-'+i}
                                    x={x - 12 + i * 7}
                                    y={y + 18}
                                    radius={3}
                                    fill={i < movementLeft ? 'cyan' : '#555'}
                                />
                            ))}

                        </React.Fragment>
                    );
                })}

                {effect && (
                    <KonvaImage
                        x={effect.x - 20}
                        y={effect.y - 20}
                        width={SPRITE_SIZE}
                        height={SPRITE_SIZE}
                        image={images['explosion']}
                    />
                )}
                {/* Étape 2 : Bordures hexagonales par-dessus */}
                <React.Fragment>
                    {tiles.map(tile => {
                        const { x, y } = hexToPixel(tile);
                        if (tile.hasCity) return null;
                        return (
                            <RegularPolygon
                                key={`border-${tile.q},${tile.r}`}
                                x={x}
                                y={y}
                                sides={6}
                                radius={TILE_SIZE}
                                stroke="black"
                                strokeWidth={1}
                                fillEnabled={false}
                                listening={false}
                            />
                        );
                    })}
                </React.Fragment>

            </Layer>

            {showMenuAt && selectedUnitPos && (
                <Layer>
                    <ActionMenu
                        x={showMenuAt.x + 20}
                        y={showMenuAt.y - 20}
                        actions={selectedUnitPos.unit.actions}
                        onActionClick={onActionClick}
                    />
                </Layer>
            )}
        </Stage>
{/* </Box> */}

            <CityNameDialog showCityNameDialog={showCityNameDialog} newCityTile={newCityTile}
                setShowCityNameDialog={setShowCityNameDialog} />
            {diplomaticInteraction && (
                <CivilDialog
                    unitPos={diplomaticInteraction.unit}
                    city={diplomaticInteraction.city}
                    onClose={() => setDiplomaticInteraction(null)}
                />
            )}
     
        </>
    );
};

export default CivMap;


const useImage = (src) => {
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (!src) return;
        const img = new window.Image();
        img.src = src;
        img.onload = () => setImage(img);
    }, [src]);

    return image;
};



