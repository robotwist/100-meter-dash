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
let gameState = 'selection'; // Tracks current game state: selection, countdown, racing, finished, post-race
let difficultyFactor = 0.65; // Adjusted to make game challenging but allow for realistic times
let celebrationActive = false; // Flag to track if celebration sequence is active
let currentLevel = 1; // Current game level
let maxRegularLevels = 5; // Number of regular levels before space level
let spaceModeActive = false; // Flag for space mode (level 6+)
let powerUps = []; // Array to store active power-ups in space mode
let aliensDefeated = 0; // Counter for defeated aliens in space mode
let viewingLeaderboard = false; // Flag for when viewing the leaderboard
let topTimesData = {}; // Object to store top times for each level
let pendingInitialsEntry = null; // Object to store pending top time entry needing initials
let currentInitialsPosition = 0; // Tracks current position in initials input
let currentInitials = "AAA"; // Default initials value
let recentlyLost = false; // Track if player recently lost
let comebackBoostActive = false; // Track if comeback boost is active

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
const postRaceScreen = document.getElementById('postRaceScreen');
const levelDisplay = document.getElementById('levelDisplay');
const postRaceTimeInfo = document.getElementById('postRaceTimeInfo');
const continueButton = document.getElementById('continueButton');
const leaderboardScreen = document.getElementById('leaderboardScreen');
const leaderboardContent = document.getElementById('leaderboardContent');
const leaderboardTabs = document.getElementById('leaderboardTabs');
const viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn');
const backFromLeaderboardBtn = document.getElementById('backFromLeaderboardBtn');
const initialsPopup = document.getElementById('initialsPopup');
const initialsInput = document.getElementById('initialsInput');
const recordPositionDisplay = document.getElementById('recordPosition');
const recordTimeDisplay = document.getElementById('recordTime');
const submitInitialsBtn = document.getElementById('submitInitials');
const charUpBtn = document.getElementById('charUp');
const charDownBtn = document.getElementById('charDown');
const selectedCharDisplay = document.querySelector('.selected-char');

// Initialize top times data
function initializeTopTimes() {
  // Try to load saved data from localStorage
  const savedData = localStorage.getItem('100meterDashTopTimes');
  
  if (savedData) {
    topTimesData = JSON.parse(savedData);
  } else {
    // Initialize empty data for each level
    topTimesData = {
      'level1': [],
      'level2': [],
      'level3': [],
      'level4': [],
      'level5': [],
      'space': []
    };
    
    // Save the initial empty data
    saveTopTimes();
  }
}

// Save top times to localStorage
function saveTopTimes() {
  localStorage.setItem('100meterDashTopTimes', JSON.stringify(topTimesData));
}

// Check if a time would qualify for the top 5
function wouldQualifyForTopTimes(level, time) {
  const levelKey = level > maxRegularLevels ? 'space' : `level${level}`;
  
  // If we don't have 5 times yet, it automatically qualifies
  if (!topTimesData[levelKey] || topTimesData[levelKey].length < 5) {
    return true;
  }
  
  // Otherwise, check if it's better than the worst time
  const worstTime = topTimesData[levelKey][4].time;
  return time < worstTime;
}

// Show the initials entry popup
function showInitialsPopup(level, time, position) {
  // Store the pending entry details
  pendingInitialsEntry = {
    level: level,
    time: time,
    position: position
  };
  
  // Reset the initials input and display
  currentInitials = "AAA";
  currentInitialsPosition = 0;
  
  // Update the character boxes
  updateCharacterBoxes();
  
  // Set the first character as active
  setActiveCharacter(0);
  
  // Update displays
  recordPositionDisplay.textContent = position;
  recordTimeDisplay.textContent = time.toFixed(2);
  
  // Show the popup
  initialsPopup.classList.remove('hidden');
}

// Update all character boxes with current initials
function updateCharacterBoxes() {
  const chars = currentInitials.split('');
  for (let i = 0; i < 3; i++) {
    const charBox = document.getElementById(`char${i+1}`);
    if (charBox) {
      charBox.textContent = chars[i] || ' ';
    }
  }
}

// Set the active character position with visual highlight
function setActiveCharacter(position) {
  // Remove active class from all characters
  for (let i = 1; i <= 3; i++) {
    const charBox = document.getElementById(`char${i}`);
    if (charBox) {
      charBox.classList.remove('active');
    }
  }
  
  // Add active class to current position
  const activeBox = document.getElementById(`char${position + 1}`);
  if (activeBox) {
    activeBox.classList.add('active');
  }
  
  // Update the current position
  currentInitialsPosition = position;
}

