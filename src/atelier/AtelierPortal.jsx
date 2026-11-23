import { useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CasinoIcon from '@mui/icons-material/Casino';
import { HiScoreButton } from '../ChuckNorrisFact';
import { useGlobalScores } from '../App';
import { fetchGamesWithScores, GameTopButton } from '../pocketbaseScores';
import { getRandomReview, useFilteredGames, useIsMobile, useTagsWithCounts } from '../hookGame';
import { FAVORITES } from '../stitch/pages/FavoritesPage';
import photoDavid from '../DSCN0013.jpg';
import './atelier.css';

const theme = createTheme({
  palette: {
    primary: { main: '#315b4c' }, secondary: { main: '#b94e32' },
    background: { default: '#f7f5ee', paper: '#fffdf7' },
    text: { primary: '#263d34', secondary: '#62665c' },
  },
  typography: { fontFamily: '"Plus Jakarta Sans", sans-serif' },
});
const readSaved = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const STATUS = { success: 'Disponible', warning: 'Bêta', info: 'À découvrir', error: 'En chantier' };
const AI_CHOICES = [
  { id: 'orbitales', creator: 'Claude Opus 5.5', blurb: 'Des planètes en mouvement, une étoile impitoyable et des flottes à envoyer au bon endroit. Au bon moment, surtout.' },
  { id: 'minuit', creator: 'GPT-6.1 Sol', blurb: 'Neuf joyaux, trois salles et des gardiens à duper. Le casse parfait tient parfois à un seul pas de côté.' },
  { id: 'bouillon', creator: 'GLM-5.3', blurb: 'Des microbes qui tombent, fusionnent et changent de forme. Une petite soupe où l’évolution ne tient pas en place.' },
  { id: 'dejavu', creator: 'Fable-5.2', level: 'Medium', blurb: 'Chaque trajet devient un écho qui recommence à l’infini. Ton adversaire le plus tenace ? Toi, il y a quelques secondes.' },
  { id: 'phareouest', creator: 'Fable-5.2', level: 'High', blurb: 'Un phare, des capitaines qui oublient et une mer pleine de récifs. À toi de décider où poser la lumière.' },
  { id: 'souspli', creator: 'GPT-6.2 Sol', blurb: 'Une ville à plier, des lettres à distribuer et un seul coup de tampon. Les scellés, eux, sont à prendre au pied de la lettre.' },
];

function AIChoicesPage({ games, onSelectGame }) {
  return (
    <section id="atelier-collection" className="atelier-ai" aria-labelledby="atelier-ai-title">
      <div className="atelier-ai-heading">
        <p className="atelier-eyebrow">LE DERNIER CHAPITRE DE L’ATELIER</p>
        <h1 id="atelier-ai-title">Le choix <i>des IA.</i></h1>
        <p className="atelier-ai-lead">Une même carte blanche.<br />Six façons de jouer.</p>
        <p className="atelier-ai-intro">Pour ces six jeux, les IA ont pris les clés de l’atelier. Chacune a imaginé son jeu, puis l’a réalisé.</p>
      </div>
      <div className="atelier-ai-grid">
        {AI_CHOICES.map(choice => {
          const game = games.find(g => g.id === choice.id);
          if (!game) return null;
          return (
            <article className="atelier-ai-card" key={choice.id}>
              <button className="atelier-ai-cover" onClick={() => onSelectGame(game)} aria-label={`Jouer à ${game.name}`}>
                <GameImage game={game} />
                <span className="atelier-play" aria-hidden="true">↗</span>
              </button>
              <div className="atelier-ai-credit"><p>Imaginé & réalisé par</p><p className="atelier-ai-creator">{choice.creator}</p>{choice.level && <p className="atelier-ai-level">Niveau {choice.level}</p>}</div>
              <h2>{game.name}</h2>
              <p className="atelier-ai-description">{choice.blurb}</p>
              <button className="atelier-text-link" onClick={() => onSelectGame(game)}>À vous de jouer <span aria-hidden="true">↗</span></button>
            </article>
          );
        })}
      </div>
      <p className="atelier-ai-colophon"><span aria-hidden="true">✳</span> La curiosité humaine a ouvert cet atelier. Six curiosités artificielles en signent la dernière page.</p>
    </section>
  );
}

function GameImage({ game, className = '' }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`atelier-image ${className}`}>
      {game?.image && !failed ? (
        <img src={game.image} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : <span className="atelier-image-fallback" aria-hidden="true">✳</span>}
    </span>
  );
}

