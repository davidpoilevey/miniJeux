import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SproutProvider, useSprout } from "./SproutContext";
import SproutField from "./SproutField";
import { SimulationShell, SimAction, SimStat, SimLog, SimSection } from "../SimulationShell";
import { Add, Refresh } from "@mui/icons-material";
import { randomGenome } from "../genetic/ADNPlante";
import { SproutCellule } from "./Organism";

// ── Actions (gauche) ─────────────────────────────────────────────────────────

const SproutActions = () => {
    const { setOrganismes, reset, gridSize, setGridSize, setcoutDeLaVie, coutDeLaVie } = useSprout();
    const [nbSprout, setNbSprout] = useState(1);

    const createOrganisme = (id, adn) => ({
        id,
        cellules: [{ type: 'sprout', position: { top: gridSize * Math.floor(Math.random() * 600 / gridSize), left: gridSize * Math.floor(Math.random() * 600 / gridSize) } }],
        adn,
        nrj: 60,
    });

    const ajouterSprouts = () => {
        reset();
        const sprouts = [];
        for (let q = 0; q < nbSprout; q++)
            sprouts.push(createOrganisme('sprout' + q, randomGenome()));
        setOrganismes(sprouts);
    };

    const conds = [{ label: "Bonnes", value: 1 }, { label: "Difficiles", value: 2 }, { label: "Extremes", value: 3 }];

    return <>
        <SimAction label="Ajouter" icon={Add} onClick={ajouterSprouts} variant="primary" />
        <SimAction label="Reset" icon={Refresh} onClick={reset} />

        <TextField size="small" fullWidth label="Nombre a ajouter" value={nbSprout} select
            onChange={evt => setNbSprout(evt.target.value)}
            sx={{ mt: 0.5, '& .MuiInputBase-root': { fontSize: '0.78rem' } }}>
            {Array.from({ length: 20 }, (_, i) => i).filter(i => i > 0).map(i => (
                <MenuItem key={i} value={i}>{i} bestiole{i > 1 ? 's' : ''}</MenuItem>
            ))}
        </TextField>

        <TextField size="small" fullWidth label="Taille des cellules" value={gridSize} select
            onChange={evt => setGridSize(evt.target.value)}
            sx={{ mt: 0.5, '& .MuiInputBase-root': { fontSize: '0.78rem' } }}>
            {Array.from({ length: 50 }, (_, i) => i).filter(i => i > 0 && i % 5 === 0).map(i => (
                <MenuItem key={i} value={i}>{i} pixels</MenuItem>
            ))}
        </TextField>

        <SimSection label="Conditions de vie" />
        {conds.map(cond => (
            <SimAction key={cond.value} label={cond.label}
                onClick={() => setcoutDeLaVie(cond.value)}
                variant={cond.value === coutDeLaVie ? 'primary' : 'default'}
            />
        ))}
 </>;
};

// ── Stats (droite) ───────────────────────────────────────────────────────────

const SproutStats = () => {
    const { organismes, gridMap, cycle } = useSprout();
    const totalCellules = organismes.reduce((sum, org) => sum + org.cellules.length, 0);
    const orgMatter = gridMap.orgMatter?.length ?? 0;
    const pourri = gridMap.pourri?.length ?? 0;

    return <>
        <SimStat label="Cycle" value={cycle} />
        <SimStat label="Organismes" value={organismes.length} highlight={organismes.length > 0} />
        <SimStat label="Cellules" value={totalCellules} />
        <SimStat label="Matiere org." value={orgMatter} />
        <SimStat label="Pourriture" value={pourri} />
        <SimLog message={organismes.length === 0 ? 'Ajouter des sprouts pour demarrer' : null} />
   
        <SimSection label="Légende" />
        {CELLULE_TYPES.map(({ type, name }) => (
            <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, py: 0.5 }}>
                <Box sx={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
                    <SproutCellule type={type} position={{ top: 0, left: 0 }} size={24} nrj={12}
                        branches={['haut', 'bas', 'gauche', 'droite']} />
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: '#5b5c59', lineHeight: 1.3 }}>{name}</Typography>
            </Box>
        ))}
        <Box sx={{ mt: 1, p: 1.5, background: 'rgba(0,107,31,0.06)', borderRadius: 1.5, borderLeft: '2px solid rgba(0,107,31,0.3)' }}>
            <Typography sx={{ fontSize: '0.68rem', color: '#5b5c59', lineHeight: 1.5 }}>
                Touche <Box component="kbd" sx={{ fontFamily: 'monospace', fontWeight: 700, px: 0.5, py: 0.1, borderRadius: 0.5, background: '#e4e2de', fontSize: '0.72rem' }}>T</Box> pour afficher la matiere organique et la pourriture — avec moderation (performances).
            </Typography>
        </Box>
   
    </>;
};

// ── Panel principal ──────────────────────────────────────────────────────────

const SproutPanelInner = ({ frameWidth }) => {
    const { isRunning, toggleRunning, reset, cycle } = useSprout();

    return (
        <SimulationShell
            title="Sprouts"
            day={cycle}
            isRunning={isRunning}
            onToggle={toggleRunning}
            onReset={reset}
            actions={<SproutActions />}
            stats={<SproutStats />}
        >
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                {frameWidth > 0 && <SproutField />}
            </Box>
        </SimulationShell>
    );
};

export const SproutPanel = () => {
    const [dims, setDims] = useState({ w: 0, h: 0 });
    const containerRef = useRef();

    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const tid = setTimeout(() => {
            const { width, height } = containerRef.current.getBoundingClientRect();
            setDims({ w: width, h: height });
        }, 200);
        return () => clearTimeout(tid);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setDims({ w: width, h: height });
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    return (
        <Box ref={containerRef} sx={{ width: '100%', height: '100%' }}>
            <SproutProvider frameWidth={dims.w} frameHeight={dims.h}>
                <SproutPanelInner frameWidth={dims.w} frameHeight={dims.h} />
            </SproutProvider>
        </Box>
    );
};

export default SproutPanel;

// ── Données légende ──────────────────────────────────────────────────────────

const CELLULE_TYPES = [
    { type: 'sprout', name: 'Tete' },
    { type: 'feuille', name: 'Feuille' },
    { type: 'bois', name: 'Bois' },
    { type: 'racine', name: 'Racine' },
    { type: 'mycelium', name: 'Mycelium' },
    { type: 'graine', name: 'Graine' },
];
