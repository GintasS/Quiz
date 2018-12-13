<?php 
	header("Content-type: application/text; charset=UTF8");
	
	$servername = "";
	$username   = "";
	$password   = "";
	$dbname     = "";

	$conn = new mysqli($servername, $username, $password, $dbname);
	
	// If connection encountered an error, stop execution.
	if ($conn->connect_error) 
		die("Connection to MYSQL DB failed: " . $conn->connect_error);	
	
	// Status of the game
	$gameStatus = 0;
	// Answer from MYSQL DB.
	$realAnswer   = "";
	// Answer from client side.
	$playerAnswer = "";
	// Question from client side.
	$playerQuestion  = "";
	
	// If mysqli charset is wrong, stop execution.
	if (!$conn->set_charset("utf8")) 
      die("Error loading character set: %s\n" . $conn->error);
	
	// If request method is not POST, stop execution.
	if ($_SERVER['REQUEST_METHOD'] !== "POST")
		die("Unable to check the answer!");
	
	// If any POST value is null, stop execution. 
	if ($_POST['st'] === null || $_POST['ans'] === null ||
		$_POST['q'] === null)
	{
		die("Unable to check the answer!");
	}
	
	$gameStatus      = $_POST['st'];
	$playerAnswer    = $_POST['ans'];
	$playerQuestion  = $_POST['q'];
	
	/* If game status is not 2
	   (2 is for checking user submited answer),
	   stop execution.
	*/
	if ($gameStatus != 2)
		die("Unable to check the answer!");
	
	// Prepared SQL statement for security.
	$result2 = $conn->prepare("");
	$result2->bind_param("s", $playerQuestion);
	
	// If SQL query failed, stop execution.
	if (!$result2->execute()) 
		die("Execute failed: (" . $result2->errno . ") " . $result2->error);
					
	$result2->bind_result($realAnswer);
	$result2->fetch();
	$result2->close();
	
	/* If answer from client side
	   and answer from MYSQL DB are equal,
	   print binary value of:
	   0 - Wrong answer
	   1 - Correct answer.
	*/
	if ($realAnswer !== null)
	{	
		$salt = generateSalt(32);

		if ($realAnswer === $playerAnswer)
			echo $salt . PHP_EOL . generateHash(;
		else
			echo $salt . PHP_EOL . generateHash();
	}
	else
		echo $salt . PHP_EOL . generateHash();

	$conn->close();
?>
