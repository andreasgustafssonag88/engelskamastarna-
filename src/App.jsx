import { useEffect, useMemo, useState } from "react";
import "./styles.css";

const STORAGE_KEY = "engelskamastarna-v02";

const THEMES = {
  animals: {
    name: "Animals",
    icon: "🐾",
    color: "green",
    words: [
      ["🐶", "Dog", "hund"], ["🐱", "Cat", "katt"], ["🐴", "Horse", "häst"],
      ["🐻", "Bear", "björn"], ["🐰", "Rabbit", "kanin"], ["🦆", "Duck", "anka"]
    ]
  },
  school: {
    name: "School",
    icon: "🎒",
    color: "blue",
    words: [
      ["📘", "Book", "bok"], ["✏️", "Pencil", "blyertspenna"], ["📏", "Ruler", "linjal"],
      ["🪑", "Chair", "stol"], ["💻", "Computer", "dator"], ["🎒", "Backpack", "ryggsäck"]
    ]
  },
  food: {
    name: "Food",
    icon: "🍎",
    color: "orange",
    words: [
      ["🍎", "Apple", "äpple"], ["🍌", "Banana", "banan"], ["🥕", "Carrot", "morot"],
      ["🍞", "Bread", "bröd"], ["🧀", "Cheese", "ost"], ["🥛", "Milk", "mjölk"]
    ]
  },
  colours: {
    name: "Colours",
    icon: "🎨",
    color: "purple",
    words: [
      ["🔴", "Red", "röd"], ["🔵", "Blue", "blå"], ["🟢", "Green", "grön"],
      ["🟡", "Yellow", "gul"], ["🟣", "Purple", "lila"], ["🟠", "Orange", "orange"]
    ]
  }
};

const initialProgress = { xp: 0, badges: [], mastered: {}, mistakes: {}, sessions: 0 };
const shuffled = (items) => [...items].sort(() => Math.random() - 0.5);

