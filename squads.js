// ============================================================
// REJO GAMER TOURNAMENT - SQUADS.JS
// COMPLETE MATCHED VERSION
// ============================================================

let selectedSquadOwner = null;
let selectedSlot = null;

window.currentSquadChoices = [];

const BENCH_SLOTS = [
    { slot: "BENCH1", label: "Bench 1" },
    { slot: "BENCH2", label: "Bench 2" },
    { slot: "BENCH3", label: "Bench 3" },
    { slot: "BENCH4", label: "Bench 4" },
    { slot: "BENCH5", label: "Bench 5" }
];

const STARTING_SLOT_ORDER = [
    "GK", "LB", "CB1", "CB2", "CB3", "RB",
    "LM", "RM", "CDM", "CM1", "CM2",
    "CAM", "LAM", "RAM", "LW", "RW",
    "ST", "ST1", "ST2"
];

function getSlotSortIndex(slot) {
    const index = STARTING_SLOT_ORDER.indexOf(
        String(slot || "").toUpperCase()
    );

    return index === -1 ? 999 : index;
}

function getPlayerPrimaryPosition(player) {
    const positions = getPlayerPositions(player);
    return positions.length ? positions[0] : "BENCH";
}

function syncSquadToTournamentPlayer(savedSquad) {
    if (
        typeof loadData !== "function" ||
        typeof saveData !== "function"
    ) {
        return;
    }

    try {
        const data = loadData() || {};
        const players = Array.isArray(data.players)
            ? data.players
            : [];

        const ownerIndex = players.findIndex(function(player, index) {
            const id =
                player.id ??
                player.ign ??
                player.name ??
                player.whatsapp ??
                index;

            return String(id) === String(selectedSquadOwner);
        });

        if (ownerIndex === -1) {
            return;
        }

        const squadArray = Object.entries(savedSquad)
            .map(function([slot, entry]) {
                if (!entry) return null;
                return {
                    slot,
                    ...entry
                };
            })
            .filter(Boolean)
            .sort(function(a, b) {
                const aBench = a.squadRole === "BENCH";
                const bBench = b.squadRole === "BENCH";

                if (aBench !== bBench) {
                    return aBench ? 1 : -1;
                }

                return getSlotSortIndex(a.slot) - getSlotSortIndex(b.slot);
            });

        players[ownerIndex].squad = squadArray;
        data.players = players;
        saveData(data);
    } catch (error) {
        console.error("REJO: Could not sync squad to tournament player:", error);
    }
}

// ============================================================
// FORMATIONS
// ============================================================

