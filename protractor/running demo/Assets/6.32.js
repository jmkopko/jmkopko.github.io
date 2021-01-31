

window.onload = function () {
  bangles = this.CTATShellTools.findComponent('angles')[0];
  //okay, this is really wonky.  The following console.log HAS to get called to
  // avoid some kind of weird stack overflow that occurs if bangles isn't scoped by it somehow.
  // something with the variable table setup in CTAT
  console.log(bangles.reportAngle("ABC"));
}

var fadespd = 1000;
//determines how fast components fade in and out in ms

// this allows you to grab the current value of an angle in the protractor
function angleReturner(angleName) {
  reporting_angle = bangles.reportAngle(angleName);
  return reporting_angle;  
}

// these let you check complex inputs when the protractor is not in 'chosen' mode.
function checkProtractorInputRange(angleName, lower, upper, input) {
  inp = JSON.parse("{"+input+"}");
  inpAngle = Math.abs(inp[angleName]);

  return (inpAngle >= lower && inpAngle <= upper);
}

function checkProtractorInputRangeLower(angleName, lower, input) {
  inp = JSON.parse("{"+input+"}");
  inpAngle = Math.abs(inp[angleName]);

  return (inpAngle < lower);
}

function checkProtractorInputRangeUpper(angleName, upper, input) {
  inp = JSON.parse("{"+input+"}");
  inpAngle = Math.abs(inp[angleName]);

  return (inpAngle > upper);
}

// The following 4 functions are specialized tools for part 6 of set 3 of the problems (twin)
//  There is need to check a text input against a current value of the protractor that isn't readily
//  available in the variable table and not easily accessed.

function checkTextInputRange(angleName, tolerance, input) {
    var compAngle = bangles.reportAngle(angleName);
    var inp = parseInt(input);

    var diff = Math.abs(inp - compAngle);

    return (diff <= tolerance && diff != 0);
}

function checkTextInputExact(angleName, input) {
    console.warn(angleName);
    var compAngle = bangles.reportAngle(angleName);
    console.warn(compAngle);
    var inp = parseInt(input);

    return (compAngle === inp);
}

function checkTextInputRangeLesser(angleName, tolerance, input) {
    var compAngle = bangles.reportAngle(angleName) - tolerance;
    var inp = parseInt(input);

    return (inp < compAngle);
}

function checkTextInputRangeGreater(angleName, tolerance, input) {
    var compAngle = bangles.reportAngle(angleName) + tolerance;
    var inp = parseInt(input);

    return (inp > compAngle);
}




//Everything below here is extremely specialized to simulate the old 6.32 mathtutor performance.
// It looks awful, but it is not terribly complicated:
// 6.32 has three groupings of problems, represented by the first tier of switch cases:
// 1. dashboard - problems 2 - 7
// 2. double - problems 8 - 12
// 3. twin - problems 13 - 16

// further, each problem in those groupings has 6 phases.  This is the second tier of switch cases.
// At each phase, the next problem step instruction fades in after the previous instruction fades out 
// whenever a problem enters a step where the student has to input text, goToStep will clear the correctness highlight