// Function to handle character cycling for initials entry
function cycleCharacter(direction, position = currentInitialsPosition) {
  // Valid characters for arcade-style initials (A-Z, 0-9, space)
  const validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  
  // Get the current character from the initials
  let initialsArray = currentInitials.split('');
  let currentChar = initialsArray[position];
  
  // Find the index of the current character
  let charIndex = validChars.indexOf(currentChar);
  
  // Adjust index based on direction
  if (direction === 'up') {
    charIndex = (charIndex + 1) % validChars.length;
  } else {
    charIndex = (charIndex - 1 + validChars.length) % validChars.length;
  }
  
  // Update the character
  const newChar = validChars[charIndex];
  initialsArray[position] = newChar;
  currentInitials = initialsArray.join('');
  
  // Update the display
  updateCharacterBoxes();
}

// Set a specific character at a position
function setCharacter(char, position = currentInitialsPosition) {
  // Valid characters only
  const validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  
  // If character is valid
  if (validChars.includes(char)) {
    let initialsArray = currentInitials.split('');
    initialsArray[position] = char;
    currentInitials = initialsArray.join('');
    
    // Update the display
    updateCharacterBoxes();
    
    // Auto-advance to next position if not at the end
    if (position < 2) {
      setActiveCharacter(position + 1);
    }
  }
}

// Submit the initials
function submitInitials() {
  if (pendingInitialsEntry) {
    // Add the time with the entered initials
    addTopTime(
      pendingInitialsEntry.level, 
      pendingInitialsEntry.time, 
      currentInitials
    );
    
    // Hide the popup
    initialsPopup.classList.add('hidden');
    
    // Update the top times display
    updateTopTimesDisplay();
    
    // Clear the pending entry
    pendingInitialsEntry = null;
    
    // Highlight the continue button to guide the player to the next step
    if (continueButton) {
      continueButton.classList.add('continue-highlight');
      
      // Create celebration text indicating next step
      setTimeout(() => {
        createCelebrationText("PROCEED TO NEXT LEVEL!", 0);
      }, 500);
      
      // Pulse animation to draw attention
      setTimeout(() => {
        continueButton.classList.remove('continue-highlight');
      }, 3000);
    }
  }
}

// Function to show the leaderboard screen
function showLeaderboard() {
  viewingLeaderboard = true;
  
  // Hide other screens
  characterSelection.style.display = 'none';
  game.style.display = 'none';
  postRaceScreen.style.display = 'none';
  
  // Show leaderboard
  leaderboardScreen.style.display = 'flex';
  
  // Default to showing level 1 times
  updateLeaderboardDisplay('level1');
}

// Function to hide the leaderboard and return to previous screen
function hideLeaderboard() {
  viewingLeaderboard = false;
  leaderboardScreen.style.display = 'none';
  
  // Return to appropriate screen based on game state
  if (gameState === 'post-race') {
    postRaceScreen.style.display = 'flex';
  } else {
    characterSelection.style.display = 'flex';
  }
}

// Initialize top times on game load
initializeTopTimes();

// Event listeners for leaderboard buttons
if (viewLeaderboardBtn) {
  viewLeaderboardBtn.addEventListener('click', showLeaderboard);
}

if (backFromLeaderboardBtn) {
  backFromLeaderboardBtn.addEventListener('click', hideLeaderboard);
}

// Event listeners for leaderboard tabs
if (leaderboardTabs) {
  leaderboardTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('leaderboard-tab')) {
      const levelKey = e.target.dataset.level;
      updateLeaderboardDisplay(levelKey);
    }
  });
}

