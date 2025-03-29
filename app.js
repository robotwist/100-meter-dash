// Game variables
let player1Character = null;
let player2Character = null;
let distance1 = 0;
let distance2 = 0;
const goal = 100;  // 100 meters
let startTime = null;
let timeElapsed = 0;
let gameInterval;
let gameActive = false;
let computerRunInterval;
let winner = null;
let isCountdownActive = false;
let player1Finished = false;
let player2Finished = false;
let player1Time = 0;
let player2Time = 0;
let buttonGrowthFactor = 1; // Variable for button size
let isMobileDevice = false; // Flag for detecting mobile devices

// DOM Elements
const characterSelection = document.getElementById('characterSelection');
const boltButton = document.getElementById('boltButton');
const nkdmanButton = document.getElementById('nkdmanButton');
const game = document.getElementById('game');
const player1Sprite = document.getElementById('player1Sprite');
const player2Sprite = document.getElementById('player2Sprite');
const progressBar1 = document.getElementById('progressBar1');
const progressBar2 = document.getElementById('progressBar2');
const distance1Display = document.getElementById('distance1');
const distance2Display = document.getElementById('distance2');
const timeDisplay = document.getElementById('timeElapsed');
const runButton1 = document.getElementById('runButton1');
const player2Controls = document.getElementById('player2Controls');
const controlInstruction = document.getElementById('controlInstruction');
const result = document.getElementById('result');
const winnerText = document.getElementById('winnerText');
const finishTime = document.getElementById('finishTime');
const restartButton = document.getElementById('restartButton');
const countdownDisplay = document.getElementById('countdown');

// Detect if we're on a mobile device
function detectMobileDevice() {
  isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Update instruction text based on device
  if (!isMobileDevice) {
    runButton1.setAttribute('data-tooltip', 'Or press SPACEBAR to run!');
  }
}

// Call detection on load
detectMobileDevice();

// Character selection
boltButton.addEventListener('click', () => {
  player1Character = 'bolt';
  player1Sprite.src = 'bolt-sprite.gif';
  player2Character = 'nkdman';
  player2Sprite.src = 'nkdman-running.gif';
  setupGame();
});

nkdmanButton.addEventListener('click', () => {
  player1Character = 'nkdman';
  player1Sprite.src = 'nkdman-running.gif';
  player2Character = 'bolt';
  player2Sprite.src = 'bolt-sprite.gif';
  setupGame();
});

// Function to setup the game and start countdown
function setupGame() {
  // Hide character selection and show game
  characterSelection.style.display = 'none';
  game.style.display = 'flex';
  
  // Reset game variables
  distance1 = 0;
  distance2 = 0;
  timeElapsed = 0;
  winner = null;
  player1Finished = false;
  player2Finished = false;
  player1Time = 0;
  player2Time = 0;
  buttonGrowthFactor = 1; // Reset button size
  
  // Reset button appearance
  runButton1.classList.remove('button-exploding', 'button-growing');
  document.documentElement.style.setProperty('--button-scale', buttonGrowthFactor);
  
  // Update displays
  distance1Display.textContent = '0.0';
  distance2Display.textContent = '0.0';
  timeDisplay.textContent = '0.00';
  progressBar1.style.width = '0%';
  progressBar2.style.width = '0%';
  result.classList.add('hidden');
  
  // Disable buttons during countdown
  runButton1.disabled = true;
  
  // Update control instructions based on device
  if (!isMobileDevice) {
    controlInstruction.textContent = 'Press SPACEBAR or click RUN button repeatedly!';
  } else {
    controlInstruction.textContent = 'Tap RUN button repeatedly!';
  }
  
  // Start countdown
  startCountdown();
}

// Function to handle countdown sequence
function startCountdown() {
  isCountdownActive = true;
  
  // "On your mark"
  countdownDisplay.textContent = "On your mark";
  
  setTimeout(() => {
    // "Get set"
    countdownDisplay.textContent = "Get set";
    
    setTimeout(() => {
      // "GO!"
      countdownDisplay.textContent = "GO!";
      
      setTimeout(() => {
        // Clear countdown and start the race
        countdownDisplay.textContent = "";
        startGame();
      }, 1000);
    }, 1000);
  }, 1500);
}

// Function to start the actual race after countdown
function startGame() {
  gameActive = true;
  isCountdownActive = false;
  
  // Enable run button
  runButton1.disabled = false;
  
  // Start timer
  startTime = new Date();
  gameInterval = setInterval(trackTime, 10);
  
  // Set up computer player
  // Computer finishes between 9.3 to 9.7 seconds
  const computerFinishTime = Math.random() * (9.7 - 9.3) + 9.3;
  const updateInterval = 50; // 50ms update interval
  const distancePerUpdate = goal / (computerFinishTime * 1000 / updateInterval);
  
  computerRunInterval = setInterval(() => {
    if (gameActive && !player2Finished && distance2 < goal) {
      distance2 += distancePerUpdate;
      distance2Display.textContent = Math.min(distance2, goal).toFixed(1);
      progressBar2.style.width = Math.min(distance2 / goal * 100, 100) + '%';
      
      if (distance2 >= goal && !player2Finished) {
        playerFinished(2);
      }
    }
  }, updateInterval);
}

