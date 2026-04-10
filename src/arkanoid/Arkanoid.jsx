import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Arkanoid.css';
import BriqueBuilder, { BRIQUE_TYPE } from './BriqueBuilder';
import { Box, Button, Divider, FormControl, InputLabel, MenuItem, Popover, Select, Typography } from '@mui/material';
import Bille from './Bille';
import gluImg from './collante.png';
import gripImg from './grip.png';
import { Schemas } from './schemas';

/**
 * 
 * @brique {
 * id , type, width, height
 * } rows
 * @bonus {
 * id, type, icon
 * } bricksPerRow 
 * @bille {position, id, radius, type, vitesseX, vitesseY} types 
 * @returns 
 */
// Schéma de briques

const generateBrickSchema = (schema) => {
    const brickSchema = [];
    let brickCount = 0;
    for (let r = 0; r < schema.length; r++) {
        const schemaRow = schema[r];
        const row = [];
        for (let c = 0; c < schemaRow.length; c++) {
            brickCount++;
            const brique = schemaRow[c];
            if (brique == null)
                row.push(null);
            else {
                const type = brique === '' ? 'standard' : brique;
                row.push({
                    type: type
                    , width: BRIQUE_TYPE[type].width, height: BRIQUE_TYPE[type].height
                });
            }
        }
        brickSchema.push(row);
    }

    return brickSchema;
};

// GLOBAL Variable
const height = 600;
const width = 880;
const paddleHeight = 20;


const defaultBille = [
    {
        id: 1,
        position: { x: 200, y: height - paddleHeight - 50 },
        type: 'normal',
        radius: 10,
        vitesseX: -1,
        vitesseY: -2,
    },
]