// Event listeners for input
document.addEventListener('DOMContentLoaded', function() {
  // Add listeners for up/down buttons
  document.querySelectorAll('.up-button').forEach(button => {
    button.addEventListener('click', () => {
      const position = parseInt(button.dataset.pos);
      cycleCharacter('up', position);
      setActiveCharacter(position);
    });
  });
  
  document.querySelectorAll('.down-button').forEach(button => {
    button.addEventListener('click', () => {
      const position = parseInt(button.dataset.pos);
      cycleCharacter('down', position);
      setActiveCharacter(position);
    });
  });
  
  // Add listeners for character boxes (when clicked, make active)
  document.querySelectorAll('.character-box').forEach((box, index) => {
    box.addEventListener('click', () => {
      setActiveCharacter(index);
    });
  });
  
  // Global keyboard listener when popup is open
  document.addEventListener('keydown', (e) => {
    if (initialsPopup && !initialsPopup.classList.contains('hidden')) {
      // For letter and number keys
      if (e.key.length === 1) {
        const char = e.key.toUpperCase();
        setCharacter(char);
        e.preventDefault();
      }
      // Arrow keys for navigation
      else if (e.key === 'ArrowLeft' && currentInitialsPosition > 0) {
        setActiveCharacter(currentInitialsPosition - 1);
        e.preventDefault();
      }
      else if (e.key === 'ArrowRight' && currentInitialsPosition < 2) {
        setActiveCharacter(currentInitialsPosition + 1);
        e.preventDefault();
      }
      else if (e.key === 'ArrowUp') {
        cycleCharacter('up');
        e.preventDefault();
      }
      else if (e.key === 'ArrowDown') {
        cycleCharacter('down');
        e.preventDefault();
      }
      // Enter or Space to submit
      else if (e.key === 'Enter' || e.key === ' ') {
        submitInitials();
        e.preventDefault();
      }
    }
  });
  
  // Submit button
  if (submitInitialsBtn) {
    submitInitialsBtn.addEventListener('click', submitInitials);
  }
});

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

// Function to create custom comeback boost celebration
function createComebackEffect() {
  // Create special comeback text
  const comebackText = document.createElement('div');
  comebackText.className = 'comeback-text';
  comebackText.textContent = "COMEBACK BOOST ACTIVATED!";
  
  // Position in the center of the screen
  const posX = window.innerWidth / 2 - 200;
  const posY = window.innerHeight / 2 - 100;
  
  // Apply styles
  comebackText.style.left = `${posX}px`;
  comebackText.style.top = `${posY}px`;
  
  // Add to document
  document.body.appendChild(comebackText);
  
  // Create golden particles
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'confetti confetti-gold';
      
      // Random position around the player
      const playerRect = document.querySelector('.racer-1').getBoundingClientRect();
      const startX = playerRect.left + (Math.random() * playerRect.width);
      const startY = playerRect.top + (Math.random() * playerRect.height);
      
      // Apply styles
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.opacity = '1';
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      // Random animation duration
      const fallDuration = 2 + Math.random() * 2;
      
      particle.style.animation = `
        confetti-fall ${fallDuration}s linear forwards, 
        confetti-sway ${fallDuration / 2}s ease-in-out infinite alternate
      `;
      
      // Add to document
      document.body.appendChild(particle);
      
      // Remove after animation completes
      setTimeout(() => {
        particle.remove();
      }, fallDuration * 1000);
    }, i * 20);
  }
  
  // Remove comeback text after animation
  setTimeout(() => {
    comebackText.remove();
    
    // Add second message
    const speedText = document.createElement('div');
    speedText.className = 'comeback-text';
    speedText.textContent = "SPEED +25%!";
    
    // Position
    speedText.style.left = `${posX + 50}px`;
    speedText.style.top = `${posY + 60}px`;
    
    // Add to document
    document.body.appendChild(speedText);
    
    // Remove after animation
    setTimeout(() => {
      speedText.remove();
    }, 2500);
  }, 2500);
}

// Function to setup the game and start countdown
function setupGame() {
  // Hide character selection and show game
  characterSelection.style.display = 'none';
  game.style.display = 'flex';
  postRaceScreen.style.display = 'none';
  leaderboardScreen.style.display = 'none';
  
  // Check if we should enter space mode (level 6)
  spaceModeActive = currentLevel > maxRegularLevels;
  
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
  viewingLeaderboard = false;
  
  // Check if the player should get a comeback boost (level 3 after a loss)
  comebackBoostActive = (currentLevel === 3 && recentlyLost);
  
  // Update the level display
  if (levelDisplay) {
    levelDisplay.textContent = spaceModeActive ? 'SPACE MODE' : `LEVEL ${currentLevel}`;
  }
  
  // Reset button appearance and text
  actionButton.classList.remove('button-exploding', 'button-growing', 'button-shaking');
  actionButton.textContent = 'READY...';
  actionButton.disabled = true;
  document.documentElement.style.setProperty('--button-scale', buttonGrowthFactor);
  
  // Update displays
  updateDistanceDisplay();
  timeDisplay.textContent = '0.00';
  
  // If in space mode, set up the special space race
  if (spaceModeActive) {
    setupSpaceMode();
  } else {
    // Regular race mode
    // Position racers at start line
    document.querySelector('.racer-1').style.left = '0';
    document.querySelector('.racer-2').style.left = '0';
  }
  
  // Hide results
  result.classList.add('hidden');
  
  // Clean up any existing celebration effects
  document.querySelectorAll('.confetti, .firework, .celebration-text, .medal, .powerup, .alien, .comeback-text').forEach(el => {
    el.remove();
  });
  
  // Apply comeback boost visual effect if active
  if (comebackBoostActive) {
    // Wait until after countdown to show boost effect
    setTimeout(() => {
      createComebackEffect();
      // Show visual effect on player
      player1Sprite.classList.add('boosted');
    }, 4500); // Show after countdown finishes
  } else {
    // Remove boosted class if it exists
    player1Sprite.classList.remove('boosted');
  }
  
  // Start countdown
  startCountdown();
}

