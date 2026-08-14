// fixtures.js

function escapeHTML(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getPlayerByName(name) {
    let data = loadData();
    let players = Array.isArray(data.players) ? data.players : [];

    return players.find(function(player) {
        return (
            player.name === name ||
            player.ign === name ||
            player.whatsapp === name
        );
    }) || null;
}

function renderPlayerBadge(name) {
    let safeName = escapeHTML(name || "Unknown");
    let player = getPlayerByName(name);

    let logo = player && player.logo
        ? `<img
            src="${escapeHTML(player.logo)}"
            alt="${safeName}"
            style="
                width:28px;
                height:28px;
                object-fit:contain;
                border-radius:50%;
                vertical-align:middle;
                margin-right:8px;
                flex:0 0 auto;
            "
        >`
        : "";

    return `
        <span style="display:inline-flex;align-items:center;gap:6px;">
            ${logo}
            <span>${safeName}</span>
        </span>
    `;
}


/* ============================================================
   GENERATE FIXTURES
   ============================================================ */

function generateFixtures() {

    let data = loadData();

    if (!data) {
        data = {};
    }

    if (!Array.isArray(data.groups) || data.groups.length === 0) {
        alert("Create groups first");
        return;
    }

    function createGroupSchedule(groupPlayers, groupName) {

        let teams = Array.isArray(groupPlayers)
            ? groupPlayers
                .map(function(player) {
                    return typeof player === "string"
                        ? player
                        : (
                            player?.ign ||
                            player?.name ||
                            player?.whatsapp ||
                            "Unknown"
                        );
                })
                .filter(Boolean)
            : [];

        if (teams.length < 2) {
            return [];
        }

        let scheduleTeams = [...teams];

        if (scheduleTeams.length % 2 !== 0) {
            scheduleTeams.push(null);
        }

        let rounds = scheduleTeams.length - 1;
        let rotation = [...scheduleTeams];

        let groupFixtures = [];

        for (let round = 0; round < rounds; round++) {

            let half = rotation.length / 2;

            for (let i = 0; i < half; i++) {

                let home = rotation[i];
                let away = rotation[rotation.length - 1 - i];

                if (!home || !away) {
                    continue;
                }

                if (round % 2 === 1) {
                    let temp = home;
                    home = away;
                    away = temp;
                }

                groupFixtures.push({
                    group: groupName,
                    matchDay: round + 1,
                    home: home,
                    away: away
                });
            }

            let fixed = rotation[0];
            let rest = rotation.slice(1);

            rest.unshift(rest.pop());

            rotation = [fixed, ...rest];
        }

        return groupFixtures;
    }

    let scheduled = [];

    data.groups.forEach(function(group) {

        if (!group || !Array.isArray(group.players)) {
            return;
        }

        let groupSchedule = createGroupSchedule(
            group.players,
            group.name || "Group"
        );

        scheduled.push(...groupSchedule);
    });

    if (scheduled.length === 0) {
        alert("No matches could be created. Check your groups.");
        return;
    }

    let idSeed = Date.now();

    let fixtures = scheduled.map(function(match, index) {

        return {
            id: idSeed + index,
            group: match.group,
            matchDay: match.matchDay,
            home: match.home,
            away: match.away,

            homeScore: null,
            awayScore: null,

            played: false,

            scorers: [],
            assists: [],

            mvp: null
        };

    });

    data.fixtures = fixtures;

    saveData(data);

    document.querySelectorAll(".page").forEach(function(page) {
        page.style.display = "none";
    });

    let fixturesPage =
        document.getElementById("fixturesPage");

    if (fixturesPage) {
        fixturesPage.style.display = "block";
    }

    showFixtures();
}


/* ============================================================
   SHOW FIXTURES
   ============================================================ */

function showFixtures() {

    let data = loadData();

    let box =
        document.getElementById("fixtures");

    if (!box) {
        return;
    }

    let fixtures =
        Array.isArray(data.fixtures)
            ? data.fixtures
            : [];

    box.innerHTML = "";

    if (fixtures.length === 0) {

        box.innerHTML =
            "<p>No fixtures created yet.</p>";

        return;
    }

    let groupedByDay = {};

    fixtures.forEach(function(match, index) {

        let day =
            Number(match.matchDay) || 1;

        if (!groupedByDay[day]) {
            groupedByDay[day] = [];
        }

        groupedByDay[day].push({
            match: match,
            index: index
        });

    });

    let days =
        Object.keys(groupedByDay)
            .map(Number)
            .sort(function(a, b) {
                return a - b;
            });

    days.forEach(function(day) {

        let dayMatches =
            groupedByDay[day];

        let html = `

            <section
                class="matchDaySection"
                style="margin-bottom:24px;"
            >

                <div
                    class="matchDayHeader"
                    style="
                        position:sticky;
                        top:0;
                        z-index:2;
                        padding:12px 14px;
                        margin-bottom:10px;
                        border-radius:12px;
                        background:rgba(0,0,0,.08);
                        backdrop-filter:blur(6px);
                    "
                >

                    <h2 style="margin:0;">
                        MATCH DAY ${day}
                    </h2>

                </div>
        `;

        let groupedByGroup = {};

        dayMatches.forEach(function(item) {

            let groupName =
                item.match.group || "Group";

            if (!groupedByGroup[groupName]) {
                groupedByGroup[groupName] = [];
            }

            groupedByGroup[groupName].push(item);

        });

        Object.keys(groupedByGroup)
            .forEach(function(groupName) {

                html += `

                    <div
                        class="fixtureGroup"
                        style="margin-bottom:16px;"
                    >

                        <h3 style="margin:0 0 8px;">
                            ${escapeHTML(groupName)}
                        </h3>

                `;

                groupedByGroup[groupName]
                    .forEach(function(item) {

                        let match =
                            item.match;

                        let index =
                            item.index;

                        html += `

                            <div class="fixture">

                                <p>

                                    ${renderPlayerBadge(match.home)}

                                    <b>VS</b>

                                    ${renderPlayerBadge(match.away)}

                                </p>

                                ${
                                    match.played

                                    ? `
                                        <p>
                                            Result:
                                            ${match.homeScore}
                                            -
                                            ${match.awayScore}
                                        </p>
                                    `

                                    : ""
                                }

                                <button
                                    type="button"
                                    onclick="openResult(${index})"
                                >
                                    Result
                                </button>

                                <button
                                    type="button"
                                    onclick="editFixture(${index})"
                                >
                                    Edit Fixture
                                </button>

                            </div>

                        `;

                    });

                html += `
                    </div>
                `;

            });

        html += `
            </section>
        `;

        box.innerHTML += html;

    });
}


/* ============================================================
   EDIT FIXTURE
   ============================================================ */

function editFixture(index) {

    let data = loadData();

    if (
        !Array.isArray(data.fixtures) ||
        !data.fixtures[index]
    ) {
        return;
    }

    let match =
        data.fixtures[index];

    let newHome =
        prompt(
            "Enter new home player",
            match.home
        );

    let newAway =
        prompt(
            "Enter new away player",
            match.away
        );

    if (newHome && newAway) {

        match.home =
            newHome.trim();

        match.away =
            newAway.trim();

        saveData(data);

        showFixtures();
    }
}


function swapFixture(index) {

    let data = loadData();

    if (
        !Array.isArray(data.fixtures) ||
        !data.fixtures[index]
    ) {
        return;
    }

    let match =
        data.fixtures[index];

    let temp =
        match.home;

    match.home =
        match.away;

    match.away =
        temp;

    saveData(data);

    showFixtures();
}


/* ============================================================
   OPEN RESULT
   ============================================================ */

function openResult(index) {

    sessionStorage.setItem(
        "fixturesScroll",
        window.scrollY
    );

    let data = loadData();

    if (
        !Array.isArray(data.fixtures) ||
        !data.fixtures[index]
    ) {
        return;
    }

    let match =
        data.fixtures[index];

    let homePlayers =
        getTeamSquadPlayers(match.home);

    let awayPlayers =
        getTeamSquadPlayers(match.away);

    let homeGK =
        getGoalkeeper(match.home);

    let awayGK =
        getGoalkeeper(match.away);

    let box =
        document.getElementById("fixtures");

    if (!box) {
        return;
    }

    box.innerHTML = `

        <div class="fixture">

            <h2>

                ${renderPlayerBadge(match.home)}

                vs

                ${renderPlayerBadge(match.away)}

            </h2>


            <h3>Goalkeepers</h3>

            <p>
                ${renderPlayerBadge(match.home)}
                GK:
                <b>${escapeHTML(homeGK)}</b>
            </p>

            <p>
                ${renderPlayerBadge(match.away)}
                GK:
                <b>${escapeHTML(awayGK)}</b>
            </p>


            <h3>Score</h3>

            <input
                id="homeScore"
                type="number"
                min="0"
                value="${match.homeScore ?? 0}"
                onchange="loadGoalInputs(${index})"
            >

            -

            <input
                id="awayScore"
                type="number"
                min="0"
                value="${match.awayScore ?? 0}"
                onchange="loadGoalInputs(${index})"
            >


            <div id="goalInputs"></div>

            <div id="assistInputs"></div>


            <h3>
                ⭐ Man Of The Match
            </h3>

            <select id="motm">

                <option value="">
                    Select Player
                </option>

                ${createCombinedPlayerOptions(
                    homePlayers,
                    match.home,
                    match.mvp?.player
                )}

                ${createCombinedPlayerOptions(
                    awayPlayers,
                    match.away,
                    match.mvp?.player
                )}

            </select>


            <br><br>

            <button
                type="button"
                onclick="saveResult(${index})"
            >
                Save Result
            </button>

        </div>

    `;

    loadGoalInputs(index);
}


/* ============================================================
   PLAYER OPTIONS
   ============================================================ */

function createCombinedPlayerOptions(
    players,
    team,
    selectedPlayer
) {

    if (!Array.isArray(players)) {
        return "";
    }

    return players.map(function(player) {

        let playerName =
            getFixturePlayerName(player);

        return `

            <option
                value="${escapeHTML(playerName)}"
                ${
                    selectedPlayer === playerName
                        ? "selected"
                        : ""
                }
            >

                ${escapeHTML(playerName)}
                (${escapeHTML(team)})

            </option>

        `;

    }).join("");
}


/* ============================================================
   LOAD GOAL + ASSIST INPUTS
   ============================================================ */

function loadGoalInputs(index) {

    let data = loadData();

    if (
        !Array.isArray(data.fixtures) ||
        !data.fixtures[index]
    ) {
        return;
    }

    let match =
        data.fixtures[index];

    let homeScoreElement =
        document.getElementById("homeScore");

    let awayScoreElement =
        document.getElementById("awayScore");

    if (!homeScoreElement || !awayScoreElement) {
        return;
    }

    let homeScore =
        Math.max(
            0,
            Number(homeScoreElement.value || 0)
        );

    let awayScore =
        Math.max(
            0,
            Number(awayScoreElement.value || 0)
        );

    let homePlayers =
        getTeamSquadPlayers(match.home);

    let awayPlayers =
        getTeamSquadPlayers(match.away);

    let goalBox =
        document.getElementById("goalInputs");

    let assistBox =
        document.getElementById("assistInputs");


    if (goalBox) {

        goalBox.innerHTML = `

            <h3>
                ${escapeHTML(match.home)}
                Goalscorers
            </h3>

            ${createPlayerSelects(
                homePlayers,
                "homeScorer",
                homeScore
            )}


            <h3>
                ${escapeHTML(match.away)}
                Goalscorers
            </h3>

            ${createPlayerSelects(
                awayPlayers,
                "awayScorer",
                awayScore
            )}

        `;

    }


    if (assistBox) {

        assistBox.innerHTML = `

            <h3>
                ${escapeHTML(match.home)}
                Assists
            </h3>

            ${createPlayerSelects(
                homePlayers,
                "homeAssist",
                homeScore
            )}


            <h3>
                ${escapeHTML(match.away)}
                Assists
            </h3>

            ${createPlayerSelects(
                awayPlayers,
                "awayAssist",
                awayScore
            )}

        `;

    }
}


/* ============================================================
   CREATE PLAYER SELECTS
   ============================================================ */

function createPlayerSelects(
    players,
    type,
    amount
) {

    let html = "";

    players =
        Array.isArray(players)
            ? players
            : [];

    amount =
        Math.max(
            0,
            Number(amount || 0)
        );

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        html += `

            <select
                class="${type}"
            >

                <option value="">
                    Select player
                </option>

                ${
                    players
                        .map(function(player) {

                            let playerName =
                                getFixturePlayerName(
                                    player
                                );

                            return `

                                <option
                                    value="${escapeHTML(playerName)}"
                                >

                                    ${escapeHTML(playerName)}

                                </option>

                            `;

                        })
                        .join("")
                }

            </select>

            <br><br>

        `;

    }

    if (
        amount > 0 &&
        players.length === 0
    ) {

        return `

            <p
                style="
                    color:#999;
                    font-size:14px;
                "
            >
                No squad players found.
                Add players to the squad first.
            </p>

        `;

    }

    return html;
}


