// You can roll or stick
// Keep track of score of multiple players
// Each is effectively playing their own game
// Turns alternate between players

const rolls = {
    sideDot: {
        probability: 349,
        points: 5,
        name: "Side (dot)"
    },
    sideBlank: {
        probability: 302,
        points: 5,
        name: "Side (no dot)"
    },
    razorback: {
        probability: 224,
        points: 5,
        name: "Razorback"
    },
    trotter: {
        probability: 88,
        points: 5,
        name: "Trotter"
    },
    snouter: {
        probability: 30,
        points: 5,
        name: "Snouter"
    },
    jowler: {
        probability: 6,
        points: 5,
        name: "Leaning Jowler"
    },
}

const config = {
    maxPlayers: 100
}

const gameData = {
    playerTotal: null,
    players: []
}

class Game {
    #players = 0;
    constructor(players) {
        this.players = players;
    }
} 

class Player {
    #active = false;
    #tempScore = 0;
    #permScore = 0;
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
    nextPlayer = () => {
        this.setActive(false);
        //TODO: mechanism for going to next player?
    }
    addToTempScore = (num) => {
        this.#tempScore += num;
        // TODO: if tempScore + permScore >= 100 - you win
    }
    stick = () => {
        this.#permScore += this.#tempScore;
        this.nextPlayer();
    }
    roll = () => {
        //TODO: do two rolls
        // Work out combined score
        // Add to tempscore Or end go
        // If pigOut - go to next player
    }
    pigOut = () => {
        this.#tempScore = 0;
        this.nextPlayer();
    }
    oinker = () => {
        this.#tempScore = 0;
        this.#permScore = 0;
        this.nextPlayer();
    }
}

const initialise = () => {
    showOnlyActiveScreen();
    (document.getElementById("gameStartButton")).addEventListener("mousedown", () => {
        advanceScreen("nameSummaryScreen", "gameScreen");
    })
}

const giveWarning = (elementId, text) => {
    const warningEl = document.getElementById(elementId);
    const warningText = document.createTextNode(text)
    warningEl.append(warningText)
}

const setElementVisible = (elementId, visible) => {
    const element = document.getElementById(elementId);
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

const submitPlayerNumber = (event) => {
    event.preventDefault();
    const desiredName = event.target[0].value;
    if (desiredName && desiredName !== ""){
        gameData.players.push(new Player(desiredName))
        const playerid = event.target.dataset.playerid;
        console.log({event})
        if (playerid < gameData.playerTotal-1){
            // There are players left to name
            advanceScreen(`playerNameElement${playerid}`, `playerNameElement${Number(playerid)+1}`);
        } else {
            const playerSummary = document.getElementById("playerSummary");
            gameData.players.forEach((player,i) => {
                const playerDiv = document.createElement("div");
                playerDiv.innerHTML = `<p><strong>Player ${i+1}: ${player.name}</strong><p>`
                playerSummary.appendChild(playerDiv);
            })
            advanceScreen(`nameScreen`, `nameSummaryScreen`);
        }
    }
}

const playerNumberForm = document.getElementById("playerNumberForm");
playerNumberForm.addEventListener("submit", submitPlayers)

const createNameElement = (number, active) => {
    const playerNameElement = document.createElement("div");
    playerNameElement.classList.add(active ? "active" : "hidden");
    playerNameElement.id = `playerNameElement${number}`;
    playerNameElement.innerHTML = `<h1>Player ${number + 1}:</h1><form method="get" id="playerNameForm${number}" data-playerid="${number}"><label>Please choose a name:<input type="name" value=""></label><button>Save</button></form>`
    return playerNameElement;
}

const createNameElements = (numberOfPlayers) => {
    const nameScreen = document.getElementById("nameScreen");
    for (let i = 0; i < numberOfPlayers; i++){
        const playerNameElement = createNameElement(i, i===0 ? true : false);
        nameScreen.appendChild(playerNameElement);
        const nameForm = document.getElementById(`playerNameForm${i}`)
        nameForm.addEventListener("submit", submitPlayerNumber);
    }
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