const formations = {
    "4-3-3 Attack": [
        {slot:"ST",  pos:"ST",  x:50, y:8},
        {slot:"LW",  pos:"LW",  x:20, y:28},
        {slot:"RW",  pos:"RW",  x:80, y:28},
        {slot:"CAM", pos:"CAM", x:50, y:37},
        {slot:"CM1", pos:"CM", x:30, y:50},
        {slot:"CM2", pos:"CM", x:70, y:50},
        {slot:"LB",  pos:"LB", x:10, y:68},
        {slot:"CB1", pos:"CB", x:38, y:68},
        {slot:"CB2", pos:"CB", x:62, y:68},
        {slot:"RB",  pos:"RB", x:90, y:68},
        {slot:"GK",  pos:"GK", x:50, y:90}
    ],

    "4-3-3 Holding": [
        {slot:"ST",  pos:"ST",  x:50, y:8},
        {slot:"LW",  pos:"LW",  x:20, y:28},
        {slot:"RW",  pos:"RW",  x:80, y:28},
        {slot:"CM1", pos:"CM",  x:25, y:45},
        {slot:"CDM", pos:"CDM", x:50, y:52},
        {slot:"CM2", pos:"CM",  x:75, y:45},
        {slot:"LB",  pos:"LB",  x:10, y:68},
        {slot:"CB1", pos:"CB",  x:38, y:68},
        {slot:"CB2", pos:"CB",  x:62, y:68},
        {slot:"RB",  pos:"RB",  x:90, y:68},
        {slot:"GK",  pos:"GK",  x:50, y:90}
    ],

    "4-2-3-1": [
        {slot:"ST",   pos:"ST",  x:50, y:8},
        {slot:"LAM",  pos:"CAM", x:20, y:30},
        {slot:"CAM",  pos:"CAM", x:50, y:30},
        {slot:"RAM",  pos:"CAM", x:80, y:30},
        {slot:"CDM1", pos:"CDM", x:35, y:50},
        {slot:"CDM2", pos:"CDM", x:65, y:50},
        {slot:"LB",   pos:"LB",  x:10, y:68},
        {slot:"CB1",  pos:"CB",  x:38, y:68},
        {slot:"CB2",  pos:"CB",  x:62, y:68},
        {slot:"RB",   pos:"RB",  x:90, y:68},
        {slot:"GK",   pos:"GK",  x:50, y:90}
    ],

    "4-4-2": [
        {slot:"ST1", pos:"ST", x:38, y:8},
        {slot:"ST2", pos:"ST", x:62, y:8},
        {slot:"LM",  pos:"LM", x:10, y:35},
        {slot:"CM1", pos:"CM", x:38, y:45},
        {slot:"CM2", pos:"CM", x:62, y:45},
        {slot:"RM",  pos:"RM", x:90, y:35},
        {slot:"LB",  pos:"LB", x:10, y:68},
        {slot:"CB1", pos:"CB", x:38, y:68},
        {slot:"CB2", pos:"CB", x:62, y:68},
        {slot:"RB",  pos:"RB", x:90, y:68},
        {slot:"GK",  pos:"GK", x:50, y:90}
    ],

    "3-5-2": [
        {slot:"ST1", pos:"ST",  x:38, y:8},
        {slot:"ST2", pos:"ST",  x:62, y:8},
        {slot:"LM",  pos:"LM",  x:10, y:35},
        {slot:"CM1", pos:"CM",  x:30, y:45},
        {slot:"CAM", pos:"CAM", x:50, y:32},
        {slot:"CM2", pos:"CM",  x:70, y:45},
        {slot:"RM",  pos:"RM",  x:90, y:35},
        {slot:"CB1", pos:"CB",  x:25, y:68},
        {slot:"CB2", pos:"CB",  x:50, y:72},
        {slot:"CB3", pos:"CB",  x:75, y:68},
        {slot:"GK",  pos:"GK", x:50, y:90}
    ]
};


// ============================================================
// FC PLAYER DATABASE
// ============================================================

function getFCPlayers() {

    const possibleDatabases = [

        window.fcplayers,
        window.fcPlayers,
        window.FC_PLAYERS,
        window.playersDatabase,
        window.playerDatabase,
        window.FCMobilePlayers,
        window.fcMobilePlayers,
        window.allPlayers

    ];

    for (const database of possibleDatabases) {

        if (Array.isArray(database)) {

            return database;

        }

    }

    return [];
}


// ============================================================
// TOURNAMENT PLAYERS
// ============================================================

