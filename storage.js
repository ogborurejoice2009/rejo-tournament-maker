// storage.js


const STORAGE_KEY = "rejoTournament";





function initializeData(){


    let data = localStorage.getItem(
        STORAGE_KEY
    );



    if(!data){


        let newData={


            players:[],


            groups:[],


            fixtures:[],


            results:[],


            knockout:{


                quarterFinals:[],


                semiFinals:[],


                final:[],


                champion:null


            },



            awards:{


                topScorer:{},

                topAssister:{},

                goldenGlove:{},

                MVP:{},

                teamOfTournament:[]

            },



            settings:{


                tournamentName:
                "REJO Gamer Tournament",


                maxPlayers:12


            }



        };



        saveData(newData);


    }



}








function loadData(){


    let data = localStorage.getItem(
        STORAGE_KEY
    );



    if(!data){


        initializeData();


        data=localStorage.getItem(
            STORAGE_KEY
        );


    }



    return JSON.parse(data);



}








function saveData(data){


    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(data)

    );


}








function clearData(){


    localStorage.removeItem(
        STORAGE_KEY
    );


}