const Arkanoid = () => {

    const [paddleWidth, setPaddleWidth] = useState(100);
    const [paddleX, setPaddleX] = useState(paddleWidth * 2);
    const [isBallMoving, setIsBallMoving] = useState(false);
    const [billes, setBilles] = useState(defaultBille);
    const [vies, setVies] = useState(5);
    const [bonuses, setBonuses] = useState([]);
    const [bonusCaught, setBonusCaught] = useState();
    const [brickSchema, setBrickSchema] = useState([]);
    const [missiles, setMissiles] = useState([]);
    const [isMouseMoving, setIsMouseMoving] = useState(false);
    const [paddle, setPaddle] = useState('');
    const [message, setMessage] = useState('');
    const [niveau, setniveau] = useState(1);

    const paddleSpeed = useRef(0);


    const [briques, setBriques] = useState([]);

    const balleNeuve = () => {
        const newBille = {...defaultBille[0], position:{x:paddleX+paddleWidth/2, y:height - paddleHeight - 50 }}
        setBilles([newBille]);
        setIsBallMoving(false);
    }
    const arkaRef = useRef();
    const paddleRef = useRef();

    // initialisation, create Schema
    useEffect(() => {
        // 'standard', 'speed', 'slow', 'gros', 'petit', 'dur','collante','effect','multi','fire','acid',vie'

        //const newSchema =  generateBrickSchema(6, 16, ['standard','collante','effect']);
        const theNiveau = Schemas.getNiveau(niveau);
        const newSchema = generateBrickSchema(theNiveau.schema);
        setMessage(theNiveau.name);
        setBrickSchema(newSchema);
        balleNeuve();
        setPaddle('');
        setPaddleWidth(100);
    }, [niveau]);

    const mouseMoveTimeout = useRef();
    const handleMouseMove = (event) => {
        // Met à jour la position X du paddle en fonction de la position X de la souris
        const mouseX = event.clientX;
        const arkaLeft = arkaRef.current.getBoundingClientRect().left;
        const newPaddleX = mouseX - paddleWidth / 2 - arkaLeft;
        paddleSpeed.current = newPaddleX - paddleX;
        setPaddleX(Math.min(Math.max(newPaddleX, 0), width - paddleWidth));
        if (paddle === 'collante' && billes.some(b => (b.glued))) {
            // bille collee au paddle
            setBilles(billes => {
                return billes.map(bille => {
                    if (!bille.glued)
                        return bille;
                    const updatedBille = { ...bille, position: { x: newPaddleX, y: bille.position.y } };
                    return updatedBille;
                })
            });
        }
        if (!isMouseMoving && (newPaddleX < 10 || newPaddleX + paddleWidth > width - 10))// touch bumpers, secoue les billes
        {
            setBilles(billes => {
                return billes.map(bille => {
                    const updatedBille = { ...bille, vitesseY: bille.vitesseY - 0.2, vitesseX: (newPaddleX < 10 ? bille.vitesseX + 0.1 : bille.vitesseX - 0.1) };
                    return updatedBille;
                })
            });
        }
        setIsMouseMoving(true);
        clearTimeout(mouseMoveTimeout.current);
        mouseMoveTimeout.current = setTimeout(() => {
            // La souris ne bouge plus, réinitialise la vitesse du paddle à zéro
            setIsMouseMoving(false);
            paddleSpeed.current = 0;
        }, 50);

    };
    const handleMouseClick = () => {
        if (!isBallMoving || billes.some(b => (b.glued))) {
            const newBilles = billes.map((bille) => ({
                ...bille,
                glued: false,
                vitesseX: bille.vitesseX ?? 1, // Remplace ces valeurs avec celles que tu veux pour le mouvement initial
                vitesseY: -1,
            }));
            setBilles(newBilles);
            setIsBallMoving(true);
        }
        if (paddle === 'fire') {
            const newMissileLeft = {
                id: Date.now() + 'left', // Un identifiant unique pour le missile
                x: paddleX - 3, // Position horizontale du missile
                y: height - 10, // Position verticale du missile (juste au-dessus du paddle)
            };
            const newMissileRight = {
                id: Date.now() + 'right', // Un identifiant unique pour le missile
                x: paddleX + paddleWidth + 3, // Position horizontale du missile
                y: height - 10, // Position verticale du missile (juste au-dessus du paddle)
            };
            setMissiles((prevMissiles) => [...prevMissiles, newMissileLeft, newMissileRight]);
        }
    };

    const handleBriqueTouchee = useCallback((brique) => {

        if (brique.resistance === 'double') {
            // reduit la resistance

            return setBriques(oldBriques => {
                const newBriques = oldBriques.filter(b => b.id !== brique.id);
                newBriques.push({ ...brique, resistance: 'simple' })
                return newBriques
            })
        }

        if (BRIQUE_TYPE[brique.type].cadeau != null) {
            // Ajouter un bonus qui descend
            const bonus = {
                id: 'bonus' + brique.id,
                type: brique.type,
                vitesse:BRIQUE_TYPE[brique.type].cadeau.vitesse||2,
                icon: BRIQUE_TYPE[brique.type].cadeau.icon,
                position: { x: brique.left + brique.width / 2, y: brique.top + brique.height },
            };
            setBonuses((oldBonuses) => {
                const newBonus = [...oldBonuses];
                if (!newBonus.find(b => bonus.id === b.id))
                    newBonus.push(bonus);
                return newBonus
            });
        }
        setBriques(oldBriques => {
            const newBriques = oldBriques.filter(b => b.id !== brique.id);
            return newBriques
        });
    }, [])
    const briqueTouchee = useCallback((bille) => {
        let side = 'x';
        for (const brique of briques) {
            if (
                bille.position.x + (bille.radius * 2) >= brique.left &&
                bille.position.x <= brique.left + brique.width &&
                bille.position.y + (bille.radius * 2) >= brique.top &&
                bille.position.y <= brique.top + brique.height
            ) {
                // La bille a touché cette brique
                if (bille.position.x + bille.radius > brique.left && bille.position.x < brique.left + brique.width)
                    side = 'y';// touche par au-dessus ou en-dessous, on inverse les y
                return [brique, side];
            }
        }
        return [null, side];
    }, [briques]);
    // Fonction de mise à jour de la position de la balle
    const updateBallPosition = useCallback(() => {
        if (isBallMoving) {
            //  const width = arkaRef.current.getBoundingClientRect().width;

            setBilles(oldBilles => {

                const perdues = [];
                const newBilles = oldBilles.map((bille) => {
                    const updatedBille = { ...bille };
                    if (bille.glued)
                        return bille;
                    let newPosX = updatedBille.position.x + updatedBille.vitesseX;
                    let newPosY = updatedBille.position.y + updatedBille.vitesseY;
                    // Gestion des collisions avec les bords de l'écran
                    if (bille.position.x + bille.vitesseX <= 0 || bille.position.x + bille.vitesseX + (bille.radius * 2) >= width) {
                        updatedBille.vitesseX = -bille.vitesseX;
                        newPosX += updatedBille.vitesseX;// petit rebond en plus pour eviter de coller
                    }
                    if (bille.position.y + bille.vitesseY < 0) {
                        updatedBille.vitesseY = -bille.vitesseY;
                        newPosY += updatedBille.vitesseY;// petit rebond en plus pour eviter de coller
                    }
                    // REBONDISSEMENT paddle est a bottom:10 et fait 20 de haut
                    if (bille.position.y + bille.vitesseY + (bille.radius * 2) > height - 20
                        && bille.position.x + bille.vitesseX + bille.radius > paddleX
                        && bille.position.x + bille.vitesseX + bille.radius < paddleX + paddleWidth)// sauvé par le paddle
                    {
                        // ici pour les effets de paddle
                        updatedBille.vitesseY = -bille.vitesseY;
                        newPosY += updatedBille.vitesseY;// petit rebond en plus pour eviter de coller
                        // selon l'incidence sur le paddle, l'angle varie
                        let variationX = (bille.position.x - (paddleX + paddleWidth / 2)) / paddleWidth;
                        // variation par frottement sur le paddle
                        // variationX =(paddle==='effect')? (variationX+paddleSpeed.current)
                        // :(variationX+paddleSpeed.current/5);
                        const effectFactor = (paddle === 'effect') ? 2 : 5;
                        if (paddle === 'collante') {
                            updatedBille.glued = true;
                        }
                        updatedBille.vitesseX += variationX + paddleSpeed.current / effectFactor;
                    }

                    if (bille.position.y + bille.vitesseY + (bille.radius * 2) >= height) {

                        perdues.push(bille.id);
                    }

                    updatedBille.position.x = newPosX;
                    updatedBille.position.y = newPosY;
                    // Gestion des collisions avec les briques
                    // Utilise la fonction checkCollisionWithBricks pour détecter les collisions avec les briques
                    const [collidedBrick, side] = briqueTouchee(updatedBille); // checkCollisionWithBricks(bille, brickSchema);
                    if (collidedBrick) {
                        if (updatedBille.type !== 'acid') {// les billes acides traversent les murs

                            // La balle a touché une brique, ajuste la direction de la balle en fonction de la collision
                            if (side === 'y')
                                updatedBille.vitesseY = -updatedBille.vitesseY;
                            else {

                                updatedBille.vitesseX = -updatedBille.vitesseX;
                                // et un petit effet random a 20% de chance pour redresser la balle en mouvement vertical
                                if ((Math.random() * 100) < 20)
                                    updatedBille.vitesseY *= 1.1;
                            }
                        }
                        // Supprimer la brique du schéma des briques
                        handleBriqueTouchee(collidedBrick);
                    }

                    // Met à jour la position de la balle en fonction des vitesses
                    updatedBille.position.x = newPosX;
                    updatedBille.position.y = newPosY;

                    return updatedBille;
                });
                return newBilles.filter((b) => !perdues.find((id) => id === b.id));
            })


        }
    }, [briqueTouchee, handleBriqueTouchee, isBallMoving, paddleWidth, paddleX]);

    const updateBonusPosition = useCallback(() => {
        if (bonuses.length === 0)
            return;
        setBonuses((oldBonuses) =>
            oldBonuses.map((bonus) => ({
                ...bonus,
                position: { x: bonus.position.x, y: bonus.position.y + bonus.vitesse },
            }))
        );

        // Vérification des collisions avec le paddle
        const paddleLeft = paddleX;
        const paddleRight = paddleX + paddleWidth;
        const paddleTop = height - paddleHeight;



        // Parcours les bonus pour vérifier s'ils entrent en contact avec le paddle
        bonuses.forEach((bonus) => {
            const bonusLeft = bonus.position.x;
            const bonusRight = bonus.position.x + 60 //bonusSize;
            const bonusBottom = bonus.position.y + 20 //bonusSize;

            if (
                bonusBottom >= paddleTop && // Le bonus est dans la même hauteur que le paddle
                bonusLeft <= paddleRight && // Le bord gauche du bonus est à gauche du bord droit du paddle
                bonusRight >= paddleLeft // Le bord droit du bonus est à droite du bord gauche du paddle
            ) {
                setBonusCaught(bonus); // Le bonus a été attrapé par le paddle
            }
            if (bonusBottom > height)
                setBonuses(bn => {// on retire le bonus

                    const newBonuses = bn.filter(b => b.id !== bonus.id);
                    return newBonuses;
                })
        });
    }, [bonuses, paddleWidth, paddleX]);

    const checkMissileCollisions = useCallback(() => {
        // Vérifier si un missile touche une brique
        setMissiles((prevMissiles) => {
            const filteredMissiles = [...prevMissiles];
            const updatedMissiles = [];
            // Parcourir tous les missiles
            for (let i = 0; i < filteredMissiles.length; i++) {
                const missile = filteredMissiles[i];

                // Vérifier les collisions avec les briques
                const [collidedBrick] = briqueTouchee({ position: missile, radius: 2 });

                // Si le missile touche une brique, retirez le missile de la liste
                if (collidedBrick != null) {
                    handleBriqueTouchee(collidedBrick);
                }
                else if (missile.y > 0) {
                    updatedMissiles.push(missile);// on remet le missile en course tant qu'il est dans l'ecran
                }

            }

            return updatedMissiles;
        });
    }, [briqueTouchee, handleBriqueTouchee]);
    // Effets des Missiles
    const updateMissilePosition = useCallback(() => {

        setMissiles((prevMissiles) =>
            prevMissiles.map((missile) => ({
                ...missile,
                y: missile.y - 5, // Vitesse de déplacement du missile vers le haut (ajustez selon vos besoins)
            }))
        );


        // Vérifier les collisions entre les missiles et les briques
        if (missiles.length > 0)
            checkMissileCollisions();

    }, [checkMissileCollisions, missiles.length]);
    // Utilise requestAnimationFrame pour gérer l'animation de la balle
    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            updateBallPosition();
            updateBonusPosition();
            updateMissilePosition();
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isBallMoving, updateBallPosition, updateBonusPosition, updateMissilePosition]);

    // Effets des BONUS !!
    useEffect(() => {
        // pour chaque bonus caught
        if (bonusCaught != null) {
            // appliquer effet
            if (bonusCaught.type === 'speed')
                setBilles(billes => {
                    return billes.map(bille => {
                        const updatedBille = { ...bille, vitesseX: bille.vitesseX * 1.2, vitesseY: bille.vitesseY * 1.4 };
                        return updatedBille;
                    })
                });
            if (bonusCaught.type === 'slow')
                setBilles(billes => {
                    return billes.map(bille => {
                        const updatedBille = { ...bille, vitesseX: bille.vitesseX * 0.7, vitesseY: bille.vitesseY * 0.9 };
                        return updatedBille;
                    })
                });
            if (bonusCaught.type === 'gros')
                setPaddleWidth(w => (w + 50));
            if (bonusCaught.type === 'petit')
                setPaddleWidth(w => (w > 50 ? w - 30 : w));
            //gros petit dur collante multi
            if (bonusCaught.type === 'multi') {
                setBilles(oldBilles => {
                    const modelBille = oldBilles[0]
                    const newBille = {
                        ...modelBille, id: modelBille.id + '-' + oldBilles.length, position: { ...modelBille.position }
                        , vitesseX: -(eval(modelBille.vitesseX))
                        , vitesseY: -Math.abs(eval(modelBille.vitesseY))
                    };// repart vers le haut avec une vitesseX differente
                    return oldBilles.concat(newBille);
                })
            }
            if (bonusCaught.type === 'collante' || bonusCaught.type === 'fire' || bonusCaught.type === 'effect')
                setPaddle(bonusCaught.type);
            // reste acid
            if (bonusCaught.type === 'acid') {
                // balle traverse tout
                setBilles(oldBilles => {
                    return oldBilles.map(bille => {
                        return { ...bille, type: 'acid' }
                    })
                })
            }
            if (bonusCaught.type === 'vie') {
                // balle traverse tout
                setVies(v => v + 1);
            }
            if (bonusCaught.type === 'rebond') {
                // balle traverse tout
                setBilles(oldBilles => {
                    return oldBilles.map(bille => {
                        return { ...bille, type: 'rebondissante' }
                    })
                })
            }

            // supprimer des bonuses

            setBonuses(bonuses => {// on retire le bonus
                const newBonuses = bonuses.filter(b => b.id !== bonusCaught.id);
                return newBonuses;
            })
            // reset bonusCaught
            setBonusCaught(null);

        }
    }, [bonusCaught]);

    // perte de billes
    useEffect(() => {
        if (billes.length == 0) {
            setVies(v => v - 1);
            balleNeuve();
            if (vies <= 0)
                setMessage('Tu as perdu tete de cul');
        }
    }, [billes.length]);

    // fin du niveau
    useEffect(()=>{
        if(briques.length==0){
            if(niveau===5)
                setMessage('Trop fort Hector');
            else{
                setBilles(defaultBille);
                setniveau(n=>n+1);
                balleNeuve();
            }
        }
    },[briques.length]);
    //reset message apres 5 secondes
    useEffect(()=>{
        if(message!=''){
            setTimeout(()=>{
                setMessage('');
            },4000)
        }
    },[message])



    return (
        <Box style={{ display: 'flex' }}>

<Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' ,margin:'7px'}}>
                <Typography variant='h3' color="secondary">Arkanoid</Typography>
                <Typography variant='h6' color="primary">Niveau {niveau}</Typography>
                <Box>
                    <Vies nb={vies} />
                </Box>
                <Divider/><br/>
                <Typography variant='caption'>Cheat zone</Typography>
                <NiveauSelect niveau={niveau} setNiveau={setniveau} balleNeuve={balleNeuve} />
                <Button onClick={evt=>{setVies(5)}}>Nouvelles vies</Button>
                <Button onClick={balleNeuve}>BALLE NEUVE !!</Button>
            </Box>
            <Box ref={arkaRef}
                className="arkanoid-container"
                style={{ width: width, height: height }}
                onMouseMove={handleMouseMove}
                onClick={handleMouseClick} // Ajoute le gestionnaire d'événements onClick pour mettre la balle en mouvement
            >
                {message!=null&&message!==''&& <div className="message-flottant">{message}</div>}
                {/* Div pour le paddle */}
                <Paddle paddleX={paddleX} paddleWidth={paddleWidth} paddle={paddle} ref={paddleRef} />

                {/* Div pour les bumpers  */}
                <Box
                    className={"bumper"}
                    style={{ left: 0 }} />
                <Box
                    className={"bumper"}
                    style={{ right: 0 }} />


                {/* Affichage des bonus */}
                {bonuses.map((bonus) => (
                    <Bonus
                        key={bonus.id}
                        type={bonus.type}
                        icon={bonus.icon}
                        position={bonus.position}
                    />
                ))}
                {/* Affichage des missiles */}
                {missiles.map((missile) => (
                    <Missile
                        key={missile.id}
                        x={missile.x}
                        y={missile.y}
                    />
                ))}

                {/* Affichage des billes */}
                {billes.map((bille) => (
                    <Bille
                        key={bille.id}
                        radius={bille.radius}
                        position={bille.position}
                        id={bille.id}
                        type={bille.type}
                        vitesseX={bille.vitesseX}
                        vitesseY={bille.vitesseY}
                    />
                ))}

                <BriqueBuilder schema={brickSchema} briques={briques} setBriques={setBriques} />
            </Box>



        </Box>
    );
};

