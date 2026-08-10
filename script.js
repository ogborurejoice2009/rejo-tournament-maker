// ============================================================
// REJO GAMER TOURNAMENT - SCRIPT.JS
// MAIN PAGE CONTROLLER
// ============================================================


// ============================================================
// OPEN PAGE
// ============================================================

function openPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(function(p) {

            p.style.display = "none";

        });


    const selected =
        document.getElementById(page);


    if (!selected) {

        console.error(
            "Page not found:",
            page
        );

        return;

    }


    selected.style.display = "block";


    switch(page) {


        // ====================================================
        // DASHBOARD
        // ====================================================

        case "dashboard":

            if (
                typeof updateDashboard ===
                "function"
            ) {

                updateDashboard();

            }

            break;



        // ====================================================
        // PLAYERS
        // ====================================================

        case "playersPage":

            if (
                typeof showPlayers ===
                "function"
            ) {

                showPlayers();

            }

            break;



        // ====================================================
        // GROUPS
        // ====================================================

        case "groupsPage":

            if (
                typeof showGroups ===
                "function"
            ) {

                showGroups();

            }

            break;



        // ====================================================
        // FIXTURES
        // ====================================================

        case "fixturesPage":

            if (
                typeof showFixtures ===
                "function"
            ) {

                showFixtures();

            }

            break;



        // ====================================================
        // TABLE
        // ====================================================

        case "tablePage":

            const tableSelect =
                document.querySelector(
                    "#tablePage select"
                );


            if (
                typeof showTable ===
                "function"
            ) {

                showTable(
                    tableSelect
                        ? tableSelect.value
                        : ""
                );

            }

            break;



        // ====================================================
        // SQUADS
        // ====================================================

        case "squadsPage":

            if (
                typeof showAllSquads ===
                "function"
            ) {

                showAllSquads();

            }

            else if (
                typeof showSquads ===
                "function"
            ) {

                showSquads();

            }

            break;



        // ====================================================
        // KNOCKOUT
        // ====================================================

        case "knockoutPage":

            if (
                typeof showKnockout ===
                "function"
            ) {

                showKnockout();

            }

            break;



        // ====================================================
        // AWARDS
        // ====================================================

        case "awardsPage":

            if (
                typeof calculateAwards ===
                "function"
            ) {

                try {

                    calculateAwards();

                }

                catch(error) {

                    console.error(error);

                }

            }

            break;

    }

}



// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {

    if (
        typeof loadData !==
        "function"
    ) {

        return;

    }


    const data =
        loadData() || {};



    const dashPlayers =
        document.getElementById(
            "dashPlayers"
        );


    if (dashPlayers) {

        dashPlayers.textContent =
            Array.isArray(data.players)
                ? data.players.length
                : 0;

    }



    const dashChampion =
        document.getElementById(
            "dashChampion"
        );


    if (dashChampion) {

        dashChampion.textContent =
            data.knockout?.champion ||
            "-";

    }



    let total = 0;

    let played = 0;



    // NORMAL FIXTURES

    if (
        Array.isArray(data.fixtures)
    ) {

        total +=
            data.fixtures.length;


        data.fixtures.forEach(
            function(match) {

                if (match.played) {

                    played++;

                }

            }
        );

    }



    // KNOCKOUT

    if (data.knockout) {

        [
            "quarterFinals",
            "semiFinals",
            "final"
        ]
        .forEach(
            function(round) {

                if (
                    Array.isArray(
                        data.knockout[round]
                    )
                ) {

                    total +=
                        data.knockout[round].length;


                    data.knockout[round]
                        .forEach(
                            function(match) {

                                if (
                                    match.homeScore !==
                                    null &&
                                    match.homeScore !==
                                    undefined
                                ) {

                                    played++;

                                }

                            }
                        );

                }

            }
        );

    }



    const dashPlayed =
        document.getElementById(
            "dashPlayed"
        );


    if (dashPlayed) {

        dashPlayed.textContent =
            played;

    }



    const dashLeft =
        document.getElementById(
            "dashLeft"
        );


    if (dashLeft) {

        dashLeft.textContent =
            Math.max(
                0,
                total - played
            );

    }

}



// ============================================================
// START APP
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        openPage("dashboard");

    }
);



// ============================================================
// GLOBAL
// ============================================================

window.openPage =
    openPage;

window.updateDashboard =
    updateDashboard;