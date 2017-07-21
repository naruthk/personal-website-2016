/*
Naruth Kongurai
CSE 154
Section: AO
This is a JS file that is used to operate the gameplay of the Pokedex Battle. It also connects
and retrives a JSON response from a server that manages the statistics in the game.
*/

(function() {
    
    "use strict";

    var $ = function(id) { return document.getElementById(id); };
    
    // Module-global variables
    var POKEMON_FOUND = ["Bulbasaur", "Charmander", "Squirtle"];
    var CURRENT_USER_POKEMON = "";
    var GUID = "";
    var PID = "";
    
    window.onload = function() {
        fetchPokemon();
    };
    
    // Fetches all available pokemons from a server and processes it by outputting to the Pokedex View
    function fetchPokemon() {
        var url = "https://webster.cs.washington.edu/pokedex/pokedex.php?pokedex=all";
        var iconsPromise = new AjaxGetPromise(url);
        iconsPromise
            .then(appendIcons)
            .catch(function (errorMsg) { alert("ERROR: " + errorMsg); });
    }
    
    // Appends the icon for each pokemon to the Pokedex View
    // @param iconsData - the text data file that contains a list of pokemon and its image source
    function appendIcons(iconsData) {
        var lines = iconsData.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var characterName = lines[i].substr(0, lines[i].indexOf(":"));
            var fileName = lines[i].substr(lines[i].indexOf(":") + 1);
            var icon = createIcon(characterName, fileName);
            $("pokedex-view").appendChild(icon);
        }
    }
    
    // Creates the specific icon for a pokemo. An icon becomes fully colored if that specific
    // pokemon has been found before.
    // @param characterName - the name of the pokemon
    // @param fileName - the source attribute of the image associated with the pokemon
    function createIcon(characterName, fileName) {
        var icon = document.createElement("img");
        icon.classList.add("sprite", "unfound");
        icon.id = characterName;
        icon.src = "sprites/" + fileName;
        icon.alt = characterName;
        for (var j = 0; j < POKEMON_FOUND.length; j++) {        // Remove black overlay on
            if (characterName === POKEMON_FOUND[j]) {           // pokemons that have been found
                icon.classList.remove("unfound");
                icon.onclick = initializeUserCard;
            }
        }
        return icon;
    }
    
    // Initializes the user's card view by connecting to the server to retrieve information about
    // the selected pokemon
    function initializeUserCard() {
        CURRENT_USER_POKEMON = this.id;
        var url = "https://webster.cs.washington.edu/pokedex/pokedex.php?pokemon=";
        var player1Promise = new AjaxGetPromise(url + this.id);
        player1Promise
            .then(JSON.parse)
            .then(fillUserCard)
            .catch(function (errorMsg) { alert("ERROR: " + errorMsg); });
    }
    
    // Fills the user card view with information about the pokemon. Enables the start button to
    // play the game.
    // @param data - that server's returned data containing information about the pokemon
    function fillUserCard(data) {
        populateCard("my-card", data);
        if (data["current-hp"] != 0) {
            $("start-btn").classList.remove("hidden");
            $("start-btn").onclick = initializeOpponentCard;
        }
    }
    
    // Initializes the opponent's card view by connecting to the server to retrieve information
    // about the retrieved pokemon. Configures to hide certain elements from being visible to the
    // user when the gameplay has begun.
    function initializeOpponentCard() {
        $("title").innerHTML = "Pokemon Battle Mode!";
        
        var messages = {};
        messages.startgame = "true";
        messages.mypokemon = CURRENT_USER_POKEMON.toLowerCase();
    
        var url = "https://webster.cs.washington.edu/pokedex/game.php";
        var p2 = new AjaxPostPromise(url, messages);
        p2
            .then(JSON.parse)
            .then(fillOpponentCard)
            .catch(function (errorMsg) { alert("opponentData ERROR: " + errorMsg); });
        
        $("pokedex-view").classList.add("hidden");  
        $("start-btn").classList.add("hidden");
        $("p1-turn-results").classList.add("hidden");
        $("p2-turn-results").classList.add("hidden");
        
        $("their-card").classList.remove("hidden");
        $("results-container").classList.remove("hidden");
        
        $("flee-btn").style.display = "block";
        $("flee-btn").onclick = performFlee;
    }
    
    // Fills the opponent card view with information about the pokemon. Notice that calling this
    // function also makes visible the HP information of the user's card.
    // @param data - that server's returned data containing information about the pokemon
    function fillOpponentCard(data) {
        GUID = data.guid;        // stores the user's GUID
        PID = data.pid;          // and stores the user's PID
        populateCard("my-card", data.p1);
        populateCard("their-card", data.p2);
        $("my-card").getElementsByClassName("hp-info")[0].classList.remove("hidden");
    }

    // Populate the given card (either the user or the opposition) with related data
    // @param divID - the name of the HTML div element's ID
    // @param pokemonData - that server's returned data containing information about the pokemon
    // @param isPlaying - the current state of the game
    function populateCard(divID, pokemonData) {
        if (pokemonData.name && pokemonData.images.photo && pokemonData.images.typeIcon && 
                pokemonData.images.weaknessIcon && pokemonData.info.description) {
            $(divID).getElementsByClassName("name")[0].innerHTML = pokemonData.name;
            $(divID).getElementsByClassName("pokepic")[0].src = pokemonData.images.photo;
            $(divID).getElementsByClassName("type")[0].src = pokemonData.images.typeIcon;
            $(divID).getElementsByClassName("weakness")[0].src = pokemonData.images.weaknessIcon;
            $(divID).getElementsByClassName("info")[0].innerHTML = pokemonData.info.description;
        }
        buildHP(divID, pokemonData);
        buildMoves(divID, pokemonData);
        buildBuffs(divID, pokemonData);
    }
    
    // Builds information about the current HP level of a pokemon. If current pokemon's HP is 0,
    // then that means the game is ended and one side has won.
    // @param divID - the name of the HTML div element's ID
    // @param pokemonData - that server's returned data containing information about the pokemon
    // @param isPlaying - the current state of the game
    function buildHP(divID, pokemonData) {
        var hp = $(divID).getElementsByClassName("hp")[0];
        var healthbarDiv = $(divID).getElementsByClassName("health-bar")[0];
        if (pokemonData.hp) {
            hp.innerHTML = pokemonData.hp + "HP";
        }
        // Calculate remaining HP. If below 20, then switch to "low-health"
        if (pokemonData["current-hp"]) {
            hp.innerHTML = pokemonData["current-hp"] + "HP";
            var remainingHP = pokemonData["current-hp"] / pokemonData.hp;
            healthbarDiv.style.width = (100 * remainingHP) + "%";
            if (remainingHP < 0.20) {
                healthbarDiv.classList.add("low-health");
            } else {
                healthbarDiv.classList.remove("low-health");
            }
        }
        // Game is either won or lost when remaining HP is 0
        if (pokemonData["current-hp"] == 0) {
            $(divID).getElementsByClassName("buffs")[0].innerHTML = "";
            healthbarDiv.style.width = 0;
            healthbarDiv.classList.add("low-health");
            hp.innerHTML = pokemonData["current-hp"] + "HP";
            if (divID == "my-card") {
                $("title").innerHTML = "You lost!";
            } else if (divID == "their-card") {
                $("title").innerHTML = "You won!";
                POKEMON_FOUND.push(pokemonData.name);
            }
            $("p2-turn-results").classList.add("hidden");
            $("endgame").classList.remove("hidden");
            $("endgame").onclick = refreshPage;
        }
    }
    
    // Builds information about the abilities (moves) of a pokemon
    // @param divID - the name of the HTML div element's ID
    // @param pokemonData - that server's returned data containing information about the pokemon
    // @param isPlaying - the current state of the game
    function buildMoves(divID, pokemonData) {
        if (pokemonData.moves) {
            var movesDiv = $(divID).getElementsByTagName("button");
            var moves = pokemonData.moves;
            for (var i = 0; i < moves.length; i++) {
                var moveName = movesDiv[i].getElementsByClassName("move")[0];
                moveName.innerHTML = moves[i].name;
                var moveType = movesDiv[i].getElementsByTagName("img")[0];
                moveType.src = "icons/" + moves[i].type + ".jpg";
                if (moves[i].dp) {
                    var dp = movesDiv[i].getElementsByClassName("dp")[0];
                    dp.innerHTML = moves[i].dp + " DP";
                }
                movesDiv[i].id = moves[i].name.toLowerCase().replace(/\s/g, "");
                movesDiv[i].onclick = playMove;
            }
            // Hide any remaining buttons that contain no moves
            for (var j = moves.length; j < movesDiv.length; j++) {
                movesDiv[j].classList.add("hidden");
            }
        }
    }

    // Builds information about buffs and debuffs of a pokemon's moves
    // @param divID - the name of the HTML div element's ID
    // @param pokemonData - that server's returned data containing information about the pokemon
    // @param isPlaying - the current state of the game
    function buildBuffs(divID, pokemonData) {
        var buffsDiv = $(divID).getElementsByClassName("buffs")[0];
        if (pokemonData.buffs) {
            createBuffsDebuffsElemeents(buffsDiv, pokemonData.buffs, "buff");
        }
        if (pokemonData.debuffs) {
            createBuffsDebuffsElemeents(buffsDiv, pokemonData.debuffs, "debuff");
        }
        buffsDiv.classList.remove("hidden");
    }
    
    // Builds information about the current HP level of a pokemon
    // @param div - the name of the HTML div element's ID
    // @param data - that server's returned data containing information about the pokemon
    // @param type - must be either "buff" or "debuff"
    function createBuffsDebuffsElemeents(div, data, type) {
        for (var i = 0; i < data.length; i++) {
            var element = document.createElement("div");
            element.classList.add(data[i], type);
            div.appendChild(element);
        }
    }
    
    // Plays a move as selected by the user. Configures state of the controls accordingly.
    function playMove() {
        $("loading").classList.remove("hidden");
        $("p1-turn-results").classList.add("hidden");
        $("p2-turn-results").classList.add("hidden");
        $("my-card").getElementsByClassName("buffs")[0].innerHTML = "";
        $("their-card").getElementsByClassName("buffs")[0].innerHTML = "";
        var messages = {};
        messages.guid = GUID;
        messages.pid = PID;
        messages.move = this.id;

        var url = "https://webster.cs.washington.edu/pokedex/game.php";
        var makeMovePromise = new AjaxPostPromise(url, messages);
        makeMovePromise
            .then(JSON.parse)
            .then(updateBothCards)
            .then(function (response) { $("loading").classList.add("hidden"); })
            .catch(function (errorMsg) { alert("playMove ERROR: " + errorMsg); });
    }
    
    // Updates the gameplay data for both the user and the opposition. Outputs the data to the
    // results container in the middle of the page
    // @param data - that server's returned data containing information about the pokemon
    function updateBothCards(data) {
        outputTurnResults(data);
        populateCard("my-card", data.p1);
        populateCard("their-card", data.p2);
    }
    
    // Outputs the game results to the screen. Projects the result to the results container
    // in the middle of the pages
    // @param pokemonData - that server's returned data containing information about the pokemon
    function outputTurnResults(data) {
        var p1 = "Player 1 played " + data.results["p1-move"] + " and " + 
                data.results["p1-result"] + "!";
        var p2 = "Player 2 played " + data.results["p2-move"] + " and " + 
                data.results["p2-result"] + "!";
                
        $("p1-turn-results").classList.remove("hidden");
        $("p2-turn-results").classList.remove("hidden");
        $("loading").classList.add("hidden");
        $("p1-turn-results").innerHTML = p1;
        $("p2-turn-results").innerHTML = p2;
    }
    
    // Performs the flee operation whereb the user loses the game instantly.
    function performFlee() {
        $("loading").classList.add("hidden");
        $("endgame").classList.add("hidden");
        var messages = {};
        messages.move = "flee";
        messages.guid = GUID;
        messages.pid = PID;
    
        var url = "https://webster.cs.washington.edu/pokedex/game.php";
        var opponentDataPromise = new AjaxPostPromise(url, messages);
        opponentDataPromise
            .then(JSON.parse)
            .then(fleeOperation)
            .catch(function (errorMsg) { alert("flee ERROR: " + errorMsg); });
    }
    
    // Helper method to instantiate updates after the flee operation has been selected
    // @param data - that server's returned data containing information about the pokemon
    function fleeOperation(data) {
        $("p2-turn-results").classList.add("hidden");
        fillUserCard(data.p1);
    }
    
    // "Fake" refresh the page to revert visibilities back to default, meaning the Pokedex View
    // is visible again, and all other non-default elements are hidden.
    function refreshPage() {
        fetchPokemon();
        $("title").innerHTML = "Your Pokedex";
        $("pokedex-view").innerHTML = "";
        
        $("my-card").getElementsByClassName("hp-info")[0].classList.add("hidden");
        $("my-card").getElementsByClassName("buffs")[0].classList.add("hidden");
        $("their-card").getElementsByClassName("buffs")[0].classList.add("hidden");
        $("their-card").classList.add("hidden");
        $("results-container").classList.add("hidden");
        $("endgame").classList.add("hidden");
        $("flee-btn").style.display = "none";
        $("pokedex-view").classList.remove("hidden");
        $("start-btn").classList.remove("hidden");
    }
    
})();