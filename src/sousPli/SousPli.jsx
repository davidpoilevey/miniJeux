import { useEffect, useRef, useState } from 'react';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { adresse, colonne, dossiers, examiner, ouvrirPlan, plier, seDeplace, trouverPlis } from './pli';
import './sousPli.css';

const fleche = ({ axe, deplaceDebut }) => axe === 'x'
  ? deplaceDebut ? '→' : '←'
  : deplaceDebut ? '↓' : '↑';

const quantite = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

function nomDuPli({ axe, trait }) {
  return axe === 'x'
    ? `Plier entre ${colonne(trait - 1)} et ${colonne(trait)}`
    : `Plier entre ${trait} et ${trait + 1}`;
}

const memePli = (pli, autre) => pli.axe === autre?.axe && pli.trait === autre?.trait;

const atlas = { largeur: 1536, hauteur: 1024 };

function cadrerParcelle(couche, { x, y, pas }, verso) {
  const gauche = x + couche.x * pas;
  const haut = y + couche.y * pas;
  const miroirX = couche.miroirX !== (verso === 'x');
  const miroirY = couche.miroirY !== (verso === 'y');
  return {
    backgroundSize: `${atlas.largeur / pas * 100}% ${atlas.hauteur / pas * 100}%`,
    backgroundPosition: `${gauche / (atlas.largeur - pas) * 100}% ${haut / (atlas.hauteur - pas) * 100}%`,
    transform: `scale(${miroirX ? -1 : 1}, ${miroirY ? -1 : 1})`,
  };
}

function CaseContenu({ casePlan, dossier, empreinte, verso }) {
  const { couches } = casePlan;
  // Une fois rabattu, le dessous du volet devient la nouvelle couche visible.
  const visible = verso ? couches[0] : couches[couches.length - 1];
  const { distribues, touches } = examiner(couches, dossier);
  return (
    <>
      <span className="pli-tile-paper" aria-hidden="true" style={cadrerParcelle(visible, dossier.carte, verso)} />
      {couches.length > 1 && <span className="pli-layers" aria-hidden="true">{couches.length}</span>}
      <span className="pli-marks" aria-hidden="true">
        {distribues.length > 0 && <span className="pli-letter"><MailOutline />{distribues.length > 1 && distribues.length}</span>}
        {touches.length > 0 && <span className="pli-lock"><LockOutlined /></span>}
      </span>
      {empreinte && <span className="pli-imprint" data-resultat={empreinte} aria-hidden="true">{empreinte === 'reussi' ? '✓' : '×'}</span>}
    </>
  );
}

function Plan({ dossier, plan, restant, choix, cachet, animation, indice, pileGuide, onPlier, onChoisir, planRef }) {
  const [apercu, setApercu] = useState(null);
  const { largeur, hauteur } = dossier;
  const plis = restant > 0 ? trouverPlis(plan) : [];
  const pliGuide = indice ? dossier.pliGuide : null;
  const actif = animation || (!cachet && plis.find(pli => memePli(pli, apercu ?? pliGuide)));
  const style = {
    '--colonnes': largeur,
    '--lignes': hauteur,
    '--origine': actif ? `${actif.trait / (actif.axe === 'x' ? largeur : hauteur) * 100}%` : undefined,
    '--angle': animation ? `${(animation.axe === 'x') === animation.deplaceDebut ? 180 : -180}deg` : undefined,
  };
  const coord = ({ x, y }) => ({
    left: `${x / largeur * 100}%`,
    top: `${y / hauteur * 100}%`,
  });

  const lancerPli = (pli, event) => {
    setApercu(null);
    if (event.detail === 0) planRef.current.focus({ preventScroll: true });
    onPlier(pli);
  };

  return (
    <div className="pli-plan" style={style} ref={planRef} tabIndex={-1} role="group" aria-label="Plan de la ville">
      {Array.from({ length: largeur }, (_, x) => (
        <span key={x} className="pli-coordinate pli-coordinate-x" style={{ left: `${(x + .5) / largeur * 100}%` }}>{colonne(x)}</span>
      ))}
      {Array.from({ length: hauteur }, (_, y) => (
        <span key={y} className="pli-coordinate pli-coordinate-y" style={{ top: `${(y + .5) / hauteur * 100}%` }}>{y + 1}</span>
      ))}
      {plan.map(casePlan => {
        const { x, y, couches } = casePlan;
        const cle = adresse(x, y);
        const { distribues, touches } = examiner(couches, dossier);
        const levee = actif && seDeplace(casePlan, actif);
        return (
          <button
            key={cle}
            type="button"
            className={`pli-tile${levee ? ' pli-tile-lifted' : ''}${levee && animation ? ' pli-tile-inflight' : ''}${casePlan === pileGuide && !cachet ? ' pli-tile-guide' : ''}`}
            style={coord(casePlan)}
            aria-label={`Case ${cle}, ${quantite(couches.length, 'couche')}, ${quantite(distribues.length, 'lettre')}, ${quantite(touches.length, 'scellé')}`}
            aria-pressed={choix === cle}
            disabled={!!animation || !!cachet}
            onClick={() => onChoisir(cle)}
          >
            <CaseContenu casePlan={casePlan} dossier={dossier} empreinte={choix === cle ? cachet : null} />
          </button>
        );
      })}
      {animation && (
        <div className={`pli-wing pli-wing-${animation.axe}`} aria-hidden="true">
          {plan.filter(casePlan => seDeplace(casePlan, animation)).map(casePlan => (
            <div className="pli-wing-case" key={adresse(casePlan.x, casePlan.y)} style={coord(casePlan)}>
              <div className="pli-tile pli-wing-face">
                <CaseContenu casePlan={casePlan} dossier={dossier} />
              </div>
              <div className="pli-tile pli-wing-face pli-wing-verso">
                <CaseContenu casePlan={casePlan} dossier={dossier} verso={animation.axe} />
              </div>
            </div>
          ))}
        </div>
      )}
      {actif && <span aria-hidden="true" className={`pli-crease pli-crease-${actif.axe}`} />}
      {plis.map(pli => (
        <button
          key={`${pli.axe}${pli.trait}`}
          type="button"
          className={`pli-fold pli-fold-${pli.axe}${memePli(pli, pliGuide) ? ' pli-fold-guide' : ''}`}
          style={{ '--position': `${pli.trait / (pli.axe === 'x' ? largeur : hauteur) * 100}%` }}
          aria-label={nomDuPli(pli)}
          title={nomDuPli(pli)}
          disabled={!!animation || !!cachet}
          onPointerEnter={event => { if (event.pointerType === 'mouse') setApercu(pli); }}
          onPointerLeave={() => setApercu(null)}
          onFocus={() => setApercu(pli)}
          onBlur={() => setApercu(null)}
          onClick={event => lancerPli(pli, event)}
        >{fleche(pli)}</button>
      ))}
    </div>
  );
}

