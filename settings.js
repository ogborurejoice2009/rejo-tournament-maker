// settings.js


function resetTournament(){

    let confirmReset = confirm(
        "Are you sure you want to delete all tournament data?"
    );

    if(!confirmReset){
        return;
    }

    localStorage.removeItem("rejoTournament");

    alert(
        "Tournament has been reset"
    );

    location.reload();

}


function backupData(){

    try{

        let data = loadData();

        let json = JSON.stringify(
            data,
            null,
            2
        );

        let dataUrl =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(json);

        let link = document.createElement("a");

        link.href = dataUrl;

        link.download =
            "REJO_Tournament_Backup.json";

        link.style.display = "none";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    }

    catch(error){

        console.error(
            "Backup error:",
            error
        );

        alert(
            "Backup failed"
        );

    }

}


function saveTournamentSettings(){

    let data = loadData();

    let name =
        document.getElementById(
            "tournamentName"
        )?.value;

    let players =
        document.getElementById(
            "maxPlayers"
        )?.value;

    data.settings = {

        tournamentName:
            name ||
            "REJO Gamer Tournament",

        maxPlayers:
            Number(players) ||
            12,

        created:
            new Date().toLocaleDateString()

    };

    saveData(data);

    alert(
        "Settings saved"
    );

}


function loadSettings(){

    let data = loadData();

    return data.settings || {

        tournamentName:
            "REJO Gamer Tournament",

        maxPlayers:
            12

    };

}