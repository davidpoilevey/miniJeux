import { Link } from '@mui/icons-material';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

const OpenLibrary = ()=> {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  /**
   * search par auteur:https://openlibrary.org/search/authors.json?q=j%20k%20rowling
   * par nom: https://openlibrary.org/search.json?q=the+lord+of+the+rings
   * args: sort=new
   * https://openlibrary.org /books/OL12601776M (=seed[0])
   */
  const searchAuteur = ()=>{

    const url = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(searchInput)}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.numFound > 0) {
          setSearchResults(data.docs);
        } else {
          setSearchResults([]);
        }
      })
      .catch((error) => console.log(error));
  }
  const searchBooks = () => {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchInput)}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.numFound > 0) {
          setSearchResults(data.docs);
        } else {
          setSearchResults([]);
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px',height:'100%' }}>
      <h1 style={{ color: '#4caf50' }}>Recherche de livres</h1>
      <TextField
        label="Entrez le titre du livre"
        value={searchInput}
        onChange={handleSearchChange}
        variant="outlined"
        style={{ marginBottom: '10px', width: '300px' }}
        InputProps={{
          style: { backgroundColor: '#f5f5f5', borderRadius: '5px' },
        }}
      />
      <Button variant="contained" onClick={searchBooks} style={{ backgroundColor: '#4caf50', color: '#ffffff', borderRadius: '5px' }}>
        Rechercher
      </Button>
      <Button variant="contained" onClick={searchAuteur} style={{ backgroundColor: '#ac9f50', color: '#ffffff', borderRadius: '5px' }}>
        Rechercher des infos sur un auteur
      </Button>
      <div style={{overflow:'auto',height:'100%'}}>
        {searchResults.length > 0 ? (
         searchResults.map((book, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginTop: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
              {book.cover_i ? (
                <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`} alt="Couverture du livre" style={{ width: '150px', height: '200px', objectFit: 'cover', borderRadius: '5px', marginRight: '20px' }} />
              ) : (
                <div style={{ width: '150px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: '5px', marginRight: '20px' }}>Aucune image disponible</div>
              )}
              <Grid container spacing={2}>
               <InfoGrid book={book}/>
               
              </Grid>
            </Box>
          ))
        ) : (
          <div>Aucun résultat trouvé pour cette recherche.</div>
        )}
      </div>
    </div>
  );
}
export default OpenLibrary;


const InfoGrid = ({book})=>{

if(book.type==='author')
return <>
  <Grid item xs={4}>
                  <strong style={{ color: '#4caf50' }}>Auteur:</strong>
                </Grid>
                <Grid item xs={8}>
                  {book.name}
                  {book.birth_date!=null?('     ('+book.birth_date+' - '+book.death_date+')'):null}
                </Grid>
  <Grid item xs={4}>
                  <strong style={{ color: '#4caf50' }}>Sujets favoris:</strong>
                </Grid>
                <Grid item xs={8}>
                {book.top_subjects ? book.top_subjects.join(', ') : 'on sait pas de quoi ca parle'}
                </Grid>
</>

else
return <>
     <Grid item xs={4}>
                  <strong style={{ color: '#4caf50' }}>Titre:</strong>
                </Grid>
                <Grid item xs={8}>
                  {book.title}
                </Grid>
                <Grid item xs={4}>
                  <strong style={{ color: '#4caf50' }}>Auteur:</strong>
                </Grid>
                <Grid item xs={8}>
                  {book.author_name ? book.author_name.join(', ') : 'Auteur inconnu'}
                </Grid>
                <Grid item xs={4}>
                  <strong style={{ color: '#4caf50' }}>Sujet:</strong>
                </Grid>
                <Grid item xs={8}>
                  {book.subject ? book.subject.join(', ') : 'on sait pas de quoi ca parle'}
                </Grid>
                <Grid item xs={4}>
                  <strong style={{ color: '#4caf50' }}>Lien vers OpenLibrary:</strong>
                </Grid>
                <Grid item xs={8}>
                  {book.key && <Button onClick={evt=>{ 
                    window.open('https://openlibrary.org/'+book.key);
                    }}><Link/></Button>}
                </Grid>
                </>
}