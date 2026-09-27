import { useEffect, useMemo, useState } from "react";
import "./styles.css";

const STORAGE_KEY = "engelskamastarna-v03";
const LEVELS = {
  1: { name: "Upptäck", icon: "🌱", text: "Bildstöd och vanliga ord" },
  2: { name: "Minns", icon: "🌿", text: "Svenska till engelska" },
  3: { name: "Använd", icon: "🔥", text: "Ord i meningar och sammanhang" }
};

const WORD_THEMES = {
  animals: { name:"Animals", icon:"🐾", color:"green", levels:{
    1:[["🐶","Dog","hund","The ___ is friendly."],["🐱","Cat","katt","The ___ is sleeping."],["🐴","Horse","häst","The ___ runs fast."],["🐰","Rabbit","kanin","The ___ has long ears."],["🐻","Bear","björn","The ___ is big."],["🦆","Duck","anka","The ___ can swim."]],
    2:[["🦊","Fox","räv","The ___ has a red tail."],["🐺","Wolf","varg","The ___ lives in a pack."],["🐑","Sheep","får","The ___ has wool."],["🐐","Goat","get","The ___ climbs well."],["🐭","Mouse","mus","The ___ is very small."],["🐸","Frog","groda","The ___ can jump."]],
    3:[["🦅","Eagle","örn","The ___ flies high."],["🦉","Owl","uggla","The ___ is awake at night."],["🦌","Deer","hjort","The ___ lives in the forest."],["🪽","Wing","vinge","The bird hurt its ___."],["🐕","Tail","svans","The dog moves its ___."],["🐞","Insect","insekt","A butterfly is an ___."]]
  }},
  school: { name:"School", icon:"🎒", color:"blue", levels:{
    1:[["📘","Book","bok","Open your ___."],["✏️","Pencil","blyertspenna","Write with a ___."],["📏","Ruler","linjal","Use a ___ to measure."],["🪑","Chair","stol","Sit on the ___."],["💻","Computer","dator","Turn on the ___."],["🎒","Backpack","ryggsäck","My books are in my ___."]],
    2:[["📓","Notebook","anteckningsbok","Write in your ___."],["🧑‍🏫","Teacher","lärare","The ___ helps the class."],["🏫","Classroom","klassrum","We learn in the ___."],["✂️","Scissors","sax","Cut the paper with ___."],["◻️","Eraser","suddgummi","Use an ___ to remove it."],["🪵","Desk","skolbänk","Put the book on the ___."]],
    3:[["📝","Homework","läxa","I do my ___ after school."],["📚","Subject","skolämne","English is my favourite ___."],["🗓️","Timetable","schema","Check the ___ for Monday."],["📄","Assignment","uppgift","Finish the ___ today."],["🔔","Lesson","lektion","The English ___ starts now."],["🧪","Project","projekt","We made a science ___."]]
  }},
  food: { name:"Food", icon:"🍎", color:"orange", levels:{
    1:[["🍎","Apple","äpple","I eat an ___."],["🍌","Banana","banan","The ___ is yellow."],["🍞","Bread","bröd","I have ___ for breakfast."],["🥛","Milk","mjölk","Pour the ___ into a glass."],["🧀","Cheese","ost","Put ___ on the sandwich."],["🥕","Carrot","morot","A ___ is orange."]],
    2:[["🍊","Orange","apelsin","Peel the ___."],["🥪","Sandwich","smörgås","I packed a ___."],["🧃","Juice","juice","Would you like some ___?"],["🥔","Potato","potatis","The ___ grows in the ground."],["🍅","Tomato","tomat","Slice the ___."],["🌭","Sausage","korv","The ___ is hot."]],
    3:[["🥣","Breakfast","frukost","I eat ___ in the morning."],["🍱","Lunch","lunch","We have ___ at noon."],["🍽️","Dinner","middag","The family eats ___ together."],["🍰","Dessert","efterrätt","Cake is a ___."],["🥦","Vegetable","grönsak","Broccoli is a ___."],["🧂","Ingredient","ingrediens","Flour is an ___."]]
  }},
  colours: { name:"Colours", icon:"🎨", color:"purple", levels:{
    1:[["🔴","Red","röd","The apple is ___."],["🔵","Blue","blå","The sky is ___."],["🟢","Green","grön","The grass is ___."],["🟡","Yellow","gul","The sun is ___."],["🟣","Purple","lila","The flower is ___."],["🟠","Orange","orange","The carrot is ___."]],
    2:[["⚫","Black","svart","The night is ___."],["⚪","White","vit","Snow is ___."],["🟤","Brown","brun","The bear is ___."],["🌸","Pink","rosa","The flower is ___."],["🌫️","Grey","grå","The cloud is ___."],["🏅","Gold","guld","The medal is ___."]],
    3:[["🥈","Silver","silver","The coin is ___."],["💡","Bright","ljus/stark","The light is ___."],["🌑","Dark","mörk","The room is ___."],["🌈","Colourful","färgglad","The picture is ___."],["🩵","Pale","blek/ljus","The wall is ___ blue."],["🔦","Light","ljus","Choose a ___ colour."]]
  }}
};

