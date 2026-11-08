// The step rail: where you are, what you answered, and a way back to any step you have reached.
// Build, Lot and Clash are the prototype's names for what steps 1 to 3 really show; the last three keep the app's own words.
export const STEP_LABELS = ['Build', 'Lot', 'Clash', 'Time saved', 'Contact', 'Summary'];

interface Props {
  step: number;
  reachable: number;
  /** Your answer for each step, shown under its label once given. */
  answers: (string | null)[];
  onGo: (step: number) => void;
}

export function Stepper({ step, reachable, answers, onGo }: Props) {
  const progress = (step - 1) / (STEP_LABELS.length - 1);
  return (
    <nav className="gd-rail" aria-label="Steps" style={{ ['--p' as string]: String(progress) }}>
      <ol>
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? 'done' : n === step ? 'now' : 'next';
          return (
            <li key={label} className={state}>
              <button type="button" disabled={n > reachable} aria-current={n === step ? 'step' : undefined} onClick={() => onGo(n)}>
                <span className="dot" aria-hidden="true">{state === 'done' ? '✓' : n}</span>
                <span className="tx">
                  <span className="l">{label}</span>
                  {answers[i] ? <span className="a">{answers[i]}</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