/* ============================================================
   SAVE RESULT
   ============================================================ */

function saveResult(index) {

    let data = loadData();

    if (
        !Array.isArray(data.fixtures) ||
        !data.fixtures[index]
    ) {
        return;
    }

    let match =
        data.fixtures[index];

    let homeScoreElement =
        document.getElementById("homeScore");

    let awayScoreElement =
        document.getElementById("awayScore");

    let homeScore =
        Number(
            homeScoreElement?.value || 0
        );

    let awayScore =
        Number(
            awayScoreElement?.value || 0
        );

    match.homeScore =
        homeScore;

    match.awayScore =
        awayScore;


    /* -----------------------------
       GOALSCORERS
    ----------------------------- */

    match.scorers = [];


    document
        .querySelectorAll(".homeScorer")
        .forEach(function(select) {

            if (select.value) {

                match.scorers.push({

                    team:
                        match.home,

                    player:
                        select.value

                });

            }

        });


    document
        .querySelectorAll(".awayScorer")
        .forEach(function(select) {

            if (select.value) {

                match.scorers.push({

                    team:
                        match.away,

                    player:
                        select.value

                });

            }

        });


    /* -----------------------------
       ASSISTS
    ----------------------------- */

    match.assists = [];


    document
        .querySelectorAll(".homeAssist")
        .forEach(function(select) {

            if (select.value) {

                match.assists.push({

                    team:
                        match.home,

                    player:
                        select.value

                });

            }

        });


    document
        .querySelectorAll(".awayAssist")
        .forEach(function(select) {

            if (select.value) {

                match.assists.push({

                    team:
                        match.away,

                    player:
                        select.value

                });

            }

        });


    /* -----------------------------
       MVP
    ----------------------------- */

    let motm =
        document.getElementById("motm");

    if (
        motm &&
        motm.value
    ) {

        match.mvp = {

            player:
                motm.value

        };

    } else {

        match.mvp =
            null;

    }


    match.played =
        true;


    saveData(data);


    alert(
        "Result saved"
    );


    openPage(
        "fixturesPage"
    );
}


