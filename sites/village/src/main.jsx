import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Scene from './Scene.jsx';
import { cameraFor, useView } from './camera.js';
import { destinations, linksOf } from './destinations.js';
import { inWater, nearCat, props, villageMap } from './map.js';
import miaouUrl from './sons/miaou.mp3';
import ploufUrl from './sons/splash.mp3';
import grognonUrl from './sons/chatPasContent.mp3';
import { advance, advanceToward, nearbyDoor } from './movement.js';
import { findRoute } from './route.js';
import './village.css';

const keys = {
  arrowup: 'up', z: 'up', w: 'up',
  arrowleft: 'left', q: 'left', a: 'left',
  arrowdown: 'down', s: 'down',
  arrowright: 'right', d: 'right',
};

const controls = [
  ['up', '↑', 'Monter'],
  ['left', '←', 'Aller à gauche'],
  ['down', '↓', 'Descendre'],
  ['right', '→', 'Aller à droite'],
];

const directLinks = Object.entries(destinations).filter(([, d]) => d.type !== 'gag')
  .flatMap(([id, d]) => linksOf(id).map((link) => ({ ...link, prive: d.type === 'prive' })));
const sounds = { miaou: new Audio(miaouUrl), plouf: new Audio(ploufUrl), grognon: new Audio(grognonUrl) };
const offsets = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');

function initialPosition() {
  const state = window.history.state;
  const door = state && Object.hasOwn(state, 'villageDoor')
    ? state.villageDoor
    : new URLSearchParams(window.location.search).get('retour');
  return Object.hasOwn(villageMap.doors, door) ? villageMap.doors[door].resume : villageMap.spawn;
}