// Function to setup space mode
function setupSpaceMode() {
  // Change track background to space
  document.querySelector('.racetrack').classList.add('space-track');
  
  // Change character sprites to flying versions if available
  if (player1Character === 'bolt') {
    player1Sprite.src = 'bolt-flying.gif';
  } else {
    player1Sprite.src = 'nkdman-flying.gif';
  }
  
  // Add aliens to the track
  spawnAliens();
  
  // Add power-ups to collect
  spawnPowerUps();
  
  // Reset counter
  aliensDefeated = 0;
  powerUps = [];
}

// Function to spawn aliens
function spawnAliens() {
  const track = document.querySelector('.racetrack');
  // Create 5 aliens at different distances
  for (let i = 0; i < 5; i++) {
    const alien = document.createElement('div');
    alien.className = 'alien';
    
    // Position aliens along the track
    const position = 20 + (i * 15); // Distribute them across the track
    alien.style.left = `${position}%`;
    alien.style.top = `${20 + Math.random() * 60}%`;
    
    // Add a data attribute for tracking
    alien.dataset.health = 2; // Takes 2 hits to defeat
    
    track.appendChild(alien);
  }
}

// Function to spawn power-ups
function spawnPowerUps() {
  const track = document.querySelector('.racetrack');
  // Create 3 power-ups
  const powerUpTypes = ['speed', 'shield', 'blaster'];
  
  for (let i = 0; i < 3; i++) {
    const powerUp = document.createElement('div');
    powerUp.className = `powerup ${powerUpTypes[i]}`;
    
    // Position power-ups along the track
    const position = 30 + (i * 20); // Distribute them across the track
    powerUp.style.left = `${position}%`;
    powerUp.style.top = `${10 + Math.random() * 80}%`;
    
    // Add a data attribute for tracking type
    powerUp.dataset.type = powerUpTypes[i];
    
    track.appendChild(powerUp);
  }
}

// Function to collect a power-up
function collectPowerUp(powerUpElement) {
  const type = powerUpElement.dataset.type;
  
  // Apply power-up effect
  switch(type) {
    case 'speed':
      // Temporary speed boost
      difficultyFactor *= 1.5;
      setTimeout(() => {
        difficultyFactor /= 1.5;
      }, 3000);
      break;
    case 'shield':
      // Add shield visual effect to player
      player1Sprite.classList.add('shielded');
      setTimeout(() => {
        player1Sprite.classList.remove('shielded');
      }, 5000);
      break;
    case 'blaster':
      // Enable blaster for shooting aliens
      player1Sprite.classList.add('armed');
      setTimeout(() => {
        player1Sprite.classList.remove('armed');
      }, 8000);
      break;
  }
  
  // Create visual feedback
  createCelebrationText(`${type.toUpperCase()} BOOST!`, 0);
  
  // Remove power-up from screen
  powerUpElement.remove();
}

