/**
 * @global
 * @type {boolean[]} 
 */
let mines;

/**
 * Zmienna śledząca stan rozpoczęcia gry.
 * @type {boolean}
 */
let gameStarted = false;

/**
 * @global
 * @type {number} 
 */
let revealedCells;

/**
 * @global
 * @type {number} 
 */
let remainingCells;

/**
 * @global
 * @type {number} 
 */
let startTime;

/**
 * @global
 * @type {number} 
 */
let timerInterval;

/**
 * @global
 * @type {HTMLElement} 
 */
const board = document.getElementById("board");

/**
 * @global
 * @type {HTMLSelectElement} 
 */
const difficultySelect = document.getElementById("difficultySelect");

/**
 * @global
 * @type {HTMLInputElement} 
 */
const playerNameInput = document.getElementById("playerNameInput");

/**
 * @global
 * @type {HTMLElement} 
 */
const timerDisplay = document.getElementById("timer");

/**
 * @global
 * @type {HTMLElement} 
 */
const playerScoresDisplay = document.getElementById("playerScores");

/**
 * Funkcja tworząca komórkę planszy.
 * @param {number} index - Indeks komórki
 * @function
 */
function createCell(index) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = index;
    cell.addEventListener("click", handleCellClick);
    board.appendChild(cell);
}

/**
 * Obsługa kliknięcia na komórkę planszy.
 * @param {Event} event - Zdarzenie kliknięcia
 * @function
 */
function handleCellClick(event) {
    const clickedCell = event.target;
    const index = parseInt(clickedCell.dataset.index);

    if (mines[index]) {
        revealMines();
        alert("Game over!");
        stopTimer();
        savePlayerScore(false);
    } else {
        revealCell(index);
        checkWinCondition();
    }
}

/**
 * Sprawdza warunek wygranej gry.
 * @function
 */
function checkWinCondition() {
    if (remainingCells === 0) {
        alert("Congratulations! You won!");
        stopTimer();
        savePlayerScore(true);
    }
}

/**
 * Odsłania komórkę na planszy.
 * @param {number} index - Indeks komórki
 * @function
 */
function revealCell(index) {
    const clickedCell = document.querySelector(`.cell[data-index="${index}"]`);
    const mineCount = countAdjacentMines(index);

    if (!clickedCell.classList.contains("revealed")) {
        clickedCell.textContent = mineCount;
        clickedCell.classList.add("revealed");
        revealedCells++;
        remainingCells--;

        if (mineCount === 0) {
            const neighbors = getNeighbors(index);
            neighbors.forEach(neighbor => revealCell(neighbor));
        }
    }
}

/**
 * Liczy liczbę sąsiadujących min.
 * @param {number} index - Indeks komórki
 * @returns {number} Liczba sąsiednich min
 * @function
 */
function countAdjacentMines(index) {
    const neighbors = getNeighbors(index);
    return neighbors.filter(neighbor => mines[neighbor]).length;
}

/**
 * Zwraca indeksy sąsiadujących komórek.
 * @param {number} index - Indeks komórki
 * @returns {number[]} Indeksy sąsiadujących komórek
 * @function
 */
function getNeighbors(index) {
    const row = Math.floor(index / Math.sqrt(mines.length));
    const col = index % Math.sqrt(mines.length);
    const neighbors = [];

    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < Math.sqrt(mines.length) && j >= 0 && j < Math.sqrt(mines.length) && !(i === row && j === col)) {
                neighbors.push(i * Math.sqrt(mines.length) + j);
            }
        }
    }

    return neighbors;
}

/**
 * Odsłania wszystkie miny na planszy.
 * @function
 */
function revealMines() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        const index = parseInt(cell.dataset.index);
        if (mines[index]) {
            cell.textContent = "💣";
            cell.classList.add("mine");
        }
    });
}

/**
 * Inicjalizuje planszę gry.
 * @param {number} boardSize - Rozmiar planszy
 * @function
 */
