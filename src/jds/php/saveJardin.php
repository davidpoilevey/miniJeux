<?php
// Récupérer les données envoyées depuis l'application
$jardinData = $_POST['jardinData'];



// Vérifier si les données sont présentes
  // Connexion à la base de données MySQL

require 'db.php'; 
$db = connexionDB();


// Décoder le JSON
$plantes = json_decode($jsonPlantes, true);


// Parcourir chaque plante
foreach($plantes as $plante) {

  // Échapper les données pour éviter les injections SQL
  $nom = $db->real_escape_string($plante['nomPlante']);
  $desc = $db->real_escape_string($plante['description']);
  // etc...

  // Requête INSERT ou UPDATE
  if($plante['id'] > 0) {  
    //UPDATE 
    $sql = "UPDATE plante SET nomPlante='$nom', description='$desc' WHERE id={$plante['id']}";
  } else {
    // INSERT  
    $sql = "INSERT INTO plante (nomPlante, description) VALUES ('$nom', '$desc')"; 
  }

  // Exécuter la requête
  $db->query($sql);

}

// Fermer la connexion BD 
$db->close();
?>