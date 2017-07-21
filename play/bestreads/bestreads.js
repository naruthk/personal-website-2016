/*
Naruth Kongurai
CSE 154
Section: AO
This is a JS file that is used to operate the management of books in the Bestreads website. It also 
connects and retrives either a JSON response or a plain text from a PHP file (server-side) that 
manages output of information based on whatever the Ajax call is sending a request for.
*/

(function() {
    
    "use strict";
    
    var $ = function(id) { return document.getElementById(id); };
    
    window.onload = function() {
        fetchBooksFrontPage();
        $("back").onclick = returnHomeBtn;
    };
    
    // Fetches all books by calling a server to receive a JSON data.
    function fetchBooksFrontPage() {
        var url = "bestreads.php?mode=books";
        var booksPromise = new AjaxGetPromise(url);
        booksPromise
            .then(JSON.parse)
            .then(appendBooks)
            .catch(function (errorMsg) { alert("fetch ERROR: " + errorMsg); });
    }
    
    // Appends information for each book like the cover image and title.
    function appendBooks(data) {
        var entries = data.books;
        for (var i = 0; i < entries.length; i++) {
            var div = document.createElement("div");
            var img = document.createElement("img");
            img.src = "books/" + entries[i].folder + "/cover.jpg";
            var title = document.createElement("p");
            title.innerHTML = entries[i].title;
            img.id = entries[i].folder;             // id attributes 
            title.id = entries[i].folder;
            div.id = entries[i].folder;
            div.onclick = fetchSingleBookData;      // onClick function
            div.appendChild(img);
            div.appendChild(title);
            $("allbooks").appendChild(div); 
        }
    }
    
    // Fetches data of the book that the user wants to see more information about. Connects to the
    // server (PHP file) that returns JSON data or plain text to get necessary information. Clicking
    // on the cover image or the title of a book takes you to a page where only the book's
    // information is visible while all other books are no longer shown.
    function fetchSingleBookData() {
        $("allbooks").classList.add("hidden");
        $("singlebook").classList.remove("hidden");
        
        var bookTitle = this.id;
        
        // Get Description
        var singleBookDescription = createNewAjaxGetPromise(bookTitle, "description");
        singleBookDescription
            .then(function (data) { 
                $("description").innerHTML = data;
            })
            .catch(function (errorMsg) { alert("single desc ERROR: " + errorMsg); });
 
        // Get Info
        var singleBookInfo = createNewAjaxGetPromise(bookTitle, "info");
        singleBookInfo
            .then(JSON.parse)
            .then(function (data) { 
                $("title").innerHTML = data.title;
                $("author").innerHTML = data.author;
                $("stars").innerHTML = data.stars;
            })
            .catch(function (errorMsg) { alert("single info ERROR: " + errorMsg); });
            
        // Get Reviews
        var singleBookReviews = createNewAjaxGetPromise(bookTitle, "reviews");
        singleBookReviews
            .then(JSON.parse)
            .then(appendReviews)
            .then(function () {
                $("cover").src = "books/" + bookTitle + "/cover.jpg";
            })
            .catch(function (errorMsg) { alert("single review ERROR: " + errorMsg); });
    }
    
    function createNewAjaxGetPromise(bookTitle, mode) {
        var url = "bestreads.php?title=" + bookTitle + "&mode=" + mode;
        return new AjaxGetPromise(url);
    }
    
    // Appends all reviews made for a particular book, including reviewers' names, scores, and texts
    function appendReviews(data) {
        for (var i = 0; i < data.length; i++) {
            var section = document.createElement("section");
            
            var h3 = document.createElement("h3");
            h3.innerHTML = data[i].name + " ";
            var span = document.createElement("span");
            span.innerHTML = data[i].score;
            h3.appendChild(span);
            
            var p = document.createElement("p");
            p.innerHTML = data[i].text;
            
            section.appendChild(h3);
            section.appendChild(p);
            $("reviews").appendChild(section);
        }
    }
    
    // Adds functionality to the home button so that when it is clicked, the page that lists all
    // books are shown. The page that is currently showing the single book view will disappear.
    function returnHomeBtn() {
        $("allbooks").classList.remove("hidden");
        $("singlebook").classList.add("hidden");
    }
    
})();