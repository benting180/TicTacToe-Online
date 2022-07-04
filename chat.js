

function sendMessage() {

    var message = document.getElementById("message").value;
    console.log("send message!", message)
    
    // save in database
    let ts = new Date();
    chatRef.push().set({
        // "sender": myName,
        "timestamp": {'.sv': 'timestamp'},
        "message": message
    });

    // prevent form from submitting
    return false;
  }
function listenMessage() {
    chatRef.on("child_added", function (snapshot) {
        console.log("message child added", snapshot.val())
        var html = "";

        html += "<li id='message-" + snapshot.key + "'>";
        html += new Date(snapshot.val().timestamp).toISOString() + ": " + snapshot.val().message;
        html += "</li>";
        const temp = document.getElementById("messages").innerHTML;

        document.getElementById("messages").innerHTML = html + temp;
    });

}