function AidePremierPli({ restant, indice, pile }) {
  return (
    <p className="pli-aide" role="status">
      {pile ? (
        <>Les deux lettres sont empilées sous <strong>{adresse(pile.x, pile.y)}</strong>. Sélectionne cette case, puis tamponne.</>
      ) : indice ? (
        <>{restant === 0 && 'Déplie le plan. '}Utilise la flèche <strong>entre B et C</strong>, juste à droite du B. <strong>A2</strong> se rabat sur <strong>D2</strong>.</>
      ) : restant === 0 ? (
        <>Ce pli ne réunit pas les deux lettres. Appuie sur <strong>Déplier</strong> pour réessayer.</>
      ) : (
        <>Pour empiler <strong>A2</strong> et <strong>D2</strong>, cherche la flèche à mi-chemin entre les deux cases.</>
      )}
    </p>
  );
}

function Bordereau({ dossier, index, selection, cachet, onTamponner, onEffacer, onSuivant }) {
  const couches = selection?.couches ?? [];
  const touchees = couches.map(couche => couche.id);
  const { distribues, touches } = examiner(couches, dossier);
  const reussi = cachet === 'reussi';
  const dernier = index === dossiers.length - 1;
  return (
    <aside className="pli-slip" aria-labelledby="pli-dossier">
      <p className="pli-label">Tournée {index + 1} / {dossiers.length}</p>
      <h2 id="pli-dossier">{dossier.nom}</h2>
      <div className="pli-addresses">
        <p><MailOutline /><span>Enveloppes à réunir</span></p>
        <ul aria-label="Adresses à livrer">
          {dossier.courrier.map(id => <li key={id} className={touchees.includes(id) ? 'pli-address-hit' : ''}>{id}</li>)}
        </ul>
        <p><LockOutlined /><span>Scellés à éviter</span></p>
        <ul aria-label="Adresses sous scellés">
          {dossier.scelles.map(id => <li key={id} className={touchees.includes(id) ? 'pli-address-alert' : ''}>{id}</li>)}
        </ul>
        <p className="pli-regle-scelles">Le tampon traverse la pile. Si la case tamponnée contient un cadenas, même caché, l’envoi est refusé.</p>
      </div>

      <div className="pli-readout" role="status" aria-atomic="true">
        {reussi ? (
          <><strong>{dernier ? 'Service terminé !' : 'Courrier distribué !'}</strong><p>Toutes les lettres sont arrivées. Scellés intacts.</p></>
        ) : selection ? (
          <>
            <strong>{cachet ? 'Empreinte refusée' : `Sous la case ${adresse(selection.x, selection.y)}`}</strong>
            <p>{touchees.slice().reverse().join(' · ')}</p>
            <p>{distribues.length}/{dossier.courrier.length} lettres couvertes · {quantite(touches.length, 'scellé')} touché{touches.length > 1 ? 's' : ''}</p>
          </>
        ) : (
          <><strong>Où tombe le cachet ?</strong><p>Touche une case pour voir les adresses empilées dessous.</p></>
        )}
      </div>

      {reussi ? <button type="button" className="pli-primary" onClick={onSuivant}>{dernier ? 'Rejouer' : 'Tournée suivante'} <span aria-hidden="true">→</span></button>
        : cachet ? <button type="button" className="pli-primary" onClick={onEffacer}>Retirer l’empreinte <span aria-hidden="true">↶</span></button>
          : <button type="button" className="pli-primary" onClick={onTamponner} disabled={!selection}>Tamponner <span aria-hidden="true">↧</span></button>}
    </aside>
  );
}

