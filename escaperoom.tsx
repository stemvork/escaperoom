import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, Timer, AlertCircle } from 'lucide-react';

// INFO: room { title, story, type, correctAnswer, hint }
const rooms = [
  {
    title: "Kamer 1: De Evenwijdige Lijnen",
    story: "Je bent opgesloten in het laboratorium van Professor Linearis. Op het whiteboard staat: 'Lijn k gaat door punten P(-3, 8) en Q(5, -4). Lijn m is evenwijdig aan k en gaat door R(2, 10).'",
    question: "Wat is de b-waarde van lijn m? (alleen het getal, positief of negatief)",
    type: "input",
    correctAnswer: "13",
    hint: "Eerst rc van k: (-4-8)/(5-(-3)) = -12/8 = -1,5. Dan m: y = -1,5x + b, vul (2,10) in: 10 = -1,5(2) + b, dus 10 = -3 + b"
  },
  {
    title: "Kamer 2: De Vergelijking px + qy = r",
    story: "Een mysterieus scherm toont: '3x - 4y = 24'. Je moet de lijn tekenen in je hoofd...",
    question: "Bij welke x-waarde snijdt deze lijn de x-as? (alleen het getal)",
    type: "input",
    correctAnswer: "8",
    hint: "Bij de x-as geldt y = 0. Vul in: 3x - 4(0) = 24, dus 3x = 24, dus x = 8"
  },
  {
    title: "Kamer 3: Het Stelsel Vergelijkingen",
    story: "De professor koopt fruit. Eerst: 4 appels en 2 peren voor €8,60. Later: 3 appels en 5 peren voor €11,75.",
    question: "Hoeveel kost één appel? (gebruik komma, bijvoorbeeld: 1,39)",
    type: "input",
    correctAnswer: "1,39",
    hint: "Stel 4x + 2y = 8,60 en 3x + 5y = 11,75. Vermenigvuldig eerste met 5: 20x + 10y = 43. Vermenigvuldig tweede met 2: 6x + 10y = 23,50. Trek tweede van eerste af: 14x = 19,50, dus x = 1,39"
  },
  {
    title: "Kamer 4: De Ongelijkheid",
    story: "Taxibedrijf A: K = 1,8d + 15. Taxibedrijf B: K = 2,5d + 8. (K in euro, d in km)",
    question: "Vanaf hoeveel hele kilometers is A goedkoper dan B? (alleen het getal)",
    type: "input",
    correctAnswer: "11",
    hint: "Los op: 1,8d + 15 < 2,5d + 8. Dus 7 < 0,7d, dus d > 10. Vanaf d = 11 is A goedkoper"
  },
  {
    title: "Kamer 5: Lineair Interpoleren",
    story: "Op 1 januari 2018 waren er 240 bomen. Op 1 januari 2023 waren er 315 bomen. Lineair verband tussen jaar en aantal.",
    question: "Hoeveel bomen waren er op 1 januari 2020? (alleen het getal)",
    type: "input",
    correctAnswer: "270",
    hint: "In 5 jaar 75 erbij = 15 per jaar. Van 1 jan 2018 naar 1 jan 2020 is 2 jaar: 240 + 2×15 = 270"
  },
  {
    title: "Kamer 6: Het Lineaire Model",
    story: "Een zwembad wordt geleegd. Na 2 uur: 850 liter. Na 5 uur: 640 liter. Lineair verband tussen t (uren) en I (liters).",
    question: "Hoeveel liter zat er bij t = 0? (alleen het getal)",
    type: "input",
    correctAnswer: "990",
    hint: "a = (640-850)/(5-2) = -70. Formule: I = -70t + b. Vul (2, 850) in: 850 = -140 + b, dus b = 990"
  },
  {
    title: "Kamer 7: Lineair Extrapoleren",
    story: "Bij 20°C is de druk 105 kPa, bij 35°C is de druk 120 kPa. Lineair verband tussen T en P.",
    question: "Wat is de druk bij 50°C? (alleen het getal)",
    type: "input",
    correctAnswer: "135",
    hint: "a = (120-105)/(35-20) = 1. Formule: P = T + b. Vul (20,105) in: b = 85. Bij T = 50: P = 50 + 85 = 135"
  },
  {
    title: "Kamer 8: De Ultieme Puzzel",
    story: "FINALE! Lijn p door A(4, 10) en B(12, 2). Lijn q is verticaal door x = -2. Wat is de y-coördinaat van het snijpunt?",
    question: "Bereken de y-coördinaat (alleen het getal)",
    type: "input",
    correctAnswer: "18",
    hint: "Voor p: rc = (2-10)/(12-4) = -1. Formule: y = -x + b. Vul (4,10) in: 10 = -4 + b, dus b = 14. Bij x = -2: y = 2 + 14 = 18"
  }
];

