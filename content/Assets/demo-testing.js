

window.onload = function () {

    bangles = new Protractor("demo", 800, 400, 800, 400);

    rayA = bangles.protRays[0];

    rayE = bangles.protRays[3];

    var angl = document.getElementById("angles");


    updateAngles();

    $("#incr_error").hide();
    $("#abd_error").hide();


}




function updateAngles() {
    document.getElementById("vABC").innerHTML = Math.round(bangles.angleABC);
    document.getElementById("mABD").value = Math.round(bangles.angleABD);
    document.getElementById("vEBC").innerHTML = Math.round(bangles.angleEBC);
    document.getElementById("vEBD").innerHTML = Math.round(bangles.angleEBD);
    document.getElementById("vABE").innerHTML = Math.round(bangles.angleABE);
}

function setLabels() {
    var curVal = bangles.compLabels;

    if (curVal == 3) {
        newVal = 0;
    } else {
        newVal = curVal + 1;
    }
    bangles.compLabels = newVal;
    document.getElementById("label_num").innerHTML = newVal;
    refreshLabels();
}

function setRads() {
    var curVal = bangles.radians;

    if (curVal == 3) {
        newVal = 0;
    } else {
        newVal = curVal + 1;
    }
    bangles.radians = newVal;
    document.getElementById("rad_num").innerHTML = newVal;
    refreshLabels();
}

function setIncr() {
    val = parseInt(document.getElementById("incr").value);
    $("#incr_error").hide();

    if (val < 10 || val > 90 || isNaN(val) || 180 % val != 0) {
        $("#incr_error").show();
    } else {
        bangles.interval = val;
        bangles.removeTicks();
        bangles.snaps = [];
        bangles.setSnaps();

        bangles.drawCompass();
        refreshLabels();
    }
}

function setABD() {
    val = parseInt(document.getElementById("mABD").value);
    $("#abd_error").hide();

    if (val < 0 || val > 180 || isNaN(val)) {
        $("#abd_error").show();
    } else {
        rayA.setPoint(val);
    }
}

function refreshLabels() {
    bangles.deleteLabels();
    bangles.drawLabels();
    bangles.drawLabelB();
}

function setSnap() {
    if (bangles.snap) {
        bangles.snap = false;
    } else {
        bangles.snap = true;
    }
}