const READING = {
  support:{name:"Träna",icon:"🌱",color:"green",texts:[
    {title:"Sam's backpack",skill:"explicit",text:"Sam has a new backpack. It is blue and green. Every day he takes it to school. Inside the backpack there is a book, a pencil and a red lunch box.",questions:[
      ["What colours are the backpack?",["Blue and green","Red and yellow","Black and white"],"Blue and green","Läs meningen som beskriver ryggsäcken."],
      ["Where does Sam take the backpack?",["To school","To the park","To the shop"],"To school","Leta efter orden every day."],
      ["What is inside the backpack?",["A book","A football","A jacket"],"A book","Läs den sista meningen igen."]]},
    {title:"Mia's morning",skill:"sequence",text:"Mia gets up at seven o'clock. First, she eats breakfast. Then she brushes her teeth. At eight o'clock, she walks to school with her friend Leo.",questions:[
      ["When does Mia get up?",["At seven","At eight","At nine"],"At seven","Svaret finns i första meningen."],
      ["What does Mia do after breakfast?",["She brushes her teeth","She goes to bed","She reads a book"],"She brushes her teeth","Titta på ordet Then."],
      ["Who walks with Mia?",["Leo","Sam","Her teacher"],"Leo","Läs den sista meningen."]]},
    {title:"The small dog",skill:"explicit",text:"Ben has a small brown dog called Max. Max likes to play with a yellow ball in the garden. When it rains, Max sleeps under the kitchen table.",questions:[
      ["What is the dog's name?",["Max","Ben","Leo"],"Max","Namnet står i första meningen."],
      ["What colour is the ball?",["Yellow","Brown","Blue"],"Yellow","Läs meningen om leken."],
      ["Where does Max sleep when it rains?",["Under the kitchen table","In the garden","On the sofa"],"Under the kitchen table","Läs sista meningen."]]}
  ]},
  base:{name:"Utmaning",icon:"🌿",color:"blue",texts:[
    {title:"The locked classroom",skill:"inference",text:"Emma noticed that her homework was not in her backpack during lunch. She remembered leaving it on her desk, so she hurried back to the classroom. When she arrived, the door was locked. Emma went to find a teacher who could help her.",questions:[
      ["Why did Emma go back?",["To get her homework","To eat lunch","To meet a friend"],"To get her homework","Vad saknades i ryggsäcken?"],
      ["Where was the homework probably left?",["On her desk","In the library","At home"],"On her desk","Emma remembered a specific place."],
      ["What did Emma do last?",["She looked for a teacher","She ate lunch","She opened the door"],"She looked for a teacher","Följ händelserna i ordning."],
      ["Why did Emma need help?",["The door was locked","She was lost","Her backpack was heavy"],"The door was locked","Koppla ihop de två sista meningarna."]]},
    {title:"A rainy match",skill:"cause",text:"The football team planned to practise outside after school. Dark clouds appeared before the lesson ended, and soon heavy rain covered the field. The coach moved the practice into the sports hall. The players could not practise long passes, but they worked on balance and quick turns instead.",questions:[
      ["Why did the team go inside?",["Because of the rain","Because it was dark","Because the coach was late"],"Because of the rain","Vad hände med planen?"],
      ["Where did they practise?",["In the sports hall","In the classroom","At home"],"In the sports hall","Platsen står i tredje meningen."],
      ["What could they not practise?",["Long passes","Quick turns","Balance"],"Long passes","Leta efter could not."],
      ["Which word shows contrast?",["but","soon","after"],"but","Ordet binder ihop två olika idéer."]]},
    {title:"The library message",skill:"context",text:"A sign at the library says: 'The children's section will close at 16:00 today. Please return borrowed books at the front desk. The rest of the library remains open until 18:00.' Noah arrives at 16:30 with two books to return.",questions:[
      ["Which section is closed when Noah arrives?",["The children's section","The whole library","The front desk"],"The children's section","Jämför tiden 16:30 med 16:00."],
      ["Where should Noah return the books?",["At the front desk","In the children's section","Outside"],"At the front desk","Följ instruktionen på skylten."],
      ["Is the whole library closed?",["No","Yes","The text does not say"],"No","Läs den sista meningen på skylten."],
      ["What does remains open mean?",["continues to be open","closes early","opens tomorrow"],"continues to be open","Använd resten av meningen som ledtråd."]]}
  ]},
  expert:{name:"Expert",icon:"🔥",color:"purple",texts:[
    {title:"The delayed museum trip",skill:"inference",text:"Class 5B had planned to arrive at the science museum before ten. Their bus left school on time, but road work caused a long queue near the city centre. When the class finally arrived, the planetarium show had already started. The guide offered them seats for a later show, so the class explored the space exhibition first.",questions:[
      ["Why did the class arrive late?",["Road work delayed the bus","The bus left late","The museum opened late"],"Road work delayed the bus","Skilj mellan när bussen åkte och vad som hände på vägen."],
      ["What had already begun?",["The planetarium show","The space exhibition","Lunch"],"The planetarium show","Leta efter had already started."],
      ["What did the class do first at the museum?",["Explored the space exhibition","Watched the later show","Went home"],"Explored the space exhibition","Vad gjorde gruppen medan gruppen väntade?"],
      ["What does finally suggest?",["They had waited a long time","They arrived early","They changed buses"],"They had waited a long time","Tänk på varför författaren använder finally."],
      ["Which sentence best summarises the text?",["A delay changed the order of the class visit","The class cancelled the trip","The museum had no exhibitions"],"A delay changed the order of the class visit","Välj alternativet som täcker hela texten."]]},
    {title:"The community garden",skill:"purpose",text:"Residents created a community garden on an unused piece of land. Families grow vegetables there, while a local café collects rainwater for the plants. The garden also includes benches and a small insect hotel. According to the organisers, the aim is not only to grow food but also to give neighbours a place to meet and learn from one another.",questions:[
      ["What was the land used for before?",["It was unused","It was a café","It was a playground"],"It was unused","Läs första meningen noga."],
      ["Who collects rainwater?",["A local café","The families","The organisers"],"A local café","Leta efter while."],
      ["Why are there benches?",["To give people a place to meet","To grow vegetables","To store water"],"To give people a place to meet","Koppla föremålet till syftet i sista meningen."],
      ["What is the main purpose of the garden?",["Food, learning and community","Only growing food","Selling furniture"],"Food, learning and community","Not only ... but also visar flera syften."],
      ["Which feature helps wildlife?",["The insect hotel","The benches","The café"],"The insect hotel","Vilken plats är skapad för små djur?"]]},
    {title:"The missing bicycle",skill:"evidence",text:"When Alex left the swimming pool, the bicycle rack was almost empty. The blue bicycle was not where Alex had left it. For a moment, Alex thought it had been stolen. Then Alex noticed another rack beside the sports hall and remembered moving the bicycle there because the first rack had been full earlier. The bicycle was still safely locked.",questions:[
      ["Why did Alex first think the bicycle was stolen?",["It was not at the first rack","The lock was broken","Someone gave a warning"],"It was not at the first rack","Vad såg Alex direkt efter simningen?"],
      ["Why had Alex moved the bicycle?",["The first rack had been full","It had started raining","The sports hall was closer"],"The first rack had been full","Orsaken finns nära slutet."],
      ["Where was the bicycle?",["Beside the sports hall","Inside the swimming pool","At home"],"Beside the sports hall","Leta efter another rack."],
      ["What changed Alex's understanding?",["Remembering the earlier move","Finding a broken lock","Talking to a teacher"],"Remembering the earlier move","Vilken ny information löser problemet?"],
      ["What is the best lesson from the story?",["Check the facts before deciding what happened","Never use a bicycle rack","Always leave the pool early"],"Check the facts before deciding what happened","Välj budskapet som passar hela händelsen."]]}
  ]}
};

