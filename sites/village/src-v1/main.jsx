import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Scene from './Scene.jsx';
import { destinations } from './destinations.js';
import { villageMap } from './map.js';
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

const pivot = destinations.pivot;
const pivotDoor = villageMap.doors.pivot;
const pivotUrl = pivot.publicUrl ?? pivot.previewUrl;
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
  const ready = nearbyDoor(player) === 'pivot';

  function updatePlayer(after) {
    const before = position.current;
    if (after !== before) {
      position.current = after;
      setPlayer(after);
    }
    setWalking(after.x !== before.x || after.y !== before.y);
  }

  function step(directions, elapsed) {
    updatePlayer(advance(position.current, directions, elapsed));
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

  function openDoor() {
    if (!panel.current.open && nearbyDoor(position.current) === 'pivot') action.current?.click();
  }

  function handleSceneClick(event) {
    if (event.detail === 0 || panel.current.open) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const point = {
      x: (event.clientX - bounds.left) * villageMap.width / bounds.width,
      y: (event.clientY - bounds.top) * villageMap.height / bounds.height,
    };
    const { anchor, hitArea, resume } = pivotDoor;
    const doorX = point.x - anchor.x - hitArea.x;
    const doorY = point.y - anchor.y - hitArea.y;
    const hitsDoor = doorX >= 0 && doorX <= hitArea.width && doorY >= 0 && doorY <= hitArea.height;

    if (hitsDoor && nearbyDoor(position.current) === 'pivot') {
      openDoor();
      return;
    }

    const nextRoute = findRoute(position.current, hitsDoor ? resume : point);
    if (!nextRoute.length) return;
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
    } else if ((key === 'enter' || key === 'e') && !event.repeat && ready) {
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
          <p>Contournez la maison et approchez de la porte.</p>
        </div>
        <nav aria-label="Accès direct">
          <a className="text-link" href={pivotUrl} onClick={(event) => rememberReturn(event, null)}>
            Accès direct à la Maison Pivot
          </a>
        </nav>
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
            onClick={handleSceneClick}
            onKeyDown={handleKeyDown}
            onKeyUp={(event) => endInput(`key:${event.code}`)}
            onBlur={stop}
          >
            <Scene viewport={viewport} ready={ready} player={player} walking={walking} reduced={reduced} target={target} />
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
            <p className="door-status" role="status">{ready ? 'Devant la Maison Pivot' : 'La porte s’illumine à votre approche.'}</p>
            {ready && (
              <a className="button-link" ref={action} href={pivotUrl} onClick={(event) => rememberReturn(event, 'pivot')}>
                Ouvrir la porte
              </a>
            )}
          </div>
        </div>
      </section>

      <p className="hint" id="controls-hint">
        Cliquez ou touchez le sol pour vous déplacer. Au clavier, utilisez Tab pour atteindre la scène, les flèches pour marcher et Entrée pour ouvrir la porte.
      </p>
      <details className="help" ref={panel} onToggle={stop}>
        <summary>Commandes</summary>
        <p>Cliquez sur la porte pour vous en approcher, puis cliquez de nouveau pour l’ouvrir. Les touches ZQSD, WASD et les boutons fléchés permettent aussi de marcher. Échap interrompt un trajet.</p>
      </details>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<Village />);
