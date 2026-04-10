import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Bonus, BONUS_TYPES, NODESIZE, SnakeNode, WallBox } from "./SnakeNode";
import { GameOver } from "../../ChuckNorrisFact";


const GRIDWIDTH = 600;
const GRIDHEIGHT = 600;
const MUR_SIZE = 10;
const FPS = 50; // Ajustez selon vos besoins



const Snake = () => {

    const [isGameOver, gameOver] = useState(false);
    const [gameOverReason, setgameOverReason] = useState();
    const [score, setScore] = useState(0);
    const [vitesse, setVitesse] = useState((NODESIZE / FPS) * 5);
    const intervalRef = useRef(null);
    const [snake, setSnake] = useState([]);
    const [freeNode, setFreeNode] = useState();
    const [walls, setWalls] = useState([]);
    const [bonus, setBonus] = useState([]);
    const [direction, setDirection] = useState({ x: 1, y: 0 });
    const init = () => {
        const snakeDeDepart = [{ x: GRIDWIDTH / 2, y: GRIDHEIGHT / 2 }];
        for (let s = 1; s < 4; s++) {
            const prec = snakeDeDepart[s - 1];
            snakeDeDepart.push({ next: prec, x: prec.x - NODESIZE, y: prec.y - NODESIZE })
        }
        setSnake(snakeDeDepart);
        setBonus([]);
        setVitesse((NODESIZE / FPS) * 5);
        setWalls(generateRandomWalls(2));
    }
    useEffect(() => {
        // initialisation
        init();
    }, []);
    const setGameOver = (reason)=>{
        setgameOverReason(reason);
        // allume explosion at head.. 
        // timeout and game over
        gameOver(true);
    }
    const reset = () => {
        init();
        setScore(0);
        setgameOverReason(null);
        gameOver(false);
    }

    const generateFreeNode = (additional={}) => {
        const randomPoint=()=>{
            const p=Math.max(20, Math.min(GRIDWIDTH-20, Math.random() * GRIDWIDTH));
            return p;
        }
        let nfn = { x: randomPoint() , y: randomPoint() };
        let limiter = 0;
        for (const wall of walls) {
            while (isColliding(nfn, wall)) {
                nfn = { x:randomPoint(), y: randomPoint() };
                limiter++;
                if (limiter > 1000)
                    setGameOver(true);
            }
        }
        return {...additional, ...nfn};


    }

    useEffect(() => {
        setFreeNode(generateFreeNode());
    }, [walls]);

    useEffect(() => {
        if (isGameOver)
            return clearInterval(intervalRef.current);
        const handleMove = () => {
            const currHead = snake[0];
            // Vérifier la collision avec le freeNode
            if (currHead.x + NODESIZE >= freeNode.x && currHead.x < freeNode.x + NODESIZE
                && currHead.y + NODESIZE >= freeNode.y && currHead.y < freeNode.y + NODESIZE
            ) {
                snake[0].next = freeNode;
                // Mettre à jour le serpent
                setSnake([freeNode, ...snake]);
                // Générer un nouveau nœud comestible
                setFreeNode(generateFreeNode());
                // generer un bonus
                const bonustype = BONUS_TYPES[Math.floor(Math.random()*BONUS_TYPES.length)];
                const newBonus = generateFreeNode({type:bonustype});
                setBonus(old=>{
                    return [newBonus, ...old]
                });
                setScore(snake.length*10);
                return;
            }
            // collision avec Bonus
            for(const b of bonus){
              
            if (currHead.x + NODESIZE >= b.x && currHead.x < b.x + NODESIZE
                && currHead.y + NODESIZE >= b.y && currHead.y < b.y + NODESIZE
            ) {
               //remove bonus
               setBonus(old=>{
                const newb=[...old];
                newb.splice(newb.indexOf(b),1);
                return newb;
            });
                if(b.type==='vitesse'){
                    setVitesse(v=>(v+0.1));
                }
                if(b.type==='ralentis'){
                    setVitesse(v=>(v-0.1));
                }
                if(b.type==='plus2'){
                   const {type, ...magicNode} = currHead;
                   const magicNode2 = {...currHead, next:magicNode};
                   snake[0].next = magicNode2;
                    // Mettre à jour le serpent
                    setSnake([magicNode, magicNode2, ...snake]);
                    return;
                }
                if(b.type==='remove'){
                    const ns = [...snake];
                    ns.pop();
                    setSnake(ns);
                    return;
                }
            }  
        }
            const newHead = {
                x: snake[0].x + direction.x * vitesse,
                y: snake[0].y + direction.y * vitesse
            };
            // collision avec le bord
            if (isOutOfBounds(newHead))
                return setGameOver(true);
            // avec les murs
            for (const wall of walls) {
                if (isColliding(newHead, wall)) {
                    setGameOver(true);
                    break;
                }
            }
            // avec lui-meme a partir du 3eme node
            for (let i = 1; i < snake.length; i++) {
                if (snake[0].x + NODESIZE / 2 >= snake[i].x && snake[0].x < snake[i].x + NODESIZE / 2
                    && snake[0].y + NODESIZE / 2 >= snake[i].y && snake[0].y < snake[i].y + NODESIZE / 2
                    && i>3
                ) {
                    setGameOver(true);
                    return;
                }
            }
            setSnake(oldSnake => {
                const movedSnake = oldSnake.map((node, index, osa) => {
                    if (index === 0) return newHead; // La tête ne bouge pas (déjà mise à jour)

                    // Calculer le vecteur directeur vers le prochain nœud
                    const nextNode = node.next;
                    const directionVector = {
                        x: nextNode.x - node.x,
                        y: nextNode.y - node.y
                    };
                    // Normaliser le vecteur (si nécessaire)
                    const normalizedDirection = normalizeVector(directionVector);

                    const distance = Math.sqrt((nextNode.x - node.x) ** 2 + (nextNode.y - node.y) ** 2);

                    // Si la distance est inférieure à NODESIZE, ralentir
                    if (distance < NODESIZE) {
                        // const stretchFactor = NODESIZE / distance;
                        normalizedDirection.x = 0
                        normalizedDirection.y = 0
                    }
                    // Calculer la nouvelle position du nœud
                    return {
                        next: osa[index - 1],
                        x: node.x + normalizedDirection.x * vitesse,
                        y: node.y + normalizedDirection.y * vitesse
                    };
                });
                return movedSnake
            });
        };

        intervalRef.current = setInterval(handleMove, 1000 / FPS);

        return () => clearInterval(intervalRef.current);
    }, [direction, snake, isGameOver]);
    const handleMouseDown = (event) => {
        
            const boxPos = event.target.getBoundingClientRect();
        const newDirection = {
            x: event.clientX -boxPos.x- snake[0].x,
            y: event.clientY -boxPos.y - snake[0].y
        };

        // Normaliser le vecteur
        const normalizedDirection = normalizeVector(newDirection);

        // Mettre à jour la direction du serpent
        setDirection(normalizedDirection);
    };
    return <Box sx={{ border: '2px solid green', position: 'relative', width: GRIDWIDTH, height: GRIDHEIGHT }}
        onClick={handleMouseDown}>
        <GameOver open={isGameOver} score={score} reason={gameOverReason} 
        gameName="Snake"
            handleClose={reset } handleRestart={reset} />

        {snake.map((snode, sidx) => {
            return <SnakeNode key={'n' + sidx} node={snode} />
        })}
        <SnakeNode node={freeNode} />
        {bonus.map((b, idx) => <Bonus key={'b' + idx} type={b.type} x={b.x} y={b.y}/>)}
        {walls.map((wall, idx) => <WallBox key={'w' + idx} wall={wall} />)}
    </Box>
}
export default Snake;

