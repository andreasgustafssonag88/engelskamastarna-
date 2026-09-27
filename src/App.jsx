import { useState } from "react";
import "./styles.css";

const questions = [
  { emoji: "🐶", correct: "Dog", options: ["Dog", "Cat", "Horse"], translation: "hund" },
  { emoji: "🐱", correct: "Cat", options: ["Dog", "Cat", "Rabbit"], translation: "katt" },
  { emoji: "🐴", correct: "Horse", options: ["Horse", "Bear", "Duck"], translation: "häst" },
  { emoji: "🐻", correct: "Bear", options: ["Bear", "Cat", "Dog"], translation: "björn" },
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [current, setCurrent] = useState(0);
  const [xp, setXp] = useState(0);
  const [message, setMessage] = useState("");
  const [answered, setAnswered] = useState(false);

  const question = questions[current];

  function startWordWoods() {
    setCurrent(0);
    setMessage("");
    setAnswered(false);
    setScreen("wordwoods");
  }

  function checkAnswer(answer) {
    if (answered) return;

    if (answer === question.correct) {
      setXp((value) => value + 10);
      setMessage(`Rätt! ${question.correct} betyder ${question.translation}.`);
      setAnswered(true);
    } else {
      setMessage("Inte riktigt. Titta på bilden och försök igen.");
    }
  }

  function nextQuestion() {
    setMessage("");
    setAnswered(false);

    if (current < questions.length - 1) {
      setCurrent((value) => value + 1);
    } else {
      setScreen("finished");
    }
  }

  if (screen === "home") {
    return (
      <main className="page home-page">
        <section className="hero-panel">
          <div className="flag">🇬🇧</div>
          <div>
            <small>ETT ENGELSKÄVENTYR FÖR ÅRSKURS 4–6</small>
            <h1>Engelskamästarna</h1>
            <p>Lär dig engelska genom äventyr, återkoppling och smart repetition.</p>
          </div>
          <div className="xp-pill">⭐ {xp} XP</div>
        </section>

        <section className="weekly-card">
          <div className="weekly-icon">🎯</div>
          <div>
            <small>VECKANS UPPDRAG</small>
            <h2>Animals Week</h2>
            <p>Lär dig djurord och klara ditt första uppdrag.</p>
          </div>
          <button onClick={startWordWoods}>Starta</button>
        </section>

        <section className="world-grid">
          <button className="world-card word-card" onClick={startWordWoods}>
            <span>🌳</span>
            <div>
              <small>ORDKUNSKAP</small>
              <h2>Word Woods</h2>
              <p>Möt ord flera gånger och hämta dem aktivt ur minnet.</p>
              <b>Spela nu →</b>
            </div>
          </button>

          <button className="world-card grammar-card" disabled>
            <span>🏰</span>
            <div>
              <small>GRAMMATIK</small>
              <h2>Grammar Castle</h2>
              <p>Bygg meningar och öppna slottets portar.</p>
              <b>Kommer snart</b>
            </div>
          </button>

          <button className="world-card reading-card" disabled>
            <span>⚓</span>
            <div>
              <small>LÄSFÖRSTÅELSE</small>
              <h2>Reading Harbor</h2>
              <p>Läs brev, kartor och korta berättelser.</p>
              <b>Kommer snart</b>
            </div>
          </button>

          <button className="world-card conversation-card" disabled>
            <span>🎤</span>
            <div>
              <small>KOMMUNIKATION</small>
              <h2>Conversation City</h2>
              <p>Använd engelska för att hjälpa personer i staden.</p>
              <b>Kommer snart</b>
            </div>
          </button>
        </section>
      </main>
    );
  }

  if (screen === "wordwoods") {
    return (
      <main className="page game-page">
        <header className="game-header">
          <button className="back-button" onClick={() => setScreen("home")}>← Startsidan</button>
          <span>🌳 Word Woods</span>
          <strong>⭐ {xp} XP</strong>
        </header>

        <div className="progress-track">
          <i style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>

        <section className="question-card">
          <small>ANIMALS · FRÅGA {current + 1} AV {questions.length}</small>
          <div className="animal-emoji" aria-hidden="true">{question.emoji}</div>
          <h1>What is this?</h1>
          <p>Välj det engelska ordet.</p>

          <div className="answer-grid">
            {question.options.map((option) => (
              <button key={option} disabled={answered} onClick={() => checkAnswer(option)}>
                {option}
              </button>
            ))}
          </div>

          {message && (
            <div className={`feedback ${answered ? "correct" : "try-again"}`}>
              <h2>{answered ? "✅ Bra jobbat!" : "💡 Försök igen"}</h2>
              <p>{message}</p>
              {answered && <button onClick={nextQuestion}>Nästa fråga →</button>}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="page result-page">
      <section className="result-card">
        <div className="trophy">🏆</div>
        <small>WORD WOODS GENOMFÖRD</small>
        <h1>Animal Explorer</h1>
        <p>Du klarade alla fyra djurord och har låst upp ditt första märke.</p>
        <div className="badge">🏅 Animal Explorer</div>
        <div className="result-xp">⭐ {xp} XP</div>
        <div className="result-actions">
          <button onClick={startWordWoods}>Spela igen</button>
          <button className="secondary" onClick={() => setScreen("home")}>Till startsidan</button>
        </div>
      </section>
    </main>
  );
}
