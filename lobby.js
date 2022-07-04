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
let lobbyRef = firebase.database().ref(`lobby`);

document.querySelector("#input").addEventListener("keydown", (event) => {
    if(event.key === "Enter"){
      const input = document.querySelector("#input");
      addItem(input.value);
    }
      
});
  
document.querySelector("#add_room").addEventListener("click", () => {
    const input = document.querySelector("#input");
    addRoom(input.value);
});



function addRoom (id) {
    // append new room the db value lobby

    // check if room already exist
    lobbyRef.get().then((snapshot) => {
        let doc = snapshot.val();
        if (!snapshot.exists()) {
            console.log('snapshot not exist...?')
            lobbyRef.set({123: {numberPlayer:1}})
        }
        if (doc.hasOwnProperty(id)) {
            console.log('room already exist')
        } else {
            console.log("legal room creation");
            lobbyRef.update({
                [id]: {
                    numberPlayer: 0,
                }
            })
            // rediect to room page

        }
    }).catch((error) => {
        console.error(error);
    });
    lobbyRef.get

}

lobbyRef.on("value", (snapshot) => {
    // re-render the room list html
    // iterate over the lobby value
    let lobby = snapshot.val();
    // var lobby = {
    //     "000": {
    //         "numberPlayer": 0
    //     },
    //     "123": {
    //         "numberPlayer": 1,
    //     },
    //     "999": {
    //         "numberPlayer": 2,
    //     },
    // };
    // lobbyRef.set(lobby);
    

    document.querySelector("#to_do_list").textContent = ''; // remove all item

    Object.keys(lobby).forEach(function(key) {
        roomId = key;
        roomInfo = lobby[roomId];
        var msg = 'Room Id : ' + roomId + ', # Player : ' + roomInfo.numberPlayer ;
        console.log(msg)
        const item = document.createElement("div");
        const div = document.createElement("div");
        const checkIcon = document.createElement("i");
        const text = document.createElement("p");
    
        item.className = "item";
        text.textContent = msg;
        text.setAttribute("roomId", roomId);
        text.setAttribute("numberPlayer", roomInfo.numberPlayer);
    
        checkIcon.className = "fas fa-check-square";
        checkIcon.style.color = "lightgray";
        checkIcon.addEventListener("click", (event) => {
            let paragraph = event.target.parentElement.parentElement.firstChild;
            let numberPlayer = paragraph.getAttribute('numberPlayer');
            
            if (numberPlayer <= 1) {
                _roomId = paragraph.getAttribute('roomId');
                // console.log(_roomId);
                window.localStorage.setItem("roomId", _roomId);
                window.location.href = './room.html';
            } else {
                console.log('the room is full! not allowed to enter.')
            }
            console.log(paragraph);
            // 1. not allowered to enter room if number of player is already 2
            // 2. if 0 or 1, allowed.
            // enter room
            // update lobby value accordingly.
            // redirect to room (room page will update room db value accordingly)
            
            // console.log('redirection')
        })
        div.appendChild(checkIcon);
    
        item.appendChild(text);
        item.appendChild(div);
    
        document.querySelector("#to_do_list").appendChild(item);
    })
    // document.querySelector("#input").value = "";
})
  
// addItem = (input) => {
//     const item = document.createElement("div");
//     const div = document.createElement("div");
//     const checkIcon = document.createElement("i");
//     const trashIcon = document.createElement("i");
//     const text = document.createElement("p");
  
//     item.className = "item";
//     text.textContent = input;
  
//     checkIcon.className = "fas fa-check-square";
//     checkIcon.style.color = "lightgray";
//     checkIcon.addEventListener("click", () => {
//       checkIcon.style.color = "limegreen";
//     })
//     div.appendChild(checkIcon);
  
//     item.appendChild(text);
//     item.appendChild(div);
  
//     document.querySelector("#to_do_list").appendChild(item);
//     document.querySelector("#input").value = "";
// }