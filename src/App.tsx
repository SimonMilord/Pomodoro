import "./App.css";
import { useEffect, useState } from "react";
import pressSound from "./sounds/press.mp3";
import alertSound from "./sounds/alert.mp3";

const TWENTY_FIVE_MINUTES = 25 * 60;
const FIVE_MINUTES = 5 * 60;
const TWENTY_MINUTES = 20 * 60;
const pressAudio = new Audio(pressSound);
const alertAudio = new Audio(alertSound);

const App = () => {
  const [timerState, setTimerState] = useState<string>("focus"); // focus, shortBreak, longBreak
  const [backgroundColorClass, setBackgroundColorClass] =
    useState<string>("background-focus");
  const [timeRemaining, setTimeRemaining] =
    useState<number>(TWENTY_FIVE_MINUTES);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const appCSSClass = `App ${backgroundColorClass}`;
  const callToActionMessage = `Time to ${
    timerState === "focus"
      ? "focus!"
      : timerState === "shortBreak"
      ? "take a short break!"
      : "take a long break!"
  }`;

  useEffect(() => {
    setBackgroundColorClass(
      timerState === "focus"
        ? "background-focus"
        : timerState === "shortBreak"
        ? "background-sbreak"
        : "background-lbreak"
    );
    setTimeRemaining(
      timerState === "focus"
        ? TWENTY_FIVE_MINUTES
        : timerState === "shortBreak"
        ? FIVE_MINUTES
        : TWENTY_MINUTES
    );
  }, [timerState]);

  useEffect(() => {
    return () => {
      clearIntervalId(intervalId);
    };
  }, [intervalId]);

  useEffect(() => {
    const formattedTimeRemaining =
      Math.floor(timeRemaining / 60) +
      ":" +
      String(timeRemaining % 60).padStart(2, "0");
    document.title = `${formattedTimeRemaining} - ${callToActionMessage}`;
  }, [timerState, timeRemaining, callToActionMessage]);

  const handleChangeState = (event: any) => {
    if (isRunning) {
      setIsRunning(false);
      clearIntervalId(intervalId);
    }
    setTimerState(event.target.id);
    switch (event.target.id) {
      case "focus":
        setTimerState("focus");
        setTimeRemaining(TWENTY_FIVE_MINUTES);
        break;
      case "shortBreak":
        setTimerState("shortBreak");
        setTimeRemaining(FIVE_MINUTES);
        break;
      case "longBreak":
        setTimerState("longBreak");
        setTimeRemaining(TWENTY_MINUTES);
        break;
      default:
        break;
    }
  };

  const handleStartOrPause = () => {
    pressAudio.play();
    if (isRunning) {
      clearIntervalId(intervalId);
      setIsRunning(false);
    } else {
      const id = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(id);
            alertAudio.play();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      setIntervalId(id);
      setIsRunning(true);
    }
  };

  const handleSkip = () => {
    clearIntervalId(intervalId);
    switch (timerState) {
      case "focus":
        setTimerState("shortBreak");
        break;
      case "shortBreak":
        setTimerState("longBreak");
        break;
      case "longBreak":
        setTimerState("focus");
        break;
      default:
        break;
    }

    setIsRunning(false);
  };

  const clearIntervalId = (id: NodeJS.Timeout | null) => {
    if (id) {
      clearInterval(id);
      setIntervalId(null);
    }
  };

  return (
    <div className={appCSSClass}>
      <header>Pomodoro timer</header>
      <main>
        <div>
          <button
            id="focus"
            className={`stateButton ${
              timerState === "focus" ? "stateButton__focus--selected" : null
            }`}
            onClick={handleChangeState}
          >
            Focus
          </button>
          <button
            id="shortBreak"
            className={`stateButton ${
              timerState === "shortBreak" ? "stateButton__shortBreak--selected" : null
            }`}
            onClick={handleChangeState}
          >
            Short Break
          </button>
          <button
            id="longBreak"
            className={`stateButton ${
              timerState === "longBreak" ? "stateButton__longBreak--selected" : null
            }`}
            onClick={handleChangeState}
          >
            Long Break
          </button>
        </div>
        <p className="timeRemaining">
          {Math.floor(timeRemaining / 60)}:
          {String(timeRemaining % 60).padStart(2, "0")}
        </p>
        <div>
          <button
            id="startPause"
            className="triggerButton"
            onClick={handleStartOrPause}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button id="skip" className="triggerButton" onClick={handleSkip}>
            Skip
          </button>
        </div>
        <p>{callToActionMessage}</p>
      </main>
    </div>
  );
};

export default App;