function Village() {
  const [player, setPlayer] = useState(initialPosition);
  const [walking, setWalking] = useState(false);
  const [target, setTarget] = useState(null);
  const [reduced, setReduced] = useState(preference.matches);
  const position = useRef(player);
  const viewport = useRef(null);
  const pressed = useRef(new Map());
  const route = useRef([]);
  const panel = useRef(null);
  const action = useRef(null);
  const [knocks, setKnocks] = useState(0);
  const [sound, setSound] = useState(true);
  const [splash, setSplash] = useState(null);
  const view = useView();
  const nearby = nearbyDoor(player);
  const here = nearby && destinations[nearby];
  const links = here ? linksOf(nearby) : [];
  const bubble = here?.type === 'gag' ? here.lines[Math.min(knocks, here.lines.length - 1)] : here?.bubble ?? null;
  const catClose = nearCat(player);
  const soundOn = useRef(sound);
  const lastPlouf = useRef(0);
  const [grumpy, setGrumpy] = useState(false);
  soundOn.current = sound;

  useEffect(() => setKnocks(0), [nearby]);
  useEffect(() => { if (catClose) play('miaou'); }, [catClose]);

  function play(name) {
    if (!soundOn.current) return;
    const audio = sounds[name];
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  // On ne marche pas sur l'eau, mais on a le droit d'essayer.
  function plouf(point) {
    const now = performance.now();
    if (now - lastPlouf.current < 900) return;
    lastPlouf.current = now;
    setSplash({ ...point, at: now });
    play('plouf');
  }

  function updatePlayer(after) {
    const before = position.current;
    if (after !== before) {
      position.current = after;
      setPlayer(after);
    }
    setWalking(after.x !== before.x || after.y !== before.y);
  }

  function step(directions, elapsed) {
    const list = [...directions];
    const before = position.current;
    const after = advance(before, list, elapsed);
    updatePlayer(after);
    if (after.x === before.x && after.y === before.y) {
      const probe = list.reduce((p, d) => ({ x: p.x + offsets[d][0] * 16, y: p.y + offsets[d][1] * 16 }), before);
      if (inWater(probe.x, probe.y)) plouf(probe);
      else if (nearCat(probe) && Math.hypot(probe.x - props.cat.x, probe.y - props.cat.y) < 20) grumble();
    }
  }

  // Le chat veut bien dire bonjour, pas qu'on lui marche dessus.
  function grumble() {
    if (grumpy) return;
    setGrumpy(true);
    play('grognon');
    window.setTimeout(() => setGrumpy(false), 1600);
  }

  function clearRoute() {
    route.current = [];
    setTarget(null);
  }

  function stop() {
    pressed.current.clear();
    clearRoute();
    setWalking(false);
  }

  function startInput(id, direction) {
    if (panel.current.open || pressed.current.has(id)) return;
    clearRoute();
    pressed.current.set(id, direction);
    if (pressed.current.size === 1) step([direction], 16);
  }

  function endInput(id) {
    if (pressed.current.delete(id) && pressed.current.size === 0) setWalking(false);
  }

  function walkRoute(elapsed) {
    const [waypoint] = route.current;
    const before = position.current;
    const after = advanceToward(before, waypoint, elapsed);
    updatePlayer(after);
    if (after.x === waypoint.x && after.y === waypoint.y) route.current.shift();
    if (!route.current.length || (after === before && elapsed > 0)) stop();
  }

  useEffect(() => {
    let lastTick = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (pressed.current.size) step(pressed.current.values(), now - lastTick);
      else if (route.current.length) walkRoute(now - lastTick);
      lastTick = now;
    }, 16);

    function restore(event) {
      if (!event.persisted) return;
      stop();
      position.current = initialPosition();
      setPlayer(position.current);
    }

    function updatePreference(event) {
      setReduced(event.matches);
    }

    window.addEventListener('blur', stop);
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', restore);
    document.addEventListener('visibilitychange', stop);
    preference.addEventListener('change', updatePreference);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('blur', stop);
      window.removeEventListener('pagehide', stop);
      window.removeEventListener('pageshow', restore);
      document.removeEventListener('visibilitychange', stop);
      preference.removeEventListener('change', updatePreference);
    };
  }, []);

  function knock() {
    const next = knocks + 1;
    setKnocks(next);
    // Le Dojo cède au dernier essai : on y entre quand même.
    if (here.finale && next >= here.lines.length - 1) window.setTimeout(() => {
      rememberReturn({ button: 0 }, nearby);
      window.location.href = here.finale;
    }, reduced ? 300 : 1400);
  }

  function openDoor() {
    if (panel.current.open || !here) return;
    if (here.type === 'gag') knock();
    else if (links.length > 1) action.current?.focus();
    else action.current?.click();
  }

  function handleSceneClick(event) {
    if (event.detail === 0 || panel.current.open) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const camera = cameraFor(position.current, view);
    const point = {
      x: camera.x + (event.clientX - bounds.left) * view.width / bounds.width,
      y: camera.y + (event.clientY - bounds.top) * view.height / bounds.height,
    };
    const hit = Object.keys(villageMap.doors).find((id) => {
      const { anchor, hitArea } = villageMap.doors[id];
      const doorX = point.x - anchor.x - hitArea.x;
      const doorY = point.y - anchor.y - hitArea.y;
      return doorX >= 0 && doorX <= hitArea.width && doorY >= 0 && doorY <= hitArea.height;
    });

    if (hit && nearbyDoor(position.current) === hit) {
      openDoor();
      return;
    }

    const nextRoute = findRoute(position.current, hit ? villageMap.doors[hit].resume : point);
    if (!nextRoute.length) {
      if (inWater(point.x, point.y)) plouf(point);
      return;
    }
    pressed.current.clear();
    route.current = nextRoute;
    setTarget(nextRoute.at(-1));
  }

  function handleKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || panel.current.open) return;
    const key = event.key.toLowerCase();
    if (Object.hasOwn(keys, key)) {
      event.preventDefault();
      startInput(`key:${event.code}`, keys[key]);
    } else if ((key === 'enter' || key === 'e') && !event.repeat && here) {
      event.preventDefault();
      openDoor();
    } else if (key === 'escape' && route.current.length) {
      event.preventDefault();
      stop();
    }
  }

  function rememberReturn(event, door) {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    stop();
    window.history.replaceState({ ...window.history.state, villageDoor: door }, '');
  }

  return (
    <main className="village">
      <header className="heading">
        <div>
          <h1>Le village</h1>
          <p>Promenez-vous : les portes s’illuminent à votre approche.</p>
        </div>
      </header>

      <section aria-label="Promenade" onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) stop();
      }}>
        <div className="scene-frame">
          <div
            className="scene"
            ref={viewport}
            role="group"
            tabIndex={0}
            aria-label="Scène du village"
            aria-describedby="controls-hint"
            onPointerDown={(event) => {
              if (event.button === 0) viewport.current.focus({ preventScroll: true });
            }}
            style={{ aspectRatio: `${view.width} / ${view.height}` }}
            onClick={handleSceneClick}
            onKeyDown={handleKeyDown}
            onKeyUp={(event) => endInput(`key:${event.code}`)}
            onBlur={stop}
          >
            <Scene viewport={viewport} view={view} nearby={nearby} bubble={bubble} catClose={catClose} catSays={grumpy ? 'Pas touche !' : 'Miaou !'} splash={splash}
              player={player} walking={walking} reduced={reduced} target={target} />
          </div>
        </div>

        <div className="controls">
          <div className="pad" role="group" aria-label="Directions">
            {controls.map(([direction, arrow, label]) => (
              <button
                key={direction}
                className={`direction ${direction}`}
                type="button"
                aria-label={label}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  // Keep focus on the walking surface when switching between keys and pointer controls.
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  startInput(`pointer:${event.pointerId}`, direction);
                }}
                onPointerUp={(event) => endInput(`pointer:${event.pointerId}`)}
                onPointerCancel={(event) => endInput(`pointer:${event.pointerId}`)}
                onLostPointerCapture={(event) => endInput(`pointer:${event.pointerId}`)}
                onClick={(event) => {
                  if (event.detail !== 0 || panel.current.open) return;
                  clearRoute();
                  step([direction], 32);
                  setWalking(false);
                }}
              >
                <span aria-hidden="true">{arrow}</span>
              </button>
            ))}
          </div>

          <div className="door-action">
            <p className="door-status" role="status">
              {!here ? 'Approchez d’une porte.' : bubble ? `${here.label} : « ${bubble} »` : `Devant : ${here.label}`}
            </p>
            {here && here.type !== 'gag' && (
              <div className="door-links">
                {links.map((link, index) => (
                  <a key={link.url} className="button-link" ref={index === 0 ? action : undefined} href={link.url}
                    onClick={(event) => rememberReturn(event, nearby)}>
                    {links.length > 1 ? `${link.label}${here.type === 'prive' ? ' 🔒' : ''}`
                      : here.type === 'prive' ? 'Entrer (connexion requise)' : 'Ouvrir la porte'}
                  </a>
                ))}
              </div>
            )}
            {here?.type === 'gag' && (
              <button className="button-link" type="button" onClick={knock}>Frapper</button>
            )}
          </div>
        </div>
      </section>

      <p className="hint" id="controls-hint">
        Cliquez ou touchez le sol pour vous déplacer. Au clavier, utilisez Tab pour atteindre la scène, les flèches pour marcher et Entrée pour ouvrir une porte (ou frapper).
      </p>
      <nav className="direct" aria-label="Accès direct">
        <span>Accès direct :</span>
        {directLinks.map((link) => (
          <a key={link.url} className="text-link" href={link.url} onClick={(event) => rememberReturn(event, null)}>
            {link.label}{link.prive ? ' 🔒' : ''}
          </a>
        ))}
        <a className="text-link" href="./classique/">Version sans village</a>
      </nav>
      <button className="text-link sound" type="button" aria-pressed={sound} onClick={() => setSound(!sound)}>
        {sound ? '🔊 Son activé' : '🔇 Son coupé'}
      </button>
      <details className="help" ref={panel} onToggle={stop}>
        <summary>Commandes</summary>
        <p>Cliquez sur la porte pour vous en approcher, puis cliquez de nouveau pour l’ouvrir. Les touches ZQSD, WASD et les boutons fléchés permettent aussi de marcher. Échap interrompt un trajet.</p>
      </details>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<Village />);
