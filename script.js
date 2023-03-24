// You can roll or stick
// Keep track of score of multiple players
// Each is effectively playing their own game
// Turns alternate between players

const rolls = {
    sideDot: {
        probability: 349,
        cumulative: 349,
        points: 0,
        name: "Dot",
        id: "sideDot"
    },
    sideBlank: {
        probability: 302,
        cumulative: 651,
        points: 0,
        name: "Blank",
        id: "sideBlank"
    },
    razorback: {
        probability: 224,
        cumulative: 875,
        points: 5,
        name: "Razorback",
        id: "razorback"
    },
    trotter: {
        probability: 88,
        cumulative: 963,
        points: 5,
        name: "Trotter",
        id: "trotter"
    },
    snouter: {
        probability: 30,
        cumulative: 993,
        points: 10,
        name: "Snouter",
        id: "snouter"
    },
    jowler: {
        probability: 7,
        points: 15,
        cumulative: 1000,
        name: "Leaning Jowler",
        id: "jowler"
    },
}

const totalProbabilities = Object.values(rolls).reduce((acc, cur) => acc + cur.probability, 0)

const getRolledPositionId = (number) => Object.values(rolls).sort((a,b) => a.cumulative - b.cumulative).find(roll => number <= roll.cumulative).id;
const getRolledPosition = (number) => rolls[getRolledPositionId(number)];


const config = {
    maxPlayers: 100
}

const gameData = {
    playerTotal: null,
    players: [],
    currentPlayer: null,
    pigs: {
        left: "trotter",
        right: "trotter"
    },
    scoresExpanded: false,
}

class Game {
    #players = 0;
    constructor(players) {
        this.players = players;
    }
} 

class Player {
    #active = false;
    roundScore = 0;
    #totalScore = 0;
    constructor(name, id) {
        this.name = name
        this.id = id
    }
    setActive = (bool) => {
        this.#active = bool;
    }
    getActive = () => {
        return this.#active;
    }
    getTotalScore = () => {
        return this.#totalScore;
    }
    nextPlayer = () => {
        this.setActive(false);
        this.roundScore = 0;
        const nextPlayerId = getNextPlayer(this.id);
        gameData.currentPlayer = nextPlayerId;
        return gameData.players[nextPlayerId]
    }
    addToRoundScore = (num) => {
        this.roundScore += num;
    }
    
    stick = () => {
        this.#totalScore += this.roundScore;
    }
    individualRoll = () => {
        const roll = Math.ceil(Math.random() * 1000);
        return getRolledPosition(roll)
    }
    roll = () => {
        if (Math.ceil(Math.random() * 1000) === 1){
            this.oinker();
            return "Oinker"
        }
        const combinedRolls = [
            this.individualRoll(),
            this.individualRoll()
        ]
        
        const [rollOne, rollTwo] = combinedRolls;
        gameData.pigs.left = rollOne.id;
        gameData.pigs.right = rollTwo.id;
        console.log(combinedRolls)
        console.log(gameData)
        let message = ""
        if (rollOne === rollTwo){
            // Double roll
            if (rollOne.id === "sideDot" || rollOne.id === "sideBlank"){
                this.addToRoundScore(1);
                const side = (rollOne.id === "sideDot") ? "dot" : "blank";
                message = `Double ${side} - 1 point.`;
            } else {
                this.addToRoundScore(rollOne.points * 4);
                message = `Double ${rollOne.name} - ${rollOne.points * 4} points.`;
            }
        } else {
            const rollIds = combinedRolls.map(roll => roll.id)
            if (rollIds.includes("sideDot") && rollIds.includes("sideBlank")){
                this.pigOut();
                return "Pig out";
            } else {
                this.addToRoundScore(rollOne.points);
                this.addToRoundScore(rollTwo.points);
                const scoringRollNames = combinedRolls.filter(roll => roll.points).map(roll => roll.name);
                message = `${scoringRollNames.join(' and ')}: ${rollOne.points + rollTwo.points} points.`;
            }
        }
        if (this.roundScore + this.getTotalScore() > 100) {
            this.#totalScore += this.roundScore;
            return "Winner"
        }
        return message;
        // TODO:
        // unnatural position
    }
    pigOut = () => {
        this.roundScore = 0;
        this.setActive(false);
    }
    oinker = () => {
        this.roundScore = 0;
        this.#totalScore = 0;
    }
}

const initialise = () => {
    showOnlyActiveScreen();
    (getEl("gameStartButton")).addEventListener("mousedown", () => {
        createGameFrame(0);
        advanceScreen("nameSummaryScreen", "gameScreen");
    })
}

/** @type {(elementId: string) => HTMLElement} */
const getEl = (elementId) => document.getElementById(elementId);

/** @type {(element: string) => HTMLElement} */
const createEl = (element) =>  document.createElement(element);

/** @type {(text: string) => HTMLElement} */
const createTextNode = (text) => document.createTextNode(text);


