// Imports
const express = require('express');
const mysql = require('mysql');

// Connexion DB
const db = mysql.createConnection({
  host: '127.0.0.1', 
  port:3306,
  user: 'ggjkuswr_severine',
  password: 'V1v13lDAdy0p3',
  database: 'ggjkuswr_jardinMagique'
});

// Initialisation Express
const app = express();

// Route pour récupérer les plantes
app.get('/plantes', (req, res) => {

  // Requête SQL 
  db.query('SELECT * FROM plante', (err, results) => {
    if (err) {
      return res.send(err); 
    }

    // Renvoyer les résultats en JSON
    res.json(results);

  });

});

app.get('/test', (req, res) => {

    res.end('Hello jardin!');
  
  });
  
// Lancer le serveur
app.listen(80, () => {
  console.log('Serveur ecoute sur le port 80?');
});