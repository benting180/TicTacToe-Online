const tiles = Array.from(document.querySelectorAll('.tile'));
const playerDisplay = document.querySelector('.display-player');
const roomIdDisplay = document.querySelector('.display-room-id');
const resetButton = document.querySelector('#reset');
const announcer = document.querySelector('.announcer');

const firebaseConfig = {
    apiKey: "AIzaSyD8KNEwTcKR8pSpA4c2T-rouBc9VyoiKDc",
    authDomain: "online-tictactoe-65b9a.firebaseapp.com",
    databaseURL: "https://online-tictactoe-65b9a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "online-tictactoe-65b9a",
    storageBucket: "online-tictactoe-65b9a.appspot.com",
    messagingSenderId: "840857534928",
    appId: "1:840857534928:web:9d059686d05cd5fa3779d5"
};

const app = firebase.initializeApp(firebaseConfig);

let roomId = window.localStorage.getItem("roomId");
console.log('room Id: ', roomId);
roomIdDisplay.innerText = roomId;
// let roomId = prompt("Please enter room ID");
// let roomId = 999;
let roomRef = firebase.database().ref(`rooms/${roomId}`);
let lobbyRef = firebase.database().ref(`rooms/${roomId}`);
let numberPlayer = null;



let isMyTurn = false;
let board = ['', '', '', '', '', '', '', '', ''];
let mySymbol = '?';
let isGameActive = true;
let currentPlayer = '?'
let showAnnouncer = false;

const PLAYERX_WON = 'PLAYERX_WON';
const PLAYERO_WON = 'PLAYERO_WON';
const TIE = 'TIE';

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

window.addEventListener('DOMContentLoaded', () => {
    /*
        Indexes within the board
        [0] [1] [2]
        [3] [4] [5]
        [6] [7] [8]
    */


    tiles.forEach( (tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index));
    });

    resetButton.addEventListener('click', resetBoard);
});

function userAction(tile, index) {
    // check if legal click 1. whos turn. 2. no occupied
    if (isValidAction(tile) === false) {
        return
    }

    // change local board value
    board[index] = mySymbol;
    isMyTurn = false;

    nextPlayer = isMyTurn === 'X' ? 'O' : 'X';
    if (mySymbol === 'X') {
        nextPlayer = 'O'
    } else {
        nextPlayer = 'X'
    }
    currentPlayer = nextPlayer
    // sync to db
    roomRef.update({
        board: board,
        currentPlayer:currentPlayer
    })
}

function resetBoard() {
    // change local board value
    board = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    showAnnouncer = false;

    updateGUI()

    // sync to db
    roomRef.update({
        board: board,
        currentPlayer: currentPlayer,
        showAnnouncer: showAnnouncer
    })
}
function isValidAction(tile) {
    // my turn?
    if (isMyTurn === false) {
        console.log('not your turn.')
        return false;
    }
    // occupied?
    if (tile.innerText === 'X' || tile.innerText === 'O'){
        console.log('tile occupied')
        return false;
    }
    return true;
}


function handleResultValidation() {
    let roundWon = false;

    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        const a = board[winCondition[0]];
        const b = board[winCondition[1]];
        const c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            currentPlayer = a;
            break;
        }
    }

    if (roundWon) {
            announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
            isGameActive = false;
            roomRef.update({isGameActive: false})
            return;
        }

    if (!board.includes(''))
        announce(TIE);
}

const announce = (type) => {
    switch(type){
        case PLAYERO_WON:
            announcer.innerHTML = 'Player <span class="playerO">O</span> Won';
            break;
        case PLAYERX_WON:
            announcer.innerHTML = 'Player <span class="playerX">X</span> Won';
            break;
        case TIE:
            announcer.innerText = 'Tie';
    }
    announcer.classList.remove('hide');
};

