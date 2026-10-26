const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const INITIAL_LIVES = 3;
const INITIAL_STREAK = 0;
const INITIAL_BEST_STREAK = 0;

let currentNumber = 0;
let lives = INITIAL_LIVES;
let streak = INITIAL_STREAK;
let bestStreak = INITIAL_BEST_STREAK;
let gameActive = false;

const currentNumberElement = document.getElementById("currentNumber");
const livesElement = document.getElementById("lives");
const streakElement = document.getElementById("streak");
const bestStreakElement = document.getElementById("bestStreak");
const messageElement = document.getElementById("message");
const higherButton = document.getElementById("higherButton");
const lowerButton = document.getElementById("lowerButton");
const startButton = document.getElementById("startButton");

function getRandomNumber() {
    return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
}

function updateDisplay() {
    currentNumberElement.textContent = currentNumber;
    livesElement.textContent = lives;
    streakElement.textContent = streak;
    bestStreakElement.textContent = bestStreak;
}

function setMessage(message, type = "") {
    messageElement.textContent = message;
    messageElement.className = type;
}

function setButtonsDisabled(disabled) {
    higherButton.disabled = disabled;
    lowerButton.disabled = disabled;
}

function startGame() {
    lives = INITIAL_LIVES;
    streak = INITIAL_STREAK;
    currentNumber = getRandomNumber();
    gameActive = true;

    updateDisplay();
    setMessage("Choose Higher or Lower.");
    setButtonsDisabled(false);
    startButton.textContent = "Restart Game";
}

function makeGuess(guess) {
    if (gameActive !== true || (guess !== "higher" && guess !== "lower")) {
        setMessage("This move is not allowed.", "error");
        return;
    }

    const nextNumber = getRandomNumber();

    let correct = false;

    if (
        (guess === "higher" && nextNumber >= currentNumber) ||
        (guess === "lower" && nextNumber <= currentNumber)
    ) {
        correct = true;
    }

    if (correct === true) {
        streak++;

        if (streak > bestStreak) {
            bestStreak = streak;
        }

        setMessage(
            `Correct! ${currentNumber} → ${nextNumber}. Choose again.`,
            "success"
        );
    } else {
        lives--;
        streak = INITIAL_STREAK;

        setMessage(
            `Wrong! ${currentNumber} → ${nextNumber}. You lost a life.`,
            "error"
        );
    }

    currentNumber = nextNumber;
    updateDisplay();

    if (lives === 0 || currentNumber < MIN_NUMBER || currentNumber > MAX_NUMBER) {
        endGame();
    }
}

function endGame() {
    gameActive = false;
    setButtonsDisabled(true);
    setMessage(`Game over! Your best streak is ${bestStreak}.`, "error");
}

higherButton.addEventListener("click", function () {
    makeGuess("higher");
});

lowerButton.addEventListener("click", function () {
    makeGuess("lower");
});

startButton.addEventListener("click", startGame);

currentNumber = getRandomNumber();
updateDisplay();
setButtonsDisabled(true);
