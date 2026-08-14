// ============================================================
// REJO TOURNAMENT MAKER - TOURNAMENT PLAYERS
// ============================================================


function escapePlayerHTML(text) {

    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   ADD PLAYER
============================================================ */

function addPlayer() {

    const input =
        document.getElementById("playerName");

    const logoInput =
        document.getElementById("playerLogo");


    if (!input) {
        return;
    }


    const name =
        input.value.trim();


    if (name === "") {

        alert("Enter player name");

        return;
    }


    const logoFile =
        logoInput &&
        logoInput.files &&
        logoInput.files.length
            ? logoInput.files[0]
            : null;


    function savePlayer(logo) {

        let data = loadData();


        if (!data || typeof data !== "object") {
            data = {};
        }


        if (!Array.isArray(data.players)) {
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


        input.value = "";


        if (logoInput) {
            logoInput.value = "";
        }


        showPlayers();


        if (
            typeof updateDashboard ===
            "function"
        ) {

            updateDashboard();

        }
    }


    if (!logoFile) {

        savePlayer("");

        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            savePlayer(
                event.target.result
            );

        };


    reader.readAsDataURL(logoFile);
}


/* ============================================================
   SHOW PLAYERS
============================================================ */

function showPlayers() {

    const data =
        loadData();


    /*
     * THIS IS THE IMPORTANT PART.
     *
     * index.html uses:
     *
     * tournamentPlayerList
     *
     * NOT:
     *
     * playerList
     */

    let box =
        document.getElementById(
            "tournamentPlayerList"
        );


    /*
     * Extra fallback in case another version
     * of the HTML is currently loaded.
     */

    if (!box) {

        box =
            document.getElementById(
                "playerList"
            );

    }


    if (!box) {

        console.error(
            "Players display box not found."
        );

        return;
    }


    const players =
        data &&
        Array.isArray(data.players)
            ? data.players
            : [];


    /*
     * Clear only the visual list.
     *
     * This DOES NOT delete players
     * from localStorage.
     */

    box.innerHTML = "";


    if (players.length === 0) {

        box.innerHTML = `

            <div class="panel">

                <p>
                    No players added yet.
                </p>

            </div>

        `;

        return;
    }


    /*
     * Render every registered player.
     */

    players.forEach(
        function(player, index) {

            const safeName =
                escapePlayerHTML(
                    player &&
                    player.name
                        ? player.name
                        : "Unknown"
                );


            let logoHTML = "";


            if (
                player &&
                player.logo
            ) {

                logoHTML = `

                    <img
                        src="${player.logo}"
                        alt="${safeName}"
                        class="tournamentPlayerLogo"
                    >

                `;

            }

            else {

                logoHTML = `

                    <div
                        class="tournamentPlayerLogoFallback"
                    >
                        👤
                    </div>

                `;

            }


            const playerID =
                player &&
                player.id !== undefined
                    ? player.id
                    : index;


            box.innerHTML += `

                <div
                    class="player tournamentPlayerCard"
                >

                    <div
                        class="tournamentPlayerInfo"
                    >

                        ${logoHTML}


                        <div
                            class="tournamentPlayerDetails"
                        >

                            <strong>
                                ${safeName}
                            </strong>


                            <span>
                                Player ${index + 1}
                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="deletePlayerButton"
                        onclick="deletePlayer(${playerID})"
                    >
                        🗑
                    </button>

                </div>

            `;

        }
    );
}


/* ============================================================
   DELETE PLAYER
============================================================ */

function deletePlayer(id) {

    const data =
        loadData();


    if (
        !data ||
        !Array.isArray(data.players)
    ) {

        return;
    }


    const player =
        data.players.find(
            function(p) {

                return p.id === id;

            }
        );


    if (!player) {
        return;
    }


    if (
        !confirm(
            "Delete " +
            player.name +
            "?"
        )
    ) {

        return;
    }


    data.players =
        data.players.filter(
            function(p) {

                return p.id !== id;

            }
        );


    saveData(data);


    showPlayers();


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }
}


/* ============================================================
   GET PLAYER LIST
============================================================ */

function getPlayerList() {

    const data =
        loadData();


    if (
        data &&
        Array.isArray(data.players)
    ) {

        return data.players;

    }


    return [];
}


/* ============================================================
   REFRESH WHEN PAGE OPENS
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        showPlayers();

    }
);