function makeQuestions(themeKey, mistakes) {
  const theme = THEMES[themeKey];
  const weighted = theme.words.flatMap((word) => {
    const extra = Math.min(mistakes[`${themeKey}:${word[1]}`] || 0, 2);
    return Array(1 + extra).fill(word);
  });

  return shuffled(weighted).slice(0, 8).map((word, index) => {
    const distractors = shuffled(theme.words.filter((item) => item[1] !== word[1])).slice(0, 2);
    const reverse = index > 3 && index % 2 === 0;
    return {
      id: `${themeKey}-${index}-${word[1]}`,
      emoji: word[0], english: word[1], swedish: word[2], reverse,
      prompt: reverse ? `Vilket engelskt ord betyder “${word[2]}”?` : "What is this?",
      options: shuffled([word, ...distractors]).map((item) => item[1])
    };
  });
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [themeKey, setThemeKey] = useState("animals");
  const [progress, setProgress] = useState(() => {
    try { return { ...initialProgress, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
    catch { return initialProgress; }
  });
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [attemptedWrong, setAttemptedWrong] = useState(false);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)), [progress]);
  const theme = THEMES[themeKey];
  const question = questions[index];
  const level = Math.floor(progress.xp / 100) + 1;
  const nextLevelXp = level * 100;
  const levelPercent = Math.min(100, ((progress.xp % 100) / 100) * 100);

  const weakWords = useMemo(() => Object.entries(progress.mistakes)
    .filter(([, count]) => count > 0)
    .sort((a,b) => b[1]-a[1]).slice(0,3), [progress.mistakes]);

  function startTheme(key) {
    setThemeKey(key);
    setQuestions(makeQuestions(key, progress.mistakes));
    setIndex(0); setFeedback(null); setSessionCorrect(0); setAttemptedWrong(false);
    setScreen("game");
  }

  function answer(option) {
    if (feedback?.correct) return;
    const correct = option === question.english;
    const wordKey = `${themeKey}:${question.english}`;
    if (correct) {
      const gained = attemptedWrong ? 5 : 10;
      setProgress((old) => ({ ...old, xp: old.xp + gained,
        mastered: { ...old.mastered, [wordKey]: (old.mastered[wordKey] || 0) + 1 },
        mistakes: { ...old.mistakes, [wordKey]: Math.max(0, (old.mistakes[wordKey] || 0) - 1) }
      }));
      setSessionCorrect((value) => value + 1);
      setFeedback({ correct: true, text: `${question.english} betyder ${question.swedish}. +${gained} XP` });
    } else {
      setAttemptedWrong(true);
      setProgress((old) => ({ ...old, mistakes: { ...old.mistakes, [wordKey]: (old.mistakes[wordKey] || 0) + 1 } }));
      setFeedback({ correct: false, text: `Inte riktigt. Ordet börjar med ${question.english[0]}. Försök igen.` });
    }
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex((value) => value + 1); setFeedback(null); setAttemptedWrong(false);
    } else {
      const badge = `${theme.name} Explorer`;
      setProgress((old) => ({ ...old, sessions: old.sessions + 1,
        badges: sessionCorrect + 1 >= 6 && !old.badges.includes(badge) ? [...old.badges, badge] : old.badges
      }));
      setScreen("result");
    }
  }

  if (screen === "home") return <main className="page">
    <section className="hero-panel">
      <div className="flag">🇬🇧</div><div><small>ETT ENGELSKÄVENTYR FÖR ÅRSKURS 4–6</small>
      <h1>Engelskamästarna</h1><p>Ordträning med aktivt återkallande, återkoppling och smart repetition.</p></div>
      <div className="player-box"><b>Nivå {level}</b><span>⭐ {progress.xp} XP</span></div>
    </section>

    <section className="level-card"><div><b>Nästa nivå</b><span>{progress.xp} / {nextLevelXp} XP</span></div>
      <div className="level-track"><i style={{width:`${levelPercent}%`}} /></div></section>

    <section className="weekly-card"><span>🎯</span><div><small>VECKANS UPPDRAG</small><h2>Word Explorer</h2>
      <p>Genomför ett tema och samla minst 60 XP.</p></div><button onClick={() => startTheme("animals")}>Starta</button></section>

    <div className="section-title"><div><small>WORD WOODS</small><h2>Välj ordtema</h2></div><span>{Object.keys(progress.mastered).length} ord tränade</span></div>
    <section className="theme-grid">{Object.entries(THEMES).map(([key,item]) => {
      const practised = item.words.filter(w => progress.mastered[`${key}:${w[1]}`]).length;
      return <button className={`theme-card ${item.color}`} key={key} onClick={() => startTheme(key)}>
        <span>{item.icon}</span><div><small>6 ORD · 8 FRÅGOR</small><h2>{item.name}</h2>
        <p>{practised}/6 ord tränade</p><b>Öppna temat →</b></div></button>})}</section>

    <section className="coming-grid">
      <article><span>🏰</span><div><small>KOMMER SNART</small><h3>Grammar Castle</h3><p>Bygg korrekta meningar.</p></div></article>
      <article><span>⚓</span><div><small>KOMMER SNART</small><h3>Reading Harbor</h3><p>Läs och förstå korta texter.</p></div></article>
      <article><span>🎤</span><div><small>KOMMER SNART</small><h3>Conversation City</h3><p>Använd engelska i dialoger.</p></div></article>
    </section>

    <section className="memory-card"><span>🧠</span><div><small>ENGELSKAMINNET</small><h2>Smart repetition</h2>
      {weakWords.length ? <p>Ord som återkommer oftare: {weakWords.map(([key]) => key.split(":")[1]).join(", ")}.</p>
      : <p>När ett ord blir svårt sparas det och återkommer oftare i nästa pass.</p>}</div></section>
  </main>;

  if (screen === "game" && question) return <main className="page game-page">
    <header className="game-header"><button onClick={() => setScreen("home")}>← Startsidan</button>
      <span>{theme.icon} {theme.name}</span><strong>⭐ {progress.xp} XP</strong></header>
    <div className="progress-track"><i style={{width:`${((index+1)/questions.length)*100}%`}} /></div>
    <section className="question-card"><small>{theme.name.toUpperCase()} · FRÅGA {index+1} AV {questions.length}</small>
      {!question.reverse && <div className="word-emoji">{question.emoji}</div>}
      <h1>{question.prompt}</h1><p>{question.reverse ? "Hämta ordet ur minnet." : "Välj det engelska ordet."}</p>
      <div className="answer-grid">{question.options.map(option => <button key={option}
        disabled={feedback?.correct} onClick={() => answer(option)}>{option}</button>)}</div>
      {feedback && <div className={`feedback ${feedback.correct?"correct":"retry"}`}>
        <h2>{feedback.correct?"✅ Bra jobbat!":"💡 Tänk en gång till"}</h2><p>{feedback.text}</p>
        {feedback.correct && <button onClick={next}>{index === questions.length-1 ? "Se resultat" : "Nästa fråga →"}</button>}
      </div>}
    </section>
  </main>;

  const total = questions.length;
  const badgeEarned = sessionCorrect >= 6;
  return <main className="page result-page"><section className="result-card"><div className="trophy">{badgeEarned?"🏆":"🧭"}</div>
    <small>WORD WOODS GENOMFÖRD</small><h1>{theme.name}</h1><p className="score">{sessionCorrect} av {total} rätt</p>
    <section><h2>🌟 Det här kan du</h2><p>Du har tränat på att känna igen och aktivt minnas engelska ord inom {theme.name.toLowerCase()}.</p></section>
    <section><h2>🔁 Ditt nästa steg</h2><p>{sessionCorrect === total ? "Prova ett nytt tema eller spela igen för att befästa orden över tid." : "Spela temat igen. Ord som var svåra kommer tillbaka oftare."}</p></section>
    {badgeEarned && <div className="badge">🏅 {theme.name} Explorer</div>}
    <div className="result-actions"><button onClick={() => startTheme(themeKey)}>Spela igen</button>
      <button className="secondary" onClick={() => setScreen("home")}>Till startsidan</button></div>
  </section></main>;
}