function getTournamentPlayers() {

    if (typeof loadData !== "function") {

        return [];

    }

    try {

        const data = loadData() || {};

        return Array.isArray(data.players)
            ? data.players
            : [];

    } catch (error) {

        console.error(
            "Could not load tournament players:",
            error
        );

        return [];

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// SHOW SQUADS
// ============================================================

function showSquads() {

    showAllSquads();

}


// ============================================================
// SHOW ALL SQUADS
// ============================================================

function showAllSquads() {

    const area =
        document.getElementById("squadArea");

    if (!area) {

        console.error(
            "REJO: squadArea not found"
        );

        return;

    }


    selectedSquadOwner = null;
    selectedSlot = null;


    area.innerHTML = `
        <div class="squadsHome">
            <h2>🏆 Squads</h2>
            <p>
                Select a tournament player to build their squad.
            </p>
            <div
                id="squadOwnerList"
                class="squadOwnerList">
            </div>
        </div>
    `;


    renderSquadOwners();

}


// ============================================================
// RENDER TOURNAMENT PLAYER BOXES
// ============================================================

function renderSquadOwners() {

    const list =
        document.getElementById(
            "squadOwnerList"
        );

    if (!list) return;


    const players =
        getTournamentPlayers();


    list.innerHTML = "";


    if (!players.length) {

        list.innerHTML = `
            <div class="emptySquadMessage">
                No tournament players registered yet.
            </div>
        `;

        return;

    }


    players.forEach(function(player, index) {

        const name =
            player.ign ||
            player.name ||
            player.whatsapp ||
            `Player ${index + 1}`;


        const whatsapp =
            player.whatsapp ||
            player.name ||
            "";


        const card =
            document.createElement("div");


        card.className =
            "squadOwnerBox";


        card.innerHTML = `
            <div>
                <div class="squadOwnerBoxName">
                    ${escapeHTML(name)}
                </div>

                ${
                    whatsapp &&
                    whatsapp !== name
                    ? `
                        <div class="squadOwnerWhatsApp">
                            ${escapeHTML(whatsapp)}
                        </div>
                    `
                    : ""
                }
            </div>

            <div class="squadOwnerBoxArrow">
                ›
            </div>
        `;


        card.addEventListener(
            "click",
            function() {

                const ownerId =
                    player.id ??
                    player.ign ??
                    player.name ??
                    player.whatsapp ??
                    index;


                openSquadBuilder(
                    String(ownerId)
                );

            }
        );


        list.appendChild(card);

    });

}


// ============================================================
// OPEN SQUAD BUILDER
// ============================================================

function openSquadBuilder(ownerId) {

    selectedSquadOwner =
        String(ownerId);

    selectedSlot = null;


    const area =
        document.getElementById(
            "squadArea"
        );

    if (!area) return;


    area.innerHTML = `
        <div class="squadBuilder">

            <button
                type="button"
                id="backToSquads"
                class="backSquadsButton">
                ← Back to Squads
            </button>

            <div class="squadBuilderHeader">
                <h2>
                    ⚽ Squad Builder
                </h2>
                <div
                    id="selectedOwnerName"
                    class="selectedOwnerName">
                </div>
            </div>

            <div class="squadControls">
                <label for="formationSelect">
                    Formation
                </label>

                <select
                    id="formationSelect">
                    <option value="">
                        Select Formation
                    </option>

                    ${
                        Object.keys(formations)
                            .map(function(name) {
                                return `
                                    <option
                                        value="${escapeHTML(name)}">
                                        ${escapeHTML(name)}
                                    </option>
                                `;
                            })
                            .join("")
                    }
                </select>
            </div>


            <div
                id="footballPitch"
                class="footballPitch"
                style="display:none;">
            </div>

            <div
                id="benchArea"
                class="benchArea"
                style="display:none;">
                <h3>Bench</h3>
                <div
                    id="benchSlots"
                    class="benchSlots">
                </div>
            </div>

            <!-- IMPORTANT:
                 This is NOT playerList.
                 It is unique to the squad system.
            -->
            <div
                id="playerChoices"
                class="playerChoices"
                style="display:none;">

                <div class="playerChoicesHeader">

                    <div>

                        <h3>
                            Select Player
                        </h3>

                        <small
                            id="slotHint">
                        </small>

                    </div>


                    <button
                        type="button"
                        id="closePlayerChoices"
                        class="closePlayerChoices">

                        ✕
                    </button>

                </div>


                <input
                    type="search"
                    id="playerSearch"
                    class="playerSearch"
                    placeholder="Search player..."
                    autocomplete="off"
                    spellcheck="false">


                <div
                    id="squadPlayerList"
                    class="squadPlayerList">

                </div>

            </div>

        </div>
    `;


    showSelectedOwnerName();
    renderBenchSlots();


    document
        .getElementById("backToSquads")
        ?.addEventListener(
            "click",
            showAllSquads
        );


    const formationSelect =
        document.getElementById(
            "formationSelect"
        );


    if (formationSelect) {

        formationSelect.addEventListener(
            "change",
            function() {

                const pitch =
                    document.getElementById(
                        "footballPitch"
                    );

                const benchArea =
                    document.getElementById(
                        "benchArea"
                    );


                if (!this.value) {

                    if (pitch) {

                        pitch.style.display =
                            "none";

                        pitch.innerHTML =
                            "";

                    }

                    if (benchArea) {
                        benchArea.style.display =
                            "none";
                    }

                    closePlayerChoices();
                    return;

                }


                if (pitch) {
                    pitch.style.display =
                        "block";
                }

                if (benchArea) {
                    benchArea.style.display =
                        "block";
                }

                renderFormation(
                    this.value
                );

            }
        );

    }


    const search =
        document.getElementById(
            "playerSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            function() {

                renderPlayerChoices(
                    this.value
                );

            }
        );

    }


    document
        .getElementById(
            "closePlayerChoices"
        )
        ?.addEventListener(
            "click",
            closePlayerChoices
        );

}


