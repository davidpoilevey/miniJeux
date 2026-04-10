import React, { useEffect, useMemo, useRef, useState } from "react";
import { ADN, evaluateGeneticDiversity, findCellDirection, getNearestCell, haveSex, randomADN } from "./ADN";
import { Box, Button, Card, CardActions, CardContent, CardHeader, Popover, Typography } from "@mui/material";
import Cellule, { getCellSize } from "./Cellule";
import { BakeryDining, LunchDining } from "@mui/icons-material";

const NB_INITIAL = 20;

const PetriBox = ({ chaineADN, position, ...props }) => {
    const cells = useRef([]);
    const [bouffe, setBouffe] = useState([]);
    const [gen, setGen] = useState(0);
    const petriRef = useRef();
    const cellIDSeed = useRef(1);
    const [anchorEl, setAnchorEl] = useState(null);
    const [infoCell, setInfoCell] = useState(null);

    const displayInfo = (event, infos) => {
        setAnchorEl(event.currentTarget);
        setInfoCell(<Box><Typography variant="h4">{infos.id}</Typography>
            <Typography variant="body2">Energie: {infos.energie}</Typography>
            <Typography variant="body2">Vitesse: {infos.vitesse}</Typography>
            <Typography variant="caption">Vitesse: {infos.adn}</Typography>
        </Box>)
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };


    const getPetriBoxRandomPos = () => {

        const rect = petriRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const maxRadius = Math.min(centerX, centerY);

        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * maxRadius;

        const x = centerX - 10 + radius * Math.cos(angle);
        const y = centerY - 10 + radius * Math.sin(angle);
        return { x, y };

    }
    const getElite = (nb) => {// ceux qui ont le plus d'energie
        const cellCopy = [...cells.current];
        cellCopy.sort((c1, c2) => {
            return (c1.energie > c2.energie) ? 1 : -1;
        });
        return cellCopy.slice(0, nb);
    }
    const nextGen = () => {
        setGen(gen + 1);
        // selection des 10 meilleurs
        const elite = getElite(10);
        cells.current=[];
        // recombinaison genetique
        for (let cell = 0; cell < elite.length - 1; cell += 2) {
            const adam = elite[cell];
            const eve = elite[cell + 1];
            cells.current.push(adam,eve);
            // font N enfants
            const adamAdn = new ADN(adam.adn);
            const eveAdn = new ADN(eve.adn);
            adam.parent = true;
            eve.parent = true;
            const tauxReproduction = adamAdn.getTauxReproduction() + eveAdn.getTauxReproduction();
            for (let bebe = 0; bebe < tauxReproduction; bebe++) {
                cellIDSeed.current++;
                //mutation done by haveSex
                const [loki, thor] = haveSex(adam, eve, cellIDSeed.current);
                const { x, y } = getPetriBoxRandomPos();
                thor.position = { x, y };
                loki.position = { x: y, y: x };
                cells.current.push(thor, loki);
            }
        }
    }
    const raz = () => {
        setGen(0);
        setBouffe([]);
    }
    // initialization
    useEffect(() => {
        const firstCells = [];
        if (gen === 0) {

            for (let n = 0; n < NB_INITIAL; n++) {
                const { x, y } = getPetriBoxRandomPos();
                const newCell = {
                    id: 'cell' + n,
                    adn: randomADN(),
                    position: { x: x, y: y },
                };

                firstCells.push(newCell);
            }
            cells.current = firstCells;
            // meme chose pour la bouffe
            const repas = [];
            for (let n = 0; n < NB_INITIAL; n++) {
                const { x, y } = getPetriBoxRandomPos();
                const newBouffe = {
                    id: 'bouffe' + n,
                    position: { x: x, y: y },
                    valeurNutritive: Math.random() * 100

                };
                repas.push(newBouffe);
            }
            setBouffe(repas);
            setGen(1);
        }

    }, [gen]);

    // bouffe se remet regulierement

    useEffect(() => {
        // Vérification et ajout de nourriture si nécessaire
        if (bouffe.length < 10) {
            const newBouffe = [];
            for (let n = 0; n < 100; n++) {
                const { x, y } = getPetriBoxRandomPos();
                cellIDSeed.current++;
                const newFood = {
                    id: 'bouffe' + cellIDSeed.current,
                    position: { x: x, y: y },
                    valeurNutritive: Math.random() * 100
                };
                newBouffe.push(newFood);
            }
            setBouffe((prevBouffe) => [...prevBouffe, ...newBouffe]);
        }
    }, [bouffe.length]);

    const petriBox = {
        updatePosition: (cellID, pos, nrj) => {
            let rencontre = null;
            cells.current.forEach(cell => {
                if (cell.id === cellID){
                    cell.energie = nrj;
                    cell.position = pos;
                }
                else if (cell.position.x + getCellSize(cell) > pos.x
                    && cell.position.x < getCellSize(cell) + pos.x
                    && cell.position.y + getCellSize(cell) > pos.y
                    && cell.position.y < getCellSize(cell) + pos.y)
                    rencontre = cell;
            });
            if (rencontre == null) {
                // check for bouffe
                bouffe.forEach(miette => {
                    if (miette.position.x + 10 > pos.x
                        && miette.position.x < 10 + pos.x
                        && miette.position.y + 10 > pos.y
                        && miette.position.y < 10 + pos.y)
                        rencontre = miette;
                });
            }
            return rencontre;
        },
        removeBouffe: (bouffeID) => {
            setBouffe(oldB => (oldB.filter(b => b.id !== bouffeID)));
        },
        aAccouche: (cellID) => {
            const removedCell = cells.current.find(c => c.id === cellID);
            removedCell.parent = false;
        },
        celluleMeurt: (cellID) => {
            const removedCell = cells.current.find(c => c.id === cellID);
            if (removedCell != null) {
                // add Gros gateau a la place
                setBouffe(repas => {
                    return [...repas, { id: 'bouffeCadavre' + removedCell.id, position: removedCell.position, valeurNutritive: 150 }]
                })
                cells.current = cells.current.filter(c => c.id !== cellID);

                // on en profite pour checker s'il faut pas nextGen
                if (cells.current.length <= 10)
                    nextGen();
            }
        },
        getNearestNourriture: (fromCell) => {
            let nearest = null;
            let nearestDistance = Infinity;
            bouffe.forEach((miette) => {

                const distanceX = fromCell.x - miette.position.x;
                const distanceY = fromCell.y - miette.position.y;
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                // Remplacer la bulle la plus éloignée si celle-ci est plus proche que la bulle actuelle
                if (distance < nearestDistance) {
                    nearest = miette;
                    nearestDistance = distance;
                }
            });
            return [nearest, nearestDistance];


        }
        , getNearestCell: (fromCell) => {
            let nearest = null;
            let nearestDistance = Infinity;
            cells.current.forEach((miette) => {
                if (miette.id === fromCell.id)
                    return;
                const distanceX = fromCell.x - miette.position.x;
                const distanceY = fromCell.y - miette.position.y;
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                // Remplacer la bulle la plus éloignée si celle-ci est plus proche que la bulle actuelle
                if (distance < nearestDistance) {
                    nearest = miette;
                    nearestDistance = distance;
                }
            });
            return [nearest, nearestDistance];


        }
    }

    const divsersiteGenetique = evaluateGeneticDiversity(cells.current);

    return <Box>
        <Box ref={petriRef} style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "1000px",
            height: "800px",
            borderRadius: "50%", // Boîte ronde
            border: "1px solid #ccc",
            backgroundColor: "#ffeeaa", // Couleur jaunâtre
        }}>
            {
                cells.current.map((cell) => {
                    return <Cellule key={cell.id} id={cell.id} position={cell.position} isParent={cell.parent}
                        petri={petriBox} chaineADN={cell.adn} displayInfo={displayInfo} />
                })
            }
            {
                bouffe.map((miette) => {
                    return <Miette key={miette.id} position={miette.position}
                        isCadavre={miette.id.startsWith('bouffeCadavre')}
                        valeur={miette.valeurNutritive} />
                })
            }
        </Box>
        <Box style={{ position: 'absolute', top: 0, right: 0  }}>

            <Card sx={{opacity:0.6}}>
                <CardHeader title={"Generation " + gen} />
                <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent:'space-between' }}>
                    <Typography>Nombre de cellules survivantes: {cells.current.length}</Typography>
                    <Typography>Nombre de croissants: {bouffe.length}</Typography>
                    <Typography>
                        Diversite genetique: <span style={{ color: divsersiteGenetique < 2 ? 'red' : 'darkgreen' }}>{divsersiteGenetique}</span>
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button onClick={raz}>R.A.Z.</Button>
                    <Button onClick={nextGen}>Next generation</Button>
                </CardActions>
            </Card>
        </Box>

        <Box style={{ position: 'absolute', bottom: 0, right: 0 }}>
            <Resume cells={cells.current} bouffe={bouffe} />

        </Box>
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
        >

            {infoCell}

        </Popover>
    </Box>

}
export default PetriBox;

const Resume = ({ cells }) => {


    return <Card>
        <CardHeader title={"Details "} />
        <CardContent>

        </CardContent>
    </Card>
}

const Miette = ({ position, valeur = 20, isCadavre }) => { // 20 par defaut pour de la bouffe ordinaire


    // Par exemple, utilisation d'un dégradé de couleur de vert à rouge en fonction de la valeur
    const hue = (1 - valeur / 100) * 120; // Convertit la valeur en une teinte de couleur (de vert à rouge)
    const valeurStyle = { color: `hsl(${hue}, 100%, 50%)` }; // Utilise la teinte pour définir la couleur HSL

    return <Box style={{ position: 'absolute', top: position.y - 5, left: position.x - 5, ...valeurStyle }}>
        {isCadavre ? <LunchDining /> : <BakeryDining />}
    </Box>
}