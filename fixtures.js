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
    return players.find(player => player.name === name) || null;
}

function renderPlayerBadge(name) {
    let safeName = escapeHTML(name || "Unknown");
    let player = getPlayerByName(name);

    let logo = player && player.logo
        ? `<img
            src="${player.logo}"
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

function generateFixtures() {

    let data = loadData();

    if (!data) {
        data = {};
    }

    if (!Array.isArray(data.groups) || data.groups.length === 0) {
        alert("Create groups first");
        return;
    }

    let fixtures = [];

    data.groups.forEach(group => {

        if (!group || !Array.isArray(group.players)) {
            return;
        }

        let teams = group.players;

        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {

                fixtures.push({
                    id: Date.now() + Math.random(),
                    group: group.name,
                    home: teams[i],
                    away: teams[j],
                    homeScore: null,
                    awayScore: null,
                    played: false,
                    scorers: [],
                    assists: [],
                    mvp: null
                });
            }
        }
    });

    if (fixtures.length === 0) {
        alert("No matches could be created. Check your groups.");
        return;
    }

    data.fixtures = fixtures;
    saveData(data);

    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });

    let fixturesPage = document.getElementById("fixturesPage");

    if (fixturesPage) {
        fixturesPage.style.display = "block";
    }

    showFixtures();
}

function showFixtures() {

    let data = loadData();
    let box = document.getElementById("fixtures");

    if (!box) return;

    let fixtures = Array.isArray(data.fixtures) ? data.fixtures : [];

    box.innerHTML = "";

    if (fixtures.length === 0) {
        box.innerHTML = "<p>No fixtures created yet.</p>";
        return;
    }

    fixtures.forEach((match, index) => {

        box.innerHTML += `

        <div class="fixture">

        <h3>${match.group}</h3>

        <p>
            ${renderPlayerBadge(match.home)}
            <b>VS</b>
            ${renderPlayerBadge(match.away)}
        </p>

        ${
            match.played
            ? `<p>Result: ${match.homeScore} - ${match.awayScore}</p>`
            : ""
        }

        <button type="button" onclick="openResult(${index})">
            Result
        </button>

        <button type="button" onclick="editFixture(${index})">
            Edit Fixture
        </button>

        </div>

        `;
    });
}

function editFixture(index) {

    let data = loadData();

    if (!Array.isArray(data.fixtures) || !data.fixtures[index]) {
        return;
    }

    let match = data.fixtures[index];

    let newHome = prompt(
        "Enter new home player",
        match.home
    );

    let newAway = prompt(
        "Enter new away player",
        match.away
    );

    if (newHome && newAway) {

        match.home = newHome.trim();
        match.away = newAway.trim();

        saveData(data);
        showFixtures();
    }
}

function swapFixture(index) {

    let data = loadData();

    if (!Array.isArray(data.fixtures) || !data.fixtures[index]) {
        return;
    }

    let match = data.fixtures[index];

    let temp = match.home;
    match.home = match.away;
    match.away = temp;

    saveData(data);
    showFixtures();
}

function openResult(index) {

    sessionStorage.setItem(
        "fixturesScroll",
        window.scrollY
    );

    let data = loadData();

    if (!Array.isArray(data.fixtures) || !data.fixtures[index]) {
        return;
    }

    let match = data.fixtures[index];

    let homeGK = getGoalkeeper(match.home);
    let awayGK = getGoalkeeper(match.away);

    let homePlayers = getTeamSquadPlayers(match.home);
    let awayPlayers = getTeamSquadPlayers(match.away);

    let box = document.getElementById("fixtures");

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

<p>${renderPlayerBadge(match.home)} GK: <b>${homeGK}</b></p>
<p>${renderPlayerBadge(match.away)} GK: <b>${awayGK}</b></p>

<h3>Score</h3>

<input
id="homeScore"
type="number"
min="0"
value="${match.homeScore ?? 0}"
onchange="loadGoalInputs(${index})">

-

<input
id="awayScore"
type="number"
min="0"
value="${match.awayScore ?? 0}"
onchange="loadGoalInputs(${index})">

<div id="goalInputs"></div>
<div id="assistInputs"></div>

<h3>⭐ Man Of The Match</h3>

<select id="motm">
<option value="">Select Player</option>

${homePlayers.map(player => `
    <option value="${player.name}"
    ${(match.mvp && match.mvp.player === player.name) ? "selected" : ""}>
    ${player.name} (${match.home})
    </option>
`).join("")}

${awayPlayers.map(player => `
    <option value="${player.name}"
    ${(match.mvp && match.mvp.player === player.name) ? "selected" : ""}>
    ${player.name} (${match.away})
    </option>
`).join("")}

</select>

<br><br>

<button type="button" onclick="saveResult(${index})">
Save Result
</button>

</div>

`;

    loadGoalInputs(index);
}

