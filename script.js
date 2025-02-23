// Game state
let selectedPet = null;
let gameOver = false;
let coins = 0;
let inventory = [];
let currentMood = 'happy';

let stats = {
    hunger: 50,
    health: 100,
    happiness: 75
};

let level = 1;
let experience = 0;

// Constants
const MOOD_STATES = {
    ecstatic: { icon: '🤩', name: 'Ecstatic', effects: { happiness: 1.2, health: 1.1 } },
    happy: { icon: '😊', name: 'Happy', effects: { happiness: 1.1 } },
    neutral: { icon: '😐', name: 'Neutral', effects: {} },
    sad: { icon: '😢', name: 'Sad', effects: { happiness: 0.9, health: 0.9 } },
    sick: { icon: '🤒', name: 'Sick', effects: { health: 0.8, hunger: 1.2 } }
};

const ITEMS = {
    apple: { icon: '🍎', name: 'Apple', effects: { hunger: -10, health: 5 } },
    candy: { icon: '🍬', name: 'Candy', effects: { happiness: 15, hunger: -5 } },
    medicine: { icon: '💊', name: 'Medicine', effects: { health: 20 } },
    toy: { icon: '🎾', name: 'Toy', effects: { happiness: 20 } }
};

const RANDOM_EVENTS = [
    {
        title: 'Lucky Find!',
        description: 'Your pet found a shiny coin!',
        reward: () => { addCoins(50); }
    },
    {
        title: 'Special Treat!',
        description: 'A magical apple appeared!',
        reward: () => { addToInventory('apple', 1); }
    },
    {
        title: 'Toy Discovery!',
        description: 'Your pet discovered a new toy!',
        reward: () => { addToInventory('toy', 1); }
    }
];

// Pet emojis
const pets = {
    cat: '🐱',
    dog: '🐕',
    rabbit: '🐰',
    hamster: '🐹'
};

// News messages
const newsMessages = [
    'Your pet looks at you with loving eyes.',
    'Your pet seems to be in a playful mood!',
    'A gentle purr fills the room.',
    'Your pet is dreaming of treats.',
    'Your pet follows you around the house.',
    'Time for some cuddles!',
    'Your pet found a cozy spot to rest.'
];

// DOM Elements
const petSelection = document.getElementById('pet-selection');
const gameContainer = document.getElementById('game-container');
const gameOverScreen = document.getElementById('game-over');
const petOptions = document.querySelectorAll('.pet-option');
const petDisplay = document.getElementById('pet-display');
const petNameDisplay = document.getElementById('pet-name');
const petLevelDisplay = document.getElementById('pet-level');
const newsTicker = document.getElementById('news-ticker');
const storeItems = document.querySelectorAll('.store-item');
const inventoryPanel = document.getElementById('inventory-panel');
const inventoryButton = document.getElementById('inventory-button');
const closeInventoryButton = document.getElementById('close-inventory');
const coinsDisplay = document.getElementById('coins');
const moodIcon = document.getElementById('mood-icon');
const moodName = document.getElementById('mood-name');
const moodEffects = document.getElementById('mood-effects');
const randomEventDisplay = document.getElementById('random-event');
const eventButton = document.getElementById('event-button');

// Initialize pet selection
petOptions.forEach(option => {
    option.addEventListener('click', () => {
        selectedPet = option.dataset.pet;
        startGame();
    });
});

// Inventory management
function addToInventory(itemId, quantity = 1) {
    const existingItem = inventory.find(item => item.id === itemId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        inventory.push({
            id: itemId,
            ...ITEMS[itemId],
            quantity: quantity
        });
    }
    updateInventoryDisplay();
}

function useItem(itemId) {
    const item = inventory.find(item => item.id === itemId);
    if (item && item.quantity > 0) {
        // Apply item effects
        Object.entries(item.effects).forEach(([stat, value]) => {
            if (stat === 'hunger') {
                stats.hunger = Math.max(0, Math.min(100, stats.hunger + value));
            } else if (stat === 'health') {
                stats.health = Math.max(0, Math.min(100, stats.health + value));
            } else if (stat === 'happiness') {
                stats.happiness = Math.max(0, Math.min(100, stats.happiness + value));
            }
        });

        item.quantity--;
        if (item.quantity <= 0) {
            inventory = inventory.filter(i => i.id !== itemId);
        }

        updateDisplay();
        updateInventoryDisplay();
        addExperience(5);
    }
}

