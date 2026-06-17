const mainCowBtn = document.querySelector('.main-cow-btn');
const scoreCounter = document.getElementById('score-counter');
const cpsCounter = document.getElementById('cps-counter');
const upgradesContainer = document.getElementById('upgrades-container');
const settingsModal = document.getElementById('settings-modal');
const openSettingsBtn = document.getElementById('settings-open-btn');
const closeSettingsBtn = document.getElementById('settings-close-btn');
const barFill = document.querySelector('.bar-fill');
const barLabel = document.querySelector('.bar-label');
const gameScreen = document.getElementById('game-screen');
const mainCowImg = document.querySelector('.pixel-image');
const bgNameText = document.getElementById('bg-name');
const cowNameText = document.getElementById('cow-name');

let score = 0;
let clickPower = 1;
let totalCps = 0; 

let multiplierProgress = 0; 
let isMultiplierActive = false; 
const multiplierThreshold = 50; 
let currentBgIndex = 0;
let currentCowIndex = 0;

let upgradesData = [
    { id: 'click', name: 'Сила Клика', desc: '+1 за клик', cost: 10, level: 1, type: 'click', power: 1 },
    { id: 'pasture', name: 'Пастбище', desc: '+1 корова/сек', cost: 50, level: 0, type: 'cps', power: 1 },
    { id: 'farm', name: 'Ферма коров', desc: '+8 коров/сек', cost: 400, level: 0, type: 'cps', power: 8 },
    { id: 'factory', name: 'Завод коров', desc: '+50 коров/сек', cost: 3000, level: 0, type: 'cps', power: 50 },
    { id: 'mine', name: 'Коровья Шахта', desc: '+260 коров/сек', cost: 25000, level: 0, type: 'cps', power: 260 },
    { id: 'portal', name: 'Адский Портал', desc: '+1400 коров/сек', cost: 180000, level: 0, type: 'cps', power: 1400 },
    { id: 'cloner', name: 'Клонатор коров', desc: '+7800 коров/сек', cost: 1400000, level: 0, type: 'cps', power: 7800 },
    { id: 'galaxy', name: 'Космо-Ферма', desc: '+44000 коров/сек', cost: 10000000, level: 0, type: 'cps', power: 44000 }
];

const backgrounds = [
    'fon/1.png', 'fon/2.png', 'fon/3.png', 'fon/4.png', 
    'fon/5.png', 'fon/6.png', 'fon/7.png', 'fon/8.png'
];

const cows = [
    { name: 'Обычная', url: 'Normal/Cow.png' },   
    { name: 'Каменная корова', url: 'Normal/Cow_Stone.png' },
    { name: 'Слаймовая корова', url: 'Normal/Cow_Slime.png' }
];

function loadGame() {
    const savedScore = localStorage.getItem('cow_score');
    const savedClickPower = localStorage.getItem('cow_clickPower');
    const savedCps = localStorage.getItem('cow_cps');
    const savedUpgrades = localStorage.getItem('cow_upgrades');
    const savedBg = localStorage.getItem('cow_bg');
    const savedCow = localStorage.getItem('cow_cow');

    if (savedScore !== null) score = Math.round(parseFloat(savedScore));
    if (savedClickPower !== null) clickPower = parseInt(savedClickPower);
    if (savedCps !== null) totalCps = parseInt(savedCps);
    if (savedBg !== null) {
        currentBgIndex = parseInt(savedBg);
        gameScreen.style.backgroundImage = `url('${backgrounds[currentBgIndex]}')`;
        bgNameText.textContent = `Фон ${currentBgIndex + 1}`;
    }
    if (savedCow !== null) {
        currentCowIndex = parseInt(savedCow);
        mainCowImg.src = cows[currentCowIndex].url;
        cowNameText.textContent = cows[currentCowIndex].name;
    }
    if (savedUpgrades !== null) upgradesData = JSON.parse(savedUpgrades);
    
    scoreCounter.textContent = score;
    cpsCounter.textContent = totalCps;
}

function saveGame() {
    localStorage.setItem('cow_score', score);
    localStorage.setItem('cow_clickPower', clickPower);
    localStorage.setItem('cow_cps', totalCps);
    localStorage.setItem('cow_upgrades', JSON.stringify(upgradesData));
    localStorage.setItem('cow_bg', currentBgIndex);
    localStorage.setItem('cow_cow', currentCowIndex);
}

