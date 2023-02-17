// You can roll or stick
// Keep track of score of multiple players
// Each is effectively playing their own game
// Turns alternate between players

const rolls = {
    sideDot: {
        probability: 349,
        cumulative: 349,
        points: 5,
        name: "Side (dot)",
        id: "sideDot"
    },
    sideBlank: {
        probability: 302,
        cumulative: 651,
        points: 5,
        name: "Side (no dot)",
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
        points: 5,
        name: "Snouter",
        id: "snouter"
    },
    jowler: {
        probability: 7,
        points: 5,
        cumulative: 1000,
        name: "Leaning Jowler",
        id: "jowler"
    },
}

const totalProbabilities = Object.values(rolls).reduce((acc, cur) => acc + cur.probability, 0)

const getRolledPosition = (number) =>  Object.values(rolls).sort((a,b) => a.cumulative - b.cumulative).find(roll => number <= roll.cumulative).id;
console.log(getRolledPosition);

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
    }
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
        const nextPlayerId = getNextPlayer(this.id);
        gameData.currentPlayer = nextPlayerId;
        //TODO: mechanism for going to next player?
    }
    addToRoundScore = (num) => {
        this.roundScore += num;
        // TODO: if tempScore + permScore >= 100 - you win
    }
    
    stick = () => {
        this.#totalScore += this.roundScore;
        this.nextPlayer();
    }
    roll = () => {
        const roll = Math.ceil(Math.random() * 1000);
        const positionId = getRolledPosition(roll)
        console.log({roll, positionId});

        //TODO: do two rolls
        // Work out combined score
        // Add to tempscore Or end go
        // If pigOut - go to next player
    }
    pigOut = () => {
        this.roundScore = 0;
        this.nextPlayer();
    }
    oinker = () => {
        this.roundScore = 0;
        this.#totalScore = 0;
        this.nextPlayer();
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
        myNode.removeChild(myNode.lastChild);
    }
}

const giveWarning = (elementId, text) => {
    const warningEl = getEl(elementId);
    const warningText = createTextNode(text)
    warningEl.append(warningText)
}

const setElementVisible = (elementId, visible) => {
    const element = getEl(elementId);
    console.log({element, elementId})
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
    // console.log(event.target[0].value)
    const desiredPlayers = event.target[0].value;
    if (desiredPlayers < config.maxPlayers){
        gameData.playerTotal = event.target[0].value;
        createNameElements(gameData.playerTotal);
        advanceScreen("welcomeScreen", "nameScreen");
    } else {
        giveWarning("playerTotalWarning", `Please choose less than ${config.maxPlayers} players.`)
    }
    
    // validate input
    // move to next screen if it's valid
}

const nextPlayerIsPlayerZero = (playerId) => playerId < gameData.playerTotal - 1 ? false : true;

const getNextPlayer = (playerId) => nextPlayerIsPlayerZero(playerId) ? 0 : playerId + 1;

const submitPlayerNumber = (event) => {
    event.preventDefault();
    const desiredName = event.target[0].value;
    if (desiredName && desiredName !== ""){
        gameData.players.push(new Player(desiredName))
        const playerid = event.target.dataset.playerid;
        console.log({event})
        if (!nextPlayerIsPlayerZero(playerid)){
            // There are players left to name
            advanceScreen(`playerNameElement${playerid}`, `playerNameElement${Number(playerid)+1}`);
        } else {
            const playerSummary = getEl("playerSummary");
            gameData.players.forEach((player,i) => {
                const playerDiv = createEl("div");
                playerDiv.innerHTML = `<p><strong>Player ${i+1}: ${player.name}</strong><p>`
                playerSummary.appendChild(playerDiv);
            })
            advanceScreen(`nameScreen`, `nameSummaryScreen`);
        }
    }
}

const playerNumberForm = getEl("playerNumberForm");
playerNumberForm.addEventListener("submit", submitPlayers)

const createNameElement = (number, active) => {
    const playerNameElement = createEl("div");
    playerNameElement.classList.add(active ? "active" : "hidden");
    playerNameElement.id = `playerNameElement${number}`;
    playerNameElement.innerHTML = `<h1>Player ${number + 1}:</h1><form method="get" id="playerNameForm${number}" data-playerid="${number}"><label>Please choose a name:<input type="name" value=""></label><button>Save</button></form>`
    return playerNameElement;
}

const createNameElements = (numberOfPlayers) => {
    // TODO: focus the input
    const nameScreen = getEl("nameScreen");
    for (let i = 0; i < numberOfPlayers; i++){
        const playerNameElement = createNameElement(i, i===0 ? true : false);
        nameScreen.appendChild(playerNameElement);
        const nameForm = getEl(`playerNameForm${i}`)
        nameForm.addEventListener("submit", submitPlayerNumber);
    }
}

/** @type {(pigName: string, position: string) => HTMLElement} */
const getPigImage = (pigName, position) => {
    const pig = createEl("img");
    pig.setAttribute("src", `./images/${pigName}.gif`)
    return pig
}

const createGameFrame = (playerId) => {
    const gameFrame = getEl("gameFrame");
    const pigBlanket = getEl("pigBlanket");
    const totalScoreEl=getEl("totalScore");
    const roundScoreEl=getEl("roundScore");
    const currentPlayerEl=getEl("currentPlayer");
    const rollButton=getEl("rollButton");

    const pigLeft = getPigImage(gameData.pigs.left);
    const pigRight = getPigImage(gameData.pigs.right);

    const player = gameData.players[playerId];
    const totalScore = player.getTotalScore();
    console.log({player, playerId, totalScore})
    totalScoreEl.append(createTextNode(totalScore));
    roundScoreEl.append(createTextNode(0));
    currentPlayerEl.append(createTextNode(player.name));

    pigBlanket.appendChild(pigLeft);
    pigBlanket.appendChild(pigRight);

    rollButton.addEventListener("mousedown",(e) => {
        player.roll()
    })
}


// Screens:
// how many players
// Loop [player n name]
//   until all are named
// Loop [player n starts - stick or roll until they fail or pass]
//   until there's a winner 
// Game summary card

// Have hidden sections already on the page - show them based on game logic.
// The loop sections will have to be generated programmatically 

initialise();