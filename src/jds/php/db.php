<?php

function connexionDB() {

  // planetHoster
  //  $db = new mysqli('127.0.0.1','ggjkuswr_severine','V1v13lDAdy0p3','ggjkuswr_jardinMagique');

    // localhost
    $db = new mysqli('localhost','root','root','ggjkuswr_jardinMagique');
  
    if($db->connect_error){
      die("Erreur : " . $db->connect_error);
    }  
  
    // Vérifier la connexion
    if($db->connect_error){
        die("Erreur : " . $db->connect_error);
    }
    return $db;
  
  }

?>