/* ============================================================
   NORMALIZE SQUAD
   ============================================================ */

function normalizeSquadArray(squad) {

    if (Array.isArray(squad)) {

        return squad.filter(
            Boolean
        );

    }

    if (
        squad &&
        typeof squad === "object"
    ) {

        return Object.values(
            squad
        ).filter(
            Boolean
        );

    }

    return [];
}


/* ============================================================
   FIND TOURNAMENT PLAYER
   ============================================================ */

function findTournamentOwner(team) {

    let data =
        loadData() || {};

    let players =
        Array.isArray(data.players)
            ? data.players
            : [];

    let wanted =
        String(team || "")
            .trim()
            .toLowerCase();

    if (!wanted) {
        return null;
    }

    return players.find(
        function(player) {

            let values = [

                player?.name,
                player?.ign,
                player?.whatsapp,
                player?.id

            ]
                .filter(
                    function(value) {
                        return (
                            value !== undefined &&
                            value !== null
                        );
                    }
                )
                .map(
                    function(value) {
                        return String(value)
                            .trim()
                            .toLowerCase();
                    }
                );

            return values.includes(
                wanted
            );

        }
    ) || null;
}


/* ============================================================
   GET FC PLAYER NAME
   ============================================================ */

function getFixturePlayerName(
    player
) {

    return (
        player?.name ||
        player?.playerName ||
        player?.fullName ||
        player?.displayName ||
        "Unknown Player"
    );

}