export default function LinearEscapeRoom() {
  // TODO: extract default values into variables
  const [currentRoom, setCurrentRoom] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2400); // 40 minuten
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintAvailable, setHintAvailable] = useState(false);
  const [hintTimer, setHintTimer] = useState(90);

  useEffect(() => {
    if (gameStarted && !gameWon && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0) {
      setFeedback('⏰ Tijd is op! Probeer het opnieuw.');
    }
  }, [gameStarted, gameWon, timeLeft]);

  // Hint timer per kamer
  useEffect(() => {
    if (gameStarted && !gameWon) {
      setHintAvailable(false);
      setHintTimer(90);
      setShowHint(false);
      
      const hintCountdown = setInterval(() => {
        setHintTimer(prev => {
          if (prev <= 1) {
            setHintAvailable(true);
            clearInterval(hintCountdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(hintCountdown);
    }
  }, [currentRoom, gameStarted, gameWon]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkAnswer = () => {
    const userAnswer = answers[currentRoom]?.toLowerCase().replace(/\s/g, '');
    const correctAnswer = rooms[currentRoom].correctAnswer.toLowerCase().replace(/\s/g, '');
    
    if (userAnswer === correctAnswer) {
      setFeedback('✅ Correct! De deur gaat open...');
      setTimeout(() => {
        if (currentRoom < rooms.length - 1) {
          setCurrentRoom(currentRoom + 1);
          setFeedback('');
          setShowHint(false);
        } else {
          setGameWon(true);
        }
      }, 1500);
    } else {
      // TODO: long term possibility: provide feedback based on answer
      setFeedback('❌ Dat is niet correct. Probeer het opnieuw!');
    }
  };

  // TODO: extract into gameStarted function
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl text-white">
          <h1 className="text-4xl font-bold mb-4 text-center">🔐 Lineaire Verbanden Escape Room</h1>
          <div className="space-y-4 mb-6">
            <p className="text-lg">Welkom, wiskundige detective!</p>
            <p>Professor Linearis is verdwenen en heeft je opgesloten in zijn laboratorium. De enige manier om te ontsnappen is door zijn lineaire puzzels op te lossen.</p>
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <p className="font-semibold">⏱️ Je hebt 40 minuten om te ontsnappen!</p>
              <p className="text-sm mt-2">Los 8 uitdagende kamers op met complexe vragen over lineaire verbanden op 4 havo niveau.</p>
            </div>
          </div>
          <button
            onClick={() => setGameStarted(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all transform hover:scale-105"
          >
            Start Escape Room
          </button>
        </div>
      </div>
    );
  }

  // TODO: extract into gameWon function
  if (gameWon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl text-white text-center">
          <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-400" />
          <h1 className="text-4xl font-bold mb-4">🎉 Gefeliciteerd!</h1>
          <p className="text-xl mb-4">Je bent ontsnapt uit het laboratorium!</p>
          <p className="text-lg mb-2">Tijd over: {formatTime(timeLeft)}</p>
          <p className="mt-6">Je hebt bewezen dat je een meester bent in lineaire verbanden!</p>
          <button
            onClick={() => {
              setGameStarted(false);
              setGameWon(false);
              setCurrentRoom(0);
              setTimeLeft(1200);
              setAnswers({});
              setFeedback('');
            }}
            className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Speel Opnieuw
          </button>
        </div>
      </div>
    );
  }

  // TODO: extract into gameEnded function
  if (timeLeft === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-red-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl text-white text-center">
          <AlertCircle className="w-24 h-24 mx-auto mb-6 text-red-400" />
          <h1 className="text-4xl font-bold mb-4">⏰ Tijd is op!</h1>
          <p className="text-xl mb-4">Helaas, je bent niet op tijd ontsnapt...</p>
          <p>Maar geef niet op! Probeer het opnieuw.</p>
          <button
            onClick={() => {
              setGameStarted(false);
              setCurrentRoom(0);
              setTimeLeft(1200);
              setAnswers({});
              setFeedback('');
            }}
            className="mt-8 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Probeer Opnieuw
          </button>
        </div>
      </div>
    );
  }

  const room = rooms[currentRoom];

  // TODO: extract into displayCurrentRoom function
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header met timer en voortgang */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 mb-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex gap-2">
            {rooms.map((_, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  idx < currentRoom
                    ? 'bg-green-500'
                    : idx === currentRoom
                    ? 'bg-blue-500'
                    : 'bg-gray-600'
                }`}
              >
                {idx < currentRoom ? '✓' : idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Kamer kaart */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold">{room.title}</h2>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
            <p className="text-lg italic">{room.story}</p>
          </div>

          <div className="mb-6">
            <label className="block text-xl font-semibold mb-4">{room.question}</label>
            <input
              type="text"
              value={answers[currentRoom] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentRoom]: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              className="w-full px-4 py-3 text-lg rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
              placeholder="Vul je antwoord in..."
            />
          </div>

          {feedback && (
            <div className={`mb-4 p-4 rounded-lg ${
              feedback.includes('✅') ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
            }`}>
              <p className="text-lg">{feedback}</p>
            </div>
          )}

          {showHint && (
            <div className="mb-4 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
              <p className="font-semibold mb-2">💡 Hint:</p>
              <p className="text-sm">{room.hint}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={checkAnswer}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              Controleer Antwoord
            </button>
            <button
              onClick={() => hintAvailable && setShowHint(!showHint)}
              disabled={!hintAvailable}
              className={`font-bold py-3 px-6 rounded-lg transition-all border ${
                hintAvailable 
                  ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/50 cursor-pointer' 
                  : 'bg-gray-500/20 text-gray-500 border-gray-500/50 cursor-not-allowed'
              }`}
            >
              {hintAvailable 
                ? (showHint ? '🔒 Verberg Hint' : '💡 Toon Hint')
                : `🔒 Hint over ${hintTimer}s`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// TODO: consider theme customisation: colours, font, etc
