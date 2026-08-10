// awards.js

function calculateAwards(){

    let data = loadData();

    let goals = {};
    let assists = {};
    let mvp = {};
    let cleanSheets = {};

    let matches = getAllTournamentMatches(data);

    matches.forEach(match => {

        if(!isMatchPlayed(match)) return;

        // Goals
        if(Array.isArray(match.scorers)){

            match.scorers.forEach(item => {

                let label = normalizeLabel(item);
                if(!label) return;

                goals[label] = (goals[label] || 0) + 1;

            });

        }

        // Assists
        if(Array.isArray(match.assists)){

            match.assists.forEach(item => {

                let label = normalizeLabel(item);
                if(!label) return;

                assists[label] = (assists[label] || 0) + 1;

            });

        }

        // MOTM
        let motmLabel = normalizeLabel(match.mvp);

        if(motmLabel){

            mvp[motmLabel] = (mvp[motmLabel] || 0) + 1;

        }

        // Clean sheets
        let homeGK = getGoalkeeper(match.home);
        let awayGK = getGoalkeeper(match.away);

        if(Number(match.awayScore) === 0 && homeGK && homeGK !== "No GK"){

            cleanSheets[`${homeGK} (${match.home})`] =
                (cleanSheets[`${homeGK} (${match.home})`] || 0) + 1;

        }

        if(Number(match.homeScore) === 0 && awayGK && awayGK !== "No GK"){

            cleanSheets[`${awayGK} (${match.away})`] =
                (cleanSheets[`${awayGK} (${match.away})`] || 0) + 1;

        }

    });

    data.awards = {

        goldenBoot: getWinner(goals),
        topAssist: getWinner(assists),
        MVP: getWinner(mvp),
        goldenGlove: getWinner(cleanSheets),
        teamOfTournament: createTOTY(data, mvp, goals, assists, cleanSheets)

    };

    saveData(data);
    displayAwards();

}

function getAllTournamentMatches(data){

    let matches = [];

    if(Array.isArray(data.fixtures)){
        matches.push(...data.fixtures);
    }

    if(data.knockout){

        ["quarterFinals", "semiFinals", "final"].forEach(round => {

            if(Array.isArray(data.knockout[round])){
                matches.push(...data.knockout[round]);
            }

        });

    }

    return matches;

}

function isMatchPlayed(match){

    if(!match) return false;

    if(match.played === true) return true;

    let hasHome = match.homeScore !== null && match.homeScore !== undefined;
    let hasAway = match.awayScore !== null && match.awayScore !== undefined;

    return hasHome && hasAway;

}

function normalizeLabel(value){

    if(!value) return null;

    if(typeof value === "string"){

        let text = value.trim();
        return text || null;

    }

    if(typeof value === "object"){

        if(value.player && value.team){
            return `${value.player} (${value.team})`;
        }

        if(value.name && value.team){
            return `${value.name} (${value.team})`;
        }

        if(value.player){
            return value.player;
        }

        if(value.name){
            return value.name;
        }

    }

    return null;

}

function splitLabel(label){

    let text = normalizeLabel(label);

    if(!text) return { player:"", team:"" };

    let match = text.match(/^(.*)\s\((.*)\)$/);

    if(match){

        return {
            player: match[1].trim(),
            team: match[2].trim()
        };

    }

    return {
        player: text,
        team: ""
    };

}

function getPlayerMeta(data, label){

    let { player, team } = splitLabel(label);

    let players = Array.isArray(data.players) ? data.players : [];

    let owner = players.find(p => p.name === team);

    if(owner && Array.isArray(owner.squad)){

        let found = owner.squad.find(s => s.name === player);

        if(found){

            return {
                name: found.name,
                team: team,
                position: found.position || "",
                ovr: found.ovr || 0
            };

        }

    }

    for(let p of players){

        if(!Array.isArray(p.squad)) continue;

        let found = p.squad.find(s => s.name === player);

        if(found){

            return {
                name: found.name,
                team: p.name,
                position: found.position || "",
                ovr: found.ovr || 0
            };

        }

    }

    return {
        name: player || "Unknown",
        team: team || "",
        position: "",
        ovr: 0
    };

}

function getWinner(object){

    let winner = "None";
    let value = 0;

    Object.keys(object).forEach(player => {

        if(object[player] > value){

            value = object[player];
            winner = player;

        }

    });

    return {
        player: winner,
        value: value
    };

}

