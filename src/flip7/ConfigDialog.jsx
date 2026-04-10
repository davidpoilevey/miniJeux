import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Slider,
    Typography,
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Avatar,
    Divider,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";

import avatarDefault from '../bitLife/images/F/adulte/avatar0.png';
import avatar1 from '../bitLife/images/F/adulte/avatar1.png';
import avatar2 from '../bitLife/images/F/adulte/avatar2.png';
import avatar3 from '../bitLife/images/F/adulte/avatar3.png';
import avatar4 from '../bitLife/images/F/adulte/avatar4.png';
import avatar5 from '../bitLife/images/F/adulte/avatar5.png';
import avatar6 from '../bitLife/images/M/adulte/avatar6.png';
import avatar7 from '../bitLife/images/M/adulte/avatar7.png';
import avatar8 from '../bitLife/images/M/adulte/avatar8.png';
import avatar9 from '../bitLife/images/M/adulte/avatar9.png';
import avatar10 from '../bitLife/images/M/adulte/avatar10.png';

const avatarOptions = [
    { label: "Severine", value: "avatar1", img: avatar1 },
    { label: "Prune", value: "avatar2", img: avatar2 },
    { label: "Emilie", value: "avatar3", img: avatar3 },
    { label: "Cerise", value: "avatar4", img: avatar4 },
    { label: "Celine", value: "avatar5", img: avatar5 },
    { label: "Billy", value: "avatar6", img: avatar6 },
    { label: "Michel", value: "avatar7", img: avatar7 },
    { label: "Rodolphe", value: "avatar8", img: avatar8 },
    { label: "Clint", value: "avatar9", img: avatar9 },
    { label: "Pedro", value: "avatar10", img: avatar10 },
];
const MAX_NBJOUEUR = 12;
const ConfigDialog = ({
    open,
    onClose,
    joueurs,
    onUpdateJoueurs
}) => {
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayerSeuil, setNewPlayerSeuil] = useState(0.5);
    const [tempJoueurs, setTempJoueurs] = useState([...joueurs]);
    const [newPlayerAvatar, setNewPlayerAvatar] = useState(avatarDefault);


    // Niveaux de folie prédéfinis pour affichage
    const seuilLabels = {
        0: "Très prudent",
        0.2: "Prudent",
        0.4: "Modéré",
        0.6: "Aventureux",
        0.8: "Téméraire",
        1: "Kamikaze"
    };

    const getSeuilLabel = (seuil) => {
        const closest = Object.keys(seuilLabels)
            .map(Number)
            .reduce((prev, curr) =>
                Math.abs(curr - seuil) < Math.abs(prev - seuil) ? curr : prev
            );
        return seuilLabels[closest];
    };

    const handleAddPlayer = () => {
        if (newPlayerName.trim() && tempJoueurs.length < MAX_NBJOUEUR) {
            const newPlayer = {
                name: newPlayerName.trim(),
                isHuman: false,
                seuil: newPlayerSeuil,
                avatar: newPlayerAvatar,
                cartes: [],
                score: 0,
                mort: false
            };
            setTempJoueurs([...tempJoueurs, newPlayer]);
            setNewPlayerName("");
            setNewPlayerSeuil(0.5);
        }
    };

    const handleRemovePlayer = (index) => {
        const playerToRemove = tempJoueurs[index];
        if (!playerToRemove.isHuman) { // Ne pas supprimer le joueur humain
            setTempJoueurs(tempJoueurs.filter((_, i) => i !== index));
        }
    };

    const handleSave = () => {
        onUpdateJoueurs(tempJoueurs);
        onClose();
    };

    const handleCancel = () => {
        setTempJoueurs([...joueurs]); // Reset
        setNewPlayerName("");
        setNewPlayerSeuil(0.5);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SettingsIcon />
                Configuration des joueurs
            </DialogTitle>

            <DialogContent>
                {/* Liste des joueurs actuels */}
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Joueurs actuels ({tempJoueurs.length}/{MAX_NBJOUEUR})
                </Typography>

                <List sx={{ mb: 3 }}>
                    {tempJoueurs.map((joueur, index) => (
                        <ListItem key={index} divider>
                            <ListItemAvatar>
                                <Avatar src={joueur.avatar} alt={joueur.name} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {joueur.name}
                                        </Typography>
                                        {joueur.isHuman && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    bgcolor: "#2e7d32",
                                                    color: "white",
                                                    px: 1,
                                                    borderRadius: 1
                                                }}
                                            >
                                                VOUS
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                secondary={
                                    joueur.isHuman
                                        ? "Joueur humain"
                                        : `Niveau: ${getSeuilLabel(joueur.seuil)} (${Math.round(joueur.seuil * 100)}%)`
                                }
                            />
                            <ListItemSecondaryAction>
                                {!joueur.isHuman && (
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleRemovePlayer(index)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: 3 }} />

                {/* Formulaire d'ajout */}
                <Paper elevation={1} sx={{ p: 3, bgcolor: "#f8fafc" }}>
                    <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <AddIcon />
                        Ajouter un joueur
                    </Typography>
                    <Box sx={{display:'flex'}}>

                    <FormControl fullWidth sx={{ mb: 2, flex:1 }}>
                        <InputLabel id="avatar-select-label">Avatar</InputLabel>
                        <Select
                            labelId="avatar-select-label"
                            value={newPlayerAvatar}
                            label="Avatar"
                            onChange={e => {
                                const avatar = avatarOptions.find(a => a.img === e.target.value);
                                setNewPlayerAvatar(e.target.value);
                                setNewPlayerName(avatar.label);
                            }}
                            renderValue={(selected) => {
                                const avatar = avatarOptions.find(a => a.img === selected);
                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar src={avatar?.img || selected} />
                                        {avatar?.label || 'John Doe'}
                                    </Box>
                                );
                            }}
                        >
                            {avatarOptions.map(option => (
                                <MenuItem key={option.value} value={option.img}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar src={option.img} sx={{ width: 32, height: 32 }} />
                                        {option.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField 
                        fullWidth
                        label="Nom du joueur"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        sx={{ mb: 3 ,flex:3}}
                        placeholder="Entrez le nom..."
                    />

</Box>
                    <Typography gutterBottom>
                        Niveau de folie: {getSeuilLabel(newPlayerSeuil)} ({Math.round(newPlayerSeuil * 100)}%)
                    </Typography>
                    <Slider
                        value={newPlayerSeuil}
                        onChange={(_, value) => setNewPlayerSeuil(value)}
                        min={0}
                        max={1}
                        step={0.1}
                        marks={[
                            { value: 0, label: "Prudent" },
                            { value: 0.5, label: "Équilibré" },
                            { value: 1, label: "Kamikaze" }
                        ]}
                        sx={{ mb: 2 }}
                    />

                    <Button
                        variant="contained"
                        onClick={handleAddPlayer}
                        disabled={!newPlayerName.trim() || tempJoueurs.length >= MAX_NBJOUEUR}
                        startIcon={<AddIcon />}
                        fullWidth
                    >
                        Ajouter le joueur
                    </Button>
                </Paper>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCancel} color="secondary">
                    Annuler
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={tempJoueurs.length < 2}
                >
                    Sauvegarder
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigDialog;