function updateInventoryDisplay() {
    const inventoryGrid = document.getElementById('inventory-grid');
    inventoryGrid.innerHTML = '';

    inventory.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-quantity">x${item.quantity}</div>
        `;
        itemElement.addEventListener('click', () => useItem(item.id));
        inventoryGrid.appendChild(itemElement);
    });
}

// Currency system
function addCoins(amount) {
    coins += amount;
    coinsDisplay.textContent = coins;
}

// Mood system
function updateMood() {
    let newMood;
    if (stats.health < 30) {
        newMood = 'sick';
    } else if (stats.happiness < 30) {
        newMood = 'sad';
    } else if (stats.happiness > 80 && stats.health > 80) {
        newMood = 'ecstatic';
    } else if (stats.happiness > 60) {
        newMood = 'happy';
    } else {
        newMood = 'neutral';
    }

    if (newMood !== currentMood) {
        currentMood = newMood;
        const moodState = MOOD_STATES[currentMood];
        moodIcon.textContent = moodState.icon;
        moodName.textContent = moodState.name;

        // Display mood effects
        const effects = [];
        Object.entries(moodState.effects).forEach(([stat, multiplier]) => {
            const effect = multiplier > 1 ? 'increased' : 'decreased';
            effects.push(`${stat} ${effect}`);
        });
        moodEffects.textContent = effects.length ? `Effects: ${effects.join(', ')}` : '';
    }
}

// Random events
function triggerRandomEvent() {
    if (Math.random() < 0.1) { // 10% chance every check
        const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        document.getElementById('event-title').textContent = event.title;
        document.getElementById('event-description').textContent = event.description;
        randomEventDisplay.classList.remove('hidden');

        eventButton.onclick = () => {
            event.reward();
            randomEventDisplay.classList.add('hidden');
        };
    }
}

// Start game
function startGame() {
    petSelection.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    petDisplay.textContent = pets[selectedPet];
    petNameDisplay.textContent = selectedPet.charAt(0).toUpperCase() + selectedPet.slice(1);

    // Initial inventory
    addToInventory('apple', 2);
    addToInventory('toy', 1);

    updateDisplay();
    startGameLoop();
}

// Update stats display
function updateDisplay() {
    // Update progress bars
    document.getElementById('hunger-bar').style.width = `${stats.hunger}%`;
    document.getElementById('health-bar').style.width = `${stats.health}%`;
    document.getElementById('happiness-bar').style.width = `${stats.happiness}%`;

    // Update values
    document.getElementById('hunger-value').textContent = Math.round(stats.hunger);
    document.getElementById('health-value').textContent = Math.round(stats.health);
    document.getElementById('happiness-value').textContent = Math.round(stats.happiness);

    // Update level
    petLevelDisplay.textContent = level;

    // Update mood
    updateMood();
}

// Game loop
function startGameLoop() {
    const gameLoop = setInterval(() => {
        if (gameOver) {
            clearInterval(gameLoop);
            return;
        }

        // Apply mood effects
        const moodState = MOOD_STATES[currentMood];
        const moodEffects = moodState.effects;

        // Update stats with mood effects
        stats.hunger = Math.min(stats.hunger + 2 * (moodEffects.hunger || 1), 100);
        stats.health = Math.max(stats.health - 1 * (1 / (moodEffects.health || 1)), 0);
        stats.happiness = Math.max(stats.happiness - 1.5 * (1 / (moodEffects.happiness || 1)), 0);

        // Check game over conditions
        if (stats.hunger >= 100 || stats.health <= 0 || stats.happiness <= 0) {
            handleGameOver();
            clearInterval(gameLoop);
            return;
        }

        // Random events
        triggerRandomEvent();

        // Update news ticker randomly
        if (Math.random() < 0.1) {
            newsTicker.textContent = newsMessages[Math.floor(Math.random() * newsMessages.length)];
        }

        // Add coins periodically
        if (Math.random() < 0.2) { // 20% chance every second
            addCoins(Math.floor(Math.random() * 5) + 1);
        }

        updateDisplay();
    }, 1000);
}

// Action handlers
storeItems.forEach(item => {
    item.addEventListener('click', () => {
        if (gameOver || item.classList.contains('disabled')) return;

        const action = item.dataset.action;
        handleAction(action);
        item.classList.add('disabled');

        // Add cooldown
        const cooldownTimer = item.querySelector('.cooldown-timer');
        let cooldown = 5;
        cooldownTimer.textContent = cooldown;

        const timer = setInterval(() => {
            cooldown--;
            cooldownTimer.textContent = cooldown;

            if (cooldown <= 0) {
                clearInterval(timer);
                item.classList.remove('disabled');
                cooldownTimer.textContent = '';
            }
        }, 1000);
    });
});

// Inventory panel controls
inventoryButton.addEventListener('click', () => {
    inventoryPanel.classList.remove('hidden');
    updateInventoryDisplay();
});

closeInventoryButton.addEventListener('click', () => {
    inventoryPanel.classList.add('hidden');
});

function handleAction(action) {
    switch (action) {
        case 'feed':
            stats.hunger = Math.max(stats.hunger - 15, 0);
            addExperience(5);
            addCoins(10);
            break;
        case 'play':
            stats.happiness = Math.min(stats.happiness + 20, 100);
            stats.hunger = Math.min(stats.hunger + 5, 100);
            addExperience(10);
            addCoins(15);
            break;
        case 'rest':
            stats.health = Math.min(stats.health + 15, 100);
            stats.happiness = Math.max(stats.happiness - 5, 0);
            addExperience(5);
            addCoins(10);
            break;
    }
    updateDisplay();
}

// Experience and leveling
function addExperience(amount) {
    experience += amount;
    if (experience >= level * 100) {
        levelUp();
    }
}

function levelUp() {
    level++;
    experience = 0;
    petLevelDisplay.textContent = level;
    addCoins(50); // Bonus coins for leveling up

    // Visual feedback
    petDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
        petDisplay.style.transform = 'scale(1)';
    }, 300);
}

// Game over handling
function handleGameOver() {
    gameOver = true;
    let message = '';

    if (stats.hunger >= 100) {
        message = 'Your pet got too hungry!';
    } else if (stats.health <= 0) {
        message = 'Your pet got sick!';
    } else if (stats.happiness <= 0) {
        message = 'Your pet got too sad!';
    }

    document.getElementById('game-over-message').textContent = message;
    gameOverScreen.classList.remove('hidden');
}

// Restart game
document.getElementById('restart-button').addEventListener('click', () => {
    gameOver = false;
    stats = {
        hunger: 50,
        health: 100,
        happiness: 75
    };
    level = 1;
    experience = 0;
    coins = 0;
    inventory = [];
    currentMood = 'happy';
    gameOverScreen.classList.add('hidden');
    petSelection.classList.remove('hidden');
    gameContainer.classList.add('hidden');
});