function updateGUI(doc) {
    // set all HTML text / tag by local value
    tiles.forEach( (tile, index) => {
        tile.innerText = board[index];
        console.log(board[index])
        tile.classList.remove('playerX');
        tile.classList.remove('playerO');
        tile.classList.add(`player${board[index]}`);
    });

    if (showAnnouncer) {
        announcer.classList.remove('hide');
    } else {
        announcer.classList.add('hide');
    }
    
    playerDisplay.classList.remove(`playerX`);
    playerDisplay.classList.remove(`playerO`);
    currentPlayer = currentPlayer === 'X' ? 'X' : 'O';
    console.log('current Player', currentPlayer)
    playerDisplay.innerText = currentPlayer;
    playerDisplay.classList.add(`player${currentPlayer}`);

    // this function is not nescessarily if using frontend framework

}

function checkStartGame() {
    roomRef.on("value", (snapshot) => {
        console.log('valued changed')
        //Fires whenever a change occurs
        // update local value
        let doc = snapshot.val();
        
        console.log(doc)
        if (doc !== null && doc.hasOwnProperty('board')) {
            console.log(doc.board)
            board = doc.board;
        }
       
        if (doc !== null && doc.currentPlayer === mySymbol) {
            isMyTurn = true;
        }
        if (doc !== null && doc.hasOwnProperty('showAnnouncer')) {
            showAnnouncer = doc.showAnnouncer;
        }
        if (doc !== null && doc.hasOwnProperty('currentPlayer')) {
            currentPlayer = doc.currentPlayer;
        }
        
        updateGUI()
        handleResultValidation();
    })

    // triggered when entered a room
    // check enough player to start game
    // 1. if first player, registered user info
    // pull from db
    roomRef.get().then((snapshot) => {
        // have room
        if (snapshot.exists()) {
            let doc = snapshot.val();
                // if no player
                if (doc !== null && doc.numberPlayer === 0) {
                    // player enter the room first use 'X'
                    mySymbol = 'X';
                    currentPlayer = 'X'
                    roomRef.update({
                        numberPlayer: 1
                    })
                } else if (doc.numberPlayer === 1) {
                    // already have player
                    mySymbol = 'O';
                    currentPlayer = 'O'
                    roomRef.update({
                        playerO: playerId,
                        numberPlayer: 2,
                        currentPlayer: currentPlayer,
                    })
                    isMyTurn = true;
                } else {
                    // not allowed to enter game. maybe just watch?
                    console.log('not allowed')
                }
        } else { // no room
            mySymbol = 'X';
            currentPlayer = 'X'
            playerXStatus = {
                uid: playerId
                // player enter the room first use 'X'
            }

            roomRef.set({
                isGameActive: true,
                board: ['', '', '', '', '', '', '', '', ''],
                currentPlayer: currentPlayer,
                numberPlayer: 1,
                playerX: playerId,
                showAnnouncer: false
            })
        }
    });
}
function leaveRoom () {
    // lobby numberPlayer - 1
    numberPlayer = numberPlayer - 1;
    if (numberPlayer === 0) {
        // destroy the room in lobby
        lobbyRef.remove();
    } else {
        console.log(numberPlayer);
        lobbyRef.update({
            numberPlayer: numberPlayer,
            isGameActive: false
        })
    }
    
    
    // room 
    // resetBoard (or reset when new user enter)

    // numberPlayer - 1
    // isGameActive false

    // remove localStorage

    return
}
window.onbeforeunload = leaveRoom;


// console.log('current numberPlayer: ', numberPlayer)
// numberPlayer = numberPlayer + 1;
// lobbyRef.update({numberPlayer: numberPlayer});
// console.log('updated numberPlayer to ', numberPlayer);
function updateNumberPlayer () {
    lobbyRef.get().then((snapshot) => {
        let doc = snapshot.val();
        numberPlayer = doc.numberPlayer;
        numberPlayer = numberPlayer + 1;
        lobbyRef.update({numberPlayer: numberPlayer});
    }).catch((error) => {
        console.error(error);
    });
}

(function () {

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            playerId = user.uid;
            updateNumberPlayer();
            checkStartGame();
        }
    })
    
    firebase.auth().signInAnonymously().catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage);
    });

    // worries about player exit room later
    // roomRef.onDisconnect().update({numberPlayer: numberPlayer-1})

})();
  