const wipeElement = (element) => {
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}

const giveWarning = (elementId, text) => {
    const warningEl = getEl(elementId);
    const warningText = createTextNode(text)
    warningEl.append(warningText)
}

const setElementVisible = (elementId, visible) => {
    const element = getEl(elementId);
    if (visible) {
        element.classList.remove("hidden");
    } else {
        element.classList.add("hidden");
    }
}

const showOnlyActiveScreen = () => {
    screens.all
        .forEach(screen => {
            if (screen === screens.current){
                setElementVisible(screen, true)
            } else {
                setElementVisible(screen, false)
            }
        })
}

const screens = {
    all: ["welcomeScreen", "nameScreen", "nameSummaryScreen", "gameScreen"],
    current: "welcomeScreen"
}

const advanceScreen = (elementToHide, elementToShow) => {
    setElementVisible(elementToHide, false);
    setElementVisible(elementToShow, true);
    if (screens.all.includes(elementToShow)){
        screens.current = welcomeScreen;
    }

}

const submitPlayers = (event) => {
    event.preventDefault();
    const desiredPlayers = event.target[0].value;
    if (desiredPlayers < config.maxPlayers && desiredPlayers > 0){
        gameData.playerTotal = event.target[0].value;
        createNameElements(gameData.playerTotal);
        advanceScreen("welcomeScreen", "nameScreen");
        getEl('playerNameInput0').focus();
    } else {
        giveWarning("playerTotalWarning", `Please choose between 1 and ${config.maxPlayers - 1} players.`)
    }
    
    // validate input
    // move to next screen if it's valid
}

const nextPlayerIsPlayerZero = (playerId) => playerId < gameData.playerTotal - 1 ? false : true;

const getNextPlayer = (playerId) => nextPlayerIsPlayerZero(playerId) ? 0 : playerId + 1;

const submitPlayerName = (event) => {
    event.preventDefault();
    const desiredName = event.target[0].value;
    if (desiredName && desiredName !== ""){
        gameData.players.push(new Player(desiredName, gameData.players.length));
        const playerid = event.target.dataset.playerid;
        if (!nextPlayerIsPlayerZero(playerid)){
            // There are players left to name
            advanceScreen(`playerNameElement${playerid}`, `playerNameElement${Number(playerid)+1}`);
            getEl(`playerNameInput${Number(playerid)+1}`).focus();
        } else {
            const playerSummary = getEl("playerSummary");
            gameData.players.forEach((player,i) => {
                const playerDiv = createEl("div");
                playerDiv.innerHTML = `<p><strong>Player ${i+1}:</strong> ${player.name}<p>`
                playerSummary.appendChild(playerDiv);
            })
            advanceScreen(`nameScreen`, `nameSummaryScreen`);
        }
    }
}

const playerNumberForm = getEl("playerNumberForm");
playerNumberForm.addEventListener("submit", submitPlayers);

const createNameElement = (number, active) => {
    const playerNameElement = createEl("div");
    playerNameElement.classList.add(active ? "active" : "hidden");
    playerNameElement.id = `playerNameElement${number}`;
    playerNameElement.innerHTML = `<h1>Player ${number + 1}:</h1><form method="get" id="playerNameForm${number}" data-playerid="${number}"><label>Please choose a name:<input type="name" value="" id="playerNameInput${number}"></label><button class="metalButton">Save</button></form>`
    return playerNameElement;
}

const createNameElements = (numberOfPlayers) => {
    const nameSection = getEl("nameSection");
    for (let i = 0; i < numberOfPlayers; i++){
        const playerNameElement = createNameElement(i, i===0 ? true : false);
        nameSection.appendChild(playerNameElement);
        const nameForm = getEl(`playerNameForm${i}`)
        nameForm.addEventListener("submit", submitPlayerName);
    }
}

/** @type {(pigName: string) => HTMLElement} */
const setPigImage = (pigEl, pigName) => {
    console.log(pigName)
    pigEl.src = `./images/${pigName}.gif`;
    return pigEl
}

const updatePigImages = (rollResult) => {
    const pigBlanket = getEl("pigBlanket");
    const [leftPig, rightPig] = pigBlanket.children;
    console.log({children: pigBlanket.children})
    if (rollResult === "Oinker"){
        setPigImage(leftPig, "baconLeft");
        setPigImage(rightPig, "baconRight");
    } else {
        setPigImage(leftPig, gameData.pigs.left);
        setPigImage(rightPig, gameData.pigs.right);
    }
}

const updateRoundScore = (score) => {
    updateCounter("roundCounter", score)
}

const setMarquee = (message, color, stop) => {
    const marquee = getEl("marquee");
    marquee.stop();
    marquee.innerHTML = message;
    if (color){
        marquee.style.color = color;
    }
    marquee.start();
}

