<?php 
	header('Content-type: text/plain; charset=utf-8');

	$servername = "";
	$username   = "";
	$password   = "";
	$dbname     = "";
	
	$conn = new mysqli($servername, $username, $password, $dbname);
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
	if ( $_SERVER['REQUEST_METHOD'] !== "POST" )
		die("Unable to check the answer!");		
	
	$randomNumber = $_POST['rnd'];
	
	// Prepared SQL statement for security.
	$result = $conn->prepare("SELECT quiz_answers.Question, quiz_options.Option1, 
	quiz_options.Option2, quiz_options.Option3, quiz_options.Option4, quiz_images.ImageUrl 
	FROM ((quiz_answers INNER JOIN quiz_options ON quiz_answers.Id = quiz_options.Id) 
	INNER JOIN quiz_images ON quiz_images.Id = quiz_options.Id ) WHERE quiz_options.Id = ?");
	
	$result->bind_param("i", $randomNumber);
	
	// If SQL query failed, stop execution.
	if (!$result->execute()) 
		die("Execute failed: (" . $result->errno . ") " . $result->error);
	
	$result->bind_result($question,$opt1,$opt2,
						$opt3,$opt4,$backImage);
	$result->fetch();
	$result->close();
	
	// Print data with JSON structure.
	echo  "{" . "\r\n" .  '  "info":' . "\r\n" . "\t";
	echo  '{' . "\r\n" . "\t". '"quiz_info":' . "\r\n" . "\t" . "[" . "\r\n" ;	
	echo "\t" . "{" . "\r\n" . "\t";
	echo  '"Question": "'  . $question . '",' . "\r\n" . "\t";
	echo  '"Option1": "'   . $opt1 . '",' . "\r\n" . "\t";
	echo  '"Option2": "'   . $opt2 . '",' . "\r\n" . "\t";
	echo  '"Option3": "'   . $opt3 . '",' . "\r\n" . "\t";	
	echo  '"Option4": "'   . $opt4 . '",' . "\r\n" . "\t";				
	echo  '"BackImage": "' . $backImage . '"' . "\r\n" . "\t";	
	echo  "}" . "\r\n" . "\t" . "]" . "\r\n" . "\t" . "}" . "\r\n" . "}";
	
	$conn->close();
?>