const EMPTY={xp:0,badges:[],wordMastery:{},wordErrors:{},readingSkills:{explicit:{ok:0,total:0},sequence:{ok:0,total:0},inference:{ok:0,total:0},cause:{ok:0,total:0},context:{ok:0,total:0},purpose:{ok:0,total:0},evidence:{ok:0,total:0}}};
const shuffle=a=>[...a].sort(()=>Math.random()-.5);

function App(){
 const [screen,setScreen]=useState("home"),[progress,setProgress]=useState(()=>{try{return{...EMPTY,...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}}catch{return EMPTY}});
 const [themeKey,setThemeKey]=useState("animals"),[wordLevel,setWordLevel]=useState(1),[wordQs,setWordQs]=useState([]),[idx,setIdx]=useState(0),[feedback,setFeedback]=useState(null),[score,setScore]=useState(0),[wrong,setWrong]=useState(false);
 const [readingLevel,setReadingLevel]=useState("support"),[textIndex,setTextIndex]=useState(0),[readQ,setReadQ]=useState(0),[readRecords,setReadRecords]=useState([]);
 useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(progress)),[progress]);
 const level=Math.floor(progress.xp/150)+1;

 function makeWordQuestions(key,lvl){const words=WORD_THEMES[key].levels[lvl];return shuffle(words).slice(0,6).map((w,i)=>({w,mode:lvl===1?"image":lvl===2?(i%2?"sv":"image"):"sentence",options:shuffle([w,...shuffle(words.filter(x=>x[1]!==w[1])).slice(0,2)]).map(x=>x[1])}));}
 function openWord(key){setThemeKey(key);setScreen("wordlevels")}
 function startWords(lvl){setWordLevel(lvl);setWordQs(makeWordQuestions(themeKey,lvl));setIdx(0);setScore(0);setWrong(false);setFeedback(null);setScreen("wordgame")}
 function wordAnswer(ans){if(feedback?.ok)return;const q=wordQs[idx],ok=ans===q.w[1],id=`${themeKey}:${wordLevel}:${q.w[1]}`;if(ok){let gain=wrong?5:10;setScore(s=>s+1);setProgress(p=>({...p,xp:p.xp+gain,wordMastery:{...p.wordMastery,[id]:(p.wordMastery[id]||0)+1},wordErrors:{...p.wordErrors,[id]:Math.max(0,(p.wordErrors[id]||0)-1)}}));setFeedback({ok:true,text:`${q.w[1]} betyder ${q.w[2]}. +${gain} XP`})}else{setWrong(true);setProgress(p=>({...p,wordErrors:{...p.wordErrors,[id]:(p.wordErrors[id]||0)+1}}));setFeedback({ok:false,text:`Inte riktigt. Ordet börjar med ${q.w[1][0]}.`})}}
 function nextWord(){if(idx<wordQs.length-1){setIdx(i=>i+1);setWrong(false);setFeedback(null)}else setScreen("wordresult")}
 function openReading(lvl){setReadingLevel(lvl);setScreen("readingtexts")}
 function startText(i){setTextIndex(i);setReadQ(0);setReadRecords([]);setFeedback(null);setWrong(false);setScreen("readinggame")}
 function readingAnswer(ans){if(feedback?.ok)return;const t=READING[readingLevel].texts[textIndex],q=t.questions[readQ],ok=ans===q[2];if(ok){setReadRecords(r=>[...r,{ok:true,supported:wrong}]);setProgress(p=>{let old=p.readingSkills[t.skill]||{ok:0,total:0};return{...p,xp:p.xp+(wrong?7:12),readingSkills:{...p.readingSkills,[t.skill]:{ok:old.ok+1,total:old.total+1}}}});setFeedback({ok:true,text:`Rätt! ${wrong?"Du hittade svaret med hjälp av ledtråden.":"Du hittade svaret självständigt."}`})}else{setWrong(true);setFeedback({ok:false,text:q[3]})}}
 function nextRead(){const t=READING[readingLevel].texts[textIndex];if(readQ<t.questions.length-1){setReadQ(i=>i+1);setFeedback(null);setWrong(false)}else setScreen("readingresult")}

 if(screen==="home")return <main className="page"><Hero progress={progress} level={level}/><div className="main-grid">
  <button className="area-card woods" onClick={()=>setScreen("wordthemes")}><span>🌳</span><div><small>ORDKUNSKAP</small><h2>Word Woods</h2><p>Fyra teman, tre nivåer och 72 ord.</p><b>Utforska skogen →</b></div></button>
  <button className="area-card harbor" onClick={()=>setScreen("readinglevels")}><span>⚓</span><div><small>LÄSFÖRSTÅELSE</small><h2>Reading Harbor</h2><p>Nio texter med stegvis stöd och tre svårighetsgrader.</p><b>Gå till hamnen →</b></div></button>
  <button className="area-card locked"><span>🏰</span><div><small>KOMMER SNART</small><h2>Grammar Castle</h2><p>Bygg meningar och öppna portar.</p></div></button>
  <button className="area-card locked"><span>🎤</span><div><small>KOMMER SNART</small><h2>Conversation City</h2><p>Använd engelska i dialoger.</p></div></button></div><Memory progress={progress}/></main>;

 if(screen==="wordthemes")return <Shell title="🌳 Word Woods" back={()=>setScreen("home")}><div className="intro"><small>72 ORD · 3 NIVÅER</small><h1>Välj tema</h1><p>Orden låses upp i små grupper och används på allt mer avancerade sätt.</p></div><div className="theme-grid">{Object.entries(WORD_THEMES).map(([k,t])=><button className={`theme-card ${t.color}`} key={k} onClick={()=>openWord(k)}><span>{t.icon}</span><div><h2>{t.name}</h2><p>18 ord</p><b>Välj nivå →</b></div></button>)}</div></Shell>;
 if(screen==="wordlevels"){let t=WORD_THEMES[themeKey];return <Shell title={`${t.icon} ${t.name}`} back={()=>setScreen("wordthemes")}><div className="intro"><small>WORD WOODS</small><h1>Välj svårighetsgrad</h1></div><div className="level-grid">{Object.entries(LEVELS).map(([k,l])=><button key={k} onClick={()=>startWords(+k)}><span>{l.icon}</span><h2>Nivå {k}: {l.name}</h2><p>{l.text}</p><b>{t.levels[k].map(x=>x[1]).join(" · ")}</b></button>)}</div></Shell>}
 if(screen==="wordgame"){let q=wordQs[idx];return <Shell title={`${WORD_THEMES[themeKey].icon} ${LEVELS[wordLevel].name}`} back={()=>setScreen("wordlevels")}><Progress now={idx+1} total={wordQs.length}/><article className="game-card"><small>ORD {idx+1} AV {wordQs.length}</small>{q.mode==="image"&&<div className="big-emoji">{q.w[0]}</div>}<h1>{q.mode==="image"?"What is this?":q.mode==="sv"?`Vilket ord betyder “${q.w[2]}”?`:q.w[3]}</h1><p>{q.mode==="sentence"?"Välj ordet som passar i luckan.":"Hämta ordet ur minnet."}</p><Choices items={q.options} choose={wordAnswer} disabled={feedback?.ok}/>{feedback&&<Feedback data={feedback} next={feedback.ok?nextWord:null}/>}</article></Shell>}
 if(screen==="wordresult")return <Result icon={score>=5?"🏆":"🧭"} title={`${WORD_THEMES[themeKey].name} · ${LEVELS[wordLevel].name}`} score={`${score} av ${wordQs.length} ord`} can="Du har tränat på att känna igen, minnas och använda engelska ord." next={score===wordQs.length?"Prova nästa nivå eller ett nytt tema.":"Spela samma nivå igen. Svåra ord finns sparade i Engelskaminne."} replay={()=>startWords(wordLevel)} home={()=>setScreen("home")}/>;

 if(screen==="readinglevels")return <Shell title="⚓ Reading Harbor" back={()=>setScreen("home")}><div className="intro"><small>LÄSFÖRSTÅELSE</small><h1>Välj hamn</h1><p>Läs korta texter och få riktade ledtrådar när du behöver stöd.</p></div><div className="level-grid">{Object.entries(READING).map(([k,l])=><button key={k} onClick={()=>openReading(k)}><span>{l.icon}</span><h2>{l.name}</h2><p>{k==="support"?"Tydlig information och ordningsföljd.":k==="base"?"Sammanhang, orsak och enkel inferens.":"Syfte, evidens och djupare slutsatser."}</p><b>3 texter</b></button>)}</div></Shell>;
 if(screen==="readingtexts"){let l=READING[readingLevel];return <Shell title={`${l.icon} Reading Harbor · ${l.name}`} back={()=>setScreen("readinglevels")}><div className="intro"><small>{l.name.toUpperCase()}</small><h1>Välj text</h1></div><div className="text-list">{l.texts.map((t,i)=><button key={t.title} onClick={()=>startText(i)}><span>📖</span><div><small>TEXT {i+1}</small><h2>{t.title}</h2><p>{t.questions.length} frågor · {t.skill}</p></div><b>Öppna →</b></button>)}</div></Shell>}
 if(screen==="readinggame"){let t=READING[readingLevel].texts[textIndex],q=t.questions[readQ];return <Shell title={`⚓ ${t.title}`} back={()=>setScreen("readingtexts")}><Progress now={readQ+1} total={t.questions.length}/><div className="reading-workspace"><article className="reading-text"><small>LÄS TEXTEN</small><h1>{t.title}</h1><p>{t.text}</p></article><article className="reading-question"><small>FRÅGA {readQ+1} AV {t.questions.length}</small><h2>{q[0]}</h2><Choices items={q[1]} choose={readingAnswer} disabled={feedback?.ok}/>{feedback&&<Feedback data={feedback} next={feedback.ok?nextRead:null}/>}</article></div></Shell>}
 if(screen==="readingresult"){let t=READING[readingLevel].texts[textIndex],correct=readRecords.filter(x=>x.ok).length,supported=readRecords.filter(x=>x.supported).length;return <Result icon={correct===t.questions.length?"🏆":"📚"} title={t.title} score={`${correct} av ${t.questions.length} rätt`} can={`Du tränade ${skillName(t.skill)}. ${correct-supported} svar klarades självständigt.`} next={supported?"Läs nästa text på samma nivå och försök hitta ledtrådarna självständigt.":"Du kan prova nästa text eller en högre nivå."} replay={()=>startText(textIndex)} home={()=>setScreen("home")}/>}
}

