import React, { useEffect, useState } from 'react';
import PlanteDialog from './PlanteDialog';
import PlantListItem, { PositionnedPlantListItem } from './PlantListItem';
import MoreAction from './MoreAction';
import useShowAlert from './Message';
import ListDialog from './ListDialog';

const Jardin = () => {
  const [plantes, setPlantes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isListeOpen, setListeOpen] = useState(false);
  const { showAlert, SnackbarComponent } = useShowAlert();
  const [waitingPlante, setWaitingPlante] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: null, y: null });
  const [selectedPlante, setSelectedPlante] = useState(null);

  useEffect(() => {
    const plantesJSON = localStorage.getItem('plantes');
    const availPlts = localStorage.getItem('listePlante');

    if (plantesJSON) {
      try {
        const savedPlantes = JSON.parse(plantesJSON);
        setPlantes(savedPlantes);
      } catch (error) {
        showAlert("Une erreur s'est produite lors du chargement des plantes :" + error.message, 'error');
      }
    }

    if (availPlts) {
      try {
        const savedPlantes = JSON.parse(availPlts);
        setWaitingPlante(savedPlantes);
      } catch (error) {
        showAlert("Une erreur s'est produite lors du chargement de la liste :" + error.message, 'error');
      }
    }
  }, []);

  const onListSubmit = (list) => {
    list.sort();
    setWaitingPlante(list);
    saveList(list);
  };

  const openListe = () => {
    setListeOpen(true);
  };

  const handleDialogOpen = (position) => {
    setIsDialogOpen(true);
    setCurrentPosition(position);
  };

  const handlePlanteClick = (plante) => {
    setSelectedPlante(plante);
  };

  const handleDialogClose = () => {
    setSelectedPlante(null);
    setIsDialogOpen(false);
  };

  const handleJardinClick = (event) => {
    if (isDragging) return;
    setSelectedPlante(null);
    const { clientX, clientY } = event;
    const jardinRect = event.target.getBoundingClientRect();
    const positionX = clientX - jardinRect.left;
    const positionY = clientY - jardinRect.top;
    const position = { x: positionX, y: positionY };
    handleDialogOpen(position);
  };

  const handlePlanteAdd = (plante) => {
    const planteWithPosition = { ...plante, position: currentPosition };
    setPlantes([...plantes, planteWithPosition]);
  };

  const handlePlanteEdit = (plante) => {
    setPlantes((oldPlantes) => {
      const newPlantes = oldPlantes.filter((p) => p.nom !== plante.nom);
      newPlantes.push(plante);
      return newPlantes;
    });
  };

  const onDeletePlante = () => {
    setPlantes(plantes.filter((p) => p.nom !== selectedPlante.nom));
  };
  const handleSavePlanteInDB = () => {
    // Convertir les plantes en chaîne JSON
    const plantesJSON = JSON.stringify(plantes);
  
    // Créer un objet FormData pour envoyer les données au fichier PHP
    const formData = new FormData();
    formData.append('plantes', plantesJSON);
  
    // Envoyer la requête POST au fichier PHP
    fetch('php/saveJardin.php', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          showAlert('Jardin sauvegardé avec succès !', 'success');
        } else {
          showAlert("Une erreur s'est produite lors de la sauvegarde du jardin.", 'error');
        }
      })
      .catch(error => {
        showAlert("Une erreur s'est produite lors de la sauvegarde du jardin : " + error.message, 'error');
      });
  };
  
  const handleSavePlantes = () => {
    handleSavePlanteInDB();
    try {
      const plantesJSON = JSON.stringify(plantes);
      localStorage.setItem('plantes', plantesJSON);
      showAlert('Plantes sauvegardées avec succès !', 'success');
    } catch (error) {
      showAlert("Une erreur s'est produite lors de la sauvegarde des plantes :" + error.message, 'error');
    }
  };

  const saveList = (list) => {
    try {
      const availPl = JSON.stringify(list);
      localStorage.setItem('listePlante', availPl);
      showAlert('Liste de plantes sauvegardée avec succès !', 'success');
    } catch (error) {
      showAlert("Une erreur s'est produite lors de la sauvegarde de la liste de plantes :" + error.message, 'error');
    }
  };

  const handleExportPlantes = () => {
    try {
      const plantesJSON = JSON.stringify(plantes);
      const blob = new Blob([plantesJSON], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantes.json';
      link.click();
      URL.revokeObjectURL(url);
      showAlert('Export des plantes effectué avec succès !', 'success');
    } catch (error) {
      showAlert("Une erreur s'est produite lors de l'export des plantes :" + error.message, 'error');
    }
  };

  const handleImportPlantes = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const importedData = JSON.parse(content);
        setPlantes(importedData);
        showAlert('Plantes importées avec succès !', 'success');
      } catch (error) {
        showAlert("Une erreur s'est produite lors de l'importation des plantes :" + error.message, 'error');
      }
    };
    reader.readAsText(file);
  };
  return (
    <div>
      {/* Conteneur du jardin */}
      <div
        style={{
          width: '1000px',
          height: '1000px',
          backgroundColor: isDragging ? '#FF99AA' : '#FFCCDD',
          margin: '20px',
          cursor: 'pointer',
        }}
        onClick={handleJardinClick}
      >
        {/* Rendu des plantes dans le jardin */}
        {plantes.map((plante, index) => (
          <PositionnedPlantListItem
            key={index}
            plante={plante}
            handlePlanteEdit={handlePlanteEdit}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            onClick={(evt) => { evt.stopPropagation(); handlePlanteClick(plante) }}
          />
        ))}
      </div>
  
      {/* Boîte de dialogue d'ajout/modification de plante */}
      <PlanteDialog
        open={isDialogOpen || selectedPlante !== null}
        plante={selectedPlante}
        onClose={handleDialogClose}
        onAdd={handlePlanteAdd}
        onEdit={handlePlanteEdit}
        onDel={onDeletePlante}
        waitingPlantes={waitingPlante}
      />
  
      {/* Boîte de dialogue de la liste des plantes */}
      <ListDialog
        open={isListeOpen}
        currentList={waitingPlante}
        onClose={evt => { setListeOpen(false); }}
        onListSubmit={onListSubmit}
      />
  
      {/* Menu des actions supplémentaires */}
      <MoreAction
        handleSavePlantes={handleSavePlantes}
        handleExportPlantes={handleExportPlantes}
        openListe={openListe}
      />
  
      {/* Input pour l'importation de fichiers */}
      <input
        accept="application/json"
        id="import-file"
        type="file"
        style={{ display: 'none' }}
        onChange={handleImportPlantes}
      />
  
      {/* Composant d'alerte */}
      {SnackbarComponent}
    </div>
  );
  
};

export default Jardin;
