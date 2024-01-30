/**
 * Zmienna globalna reprezentująca stan min na planszy.
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
 * Zmienna globalna przechowująca liczbę odsłoniętych komórek na planszy.
 * @global
 * @type {number} 
 */
let revealedCells;

/**
 * Zmienna globalna przechowująca liczbę pozostałych do odsłonięcia komórek na planszy.
 * @global
 * @type {number} 
 */
let remainingCells;

/**
 * Zmienna globalna przechowująca czas rozpoczęcia gry.
 * @global
 * @type {number} 
 */
let startTime;

/**
 * Zmienna globalna przechowująca identyfikator interwału dla licznika czasu gry.
 * @global
 * @type {number} 
 */
let timerInterval;

/**
 * Element HTML reprezentujący planszę gry.
 * @global
 * @type {HTMLElement} 
 */
const board = document.getElementById("board");

/**
 * Element HTML reprezentujący pole wyboru poziomu trudności.
 * @global
 * @type {HTMLSelectElement} 
 */
const difficultySelect = document.getElementById("difficultySelect");

/**
 * Element HTML reprezentujący pole wprowadzania nazwy gracza.
 * @global
 * @type {HTMLInputElement} 
 */
const playerNameInput = document.getElementById("playerNameInput");

/**
 * Element HTML reprezentujący wyświetlacz czasu gry.
 * @global
 * @type {HTMLElement} 
 */
const timerDisplay = document.getElementById("timer");

/**
 * Element HTML reprezentujący wyświetlacz wyników graczy.
 * @global
 * @type {HTMLElement} 
 */
const playerScoresDisplay = document.getElementById("playerScores");

/**
 * Funkcja tworząca komórkę planszy.
 * Tworzy nowy element div reprezentujący komórkę planszy.
 * Dodaje klasę CSS "cell" do komórki.
 * Ustawia atrybut dataset z indeksem komórki.
 * Dodaje zdarzenie kliknięcia komórki.
 * Dodaje utworzoną komórkę do elementu planszy (board).
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
 * Pobiera klikniętą komórkę planszy i indeks komórki z atrybutu dataset.
 * Sprawdza, czy komórka zawiera minę.
 * Jeśli tak to:
 * Wywołuje funkcję ujawniającą wszystkie miny.
 * Wyświetla komunikat o przegranej grze.
 * Zatrzymuje licznik czasu.
 * Zapisuje wynik gracza jako przegraną.
 * W przeciwnym razie:
 * Ujawnia klikniętą komórkę.
 * Sprawdza warunek wygranej.
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
 * Sprawdza, czy wszystkie komórki zostały odkryte.
 * Jeśli tak to:
 * Wyświetla komunikat o wygranej grze.
 * Zatrzymuje licznik czasu.
 * Zapisuje wynik gracza jako wygraną.
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
 * Pobiera klikniętą komórkę planszy na podstawie jej indeksu.
 * Oblicza liczbę min sąsiadujących z komórką przez wywołanie funkcji countAdjacentMines.
 * Sprawdza, czy komórka nie została jeszcze odsłonięta.
 * Jeśli tak to:
 * Ustawia tekst komórki na liczbę sąsiadujących min.
 * Dodaje klasę "revealed" do odsłoniętej komórki.
 * Zwiększa licznik odsłoniętych komórek.
 * Zmniejsza licznik pozostałych do odsłonięcia komórek.
 * Jeśli komórka nie ma sąsiadujących min, odsłania sąsiadujące komórki.
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
 * Pobiera sąsiadujące indeksy komórek.
 * Filtruje sąsiadujące komórki, aby uzyskać tylko te, które zawierają miny,a następnie zwraca ich liczbę.
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
 * Oblicza numer wiersza na podstawie indeksu komórki.
 * Oblicza numer kolumny na podstawie indeksu komórki.
 * Tworzy pustą tablicę na indeksy sąsiadujących komórek.
 * Iteruje przez sąsiadujące wiersze.
 * Iteruje przez sąsiadujące kolumny.
 * Sprawdza, czy sąsiadująca komórka mieści się w obszarze planszy i czy nie jest to ta sama komórka (indeks równy indeksowi komórki).
 * Oblicza indeks sąsiadującej komórki i dodaje go do tablicy neighbors.
 * Zwraca tablicę indeksów sąsiadujących komórek.
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
 * Pobiera wszystkie komórki planszy.
 * Iteruje przez każdą komórkę.
 * Pobiera indeks komórki.
 * Sprawdza, czy komórka zawiera minę.
 * Jeśli tak to:
 * Ustawia tekst komórki na symbol bomby.
 * Dodaje klasę "mine" do komórki, aby wskazać, że zawiera minę.
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
 * Ustawia styl kolumn planszy za pomocą CSS Grid.
 * Tworzy komórki planszy na podstawie rozmiaru planszy.
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
 * Ustawia flagę informującą, że gra została rozpoczęta.
 * Pobiera nazwę gracza z pola wejściowego i usuwa białe znaki z początku i końca.
 * Sprawdza, czy nazwa gracza została podana.
 * Jeśli nie to:
 * Wyświetla alert, jeśli nazwa gracza nie została podana, i przerywa dalsze wykonywanie funkcji.
 * Pobiera wybrany poziom trudności.
 * Ustala rozmiar planszy i liczbę min w zależności od wybranego poziomu trudności.
 * Wyłącza pole wprowadzania nazwy gracza.
 * Generuje miny na planszy.
 * Resetuje licznik odsłoniętych komórek.
 * Oblicza liczbę pozostałych do odsłonięcia komórek.
 * Rozpoczyna liczenie czasu gry.
 * Czyści planszę z komórek.
 * Inicjalizuje planszę gry na podstawie ustalonego rozmiaru.
 * Ustawia liczbę dostępnych flag na początkową liczbę min.
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
 * Tworzy tablicę o rozmiarze równym liczbie komórek planszy i wypełnia ją wartościami false.
 * Losuje pozycje min na planszy.
 * Wybiera losowy indeks, który jeszcze nie zawiera miny.
 * Ustawia minę na wylosowanej pozycji.
 * Zwraca tablicę reprezentującą miny na planszy.
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
 * Aktualizuje licznik czasu.
 * Ustawia interwał odświeżania licznika czasu co 1000 milisekund (1 sekunda).
 * @function
 */
