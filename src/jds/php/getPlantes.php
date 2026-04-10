<?php

// Connexion à la base de données 
require 'db.php'; 
$db = connexionDB();


// Requête SQL
$sql = "SELECT * FROM plante";

// Exécuter la requête
$resultat = $db->query($sql);

// Vérifier si on a des résultats
if($resultat->num_rows > 0){

  // Sortir les résultats sous forme de tableau associatif
  $plantes = $resultat->fetch_all(MYSQLI_ASSOC);
  
  // Encoder en JSON
  echo json_encode($plantes);

} else {
  echo "Aucune plante trouvée"; 
}

// Fermer la connexion
$db->close();

?>