function createTOTY(data, mvp, goals, assists, cleanSheets){

    let scores = {};

    function addPoints(label, points){

        if(!label) return;

        let meta = getPlayerMeta(data, label);

        let key = `${meta.name} (${meta.team})`;

        if(!scores[key]){

            scores[key] = {
                name: meta.name,
                team: meta.team,
                position: meta.position || "",
                ovr: meta.ovr || 0,
                points: 0
            };

        }

        scores[key].points += points;

        if(meta.position && !scores[key].position){
            scores[key].position = meta.position;
        }

        if(meta.ovr && meta.ovr > scores[key].ovr){
            scores[key].ovr = meta.ovr;
        }

    }

    Object.keys(mvp).forEach(label => {
        addPoints(label, mvp[label] * 5);
    });

    Object.keys(goals).forEach(label => {
        addPoints(label, goals[label] * 3);
    });

    Object.keys(assists).forEach(label => {
        addPoints(label, assists[label] * 2);
    });

    Object.keys(cleanSheets).forEach(label => {
        addPoints(label, cleanSheets[label] * 4);
    });

    let allPlayers = Object.values(scores);

    let slots = [
        { slot:"GK",  pos:["GK"] },
        { slot:"LB",  pos:["LB"] },
        { slot:"CB1", pos:["CB"] },
        { slot:"CB2", pos:["CB"] },
        { slot:"RB",  pos:["RB"] },
        { slot:"CM1", pos:["CM","CDM"] },
        { slot:"CM2", pos:["CM","CDM"] },
        { slot:"CAM", pos:["CAM"] },
        { slot:"LW",  pos:["LW","LM"] },
        { slot:"ST",  pos:["ST"] },
        { slot:"RW",  pos:["RW","RM"] }
    ];

    let used = new Set();
    let squad = [];

    function isEligible(player, slot){
        return slot.pos.includes((player.position || "").toUpperCase());
    }

    function pickBestForSlot(slot){

        let candidates = allPlayers
            .filter(p => !used.has(`${p.name} (${p.team})`))
            .filter(p => isEligible(p, slot));

        candidates.sort((a,b) => {

            if(b.points !== a.points){
                return b.points - a.points;
            }

            if((b.ovr || 0) !== (a.ovr || 0)){
                return (b.ovr || 0) - (a.ovr || 0);
            }

            return a.name.localeCompare(b.name);

        });

        if(candidates.length){

            let pick = candidates[0];
            used.add(`${pick.name} (${pick.team})`);
            return pick;

        }

        return null;

    }

    slots.forEach(slot => {

        squad.push({
            slot: slot.slot,
            player: pickBestForSlot(slot)
        });

    });

    return squad;

}

function displayAwards(){

    let data = loadData();

    if(!data.awards){

        data.awards = {
            goldenBoot:{ player:"None", value:0 },
            topAssist:{ player:"None", value:0 },
            MVP:{ player:"None", value:0 },
            goldenGlove:{ player:"None", value:0 },
            teamOfTournament:[]
        };

        saveData(data);

    }

    let box = document.getElementById("awardsArea");
    if(!box) return;

    let awards = data.awards;

    box.innerHTML = `

<div class="award"><span>🥇 Golden Boot</span><span>${awards.goldenBoot.player} (${awards.goldenBoot.value})</span></div>

<div class="award"><span>🎯 Top Assist</span><span>${awards.topAssist.player} (${awards.topAssist.value})</span></div>

<div class="award"><span>⭐ MVP</span><span>${awards.MVP.player} (${awards.MVP.value})</span></div>

<div class="award"><span>🧤 Golden Glove</span><span>${awards.goldenGlove.player} (${awards.goldenGlove.value})</span></div>

<h3 style="margin-top:20px;">Team Of Tournament</h3>

${renderTOTTPitch(awards.teamOfTournament)}

`;

}

function renderTOTTPitch(team){

    let chosen = {};

    (team || []).forEach(item => {
        chosen[item.slot] = item.player;
    });

    function card(player){

        if(!player){

            return `
            <div style="
                width:78px;
                min-height:58px;
                border-radius:14px;
                background:rgba(255,255,255,0.12);
                color:#fff;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:12px;
                opacity:0.5;
            ">—</div>
            `;

        }

        return `
        <div style="
            width:78px;
            min-height:58px;
            border-radius:14px;
            background:rgba(255,255,255,0.14);
            border:1px solid rgba(255,255,255,0.18);
            color:#fff;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            text-align:center;
            padding:6px;
            font-size:11px;
        ">
            <div style="font-weight:700;">${player.name}</div>
            <div>${player.position || ""}</div>
            <div>${player.team || ""}</div>
        </div>
        `;

    }

    let pitch = `
    <div style="
        background:linear-gradient(180deg,#0f8f3e,#0b6d2d);
        border-radius:18px;
        padding:16px 10px;
        box-shadow:0 8px 24px rgba(0,0,0,0.15);
    ">

        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
            ${card(chosen.LW)}
            ${card(chosen.ST)}
            ${card(chosen.RW)}
        </div>

        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
            ${card(chosen.CAM)}
        </div>

        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
            ${card(chosen.CM1)}
            ${card(chosen.CM2)}
        </div>

        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
            ${card(chosen.LB)}
            ${card(chosen.CB1)}
            ${card(chosen.CB2)}
            ${card(chosen.RB)}
        </div>

        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
            ${card(chosen.GK)}
        </div>

    </div>
    `;

    let order = ["GK","LB","CB1","CB2","RB","CM1","CM2","CAM","LW","ST","RW"];

    let names = order.map(slot => {
        let p = chosen[slot];
        if(!p) return `<li>${slot}: —</li>`;
        return `<li>${slot}: ${p.name} (${p.position || ""}) - ${p.team || ""}</li>`;
    }).join("");

    return `
    ${pitch}
    <ol style="margin-top:14px;">
        ${names}
    </ol>
    `;

}