export default function SousPli({ onReturnToLibrary }) {
  const [index, setIndex] = useState(0);
  const [historique, setHistorique] = useState(() => [ouvrirPlan(dossiers[0])]);
  const [choix, setChoix] = useState(null);
  const [cachet, setCachet] = useState(null);
  const [animation, setAnimation] = useState(null);
  const [indice, setIndice] = useState(false);
  const planRef = useRef(null);
  const titrePlanRef = useRef(null);
  const dossier = dossiers[index];
  const plan = historique[historique.length - 1];
  const restant = dossier.budget - historique.length + 1;
  const selection = plan.find(({ x, y }) => adresse(x, y) === choix);
  const pileGuide = dossier.pliGuide && restant === 0 ? plan.find(({ couches }) => {
    const { oublies, touches } = examiner(couches, dossier);
    return oublies.length === 0 && touches.length === 0;
  }) : undefined;

  useEffect(() => {
    if (!animation) return;
    const duree = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380;
    const timer = setTimeout(() => {
      setHistorique(plans => [...plans, plier(plans[plans.length - 1], animation)]);
      setAnimation(null);
    }, duree);
    return () => clearTimeout(timer);
  }, [animation]);

  function reouvrir(n) {
    setIndex(n);
    setHistorique([ouvrirPlan(dossiers[n])]);
    setChoix(null);
    setCachet(null);
    setIndice(false);
  }

  function tamponner() {
    if (!selection) return;
    const { oublies, touches } = examiner(selection.couches, dossier);
    setCachet(oublies.length || touches.length ? 'rate' : 'reussi');
  }

  function avancer() {
    reouvrir((index + 1) % dossiers.length);
    requestAnimationFrame(() => titrePlanRef.current?.focus());
  }

  return (
    <main className="sous-pli">
      <div className="pli-wrap">
        <header className="pli-header">
          {onReturnToLibrary && <button type="button" className="pli-link" onClick={onReturnToLibrary}><span aria-hidden="true">←</span> L’Atelier</button>}
          <div className="pli-title">
            <div>
              <h1>Sous <em>Pli</em></h1>
              <p>Réunis toutes les enveloppes dans une même case, sans cadenas, puis tamponne-la.</p>
            </div>
            <img src={`${process.env.PUBLIC_URL}/sous-pli.webp`} alt="" className="pli-cover" />
          </div>
        </header>
        <div className="pli-workspace">
          <section className="pli-desk" aria-labelledby="pli-plan-title">
            <div className="pli-desk-heading">
              <h2 id="pli-plan-title" ref={titrePlanRef} tabIndex={-1}>Plan de distribution</h2>
              <span className="pli-budget" aria-live="polite">{restant} pli{restant > 1 ? 's' : ''} restant{restant > 1 ? 's' : ''}</span>
            </div>
            <p className="pli-instructions">Chaque flèche rabat le côté le plus court du plan dans le sens indiqué.</p>
            <div className="pli-plan-space">
              <Plan key={index} dossier={dossier} plan={plan} restant={restant} choix={choix} animation={animation} cachet={cachet}
                indice={indice} pileGuide={pileGuide} planRef={planRef} onChoisir={setChoix}
                onPlier={pli => { setChoix(null); setAnimation(pli); }} />
            </div>
            <div className="pli-tools">
              <button type="button" disabled={historique.length < 2 || !!animation || !!cachet} onClick={() => {
                setHistorique(plans => plans.slice(0, -1));
                setChoix(null);
              }}><span aria-hidden="true">↶</span> Déplier</button>
              <button type="button" disabled={!!animation || (historique.length === 1 && !cachet && !choix)} onClick={() => reouvrir(index)}>Recommencer</button>
              {dossier.pliGuide && !pileGuide && !cachet && (
                <button type="button" aria-pressed={indice} disabled={!!animation} onClick={() => setIndice(visible => !visible)}>Indice du pli</button>
              )}
            </div>
            {dossier.pliGuide && !cachet && <AidePremierPli restant={restant} indice={indice} pile={pileGuide} />}
          </section>
          <Bordereau dossier={dossier} index={index} selection={selection} cachet={cachet} onTamponner={tamponner}
            onEffacer={() => setCachet(null)} onSuivant={avancer} />
        </div>
      </div>
    </main>
  );
}