function renderUpgrades() {
    // Находим контейнер по классу ленты, если ID из HTML потерялся
    const container = upgradesContainer || document.querySelector('.upgrade-list');
    if (!container) return;
    
    container.innerHTML = ''; 
    
    upgradesData.forEach((upgrade) => {
        const btn = document.createElement('button');
        btn.className = 'upgrade-item';
        if (score < upgrade.cost) btn.disabled = true;
        
        btn.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name} x${upgrade.level}</div>
                <div class="upgrade-desc">${upgrade.desc}</div>
            </div>
            <div class="upgrade-cost">
                <img src="headCow/CowHead.png" class="mini-cow">
                <span>${upgrade.cost}</span>
            </div>
        `;
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Стопаем клик, чтобы не триггерить корову под кнопкой
            if (score >= upgrade.cost) {
                score -= upgrade.cost;
                upgrade.level += 1;
                
                if (upgrade.type === 'click') {
                    clickPower += upgrade.power;
                } else if (upgrade.type === 'cps') {
                    totalCps += upgrade.power;
                }
                
                upgrade.cost = Math.round(upgrade.cost * 1.5);
                saveGame();
                updateUI();
            }
        });
        
        container.appendChild(btn);
    });
}

function updateUI() {
    scoreCounter.textContent = score;
    cpsCounter.textContent = totalCps;
    renderUpgrades(); 
}

setInterval(() => {
    let currentCps = isMultiplierActive ? totalCps * 2 : totalCps;
    score += currentCps;
    
    if (multiplierProgress > 0) {
        multiplierProgress -= 3;
        if (multiplierProgress < 0) multiplierProgress = 0;
        
        if (multiplierProgress < multiplierThreshold && isMultiplierActive) {
            isMultiplierActive = false;
            barLabel.style.color = '#fff'; 
            barLabel.textContent = '2X';
        }
        barFill.style.height = multiplierProgress + '%';
    }
    
    updateUI();
    saveGame(); 
}, 1000);

mainCowBtn.addEventListener('click', () => {
    multiplierProgress += 5; 
    if (multiplierProgress > 100) multiplierProgress = 100;
    
    let finalClickPower = clickPower;
    if (multiplierProgress >= multiplierThreshold) {
        finalClickPower = clickPower * 2;
        isMultiplierActive = true;
        barLabel.style.color = '#facc15'; 
        barLabel.textContent = 'ACTIVE!';
    } else {
        isMultiplierActive = false;
        barLabel.style.color = '#fff'; 
        barLabel.textContent = '2X';
    }
    
    score += finalClickPower;
    updateUI();
});

openSettingsBtn.addEventListener('click', () => { settingsModal.style.display = 'flex'; });
closeSettingsBtn.addEventListener('click', () => { settingsModal.style.display = 'none'; });
settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.style.display = 'none'; });

document.getElementById('bg-next').addEventListener('click', () => {
    currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
    gameScreen.style.backgroundImage = `url('${backgrounds[currentBgIndex]}')`;
    bgNameText.textContent = `Фон ${currentBgIndex + 1}`;
    saveGame();
});
document.getElementById('bg-prev').addEventListener('click', () => {
    currentBgIndex = (currentBgIndex - 1 + backgrounds.length) % backgrounds.length;
    gameScreen.style.backgroundImage = `url('${backgrounds[currentBgIndex]}')`;
    bgNameText.textContent = `Фон ${currentBgIndex + 1}`;
    saveGame();
});
document.getElementById('cow-next').addEventListener('click', () => {
    currentCowIndex = (currentCowIndex + 1) % cows.length;
    mainCowImg.src = cows[currentCowIndex].url; 
    cowNameText.textContent = cows[currentCowIndex].name; 
    saveGame();
});
document.getElementById('cow-prev').addEventListener('click', () => {
    currentCowIndex = (currentCowIndex - 1 + cows.length) % cows.length;
    mainCowImg.src = cows[currentCowIndex].url;
    cowNameText.textContent = cows[currentCowIndex].name;
    saveGame();
});

loadGame();
updateUI();
