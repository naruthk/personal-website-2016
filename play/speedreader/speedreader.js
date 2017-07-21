/*
Naruth Kongurai
CSE 154
Section: AO
This is a JS file that is used to operate the basic controls of the webpage according to the
settings that the user has selected or chosen on the page.
*/

(function() {
    
    "use strict";

    // Shortcut function to reduce redundent element calling
    var $ = function(id) {
        return document.getElementById(id);
    };
    
    // Represents the current index in the array of words in the list
    var counter = 0;
    
    // Keeps track of the time (in milliseconds) that the system sets itself to be
    var timer = null;
    
    // Stores all the words from the user input (without punctuations, spaces, etc.)
    var wordsList = [];
    
    window.onload = function() {
        disableBtn($("stop"), true);  // by default the stop button is disabled
        
        $("start").onclick = start; 
        $("stop").onclick = stop;
        
        $("speed").onchange = changeSpeed;
        
        // settings for font changes
        $("rad-medium").onclick = changeSize;
        $("rad-big").onclick = changeSize;
        $("rad-bigger").onclick = changeSize;
    };
    
    // The Start function will process the texts that the user has entered and display
    // it to the output panel. Launching the Start function will enable the Stop button 
    // while the input area that the user can provide text input will be disabled.
    function start() {
        // Disables the text area (place where the user provides input)
        $("txtarea_input").disabled = true;
        
        // Enables the Stop button & disables the Start button
        disableBtn($("stop"), false);
        disableBtn($("start"), true);
         
        // Processes user input
        wordsList = processInput($("txtarea_input").value);
        
        // Sets the timer (frame speed)
        var speed = changeSpeed(); // let the timer tick once
        timer = setInterval(readWordFramePerFrame, speed);
    }
    
    // Stops the reading process and resets all cache value of the timer.
    // The Start button will be enabled and the input area that the user can provide text input
    // will also be enabled.
    function stop() {
        // Enables the Start button but disables the Stop button
        disableBtn($("start"), false);
        disableBtn($("stop"), true);
        
        // Disables the text area (place where the user provides input)
        $("txtarea_input").disabled = false;
        
        outputDisplay(false);
        
        // Reset the timer and the current position of the word in the list to 0 
        clearInterval(timer);
        timer = null;
        counter = 0;
    }
    
    // Adjusts the current speed and also returning the new value
    function changeSpeed() {
        var speed = parseInt($("speed").value);
        // If timer is still being run, reset cache value and update speed
        if (timer) {
            clearInterval(timer);
            timer = null;
            timer = setInterval(readWordFramePerFrame, speed);
        }
        return speed;
    }
    
    // Adjusts the current font size to a new value
    function changeSize(size) {
        $("output").className = this.id; 
    }
    
    // Reads a single word and sends to the output panel. The function will end when there is no 
    // more from the list of words to be display.
    function readWordFramePerFrame() {
        outputDisplay(true);
        
        counter++; // Increases index position in the list of words
        if (counter > wordsList.length) {
            counter = 0;
            stop();
        }
    }
    
    // A function that strips away any puctuation marks from this list:
    //      ,   .   !   ?   ;   :
    // , and then returns the final list of words without ending punctations
    // Assumes that the input is not null or empty.
    function processInput(input) {
        var result = input.split(/[ \t\n]+/);
        var finalList = [];
        for (var i = 0; i < result.length; i++) {
            var currentWord = result[i];
            if (currentWord.endsWith(",") || currentWord.endsWith(".") || currentWord.endsWith("!") || 
                currentWord.endsWith("?") || currentWord.endsWith(";") || currentWord.endsWith(":")) {
                var newWord = currentWord.replace(/[,.!?;:/]/, "");
                finalList.push(newWord);
                finalList.push(newWord);
            } else {
                finalList.push(currentWord);
            }
        }
        return finalList;
    }
    
    // Outputs a word to the output panel where the user can see
    function outputDisplay(boolean) {
        var outputPanel = document.getElementById("output");
        if (boolean) {
            outputPanel.innerHTML = wordsList[counter];
        } else {
            outputPanel.innerHTML = "";    
        }
    }

    // Disables or enables a specific button
    function disableBtn(button, boolean) {
        button.disabled = boolean;
        if (boolean) {
            button.className = "disabled";
        } else {
            button.classList.remove("disabled");
        }
    }

})();