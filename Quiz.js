// Main object: holds current question data.
function Question(Qname,BackImage){
	
	// Question name.
	this.name = Qname;
	// Possibile options.
	this.options = [];
	// User selected answer.
	this.selectedAnswer  = "";
	// Background image for question.
	this.bImage = BackImage;
	
    this.add = function (Qoption) {
        this.options.push(Qoption);
    };
}
// Track statistics of player.
function Statistics() {
	
	// Total questions.
	this.totalA = 0;
	// Correct questions.
	this.correctA= 0;
	// Wrong questions.
	this.wrongA = 0;
	// Total categories.
	this.cat = 8;
	// Categories text.
	this.catText = "Astronomy Biology Chemistry \
	Physics Geography Computer Science History Mathematics";
	// Time variables.
	this.fastAnswerT = 10000;
	this.slowAnswerT = 0;
	this.curAnswerT = 0;
}
// Tracks quiz state.
function State() {
	
	// Variable for checking if any 
	// option is checked.
	this.oChosen= 0;
	//  Question number
	this.qNumber = 1;
	
	// Current quiz state:
	// 0 - First question.
	// 1 - Normal question.
	// 2 - Check question answer.
	// 3 - Quiz has ended.
	this.curState = 0;	
	this.randNumbers = [];
	
	// Quiz info: 
	// Total question count.
	// Available options for each question.
	this.qCount = 100;
	this.oCount = 4;
	
	// Initialize values for swap operations.
	for ( i = 0;i < this.qCount;i++ )
		this.randNumbers[i] = i + 1;
	
	// Swap values randomly.
	for ( i = 0;i < this.qCount;i++ )
	{
		let rnd = generateNumber(1,this.qCount - 1);
		let temp = this.randNumbers[i];
		this.randNumbers[i] = this.randNumbers[rnd];
		this.randNumbers[rnd] = temp;
	}
}

// Our main variables for controling the quiz.
var quizStatus    = new State();
var quizQuestion  = null;
var quizStats	  = new Statistics();

/* Get data from server by URL.
   @constructor  
   @param {string} requestUrl - Url to get via AJAX.
   
   @return {Void}.  
*/
function getDataFromServer(requestUrl) {	

	let dataa = null;
	let dataTypee = null;

	if (quizStatus.curState == 0 || quizStatus.curState == 1)
	{
		// In case player changes the values.
		if (quizStatus.qNumber - 1 < 0 || 
			quizStatus.qNumber - 1 > quizStatus.qCount + 1) 
		{			
			quizError("Quiz index is out of bounds!");
		}
	
		let randomNumber = quizStatus.randNumbers[quizStatus.qNumber - 1];
		
		// In case user changes the array of random values.
		if (randomNumber < 1 || randomNumber > quizStatus.qCount)
			quizError("Random number is out of bounds!");
		else if (quizStatus.qNumber == quizStatus.qCount + 1)
			endQuiz();
		
		dataa = {"rnd": randomNumber};
		dataTypee = "JSON";
	}
	else if (quizStatus.curState == 2)
	{
		dataa = {
			"st": 2, 
			"q": quizQuestion.name, 
			"ans": quizQuestion.selectedAnswer
		};
		dataTypee = "text";
	}
	// I use AJAX to get a question and
	// check if answer is correct.

	$.ajax({
		type: "POST",
		data: dataa,
		url: requestUrl,
		dataType: dataTypee, 
		success:function(data) {
			if (dataTypee == "JSON")
				dataFromServer(data);
			else
				checkForAnswerStatus(data);	
		},
		error: function (jqXHR, exception) {
			quizError("Error in AJAX request, Status code: " + jqXHR.status + 
						" - " + exception + " " + jqXHR.responseText);
		}
	});
}

/* Parses JSON data.
   @constructor  
   @param {json} data - JSON data from the server.
   
   @return {Void}.  
*/
function dataFromServer(data) {	

	$.each(data.info.quiz_info, function(i, v) 
	{
		quizQuestion = new Question(v.Question, v.BackImage)
		quizQuestion.add(v.Option1);
		quizQuestion.add(v.Option2);
		quizQuestion.add(v.Option3);
		quizQuestion.add(v.Option4);		
	});
	
	if (quizQuestion != null && quizStatus.curState != 3)
		prepareQuiz();
}

/* Prepare the quiz.
   @constructor  

   @return {Void}.  
*/
function prepareQuiz() {
	
	changeButtonState("#nextQuestionBTN", "disabled", true);
	resetPreviousData();
	fillQuestionData();
	
	$('#myModal4').on('hidden.bs.modal', function () {
		if (quizStatus.curState == 0 )
			countdown();
	})

	$('.tooltip').tooltip({title: quizStats.catText}); 
}

/* Reset all the data for a new question.
   @constructor  

   @return {Void}.  
*/
function resetPreviousData() {
	
	$("#question").empty();
	for (i = 0; i < quizStatus.oCount;i++)
	{	
		$("#option" + i).empty();
		document.getElementById("inputOption" + i).checked = false;
	}
	quizStats.curAnswerT = 0;
	quizStatus.oChosen= 0;
}

/* Fill all the data regarding the current question.
   @constructor  

   @return {Void}.  
*/
function fillQuestionData() {	

	// Sets the question with it's number.
	$("#question").append(quizStatus.qNumber + "." + quizQuestion.name);
	quizStatus.qNumber++;
	
	// Swap every available option place.
	for (a = 0; a < quizStatus.oCount;a++)
	{
		let rnd = generateNumber(0, quizStatus.oCount);
		let temp = quizQuestion.options[a];
		quizQuestion.options[a] = quizQuestion.options[rnd];
		quizQuestion.options[rnd] = temp;
	}
	// Adds options to quiz.
	for (i = 0; i < quizStatus.oCount;i++)
		$("#option" + i).append(quizQuestion.options[i]);

	$("body").css('background-image','url(' + quizQuestion.bImage + ')');
}

