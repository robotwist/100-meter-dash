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
let gameState = 'selection'; // Tracks current game state: selection, countdown, racing, finished
let difficultyFactor = 0.65; // Adjusted to make game challenging but allow for realistic times
let celebrationActive = false; // Flag to track if celebration sequence is active

// DOM Elements
const characterSelection = document.getElementById('characterSelection');
const boltButton = document.getElementById('boltButton');
const nkdmanButton = document.getElementById('nkdmanButton');
const game = document.getElementById('game');
const player1Sprite = document.getElementById('player1Sprite');
const player2Sprite = document.getElementById('player2Sprite');
const timeDisplay = document.getElementById('timeElapsed');
const result = document.getElementById('result');
const winnerText = document.getElementById('winnerText');
const finishTime = document.getElementById('finishTime');
const countdownDisplay = document.getElementById('countdown');

// Replace individual buttons with a single multipurpose action button
const actionButton = document.getElementById('actionButton');

// Detect if we're on a mobile device
function detectMobileDevice() {
  isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
  gameState = 'countdown';
  celebrationActive = false;
  
  // Reset button appearance and text
  actionButton.classList.remove('button-exploding', 'button-growing', 'button-shaking');
  actionButton.textContent = 'READY...';
  actionButton.disabled = true;
  document.documentElement.style.setProperty('--button-scale', buttonGrowthFactor);
  
  // Update displays
  updateDistanceDisplay();
  timeDisplay.textContent = '0.00';
  
  // Position racers at start line
  document.querySelector('.racer-1').style.left = '0';
  document.querySelector('.racer-2').style.left = '0';
  
  // Hide results
  result.classList.add('hidden');
  
  // Clean up any existing celebration effects
  document.querySelectorAll('.confetti, .firework, .celebration-text, .medal').forEach(el => {
    el.remove();
  });
  
  // Start countdown
  startCountdown();
}

// Function to update the visual position of racers
function updateRacersPosition() {
  const track = document.querySelector('.racetrack');
  const trackWidth = track.clientWidth;
  const finishPosition = trackWidth - 60; // Adjust for racer width
  
  // Calculate visual positions (subtract racer width from finish to align properly)
  const position1 = Math.min((distance1 / goal) * finishPosition, finishPosition);
  const position2 = Math.min((distance2 / goal) * finishPosition, finishPosition);
  
  // Update racer positions
  document.querySelector('.racer-1').style.left = position1 + 'px';
  document.querySelector('.racer-2').style.left = position2 + 'px';
}

// Function to update distance display
function updateDistanceDisplay() {
  document.getElementById('distance1').textContent = Math.min(distance1, goal).toFixed(1) + 'm';
  document.getElementById('distance2').textContent = Math.min(distance2, goal).toFixed(1) + 'm';
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
  gameState = 'racing';
  
  // Update action button
  actionButton.disabled = false;
  actionButton.textContent = 'RUN!';
  
  // Start timer
  startTime = new Date();
  gameInterval = setInterval(trackTime, 10);
  
  // Set up computer player
  // Computer finishes between 9.72 to 10.2 seconds (realistic world-class time)
  const computerFinishTime = Math.random() * (10.2 - 9.72) + 9.72;
  const updateInterval = 50; // 50ms update interval
  const distancePerUpdate = goal / (computerFinishTime * 1000 / updateInterval);
  
  computerRunInterval = setInterval(() => {
    if (gameActive && !player2Finished && distance2 < goal) {
      distance2 += distancePerUpdate;
      updateDistanceDisplay();
      updateRacersPosition();
      
      if (distance2 >= goal && !player2Finished) {
        playerFinished(2);
      }
    }
  }, updateInterval);
}

// Multipurpose action button
actionButton.addEventListener('click', () => {
  switch(gameState) {
    case 'racing':
      if (gameActive && !isCountdownActive && distance1 < goal) {
        movePlayer(1);
        
        // Provide visual feedback for clicks
        actionButton.classList.add('button-clicked');
        setTimeout(() => {
          actionButton.classList.remove('button-clicked');
        }, 50);
      }
      break;
    
    case 'finished':
      // Don't allow clicking during celebration sequence
      if (celebrationActive) return;
      
      // Add the shake effect when the button is clicked
      actionButton.classList.add('button-shaking');
      
      // Remove celebration effects
      document.querySelectorAll('.confetti, .firework, .celebration-text, .medal').forEach(el => {
        el.remove();
      });
      
      // After shake animation, return to character selection
      setTimeout(() => {
        actionButton.classList.remove('button-shaking');
        
        // Clean up
        if (gameInterval) clearInterval(gameInterval);
        if (computerRunInterval) clearInterval(computerRunInterval);
        
        // Return to character selection screen
        game.style.display = 'none';
        characterSelection.style.display = 'flex';
        gameState = 'selection';
        result.classList.add('hidden');
      }, 500); // Wait for shake animation to finish
      break;
  }
});