function GameCard({ game, index, score, topName, onSelect, onTag }) {
  const review = useMemo(() => getRandomReview(), []);
  return (
    <article className="atelier-card">
      {topName && <span className="atelier-card-trophy"><GameTopButton gameName={topName} /></span>}
      <button className="atelier-card-launch" onClick={() => onSelect(game)} aria-label={`Jouer à ${game.name}`}>
        <span className="atelier-card-cover">
          <GameImage game={game} />
          {STATUS[game.status] && <span className={`atelier-status atelier-status-${game.status}`}>{STATUS[game.status]}</span>}
          <span className="atelier-play" aria-hidden="true">↗</span>
        </span>
        <span className="atelier-card-meta"><span>N° {String(index + 1).padStart(2, '0')}</span><span>{score > 0 ? `♜ ${score.toLocaleString('fr-FR')}` : game.categorie}</span></span>
        <span className="atelier-card-name">{game.name}</span>
        <span className="atelier-card-description">{game.description}</span>
      </button>
      <div className="atelier-card-tags">
        {game.tags?.map(tag => <button key={tag} onClick={() => onTag(tag)}>{tag}</button>)}
      </div>
      <div className="atelier-review">
        <p className="atelier-review-label">Un avis très peu objectif <span aria-hidden="true">✧</span></p>
        <blockquote>« {review.text} »
          <cite>— {review.name} · {review.stars}</cite>
        </blockquote>
      </div>
    </article>
  );
}

