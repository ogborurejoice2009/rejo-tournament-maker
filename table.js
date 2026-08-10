function getPlayerInfo(playerName){

    let data = loadData();

    let players = Array.isArray(data.players)
        ? data.players
        : [];

    return players.find(player => {

        if(typeof player === "string"){
            return player === playerName;
        }

        return player.name === playerName;

    }) || null;

}



function getGroupTable(groupName){

    let data = loadData();

    if(!Array.isArray(data.groups)){
        return [];
    }

    let group = data.groups.find(
        g => g.name === groupName
    );

    if(!group){
        return [];
    }

    let table = [];

    group.players.forEach(player => {

        table.push({

            name: player,

            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,

            gf: 0,
            ga: 0,

            goalDifference: 0,

            points: 0

        });

    });


    let fixtures = Array.isArray(data.fixtures)
        ? data.fixtures
        : [];


    fixtures.forEach(match => {

        if(match.group !== groupName){
            return;
        }

        if(!match.played){
            return;
        }


        let home = table.find(
            t => t.name === match.home
        );

        let away = table.find(
            t => t.name === match.away
        );


        if(!home || !away){
            return;
        }


        home.played++;
        away.played++;


        home.gf += Number(match.homeScore || 0);
        home.ga += Number(match.awayScore || 0);

        away.gf += Number(match.awayScore || 0);
        away.ga += Number(match.homeScore || 0);


        if(match.homeScore > match.awayScore){

            home.wins++;
            away.losses++;

            home.points += 3;

        }

        else if(match.homeScore < match.awayScore){

            away.wins++;
            home.losses++;

            away.points += 3;

        }

        else{

            home.draws++;
            away.draws++;

            home.points++;
            away.points++;

        }

    });


    table.forEach(team => {

        team.goalDifference =
            team.gf - team.ga;

    });


    table.sort((a,b) => {

        if(b.points !== a.points){
            return b.points - a.points;
        }

        if(b.goalDifference !== a.goalDifference){
            return (
                b.goalDifference -
                a.goalDifference
            );
        }

        return b.gf - a.gf;

    });


    return table;

}



function showTable(){

    let data = loadData();

    let box =
        document.getElementById("tableArea");

    if(!box){
        return;
    }


    box.innerHTML = "";


    if(
        !Array.isArray(data.groups) ||
        data.groups.length === 0
    ){

        box.innerHTML =
            "<p>No groups created yet.</p>";

        return;

    }


    data.groups.forEach(group => {

        let table =
            getGroupTable(group.name);


        box.innerHTML += `

        <h2 style="
            margin-top:25px;
            margin-bottom:15px;
        ">
            ${group.name}
        </h2>


        <table
            class="rejoTable"
            style="
                width:100%;
                max-width:100%;
                table-layout:fixed;
                border-collapse:collapse;
                margin-bottom:25px;
                font-size:13px;
            "
        >

        <colgroup>

            <col style="width:34%;">

            <col style="width:8.25%;">
            <col style="width:8.25%;">
            <col style="width:8.25%;">
            <col style="width:8.25%;">
            <col style="width:8.25%;">
            <col style="width:8.25%;">
            <col style="width:8.25%;">
            <col style="width:8.25%;">

        </colgroup>


        <tr>

            <th style="
                padding:8px 3px;
                text-align:center;
                white-space:nowrap;
            ">
                Player
            </th>

            <th style="padding:8px 2px;">P</th>
            <th style="padding:8px 2px;">W</th>
            <th style="padding:8px 2px;">D</th>
            <th style="padding:8px 2px;">L</th>
            <th style="padding:8px 2px;">GF</th>
            <th style="padding:8px 2px;">GA</th>
            <th style="padding:8px 2px;">GD</th>
            <th style="padding:8px 2px;">PTS</th>

        </tr>


        ${
            table.map(team => {

                let player =
                    getPlayerInfo(team.name);

                let logo =
                    player && player.logo
                    ? player.logo
                    : "";


                return `

                <tr>

                    <td style="
                        padding:7px 3px;
                        overflow:hidden;
                    ">

                        <div style="
                            display:flex;
                            align-items:center;
                            gap:5px;
                            width:100%;
                            min-width:0;
                        ">

                            ${
                                logo
                                ?
                                `
                                <img
                                    src="${logo}"
                                    style="
                                        width:30px;
                                        height:30px;
                                        min-width:30px;
                                        object-fit:contain;
                                        border-radius:50%;
                                    "
                                >
                                `
                                :
                                `
                                <div style="
                                    width:30px;
                                    height:30px;
                                    min-width:30px;
                                "></div>
                                `
                            }


                            <span style="
                                font-size:13px;
                                font-weight:600;
                                white-space:nowrap;
                                overflow:hidden;
                                text-overflow:ellipsis;
                            ">
                                ${team.name}
                            </span>

                        </div>

                    </td>


                    <td style="
                        text-align:center;
                        padding:7px 1px;
                    ">
                        ${team.played}
                    </td>


                    <td style="
                        text-align:center;
                        padding:7px 1px;
                    ">
                        ${team.wins}
                    </td>


                    <td style="
                        text-align:center;
                        padding:7px 1px;
                    ">
                        ${team.draws}
                    </td>


                    <td style="
                        text-align:center;
                        padding:7px 1px;
                    ">
                        ${team.losses}
                    </td>


                    <td style="
                        text-align:center;
                        padding:7px 1px;
                    ">
                        ${team.gf}
                    </td>


                    <td style="
                        text-align:center;
                        padding:7px 1px;
                    ">
                        ${team.ga}
                    </td>


                    <td style="
                        text-align:center;
                        padding:7px 1px;
                    ">
                        ${team.goalDifference}
                    </td>


                    <td style="
                        text-align:center;
                        padding:7px 1px;
                        font-weight:bold;
                    ">
                        ${team.points}
                    </td>

                </tr>

                `;

            }).join("")
        }


        </table>

        `;

    });

}