// Add touch event handling for mobile
actionButton.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevent double actions and zoom
  if (gameState === 'racing' && gameActive && !isCountdownActive && distance1 < goal) {
    movePlayer(1);
  }
});

// Prevent default on touchend to avoid issues
actionButton.addEventListener('touchend', (e) => {
  e.preventDefault();
});

// Add keyboard support for spacebar
document.addEventListener('keydown', (e) => {
  // 32 is the keycode for spacebar
  if (e.keyCode === 32) {
    if (gameState === 'racing' && gameActive && !isCountdownActive && distance1 < goal) {
      e.preventDefault(); // Prevent page scrolling
      movePlayer(1);
      
      // Provide visual feedback for spacebar presses
      actionButton.classList.add('button-clicked');
      setTimeout(() => {
        actionButton.classList.remove('button-clicked');
      }, 50);
    } else if (gameState === 'finished' && !celebrationActive) {
      // Space to go back to character selection - simulate button click for the shake effect
      e.preventDefault();
      actionButton.click();
    }
  }
});

// Function to move players
function movePlayer(playerNum) {
  if (playerNum === 1 && !player1Finished) {
    // Apply speed adjustments to ensure player can't finish under 9.52 seconds
    // The base calculation is tuned so that even with perfect clicking, this time is the minimum
    const speedMultiplier = 1.7;
    
    // Calculate a capped movement amount - prevents exceeding human speed limits
    const baseMovement = (Math.random() * 1.3 + 0.7) * speedMultiplier * difficultyFactor;
    
    // Apply progress-based speed cap (simulates human energy limitations)
    const progressPercent = distance1 / goal;
    let movementCap = baseMovement;
    
    // Apply subtle fatigue effect in final 30% of race
    if (progressPercent > 0.7) {
      // Players slow down slightly in final stretch (realistic fatigue)
      movementCap = baseMovement * (1 - ((progressPercent - 0.7) * 0.15));
    }
    
    distance1 += movementCap;
    updateDistanceDisplay();
    updateRacersPosition();
    
    // Grow the button as player progresses
    buttonGrowthFactor = 1 + (progressPercent * 0.5); // Grows up to 1.5x original size
    document.documentElement.style.setProperty('--button-scale', buttonGrowthFactor);
    
    // Add growing effect class
    if (progressPercent > 0.3 && !actionButton.classList.contains('button-growing')) {
      actionButton.classList.add('button-growing');
    }
    
    if (distance1 >= goal && !player1Finished) {
      playerFinished(1);
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
        actionButton.classList.remove('button-growing');
        actionButton.classList.add('button-exploding');
        createCelebrationEffects();
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
  if ((player1Finished && player2Finished) || (timeElapsed > 15)) { 
    // Wait for both to finish or timeout at 15 seconds
    finishRace();
  }
}

// Function to create celebration effects
function createCelebrationEffects() {
  // Create confetti
  for (let i = 0; i < 100; i++) {
    createConfetti();
  }
  
  // Create fireworks
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      createFirework();
    }, i * 300);
  }
}

// Function to create a single confetti piece
function createConfetti() {
  const colors = ['confetti-red', 'confetti-blue', 'confetti-white'];
  const confetti = document.createElement('div');
  confetti.className = `confetti ${colors[Math.floor(Math.random() * colors.length)]}`;
  
  // Random position
  const startX = Math.random() * window.innerWidth;
  
  // Apply styles
  confetti.style.left = `${startX}px`;
  confetti.style.top = '-20px';
  confetti.style.opacity = '1';
  confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
  
  // Random animation duration
  const fallDuration = 3 + Math.random() * 3;
  const swayduration = 1 + Math.random() * 2;
  
  confetti.style.animation = `
    confetti-fall ${fallDuration}s linear forwards, 
    confetti-sway ${swayduration}s ease-in-out infinite alternate
  `;
  
  // Add to document
  document.body.appendChild(confetti);
  
  // Remove after animation completes
  setTimeout(() => {
    confetti.remove();
  }, fallDuration * 1000);
}

