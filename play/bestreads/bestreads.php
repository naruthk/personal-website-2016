<?php

// Naruth Kongurai
// CSE 154
// Section: AO
// This is the PHP file that accepts parameters in the URL from the user. When the required
// parameters are received, this PHP file will return either JSON data or plain text data depending
// on whatever the user has inputted. This file manages the server-side of the bestreads web app.

// In order to return data for a book's descriptions, information, and reviews, the title of that
// book is required as a query
if (isset($_GET["title"])) {
    $title = htmlentities($_GET["title"]);   // get book title
    $mode = "";
    if (isset($_GET["mode"])) {
        $mode = $_GET["mode"];
        if ($mode == "description") outputDescription($title);
        if ($mode == "info") outputInfo($title);
        if ($mode == "reviews") outputReviews($title);
    }
}

// If only the query parameter "books" is given, then output data of all books in the directory
if (isset($_GET["mode"])) {
    $mode = $_GET["mode"];
    if ($mode == "books") outputSingleBookInfo();
}

// Outputs as plain-text the description of a particular book
function outputDescription($title) {
    $fileContent = file("books/{$title}/description.txt");
    header("Content-Type: text/plain");
    echo $fileContent[0];
}

// Outputs as JSON data the information of a particular book, such as title, author, and stars
function outputInfo($title) {
    $fileContent = file("books/{$title}/info.txt");
    $infoArray = array(
        "title" => trim($fileContent[0]), 
        "author" => trim($fileContent[1]),
        "stars" => trim($fileContent[2])
    );
    header("Content-Type: application/json");
    echo json_encode($infoArray);
}

// Outputs as JSON data the reviews of a particular book, including names and scores of the
// reviewers, and also what they said about the book
function outputReviews($title) {
    $files = glob("books/{$title}/review*.txt");
	if (count($files) == 0) {
		print("Whoops. This book does not have any reviews yet.");
	} else {
	    header("Content-Type: application/json");
	    $infoArray = [];
	    foreach ($files as $reviews) {
	        $pieces = explode("/", $reviews);
    		$fileContent = file("books/{$title}/{$pieces[2]}");
		    $reviewArray = array(
		        "name" => trim($fileContent[0]), 
			    "score" => trim($fileContent[1]),
			    "text" => trim($fileContent[2])
		    );
			array_push($infoArray, $reviewArray);
	    }
	    echo json_encode($infoArray);
	}
}

// Outputs as JSON data all available information of a particular book, including the title of
// the book and the name of the folder that stores content for that book
function outputSingleBookInfo() {
    $files = glob("books/*");
	if (count($files) == 0) {
		print("Whoops. We don't have any books in the system.");
	} else {
        header("Content-Type: application/json");
        $booksArray = array("books" => []);
	    foreach ($files as $booksInfo) {
	        $pieces = explode("/", $booksInfo);
	        $fileContent = file("books/{$pieces[1]}/info.txt");
		    $detailsArray = array(
		        "title" => trim($fileContent[0]), 
		        "folder" => trim($pieces[1]));
			array_push($booksArray["books"], $detailsArray);
	    }
	    echo json_encode($booksArray);
	}
}

?>