const enableNextPlayerElements = (shouldShow, message, color) => {
    // setElementVisible("nextPlayerMessage", shouldShow);
    getEl("nextPlayerButton").disabled = !shouldShow;

    if (message) {
        setMarquee(message, color);
        // const nextPlayerMessage = getEl("nextPlayerMessage");
        // wipeElement(nextPlayerMessage);
        // nextPlayerMessage.append(createTextNode(message))
    }
}

// COUNTERS

const updateCounter = (id, number) => {
    const paddedNumber = String(number).padStart(3, '0');
    const counter = getEl(id);
    const digits = Array.from(counter.children);
    console.log(paddedNumber)
    digits.forEach((digit, i) => {
        digit.style.objectPosition = getCounterPixelPosition(paddedNumber[i])
        console.log(paddedNumber[i])
        console.log(digit.style.objectPosition)
    })
}
const getCounterPixelPosition = (digit) => {
    console.log({digit})
    return `0px ${-12 * (Number(digit)+1)}px`
}

const updatePlayerFields = (player) => {
    const currentPlayerEl=getEl("currentPlayer");
    wipeElement(currentPlayerEl);
    updateCounter("totalCounter", player.getTotalScore())
    currentPlayerEl.append(createTextNode(player.name));
}

const showWinnerMessage = (message) => {
    setMarquee(message, "goldenrod")
    setElementVisible("winner", true);
    getEl("winnerButton").addEventListener("mousedown", (e) => {
        populateScoreTable("gameSummary");
        advanceScreen("gameScreen", "gameSummaryScreen");
    })
}

const toggleScoresTab = (expandScores) => {
    const midGameScores = getEl("midGameScores");
    if (gameData.scoresExpanded) {
        midGameScores.style.top = "232px";
        midGameScores.style.height = "17px";
        expandScores.innerHTML = "⌃ Show Scores ⌃";
    } else {
        populateScoreTable("midGameSummary");
        midGameScores.style.top = "52px";
        midGameScores.style.height = "196px";
        expandScores.innerHTML = "⌄ Hide Scores ⌄";
    }
    gameData.scoresExpanded = !gameData.scoresExpanded;
}

const populateScoreTable = (elementId) => {
    const scoreTable = document.getElementById(elementId);
    wipeElement(scoreTable);
    gameData.players.forEach(player => {
        const playerRow = createEl("tr");
        playerRow.innerHTML = `<td>${player.name}</td><td>${player.getTotalScore()}</td>`
        scoreTable.appendChild(playerRow);
    })
}

const rollButton=getEl("rollButton");
const stickButton=getEl("stickButton");

const enablePlayButtons = (enable) => {
    rollButton.disabled = !enable;
    stickButton.disabled = !enable;
}

const createGameFrame = (playerId) => {
    const gameFrame = getEl("gameFrame");
    let player = gameData.players[playerId];

    updatePigImages();
    updateCounter("roundCounter", 0);
    updatePlayerFields(gameData.players[playerId])
    const expandScores = getEl("expandScores")
    expandScores.addEventListener("mousedown", (e) => {
        toggleScoresTab(expandScores);
    })

    rollButton.addEventListener("mousedown", (e) => {
        const [leftPig, rightPig] = getEl("pigBlanket").children;
        enablePlayButtons(false);
        const intervals = [rollImage(leftPig), rollImage(rightPig)];
        setTimeout(() => {
            intervals.forEach((interval) => clearInterval(interval));
            enablePlayButtons(true);
            const rollResult = player.roll()
            if (rollResult === "Oinker") {
                enablePlayButtons(false);
                enableNextPlayerElements(true, "Makin' bacon!", "red");
            }
            updateRoundScore(player.roundScore);
            updatePigImages(rollResult);
            if (rollResult === "Pig out") {
                enablePlayButtons(false);
                enableNextPlayerElements(true, "Pig out!", "red");
            } else if (rollResult === "Winner") {
                enablePlayButtons(false);
                showWinnerMessage(`${player.name} wins with ${player.getTotalScore()} points!`);
            } else {
                setMarquee(rollResult, "white");
            }
        }, 1000);

       
    })

    stickButton.addEventListener("mousedown", (e) => {
        player.stick();
        updateCounter("totalCounter", player.getTotalScore());
        enablePlayButtons(false);
        enableNextPlayerElements(true, `Stuck with ${player.getTotalScore()} points.`, "white");
    })

    nextPlayerButton.addEventListener("mousedown", (e) => {
        player = player.nextPlayer();
        setMarquee("&nbsp", "white", true)
        updatePlayerFields(player);
        updateRoundScore(0);
        enablePlayButtons(true);
        enableNextPlayerElements(false);
    })
}

const positions = Object.keys(rolls);
const rollImage = (imageEl) => {
    let image = "";
    const interval = setInterval(() => {
        const possiblePositions = positions.filter(position => position !== image)
        image = possiblePositions[Math.floor(Math.random()*possiblePositions.length)];
        imageEl.src = `./images/${image}.gif`;
    }, 100)
    return interval;
}

initialise();

//TODO: Play again button