// ============================================================
// SHOW OWNER NAME
// ============================================================

function showSelectedOwnerName() {

    const element =
        document.getElementById(
            "selectedOwnerName"
        );

    if (!element) return;


    const players =
        getTournamentPlayers();


    const owner =
        players.find(
            function(player, index) {

                const id =
                    player.id ??
                    player.ign ??
                    player.name ??
                    player.whatsapp ??
                    index;


                return String(id) ===
                    String(selectedSquadOwner);

            }
        );


    if (owner) {

        element.textContent =
            owner.ign ||
            owner.name ||
            owner.whatsapp ||
            "Tournament Player";

    }

}


// ============================================================
// RENDER FORMATION
// ============================================================

function renderFormation(formationName) {

    const pitch =
        document.getElementById(
            "footballPitch"
        );

    if (!pitch) return;


    const formation =
        formations[formationName];

    if (!formation) return;


    pitch.innerHTML = "";


    const savedSquad =
        getSavedSquad();


    formation.forEach(function(slot) {

        const player =
            savedSquad[slot.slot];


        const element =
            document.createElement("div");


        element.className =
            "playerSlot";


        element.style.left =
            slot.x + "%";


        element.style.top =
            slot.y + "%";


        element.dataset.slot =
            slot.slot;


        element.dataset.position =
            slot.pos;


        if (player) {

            element.innerHTML = `
                <div class="playerCard">
                    <div class="playerPosition">
                        ${escapeHTML(
                            player.position ||
                            slot.pos
                        )}
                    </div>


                    <div class="playerName">
                        ${escapeHTML(
                            player.name ||
                            "Player"
                        )}
                    </div>


                    ${
                        player.ovr !== "" &&
                        player.ovr !== null &&
                        player.ovr !== undefined
                        ? `
                            <div class="playerOVR">
                                ${escapeHTML(
                                    player.ovr
                                )}
                            </div>
                        `
                        : ""
                    }
                </div>
            `;

        } else {

            element.innerHTML = `
                <div class="emptyPlayer">
                    <div class="plus">
                        +
                    </div>
                    <div class="slotPosition">
                        ${escapeHTML(
                            slot.pos
                        )}
                    </div>
                </div>
            `;

        }


        element.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();


                chooseSlot(
                    slot.slot,
                    slot.pos
                );

            }
        );


        pitch.appendChild(element);

    });

    renderBenchSlots();

}


// ============================================================
// RENDER BENCH
// ============================================================

