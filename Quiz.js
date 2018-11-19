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

/* Gets data from server by URL,
   takes into account the quiz state.
   @param {requestUrl} - url to get via AJAX.
*/
function getDataFromServer(requestUrl)
{	
	let dataa = null;
	let dataTypee = null;

	if ( quizStatus.curState == 0 || quizStatus.curState == 1)
	{
		// In case player changes the values.
		if ( quizStatus.qNumber - 1 < 0 || 
			quizStatus.qNumber - 1 > quizStatus.qCount + 1) {			
			quizError("Quiz index is out of bounds!");
		}
	
		let randomNumber = quizStatus.randNumbers[quizStatus.qNumber - 1];
		
		// In case user changes the array of random values.
		if ( randomNumber < 1 || randomNumber > quizStatus.qCount )
			quizError("Random number is out of bounds!");
		else if ( quizStatus.qNumber == quizStatus.qCount + 1 )
			endQuiz();
		
		dataa = {"rnd": randomNumber };
		dataTypee = "JSON";
	}
	else if ( quizStatus.curState == 2 )
	{
		dataa = { "st": 2 , "q": quizQuestion.name, "ans": quizQuestion.selectedAnswer};
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
			if ( dataTypee == "JSON" )
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
// Get question data.
// @param {data} - data from the server.
function dataFromServer(data)
{	
	$.each(data.info.quiz_info, function(i, v) 
	{
		quizQuestion = new Question(v.Question,v.BackImage)
		quizQuestion.add(v.Option1);
		quizQuestion.add(v.Option2);
		quizQuestion.add(v.Option3);
		quizQuestion.add(v.Option4);		
	});
	
	if ( quizQuestion != null && quizStatus.curState  != 3 )
		prepareQuiz();
}
// Prepares the quiz: resets values, changes button states.
function prepareQuiz()
{	
	changeButtonState("#nextQuestionBTN", "disabled", true);
	resetPreviousData();
	fillQuestionData();
	
	$('#myModal4').on('hidden.bs.modal', function () {
		if ( quizStatus.curState == 0 )
			countdown();
	})

	$('.tooltip').tooltip({title: quizStats.catText}); 
}
// Reset data after each question.
function resetPreviousData()
{
	$( "#question" ).empty();
	for ( i = 0;i < quizStatus.oCount;i++ )
	{	
		$("#option" + i).empty();
		document.getElementById("inputOption" + i).checked = false;
	}
	quizStats.curAnswerT = 0;
	quizStatus.oChosen= 0;
}

function fillQuestionData()
{	
	// Sets the question with it's number.
	$("#question").append(quizStatus.qNumber + "." + quizQuestion.name);
	quizStatus.qNumber++;
	
	// Swap every available option place.
	for ( a = 0; a < quizStatus.oCount;a++)
	{
		let rnd = generateNumber(0,quizStatus.oCount);
		let temp = quizQuestion.options[a];
		quizQuestion.options[a] = quizQuestion.options[rnd];
		quizQuestion.options[rnd] = temp;
	}
	// Adds options to quiz.
	for ( i = 0;i < quizStatus.oCount;i++)
		$("#option" + i).append(quizQuestion.options[i]);

	$("body").css('background-image','url('+quizQuestion.bImage+')');
}

// Utility functions.

// Function for managing player click.
function optionWasChosen()
{
	changeButtonState("#nextQuestionBTN", "disabled", false);
	quizStatus.oChosen= 1;
}
/* Change button state.
   @param {target} - Button to change.
   @param {action} - Action to change (our case is "disabled").
   @param {state}  - Enable or disable action (true or false).
*/
function changeButtonState(target, action, state)
{
	$(target).attr(action,state);
}
/* Generate a random number.
   @param {min} - minimum range.
   @param {max} - maximum range.
*/
function generateNumber(min,max)
{
	return Math.floor((Math.random() * max)) + min;
}
// For stoping the game, or in case
// of errors.
function quizError(msg)
{
	throw new Error(msg);
}

// End of utility functions.

// Get value of selected option and POST it to the server.
function checkQuestion()
{	
	if ( quizStatus.curState == 3 || quizStatus.oChosen!= 1)
		return;
	
	for ( i = 0;i < quizStatus.oCount;i++)
	{
		if ( document.getElementById("inputOption"+i).checked == true )
			quizQuestion.selectedAnswer = quizQuestion.options[i];
	}
	quizStatus.curState = 2;
	// AJAX request to the server.
	getDataFromServer("quizanswer.php")
}
// Displays Bootstrap modal with a custom message
// and class.After 1 second it asks server for new question.
function checkForAnswerStatus(data)
{
	$("#answerStatusText").empty();
	if ( data == "1" )
	{
		quizStats.correctA++;
		$( "#answerStatusDiv" ).addClass( "alert alert-success fade in" );
		$("#answerStatusText").append("Correct answer");
	}
	else
	{
		quizStats.wrongA++;
		$( "#answerStatusDiv" ).addClass( "alert alert-danger fade in" );
		$("#answerStatusText").append("Wrong answer");

	}
	infoBlock("#myModal2","on");
	setTimeout(function(){
		$( "#answerStatusDiv" ).removeClass("alert alert-danger fade in");
		$( "#answerStatusDiv" ).removeClass("alert alert-success fade in");		
		infoBlock("#myModal2","off");
	}, 1000);
	
	// Update statistics.
	statistics();
	quizStatus.curState = 1;
	getDataFromServer("quizdata.php");
}
// Open/close info block(aka Bootstrap modal).
function infoBlock(infoBlock,state)
{
	if (state == "on" )
		$(infoBlock).modal();
	else if (state == "off")
		$(infoBlock).modal('hide');
}
// For time keeping.
function countdown()
{
	if ( quizStatus.curState == 3 )
		return;
	
	document.getElementById("statsCur").innerHTML = quizStats.curAnswerT + " sec";
	if ( quizStats.curAnswerT + 1 <= 999 )
		quizStats.curAnswerT++;
	setTimeout(countdown,1000);	
}

function statistics()
{	
	// Get time of fastest and slowest question.
	if ( quizStats.curAnswerT > quizStats.slowAnswerT )
		quizStats.slowAnswerT = quizStats.curAnswerT ;
	if (  quizStats.curAnswerT < quizStats.fastAnswerT || quizStatus.curState == 0)
		quizStats.fastAnswerT = quizStats.curAnswerT;
	
	document.getElementById("statsCur").innerHTML = quizStats.curAnswerT + " sec";
	document.getElementById("statsFastest").innerHTML  = quizStats.fastAnswerT + " sec.";
	document.getElementById("statsLowest").innerHTML   = quizStats.slowAnswerT + " sec.";
	document.getElementById("statsCorrectA").innerHTML = quizStats.correctA;
	document.getElementById("statsWrongA").innerHTML   = quizStats.wrongA;
	document.getElementById("statsTotalQ").innerHTML   = quizStats.totalA;		 
}
function endQuiz()
{	
	quizStatus.curState = 3;
	
	changeButtonState("#endQuizBTN", "disabled", true);
	changeButtonState("#nextQuestionBTN", "disabled", true);
	
	for ( i = 0;i < quizStatus.oCount;i++)
		changeButtonState("#inputOption"+i,"disabled",true);
	
	statistics();
	infoBlock("#myModal","on");
	quizError("Quiz has ended!");
}