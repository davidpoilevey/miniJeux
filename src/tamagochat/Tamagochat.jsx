import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import CatExpression from "./ui/CatExpression";
import { StatPanel } from "./ui/StatPanel";
import { CatProvider, useCat } from "./backend/CatContext";
import { ActionPanel } from "./ui/ActionPanel";
import { RelationPanel } from "./ui/RelationPanel";
import { OnBoardingProvider } from "../OnBoardingContext";


const TAMAGOCHAT_STEPS = [
  { id: "intro", message: "Voici ton chat ! Il faut veiller à son humeur." },
  { id: "feed", message: "Clique ici pour le nourrir !" },
  { id: "chatlog", message: "Si ton chat est malade, emmène-le chez le vétérinaire." }
];
export default function Tamagochat() {

    return <OnBoardingProvider app="tamagochat" stepsConfig={TAMAGOCHAT_STEPS}>
        <CatProvider>
        <TamagoPanel />
    </CatProvider>
    </OnBoardingProvider>
}
const TamagoPanel = () => {
    const { cat } = useCat();

    return (
        <Box sx={{height:'100%', textAlign: "center" }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
                Tamagochat 🐱
            </Typography>
            <Box sx={{ display: 'flex', height: '100%' }}>
                <CatExpression cat={cat} />
                <StatPanel cat={cat} />
                <Box sx={{ height:'100%', flex: 1, display: 'flex' , gap:1, flexDirection:'column'}}>
                    {/* stats */}

                    <ActionPanel cat={cat} />
                <RelationPanel/>

                </Box>
            </Box>




        </Box>
    );
}