export default function AtelierPortal({ gamesData, searchQuery, onSearch, currentView, onChangeView, onRandom, onSelectGame }) {
  const [selectedTags, setSelectedTags] = useState(() => {
    const saved = readSaved('selectedTags', []);
    return Array.isArray(saved) ? saved.filter(t => typeof t === 'string') : [];
  });
  const [mobileSearch, setMobileSearch] = useState(() => {
    try { return localStorage.getItem('mobileSearch') || ''; } catch { return ''; }
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();
  const query = isMobile ? mobileSearch : searchQuery;
  const effectiveTags = isMobile ? [...new Set([...selectedTags, 'mobileFriendly'])] : selectedTags;
  const filteredGames = useFilteredGames(gamesData, query, effectiveTags);
  const tagCounts = useTagsWithCounts(gamesData, query, effectiveTags);
  const allGames = useMemo(() => gamesData.flatMap(group => group.jeux.map(game => ({ ...game, categorie: group.categorie }))), [gamesData]);
  const { getScoreByGame } = useGlobalScores();
  const [gamesWithScores, setGamesWithScores] = useState(() => new Set());
  // Selon les jeux, le score est publié sous game.id ou sous game.name
  useEffect(() => { fetchGamesWithScores().then(setGamesWithScores).catch(() => {}); }, []);
  const favorites = FAVORITES.map(f => ({ ...f, game: allGames.find(g => g.id === f.matchId || g.name === f.matchId) })).filter(f => f.game);
  const covers = ['Civilization', 'echec', 'ezioTrip'].map(id => allGames.find(g => g.id === id || g.name === id)).filter(Boolean);
  const isFavorites = currentView === 'favorites';
  const isAIChoices = currentView === 'ai-choices';
  const isLibrary = !isFavorites && !isAIChoices;
  const toggleTag = tag => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  const goToLibrary = () => {
    onChangeView('library');
    requestAnimationFrame(() => document.getElementById('atelier-collection')?.scrollIntoView({ behavior: 'smooth' }));
  };
  useEffect(() => { try { localStorage.setItem('selectedTags', JSON.stringify(selectedTags)); } catch {} }, [selectedTags]);
  useEffect(() => { try { localStorage.setItem('mobileSearch', mobileSearch); } catch {} }, [mobileSearch]);

  return (
    <ThemeProvider theme={theme}>
      <div className="atelier">
        <a className="atelier-skip" href="#atelier-collection">Aller aux jeux</a>
        <header className="atelier-header">
          <button className="atelier-brand" onClick={() => { onChangeView('library'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="L’Atelier de David, accueil">
            <span className="atelier-monogram" aria-hidden="true">d.</span>
            <span>L’Atelier <i>de David</i><small>JEUX & AUTRES CURIOSITÉS</small></span>
          </button>
          <nav aria-label="Navigation principale">
            <button className={isLibrary ? 'is-active' : ''} aria-current={isLibrary ? 'page' : undefined} onClick={() => onChangeView('library')}>La collection</button>
            <button className={isFavorites ? 'is-active' : ''} aria-current={isFavorites ? 'page' : undefined} onClick={() => onChangeView('favorites')}>La sélection maison <span>✳</span></button>
            <button className={isAIChoices ? 'is-active' : ''} aria-current={isAIChoices ? 'page' : undefined} onClick={() => onChangeView('ai-choices')}>Le choix des IA</button>
          </nav>
          <div className="atelier-header-actions">
            <span className="atelier-score-button" title="Classement mondial"><HiScoreButton /></span>
            <button className="atelier-random" onClick={onRandom} aria-label="Au petit bonheur, ouvrir un jeu au hasard"><span aria-hidden="true"><CasinoIcon fontSize="inherit" /></span> Au petit bonheur</button>
          </div>
        </header>

        <main>
          {isLibrary && <section className="atelier-hero" aria-labelledby="atelier-title">
            <div className="atelier-hero-copy">
              <p className="atelier-eyebrow"><span /> UN PETIT COIN D’INTERNET, FAIT MAISON</p>
              <h1 id="atelier-title">Des jeux.<br />Des idées.<br /><i>Et si on jouait ?</i></h1>
              <p className="atelier-intro">Des classiques revisités, des mondes à inventer et quelques expériences un peu improbables. Tout ça, pour le plaisir de créer. Et de jouer.</p>
              <button className="atelier-primary" onClick={goToLibrary}>Ouvrir la boîte à jeux <span aria-hidden="true">↘</span></button>
              <div className="atelier-signature"><img src={photoDavid} alt="David" /><span>Imaginé, bricolé et codé par David.<small>La curiosité fait le reste.</small></span></div>
            </div>
            <div className="atelier-collage" aria-label="Quelques jeux à découvrir">
              <span className="atelier-collage-note">Quelques morceaux de l’atelier <span aria-hidden="true">⤵</span></span>
              {covers.map((game, i) => <button key={game.id || game.name} className={`atelier-paper atelier-paper-${i}`} onClick={() => onSelectGame(game)} aria-label={`Découvrir ${game.name}`}>
                <GameImage game={game} /><span>{game.name}<small>{['Un monde à bâtir.', 'Un coup d’avance.', 'Une aventure à moustaches.'][i]}</small></span>
              </button>)}
              <span className="atelier-stamp">100 %<br /><i>fait maison</i><span aria-hidden="true">✳</span></span>
              <span className="atelier-collage-caption">Pas de grande équipe. Juste beaucoup d’envies.</span>
            </div>
          </section>}

          {isAIChoices ? <AIChoicesPage games={allGames} onSelectGame={onSelectGame} /> : <section id="atelier-collection" className="atelier-collection" aria-labelledby="atelier-collection-title">
            <div className="atelier-section-heading">
              <div><p className="atelier-eyebrow">{isFavorites ? 'LES COUPS DE CŒUR DU CRÉATEUR' : 'IL Y A FORCÉMENT UN JEU POUR VOUS'}</p>
                <h2 id="atelier-collection-title">{isFavorites ? <>La sélection <i>maison.</i></> : <>La boîte à <i>jeux.</i></>}</h2>
              </div>
              <p className="atelier-count">{isFavorites ? favorites.length : allGames.length}<span>{isFavorites ? 'coups de cœur' : 'jeux & expériences'}</span></p>
            </div>

            {isFavorites ? <>
              <p className="atelier-selection-intro">Pas un classement, pas un algorithme. Juste ceux que j’ai envie de vous faire découvrir en premier.</p>
              <div className="atelier-favorites">{favorites.map((fav, i) => <article key={fav.matchId} className="atelier-favorite">
                <button className="atelier-favorite-image" onClick={() => onSelectGame(fav.game)} aria-label={`Jouer à ${fav.game.name}`}><GameImage game={fav.game} /><span aria-hidden="true">↗</span></button>
                <div><p className="atelier-eyebrow">0{i + 1} / {fav.eyebrow}</p><h3>{fav.game.name}</h3><p>{fav.blurb}</p><button className="atelier-text-link" onClick={() => onSelectGame(fav.game)}>C’est parti <span aria-hidden="true">↗</span></button></div>
              </article>)}</div>
            </> : <>
              <div className="atelier-tools">
                <label className="atelier-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Un nom, une envie…" aria-label="Rechercher un jeu par nom ou description" value={query} onChange={e => isMobile ? setMobileSearch(e.target.value) : onSearch(e.target.value)} /></label>
                <button className={`atelier-filter-toggle ${filtersOpen || selectedTags.length ? 'is-active' : ''}`} aria-expanded={filtersOpen} aria-controls="atelier-filters" onClick={() => setFiltersOpen(v => !v)}>Affiner la collection <span>{selectedTags.length || '+'}</span></button>
                <p className="atelier-results" role="status">{filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''} à explorer</p>
              </div>
              {isMobile && <p className="atelier-mobile-note">Une sélection adaptée à votre mobile.</p>}
              {filtersOpen && <div id="atelier-filters" className="atelier-filters" aria-label="Filtrer par tags">
                {tagCounts.map(({ tag, count }) => <button key={tag} aria-pressed={selectedTags.includes(tag)} disabled={count === 0 || (isMobile && tag === 'mobileFriendly')} onClick={() => toggleTag(tag)}>{tag}<span>{count}</span></button>)}
              </div>}
              {selectedTags.length > 0 && <div className="atelier-selected-tags">{selectedTags.map(tag => <button key={tag} onClick={() => toggleTag(tag)} aria-label={`Retirer le filtre ${tag}`}>{tag} ×</button>)}<button onClick={() => setSelectedTags([])}>Tout effacer</button></div>}
              {filteredGames.length ? <div className="atelier-grid">{filteredGames.map(game => <GameCard key={game.id || game.name} game={game} index={allGames.findIndex(g => (g.id || g.name) === (game.id || game.name))} score={getScoreByGame(game.id || game.name)?.score} topName={[game.id, game.name].find(n => gamesWithScores.has(n))} onSelect={onSelectGame} onTag={toggleTag} />)}</div> : <div className="atelier-empty"><span aria-hidden="true">✳</span><h3>Ce tiroir est encore vide.</h3><p>Essayez une autre recherche ou retirez quelques filtres.</p><button className="atelier-primary" onClick={() => { setSelectedTags([]); setMobileSearch(''); onSearch(''); }}>Revoir la collection</button></div>}
            </>}
          </section>}
        </main>

        <footer className="atelier-footer"><span className="atelier-footer-brand">L’Atelier <i>de David.</i></span><p>Des jeux, du code, et le plaisir de faire.</p><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Retour en haut ↑</button></footer>
      </div>
    </ThemeProvider>
  );
}
