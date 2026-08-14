// ============================================================
// REJO GAMER TOURNAMENT - SQUADS.JS
// Squad builder with persistent formation + players
// Mobile-safe player selection
// ============================================================

let selectedSquadOwner = null;
let selectedSlot = null;

window.currentSquadChoices = [];

const BENCH_SLOTS = [
    { slot:"BENCH1", label:"Bench 1" },
    { slot:"BENCH2", label:"Bench 2" },
    { slot:"BENCH3", label:"Bench 3" },
    { slot:"BENCH4", label:"Bench 4" },
    { slot:"BENCH5", label:"Bench 5" }
];

const STARTING_SLOT_ORDER = [
    "GK","LB","CB1","CB2","CB3","RB","LM","RM","CDM","CM1","CM2",
    "CAM","LAM","RAM","LW","RW","ST","ST1","ST2"
];


// ============================================================
// BASIC HELPERS
// ============================================================

function esc(v){

    return String(v ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


function getSlotSortIndex(slot){

    const i =
        STARTING_SLOT_ORDER.indexOf(
            String(slot || "").toUpperCase()
        );

    return i === -1 ? 999 : i;

}


function normalizePosition(position){

    return String(position || "")
        .trim()
        .toUpperCase();

}


// ============================================================
// FORMATIONS
// ============================================================

const formations = {

    "4-3-3 Attack":[

        {slot:"ST",pos:"ST",x:50,y:8},
        {slot:"LW",pos:"LW",x:20,y:28},
        {slot:"RW",pos:"RW",x:80,y:28},

        {slot:"CAM",pos:"CAM",x:50,y:37},

        {slot:"CM1",pos:"CM",x:30,y:50},
        {slot:"CM2",pos:"CM",x:70,y:50},

        {slot:"LB",pos:"LB",x:10,y:68},
        {slot:"CB1",pos:"CB",x:38,y:68},
        {slot:"CB2",pos:"CB",x:62,y:68},
        {slot:"RB",pos:"RB",x:90,y:68},

        {slot:"GK",pos:"GK",x:50,y:90}

    ],


    "4-3-3 Holding":[

        {slot:"ST",pos:"ST",x:50,y:8},
        {slot:"LW",pos:"LW",x:20,y:28},
        {slot:"RW",pos:"RW",x:80,y:28},

        {slot:"CM1",pos:"CM",x:25,y:45},
        {slot:"CDM",pos:"CDM",x:50,y:52},
        {slot:"CM2",pos:"CM",x:75,y:45},

        {slot:"LB",pos:"LB",x:10,y:68},
        {slot:"CB1",pos:"CB",x:38,y:68},
        {slot:"CB2",pos:"CB",x:62,y:68},
        {slot:"RB",pos:"RB",x:90,y:68},

        {slot:"GK",pos:"GK",x:50,y:90}

    ],


    "4-2-3-1":[

        {slot:"ST",pos:"ST",x:50,y:8},

        {slot:"LAM",pos:"CAM",x:20,y:30},
        {slot:"CAM",pos:"CAM",x:50,y:30},
        {slot:"RAM",pos:"CAM",x:80,y:30},

        {slot:"CDM1",pos:"CDM",x:35,y:50},
        {slot:"CDM2",pos:"CDM",x:65,y:50},

        {slot:"LB",pos:"LB",x:10,y:68},
        {slot:"CB1",pos:"CB",x:38,y:68},
        {slot:"CB2",pos:"CB",x:62,y:68},
        {slot:"RB",pos:"RB",x:90,y:68},

        {slot:"GK",pos:"GK",x:50,y:90}

    ],


    "4-4-2":[

        {slot:"ST1",pos:"ST",x:38,y:8},
        {slot:"ST2",pos:"ST",x:62,y:8},

        {slot:"LM",pos:"LM",x:10,y:35},

        {slot:"CM1",pos:"CM",x:38,y:45},
        {slot:"CM2",pos:"CM",x:62,y:45},

        {slot:"RM",pos:"RM",x:90,y:35},

        {slot:"LB",pos:"LB",x:10,y:68},
        {slot:"CB1",pos:"CB",x:38,y:68},
        {slot:"CB2",pos:"CB",x:62,y:68},
        {slot:"RB",pos:"RB",x:90,y:68},

        {slot:"GK",pos:"GK",x:50,y:90}

    ],


    "3-5-2":[

        {slot:"ST1",pos:"ST",x:38,y:8},
        {slot:"ST2",pos:"ST",x:62,y:8},

        {slot:"LM",pos:"LM",x:10,y:35},

        {slot:"CM1",pos:"CM",x:30,y:45},
        {slot:"CAM",pos:"CAM",x:50,y:32},
        {slot:"CM2",pos:"CM",x:70,y:45},

        {slot:"RM",pos:"RM",x:90,y:35},

        {slot:"CB1",pos:"CB",x:25,y:68},
        {slot:"CB2",pos:"CB",x:50,y:72},
        {slot:"CB3",pos:"CB",x:75,y:68},

        {slot:"GK",pos:"GK",x:50,y:90}

    ],


    "4-2-4":[

        {slot:"ST1",pos:"ST",x:38,y:8},
        {slot:"ST2",pos:"ST",x:62,y:8},

        {slot:"LW",pos:"LW",x:12,y:28},
        {slot:"RW",pos:"RW",x:88,y:28},

        {slot:"CDM1",pos:"CDM",x:35,y:50},
        {slot:"CDM2",pos:"CDM",x:65,y:50},

        {slot:"LB",pos:"LB",x:10,y:68},
        {slot:"CB1",pos:"CB",x:38,y:68},
        {slot:"CB2",pos:"CB",x:62,y:68},
        {slot:"RB",pos:"RB",x:90,y:68},

        {slot:"GK",pos:"GK",x:50,y:90}

    ],


    "4-2-1-3":[

        {slot:"ST",pos:"ST",x:50,y:8},

        {slot:"LW",pos:"LW",x:18,y:27},
        {slot:"RW",pos:"RW",x:82,y:27},

        {slot:"CAM",pos:"CAM",x:50,y:38},

        {slot:"CDM1",pos:"CDM",x:35,y:52},
        {slot:"CDM2",pos:"CDM",x:65,y:52},

        {slot:"LB",pos:"LB",x:10,y:68},
        {slot:"CB1",pos:"CB",x:38,y:68},
        {slot:"CB2",pos:"CB",x:62,y:68},
        {slot:"RB",pos:"RB",x:90,y:68},

        {slot:"GK",pos:"GK",x:50,y:90}

    ],


    "4-1-4-1":[

        {slot:"ST",pos:"ST",x:50,y:8},

        {slot:"LM",pos:"LM",x:10,y:34},
        {slot:"CM1",pos:"CM",x:33,y:43},
        {slot:"CM2",pos:"CM",x:67,y:43},
        {slot:"RM",pos:"RM",x:90,y:34},

        {slot:"CDM",pos:"CDM",x:50,y:56},

        {slot:"LB",pos:"LB",x:10,y:70},
        {slot:"CB1",pos:"CB",x:38,y:70},
        {slot:"CB2",pos:"CB",x:62,y:70},
        {slot:"RB",pos:"RB",x:90,y:70},

        {slot:"GK",pos:"GK",x:50,y:90}

    ],


    "4-1-2-1-2 Narrow":[

        {slot:"ST1",pos:"ST",x:38,y:8},
        {slot:"ST2",pos:"ST",x:62,y:8},

        {slot:"CAM",pos:"CAM",x:50,y:30},

        {slot:"CM1",pos:"CM",x:35,y:44},
        {slot:"CM2",pos:"CM",x:65,y:44},

        {slot:"CDM",pos:"CDM",x:50,y:57},

        {slot:"LB",pos:"LB",x:10,y:70},
        {slot:"CB1",pos:"CB",x:38,y:70},
        {slot:"CB2",pos:"CB",x:62,y:70},
        {slot:"RB",pos:"RB",x:90,y:70},

        {slot:"GK",pos:"GK",x:50,y:90}

    ],


    "4-1-2-1-2 Wide":[

        {slot:"ST1",pos:"ST",x:38,y:8},
        {slot:"ST2",pos:"ST",x:62,y:8},

        {slot:"LM",pos:"LM",x:15,y:31},
        {slot:"RM",pos:"RM",x:85,y:31},

        {slot:"CM1",pos:"CM",x:35,y:45},
        {slot:"CM2",pos:"CM",x:65,y:45},

        {slot:"CDM",pos:"CDM",x:50,y:58},

        {slot:"LB",pos:"LB",x:10,y:70},
        {slot:"CB1",pos:"CB",x:38,y:70},
        {slot:"CB2",pos:"CB",x:62,y:70},
        {slot:"RB",pos:"RB",x:90,y:70},

        {slot:"GK",pos:"GK",x:50,y:90}

    ]

};


// ============================================================
// FC PLAYER DATABASE
// ============================================================

function getFCPlayers(){

    const dbs = [

        window.fcplayers,
        window.fcPlayers,
        window.FC_PLAYERS,
        window.playersDatabase,
        window.playerDatabase,
        window.FCMobilePlayers,
        window.fcMobilePlayers,
        window.allPlayers

    ];

    for(
        const db of dbs
    ){

        if(
            Array.isArray(db)
        ){

            return db;

        }

    }

    return [];

}


// ============================================================
// TOURNAMENT PLAYERS
// ============================================================

function getTournamentPlayers(){

    if(
        typeof loadData !== "function"
    ){

        return [];

    }

    try{

        const data =
            loadData() || {};

        return Array.isArray(data.players)
            ? data.players
            : [];

    }catch(error){

        console.error(
            "REJO: Could not load tournament players:",
            error
        );

        return [];

    }

}


// ============================================================
// PLAYER INFO
// ============================================================

function getPlayerName(player){

    return (

        player?.name ||
        player?.playerName ||
        player?.fullName ||
        player?.displayName ||
        player?.title ||
        "Unknown Player"

    );

}


function getPlayerOVR(player){

    return (

        player?.ovr ??
        player?.OVR ??
        player?.rating ??
        player?.overall ??
        player?.baseOVR ??
        ""

    );

}


function getPlayerEvent(player){

    return (

        player?.event ||
        player?.eventName ||
        player?.program ||
        player?.cardEvent ||
        player?.programName ||
        ""

    );

}


function getPlayerImage(player){

    return (

        player?.image ||
        player?.imageUrl ||
        player?.img ||
        player?.photo ||
        player?.cardImage ||
        player?.face ||
        ""

    );

}


// ============================================================
// PLAYER POSITIONS
// ============================================================

function getPlayerPositions(player){

    if(!player){

        return [];

    }

    const positions = [];


    function add(value){

        if(
            value === undefined ||
            value === null
        ){

            return;

        }


        if(
            Array.isArray(value)
        ){

            value.forEach(add);

            return;

        }


        if(
            typeof value === "object"
        ){

            Object.keys(value)
                .forEach(
                    function(key){

                        const val =
                            value[key];


                        if(
                            val === true ||
                            val === 1
                        ){

                            positions.push(
                                normalizePosition(
                                    key
                                )
                            );

                        }else if(
                            typeof val ===
                            "string"
                        ){

                            add(val);

                        }

                    }
                );

            return;

        }


        if(
            typeof value !== "string"
        ){

            return;

        }


        value
            .split(
                /[,/|]+/
            )
            .forEach(
                function(position){

                    const cleaned =
                        normalizePosition(
                            position
                        );


                    if(cleaned){

                        positions.push(
                            cleaned
                        );

                    }

                }
            );

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


function getPlayerPrimaryPosition(player){

    const positions =
        getPlayerPositions(player);

    return positions.length
        ? positions[0]
        : "BENCH";

}


function playerCanPlayPosition(
    player,
    requiredPosition
){

    return getPlayerPositions(
        player
    ).includes(
        normalizePosition(
            requiredPosition
        )
    );

}


// ============================================================
// PERSISTENCE
// ============================================================

function squadKey(){

    return (
        "rejoSquad_" +
        String(
            selectedSquadOwner
        )
    );

}


function stateKey(){

    return (
        "rejoSquadState_" +
        String(
            selectedSquadOwner
        )
    );

}


function formationKey(){

    return (
        "rejoFormation_" +
        String(
            selectedSquadOwner
        )
    );

}


function getSavedSquad(){

    if(
        !selectedSquadOwner
    ){

        return {};

    }


    try{

        const rawState =
            localStorage.getItem(
                stateKey()
            );


        if(rawState){

            const state =
                JSON.parse(
                    rawState
                );


            if(
                state &&
                state.squad &&
                typeof state.squad ===
                    "object"
            ){

                return state.squad;

            }

        }


        const raw =
            localStorage.getItem(
                squadKey()
            );


        if(
            !raw
        ){

            return {};

        }


        const parsed =
            JSON.parse(
                raw
            );


        return (
            parsed &&
            typeof parsed === "object"
        )
            ? parsed
            : {};

    }catch(error){

        console.error(
            "REJO: Could not load squad:",
            error
        );

        return {};

    }

}


function getSavedFormation(){

    if(
        !selectedSquadOwner
    ){

        return "";

    }


    try{

        return (
            localStorage.getItem(
                formationKey()
            ) || ""
        );

    }catch(error){

        return "";

    }

}


function getSavedSquadState(){

    return {

        formation:
            getSavedFormation(),

        squad:
            getSavedSquad()

    };

}


function saveSquadState(
    squad,
    formation
){

    if(
        !selectedSquadOwner
    ){

        return;

    }


    try{

        const state = {

            formation:
                formation || "",

            squad:
                squad &&
                typeof squad ===
                    "object"

                    ? squad
                    : {}

        };


        localStorage.setItem(
            stateKey(),
            JSON.stringify(
                state
            )
        );


        localStorage.setItem(
            formationKey(),
            state.formation
        );


        localStorage.setItem(
            squadKey(),
            JSON.stringify(
                state.squad
            )
        );

    }catch(error){

        console.error(
            "REJO: Could not save squad state:",
            error
        );

    }

}


function saveSquad(
    squad
){

    if(
        !selectedSquadOwner
    ){

        return;

    }


    const formation =
        getSavedFormation() ||
        document.getElementById(
            "formationSelect"
        )?.value ||
        "";


    saveSquadState(
        squad,
        formation
    );


    syncSquadToTournamentPlayer(
        squad
    );

}


function saveFormation(
    formation
){

    if(
        !selectedSquadOwner
    ){

        return;

    }


    saveSquadState(
        getSavedSquad(),
        formation
    );

}


// ============================================================
// SYNC SQUAD TO TOURNAMENT PLAYER
// ============================================================

function syncSquadToTournamentPlayer(
    savedSquad
){

    if(
        typeof loadData !== "function" ||
        typeof saveData !== "function"
    ){

        return;

    }


    try{

        const data =
            loadData() || {};


        const players =
            Array.isArray(data.players)
                ? data.players
                : [];


        const ownerIndex =
            players.findIndex(
                function(player,index){

                    const id =

                        player.id ??
                        player.ign ??
                        player.name ??
                        player.whatsapp ??
                        index;


                    return (
                        String(id) ===
                        String(
                            selectedSquadOwner
                        )
                    );

                }
            );


        if(
            ownerIndex === -1
        ){

            return;

        }


        const squadArray =

            Object.entries(
                savedSquad
            )

            .map(
                function([slot,entry]){

                    if(!entry){

                        return null;

                    }


                    return {

                        slot,
                        ...entry

                    };

                }
            )

            .filter(Boolean)

            .sort(
                function(a,b){

                    const aBench =
                        a.squadRole ===
                        "BENCH";

                    const bBench =
                        b.squadRole ===
                        "BENCH";


                    if(
                        aBench !== bBench
                    ){

                        return aBench
                            ? 1
                            : -1;

                    }


                    return (
                        getSlotSortIndex(
                            a.slot
                        ) -
                        getSlotSortIndex(
                            b.slot
                        )
                    );

                }
            );


        players[
            ownerIndex
        ].squad =
            squadArray;


        data.players =
            players;


        saveData(
            data
        );

    }catch(error){

        console.error(
            "REJO: Could not sync squad:",
            error
        );

    }

}


// ============================================================
// SHOW SQUADS
// ============================================================

function showSquads(){

    showAllSquads();

}


function showAllSquads(){

    const area =
        document.getElementById(
            "squadArea"
        );


    if(!area){

        return;

    }


    selectedSquadOwner =
        null;

    selectedSlot =
        null;


    area.innerHTML = `

        <div class="squadsHome">

            <h2>
                🏆 Squads
            </h2>

            <p>
                Select a tournament player
                to build their squad.
            </p>

            <div
                id="squadOwnerList"
                class="squadOwnerList"
            >
            </div>

        </div>

    `;


    renderSquadOwners();

}


// ============================================================
// RENDER SQUAD OWNERS
// ============================================================

function renderSquadOwners(){

    const list =
        document.getElementById(
            "squadOwnerList"
        );


    if(!list){

        return;

    }


    const players =
        getTournamentPlayers();


    list.innerHTML =
        "";


    if(
        !players.length
    ){

        list.innerHTML = `

            <div class="emptySquadMessage">

                No tournament players
                registered yet.

            </div>

        `;

        return;

    }


    players.forEach(
        function(player,index){

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
                document.createElement(
                    "div"
                );


            card.className =
                "squadOwnerBox";


            card.innerHTML = `

                <div>

                    <div
                        class="squadOwnerBoxName"
                    >
                        ${esc(name)}
                    </div>


                    ${
                        whatsapp &&
                        whatsapp !== name

                            ? `

                                <div
                                    class="squadOwnerWhatsApp"
                                >
                                    ${esc(whatsapp)}
                                </div>

                            `

                            : ""
                    }

                </div>


                <div
                    class="squadOwnerBoxArrow"
                >
                    ›
                </div>

            `;


            card.addEventListener(
                "click",
                function(){

                    const id =

                        player.id ??
                        player.ign ??
                        player.name ??
                        player.whatsapp ??
                        index;


                    openSquadBuilder(
                        String(id)
                    );

                }
            );


            list.appendChild(
                card
            );

        }
    );

}


// ============================================================
// OPEN SQUAD BUILDER
// ============================================================

function openSquadBuilder(
    ownerId
){

    closePlayerChoices();


    selectedSquadOwner =
        String(
            ownerId
        );


    selectedSlot =
        null;


    const area =
        document.getElementById(
            "squadArea"
        );


    if(!area){

        return;

    }


    area.innerHTML = `

        <div class="squadBuilder">

            <button
                type="button"
                id="backToSquads"
                class="backSquadsButton"
            >
                ← Back to Squads
            </button>


            <div
                class="squadBuilderHeader"
            >

                <h2>
                    ⚽ Squad Builder
                </h2>


                <div
                    id="selectedOwnerName"
                    class="selectedOwnerName"
                >
                </div>

            </div>


            <div
                class="squadControls"
            >

                <label
                    for="formationSelect"
                >
                    Formation
                </label>


                <select
                    id="formationSelect"
                >

                    <option value="">
                        Select Formation
                    </option>


                    ${
                        Object.keys(
                            formations
                        )
                        .map(
                            function(name){

                                return `

                                    <option
                                        value="${esc(name)}"
                                    >
                                        ${esc(name)}
                                    </option>

                                `;

                            }
                        )
                        .join("")
                    }

                </select>

            </div>


            <button
                type="button"
                id="saveSquadButton"
                class="saveSquadButton"
                style="
                    margin:10px 0;
                    padding:12px 18px;
                    border-radius:12px;
                "
            >
                💾 Save Squad
            </button>


            <div
                id="footballPitch"
                class="footballPitch"
                style="display:none;"
            >
            </div>


            <div
                id="benchArea"
                class="benchArea"
                style="display:none;"
            >

                <h3>
                    Bench
                </h3>


                <div
                    id="benchSlots"
                    class="benchSlots"
                >
                </div>

            </div>


            <div
                id="playerChoices"
                class="playerChoices"
                style="
                    display:none !important;
                    position:fixed !important;
                    top:50% !important;
                    left:50% !important;
                    right:auto !important;
                    bottom:auto !important;
                    transform:translate(-50%,-50%) !important;
                    width:min(92vw,520px) !important;
                    max-width:520px !important;
                    max-height:86vh !important;
                    margin:0 !important;
                    padding:0 !important;
                    box-sizing:border-box !important;
                    z-index:100001 !important;
                    background:#fff !important;
                    border-radius:18px !important;
                    box-shadow:
                        0 20px 60px
                        rgba(0,0,0,.4) !important;
                    overflow:hidden !important;
                    flex-direction:column !important;
                    pointer-events:auto !important;
                "
            >

                <div
                    class="playerChoicesHeader"
                    style="pointer-events:auto;"
                >

                    <div>

                        <h3>
                            Select Player
                        </h3>


                        <small
                            id="slotHint"
                        >
                        </small>

                    </div>


                    <button
                        type="button"
                        id="closePlayerChoices"
                        class="closePlayerChoices"
                    >
                        ✕
                    </button>

                </div>


                <div
                    style="
                        padding:10px 12px;
                        background:#fff;
                        position:relative;
                        z-index:3;
                        pointer-events:auto;
                    "
                >

                    <input
                        type="search"
                        id="playerSearch"
                        class="playerSearch"
                        placeholder="Search player..."
                        autocomplete="off"
                        spellcheck="false"
                        style="
                            width:100%;
                            box-sizing:border-box;
                        "
                    >

                </div>


                <div
                    id="squadPlayerList"
                    class="squadPlayerList"
                    style="
                        overflow-y:auto;
                        overflow-x:hidden;
                        max-height:58vh;
                        -webkit-overflow-scrolling:touch;
                        pointer-events:auto;
                        touch-action:pan-y;
                    "
                >
                </div>

            </div>

        </div>

    `;


    // Move popup OUTSIDE the squad page container.
    // This prevents the backdrop or page stacking context
    // from blocking taps on the player cards.

    const popup =
        document.getElementById(
            "playerChoices"
        );


    if(popup){

        document.body.appendChild(
            popup
        );

    }


    showSelectedOwnerName();


    const formationSelect =
        document.getElementById(
            "formationSelect"
        );


    const savedState =
        getSavedSquadState();


    const savedFormation =

        savedState.formation &&
        formations[
            savedState.formation
        ]

            ? savedState.formation
            : "";


    if(
        formationSelect &&
        savedFormation
    ){

        formationSelect.value =
            savedFormation;

    }


    renderBenchSlots();


    if(
        savedFormation
    ){

        const pitch =
            document.getElementById(
                "footballPitch"
            );


        const bench =
            document.getElementById(
                "benchArea"
            );


        if(pitch){

            pitch.style.display =
                "block";

        }


        if(bench){

            bench.style.display =
                "block";

        }


        renderFormation(
            savedFormation
        );

    }


    document
        .getElementById(
            "saveSquadButton"
        )
        ?.addEventListener(
            "click",
            function(){

                const formation =
                    document.getElementById(
                        "formationSelect"
                    )?.value || "";


                if(!formation){

                    alert(
                        "Select a formation first."
                    );

                    return;

                }


                saveSquadState(
                    getSavedSquad(),
                    formation
                );


                syncSquadToTournamentPlayer(
                    getSavedSquad()
                );


                alert(
                    "Squad saved successfully."
                );

            }
        );


    document
        .getElementById(
            "backToSquads"
        )
        ?.addEventListener(
            "click",
            function(){

                closePlayerChoices();

                showAllSquads();

            }
        );


    if(
        formationSelect
    ){

        formationSelect.addEventListener(
            "change",
            function(){

                const pitch =
                    document.getElementById(
                        "footballPitch"
                    );


                const bench =
                    document.getElementById(
                        "benchArea"
                    );


                if(
                    !this.value
                ){

                    if(pitch){

                        pitch.style.display =
                            "none";

                        pitch.innerHTML =
                            "";

                    }


                    if(bench){

                        bench.style.display =
                            "none";

                    }


                    closePlayerChoices();

                    return;

                }


                if(pitch){

                    pitch.style.display =
                        "block";

                }


                if(bench){

                    bench.style.display =
                        "block";

                }


                saveFormation(
                    this.value
                );


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


    if(search){

        search.addEventListener(
            "input",
            function(){

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
// OWNER NAME
// ============================================================

function showSelectedOwnerName(){

    const element =
        document.getElementById(
            "selectedOwnerName"
        );


    if(!element){

        return;

    }


    const players =
        getTournamentPlayers();


    const owner =
        players.find(
            function(player,index){

                const id =

                    player.id ??
                    player.ign ??
                    player.name ??
                    player.whatsapp ??
                    index;


                return (
                    String(id) ===
                    String(
                        selectedSquadOwner
                    )
                );

            }
        );


    if(owner){

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

function renderFormation(
    formationName
){

    const pitch =
        document.getElementById(
            "footballPitch"
        );


    const formation =
        formations[
            formationName
        ];


    if(
        !pitch ||
        !formation
    ){

        return;

    }


    pitch.innerHTML =
        "";


    const saved =
        getSavedSquad();


    formation.forEach(
        function(slot){

            const player =
                saved[
                    slot.slot
                ];


            const element =
                document.createElement(
                    "div"
                );


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


            if(player){

                element.innerHTML = `

                    <div
                        class="playerCard"
                    >

                        <div
                            class="playerPosition"
                        >
                            ${esc(
                                player.position ||
                                slot.pos
                            )}
                        </div>


                        <div
                            class="playerName"
                        >
                            ${esc(
                                player.name ||
                                "Player"
                            )}
                        </div>


                        ${
                            player.ovr !== "" &&
                            player.ovr !== null &&
                            player.ovr !== undefined

                                ? `

                                    <div
                                        class="playerOVR"
                                    >
                                        ${esc(
                                            player.ovr
                                        )}
                                    </div>

                                `

                                : ""
                        }

                    </div>

                `;

            }else{

                element.innerHTML = `

                    <div
                        class="emptyPlayer"
                    >

                        <div
                            class="plus"
                        >
                            +
                        </div>


                        <div
                            class="slotPosition"
                        >
                            ${esc(
                                slot.pos
                            )}
                        </div>

                    </div>

                `;

            }


            element.addEventListener(
                "click",
                function(event){

                    event.stopPropagation();

                    chooseSlot(
                        slot.slot,
                        slot.pos
                    );

                }
            );


            pitch.appendChild(
                element
            );

        }
    );


    renderBenchSlots();

}


// ============================================================
// RENDER BENCH
// ============================================================

function renderBenchSlots(){

    const list =
        document.getElementById(
            "benchSlots"
        );


    const area =
        document.getElementById(
            "benchArea"
        );


    if(
        !list ||
        !area
    ){

        return;

    }


    const saved =
        getSavedSquad();


    list.innerHTML =
        "";


    BENCH_SLOTS.forEach(
        function(item){

            const player =
                saved[
                    item.slot
                ];


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "benchSlot";


            element.dataset.slot =
                item.slot;


            element.dataset.position =
                "BENCH";


            if(player){

                element.innerHTML = `

                    <div
                        class="benchSlotLabel"
                    >
                        ${esc(
                            item.label
                        )}
                    </div>


                    <div
                        class="benchSlotPlayer"
                    >

                        <div
                            class="benchPlayerName"
                        >
                            ${esc(
                                player.name ||
                                "Player"
                            )}
                        </div>


                        <div
                            class="benchPlayerPos"
                        >
                            ${esc(
                                player.position ||
                                "BENCH"
                            )}
                        </div>

                    </div>

                `;

            }else{

                element.innerHTML = `

                    <div
                        class="benchSlotLabel"
                    >
                        ${esc(
                            item.label
                        )}
                    </div>


                    <div
                        class="benchSlotEmpty"
                    >
                        +
                    </div>

                `;

            }


            element.addEventListener(
                "click",
                function(event){

                    event.stopPropagation();

                    chooseSlot(
                        item.slot,
                        "BENCH"
                    );

                }
            );


            list.appendChild(
                element
            );

        }
    );

}


// ============================================================
// CHOOSE SLOT
// ============================================================

function chooseSlot(
    slot,
    position
){

    const formation =
        document.getElementById(
            "formationSelect"
        );


    if(
        !formation ||
        !formation.value
    ){

        closePlayerChoices();

        return;

    }


    selectedSlot = {

        slot:
            slot,

        position:
            position

    };


    showPlayersForSlot(
        position
    );

}


// ============================================================
// SHOW PLAYER POPUP
// ============================================================

function showPlayersForSlot(
    position
){

    const box =
        document.getElementById(
            "playerChoices"
        );


    const list =
        document.getElementById(
            "squadPlayerList"
        );


    if(
        !box ||
        !list
    ){

        return;

    }


    const pos =
        normalizePosition(
            position
        );


    const allPlayers =
        getFCPlayers();


    const isBench =
        pos === "BENCH";


    window.currentSquadChoices =

        isBench

            ? allPlayers

            : allPlayers.filter(
                function(player){

                    return playerCanPlayPosition(
                        player,
                        pos
                    );

                }
            );


    const hint =
        document.getElementById(
            "slotHint"
        );


    if(hint){

        hint.textContent =

            isBench

                ? "Bench • " +
                  window.currentSquadChoices.length +
                  " players"

                : "Position: " +
                  pos +
                  " • " +
                  window.currentSquadChoices.length +
                  " players";

    }


    // --------------------------------------------------------
    // BACKDROP
    // --------------------------------------------------------

    let backdrop =
        document.getElementById(
            "squadPlayerChoicesBackdrop"
        );


    if(!backdrop){

        backdrop =
            document.createElement(
                "div"
            );


        backdrop.id =
            "squadPlayerChoicesBackdrop";


        Object.assign(
            backdrop.style,
            {

                position:
                    "fixed",

                inset:
                    "0",

                background:
                    "rgba(0,0,0,.68)",

                backdropFilter:
                    "blur(4px)",

                webkitBackdropFilter:
                    "blur(4px)",

                zIndex:
                    "100000",

                pointerEvents:
                    "auto"

            }
        );


        backdrop.addEventListener(
            "click",
            function(event){

                event.stopPropagation();

                closePlayerChoices();

            }
        );


        document.body.appendChild(
            backdrop
        );

    }


    backdrop.style.display =
        "block";


    // --------------------------------------------------------
    // POPUP
    // --------------------------------------------------------

    // Make absolutely certain the popup is above backdrop.

    if(
        box.parentElement !==
        document.body
    ){

        document.body.appendChild(
            box
        );

    }


    box.style.setProperty(
        "display",
        "flex",
        "important"
    );


    box.style.position =
        "fixed";


    box.style.top =
        "50%";


    box.style.left =
        "50%";


    box.style.right =
        "auto";


    box.style.bottom =
        "auto";


    box.style.transform =
        "translate(-50%,-50%)";


    box.style.zIndex =
        "100001";


    box.style.pointerEvents =
        "auto";


    box.style.touchAction =
        "manipulation";


    list.style.pointerEvents =
        "auto";


    list.style.touchAction =
        "pan-y";


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    const search =
        document.getElementById(
            "playerSearch"
        );


    if(search){

        search.value =
            "";


        setTimeout(
            function(){

                try{

                    search.focus(
                        {
                            preventScroll:
                                true
                        }
                    );

                }catch(error){

                    search.focus();

                }

            },
            50
        );

    }


    renderPlayerChoices(
        ""
    );

}


// ============================================================
// RENDER PLAYER CHOICES
// ============================================================

function renderPlayerChoices(
    searchText = ""
){

    const list =
        document.getElementById(
            "squadPlayerList"
        );


    if(!list){

        return;

    }


    const query =
        String(
            searchText || ""
        )
        .trim()
        .toLowerCase();


    const players =
        Array.isArray(
            window.currentSquadChoices
        )
            ? window.currentSquadChoices
            : [];


    const filtered =
        players.filter(
            function(player){

                if(
                    !query
                ){

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

                    name.includes(
                        query
                    )

                    ||

                    event.includes(
                        query
                    )

                    ||

                    positions.includes(
                        query
                    )

                );

            }
        );


    list.innerHTML =
        "";


    if(
        !filtered.length
    ){

        list.innerHTML = `

            <div
                class="noPlayers"
                style="
                    padding:20px;
                    text-align:center;
                "
            >
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
        function(player){

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "playerChoice";


            // Force touch interaction.

            card.style.pointerEvents =
                "auto";


            card.style.touchAction =
                "manipulation";


            card.style.cursor =
                "pointer";


            card.style.userSelect =
                "none";


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
                                src="${esc(image)}"
                                alt="${esc(name)}"
                                draggable="false"
                                onerror="
                                    this.style.display='none';
                                "
                            >

                        `

                        : `

                            <div
                                class="choicePlayerImagePlaceholder"
                            >
                                ⚽
                            </div>

                        `
                }


                <div
                    class="choicePlayerInfo"
                >

                    <div
                        class="choicePlayerName"
                    >
                        ${esc(name)}
                    </div>


                    <div
                        class="choicePlayerPosition"
                    >

                        ${
                            positions.length

                                ? esc(
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

                                <div
                                    class="choicePlayerOVR"
                                >
                                    OVR:
                                    ${esc(
                                        ovr
                                    )}
                                </div>

                            `

                            : ""
                    }


                    ${
                        event

                            ? `

                                <div
                                    class="choicePlayerEvent"
                                >
                                    ${esc(
                                        event
                                    )}
                                </div>

                            `

                            : ""
                    }

                </div>


                <div
                    class="choicePlayerArrow"
                >
                    ›
                </div>

            `;


            // ------------------------------------------------
            // PRIMARY MOBILE TOUCH HANDLER
            // ------------------------------------------------

            card.addEventListener(
                "pointerup",
                function(event){

                    event.preventDefault();
                    event.stopPropagation();


                    selectSquadPlayer(
                        player
                    );

                },
                {
                    passive:false
                }
            );


            // ------------------------------------------------
            // NORMAL CLICK FALLBACK
            // ------------------------------------------------

            card.addEventListener(
                "click",
                function(event){

                    event.preventDefault();
                    event.stopPropagation();


                    // Avoid selecting twice if pointerup
                    // already handled this interaction.

                    if(
                        card.dataset.selected ===
                        "1"
                    ){

                        return;

                    }


                    card.dataset.selected =
                        "1";


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

}


// ============================================================
// SELECT PLAYER
// ============================================================

function selectSquadPlayer(
    player
){

    if(
        !selectedSlot
    ){

        return;

    }


    // Save a copy before closing popup.

    const slot =
        selectedSlot.slot;


    const position =
        selectedSlot.position;


    const saved =
        getSavedSquad();


    const isBench =
        position ===
        "BENCH";


    const playerPositions =
        getPlayerPositions(
            player
        );


    const primaryPosition =
        getPlayerPrimaryPosition(
            player
        );


    saved[slot] = {

        id:

            player.id ??

            player.playerId ??

            getPlayerName(
                player
            ),


        name:

            getPlayerName(
                player
            ),


        ovr:

            getPlayerOVR(
                player
            ),


        position:

            isBench

                ? primaryPosition

                : position,


        positions:

            playerPositions,


        event:

            getPlayerEvent(
                player
            ),


        image:

            getPlayerImage(
                player
            ),


        slot:
            slot,


        squadRole:

            isBench

                ? "BENCH"

                : "STARTER"

    };


    // Save immediately.

    saveSquad(
        saved
    );


    // Close popup.

    closePlayerChoices();


    // Re-render formation immediately.

    const formation =
        document.getElementById(
            "formationSelect"
        );


    if(
        formation &&
        formation.value
    ){

        renderFormation(
            formation.value
        );

    }

}


// ============================================================
// CLOSE PLAYER POPUP
// ============================================================

function closePlayerChoices(){

    const box =
        document.getElementById(
            "playerChoices"
        );


    if(box){

        box.style.setProperty(
            "display",
            "none",
            "important"
        );

    }


    const backdrop =
        document.getElementById(
            "squadPlayerChoicesBackdrop"
        );


    if(backdrop){

        backdrop.remove();

    }


    // Remove popup from body completely.
    // It will be recreated when the squad builder opens.

    if(
        box &&
        box.parentElement ===
            document.body
    ){

        box.remove();

    }


    selectedSlot =
        null;

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

window.saveSquad =
    saveSquad;

window.saveFormation =
    saveFormation;


// ============================================================
// STARTUP
// ============================================================

console.log(
    "REJO SQUADS.JS loaded successfully"
);