function renderBenchSlots() {
    const area = document.getElementById("benchArea");
    const list = document.getElementById("benchSlots");

    if (!area || !list) return;

    const saved = getSavedSquad();

    list.innerHTML = "";

    BENCH_SLOTS.forEach(function(item) {
        const player = saved[item.slot];

        const slotElement = document.createElement("div");
        slotElement.className = "benchSlot";
        slotElement.dataset.slot = item.slot;
        slotElement.dataset.position = "BENCH";

        if (player) {
            slotElement.innerHTML = `
                <div class="benchSlotLabel">
                    ${escapeHTML(item.label)}
                </div>

                <div class="benchSlotPlayer">
                    <div class="benchPlayerName">
                        ${escapeHTML(player.name || "Player")}
                    </div>

                    <div class="benchPlayerPos">
                        ${escapeHTML(player.position || "BENCH")}
                    </div>
                </div>
            `;
        } else {
            slotElement.innerHTML = `
                <div class="benchSlotLabel">
                    ${escapeHTML(item.label)}
                </div>

                <div class="benchSlotEmpty">
                    +
                </div>
            `;
        }

        slotElement.addEventListener(
            "click",
            function(event) {
                event.stopPropagation();
                chooseSlot(item.slot, "BENCH");
            }
        );

        list.appendChild(slotElement);
    });
}


// ============================================================
// CHOOSE SLOT
// ============================================================

function chooseSlot(slot, position) {

    selectedSlot = {
        slot: slot,
        position: position
    };


    showPlayersForSlot(
        position
    );

}


// ============================================================
// NORMALIZE POSITION
// ============================================================

function normalizePosition(position) {

    return String(position || "")
        .trim()
        .toUpperCase();

}


// ============================================================
// GET PLAYER POSITIONS
// ============================================================

function getPlayerPositions(player) {

    if (!player) return [];


    const positions = [];


    function add(value) {

        if (
            value === undefined ||
            value === null
        ) {

            return;

        }


        if (Array.isArray(value)) {

            value.forEach(add);

            return;

        }


        if (
            typeof value === "number"
        ) {

            return;

        }


        if (
            typeof value === "string"
        ) {

            value
                .split(
                    /[,/|]+/
                )
                .forEach(
                    function(pos) {

                        const cleaned =
                            normalizePosition(
                                pos
                            );


                        if (cleaned) {

                            positions.push(
                                cleaned
                            );

                        }

                    }
                );

            return;

        }


        if (
            typeof value === "object"
        ) {

            Object.keys(value)
                .forEach(
                    function(key) {

                        const val =
                            value[key];


                        if (
                            val === true ||
                            val === 1
                        ) {

                            positions.push(
                                normalizePosition(
                                    key
                                )
                            );

                        }
                        else if (
                            typeof val ===
                            "string"
                        ) {

                            add(val);

                        }

                    }
                );

        }

    }


    add(player.positions);
    add(player.position);
    add(player.pos);
    add(player.primaryPosition);
    add(player.altPositions);
    add(player.alternatePositions);
    add(player.alternatePosition);
    add(player.secondaryPosition);
    add(player.secondaryPositions);
    add(player.altPosition);


    return [
        ...new Set(
            positions
        )
    ];

}


// ============================================================
// PLAYER POSITION CHECK
// ============================================================

function playerCanPlayPosition(
    player,
    requiredPosition
) {

    const required =
        normalizePosition(
            requiredPosition
        );


    const positions =
        getPlayerPositions(
            player
        );


    return positions.includes(
        required
    );

}


// ============================================================
// SHOW PLAYERS FOR SLOT
// ============================================================

function showPlayersForSlot(position) {

    const box =
        document.getElementById(
            "playerChoices"
        );


    const list =
        document.getElementById(
            "squadPlayerList"
        );


    if (!box || !list) {
        console.error(
            "REJO: squad player selector missing"
        );
        return;
    }


    const allPlayers =
        getFCPlayers();


    console.log(
        "REJO FC DATABASE:",
        allPlayers.length
    );


    const normalizedPosition =
        normalizePosition(
            position
        );


    const isBench = normalizedPosition === "BENCH";

    window.currentSquadChoices =
        isBench
            ? allPlayers
            : allPlayers.filter(
                function(player) {

                    return playerCanPlayPosition(
                        player,
                        normalizedPosition
                    );

                }
            );


    console.log(
        "REJO POSITION:",
        normalizedPosition
    );


    console.log(
        "REJO AVAILABLE:",
        window.currentSquadChoices.length
    );


    const hint =
        document.getElementById(
            "slotHint"
        );


    if (hint) {
        hint.textContent =
            isBench
                ? "Bench • " + window.currentSquadChoices.length + " players"
                : "Position: " +
                  normalizedPosition +
                  " • " +
                  window.currentSquadChoices.length +
                  " players";
    }


    box.style.display =
        "flex";


    const search =
        document.getElementById(
            "playerSearch"
        );


    if (search) {

        search.value = "";

    }


    renderPlayerChoices("");

}