function loadGoalInputs(index) {

    let data = loadData();

    if (!Array.isArray(data.fixtures) || !data.fixtures[index]) {
        return;
    }

    let match = data.fixtures[index];

    let homeScore = Number(
        document.getElementById("homeScore").value || 0
    );

    let awayScore = Number(
        document.getElementById("awayScore").value || 0
    );

    let homePlayers = getTeamSquadPlayers(match.home);
    let awayPlayers = getTeamSquadPlayers(match.away);

    let goalBox = document.getElementById("goalInputs");
    let assistBox = document.getElementById("assistInputs");

    if (goalBox) {

        goalBox.innerHTML = `

        <h3>${match.home} Goalscorers</h3>

        ${createPlayerSelects(
            homePlayers,
            "homeScorer",
            homeScore
        )}

        <h3>${match.away} Goalscorers</h3>

        ${createPlayerSelects(
            awayPlayers,
            "awayScorer",
            awayScore
        )}

        `;
    }

    if (assistBox) {

        assistBox.innerHTML = `

        <h3>${match.home} Assists</h3>

        ${createPlayerSelects(
            homePlayers,
            "homeAssist",
            homeScore
        )}

        <h3>${match.away} Assists</h3>

        ${createPlayerSelects(
            awayPlayers,
            "awayAssist",
            awayScore
        )}

        `;
    }
}

function createPlayerSelects(players, type, amount) {

    let html = "";

    for (let i = 0; i < amount; i++) {

        html += `

        <select class="${type}">
            <option value="">Select player</option>
            ${players.map(player => `
                <option value="${player.name}">
                    ${player.name}
                </option>
            `).join("")}
        </select>

        <br><br>

        `;
    }

    return html;
}

function saveResult(index) {

    let data = loadData();

    if (!Array.isArray(data.fixtures) || !data.fixtures[index]) {
        return;
    }

    let match = data.fixtures[index];

    let homeScore = Number(
        document.getElementById("homeScore").value || 0
    );

    let awayScore = Number(
        document.getElementById("awayScore").value || 0
    );

    match.homeScore = homeScore;
    match.awayScore = awayScore;

    match.scorers = [];
    match.assists = [];

    document.querySelectorAll(".homeScorer")
        .forEach(select => {

            if (select.value) {
                match.scorers.push({
                    team: match.home,
                    player: select.value
                });
            }
        });

    document.querySelectorAll(".awayScorer")
        .forEach(select => {

            if (select.value) {
                match.scorers.push({
                    team: match.away,
                    player: select.value
                });
            }
        });

    document.querySelectorAll(".homeAssist")
        .forEach(select => {

            if (select.value) {
                match.assists.push({
                    team: match.home,
                    player: select.value
                });
            }
        });

    document.querySelectorAll(".awayAssist")
        .forEach(select => {

            if (select.value) {
                match.assists.push({
                    team: match.away,
                    player: select.value
                });
            }
        });

    match.played = true;

    saveData(data);

    alert("Result saved");

    openPage("fixturesPage");
}

function getTeamSquadPlayers(team) {

    let data = loadData();

    let players = Array.isArray(data.players)
        ? data.players
        : [];

    let owner = players.find(
        player => player.name === team
    );

    if (!owner || !Array.isArray(owner.squad)) {
        return [];
    }

    return owner.squad;
}

function getGoalkeeper(team) {

    let squad = getTeamSquadPlayers(team);

    let goalkeeper = squad.find(
        player => player.position === "GK"
    );

    if (goalkeeper) {
        return goalkeeper.name;
    }

    return "No GK";
}