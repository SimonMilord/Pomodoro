import "./App.css";
import { useEffect, useState } from "react";
import pressSound from "./sounds/press.mp3";
import alertSound from "./sounds/alert.mp3";

const TWENTY_FIVE_MINUTES = 25 * 60;
const FIVE_MINUTES = 5 * 60;
const TWENTY_MINUTES = 20 * 60;
const pressAudio = new Audio(pressSound);
const alertAudio = new Audio(alertSound);

const TIMER_STATES = {
  focus: {
    label: "Focus",
    duration: TWENTY_FIVE_MINUTES,
    backgroundClass: "background-focus",
  },
  shortBreak: {
    label: "Short Break",
    duration: FIVE_MINUTES,
    backgroundClass: "background-sbreak",
  },
  longBreak: {
    label: "Long Break",
    duration: TWENTY_MINUTES,
    backgroundClass: "background-lbreak",
  },
};

type TimerState = keyof typeof TIMER_STATES;

const App = () => {
  const [timerState, setTimerState] = useState<TimerState>("focus"); // focus, shortBreak, longBreak
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] =
    useState<number>(TWENTY_FIVE_MINUTES);

  const appCSSClass = `App ${TIMER_STATES[timerState].backgroundClass}`;
  const callToActionMessage = `Time to ${TIMER_STATES[
    timerState
  ].label.toLowerCase()}!`;

  useEffect(() => {
    setTimeRemaining(TIMER_STATES[timerState].duration);
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

  /**
   * Handles the change of the timer state (focus, shortBreak, longBreak).
   * @param event
   */
  const handleChangeState = (event: any) => {
    if (isRunning) {
      setIsRunning(false);
      clearIntervalId(intervalId);
    }
    setTimerState(event.target.id);
  };

  /**
   * Handles the start or pausing of the timer.
   */
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

  /**
   * Handles skipping to the next timer state.
   */
  const handleSkip = () => {
    clearIntervalId(intervalId);
    const nextState =
      timerState === "focus"
        ? "shortBreak"
        : timerState === "shortBreak"
        ? "longBreak"
        : "focus";

    setTimerState(nextState);
    setIsRunning(false);
  };

  /**
   * Clears the interval id.
   * @param id The interval id to clear.
   */
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
          {Object.keys(TIMER_STATES).map((state) => (
            <button
              key={state}
              id={state}
              className={`stateButton ${
                timerState === state ? `stateButton__${state}--selected` : ""
              }`}
              onClick={handleChangeState}
            >
              {TIMER_STATES[state as TimerState].label}
            </button>
          ))}
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