// Function to shoot at aliens
function shootAlien() {
  if (!player1Sprite.classList.contains('armed')) return;
  
  // Create laser beam
  const laser = document.createElement('div');
  laser.className = 'laser';
  
  // Get player position
  const playerPos = document.querySelector('.racer-1').getBoundingClientRect();
  laser.style.left = `${playerPos.right}px`;
  laser.style.top = `${playerPos.top + (playerPos.height/2)}px`;
  
  document.body.appendChild(laser);
  
  // Check for hits
  const aliens = document.querySelectorAll('.alien');
  aliens.forEach(alien => {
    const alienPos = alien.getBoundingClientRect();
    // Simple collision detection
    if (Math.abs(alienPos.top - playerPos.top) < 40) {
      // Hit!
      let health = parseInt(alien.dataset.health) - 1;
      if (health <= 0) {
        // Defeat alien
        alien.classList.add('defeated');
        setTimeout(() => alien.remove(), 500);
        aliensDefeated++;
        createCelebrationText('ALIEN DEFEATED!', 0);
      } else {
        alien.dataset.health = health;
        alien.classList.add('hit');
        setTimeout(() => alien.classList.remove('hit'), 300);
      }
    }
  });
  
  // Remove laser after animation
  setTimeout(() => laser.remove(), 1000);
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
  const player1Racer = document.querySelector('.racer-1');
  const player2Racer = document.querySelector('.racer-2');
  
  player1Racer.style.left = position1 + 'px';
  player2Racer.style.left = position2 + 'px';
  
  // Apply flame trail effect if boost is active
  if (comebackBoostActive) {
    player1Racer.classList.add('flame-trail');
  } else {
    player1Racer.classList.remove('flame-trail');
  }
  
  // In space mode, check for collisions with power-ups and aliens
  if (spaceModeActive) {
    // Check power-up collisions
    document.querySelectorAll('.powerup').forEach(powerUp => {
      const powerUpRect = powerUp.getBoundingClientRect();
      const playerRect = player1Racer.getBoundingClientRect();
      
      // Simple collision detection
      if (
        playerRect.right > powerUpRect.left &&
        playerRect.left < powerUpRect.right &&
        playerRect.bottom > powerUpRect.top &&
        playerRect.top < powerUpRect.bottom
      ) {
        collectPowerUp(powerUp);
      }
    });
    
    // Check if all aliens are defeated
    if (aliensDefeated >= 5) {
      // Auto-win if all aliens defeated
      playerFinished(1);
    }
  }
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
  
  // Set up computer player based on current level
  // Base time is 9.72-10.2 seconds, gets 5% faster each level
  const levelSpeedBoost = 1 - ((currentLevel - 1) * 0.05);
  const minTime = 9.72 * levelSpeedBoost;
  const maxTime = 10.2 * levelSpeedBoost;
  
  // Computer finishes between adjusted times based on level
  const computerFinishTime = Math.random() * (maxTime - minTime) + minTime;
  const updateInterval = 50; // 50ms update interval
  const distancePerUpdate = goal / (computerFinishTime * 1000 / updateInterval);
  
  // Show level-adjusted time in console for debugging
  console.log(`Level ${currentLevel} - Computer finish time: ${computerFinishTime.toFixed(2)}s`);
  
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
        
        // In space mode, also shoot if armed
        if (spaceModeActive && player1Sprite.classList.contains('armed')) {
          shootAlien();
        }
        
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
      
      // After shake animation, transition to post-race screen
      setTimeout(() => {
        actionButton.classList.remove('button-shaking');
        
        // Clean up
        if (gameInterval) clearInterval(gameInterval);
        if (computerRunInterval) clearInterval(computerRunInterval);
        
        // Transition to post-race screen
        showPostRaceScreen();
      }, 500); // Wait for shake animation to finish
      break;
      
    case 'post-race':
      // Return to character selection or next level
      if (winner === 'player1') {
        // Player won, advance to next level
        currentLevel++;
        recentlyLost = false; // Reset loss tracking after a win
        setupGame();
      } else {
        // Player lost, go back to character selection
        game.style.display = 'none';
        postRaceScreen.style.display = 'none';
        characterSelection.style.display = 'flex';
        gameState = 'selection';
        recentlyLost = true; // Track that player lost
        currentLevel = 1; // Reset to level 1
      }
      break;
  }
});

// Continue button on post-race screen
if (continueButton) {
  continueButton.addEventListener('click', () => {
    if (gameState === 'post-race') {
      // If there's a pending initials entry, handle it with default initials
      if (pendingInitialsEntry) {
        addTopTime(
          pendingInitialsEntry.level, 
          pendingInitialsEntry.time, 
          currentInitials || "AAA"
        );
        pendingInitialsEntry = null;
        initialsPopup.classList.add('hidden');
      }
      
      if (winner === 'player1') {
        // Player won, advance to next level
        currentLevel++;
        recentlyLost = false; // Reset loss tracking after a win
        setupGame();
      } else {
        // Player lost, go back to character selection
        game.style.display = 'none';
        postRaceScreen.style.display = 'none';
        characterSelection.style.display = 'flex';
        gameState = 'selection';
        recentlyLost = true; // Track that player lost
        currentLevel = 1; // Reset to level 1
      }
    }
  });
}

