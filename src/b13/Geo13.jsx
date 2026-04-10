import React from 'react';
import { Geo13Provider } from './Geo13Context';
import Geo13Canvas from './ui/Geo13Canvas';
import GeoPanel from './ui/GeoPanel';
import StatsPanel from './ui/StatsPanel';
import { AllImageSources } from '../civ/utils/imagesImports';
import { usePreloadedImages } from "../civ/utils/hooks";
import imgTerre from '../bactery/images/fondTerre.jpg';
const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#111827',
    color: '#e5e7eb',
    fontFamily: 'monospace',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    height: 160,
    flexShrink: 0,
    borderBottom: '1px solid #374151',
  },
  miniMapSlot: {
    width: 200,
    flexShrink: 0,
    borderRight: '1px solid #374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4b5563',
    fontSize: 12,
  },
  canvasWrapper: {
    flex: 1,
    overflow: 'auto',
  },
  bottomBar: {
    flexShrink: 0,
    borderTop: '1px solid #374151',
  },
};

const TERRAIN_SOURCES = {
  eau:      AllImageSources.water,
  plaine:   AllImageSources.plaine,
  foret:    AllImageSources.forest,
  montagne: AllImageSources.montagne,
  desert:   AllImageSources.desert,
  marecage:imgTerre
};
export default function Geo13() {
     const images = usePreloadedImages(TERRAIN_SOURCES);
  return (
    <Geo13Provider>
      <div style={styles.root}>
        <div style={styles.topBar}>
         
          <StatsPanel />
        </div>
        <div style={styles.canvasWrapper}>
          <Geo13Canvas images={images}/>
        </div>
        <div style={styles.bottomBar}>
          <GeoPanel />
        </div>
      </div>
    </Geo13Provider>
  );
}