// ============================================================
// GET PLAYER NAME
// ============================================================

function getPlayerName(player) {

    if (!player) {
        return "Unknown Player";
    }


    return (
        player.name ||
        player.playerName ||
        player.fullName ||
        player.displayName ||
        player.title ||
        "Unknown Player"
    );

}


// ============================================================
// GET PLAYER OVR
// ============================================================

function getPlayerOVR(player) {

    if (!player) return "";


    return (
        player.ovr ??
        player.OVR ??
        player.rating ??
        player.overall ??
        player.baseOVR ??
        ""
    );

}


// ============================================================
// GET PLAYER EVENT
// ============================================================

function getPlayerEvent(player) {

    if (!player) return "";


    return (
        player.event ||
        player.eventName ||
        player.program ||
        player.cardEvent ||
        player.programName ||
        ""
    );

}


// ============================================================
// GET PLAYER IMAGE
// ============================================================

function getPlayerImage(player) {

    if (!player) return "";


    return (
        player.image ||
        player.imageUrl ||
        player.img ||
        player.photo ||
        player.cardImage ||
        player.face ||
        ""
    );

}


// ============================================================
// RENDER PLAYER CHOICES
// ============================================================

function renderPlayerChoices(
    searchText = ""
) {

    const list =
        document.getElementById(
            "squadPlayerList"
        );


    if (!list) {
        console.error(
            "REJO: squadPlayerList not found"
        );
        return;
    }


    const players =
        Array.isArray(
            window.currentSquadChoices
        )
            ? window.currentSquadChoices
            : [];


    const query =
        String(searchText || "")
            .trim()
            .toLowerCase();


    const filtered =
        players.filter(
            function(player) {

                if (!query) {
                    return true;
                }


                const name =
                    getPlayerName(
                        player
                    )
                    .toLowerCase();


                const event =
                    getPlayerEvent(
                        player
                    )
                    .toLowerCase();


                const positions =
                    getPlayerPositions(
                        player
                    )
                    .join(" ")
                    .toLowerCase();


                return (
                    name.includes(query) ||
                    event.includes(query) ||
                    positions.includes(query)
                );

            }
        );


    list.innerHTML = "";


    if (!filtered.length) {
        list.innerHTML = `
            <div class="noPlayers">
                ${
                    query
                    ? "No player found"
                    : "No players available"
                }
            </div>
        `;
        return;
    }


    filtered.forEach(
        function(player) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "playerChoice";


            const name =
                getPlayerName(
                    player
                );


            const ovr =
                getPlayerOVR(
                    player
                );


            const event =
                getPlayerEvent(
                    player
                );


            const image =
                getPlayerImage(
                    player
                );


            const positions =
                getPlayerPositions(
                    player
                );


            card.innerHTML = `
                ${
                    image
                    ? `
                        <img
                            class="choicePlayerImage"
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            onerror="
                                this.style.display='none';
                            "
                        >
                    `
                    : `
                        <div
                            class="choicePlayerImagePlaceholder">
                            ⚽
                        </div>
                    `
                }

                <div class="choicePlayerInfo">
                    <div class="choicePlayerName">
                        ${escapeHTML(name)}
                    </div>

                    <div class="choicePlayerPosition">
                        ${
                            positions.length
                            ? escapeHTML(
                                positions.join(
                                    " / "
                                )
                            )
                            : "Position unavailable"
                        }
                    </div>

                    ${
                        ovr !== ""
                        ? `
                            <div class="choicePlayerOVR">
                                OVR:
                                ${escapeHTML(ovr)}
                            </div>
                        `
                        : ""
                    }

                    ${
                        event
                        ? `
                            <div class="choicePlayerEvent">
                                ${escapeHTML(event)}
                            </div>
                        `
                        : ""
                    }
                </div>

                <div class="choicePlayerArrow">
                    ›
                </div>
            `;


            card.addEventListener(
                "click",
                function() {

                    selectSquadPlayer(
                        player
                    );

                }
            );


            list.appendChild(
                card
            );

        }
    );


    console.log(
        "REJO VISIBLE PLAYER CARDS:",
        filtered.length
    );

}


