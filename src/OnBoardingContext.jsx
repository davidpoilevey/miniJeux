// OnBoardingContext.js
import { createContext, useContext, useState, useEffect , useRef, useMemo} from "react";
import davImg from './DSCN0013.jpg';

// OnBoardingStep.js
import { Popper, Paper, Typography, Button, Grow, Avatar } from "@mui/material";

const OnBoardingContext = createContext();

export function useOnBoarding() {
  return useContext(OnBoardingContext);
}

export function OnBoardingStep({ stepId, children, message, condition }) {
  const ref = useRef(null);
  const { currentStep, setStepCompleted } = useOnBoarding();

  // Évaluer dynamiquement la condition
  const conditionMet = useMemo(() => {
    if (typeof condition === "function") return condition();
    if (typeof condition === "boolean") return condition;
    return true;
  }, [condition]);
  const isActive = currentStep?.id === stepId && conditionMet;
  return (
    <>
      <span ref={ref} style={{ display: "inline-block" }}>
        {children}
      </span>
      <Popper open={isActive} anchorEl={ref.current} placement="top" 
      transition 
  modifiers={[
    { name: "zIndex", enabled: true, phase: "write", fn: ({ state }) => { state.styles.popper.zIndex = 9999; } },
  ]}
  disablePortal >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper sx={{ p: 2, maxWidth: 250, bgcolor: "#1bdb98ff" }}>
                <Avatar src={davImg} sx={{ width: 56, height: 56 }}/>
              <Typography variant="h6">{message}</Typography>
              <Button
                size="small"
                sx={{ mt: 1 }}
                variant="contained"
                onClick={() => setStepCompleted(stepId)}
              >
                OK
              </Button>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export function OnBoardingProvider({ app, stepsConfig = [], children }) {
  const [currentStep, setCurrentStep] = useState(null);
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem(`onboard_${app}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Trouver la prochaine étape non complétée
  useEffect(() => {
    const next = stepsConfig.find(s => !completed.includes(s.id));
    setCurrentStep(next || null);
  }, [completed, stepsConfig]);

  const setStepCompleted = (stepId) => {
    setCompleted(prev => {
      if (prev.includes(stepId)) return prev;
      const next = [...prev, stepId];
      localStorage.setItem(`onboard_${app}`, JSON.stringify(next));
      return next;
    });
  };

  const resetOnboarding = () => {
    localStorage.removeItem(`onboard_${app}`);
    setCompleted([]);
  };

  return (
    <OnBoardingContext.Provider value={{
      app,
      currentStep,
      completed,
      setStepCompleted,
      resetOnboarding
    }}>
      {children}
    </OnBoardingContext.Provider>
  );
}


