// knockout.js

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

function createKnockout() {

    let data = loadData();

    if (!data.groups || data.groups.length === 0) {
        alert("Create groups first");
        return;
    }

    let qualified = [];

    data.groups.forEach(group => {

        let table = getGroupTable(group.name);

        if (table && table.length >= 2) {
            qualified.push(table[0].name);
            qualified.push(table[1].name);
        }
    });

    if (qualified.length < 8) {
        alert("Need 8 qualified teams to create knockout");
        return;
    }

    data.knockout = {
        quarterFinals: [
            createMatch(qualified[0], qualified[7]),
            createMatch(qualified[3], qualified[4]),
            createMatch(qualified[1], qualified[6]),
            createMatch(qualified[2], qualified[5])
        ],
        semiFinals: [],
        final: [],
        champion: null
    };

    saveData(data);
    showKnockout();
}

function createMatch(home, away) {

    return {
        home: home,
        away: away,
        homeScore: null,
        awayScore: null,
        winner: null,
        scorers: [],
        assists: [],
        mvp: ""
    };
}

function enterKnockoutScore(round, index) {

    let data = loadData();

    if (!data.knockout || !data.knockout[round] || !data.knockout[round][index]) {
        alert("Match not found");
        return;
    }

    let match = data.knockout[round][index];

    let homePlayers = getTeamSquadPlayers(match.home);
    let awayPlayers = getTeamSquadPlayers(match.away);

    let box = document.getElementById("knockoutArea");

    if (!box) {
        return;
    }

    box.innerHTML = `

<div class="fixture">

<h2>
    ${renderPlayerBadge(match.home)} VS ${renderPlayerBadge(match.away)}
</h2>

<h3>Score</h3>

<input 
id="homeScore"
type="number"
min="0"
value="${match.homeScore ?? 0}"
onchange="loadKnockoutInputs('${round}',${index})">

-

<input 
id="awayScore"
type="number"
min="0"
value="${match.awayScore ?? 0}"
onchange="loadKnockoutInputs('${round}',${index})">

<div id="knockoutInputs"></div>

<h3>⭐ Man Of The Match</h3>

<select id="knockoutMvp">
    <option value="">Select Player</option>

    ${homePlayers.map(p => `
        <option value="${p.name}" ${match.mvp === p.name ? "selected" : ""}>
            ${p.name} (${match.home})
        </option>
    `).join("")}

    ${awayPlayers.map(p => `
        <option value="${p.name}" ${match.mvp === p.name ? "selected" : ""}>
            ${p.name} (${match.away})
        </option>
    `).join("")}
</select>

<br><br>

<button onclick="saveKnockoutResult('${round}',${index})">
Save Result
</button>

</div>

`;

    loadKnockoutInputs(round, index);
}

function loadKnockoutInputs(round, index) {

    let data = loadData();

    if (!data.knockout || !data.knockout[round] || !data.knockout[round][index]) {
        return;
    }

    let match = data.knockout[round][index];

    let homeScore = Number(
        document.getElementById("homeScore").value || 0
    );

    let awayScore = Number(
        document.getElementById("awayScore").value || 0
    );

    let homePlayers = getTeamSquadPlayers(match.home);
    let awayPlayers = getTeamSquadPlayers(match.away);

    let box = document.getElementById("knockoutInputs");

    if (!box) return;

    box.innerHTML = `

<h3>
    ${match.home} Goalscorers
    (Max ${homeScore})
</h3>

${createPlayerSelects(
    homePlayers,
    "knockoutHomeScorer",
    homeScore
)}

<h3>
    ${match.away} Goalscorers
    (Max ${awayScore})
</h3>

${createPlayerSelects(
    awayPlayers,
    "knockoutAwayScorer",
    awayScore
)}

<h3>
    ${match.home} Assists
    (Max ${homeScore})
</h3>

${createPlayerSelects(
    homePlayers,
    "knockoutHomeAssist",
    homeScore
)}

<h3>
    ${match.away} Assists
    (Max ${awayScore})
</h3>

${createPlayerSelects(
    awayPlayers,
    "knockoutAwayAssist",
    awayScore
)}

`;
}