const skillName=s=>({explicit:"att hitta tydlig information",sequence:"att förstå ordningsföljd",inference:"att dra slutsatser",cause:"att förstå orsak",context:"att förstå ord genom sammanhang",purpose:"att förstå syfte",evidence:"att använda bevis i texten"}[s]||s);
function Hero({progress,level}){return <><section className="hero"><span>🇬🇧</span><div><small>ETT ENGELSKÄVENTYR FÖR ÅRSKURS 4–6</small><h1>Engelskamästarna</h1><p>Ord, läsning och smart repetition i ett sammanhängande spel.</p></div><strong>Nivå {level}<br/>⭐ {progress.xp} XP</strong></section><div className="xpbar"><i style={{width:`${(progress.xp%150)/1.5}%`}}/></div></>}
function Shell({title,back,children}){return <main className="page"><header className="top"><button onClick={back}>← Tillbaka</button><b>{title}</b><span/></header>{children}</main>}
function Progress({now,total}){return <div className="progress"><span>{now} av {total}</span><div><i style={{width:`${now/total*100}%`}}/></div></div>}
function Choices({items,choose,disabled}){return <div className="choices">{items.map(x=><button key={x} disabled={disabled} onClick={()=>choose(x)}>{x}</button>)}</div>}
function Feedback({data,next}){return <div className={`feedback ${data.ok?"right":"hint"}`}><h3>{data.ok?"✅ Bra arbetat!":"💡 Läs och tänk igen"}</h3><p>{data.text}</p>{next&&<button onClick={next}>Fortsätt →</button>}</div>}
function Result({icon,title,score,can,next,replay,home}){return <main className="page result"><article><span>{icon}</span><small>PASS GENOMFÖRT</small><h1>{title}</h1><b>{score}</b><section><h2>🌟 Det här kan du</h2><p>{can}</p></section><section><h2>🎯 Ditt nästa steg</h2><p>{next}</p></section><div><button onClick={replay}>Spela igen</button><button className="secondary" onClick={home}>Startsidan</button></div></article></main>}
function Memory({progress}){let skills=Object.entries(progress.readingSkills||{}).filter(([,v])=>v.total>0);let weak=Object.entries(progress.wordErrors||{}).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]).slice(0,4);return <section className="memory"><span>🧠</span><div><small>ENGELSKAMINNET</small><h2>Din personliga repetition</h2>{!skills.length&&!weak.length?<p>Spela Word Woods eller Reading Harbor så börjar spelet bygga din lärprofil.</p>:<><p>{weak.length?`Ord att repetera: ${weak.map(([k])=>k.split(":").pop()).join(", ")}.`:"Inga ord väntar på repetition."}</p><p>{skills.length?`Läsförmågor tränade: ${skills.map(([k])=>skillName(k)).join(", ")}.`:"Läs en text för att utveckla din läsprofil."}</p></>}</div></section>}
export default App;