// Player 1 run button
runButton1.addEventListener('click', () => {
  if (gameActive && !isCountdownActive && distance1 < goal) {
    movePlayer(1);
    
    // Provide visual feedback for clicks
    runButton1.classList.add('button-clicked');
    setTimeout(() => {
      runButton1.classList.remove('button-clicked');
    }, 50);
  }
});

// Add touch event handling for mobile
runButton1.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevent double actions and zoom
  if (gameActive && !isCountdownActive && distance1 < goal) {
    movePlayer(1);
  }
});

// Prevent default on touchend to avoid issues
runButton1.addEventListener('touchend', (e) => {
  e.preventDefault();
});

// Add keyboard support for spacebar
document.addEventListener('keydown', (e) => {
  // 32 is the keycode for spacebar
  if (e.keyCode === 32 && gameActive && !isCountdownActive && distance1 < goal) {
    e.preventDefault(); // Prevent page scrolling
    movePlayer(1);
    
    // Provide visual feedback for spacebar presses
    runButton1.classList.add('button-clicked');
    setTimeout(() => {
      runButton1.classList.remove('button-clicked');
    }, 50);
  }
});

// Function to move players
function movePlayer(playerNum) {
  if (playerNum === 1 && !player1Finished) {
    distance1 += (Math.random() * 3 + 0.97) * 0.85; // 15% harder: ~0.82-3.37 meters
    distance1Display.textContent = Math.min(distance1, goal).toFixed(1);
    progressBar1.style.width = Math.min(distance1 / goal * 100, 100) + '%';
    
    // Grow the button as player progresses
    const progressPercent = distance1 / goal;
    buttonGrowthFactor = 1 + (progressPercent * 0.5); // Grows up to 1.5x original size
    document.documentElement.style.setProperty('--button-scale', buttonGrowthFactor);
    
    // Add growing effect class
    if (progressPercent > 0.3 && !runButton1.classList.contains('button-growing')) {
      runButton1.classList.add('button-growing');
    }
    
    if (distance1 >= goal && !player1Finished) {
      playerFinished(1);
    }
  } else if (playerNum === 2 && !player2Finished) {
    distance2 += (Math.random() * 3 + 0.97) * 0.85; // 15% harder: ~0.82-3.37 meters
    distance2Display.textContent = Math.min(distance2, goal).toFixed(1);
    progressBar2.style.width = Math.min(distance2 / goal * 100, 100) + '%';
    
    if (distance2 >= goal && !player2Finished) {
      playerFinished(2);
    }
  }
}

// Function to handle player finish
function playerFinished(playerNum) {
  if (playerNum === 1) {
    player1Finished = true;
    player1Time = timeElapsed;
    
    if (!winner) {
      winner = 'player1';
      showWinner();
      
      // Add explosion animation if player 1 wins
      if (winner === 'player1') {
        runButton1.classList.remove('button-growing');
        runButton1.classList.add('button-exploding');
      }
    }
  } else {
    player2Finished = true;
    player2Time = timeElapsed;
    
    if (!winner) {
      winner = 'computer';
      showWinner();
    }
  }
  
  // Check if both players have finished
  if ((player1Finished && player2Finished) || (timeElapsed > 30)) { 
    // Wait for both to finish or timeout at 30 seconds
    finishRace();
  }
}

// Function to show winner notification
function showWinner() {
  // This function announces the winner but doesn't stop the race
  if (winner === 'player1') {
    winnerText.textContent = 'You Win!';
  } else {
    winnerText.textContent = 'Computer Wins!';
  }
}

// Function to track elapsed time
function trackTime() {
  if (startTime && gameActive) {
    const currentTime = new Date();
    timeElapsed = (currentTime - startTime) / 1000;
    timeDisplay.textContent = timeElapsed.toFixed(2);
  }
}

// Function to handle race finish
function finishRace() {
  gameActive = false;
  clearInterval(gameInterval);
  clearInterval(computerRunInterval);
  
  runButton1.disabled = true;
  
  // Show results
  result.classList.remove('hidden');
  
  // Create result message with both times
  let resultMessage = '<div class="time-results">';
  
  // Results display
  resultMessage += `
    <div class="result-row">
      <span class="result-label">Your time:</span>
      <span class="result-time"><span class="time-display">${player1Time > 0 ? player1Time.toFixed(2) : 'DNF'}</span> seconds</span>
    </div>
    <div class="result-row">
      <span class="result-label">Computer time:</span>
      <span class="result-time"><span class="time-display">${player2Time > 0 ? player2Time.toFixed(2) : 'DNF'}</span> seconds</span>
    </div>
  `;
  
  resultMessage += '</div>';
  finishTime.innerHTML = resultMessage;
}

// Restart button
restartButton.addEventListener('click', () => {
  // Reset to character selection
  game.style.display = 'none';
  characterSelection.style.display = 'flex';
  
  // Clean up
  if (gameInterval) clearInterval(gameInterval);
  if (computerRunInterval) clearInterval(computerRunInterval);
});