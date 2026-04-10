import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";

export const AutomateMenu = ({ regle, onSelectRule, binaire }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelectRule = (rule) => {
        onSelectRule(rule.value);
        handleClose();
    };
    
    const automateOptions = [
        {
            name: "Règle non binaire",
            binaire:false,
            description: "Une cellule monte en grade si elle a 2 ou 3 voisins a plus de 2,elle meurt si elle a plus de 2 voisins a plus de 3 ou plus de 4 voisins et baisse de grade si elle n'a aucun voisin au-dessus de son niveau",
            value: 'nonBinaire1',
        },{
            name: "Règle Predator-proie",
            binaire:false,
            description: `Si une cellule est dans l'état 1 (proie) et a au moins 2 voisins de l'état 2 (prédateur), elle devient de l'état 2.
            Si une cellule est dans l'état 2, elle devient de l'état 3 (mort de faim).
            Si une cellule est dans l'état 3, elle devient de l'état 0 (espace vide).
            Si une cellule est dans l'état 0 et a exactement 3 voisins de l'état 1, elle devient de l'état 1.`,
            value: 'predator',
        },

        {
            name: "Règle incendie",
            binaire:false,
            description: `
            Si une cellule est dans l'état 1, elle devient de l'état 2 (feu).
            Si une cellule est dans l'état 2, elle devient de l'état 3 (cendres).
            Si une cellule est dans l'état 3 et a au moins 1 voisin de l'état 2, elle devient de l'état 2.`,
                value: 'incendie',
        },
        {
            name: "Règle Majestic",
            binaire:false,
            description: `
            Si une cellule a exactement 2 voisins de l'état 1, elle devient de l'état 3.
            Si une cellule a exactement 1 voisin de l'état 2, elle devient de l'état 1.
            Sinon, elle reste dans son état actuel.`,
                value: 'majestic',
        },
        {
            name: "Règle chemical reaction",
            binaire:false,
            description: `Si une cellule a exactement 2 voisins de l'état 1, elle devient de l'état 2.
            Si une cellule est dans l'état 2 et a au moins 1 voisin de l'état 3, elle devient de l'état 3.
            Si une cellule est dans l'état 3, elle devient de l'état 0.`,
                  value: 'chemical',
        },
        {
            name: "Règle du Jeu de la vie selon Conway",
            binaire:true,
            description: "Une cellule meurt si elle a moins de 2 ou plus de 3 voisins ,elle devient vivante si elle a 3 voisins",
            value: 'conway',
        },
        {
            name: "Règle du Diamant",
            binaire:true,
            description: "Si une cellule a exactement 2 voisines vivantes, elle devient vivante.\nSinon, elle devient morte.",
            value: 'diamant',
        },
        {
            name: "Règle du Chaos",
            binaire:true,
            description: "Si une cellule a un nombre impair de voisines vivantes, elle devient vivante.\nSinon, elle devient morte.",
            value: 'chaos',
        },
        {
            name: "Règle de la Spirale",
            binaire:true,
            description: "Si une cellule a exactement 3 voisines vivantes, elle devient vivante.\nSinon, elle devient morte.",
            value: 'spirale',
        },
        {
            name: "Règle du Serpent",
            binaire:true,
            description: "Si une cellule a exactement 1 voisine vivante, elle devient vivante.\nSinon, elle devient morte.",
            value: 'serpent',
        },
        {
            name: "Règle de la Croix",
            binaire:true,
            description: "Si une cellule a exactement 2 voisines vivantes, elle devient vivante.\nSi elle a exactement 3 voisines vivantes, elle devient vivante.\nSinon, elle devient morte.",
            value: 'croix',
        },
        {
            name: "Règle du foyer",
            binaire:true,
            description: "Si une cellule a 3 voisines vivantes, elle devient vivante.\n Sinon, elle devient morte.",
            value: 'foyer',
        },
        {
            name: "Règle du parcours",
            binaire:true,
            description: "Si une cellule a exactement 1 ou 3 voisines vivantes, elle devient vivante.\n  Sinon, elle devient morte..",
            value: 'parcours',
        },
        {
            name: "Règle de la migration",
            binaire:true,
            description: "Si une cellule a exactement 2 ou 3 voisines vivantes, elle devient vivante.\nSinon, elle devient morte.",
            value: 'migration',
        },
        {
            name: "Règle de l'isolation",
            binaire:true,
            description: "Si une cellule a moins de 2 ou plus de 5 voisines vivantes, elle devient morte.\n Sinon, elle devient vivante.",
            value: 'isolation',
        },
        {
            name: "Règle du ventilateur",
            binaire:true,
            description: "Si une cellule a exactement 2 voisines vivantes, elle devient vivante.\n  Sinon, elle devient morte, sauf si elle a exactement 1 voisine vivante, auquel cas elle devient également vivante.",
            value: 'ventilateur',
        },
        {
            name: "Règle de la Vie Sans La Mort",
            binaire:true,
            description: "Si une cellule a exactement 3 voisines vivantes, elle devient vivante.\n  Sinon, elle reste dans son état actuel.",
            value: 'lifeDeath',
        },
        {
            name: "Règle du Labyrinthe",
            binaire:true,
            description: "Si une cellule a exactement 1 voisine vivante ou 5 voisines vivantes, elle devient vivante.\n  Sinon, elle devient morte.",
            value: 'maze',
        },
        {
            name: "Règle du Nuit Et Jour",
            binaire:true,
            description: "Si une cellule a 3, 4, 6, ou 7 voisines vivantes, elle devient vivante.\n  Sinon, elle devient morte.",
            value: 'nightAndDay',
        },
        {
            name: "Règle du Coral",
            binaire:true,
            description: "Si une cellule a exactement 3 ou 4 voisines vivantes, elle devient vivante.\n Sinon, elle reste dans son état actuel.",
            value: 'coral',
        },
        {
            name: "Règle Gnarl",
            binaire:true,
            description: "Si une cellule a exactement 1 voisine vivante, elle devient vivante.\nSinon, elle devient morte.",
            value: 'gnarl',
        },
    ];



    return (
        <>
            <Button onClick={handleClick} variant="outlined">
                <b>{automateOptions.find(op => op.value === regle).name}</b>
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {automateOptions.map((option) => {
                    if((binaire&&option.binaire) || (!binaire&&!option.binaire) )
                    return <MenuItem
                        key={option.name}
                        onClick={() => handleSelectRule(option)}
                    >
                        <Box><Typography variant="subtitle1">{option.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {option.description}
                            </Typography>
                        </Box>
                    </MenuItem>
})}
            </Menu>

        </>
    );
};
