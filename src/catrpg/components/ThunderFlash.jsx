import React, { useEffect, useState } from 'react';

const ThunderFlash = ({ trigger = false, onComplete }) => {
  const [step, setStep] = useState(0); // 0 = rien, 1 = fondu noir, 2 = éclair blanc, 3 = fini

  useEffect(() => {
    if (trigger) {
      setStep(1); // Commence le cycle
    }
  }, [trigger]);

  useEffect(() => {
    let t;
    if (step === 1) {
      // Étape 1: fondu au noir rapide
      t = setTimeout(() => setStep(2), 100);
    } else if (step === 2) {
      // Étape 2: flash blanc + zébrure
      t = setTimeout(() => {
        setStep(0);
        if (onComplete) onComplete();
      }, 150);
    }
    return () => clearTimeout(t);
  }, [step, onComplete]);

  const getStyle = () => {
    if (step === 1) {
      return {
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Foncé rapide
      };
    }
    if (step === 2) {
      return {
        backgroundImage: `radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.1) 60%, transparent 100%)`,
        backgroundColor: 'rgba(255,255,255,0.2)',
        mixBlendMode: 'screen',
        filter: 'blur(1px)',
      };
    }
    return {};
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        transition: 'all 100ms ease-in-out',
        zIndex: 9999,
        ...getStyle()
      }}
    />
  );
};

export default ThunderFlash;
