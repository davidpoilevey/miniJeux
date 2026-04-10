import { GAMES_DATA } from './gameData';

const BASE = 'https://davidpoilevey.github.io/miniJeux';
const SITE_TITLE = 'Jeux React de David Poilevey';
const SITE_DESC = "Découvrez les mini-jeux développés en React par David Poilevey. Vieux jeux rétro et expériences en ReactJS. Un site ludique, créatif et open source, hébergé sur GitHub Pages.";

export function injectGamesJsonLd() {
  if (document.getElementById('games-jsonld')) return;
  let position = 0;
  const items = [];
  for (const cat of GAMES_DATA) {
    for (const jeu of cat.jeux || []) {
      if (!jeu.id) continue;
      position++;
      items.push({
        '@type': 'ListItem',
        position,
        item: {
          '@type': 'SoftwareApplication',
          applicationCategory: 'GameApplication',
          name: jeu.name,
          description: jeu.description || jeu.name,
          url: `${BASE}?game=${jeu.id}`,
          ...(jeu.image ? { image: jeu.image } : {}),
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        },
      });
    }
  }
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'games-jsonld';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Collection de mini-jeux React par David Poilevey',
    description: 'Mini-jeux gratuits développés en React : échecs, bomberman, évolution, stratégie, rétro…',
    url: BASE,
    itemListElement: items,
  });
  document.head.appendChild(script);
}

export function updatePageTitle(selectedApp) {
  const metaDesc = document.querySelector('meta[name="description"]');
  if (selectedApp) {
    document.title = `${selectedApp.name} — ${SITE_TITLE}`;
    if (metaDesc && selectedApp.description)
      metaDesc.setAttribute('content', `${selectedApp.description} — Mini-jeu gratuit développé en React par David Poilevey.`);
  } else {
    document.title = `${SITE_TITLE} | Mini-jeux en ligne gratuits`;
    if (metaDesc) metaDesc.setAttribute('content', SITE_DESC);
  }
}