async function timer() {
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Zatrzymuje pomiar czasu gry.
 * Usuwa interwał odświeżania licznika czasu.
 * @function
 */
function stopTimer() {
    clearInterval(timerInterval);
}

/**
 * Aktualizuje czas na wyświetlaczu.
 * Oblicza upływający czas od rozpoczęcia gry w sekundach.
 * Aktualizuje tekst wyświetlacza czasu gry.
 * @function
 */
function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `⏰ ${elapsedTime}s`;
}

/**
 *  Zapisuje wynik gracza w pamięci lokalnej przeglądarki.
 *  Pobiera nazwę gracza z pola wejściowego na stronie i usuwa białe znaki z początku i końca.
 *  Oblicza czas, jaki upłynął od rozpoczęcia gry w sekundach.
 *  Pobiera bieżącą listę wyników graczy z pamięci lokalnej.
 *  Dodaje nowy wynik gracza do listy.
 *  Zapisuje zaktualizowaną listę wyników graczy w pamięci lokalnej.
 *  Aktualizuje wyświetlanie wyników graczy na stronie.
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
 * Pobiera zapisane wyniki graczy z lokalnej pamięci przeglądarki.
 * Jeśli są zapisane wyniki graczy, parsuje je z formatu JSON do tablicy obiektów.
 * W przeciwnym razie, zwraca pustą tablicę.
 * @returns {object[]} Tablica wyników graczy
 * @async
 * @function
 */
async function getPlayerScores() {
    const playerScores = localStorage.getItem("playerScores");
    return playerScores ? JSON.parse(playerScores) : [];
}

/**
 * Wyświetla wyniki graczy na stronie internetowej.
 * Pobiera wyniki graczy z pamięci lokalnej przeglądarki.
 * Czyści zawartość elementu wyświetlającego wyniki graczy.
 * Sprawdza, czy istnieją wyniki graczy.
 * Jeśli tak to:
 * Tworzy tabelę HTML do wyświetlenia wyników graczy.
 * Tworzy wiersz nagłówka tabeli.
 * Wypełnia tabelę wynikami graczy.
 * Dodaje tabelę do elementu wyświetlającego wyniki graczy.
 * W przeciwnym razie:
 * Wyświetla komunikat, gdy brak wyników graczy.
 * @async
 * @function
 * @returns {Promise<void>} Obietnica zakończenia wyświetlania wyników graczy.
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
 * Aktualizuje tekst wyświetlacza liczby flag na stronie internetowej.
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