// Add touch event handling for mobile
actionButton.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevent double actions and zoom
  if (gameState === 'racing' && gameActive && !isCountdownActive && distance1 < goal) {
    movePlayer(1);
    
    // In space mode, also shoot if armed
    if (spaceModeActive && player1Sprite.classList.contains('armed')) {
      shootAlien();
    }
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
    // If the initials popup is visible, submit on spacebar
    if (!initialsPopup.classList.contains('hidden')) {
      e.preventDefault();
      submitInitials();
      return;
    }
    
    if (gameState === 'racing' && gameActive && !isCountdownActive && distance1 < goal) {
      e.preventDefault(); // Prevent page scrolling
      movePlayer(1);
      
      // In space mode, also shoot if armed
      if (spaceModeActive && player1Sprite.classList.contains('armed')) {
        shootAlien();
      }
      
      // Provide visual feedback for spacebar presses
      actionButton.classList.add('button-clicked');
      setTimeout(() => {
        actionButton.classList.remove('button-clicked');
      }, 50);
    } else if (gameState === 'finished' && !celebrationActive) {
      // Space to go to post-race screen - simulate button click for the shake effect
      e.preventDefault();
      actionButton.click();
    } else if (gameState === 'post-race') {
      // Space to continue to next level or character selection
      e.preventDefault();
      if (continueButton) {
        continueButton.click();
      } else {
        // Fallback if continue button doesn't exist
        actionButton.click();
      }
    }
  }
});

// Function to show the post-race screen
function showPostRaceScreen() {
  gameState = 'post-race';
  game.style.display = 'none';
  postRaceScreen.style.display = 'flex';
  leaderboardScreen.style.display = 'none';
  
  // Update level display on post-race screen
  document.getElementById('postRaceLevel').textContent = spaceModeActive ? 'SPACE MODE' : `LEVEL ${currentLevel}`;
  
  // Update times and winner
  const playerTimeText = player1Time.toFixed(2);
  const computerTimeText = player2Time.toFixed(2);
  document.getElementById('playerTimeDisplay').textContent = playerTimeText;
  document.getElementById('computerTimeDisplay').textContent = computerTimeText;
  
  // Calculate and display time difference
  const timeDiff = Math.abs(player1Time - player2Time).toFixed(2);
  document.getElementById('timeDifference').textContent = timeDiff;
  
  // Show winner message
  const resultMessage = winner === 'player1' 
    ? 'VICTORY! ADVANCE TO NEXT LEVEL' 
    : 'DEFEAT! TRY AGAIN FROM LEVEL 1';
  document.getElementById('postRaceResult').textContent = resultMessage;
  
  // If in space mode and player won, show special message
  if (spaceModeActive && winner === 'player1') {
    document.getElementById('postRaceResult').textContent = 'CONGRATULATIONS! YOU SAVED THE GALAXY!';
    // Maybe add some special effects or bonus content here
  }
  
  // If player won and will enter space mode next, show teaser
  if (winner === 'player1' && currentLevel === maxRegularLevels) {
    document.getElementById('postRaceResult').textContent += ' - PREPARE FOR SPACE MODE!';
  }
  
  // Update continue button text based on win/loss
  if (continueButton) {
    continueButton.textContent = winner === 'player1' ? 'NEXT LEVEL' : 'BACK TO START';
  }
  
  // Update level markers
  updateLevelMarkers();
  
  // Add some celebratory effects
  if (winner === 'player1') {
    for (let i = 0; i < 50; i++) {
      setTimeout(() => createConfetti(), i * 20);
    }
  }
  
  // First update the top times display without the new record
  updateTopTimesDisplay();
  
  // If player won, check if they made the top 5 times
  if (winner === 'player1') {
    if (wouldQualifyForTopTimes(currentLevel, player1Time)) {
      // Determine approximately what position they'd be in
      const levelKey = spaceModeActive ? 'space' : `level${currentLevel}`;
      const times = [...(topTimesData[levelKey] || []), {time: player1Time}];
      times.sort((a, b) => a.time - b.time);
      const position = times.findIndex(record => Math.abs(record.time - player1Time) < 0.01) + 1;
      
      // Show the new record indicator
      const newRecordIndicator = document.getElementById('newRecordIndicator');
      if (newRecordIndicator) {
        newRecordIndicator.style.display = 'block';
        
        // Hide it after a while
        setTimeout(() => {
          newRecordIndicator.style.display = 'none';
        }, 5000);
      }
      
      // Add a celebration text
      setTimeout(() => {
        createCelebrationText("NEW TOP RECORD!", 0);
      }, 1000);
      
      // Show the initials popup after a delay to allow player to see results first
      setTimeout(() => {
        showInitialsPopup(currentLevel, player1Time, position);
      }, 1500);
    }
  }
}