function goToStep(inputCode) {
  var group = parseInt(inputCode[0]);
  var nextPhase = parseInt(inputCode[1]);

  switch (group) {
    case 1:
      switch (nextPhase) {
        case 0:
          $("#angleBdescr").hide();
          $("#angleCdescr").hide();
          $("#angleDdescr").hide();
          $("#angleEdescr").hide();
          $("#angleFdescr").hide();
          $("#angleEmoveto").hide();
          $("#angleFmoveto").hide();
          $("#angleE").hide();
          $("#angleF").hide();
          $("#finish").hide();
          if (parseInt(inputCode[2]) === 0) { $(".CTATProtractor--label90").fadeOut(fadespd); $(".inner").fadeOut(fadespd); }
          break;
        case 1:
          $("#problem_statement").fadeOut(fadespd, function () { $("#angleBdescr").fadeIn(fadespd); });
          break;
        case 2:
          $("#angleBdescr").fadeOut(fadespd, function () { $("#angleCdescr").fadeIn(fadespd); });
          break;
        case 3:
          $("#angleCdescr").fadeOut(fadespd, function () { $("#angleDdescr").fadeIn(fadespd); });
          break;
        case 4:
          $("#angleDdescr").fadeOut(fadespd, case14());
          function case14() {
            setTimeout(function () {
              $("#angleEdescr").fadeIn(fadespd);
              $("#angleE").fadeIn(fadespd);
              bangles.removeRayStyles();
            }, 2000);
          }

          break;
        case 5:
          $("#angleEdescr").fadeOut(fadespd);
          $("#angleE").fadeOut(fadespd);

          function case15() {
            $("#angleFdescr").fadeIn(fadespd);
            $("#angleF").fadeIn(fadespd);
          }

          setTimeout(case15, 2000);

          break;
        case 6:
          $("#angleFdescr").fadeOut(fadespd);
          $("#angleF").fadeOut(fadespd, function () { $("#finish").fadeIn(fadespd); });
          break;

      }
      break;

    case 2:
      switch (nextPhase) {
        case 0:
          $("#angleBdescr").hide();
          $("#angleCdescr").hide();
          $("#angleDdescr").hide();
          $("#angleEdescr").hide();
          $("#angleFdescr").hide();
          $("#angleEmoveto").hide();
          $("#angleFmoveto").hide();
          $("#angleE").hide();
          $("#angleF").hide();
          $("#finish").hide();

          if (inputCode.substring(2, 4) === '08') { $(".inner").hide(); }
          break;
        case 1:
          $("#problem_statement").fadeOut(fadespd, function () { $("#angleBdescr").fadeIn(fadespd); });
          break;
        case 2:
          $("#angleBdescr").fadeOut(fadespd, function () {
            $("#angleCdescr").fadeIn(fadespd);
            if (inputCode.substring(2, 4) === '08') { $(".inner").fadeIn(fadespd); }
          });

          break;
        case 3:
          $("#angleCdescr").fadeOut(fadespd, function () { $("#angleDdescr").fadeIn(fadespd); });
          break;
        case 4:
          $("#angleDdescr").fadeOut(fadespd, case24());

          function case24() {
            setTimeout(function () {
              $("#angleEdescr").fadeIn(fadespd);
              $("#angleE").fadeIn(fadespd);
              bangles.removeRayStyles();
            }, 2000);
          }

          break;
        case 5:
          $("#angleEdescr").fadeOut(fadespd);
          $("#angleE").fadeOut(fadespd);

          function case25() {
            $("#angleFdescr").fadeIn(fadespd);
            $("#angleF").fadeIn(fadespd);
          }

          setTimeout(case25, 2000);

          break;
        case 6:
          $("#angleFdescr").fadeOut(fadespd);
          $("#angleF").fadeOut(fadespd, function () { $("#finish").fadeIn(fadespd); });
          break;

      }
      break;

    case 3:
      switch (nextPhase) {
        case 0:
          $("#angleBdescr").hide();
          $("#angleCdescr").hide();
          $("#angleDdescr").hide();
          $("#angleEdescr").hide();
          $("#angleFdescr").hide();
          $("#angleEmoveto").hide();
          $("#angleFmoveto").hide();
          $("#angleC").hide();
          $("#angleF").hide();
          $("#finish").hide();

          break;
        case 1:

          $("#problem_statement").fadeOut(fadespd, function () {
            $("#angleBdescr").fadeIn(fadespd, function () {
              bangles.removeRayStyles();
            });
          });
          break;
        case 2:

          $("#angleBdescr").fadeOut(fadespd, function () {
            $("#angleCdescr").fadeIn(fadespd);
            $("#angleC").fadeIn(fadespd, function () {
              bangles.removeRayStyles();
            });

          });
          break;
        case 3:
          $("#angleC").fadeOut(fadespd);
          $("#angleCdescr").fadeOut(fadespd, function () {
            $("#angleDdescr").fadeIn(fadespd);

          });
          break;
        case 4:

          $("#angleDdescr").fadeOut(fadespd, function () {
            $("#angleEdescr").fadeIn(fadespd, function () {
              bangles.removeRayStyles();
            });
          });
          break;

        case 5:

          $("#angleEdescr").fadeOut(fadespd, function () {
            $("#angleFdescr").fadeIn(fadespd);
            $("#angleF").fadeIn(fadespd, function () {
              bangles.removeRayStyles();
            });

          });

          break;
        case 6:
          $("#angleFdescr").fadeOut(fadespd);
          $("#angleF").fadeOut(fadespd, function () { $("#finish").fadeIn(fadespd); });
          break;

      }
      break;
  }
}