function normalizeVector(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) return vector;
    return { x: vector.x / length, y: vector.y / length };
}
function isOutOfBounds({ x, y }) {
    return x < 0 || x > GRIDWIDTH || y < 0 || y > GRIDHEIGHT;
}
function isColliding(node, wall) {

    return ((node.x >= wall.x && node.x <= wall.x + wall.width)
        || (node.x + NODESIZE >= wall.x && node.x + NODESIZE <= wall.x + wall.width))
        && ((node.y >= wall.y && node.y <= wall.y + wall.height)
            || (node.y + NODESIZE >= wall.y && node.y + NODESIZE <= wall.y + wall.height));
}


function generateRandomWalls() {
    const walls = [];
    const configs=[
        [{x:100, y:50, height:GRIDHEIGHT/2, width:MUR_SIZE}
            ,{x:100, y:3*GRIDHEIGHT/4, width:GRIDWIDTH/2+50, height:MUR_SIZE}
            ,{x:100, y:GRIDHEIGHT/4, width:GRIDWIDTH/2-50, height:MUR_SIZE}
            ,{x:GRIDWIDTH-100, y:100,  height:GRIDHEIGHT/2-50, width:MUR_SIZE}
        ]
        ,
        [{x:GRIDWIDTH/2, y:0, height:GRIDHEIGHT/4, width:MUR_SIZE}
            ,{x:3*GRIDWIDTH/4, y:GRIDHEIGHT/2, width:GRIDWIDTH/4, height:MUR_SIZE}
            ,{x:0, y:GRIDHEIGHT/2, width:GRIDWIDTH/3, height:MUR_SIZE}
            ,{x:GRIDWIDTH/2, y:2*GRIDHEIGHT/3,  height:GRIDHEIGHT/3, width:MUR_SIZE}
        ] 
        ,
        [{x:50, y:50, height:150, width:MUR_SIZE}
            ,{x:50, y:200, width:150, height:MUR_SIZE}
            ,{x:200, y:200, height:150, width:MUR_SIZE}
            ,{x:200, y:350, width:150, height:MUR_SIZE}
            ,{x:350, y:350, height:150, width:MUR_SIZE}
            ,{x:350, y:500, width:150, height:MUR_SIZE}
        ] ,
        [{x:GRIDWIDTH/4, y:0, height:GRIDHEIGHT/2-50, width:MUR_SIZE}
            ,{x:GRIDWIDTH/2, y:0, height:GRIDHEIGHT/2-150, width:MUR_SIZE}
            ,{x:GRIDWIDTH-100, y:0, height:GRIDHEIGHT/2-50, width:MUR_SIZE}
            ,{x:80, y:GRIDHEIGHT/2+50, height:GRIDHEIGHT/2-50, width:MUR_SIZE}
            ,{x:100+GRIDWIDTH/4, y:GRIDHEIGHT/2, height:GRIDHEIGHT/2, width:MUR_SIZE}
            ,{x:100+GRIDWIDTH/2, y:GRIDHEIGHT/2+100, height:GRIDHEIGHT/2-100, width:MUR_SIZE}
            
        ]
    ]

    const niv = Math.floor(Math.random()*configs.length);
    if(configs[niv]==null)
        throw new Error("Ben quest-ce que tu fous")
    for(let c=0;c<configs[niv].length;c++){
        walls.push(configs[niv][c]);
    }
    return walls;
}