function initializeBoard(boardSize) {
    board.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`;

    for (let i = 0; i < boardSize * boardSize; i++) {
        createCell(i);
    }
}

/**
 * Rozpoczyna grę.
 * @function
 */
function startGame() {
    gameStarted = true;
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Please enter your name!");
        return;
    }

    const difficulty = difficultySelect.value;
    let boardSize;
    let mineCount;

    switch (difficulty) {
        case "easy":
            boardSize = 8;
            mineCount = 10;
            break;
        case "normal":
            boardSize = 10;
            mineCount = 15;
            break;
        case "hard":
            boardSize = 12;
            mineCount = 20;
            break;
        default:
            boardSize = 8;
            mineCount = 10;
    }

    playerNameInput.disabled = true;
    mines = generateMines(boardSize, mineCount);
    revealedCells = 0;
    remainingCells = boardSize * boardSize - mineCount;
    startTime = Date.now();
    timer();
    board.innerHTML = "";
    initializeBoard(boardSize);
    flagCount = mineCount;
    updateFlagCount();
}

/**
 * Generuje miny na planszy.
 * @param {number} boardSize - Rozmiar planszy
 * @param {number} mineCount - Liczba min
 * @returns {boolean[]} Tablica reprezentująca miny na planszy
 * @function
 */
function generateMines(boardSize, mineCount) {
    const mineArray = Array(boardSize * boardSize).fill(false);
    for (let i = 0; i < mineCount; i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * (boardSize * boardSize));
        } while (mineArray[randomIndex]);
        mineArray[randomIndex] = true;
    }
    return mineArray;
}

/**
 * Rozpoczyna pomiar czasu gry.
 * @function
 */
async function timer() {
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Zatrzymuje pomiar czasu gry.
 * @function
 */
function stopTimer() {
    clearInterval(timerInterval);
}

/**
 * Aktualizuje czas na wyświetlaczu.
 * @function
 */
function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `⏰ ${elapsedTime}s`;
}

/**
 * Zapisuje wynik gracza.
 * @param {boolean} hasWon - Czy gracz wygrał?
 * @async
 * @function
 */
async function savePlayerScore(hasWon) {
    const playerName = playerNameInput.value.trim();
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    let playerScores = await getPlayerScores();
    playerScores.push({ name: playerName, time: elapsedTime, won: hasWon });
    localStorage.setItem("playerScores", JSON.stringify(playerScores));
    displayPlayerScores();
}

/**
 * Pobiera wyniki graczy z lokalnej pamięci przeglądarki.
 * @returns {object[]} Tablica wyników graczy
 * @async
 * @function
 */
async function getPlayerScores() {
    const playerScores = localStorage.getItem("playerScores");
    return playerScores ? JSON.parse(playerScores) : [];
}

/**
 * Wyświetla wyniki graczy.
 * @async
 * @function
 */
async function displayPlayerScores() {
    const playerScores = await getPlayerScores();

    playerScoresDisplay.innerHTML = "<h2>Player Scores</h2>";
    if (playerScores.length > 0) {
        const table = document.createElement("table");
        const headerRow = table.insertRow();
        headerRow.innerHTML = "<th>Nick</th><th>Time</th><th>Result</th>";

        playerScores.forEach(score => {
            const row = table.insertRow();
            row.innerHTML = `<td>${score.name}</td><td>${score.time}</td><td>${score.won ? "Won" : "Lost"}</td>`;
        });

        playerScoresDisplay.appendChild(table);
    } else {
        playerScoresDisplay.innerHTML = "<p>No player scores yet.</p>";
    }
}

/**
 * Obsługuje zdarzenie kontekstowe dla planszy (kliknięcie prawym przyciskiem myszy).
 * Wstawia lub usuwa flagę z komórki, w zależności od jej aktualnego stanu.
 * Zmniejsza licznik dostępnych flag, gdy flaga jest wstawiana, oraz zwiększa go, gdy flaga jest usuwana.
 * @param {Event} event - Zdarzenie kontekstowe
 * @function
 */
function handleContextMenu(event) {
    event.preventDefault();
    
    const clickedCell = event.target;
    const index = parseInt(clickedCell.dataset.index);

    if (!clickedCell.classList.contains("revealed")) {
        if (clickedCell.textContent === "") {
            if (flagCount > 0) {
                clickedCell.textContent = "🚩";
                flagCount--;
                updateFlagCount();
            }
        } else if (clickedCell.textContent === "🚩") {
            clickedCell.textContent = "";
            flagCount++;
            updateFlagCount();
        }
    }
}
/**
 * Aktualizuje wyświetlacz liczby flag.
 * @function
 */
function updateFlagCount() {
    document.getElementById("flagCount").textContent = flagCount;
}
/**
 * Dodaje obsługę zdarzenia kontekstowego (kliknięcie prawym przyciskiem myszy) dla planszy.
 * Wywołuje funkcję `handleContextMenu` w odpowiedzi na to zdarzenie.
 * @event
 */
board.addEventListener("contextmenu", handleContextMenu);

/**
 * Funkcja wywoływana po załadowaniu zawartości DOM.
 * Inicjalizuje planszę gry i wyświetla wyniki graczy.
 * Dodaje również obsługę zdarzenia kliknięcia planszy.
 * @event
 */
document.addEventListener("DOMContentLoaded", function() {

    initializeBoard(8);
    displayPlayerScores();
    board.addEventListener('click', function() {
        if (!gameStarted) {
            alert('Start the game');
        }
    });
    
});

/**
 * Czyści wszystkie dane przechowywane w pamięci lokalnej przeglądarki i aktualizuje wyświetlane wyniki graczy.
 * @function
 */
function clearLocalStorage() {
    localStorage.clear();
    displayPlayerScores();
}



displayPlayerScores();
