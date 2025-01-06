async function fetchQuestion() {
    try {
        const response = await fetch('https://twofold.academy/trivia-api/public/api?amount=1');
        if (!response.ok) {
            throw new Error('Netzwerk antwort war nicht ok ' + response.statusText);
        }
        const data = await response.json();
        return data.results[0];
    } catch (error) {
        console.error('Es gab ein Problem mit deiner Fetch-Operation:', error);
    }
}
function chooseGameMode() {
    return new Promise((resolve) => {
        modal.setContent("Wähle den Spielmodus:<br><button id='standard-mode'>Standard</button><br><button id='time-mode'>Zeit</button>");
        document.getElementById('standard-mode').addEventListener('click', () => resolve('standard'));
        document.getElementById('time-mode').addEventListener('click', () => resolve('time'));
    });
}
// Funktion zum Verstecken beider Buttons
function hideButtons() {
    document.querySelectorAll('.tingle-btn').forEach(button => {
        button.style.display = 'none';
    });
}


let counter = 0;
let startTime = Date.now(); // Startzeit erfassen
async function askQuestionWithTimer(questionObj) {
    let question = questionObj.question + "<br>";
    let answers = [...questionObj.incorrect_answers, questionObj.correct_answer];
    answers = answers.sort(() => Math.random() - 0.5); // Antworten mischen

    answers.forEach((answer, index) => {
        question += `<button class="answer-btn" data-answer="${answer}">${String.fromCharCode(65 + index)}: ${answer}</button><br>`;
    });

    modal.setContent(question);

    return new Promise((resolve) => {
        let answered = false;
        const timer = setTimeout(() => {
            if (!answered) {
                modal.setContent("Zeit abgelaufen!<br>");
                setTimeout(() => resolve(false), 1000);
            }
        }, 10000); // 10 Sekunden Timer

        document.querySelectorAll('.answer-btn').forEach(button => {
            button.addEventListener('click', function() {
                if (!answered) {
                    answered = true;
                    clearTimeout(timer);
                    if (this.getAttribute('data-answer') === questionObj.correct_answer) {
                        counter++;
                        modal.setContent("Korrekt!<br>");
                    } else {
                        modal.setContent("Inkorrekt!<br>");
                    }
                    setTimeout(() => resolve(this.getAttribute('data-answer') === questionObj.correct_answer), 1000);
                }
            });
        });
    });
}


async function askQuestion(questionObj) {
    let question = questionObj.question + "<br>";
    let answers = [...questionObj.incorrect_answers, questionObj.correct_answer];
    answers = answers.sort(() => Math.random() - 0.5); // Antworten mischen

    answers.forEach((answer, index) => {
        question += `<button class="answer-btn" data-answer="${answer}">${String.fromCharCode(65 + index)}: ${answer}</button><br>`;
    });

    modal.setContent(question);

    return new Promise((resolve) => {
        document.querySelectorAll('.answer-btn').forEach(button => {
            button.addEventListener('click', function() {
                if (this.getAttribute('data-answer') === questionObj.correct_answer) {
                    counter++;
                    modal.setContent("Korrekt!<br>");
                } else {
                    modal.setContent("Inkorrekt!<br>");
                }
                setTimeout(() => resolve(this.getAttribute('data-answer') === questionObj.correct_answer), 1000);
            });
        });
    });
}
function saveScore(playerName, score, mode) {
    let scores = JSON.parse(localStorage.getItem('scores')) || {};
    if (!scores[playerName]) {
        scores[playerName] = { standard: 0, time: 0 };
    }
    scores[playerName][mode] = Math.max(scores[playerName][mode], score);
    localStorage.setItem('scores', JSON.stringify(scores));
}

function displayScoreBoard() {
    let scores = JSON.parse(localStorage.getItem('scores')) || {};
    let scoreBoard = "ScoreBoard:<br>";
    for (let player in scores) {
        scoreBoard += `${player} - Standard: ${scores[player].standard}, Zeit: ${scores[player].time}<br>`;
    }
    return scoreBoard;
}


async function runQuiz() {
    let gameMode = await chooseGameMode();
    let continueQuiz = true;
    while (continueQuiz) {
        const question = await fetchQuestion();
        if (gameMode === 'standard') {
            continueQuiz = await askQuestion(question);
        } else {
            continueQuiz = await askQuestionWithTimer(question);
        }
    }

    let endTime = Date.now(); // Endzeit erfassen
    let elapsedTime = (endTime - startTime) / 1000; // Zeit in Sekunden berechnen

    let playerName = prompt("Bitte geben Sie Ihren Namen ein:");
    saveScore(playerName.toLowerCase(), counter, gameMode);

    let scoreBoard = displayScoreBoard();
    modal.setContent(`Du hast ${elapsedTime} Sekunden gebraucht und ${counter} richtige Antworten gegeben.<br>${scoreBoard}`);
    modal.addFooterBtn('Schliessen', 'tingle-btn tingle-btn--primary', function() {
        modal.close();
        hideButtons();
       
    });

    modal.addFooterBtn('Neustarten', 'tingle-btn tingle-btn--primary', function() {
        counter = 0;
        startTime = Date.now();
        runQuiz();
        hideButtons();
    });
}

 // Warte kurz, bevor das Scoreboard angezeigt wird
 setTimeout(() => {
     let scoreBoard = displayScoreBoard();

     if (existingScore === null || counter > existingScore) {
         modal.setContent(`NEW HIGHSCORE!<br>${scoreBoard}`);
         modal.addFooterBtn('Schliessen', 'tingle-btn tingle-btn--primary', function() {
             hideButtons();
             modal.close();
         });

         modal.addFooterBtn('Neustarten', 'tingle-btn tingle-btn--primary', function() {
             counter = 0;
             startTime = Date.now();
             runQuiz();
             hideButtons();
         });
     } else {
         modal.setContent(scoreBoard);
         modal.addFooterBtn('Schliessen', 'tingle-btn tingle-btn--primary', function() {
             hideButtons();
             modal.close();
         });

         modal.addFooterBtn('Neustarten', 'tingle-btn tingle-btn--primary', function() {
             counter = 0;
             startTime = Date.now();
             runQuiz();
             hideButtons();
         });
     }
 }, 3000); // Warte 3 Sekunden, bevor das Scoreboard angezeigt wird


var modal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: "Close",
    cssClass: ['custom-class-1', 'custom-class-2'],
    onOpen: function() {
        console.log('modal open');
    },
    onClose: function() {
        console.log('modal closed');
    },
    beforeClose: function() {
        return true; 
    }
});

modal.setContent('<h1>Willkommen zu Andys Quiz</h1> Regeln sind eigentlich ganz einfach, benutze die Buttons um eine Antwort zu der Frage auszuwählen, ist diese falsch, ist das Spiel vorbei.');

// Event Listener für den Start-Button
document.getElementById('start-quiz-btn').addEventListener('click', function() {
    modal.open();
    modal.addFooterBtn('Start !', 'tingle-btn tingle-btn--primary', function() {
        runQuiz();
        this.style.display = 'none';
    });
    
});
