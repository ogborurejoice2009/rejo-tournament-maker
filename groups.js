// ============================================================
// REJO TOURNAMENT MAKER - GROUPS
// ============================================================


let draggedPlayer = null;


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHTML(text) {

    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   GET TOURNAMENT PLAYER
============================================================ */

function getPlayerByName(name) {

    const data =
        loadData();


    const players =
        data &&
        Array.isArray(data.players)
            ? data.players
            : [];


    return (
        players.find(
            player =>
                player.name === name
        )
        || null
    );
}


/* ============================================================
   PLAYER BADGE
============================================================ */

function renderPlayerBadge(name) {

    const safeName =
        escapeHTML(
            name || "Unknown"
        );


    const player =
        getPlayerByName(name);


    let logo = "";


    if (
        player &&
        player.logo
    ) {

        logo = `

            <img
                src="${player.logo}"
                alt="${safeName}"
                class="groupPlayerLogo"
            >

        `;
    }


    return `

        <span class="groupPlayerBadge">

            ${logo}

            <span>
                ${safeName}
            </span>

        </span>

    `;
}


/* ============================================================
   SHOW GROUP OPTIONS
============================================================ */

function showGroupOptions() {

    const data =
        loadData();


    const players =
        data &&
        Array.isArray(data.players)
            ? data.players
            : [];


    const box =
        document.getElementById(
            "groupOptions"
        );


    if (!box) {
        return;
    }


    /*
     * FULL SCREEN MODAL
     */

    box.className =
        "groupModal";


    box.style.display =
        "flex";


    /* ========================================================
       NO PLAYERS
    ======================================================== */

    if (players.length < 2) {

        box.innerHTML = `

            <div class="groupModalCard">

                <h3>
                    🏆 Create Groups
                </h3>

                <p class="groupModalMessage">
                    Add at least 2 tournament players first.
                </p>

                <button
                    type="button"
                    onclick="closeGroupOptions()"
                >
                    Close
                </button>

            </div>

        `;

        return;
    }


    /* ========================================================
       VALID GROUP OPTIONS
    ======================================================== */

    let options = [];


    for (
        let i = 2;
        i <= players.length;
        i++
    ) {

        if (
            players.length % i === 0
        ) {

            options.push(i);

        }
    }


    /*
     * Prefer the tournament formats we normally use.
     * If the player count does not match them,
     * fall back to mathematically valid options.
     */

    const preferred = {

        8: [2, 4],

        10: [2, 5],

        12: [2, 3, 4, 6],

        16: [2, 4],

        18: [2, 3, 6],

        20: [2, 4, 5],

        24: [2, 3, 4, 6, 8],

        26: [2]

    };


    if (
        preferred[players.length]
    ) {

        options =
            preferred[players.length]
                .filter(
                    number =>
                        players.length %
                        number === 0
                );
    }


    /* ========================================================
       POPUP
    ======================================================== */

    box.innerHTML = `

        <div
            class="groupModalCard"
        >

            <div class="groupModalHeader">

                <div>

                    <h3>
                        🏆 Create Groups
                    </h3>

                    <p>
                        ${players.length}
                        registered players
                    </p>

                </div>


                <button
                    type="button"
                    class="groupModalClose"
                    onclick="closeGroupOptions()"
                >
                    ✕
                </button>

            </div>


            <div
                class="groupOptionList"
            >

                ${
                    options.map(
                        number => `

                            <button
                                type="button"
                                class="groupOptionButton"
                                onclick="createGroups(${number})"
                            >

                                <strong>
                                    ${number} Groups
                                </strong>

                                <span>
                                    ${players.length / number}
                                    players each
                                </span>

                            </button>

                        `
                    ).join("")
                }

            </div>


            <div class="groupModalPlayers">

                <h4>
                    👥 Registered Players
                </h4>

                <div class="groupModalPlayerList">

                    ${
                        players.map(
                            player => `

                                <div
                                    class="groupModalPlayer"
                                >

                                    ${
                                        player.logo
                                            ? `
                                                <img
                                                    src="${player.logo}"
                                                    alt=""
                                                >
                                            `
                                            : `
                                                <span>
                                                    👤
                                                </span>
                                            `
                                    }

                                    <strong>
                                        ${escapeHTML(
                                            player.name
                                        )}
                                    </strong>

                                </div>

                            `
                        ).join("")
                    }

                </div>

            </div>


            <button
                type="button"
                class="groupCancelButton"
                onclick="closeGroupOptions()"
            >
                Cancel
            </button>

        </div>

    `;
}


/* ============================================================
   CLOSE GROUP OPTIONS
============================================================ */

function closeGroupOptions() {

    const box =
        document.getElementById(
            "groupOptions"
        );


    if (!box) {
        return;
    }


    box.style.display =
        "none";


    box.innerHTML =
        "";


    box.className =
        "";
}


/* ============================================================
   CREATE GROUPS
============================================================ */

function createGroups(numberOfGroups) {

    const data =
        loadData();


    const players =
        data &&
        Array.isArray(data.players)
            ? [...data.players]
            : [];


    if (players.length === 0) {

        alert(
            "Add players first."
        );

        return;
    }


    if (
        players.length %
        numberOfGroups !== 0
    ) {

        alert(
            "Players cannot be divided equally into these groups."
        );

        return;
    }


    /*
     * Shuffle a COPY only.
     * The original registered players
     * are NOT changed.
     */

    players.sort(
        () =>
            Math.random() - 0.5
    );


    const groups = [];


    for (
        let i = 0;
        i < numberOfGroups;
        i++
    ) {

        groups.push({

            name:
                "Group " +
                String.fromCharCode(
                    65 + i
                ),

            players: []

        });
    }


    players.forEach(
        function (player, index) {

            const name =
                typeof player === "string"
                    ? player
                    : (
                        player.name ||
                        "Unknown"
                    );


            groups[
                index %
                numberOfGroups
            ]
            .players.push(name);

        }
    );


    /*
     * ONLY groups are changed here.
     * data.players is untouched.
     */

    data.groups =
        groups;


    saveData(data);


    closeGroupOptions();


    openPage(
        "groupsPage"
    );


    /*
     * Render immediately.
     */

    showGroups();
}


/* ============================================================
   SHOW GROUPS
============================================================ */

function showGroups() {

    const data =
        loadData();


    const box =
        document.getElementById(
            "groups"
        );


    if (!box) {
        return;
    }


    const groups =
        data &&
        Array.isArray(data.groups)
            ? data.groups
            : [];


    if (groups.length === 0) {

        box.innerHTML = `

            <div class="panel">
                <p>
                    No groups created yet.
                </p>
            </div>

        `;

        return;
    }


    box.innerHTML =
        "";


    groups.forEach(
        function (group, gIndex) {

            const players =
                Array.isArray(group.players)
                    ? group.players
                    : [];


            const playerHTML =
                players.map(
                    function (
                        player,
                        pIndex
                    ) {

                        return `

                            <div
                                class="groupPlayerRow"
                                draggable="true"
                                ondragstart="
                                    dragPlayer(
                                        ${gIndex},
                                        ${pIndex}
                                    )
                                "
                                ondrop="
                                    dropPlayer(
                                        ${gIndex},
                                        ${pIndex}
                                    )
                                "
                                ondragover="
                                    event.preventDefault()
                                "
                            >

                                ${renderPlayerBadge(
                                    player
                                )}

                            </div>

                        `;

                    }
                ).join("");


            box.innerHTML += `

                <div
                    class="group"
                >

                    <div
                        class="groupTitle"
                    >

                        <h3>
                            ${escapeHTML(
                                group.name
                            )}
                        </h3>

                        <span>
                            ${players.length}
                            players
                        </span>

                    </div>


                    <div
                        class="groupPlayerList"
                    >

                        ${playerHTML}

                    </div>

                </div>

            `;
        }
    );
}


/* ============================================================
   DRAG PLAYER
============================================================ */

function dragPlayer(
    groupIndex,
    playerIndex
) {

    draggedPlayer = {

        group:
            groupIndex,

        player:
            playerIndex

    };
}


/* ============================================================
   DROP PLAYER
============================================================ */

function dropPlayer(
    groupIndex,
    playerIndex
) {

    if (!draggedPlayer) {
        return;
    }


    const data =
        loadData();


    if (
        !Array.isArray(
            data.groups
        )
    ) {
        return;
    }


    const from =
        data.groups[
            draggedPlayer.group
        ];


    const to =
        data.groups[
            groupIndex
        ];


    if (!from || !to) {
        return;
    }


    const fromPlayers =
        Array.isArray(from.players)
            ? from.players
            : [];


    const toPlayers =
        Array.isArray(to.players)
            ? to.players
            : [];


    if (
        draggedPlayer.player < 0 ||
        draggedPlayer.player >=
            fromPlayers.length
    ) {
        draggedPlayer = null;
        return;
    }


    if (
        playerIndex < 0 ||
        playerIndex >=
            toPlayers.length
    ) {
        draggedPlayer = null;
        return;
    }


    const temp =
        fromPlayers[
            draggedPlayer.player
        ];


    fromPlayers[
        draggedPlayer.player
    ] =
        toPlayers[
            playerIndex
        ];


    toPlayers[
        playerIndex
    ] =
        temp;


    from.players =
        fromPlayers;


    to.players =
        toPlayers;


    saveData(data);


    draggedPlayer =
        null;


    showGroups();
}


/* ============================================================
   REFRESH GROUPS WHEN PAGE OPENS
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        showGroups();

    }
);