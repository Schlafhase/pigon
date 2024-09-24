document.getElementById('send-message-text').onkeydown = e => {
    if (e.code == "Enter" && !e.shiftKey) {
        sendMessage();
    }
};


function sendMessage() {
    var messageContainer = document.getElementById('send-message-text');
    var messageText = messageContainer.value.trim();
    if (!messageText) return;
    console.log("Sending", messageText)
    messageContainer.value = "";

    const xhr = new XMLHttpRequest();
    xhr.open('POST', "/send_message");
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");

    let channelID = Number(document.location.pathname.split("/")[2]);

    const body = JSON.stringify({
        channel: channelID,
        text: messageText,
    });

    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 201) {
            console.log(JSON.parse(xhr.responseText));
        } else {
            console.log(`Error: ${xhr.status}`);
        }
    };
    xhr.send(body);
}




function loadMessages(batchID) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let messages = JSON.parse(xhr.responseText);
            let messagesDiv = document.getElementById("messages");

            messages.forEach(message => {
                let nodeDiv = document.createElement("div");
                nodeDiv.classList.add("message");

                let nodeAuthor = document.createElement("span");
                nodeAuthor.innerText = message['author'];
                nodeAuthor.classList.add("message-author");
                nodeDiv.appendChild(nodeAuthor);

                let nodeTimestamp = document.createElement("span");

                let date = new Date(message['timestamp'] * 1000);
                // let dateFormatted = date.toISOString();
                // let removeZ = dateFormatted.at(dateFormatted.length - 1) == "Z" ? 1 : 0;
                // dateFormatted = dateFormatted.substring(0, dateFormatted.length - 7 - removeZ);
                // dateFormatted = dateFormatted.replace("T", " ");
                let dateFormatted = formatDate(date);

                nodeTimestamp.innerText = dateFormatted;
                nodeTimestamp.classList.add("message-timestamp");
                nodeDiv.appendChild(nodeTimestamp);

                let nodeBr = document.createElement("br");
                nodeDiv.appendChild(nodeBr);

                let nodeText = document.createElement("span");
                nodeText.innerText = message['text'];
                nodeText.classList.add("message-text");
                nodeDiv.appendChild(nodeText);

                messagesDiv.appendChild(nodeDiv);
            });
        }

        else if (xhr.readyState == 4) {
            console.warn(xhr.status, xhr.statusText, JSON.parse(xhr.responseText));
        }
    }

    let url = fixLocalURL(`messages?batch=${batchID}`);
    xhr.open('GET', url, true);
    xhr.send(null);
}


function loadChannelAbout() {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            channelAbout = JSON.parse(xhr.responseText);
            console.log(channelAbout);
            console.log("Got channel about. Loading messages.");
            loadMessages(channelAbout['latestMessageBatch']);
        }

        else if (xhr.readyState == 4) {
            let response = JSON.parse(xhr.responseText);
            console.warn(xhr.status, xhr.statusText, response);
            if (xhr.status == 401) {
                deleteCookie("token");
                deleteCookie("username");
                console.log("Token was deleted.");
            }
        }
    }

    let url = fixLocalURL("about");
    xhr.open('GET', url, true);
    xhr.send(null);
}


var channelAbout = null;

window.onload = (event) => {
    console.log("Document is loaded. Loading channel about.");
    loadChannelAbout();
}