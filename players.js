// players.js


function addPlayer(){

    let input = document.getElementById("playerName");
    let logoInput = document.getElementById("playerLogo");

    if(!input){
        return;
    }

    let name = input.value.trim();

    if(name === ""){

        alert("Enter player name");

        return;

    }


    // Get selected logo
    let logoFile = logoInput ? logoInput.files[0] : null;


    // Function to save player
    function savePlayer(logo){

        let data = loadData();


        if(!Array.isArray(data.players)){

            data.players = [];

        }


        data.players.push({

            id: Date.now(),

            name: name,

            logo: logo || "",

            squad: [],

            goals: 0,

            assists: 0,

            cleanSheets: 0

        });


        saveData(data);


        // Refresh player list
        showPlayers();


        // Clear inputs
        input.value = "";

        if(logoInput){
            logoInput.value = "";
        }

    }


    // No logo selected
    if(!logoFile){

        savePlayer("");

        return;

    }


    // Convert image to something localStorage can save
    let reader = new FileReader();


    reader.onload = function(e){

        savePlayer(e.target.result);

    };


    reader.readAsDataURL(logoFile);

}



function showPlayers(){

    let data = loadData();

    let box = document.getElementById("playerList");

    if(!box){
        return;
    }


    let players = Array.isArray(data.players)
        ? data.players
        : [];


    box.innerHTML = "";


    if(players.length === 0){

        box.innerHTML = "<p>No players added yet.</p>";

        return;

    }


    players.forEach(player=>{

        box.innerHTML += `

        <div class="player">

            ${
                player.logo
                ?
                `<img
                    src="${player.logo}"
                    style="
                        width:50px;
                        height:50px;
                        object-fit:contain;
                        border-radius:50%;
                        vertical-align:middle;
                        margin-right:10px;
                    "
                >`
                :
                ""
            }

            <b>${player.name}</b>

            <button
                type="button"
                onclick="deletePlayer(${player.id})">
                Delete
            </button>

        </div>

        `;

    });

}



function deletePlayer(id){

    let data = loadData();


    if(!Array.isArray(data.players)){
        return;
    }


    data.players = data.players.filter(
        player => player.id !== id
    );


    saveData(data);


    // Refresh player list
    showPlayers();

}



function getPlayerList(){

    let data = loadData();

    return Array.isArray(data.players)
        ? data.players
        : [];

}