/* ============================================================
   GET PLAYER POSITIONS
   ============================================================ */

function getPlayerPositionsForFixture(
    player
) {

    if (!player) {
        return [];
    }

    let output = [];

    function add(value) {

        if (Array.isArray(value)) {

            value.forEach(
                add
            );

            return;
        }

        if (
            typeof value ===
            "string"
        ) {

            value
                .split(
                    /[,/|]+/
                )
                .map(
                    function(value) {

                        return value
                            .trim()
                            .toUpperCase();

                    }
                )
                .filter(Boolean)
                .forEach(
                    function(value) {

                        output.push(
                            value
                        );

                    }
                );

        }

    }

    add(player.positions);
    add(player.position);
    add(player.pos);
    add(player.altPositions);
    add(player.alternatePositions);
    add(player.secondaryPositions);
    add(player.alternatePosition);
    add(player.secondaryPosition);

    return [
        ...new Set(output)
    ];
}


/* ============================================================
   GET TEAM SQUAD
   ============================================================ */

function getTeamSquadPlayers(team) {

    let owner =
        findTournamentOwner(team);

    if (!owner) {

        console.warn(
            "REJO: Tournament owner not found:",
            team
        );

        return [];

    }


    /* -----------------------------------------
       FIRST: SQUAD SAVED DIRECTLY ON PLAYER
    ----------------------------------------- */

    let syncedSquad =
        normalizeSquadArray(
            owner.squad
        );

    if (
        syncedSquad.length
    ) {

        return syncedSquad;

    }


    /* -----------------------------------------
       SECOND: LOCALSTORAGE SQUAD
    ----------------------------------------- */

    let identifiers = [

        owner.id,
        owner.ign,
        owner.name,
        owner.whatsapp

    ]
        .filter(
            function(value) {

                return (
                    value !== undefined &&
                    value !== null
                );

            }
        )
        .map(
            function(value) {

                return String(value);

            }
        );


    for (
        const id of identifiers
    ) {

        try {

            let raw =
                localStorage.getItem(
                    "rejoSquad_" + id
                );

            if (!raw) {
                continue;
            }

            let parsed =
                JSON.parse(raw);

            let localSquad =
                normalizeSquadArray(
                    parsed
                );

            if (
                localSquad.length
            ) {

                return localSquad;

            }

        } catch (error) {

            console.warn(
                "REJO: Could not read saved squad:",
                id,
                error
            );

        }

    }


    console.warn(
        "REJO: No squad found for:",
        team
    );

    return [];

}


/* ============================================================
   GET GOALKEEPER
   ============================================================ */

function getGoalkeeper(team) {

    let squad =
        getTeamSquadPlayers(
            team
        );

    let goalkeeper =
        squad.find(
            function(player) {

                let position =
                    String(
                        player?.position || ""
                    )
                        .trim()
                        .toUpperCase();

                return (
                    position === "GK" ||
                    getPlayerPositionsForFixture(
                        player
                    ).includes("GK")
                );

            }
        );


    if (goalkeeper) {

        return getFixturePlayerName(
            goalkeeper
        );

    }

    return "No GK";
}