<?php 
	header('Content-type: text/plain; charset=utf-8');

	$servername = "";
	$username   = "";
	$password   = "";
	$dbname     = "";
	
	$conn = new mysqli($servername, $username, $password, $dbname);
	
	// If connection encountered an error, stop execution.
	if ($conn->connect_error) 
		die("Connection to MYSQL DB failed: " . $conn->connect_error);	
	
	// If mysqli charset is wrong, stop execution.
	if (!$conn->set_charset("utf8"))
      die("Error loading character set utf8: %s\n" . $conn->error);
	
	// Status of the game	
	$gameStatus = -1;
	// Random number from client side.
	$randomNumber = 1;
	
	// If request method is not POST, stop execution.	
	if ($_SERVER['REQUEST_METHOD'] !== "POST")
		die("Unable to show the answer!");		
	
	$randomNumber = $_POST['rnd'];
	
	// Prepared SQL statement for security.
	$result = $conn->prepare("");
	
	$result->bind_param("i", $randomNumber);
	
	// If SQL query failed, stop execution.
	if (!$result->execute()) 
		die("Execute failed: (" . $result->errno . ") " . $result->error);
	
	$result->bind_result($question, $opt1, $opt2,
			   $opt3, $opt4, $backImage);
	$result->fetch();
	$result->close();
	
	$jsonData = array();
	
	$jsonData["info"]["quiz_info"][] =  array(
		"Question" => $question,
		"Option1" => $opt1,
		"Option2" => $opt2,		
		"Option3" => $opt3,
		"Option4" => $opt4,
		"BackImage" => $backImage	
	);
	echo json_encode($jsonData, JSON_PRETTY_PRINT);
	
	$conn->close();
?>