function saveKnockoutResult(round, index) {

    let data = loadData();

    if (!data.knockout || !data.knockout[round] || !data.knockout[round][index]) {
        alert("Match not found");
        return;
    }

    let match = data.knockout[round][index];

    let homeScore = Number(
        document.getElementById("homeScore").value || 0
    );

    let awayScore = Number(
        document.getElementById("awayScore").value || 0
    );

    let scorers = [
        ...document.querySelectorAll(".knockoutHomeScorer"),
        ...document.querySelectorAll(".knockoutAwayScorer")
    ].filter(x => x.value);

    let assists = [
        ...document.querySelectorAll(".knockoutHomeAssist"),
        ...document.querySelectorAll(".knockoutAwayAssist")
    ].filter(x => x.value);

    let totalGoals = homeScore + awayScore;

    if (scorers.length > totalGoals) {
        alert("Goalscorers cannot exceed goals scored");
        return;
    }

    if (assists.length > totalGoals) {
        alert("Assists cannot exceed goals scored");
        return;
    }

    match.homeScore = homeScore;
    match.awayScore = awayScore;

    match.scorers = [];

    document.querySelectorAll(".knockoutHomeScorer")
        .forEach(player => {
            if (player.value) {
                match.scorers.push({
                    player: player.value,
                    team: match.home
                });
            }
        });

    document.querySelectorAll(".knockoutAwayScorer")
        .forEach(player => {
            if (player.value) {
                match.scorers.push({
                    player: player.value,
                    team: match.away
                });
            }
        });

    match.assists = [];

    document.querySelectorAll(".knockoutHomeAssist")
        .forEach(player => {
            if (player.value) {
                match.assists.push({
                    player: player.value,
                    team: match.home
                });
            }
        });

    document.querySelectorAll(".knockoutAwayAssist")
        .forEach(player => {
            if (player.value) {
                match.assists.push({
                    player: player.value,
                    team: match.away
                });
            }
        });

    match.mvp = document.getElementById("knockoutMvp").value || "";

    if (homeScore > awayScore) {
        match.winner = match.home;
    }
    else if (awayScore > homeScore) {
        match.winner = match.away;
    }
    else {
        let penWinner = prompt("Draw! Enter penalty winner");
        match.winner = penWinner ? penWinner.trim() : "";
    }

    saveData(data);

    progressKnockout();

    refreshApp();
}

function progressKnockout() {

    let data = loadData();

    if (!data.knockout) {
        return;
    }

    let k = data.knockout;

    if (
        k.quarterFinals &&
        k.quarterFinals.length === 4 &&
        k.quarterFinals.every(match => match.winner) &&
        k.semiFinals.length === 0
    ) {
        k.semiFinals = [
            createMatch(k.quarterFinals[0].winner, k.quarterFinals[1].winner),
            createMatch(k.quarterFinals[2].winner, k.quarterFinals[3].winner)
        ];
    }

    if (
        k.semiFinals &&
        k.semiFinals.length === 2 &&
        k.semiFinals.every(match => match.winner) &&
        k.final.length === 0
    ) {
        k.final = [
            createMatch(k.semiFinals[0].winner, k.semiFinals[1].winner)
        ];
    }

    if (
        k.final &&
        k.final.length === 1 &&
        k.final[0].winner
    ) {
        k.champion = k.final[0].winner;
    }

    saveData(data);
    showKnockout();
}

function matchCard(match, round, index) {

    if (!match) {
        return "";
    }

    return `

<div class="matchBox">

<div>
    <b>${renderPlayerBadge(match.home)}</b>
</div>

<div style="margin:5px">
${
    match.homeScore !== null
    ? `${match.homeScore} - ${match.awayScore}`
    : "VS"
}
</div>

<div>
    <b>${renderPlayerBadge(match.away)}</b>
</div>

${
    match.winner
    ? `<small>🏆 ${renderPlayerBadge(match.winner)}</small>`
    : `
<button onclick="enterKnockoutScore('${round}',${index})">
Result
</button>
`
}

</div>

`;
}

function showKnockout() {

    let data = loadData();

    let k = data.knockout;

    let box = document.getElementById("knockoutArea");

    if (!box) {
        return;
    }

    if (!k || !k.quarterFinals) {
        box.innerHTML = "<p>No knockout stage yet.</p>";
        return;
    }

    box.innerHTML = `

<h2 style="text-align:center">
    🏆 Knockout Stage
</h2>

<div class="uclBracket">

<div class="leftQF">
    ${matchCard(k.quarterFinals[0], "quarterFinals", 0)}
    ${matchCard(k.quarterFinals[1], "quarterFinals", 1)}
</div>

<div class="leftSF">
    ${
        k.semiFinals[0]
        ? matchCard(k.semiFinals[0], "semiFinals", 0)
        : ""
    }
</div>

<div class="finalCenter">
    ${
        k.final[0]
        ? matchCard(k.final[0], "final", 0)
        : ""
    }

    ${
        k.champion
        ? `
        <h2>
            🏆 Champion
            <br>
            ${renderPlayerBadge(k.champion)}
        </h2>
        `
        : ""
    }
</div>

<div class="rightSF">
    ${
        k.semiFinals[1]
        ? matchCard(k.semiFinals[1], "semiFinals", 1)
        : ""
    }
</div>

<div class="rightQF">
    ${matchCard(k.quarterFinals[2], "quarterFinals", 2)}
    ${matchCard(k.quarterFinals[3], "quarterFinals", 3)}
</div>

</div>

`;
}