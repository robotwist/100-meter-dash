let distance = 0;
const goal = 100;  // 100 meters
let startTime = null;
let timeElapsed = 0;
let gameInterval;

const distanceDisplay = document.getElementById('distance');
const timeDisplay = document.getElementById('timeElapsed');
const runButton = document.getElementById('runButton');
const progressBar = document.getElementById('progressBar');

const runnerSprite = document.getElementById('runnerSprite');
const boltButton = document.getElementById('boltButton');
const giantButton = document.getElementById('giantButton');

// Character selection logic
boltButton.addEventListener('click', () => {
  runnerSprite.src = 'bolt-sprite.gif';  // Ensure this path is correct
  startGame();
});

giantButton.addEventListener('click', () => {
  runnerSprite.src = 'giantSprite.png';  // Ensure this path is correct
  startGame();
});

// Function to start the game
function startGame() {
  distance = 0;
  timeElapsed = 0;
  runButton.disabled = false;
  distanceDisplay.textContent = distance.toFixed(1);
  progressBar.style.width = '0%';
  startTime = new Date();
  gameInterval = setInterval(trackTime, 10);
}

// Function to update the game every time the button is clicked
runButton.addEventListener('click', () => {
  if (distance === 0) {
    startTime = new Date();  // Start the timer on the first click
  }
  
  if (distance < goal) {
    distance += Math.random() * 3 + 1;  // Add a random distance between 1 and 3 meters per click
    distanceDisplay.textContent = Math.min(distance.toFixed(1), goal);
    progressBar.style.width = (distance / goal * 100) + '%';

    if (distance >= goal) {
      clearInterval(gameInterval);  // Stop the timer when the goal is reached
      runButton.disabled = true;
      alert(`You finished the 100 meter dash in ${timeElapsed.toFixed(2)} seconds!`);
    }
  }
});

// Function to track elapsed time
function trackTime() {
  if (startTime) {
    const currentTime = new Date();
    timeElapsed = (currentTime - startTime) / 1000;
    timeDisplay.textContent = timeElapsed.toFixed(2);
  }
}