// Function to update the top times display in the post-race screen
function updateTopTimesDisplay() {
  const topTimesContainer = document.getElementById('topTimesContainer');
  if (!topTimesContainer) return;
  
  // Determine which level key to use
  const levelKey = spaceModeActive ? 'space' : `level${currentLevel}`;
  
  // Get the times for this level
  const times = topTimesData[levelKey] || [];
  
  // Clear existing content
  topTimesContainer.innerHTML = '';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'top-times-header';
  header.textContent = 'TOP 5 TIMES';
  topTimesContainer.appendChild(header);
  
  if (times.length === 0) {
    // No times yet
    const noTimesMsg = document.createElement('div');
    noTimesMsg.className = 'no-times-message';
    noTimesMsg.textContent = 'No previous records for this level';
    topTimesContainer.appendChild(noTimesMsg);
    return;
  }
  
  // Create a list for the times
  const timesList = document.createElement('div');
  timesList.className = 'top-times-list';
  
  // Add each time to the list
  times.forEach((record, index) => {
    const timeItem = document.createElement('div');
    timeItem.className = 'top-time-item';
    
    // Highlight if this is the current time
    if (winner === 'player1' && Math.abs(record.time - player1Time) < 0.01 && record.character === player1Character) {
      timeItem.classList.add('current-time');
    }
    
    timeItem.innerHTML = `
      <span class="time-rank">${index + 1}</span>
      <span class="time-value">${record.time.toFixed(2)}s</span>
      <span class="time-initials">${record.initials || "---"}</span>
      <span class="time-date">${record.date}</span>
    `;
    
    timesList.appendChild(timeItem);
  });
  
  topTimesContainer.appendChild(timesList);
}

// Function to update the level progress markers
function updateLevelMarkers() {
  // Reset all markers
  document.querySelectorAll('.level-marker').forEach(marker => {
    marker.classList.remove('active', 'completed');
  });
  
  // Get current active level marker
  const activeMarker = document.querySelector(`.level-marker[data-level="${spaceModeActive ? 6 : currentLevel}"]`);
  if (activeMarker) {
    activeMarker.classList.add('active');
  }
  
  // Mark completed levels
  for (let i = 1; i < currentLevel; i++) {
    const marker = document.querySelector(`.level-marker[data-level="${i}"]`);
    if (marker) {
      marker.classList.add('completed');
    }
  }
}

// Function to move players
function movePlayer(playerNum) {
  if (playerNum === 1 && !player1Finished) {
    // Apply speed adjustments to ensure player can't finish under 9.52 seconds
    // The base calculation is tuned so that even with perfect clicking, this time is the minimum
    const speedMultiplier = 1.7;
    
    // Apply comeback boost if active (25% speed boost)
    const boostMultiplier = comebackBoostActive ? 1.25 : 1.0;
    
    // Calculate a capped movement amount - prevents exceeding human speed limits
    const baseMovement = (Math.random() * 1.3 + 0.7) * speedMultiplier * difficultyFactor * boostMultiplier;
    
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
    `LEVEL ${currentLevel} COMPLETE!`,
    winner === 'player1' ? "YOU WIN!" : "COMPUTER WINS!",
    `YOUR TIME: ${playerTimeText}s`,
    `COMPUTER: ${computerTimeText}s`
  ];
  
  // Special messages for space mode
  if (spaceModeActive) {
    messages[0] = "SPACE RACE COMPLETE!";
    if (winner === 'player1') {
      messages.push("ALIENS DEFEATED!");
    }
  }
  
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
    actionButton.textContent = 'SEE RESULTS';
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
  
  // Add level information
  resultMessage += `
    <div class="result-row">
      <span class="result-label">Current level:</span>
      <span class="result-time"><span class="level-display">${spaceModeActive ? 'SPACE' : currentLevel}</span></span>
    </div>
  `;
  
  resultMessage += '</div>';
  finishTime.innerHTML = resultMessage;
  
  // After a short delay, play the celebration sequence
  setTimeout(() => {
    playCelebrationSequence();
  }, 800);
}

