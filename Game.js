// Array, which holds all the data which we download later from the web server
var Urls = 
[
	"All_questions.txt", 	  
	"Correct_answers.txt",   
	"Each_variant.txt",    
	"Pictures.txt"           
]

// Arrays, which holds all the above mentioned data
var Questions                = [],
	Answers                  = [],
	All_variants 		     = [],
	Each_choice              = [],
	Pictures                 = [];
	
var current_url              = "",
	downloaded_info_count    = 0,
	answer_index             = -1,
	question_index 			 = 0;
	
// Variables for the statistics
var stats_current_question_number         = 0,
	stats_all_question_count    	      = 100,
	stats_correctly_answ_quest_count   	  = 0,
	stats_notcorrectly_answ_quest_count   = 0,
	stats_question_categories_count       = 8,
	stats_categories                      = "Astronomija Biologija Chemija Fizika Geografija Informatika Istorija Matematika";
	stats_fastest_answ_question           = 100000000,
	stats_slowest_answ_question 	      = 0,
	stats_current_answ_question_time      = 0;
	
// Game state variables
var Game_state_variant_chosen             = 0,
	Game_state_first_question             = 0, 
	Game_state_game_ended                 = 0;
	
		
// Read the data from the server via AJAX
function Get_data_from_server()
{
	/* AJAX works like this:
	  1) We try to get the data from the server via GET method.
	  2) If we succesfully got the data from the server, then the 'success' function will kick in
	  2) If not, then the error function will kick in
	  3) Despite above the result, complete function will kick in anyway, it will either try
		 to fecth new data or go the game preparation state.
		
	*/
	
	// Trying to get the data (1)
	current_url = Urls[downloaded_info_count];
	
	$.ajax({
		type: "GET",
		dataType: "text",
		url: Urls[downloaded_info_count],
		contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
		success:function(data) // If sucesfull, read that data
		{
			if ( downloaded_info_count  + 1 <= Urls.length )
			{
				console.log("Duomenys iš "+ Urls[downloaded_info_count]+" gauti SĖKMINGAI!");
				Read_data_from_server(data);
				downloaded_info_count++;
			}
		},
		error: function (jqXHR, exception) // If not, print the reason why the process failed
		{
			var msg = "Duomenų gauti iš " +  Urls[downloaded_info_count] + " NEPAVYKO, nes: ";
			 if (jqXHR.status === 0)
					 msg += "Not connect.\n Verify Network.";
			 else if (jqXHR.status == 404)
					 msg += "Requested page not found. [404]";
			 else if (jqXHR.status == 500)
					 msg += "Internal Server Error [500].";
			 else if (exception === "parsererror")
					 msg += "Requested JSON parse failed.";
			 else if (exception === "timeout")
					 msg += "Time out error.";
			 else if (exception === "abort")
					 msg += "Ajax request aborted.";
			 else
					 msg += "Uncaught Error.\n" + jqXHR.responseText;

			console.log(msg);
		},
		complete:function()// Despite the outcome, try to get new data or proceed to the game preparation state.
		{
			if ( downloaded_info_count !=  Urls.length )
				Get_data_from_server();
			else if ( downloaded_info_count ==  Urls.length )
				Prepare_the_game();
		}
	});
}
function Read_data_from_server(data)
{
    // Reading the data into arrays.
	if ( current_url == Urls[0] )
	{
		Questions = data;
		Questions = Questions.split('\n');	
	}
	else if ( current_url == Urls[1])
	{
		Answers = data;
		Answers = Answers.split('\n');
	}
	else if ( current_url == Urls[2])
	{
		All_variants = data;
		All_variants = All_variants.split('\n');
	}
	else if ( current_url == Urls[3] )
	{
		Pictures = data;
		Pictures = Pictures.split('\n');
	}

}
function Prepare_the_game()
{
	// We randomly swap the places of the array elements in order to make them appear in random order.		
	for ( i = 0; i < Questions.length;i++ )
	{
		var rnd = Math.floor((Math.random() * (Questions.length)));
			
		var laikinas  = Questions[rnd],
			laikinas2 = Answers[rnd],
			laikinas3 = All_variants[rnd],
			laikinas4 = Pictures[rnd];
		
		Questions[rnd]      = Questions[i];
		Questions[i]        = laikinas;
		
		Answers[rnd]      = Answers[i];
		Answers[i]        = laikinas2;
				
		All_variants[rnd] = All_variants[i];
		All_variants[i]   = laikinas3;
		
		Pictures[rnd]     = Pictures[i];
		Pictures[i]       = laikinas4;
		
	}
	// 
	Open_the_info_block("#myModal4","on");
	document.getElementById("progress_bar_percentage").innerHTML  =  "0%";
	$(".progress-bar").css('width','0%').attr('aria-valuenow', "0");   
	$('.tooltip').tooltip({title: stats_categories}); 
	
	Klausti_Questions = Questions;
	
	Next_question();
	Countdown();
}
function Next_question()
{	
	// We are checking whether we can proceed with next question
	if ( Game_state_game_ended == 0 && stats_current_question_number <= stats_all_question_count  && (  Game_state_variant_chosen == 1 || Game_state_first_question== 0 ) )
	{
		// We are also checking whether the game hasn't reached the end.
		if ( question_index != stats_all_question_count )
		{
			// Resetting data		
			$( "#question" ).empty();
			Game_state_variant_chosen = 0;
			$("#button_kitas_klausimas").attr("disabled",true);
		
			for ( i = 0; i < 4;i++)
			{
				var x = i +1;
				$( "#answer_variant_text"+x ).empty();
			}
		}
			// Whether the player answered the question correctly or not.
			for ( i = 0;i< 4;i++)
			{
				var x = i +1;
				if ( document.getElementById("answer_variant"+x).checked == true )
				{
					if ( answer_index == x )
					{
						stats_correctly_answ_quest_count++;
						Open_the_info_block("#myModal2","on");
					}
					else
					{
						stats_notcorrectly_answ_quest_count++;
						Open_the_info_block("#myModal3","on");
					}

					$("#atsakymo_variantas"+x).attr('checked',false);
					
					setTimeout(function(){
					Open_the_info_block("#myModal2","off");
					Open_the_info_block("#myModal3","off");
					}, 
					1000);
					
					break;
				}
			}

		if ( question_index != stats_all_question_count )
		{
			// We are generating new place for each possible answer.	
			Each_choice = All_variants[question_index].split(",");

			for ( i = 0;i < 4 ;i++)
			{	
				var rnd = Math.floor((Math.random() * 4));
				var laik = Each_choice[i];
				Each_choice[i] = Each_choice[rnd];
				Each_choice[rnd] = laik;
							
			}
			// We are trying to get the index at which the correct answer is.
			answer_index = -1;
			for ( i = 0;i < 4;i++)
			{
				var x = i + 1;
				$( "#answer_variant_text"+x ).append(Each_choice[i]);
				
				if ( Each_choice[i].indexOf(Answers[question_index]) != -1)
					answer_index = x;
			}
			// Appending the question data.
			$( "#question" ).append( (stats_current_question_number+1) + "." + Questions[question_index] );
			$("body").css('background-image','url('+Pictures[question_index]+')');
			question_index++;
			stats_current_question_number++;
		}
		else
			End_the_game();		
	}
	else if ( Game_state_game_ended == 1 )
		alert("Žaidimas jau buvo pasibaigė!!!");
		
	if ( Game_state_first_question!= 0 )
		Statistics();
	
	stats_current_answ_question_time = 0;
}
function Statistics()
{
	// Filling the statistical data.
	if (  stats_current_answ_question_time > stats_slowest_answ_question)
		stats_slowest_answ_question=  stats_current_answ_question_time;
	if (  stats_current_answ_question_time < stats_fastest_answ_question || Game_state_first_question == 1)
	{
		stats_fastest_answ_question   = stats_current_answ_question_time;
		if ( Game_state_first_question== 1)
		Game_state_first_question = 2;
	}
		
	if ( Game_state_game_ended == 1 )
		stats_current_question_number = 101;
		
	document.getElementById("stat_fastest_time").innerHTML 		       = stats_fastest_answ_question 	  + " sec";
	document.getElementById("stat_slowest_time").innerHTML             = stats_slowest_answ_question	  + " sec";
	document.getElementById("stat_current_answer_time").innerHTML      = stats_current_answ_question_time + " sec";
	document.getElementById("stat_correct_ans_count").innerHTML        = stats_correctly_answ_quest_count;
	document.getElementById("stat_not_correct_ans_count").innerHTML    = stats_notcorrectly_answ_quest_count;
	document.getElementById("stat_total_count_ans").innerHTML          = stats_all_question_count;
		
	$("#progress_bar_percentage").empty();
	$("#progress_bar_percentage").append((stats_current_question_number-1) +"%");
	$(".progress-bar").css('width', (stats_current_question_number-1)+'%').attr('aria-valuenow', stats_current_question_number-1);   

}
function Countdown()
{
  // We are using Countdown for statistical purposes only.
  if ( Game_state_game_ended == 0 )
  {
	if ( Game_state_first_question== 0 )
		Game_state_first_question= 1;
  
	  stats_current_answ_question_time++;
	 document.getElementById("stat_current_answer_time").innerHTML = stats_current_answ_question_time + " sec";
	  	  
	  setTimeout(Countdown,1000);
  }
}
function End_the_game()
{
	if ( Game_state_game_ended == 0 )
	{
		// Disable all the buttons if game has ended.
		$("#button_end_game").attr("disabled",true);
		$("#button_next_question").attr("disabled",true);
		Open_the_info_block("#myModal","on")
		Game_state_game_ended = 1;
	}
	else
		alert("Žaidimas jau buvo pasibaigė!!!");
}
function Chosen_variant()
{
	 if ( Game_state_game_ended == 0 )
	 {
		// We are checking if player actually chose any of 4 possible answers
		$("#button_next_question").attr("disabled",false);
		Game_state_variant_chosen = 1;
	 }
}
function Open_the_info_block(info_block,state)
{
	// Opening/Closing the info blcok.
	if (  state == "on" )
		$(info_block).modal();
	else if ( state == "off")
		$(info_block).modal('hide');
}