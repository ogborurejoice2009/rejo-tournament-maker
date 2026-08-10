// squads.js


let selectedSquadOwner = null;
let selectedSlot = null;



const formations = {


"4-3-3 Attack":[

{slot:"ST",pos:"ST",x:50,y:10},

{slot:"LW",pos:"LW",x:20,y:25},
{slot:"RW",pos:"RW",x:80,y:25},

{slot:"CAM",pos:"CAM",x:50,y:38},

{slot:"CM1",pos:"CM",x:35,y:52},
{slot:"CM2",pos:"CM",x:65,y:52},

{slot:"LB",pos:"LB",x:15,y:72},
{slot:"CB1",pos:"CB",x:40,y:72},
{slot:"CB2",pos:"CB",x:60,y:72},
{slot:"RB",pos:"RB",x:85,y:72},

{slot:"GK",pos:"GK",x:50,y:92}

],



"4-2-3-1":[

{slot:"ST",pos:"ST",x:50,y:10},

{slot:"LW",pos:"LW",x:20,y:30},
{slot:"CAM",pos:"CAM",x:50,y:32},
{slot:"RW",pos:"RW",x:80,y:30},

{slot:"CDM1",pos:"CDM",x:40,y:52},
{slot:"CDM2",pos:"CDM",x:60,y:52},

{slot:"LB",pos:"LB",x:15,y:72},
{slot:"CB1",pos:"CB",x:40,y:72},
{slot:"CB2",pos:"CB",x:60,y:72},
{slot:"RB",pos:"RB",x:85,y:72},

{slot:"GK",pos:"GK",x:50,y:92}

],



"4-4-2":[

{slot:"ST1",pos:"ST",x:35,y:10},
{slot:"ST2",pos:"ST",x:65,y:10},

{slot:"LM",pos:"LM",x:15,y:40},
{slot:"CM1",pos:"CM",x:40,y:48},
{slot:"CM2",pos:"CM",x:60,y:48},
{slot:"RM",pos:"RM",x:85,y:40},

{slot:"LB",pos:"LB",x:15,y:72},
{slot:"CB1",pos:"CB",x:40,y:72},
{slot:"CB2",pos:"CB",x:60,y:72},
{slot:"RB",pos:"RB",x:85,y:72},

{slot:"GK",pos:"GK",x:50,y:92}

],



"3-5-2":[

{slot:"ST1",pos:"ST",x:35,y:10},
{slot:"ST2",pos:"ST",x:65,y:10},

{slot:"CAM",pos:"CAM",x:50,y:30},

{slot:"LM",pos:"LM",x:15,y:45},
{slot:"CM1",pos:"CM",x:40,y:50},
{slot:"CM2",pos:"CM",x:60,y:50},
{slot:"RM",pos:"RM",x:85,y:45},

{slot:"CB1",pos:"CB",x:30,y:72},
{slot:"CB2",pos:"CB",x:50,y:72},
{slot:"CB3",pos:"CB",x:70,y:72},

{slot:"GK",pos:"GK",x:50,y:92}

]


};
function showAllSquads(){


let data=loadData();

let box=document.getElementById("squadArea");


box.innerHTML="";


data.players.forEach(player=>{


box.innerHTML+=`

<button onclick="openSquadBuilder('${player.name}')">

${player.name}

</button>

<br><br>

`;


});


}








function openSquadBuilder(name){


selectedSquadOwner=name;


let box=document.getElementById("squadArea");


box.innerHTML=`

<h2>${name}'s Squad</h2>


<select onchange="loadFormation(this.value)">

<option value="">Select Formation</option>


${Object.keys(formations).map(form=>`

<option value="${form}">
${form}
</option>

`).join("")}


</select>



<div id="pitch"></div>


<div id="playerChoices"></div>


`;



}








function loadFormation(formation){


let pitch=document.getElementById("pitch");


pitch.innerHTML="";



formations[formation].forEach(slot=>{


pitch.innerHTML+=`

<div class="playerSlot"

data-slot="${slot.slot}"

style="
left:${slot.x}%;
top:${slot.y}%;
"

onclick="chooseSlot('${slot.slot}','${slot.pos}')">


${slot.slot}


</div>


`;



renderSavedSquad();



}







function chooseSlot(slot,position){


selectedSlot=slot;


let box=document.getElementById("playerChoices");



let players=getPlayersByPosition(position);



box.innerHTML=`


<h3>Select ${slot}</h3>



${
players.map(player=>`


<button onclick="assignPlayerToSlot('${player.name}','${player.position}',${player.ovr})">


${player.name}

(${player.ovr})


</button>


<br><br>


`).join("")
}



`;



}
function assignPlayerToSlot(name,position,ovr){


let data=loadData();


let owner=data.players.find(player=>

player.name===selectedSquadOwner

);



if(!owner.squad){

owner.squad=[];

}



// remove only this exact slot

owner.squad = owner.squad.filter(player=>

player.slot !== selectedSlot

);




// add new player

owner.squad.push({

slot:selectedSlot,

name:name,

position:position,

ovr:ovr

});




saveData(data);
refreshApp();



renderSavedSquad();



}









function renderSavedSquad(){


let data=loadData();


let owner=data.players.find(player=>

player.name===selectedSquadOwner

);



if(!owner || !owner.squad)

return;



let slots=document.querySelectorAll(".playerSlot");



slots.forEach(slot=>{


let slotName=slot.dataset.slot;



let player=owner.squad.find(p=>

p.slot===slotName

);



if(player){


slot.innerHTML=`

<b>${player.name}</b>

<br>

${player.ovr}


`;



}



});



}









function getPlayersByPosition(position){


let result=[];



fcplayers.forEach(player=>{


if(player.position===position){

result.push(player);

}


});



return result;


}








function getSquadNames(team){


let data=loadData();


let player=data.players.find(p=>

p.name===team

);



if(!player || !player.squad)

return [];



return player.squad.map(p=>p.name);


}