// ============================================================
// SELECT PLAYER
// ============================================================

function selectSquadPlayer(player) {

    if (!selectedSlot) {
        return;
    }


    const saved =
        getSavedSquad();
    const playerPositions = getPlayerPositions(player);
    const primaryPosition = getPlayerPrimaryPosition(player);

    const isBench = selectedSlot.position === "BENCH";


    saved[selectedSlot.slot] = {
        id:
            player.id ??
            player.playerId ??
            getPlayerName(player),

        name:
            getPlayerName(player),

        ovr:
            getPlayerOVR(player),

        position:
            isBench
                ? primaryPosition
                : selectedSlot.position,

        positions:
            playerPositions,

        event:
            getPlayerEvent(player),

        image:
            getPlayerImage(player),

        slot:
            selectedSlot.slot,

        squadRole:
            isBench ? "BENCH" : "STARTER"
    };


    saveSquad(
        saved
    );


    closePlayerChoices();


    const formationSelect =
        document.getElementById(
            "formationSelect"
        );


    if (
        formationSelect &&
        formationSelect.value
    ) {
        renderFormation(
            formationSelect.value
        );
    }

}


// ============================================================
// GET SAVED SQUAD
// ============================================================

function getSavedSquad() {

    if (!selectedSquadOwner) {

        return {};

    }


    try {

        const key =
            "rejoSquad_" +
            String(
                selectedSquadOwner
            );


        const saved =
            localStorage.getItem(
                key
            );


        if (!saved) {

            return {};

        }


        const parsed =
            JSON.parse(
                saved
            );


        return (

            parsed &&
            typeof parsed === "object"

                ? parsed
                : {}

        );

    } catch (error) {

        console.error(
            "REJO: Could not load squad:",
            error
        );


        return {};

    }

}


// ============================================================
// SAVE SQUAD
// ============================================================

function saveSquad(squad) {
    if (!selectedSquadOwner) {
        return;
    }

    try {
        const key =
            "rejoSquad_" +
            String(selectedSquadOwner);

        localStorage.setItem(
            key,
            JSON.stringify(squad)
        );

        syncSquadToTournamentPlayer(squad);
    } catch (error) {
        console.error(
            "REJO: Could not save squad:",
            error
        );
    }
}

// ============================================================
// CLOSE PLAYER CHOICES
// ============================================================

function closePlayerChoices() {

    const box =
        document.getElementById(
            "playerChoices"
        );


    if (box) {

        box.style.display =
            "none";

    }


    selectedSlot = null;

}


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.showSquads =
    showSquads;

window.showAllSquads =
    showAllSquads;

window.openSquadBuilder =
    openSquadBuilder;

window.renderFormation =
    renderFormation;

window.chooseSlot =
    chooseSlot;

window.showPlayersForSlot =
    showPlayersForSlot;

window.renderPlayerChoices =
    renderPlayerChoices;

window.selectSquadPlayer =
    selectSquadPlayer;

window.closePlayerChoices =
    closePlayerChoices;


// ============================================================
// STARTUP
// ============================================================

console.log(
    "REJO SQUADS.JS loaded successfully"
);