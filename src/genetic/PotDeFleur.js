import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { AutoAwesome, SkipNext } from '@mui/icons-material';
import { randomGenome, recombinaisonGenetique, mutationADN, TAUX_MUTATION } from './ADNPlante';
import Plante from './Plante';
import { SimulationShell, SimAction, SimStat, SimLog } from '../SimulationShell';

const INTERVAL = 20;

const PotDeFleur = () => {
    const [plantes, setPlantes] = useState([]);
    const [cycleDeVie, setcycleDeVie] = useState(0);
    const [generation, setGeneration] = useState(1);
    const [message, setMessage] = useState('');
    const [scores, setScores] = useState([]);
    const [murs, setMurs] = useState([]);
    const [hiscore, setHiScore] = useState({ score: Number.POSITIVE_INFINITY, adn: [] });
    const [adnPool, setAdnPool] = useState([]);
    const [isRunning, setIsRunning] = useState(true);

    const potRef = useRef();
    const potHeightRef = useRef(1000);
    const isRunningRef = useRef(true);

    const toggleRunning = () => {
        isRunningRef.current = !isRunningRef.current;
        setIsRunning(r => !r);
    };

    const initPlantes = (adnToUse) => {
        let genome = null;
        if (adnToUse != null)
            genome = adnToUse;
        else if (adnPool.length > 0) {
            const adnPoolCopy = [...adnPool];
            genome = adnPoolCopy.pop();
            setAdnPool(adnPoolCopy);
        }
        else genome = randomGenome();
        const potRect = potRef.current.getBoundingClientRect();
        const plante = { id: 'la premiere', adn: genome, plantationRect: potRect };
        setPlantes([plante]);
        setMessage('Nouvelle population');
    };

    const initMurs = () => {
        const potRect = potRef.current.getBoundingClientRect();
        potHeightRef.current = potRect.height;
        const justeUneBarre = [
            { x: potRect.width / 2 - 100, y: potRect.height - 100, width: 40, height: 10 },
            { x: potRect.width / 2 + 10, y: potRect.height - 100, width: 40, height: 10 },
            { x: potRect.width / 4, y: potRect.height / 2 + 100, width: 10, height: 200 },
            { x: potRect.width / 1.5 + 50, y: potRect.height / 2 + 100, width: 10, height: 200 },
            { x: potRect.width / 2 - 50, y: potRect.height / 2, width: 100, height: 10 },
            { x: potRect.width / 2 - 50, y: potRect.height / 4, width: 200, height: 10 },
        ];
        setMurs(justeUneBarre);
    };

    useEffect(() => {
        initMurs();
        const intervalId = setInterval(() => {
            if (isRunningRef.current)
                setcycleDeVie(cycle => cycle + 1);
        }, INTERVAL);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (cycleDeVie === 0)
            initPlantes();
    }, [cycleDeVie]);

    const nextPlante = (score, adn) => {
        if (score < hiscore.score)
            setHiScore({ score: score, adn: [...adn] });
        setScores(old => [...old, { score: score, adn: adn }]);
        setcycleDeVie(0);
    };

    useEffect(() => {
        if (scores.length >= 100) nextGen();
    }, [scores]);

    const replayHiscore = () => {
        initPlantes(hiscore.adn);
    };

    const nextGen = () => {
        if (scores.length < 10) {
            setMessage('Echantillonnage trop petit, minimum 10');
            return;
        }
        setMessage('Nouvelle generation');
        setGeneration(gen => gen + 1);
        let newPool = [];
        const elite = [...scores].sort((sc1, sc2) => sc1.score - sc2.score).slice(0, 5);
        elite.forEach(ind => newPool.push(ind.adn));
        for (let i = 0; i < elite.length; i++) {
            for (let j = i + 1; j < elite.length; j++) {
                const childs = recombinaisonGenetique(elite[i].adn, elite[j].adn);
                childs.forEach(child => newPool.push(mutationADN(child, TAUX_MUTATION)));
            }
        }
        setAdnPool(newPool.reverse());
        setScores([]);
    };

    const hiScoreDisplay = Number.isFinite(hiscore.score)
        ? potHeightRef.current - hiscore.score
        : '-';

    return (
        <SimulationShell
            title="Pot de Fleur"
            dayLabel="Cycle"
            day={cycleDeVie}
            isRunning={isRunning}
            onToggle={toggleRunning}
            actions={<>
                <SimAction
                    label="Rejoue le champion"
                    icon={AutoAwesome}
                    onClick={replayHiscore}
                    disabled={!Number.isFinite(hiscore.score)}
                />
                <SimAction
                    label="Next generation"
                    icon={SkipNext}
                    onClick={nextGen}
                    disabled={scores.length < 10}
                />
            </>}
            stats={<>
                <SimStat label="Generation" value={generation} />
                <SimStat label="Plantes traitees" value={scores.length} />
                <SimStat label="ADN pool" value={adnPool.length} />
                <SimStat label="Hi-score" value={hiScoreDisplay} highlight={Number.isFinite(hiscore.score)} />
                <SimLog message={message} />
            </>}
        >
            {/* Zone de simulation — remplit le centre du shell */}
            <Box ref={potRef} sx={{
                position: 'absolute', inset: '16px',
                backgroundColor: '#d4cfc8',
                border: '1px solid #a09890',
                borderBottom: '3px dashed #6b5e55',
                borderRadius: 1,
                overflow: 'hidden',
            }}>
                {Number.isFinite(hiscore.score) && (
                    <Box sx={{ position: 'absolute', top: hiscore.score, left: 0, width: '100%', height: 0, border: '1px dashed red' }} />
                )}
                {plantes.map((plante, idx) => (
                    <Plante key={idx} {...plante} cycleDeVie={cycleDeVie} nextPlante={nextPlante} murs={murs} />
                ))}
                {murs.map((mur, idx) => (
                    <Mur key={'mur' + idx} {...mur} />
                ))}
            </Box>
        </SimulationShell>
    );
};

export default PotDeFleur;

const Mur = ({ x, y, width, height }) => (
    <Box sx={{ position: 'absolute', top: y, left: x, width: width, height: height, backgroundColor: '#4a3f38' }} />
);