export default Arkanoid;


const Vies = ({ nb }) => {
    const vies = [];
    for (let n = 0; n < nb; n++) {
        vies.push(<div key={n} className="vie"></div>);
    }
    return <div className="vies-container">{vies}</div>;
};

const NiveauSelect = ({ niveau, setNiveau, balleNeuve }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleButtonClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const handleSelectChange = (event) => {
        setNiveau(event.target.value);
    };

    return (
        <>
            <Button onClick={handleButtonClick} variant="contained" color="primary">
                Choisis le niveau
            </Button>
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
                <FormControl variant="outlined" sx={{ m: 2 }}>
                    <InputLabel htmlFor="number-select">Niveau</InputLabel>
                    <Select
                        id="number-select"
                        value={niveau}
                        onChange={handleSelectChange}
                        label="Niveau"
                    >
                        {Schemas.getNiveaux().map(niv => {
                            return <MenuItem key={niv.id} value={niv.id}>{niv.name}</MenuItem>
                        })}

                    </Select>
                </FormControl>
            </Popover>
        </>
    );
};


const Bonus = ({ type, position, icon }) => {

    const bonusStyle = {
        position: 'absolute',
        textAlign: 'center',
        width: `60px`,
        height: `20px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        borderRadius: '7px', // Bordure arrondie pour créer un cercle
        border: `2px solid ${BRIQUE_TYPE[type].borderColor}`, // Couleur de la bordure en fonction du type du bonus
        backgroundColor: BRIQUE_TYPE[type].color, // Fond transparent pour que seul le bord soit visible
        // ... Autres styles personnalisés si besoin ...
    };

    return <Box style={bonusStyle}>
        {icon}
    </Box>;
};


const Paddle = React.forwardRef(({ paddle, paddleX, paddleWidth }, ref) => {

    const style = { bottom: 10, left: paddleX, width: paddleWidth }
    if (paddle == '')
        style.backgroundColor = '#0095dd';
    if (paddle === 'collante')
        style.backgroundImage = 'url(' + gluImg + ')';
    if (paddle === 'effect')
        style.backgroundImage = 'url(' + gripImg + ')';
    return (
        <div ref={ref}
            className={`paddle ${paddle}`}
            style={style}
        ></div>
    );
});

const Missile = React.forwardRef(({ x, y }, ref) => {
    return (
        <div
            className={`missile`}
            style={{ position: 'absolute', left: x, top: y }}
        ></div>
    );
});