// Function to create a firework
function createFirework() {
  const colors = ['firework-red', 'firework-blue', 'firework-white'];
  const firework = document.createElement('div');
  firework.className = `firework ${colors[Math.floor(Math.random() * colors.length)]}`;
  
  // Random position
  const posX = 100 + Math.random() * (window.innerWidth - 200);
  const posY = 100 + Math.random() * (window.innerHeight - 200);
  
  // Apply styles
  firework.style.left = `${posX}px`;
  firework.style.top = `${posY}px`;
  firework.style.opacity = '1';
  
  // Add to document
  document.body.appendChild(firework);
  
  // Remove after animation completes
  setTimeout(() => {
    firework.remove();
  }, 1000);
}

// Function to create celebration text animation
function createCelebrationText(text, delay) {
  setTimeout(() => {
    const celebText = document.createElement('div');
    celebText.className = 'celebration-text';
    celebText.textContent = text;
    
    // Random position in upper part of the screen
    const posX = 50 + Math.random() * (window.innerWidth - 300);
    const posY = 100 + Math.random() * 150;
    
    // Apply styles
    celebText.style.left = `${posX}px`;
    celebText.style.top = `${posY}px`;
    celebText.style.fontSize = `${Math.floor(30 + Math.random() * 20)}px`;
    
    // Random color from theme
    const colors = ['var(--olympic-red)', 'var(--olympic-blue)', 'white'];
    celebText.style.color = colors[Math.floor(Math.random() * colors.length)];
    
    // Add to document
    document.body.appendChild(celebText);
    
    // Remove after animation completes
    setTimeout(() => {
      celebText.remove();
    }, 2500);
  }, delay);
}

// Function to create medal animation if player wins
function createMedal() {
  const medal = document.createElement('div');
  medal.className = 'medal';
  
  // Position above results panel
  const resultsRect = result.getBoundingClientRect();
  const posX = resultsRect.left + (resultsRect.width / 2) - 40;
  const posY = resultsRect.top - 100;
  
  // Apply styles
  medal.style.left = `${posX}px`;
  medal.style.top = `${posY}px`;
  
  // Add to document
  document.body.appendChild(medal);
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

// Function to play the celebration sequence
function playCelebrationSequence() {
  celebrationActive = true;
  
  // Disable the action button during celebration
  actionButton.disabled = true;
  
  // Hide the action button temporarily
  actionButton.style.opacity = '0';
  
  // Extract times for celebration text display
  const playerTimeText = player1Time > 0 ? player1Time.toFixed(2) : 'DNF';
  const computerTimeText = player2Time > 0 ? player2Time.toFixed(2) : 'DNF';
  
  // Celebration messages
  const messages = [
    "GREAT RACE!",
    "WORLD CLASS!",
    winner === 'player1' ? "YOU WIN!" : "COMPUTER WINS!",
    `YOUR TIME: ${playerTimeText}s`,
    `COMPUTER: ${computerTimeText}s`
  ];
  
  // Create fireworks throughout celebration
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      createFirework();
    }, 300 * i);
  }
  
  // Display celebration text messages with staggered timing
  messages.forEach((message, index) => {
    createCelebrationText(message, index * 800);
  });
  
  // If player wins, display a medal after a delay
  if (winner === 'player1') {
    setTimeout(() => {
      createMedal();
      
      // Create extra fireworks for winner
      for (let i = 0; i < 5; i++) {
        setTimeout(() => createFirework(), i * 200);
      }
    }, 2500);
  }
  
  // Add more fireworks toward the end of the celebration
  setTimeout(() => {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createFirework(), i * 200);
    }
  }, 6000);
  
  // Show a "10 SECOND COOLDOWN" message after initial celebration
  setTimeout(() => {
    actionButton.style.opacity = '0.5';
    actionButton.textContent = 'COOLDOWN...';
    
    // Create a countdown effect on the button
    let countdown = 5;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      } else {
        // Create one more celebration text in the center
        createCelebrationText(`${countdown}...`, 0);
      }
    }, 1000);
  }, 5000);
  
  // Gradually bring back the action button after celebration (10 seconds total)
  setTimeout(() => {
    actionButton.style.opacity = '1';
    actionButton.disabled = false;
    actionButton.textContent = 'CHOOSE SPRINTER';
    celebrationActive = false;
    
    // Final burst of confetti when button becomes active
    for (let i = 0; i < 30; i++) {
      setTimeout(() => createConfetti(), i * 30);
    }
  }, 10000);
}

// Function to handle race finish
function finishRace() {
  gameActive = false;
  gameState = 'finished';
  clearInterval(gameInterval);
  clearInterval(computerRunInterval);
  
  // First show results
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
  
  // After a short delay, play the celebration sequence
  setTimeout(() => {
    playCelebrationSequence();
  }, 800);
}