/* Function for handling selected user option.
   @constructor  

   @return {Void}.  
*/
function optionWasChosen() {
	
	changeButtonState("#nextQuestionBTN", "disabled", false);
	quizStatus.oChosen= 1;
}
/* Change button state.
   @constructor  
   @param {string} target - Button to change.
   @param {string} action - Action to change (our case is "disabled").
   @param {string} state - Enable or disable action (true or false).
   
   @return {Void}.  
*/
function changeButtonState(target, action, state) {
	
	$(target).attr(action, state);
}

/* Generate a random number.
   @constructor  
   @param {int} min - Minimum range.
   @param {int} max - Maximum range.
   
   @return {int}. 
*/
function generateNumber(min, max) {
	
	return Math.floor((Math.random() * max)) + min;
}

/* Throw an error with a message.
   @constructor  
   @param {string} msg - Message to display.

   @return {Void}.   
*/
function quizError(msg) {
	
	throw new Error(msg);
}

/* Function, that checks user submited answer by geting
   answer from DB via AJAX.
   @constructor  

   @return {Void}.   
*/
function checkQuestion() {	

	if (quizStatus.curState == 3 || quizStatus.oChosen!= 1)
		return;
	
	for (i = 0; i < quizStatus.oCount;i++)
	{
		if (document.getElementById("inputOption"+i).checked == true)
			quizQuestion.selectedAnswer = quizQuestion.options[i];
	}
	
	quizStatus.curState = 2;
	// AJAX request to the server.
	getDataFromServer("quizanswer.php")
}

/* Function, that displays answer status to the player.
   @constructor  
   @param {string} data - Data from server.
   
   @return {Void}.   
*/
function checkForAnswerStatus(data) {
	
	$("#answerStatusText").empty();
	if (data.indexOf("\n") && data.length === 161)
	{
		let salt = data.substr(0, data.indexOf("\n")),
			hash = sha3_512(salt + quizQuestion.name + salt),
			serverHash = data.substr(data.indexOf("\n") + 1, 128);
		
		if (hash === serverHash)	
			answerStatus(0);
		else
			answerStatus(1);		
	}
	else 
		answerStatus(0);
	
	infoBlock("#myModal2","on");
	setTimeout(function(){
		$("#answerStatusDiv").removeClass("alert alert-danger fade in");
		$("#answerStatusDiv").removeClass("alert alert-success fade in");		
		infoBlock("#myModal2", "off");
	}, 1000);
	
	// Update statistics.
	statistics();
	quizStatus.curState = 1;
	getDataFromServer("quizdata.php");
}

/* Function, that sets answer status.
   @constructor  
   @param {int} mode - Determine if answer is correct or wrong.

   @return {Void}.
*/
function answerStatus(mode) {

	if(mode === 0)
		quizStats.correctA++;
	else if(mode === 1)
		quizStats.wrongA++;
	
	$("#answerStatusDiv").addClass(((mode === 0) ? 
	"alert alert-success fade in":"alert alert-danger fade in"));
	$("#answerStatusText").append(((mode === 0) ? 
	"Correct answer":"Wrong answer"));	
}

/* Function, that opens/closes bootstrap modal.
   @constructor  
   @param {string} infoBlock - DOM element, that has a modal.
   @param {string} state - Determine if we need to open the modal
   or close it.
   
   Possible state values:
   "on" - opens a modal.
   "off" - closes a modal.
   
   @return {Void}.   
*/
function infoBlock(infoBlock, state) {
	
	if (state == "on" )
		$(infoBlock).modal();
	else if (state == "off")
		$(infoBlock).modal('hide');
}

/* Function, that displays and manages the timer.
   @constructor  
   
   @return {Void}.   
*/
function countdown() {
	
	if (quizStatus.curState == 3)
		return;
	
	document.getElementById("statsCur").innerHTML = quizStats.curAnswerT + " sec";
	if (quizStats.curAnswerT + 1 <= 999)
		quizStats.curAnswerT++;
	
	setTimeout(countdown, 1000);	
}

/* Function, that displays statistics in modal.
   @constructor  
   
   @return {Void}.   
*/
function statistics() {
	
	// Get time of fastest and slowest question.
	if (quizStats.curAnswerT > quizStats.slowAnswerT)
		quizStats.slowAnswerT = quizStats.curAnswerT ;
	if (quizStats.curAnswerT < quizStats.fastAnswerT || quizStatus.curState == 0)
		quizStats.fastAnswerT = quizStats.curAnswerT;
	
	document.getElementById("statsCur").innerHTML = quizStats.curAnswerT + " sec";
	document.getElementById("statsFastest").innerHTML  = quizStats.fastAnswerT + " sec.";
	document.getElementById("statsLowest").innerHTML   = quizStats.slowAnswerT + " sec.";
	document.getElementById("statsCorrectA").innerHTML = quizStats.correctA;
	document.getElementById("statsWrongA").innerHTML   = quizStats.wrongA;
	document.getElementById("statsTotalQ").innerHTML   = quizStats.totalA;		 
}

/* Function, that ends the quiz.
   @constructor  

   @return {Void}.   
*/
function endQuiz() {
	
	quizStatus.curState = 3;
	
	changeButtonState("#endQuizBTN", "disabled", true);
	changeButtonState("#nextQuestionBTN", "disabled", true);
	
	for (i = 0; i < quizStatus.oCount;i++)
		changeButtonState("#inputOption" + i, "disabled", true);
	
	statistics();
	infoBlock("#myModal", "on");
	quizError("Quiz has ended!");
}
