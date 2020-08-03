//  The below steps would be used to access the data dynamically, assuming it was served.
// var jsonData = $.getJSON("output.json");
// var quizData = JSON.parse(jsonData);

//Instead, in this file, the JSON data has been made available via HTML interface in order to bypass cross site scripting security.
//  It is simply an object named 'data'
function selectQuestions() {
    return data.questions;
}

var numQs = data.questions.length;
// this is a variable to store user correctness during evaluation; the first element is the attempt number
var outcomes = [0];

function Question(number, text, correct, incorrect) {
    this.number = number;
    this.text = text;
    this.correct = correct;
    this.incorrect = incorrect;
    this.set1 = []; //this will contain the set of answer choices for pt 1
    this.set2 = []; //this is the set of answer choices for pt 2
    this.ans1; //contains index of answer to set 1
    this.ans2; //contains index of answer to set 2
}

var questions = [];

// function courtesy of https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

function getAnswerChoices(question) {
    var corrects = getRandomSubarray(question['correct'], 2);
    var incorrects = getRandomSubarray(question['incorrect'], 6);

    var set1 = [corrects[0], incorrects[0], incorrects[1], incorrects[2]];
    var set2 = [corrects[1], incorrects[3], incorrects[4], incorrects[5]];

    question.set1 = getRandomSubarray(set1, 4);
    question.set2 = getRandomSubarray(set2, 4);

    for (k = 0; k < 4; k++) {
        if (question.set1[k] === corrects[0]) {
            console.log("Correct answer for " + question.number + " pt 1 is " + k);
            question.ans1 = k;
        }

        if (question.set2[k] === corrects[1]) {
            console.log("Correct answer for " + question.number + " pt 2 is " + k);
            question.ans2 = k;
        }

    }
}

function quizBuilder() {
    //first, create the question objects that will be used to make the quiz elements
    for (i = 0; i < numQs; i++) {

        questions[i] = new Question(
            i + 1,
            data.questions[i],
            data[(i + 1) + "correct"],
            data[(i + 1) + "incorrect"]
        );

        getAnswerChoices(questions[i]);
        console.log("This is the quiz builder loop succeeding on iteration " + i);
    }

    //Actually create the quiz elements in HTML
    for (i = 0; i < numQs; i++) {

        $("#quiz_content").append("<div id=question" + questions[i].number + " class='quizq'>" + questions[i].number + ". " + questions[i].text +
            "<div id='quiz" + (i + 1) + "-1' class='quiz1'></div>" +  //create a div for test #1
            "<div id='quiz" + (i + 1) + "-2' class='quiz2'></div>" +   //create a div for the retest
            "<br /><div id=feedback_noinput" + (i + 1) + " class='feedback incorrect'>Please choose one of the options above</div>" +
            "<div id=feedback_right" + (i + 1) + " class='feedback correct'>Yes, you are right!</div>" +
            "<div id=feedback_wrong" + (i + 1) + " class='feedback incorrect'>You are not quite right</div>"); //finally, add feedback  sections

        for (j = 0; j < questions[i].set1.length; j++) {
            $("#quiz" + (i + 1) + "-1").append("<input type='radio' id=opt" + questions[i].number + j + "-1 name=quiz" + i + "-1 value=" + j + " class=quizradio1 />" +
                "<label for=opt" + questions[i].number + j + "-1 class=quizradio>" + questions[i].set1[j][0] + "</label><br />");
        }

        for (j = 0; j < questions[i].set2.length; j++) {
            $("#quiz" + (i + 1) + "-2").append("<input type='radio' id=opt" + questions[i].number + j + "-2 name=quiz" + i + "-2 value=" + j + " class=quizradio2 />" +
                "<label for=opt" + questions[i].number + j + "-2 class=quizradio>" + questions[i].set2[j][0] + "</label><br />");
        }

    }

    console.log("quizbuilder complete");
}



window.onload = function () {
    this.quizBuilder();

    $(".feedback").hide();
    $(".quiz2").hide();
    $("#retry").hide();

    console.log("onload has successfully completed");


    // Function to evaluate the quiz
    $("#sub").click(function () {
        console.log("evaluate has been called");
        var quiz_num = outcomes[0] + 1;
        var is_valid = true; // is a valid quiz submission


        //make sure all questions have been answered
        for (var i = 0; i < numQs; i++) {
            if ($("input[name=quiz" + i + "-" + quiz_num + "]:checked").val() === undefined) {
                $("#feedback_noinput" + (i + 1)).show();
                is_valid = false;
            }
        }

        if (!is_valid) {
            return;
        }


        //hide any old feedback
        $(".feedback").hide();

        var new_out = outcomes.slice(0);
        var user_input = [];
        var answer_key = [];
        new_out[0] = quiz_num;


        for (var i = 0; i < numQs; i++) {
            var correct = questions[i]["ans" + quiz_num];
            var user_ans = $("input[name=quiz" + i + "-" + quiz_num + "]:checked").val();
            answer_key.push(correct);
            user_input.push(user_ans);
            if (user_ans != correct) {
                new_out.push(0);
                $("#feedback_wrong" + (i + 1)).show();
            } else {
                new_out.push(1);
                $("#feedback_right" + (i + 1)).show();
            }

            $("quiz" + (i + 1) + "-1").attr('readonly', 'readonly');

        }

        //$("sub").hide();
        $('#retry').show();

    });


}