// Update the CSS for the leaderboard to include the initials column
document.addEventListener('DOMContentLoaded', function() {
  // Check if styles need to be updated to support initials
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .leaderboard-header, .leaderboard-row {
      grid-template-columns: 60px 1fr 1fr 1fr !important;
    }
    
    .time-initials {
      color: var(--olympic-gold);
      font-weight: bold;
      margin-right: 10px;
    }
    
    @media (max-width: 600px) {
      .leaderboard-header, .leaderboard-row {
        grid-template-columns: 40px 1fr 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleElement);
});

// Add a new time to the appropriate level's top times
function addTopTime(level, time, initials) {
  // Determine which level key to use
  const levelKey = level > maxRegularLevels ? 'space' : `level${level}`;
  
  // If this level doesn't exist in the data, initialize it
  if (!topTimesData[levelKey]) {
    topTimesData[levelKey] = [];
  }
  
  // Create a record with the time, date, character and initials
  const newRecord = {
    time: time,
    date: new Date().toLocaleDateString(),
    character: player1Character,
    initials: initials || "AAA" // Default to AAA if no initials provided
  };
  
  // Add the new time to the array
  topTimesData[levelKey].push(newRecord);
  
  // Sort by time (ascending)
  topTimesData[levelKey].sort((a, b) => a.time - b.time);
  
  // Keep only the top 5
  if (topTimesData[levelKey].length > 5) {
    topTimesData[levelKey] = topTimesData[levelKey].slice(0, 5);
  }
  
  // Save to localStorage
  saveTopTimes();
  
  // Return position (1-5) or 0 if not in top 5
  const position = topTimesData[levelKey].findIndex(record => record === newRecord) + 1;
  return position > 0 && position <= 5 ? position : 0;
}

// Update the leaderboard display
function updateLeaderboardDisplay(levelKey = 'level1') {
  if (!leaderboardContent) return;
  
  // Clear existing content
  leaderboardContent.innerHTML = '';
  
  // Update active tab
  document.querySelectorAll('.leaderboard-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`.leaderboard-tab[data-level="${levelKey}"]`).classList.add('active');
  
  // Create header
  const header = document.createElement('div');
  header.className = 'leaderboard-header';
  
  const rankHeader = document.createElement('div');
  rankHeader.className = 'rank-header';
  rankHeader.textContent = 'RANK';
  
  const timeHeader = document.createElement('div');
  timeHeader.className = 'time-header';
  timeHeader.textContent = 'TIME';
  
  const initialsHeader = document.createElement('div');
  initialsHeader.className = 'initials-header';
  initialsHeader.textContent = 'INITIALS';
  
  const characterHeader = document.createElement('div');
  characterHeader.className = 'character-header';
  characterHeader.textContent = 'RUNNER';
  
  header.appendChild(rankHeader);
  header.appendChild(timeHeader);
  header.appendChild(initialsHeader);
  header.appendChild(characterHeader);
  leaderboardContent.appendChild(header);
  
  // Get the times for this level
  const times = topTimesData[levelKey] || [];
  
  if (times.length === 0) {
    // No times yet
    const noTimesMsg = document.createElement('div');
    noTimesMsg.className = 'no-times-message';
    noTimesMsg.textContent = 'No times recorded yet for this level. Complete a race to set a record!';
    leaderboardContent.appendChild(noTimesMsg);
    return;
  }
  
  // Add each time to the display
  times.forEach((record, index) => {
    const row = document.createElement('div');
    row.className = 'leaderboard-row';
    
    const rank = document.createElement('div');
    rank.className = 'rank';
    rank.textContent = `${index + 1}`;
    
    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = `${record.time.toFixed(2)}s`;
    
    const initials = document.createElement('div');
    initials.className = 'initials';
    initials.textContent = record.initials || "---";
    
    const character = document.createElement('div');
    character.className = 'character';
    character.textContent = record.character === 'bolt' ? 'Shock' : 'Nkdman';
    
    row.appendChild(rank);
    row.appendChild(time);
    row.appendChild(initials);
    row.appendChild(character);
    
    leaderboardContent.appendChild(row);
  });
}