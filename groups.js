// groups.js

let draggedPlayer = null;

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

function showGroupOptions() {

    let data = loadData();
    let players = Array.isArray(data.players) ? data.players : [];

    let box = document.getElementById("groupOptions");
    if (!box) return;

    if (players.length < 2) {
        box.style.display = "flex";
        box.innerHTML = `
            <div class="panel">
                <p>Add players first.</p>
                <button type="button" onclick="closeGroupOptions()">Close</button>
            </div>
        `;
        return;
    }

    let options = [];

    for (let i = 2; i <= players.length; i++) {
        if (players.length % i === 0) {
            options.push(i);
        }
    }

    if (options.length === 0) {
        box.style.display = "flex";
        box.innerHTML = `
            <div class="panel">
                <p>No valid group setup.</p>
                <button type="button" onclick="closeGroupOptions()">Close</button>
            </div>
        `;
        return;
    }

    box.style.display = "flex";
    box.innerHTML = `
        <div class="panel">
            <h3>Select Number Of Groups</h3>
            ${
                options.map(num => `
                    <button type="button" onclick="createGroups(${num})">
                        ${num} Groups (${players.length / num} players each)
                    </button>
                `).join("")
            }
            <button type="button" onclick="closeGroupOptions()">Close</button>
        </div>
    `;
}

function closeGroupOptions() {

    let box = document.getElementById("groupOptions");
    if (box) {
        box.style.display = "none";
        box.innerHTML = "";
    }
}

function createGroups(numberOfGroups) {

    let data = loadData();
    let players = Array.isArray(data.players) ? [...data.players] : [];

    if (players.length === 0) {
        alert("Add players first");
        return;
    }

    players.sort(() => Math.random() - 0.5);

    let groups = [];

    for (let i = 0; i < numberOfGroups; i++) {
        groups.push({
            name: "Group " + String.fromCharCode(65 + i),
            players: []
        });
    }

    players.forEach((player, index) => {

        let name = typeof player === "string"
            ? player
            : (player.name || "Unknown");

        groups[index % numberOfGroups].players.push(name);
    });

    data.groups = groups;

    saveData(data);

    closeGroupOptions();
    openPage("groupsPage");
}

function showGroups() {

    let data = loadData();
    let box = document.getElementById("groups");

    if (!box) return;

    let groups = Array.isArray(data.groups)
        ? data.groups
        : [];

    if (groups.length === 0) {
        box.innerHTML = "<p>No groups created yet.</p>";
        return;
    }

    box.innerHTML = "";

    groups.forEach((group, gIndex) => {

        let players = Array.isArray(group.players)
            ? group.players
            : [];

        box.innerHTML += `
        <div class="group">
            <h3>${group.name}</h3>
            ${
                players.map((player, pIndex) => `
                    <p
                        draggable="true"
                        ondragstart="dragPlayer(${gIndex},${pIndex})"
                        ondrop="dropPlayer(${gIndex},${pIndex})"
                        ondragover="event.preventDefault()"
                    >
                        ${renderPlayerBadge(player)}
                    </p>
                `).join("")
            }
        </div>
        `;
    });
}

function dragPlayer(groupIndex, playerIndex) {
    draggedPlayer = {
        group: groupIndex,
        player: playerIndex
    };
}

function dropPlayer(groupIndex, playerIndex) {

    if (!draggedPlayer) return;

    let data = loadData();

    if (!Array.isArray(data.groups)) {
        return;
    }

    let from = data.groups[draggedPlayer.group];
    let to = data.groups[groupIndex];

    if (!from || !to) {
        return;
    }

    let fromPlayers = Array.isArray(from.players) ? from.players : [];
    let toPlayers = Array.isArray(to.players) ? to.players : [];

    if (
        draggedPlayer.player < 0 ||
        draggedPlayer.player >= fromPlayers.length ||
        playerIndex < 0 ||
        playerIndex >= toPlayers.length
    ) {
        return;
    }

    let temp = fromPlayers[draggedPlayer.player];
    fromPlayers[draggedPlayer.player] = toPlayers[playerIndex];
    toPlayers[playerIndex] = temp;

    from.players = fromPlayers;
    to.players = toPlayers;

    saveData(data);

    draggedPlayer = null;

    showGroups();
}