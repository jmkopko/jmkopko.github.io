
/*
//TODO implement these googs as needed for deployment
goog.provide('CTATProtractor');
goog.require('CTATGlobals');
goog.require('CTATGlobalFunctions');
goog.require('CTAT.Component.Base.SVG');
goog.require('CTAT.Component.Base.Tutorable');
goog.require('CTAT.ComponentRegistry');
goog.require('CTATSAI');

*/

var CTATProtractor = function (aDescription, aX, aY, aWidth, aHeight) {
    CTAT.Component.Base.SVG.call(this, "CTATProtractor", "aProtractor", aDescription, aX, aY, aWidth, aHeight);
    this.magnitude;
    this.numRays = 1;       //defaults to only one moveable ray A.
    this.radians = 0;       //defaults to no radian values.
    this.interval = 15;     //defaults to 15 degree interval.
    this.snap = false;      //snapping off by default.
    this.snaps = [];
    this.compLabels = 2;    //defaults to the inner labels and angle ABC.
    this.protRays = [];
    this.origin = { x: null, y: null };
    this.leftBound;     // Bounds are so that ray drags do not fall outside the SVG canvas
    this.rightBound;
    this.topBound;
    this.bottomBound;


    //all possible angles in a standard protractor; these angles are explicitly set in addProtrays, and updated in Protray.setPoint
    this.angleEBD;
    this.angleABE;
    this.angleEBC;
    this.angleABC;
    this.angleABD;

    var svgNS = CTATGlobals.NameSpace.svg;  // convenience reference
    var selectedProtRay; //needed for event handlers


    /*************** ProtRay Setup ***************/
	/**
	 * Private object for managing a protractor ray.
	 * Protractor Rays (aka protrays) are the lines that eminate from the protractor origin and allow interaction.
	 * @param {CTATProtractor} protractor	The protractor that contains the ProtRay(s).
	 * @param {String} name	    Name and label of the protray
	 * @param {Number} x	Starting horizontal position of the protray inside its parent (pixels offset from origin)
	 * @param {Number} y	Starting vertical position of the protray inside its parent (pixels offset from origin)
	 * @param {Boolean} move	Whether the protray can be moved by the user (defaults to true)
	 */

    function ProtRay(protractor, name, x, y, move = true) {
        this.protractor = protractor;  //Parent CTATProtractor
        this.name = name;
        this.point;     //reference to SVG object at end of ray; 'grabbable' on movable protrays
        this.ray;       //reference to SVG line beginning at origin and ending at point
        this.label;     //reference to SVG text that travels alongside of this.point
        this.x = x;     // x position of center of this.point
        this.y = y;     // y position of center of this.point
        this.move = move;   //is this a movable protray? (A and E are, C and D are not)
        this.bd; // this corresponds to the base degree system, as well as angle ?BD for this protractor
        var self = this;  // used in animation callback for setPoint.

        this.createProtRay = function () {
            // this creates the necessary svg elements, adds them to the canvas and gives their refs to ProtRay object

            label = document.createElementNS(svgNS, "text");
            if (move) {
                label.setAttributeNS(null, 'x', this.x + self.protractor.magnitude * .09);
                label.setAttributeNS(null, 'y', this.y);
            } else {
                label.setAttributeNS(null, 'x', this.x);
                label.setAttributeNS(null, 'y', this.y + self.protractor.magnitude * .09);
            }
            label.classList.add("CTATProtractor--labelray");
            label.appendChild(document.createTextNode(this.name));

            ray = document.createElementNS(svgNS, "line");
            ray.setAttributeNS(null, 'id', 'ray_' + this.name);
            ray.setAttributeNS(null, 'x1', self.protractor.origin.x);
            ray.setAttributeNS(null, 'y1', self.protractor.origin.y);
            ray.setAttributeNS(null, 'x2', this.x);
            ray.setAttributeNS(null, 'y2', this.y);


            point = document.createElementNS(svgNS, "circle");
            point.setAttributeNS(null, 'id', 'point_' + this.name);
            point.setAttributeNS(null, 'cx', this.x);
            point.setAttributeNS(null, 'cy', this.y);
            point.setAttributeNS(null, 'r', 4 + self.protractor.magnitude * .005);


            self.point = point;
            self.ray = ray;
            self.label = label;

        }
        this.createProtRay();  // call it on object instantiation

        this.drawProtRay = function () {
            if (this.move) {
                this.point.classList.add("CTATProtractor--select");
                self.protractor._protrays.append(this.label);
                self.protractor._protrays.append(this.ray);
                self.protractor._protrays.append(this.point);
            } else {
                self.protractor._fgrays.append(this.label);
                self.protractor._fgrays.append(this.ray);
                // self.protractor._fgrays.append(this.point);  //not needed for static protrays
            }
            this.bd = this.getAngle();
        }

        // helper methods for ProtRay objects

        // necessary for the startDrag event to find the protray.
        this.point.getProtRay = function () {
            return self;
        }

        /*
         *Protray Movement Methods 
         */


        this.moveTo = function (coord) {
            // moves all of the component pieces to a coordinate
            this.point.setAttributeNS(null, 'cx', coord.x);
            this.point.setAttributeNS(null, 'cy', coord.y);
            this.ray.setAttributeNS(null, 'x2', coord.x);
            this.ray.setAttributeNS(null, 'y2', coord.y);
            this.label.setAttributeNS(null, 'y', coord.y);

            if (coord.x >= this.protractor.origin.x) {
                this.label.setAttributeNS(null, 'x', coord.x + self.protractor.magnitude * .07);
            } else {
                this.label.setAttributeNS(null, 'x', coord.x - self.protractor.magnitude * .07);
            }

            this.bd = this.getAngle();
            this.reportAngles(this.bd);
        }


        this.setPoint = function (set_angle) {
            // moves the ProtRay to a new angle, and animates the movement
            //FIXME there's a bug causing an infinite loop when this calls moveTo (setAttributeNS is receiving null)

            let startAngle = Math.floor(this.getAngle());
            let finalAngle = Math.floor(set_angle);

            // console.log("Start angle: " + startAngle);  //DBG startangle/finalAngle for setPoint
            // console.log("Final angle: " + finalAngle);

            let dir = true; // direction: true means travel clockwise, false means counterclockwise
            if (startAngle - finalAngle > 0) {
                dir = false;
            } else if (startAngle == finalAngle) {
                self.moveTo(self.protractor.getPointFromAnglitude(finalAngle, self.protractor.magnitude));
                return;
            }

            let frame = 11;

            function animFrame(i) {
                setTimeout(function () {
                    incrAngle = self.protractor.getPointFromAnglitude(i, self.protractor.magnitude);
                    self.moveTo(incrAngle);
                    if (dir) { i++ } else { i-- };
                    if (i != finalAngle) {
                        setTimeout(function () { animFrame(i); }, frame);
                    } else {
                        setTimeout(function () { self.moveTo(self.protractor.getPointFromAnglitude(finalAngle, self.protractor.magnitude)); }, frame)
                    }
                    frame  // this is the time in ms between frames
                });
            }

            let i = startAngle;
            animFrame(i);

        }

        this.differentialProtrayMove = function (oppProtray, set_angle) {

            var currentDiff = this.bd - oppProtray.bd;
            var moveAngle = set_angle - Math.abs(currentDiff);

            var newAngle;

            if (Math.abs(moveAngle) < 1) {
                return false;
            } else {
                if (currentDiff < 0) {  // current protray is to the left of oppProtray 
                    newAngle = this.bd - moveAngle;
                    if (newAngle < 0 || newAngle > 180) {
                        newAngle = oppProtray.bd + moveAngle;
                        if (newAngle < 0 || newAngle > 180) {
                            console.log("New angle ABE not possible with Ray " + this.name);
                            return false;
                        }
                    }
                } else {                // current protray is to the right of oppProtray
                    newAngle = this.bd + moveAngle;
                    if (newAngle < 0 || newAngle > 180) {
                        newAngle = oppProtray.bd - moveAngle;
                        if (newAngle < 0 || newAngle > 180) {
                            console.log("New angle ABE not possible with Ray " + this.name);
                            return false;
                        }
                    }
                }
            }

            this.setPoint(newAngle);
            return true;

        }

        /* Protray Movement helper functions */

        this.getOpp = function () {
            // only for the 2 protractor solution, not designed for custom names/protrays
            var opp;
            this.name === "A" ? opp = "E" : opp = "A";
            return this.protractor.findProtray(opp);
        }

        this.reportAngles = function (finalAngle) {
            // report the angle to the parent protractor
            if (this.name === "A") {
                this.protractor.angleABD = finalAngle;
                this.protractor.angleABC = 180 - finalAngle;
                if (this.protractor.numRays > 2) {
                    this.protractor.angleABE = Math.abs(finalAngle - this.getOpp().bd);
                }

            } else if (this.name === "E") {
                this.protractor.angleEBD = finalAngle;
                this.protractor.angleEBC = 180 - finalAngle;
                this.protractor.angleABE = Math.abs(finalAngle - this.getOpp().bd);
            }
        }


        this.getAngle = function () {
            // returns the current angle of the ProtRay, measured from left to right
            let x = this.point.getAttributeNS(null, 'cx');
            let y = this.point.getAttributeNS(null, 'cy');
            coord = { x: x, y: y };

            return this.protractor.calcAngle(coord);

        }


        // This generates the Input value for the "SpecifiedAngleSet" Action
        this.genInput = function () {
            var protrays = this.protractor.protRays.length;

            var input = {};
            input[this.name + "BC"] = Math.round(180 - this.bd);
            if (protrays > 2) {
                input[this.name + "BD"] = Math.round(this.bd);
            }
            if (protrays > 3) {
                opp = this.getOpp();
                input[this.name + 'B' + opp.name] = Math.round(Math.abs(this.bd - opp.bd));
            }
            return input;
        }

        /* Miscellaneous functions to help with styling and selection */

        this.deactivateProtRay = function () {
            this.point.classList.add('unselectable');
            this.point.classList.remove('CTATProtractor--select');
        }

        this.reactivateProtRay = function () {
            this.point.classList.remove('unselectable');
            this.point.classList.add('CTATProtractor--select');
        }

        this.styleCorrect = function () {
            this.deStyle();
            this.ray.classList.add('CTATProtractor--correct');
        }
        this.styleIncorrect = function () {
            this.deStyle();
            this.point.classList.add('CTATProtractor--incorrect');
            this.ray.classList.add('CTATProtractor--incorrect');
        }
        this.styleHint = function () {
            this.deStyle();
            this.point.classList.add('CTATProtractor--hint');
            this.ray.classList.add('CTATProtractor--hint');
        }

        this.deStyle = function () {
            this.point.classList.remove('CTATProtractor--correct');
            this.point.classList.remove('CTATProtractor--incorrect');
            this.point.classList.remove('CTATProtractor--hint');

            this.ray.classList.remove('CTATProtractor--correct');
            this.ray.classList.remove('CTATProtractor--incorrect');
            this.ray.classList.remove('CTATProtractor--hint');
        }


    }



    /*************** Component Parameters ******************/

    /**
    * This is run during the generation of InterfaceDescription messages and
    * it generates interface actions for options set by the author in the
    * html code.
    * @returns {Array<CTATSAI>} of SAIs.
    */
    this.getConfigurationActions = function () {
        var actions = [];
        var $div = $(this.getDivWrap());
        if ($div.attr('data-ctat-protrays')) {
            var sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setProtrays');
            sai.setInput($div.attr('data-ctat-protrays'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-complabels')) {
            var sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setLabels');
            sai.setInput($div.attr('data-ctat-complabels'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-radians')) {
            var sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setRadians');
            sai.setInput($div.attr('data-ctat-radians'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-interval')) {
            var sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setInterval');
            sai.setInput($div.attr('data-ctat-interval'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-snap')) {
            var sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setSnap');
            sai.setInput($div.attr('data-ctat-snap'));
            actions.push(sai);
        }
        return actions;
    };

    this.setProtrays = function (numRays) {
        this.numRays = numRays;
        // 0 only gives ray A
        // 1 gives A and C
        // 2 gives A C D
        // 3+ gives ACDE
    }
    this.setParameterHandler('protrays', this.setProtrays);
    this.data_ctat_handlers['protrays'] = this.setProtrays;

    this.setSnap = function (snapbool) {
        //sets snapping for the protractor
        if (snapbool == "true") {
            this.snap = true;
        }
    }
    this.setParameterHandler('snap', this.setSnap);
    this.data_ctat_handlers['snap'] = this.setSnap;

    this.setInterval = function (interval) {

        if (180 % interval !== 0 || interval > 90) {
            console.log("Unacceptable value for data-ctat-interval set.  Value must evenly divide 180 degrees. Defaulting to 15.")
            return;
        }

        this.interval = interval;
    }
    this.setParameterHandler('interval', this.setInterval);
    this.data_ctat_handlers['interval'] = this.setInterval;

    this.setLabels = function (labelcode) {
        this.compLabels = labelcode;
    }
    this.setParameterHandler('complabels', this.setLabels);
    this.data_ctat_handlers['complabels'] = this.setLabels;

    this.setRadians = function (radcode) {
        this.radians = radcode;
        // 0 is degrees
        // 1 sets label set 1 to radians 
        // 2 sets label set 2 to radians
        // 3 sets both to radians
    }
    this.setParameterHandler('radians', this.setRadians);
    this.data_ctat_handlers['radians'] = this.setRadians;


    /*************** Event Handlers ******************/
    var handle_drag_start = function (evt) {
        if (evt.target.classList.contains('CTATProtractor--select')) {
            evt.preventDefault();
            this.removeRayStyles();
            selectedProtRay = evt.target.getProtRay();
        }
    }.bind(this);

    var handle_drag = function (evt) {
        if (selectedProtRay) {
            evt.preventDefault();
            var coord = this.getMousePosition(evt);
            if (coord.x < this.leftBound) { coord.x = this.leftBound; };
            if (coord.x > this.rightBound) { coord.x = this.rightBound; };
            if (coord.y < this.topBound) { coord.y = this.topBound; };
            if (coord.y > this.bottomBound) { coord.y = this.bottomBound; };

            if (this.snap) {
                selectedProtRay.moveTo(this.getClosestSnap(coord));
            } else {
                selectedProtRay.moveTo(coord);
            }

        }
    }.bind(this);

    var handle_drag_end = function (evt) {
        if (selectedProtRay) {
            var coord = this.getMousePosition(evt);

            if (this.snap) {
                coord = this.getClosestSnap(coord);
            }
            var new_angle = Math.round(this.calcAngle(coord));
            selectedProtRay.setPoint(new_angle);

            sas_input = selectedProtRay.genInput();

            sas_newinput = JSON.stringify(sas_input);

            this.setActionInput("SpecifiedAngleSet", sas_newinput);
            this.processAction();

            selectedProtRay = null;
        }
    }.bind(this);

    /* Event Handler helper functions */

    this.getMousePosition = function (evt) {
        var CTM = this.component.firstElementChild.getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        }
    }

    this.removeRayStyles = function () {
        // runs during handle-drag start to remove certain highlights.
        this.protRays.forEach(function (item) {
            item.deStyle();
        });
    }


    /**
     * CTAT Protractor initialization
     */
    this.init = function () {
        var div = this.getDivWrap();

        // Create the SVG element, and add the needed group elements to it.
        this.initSVG();
        this.component.classList.add('CTATProtractor--container');
        this._compass = document.createElementNS(svgNS, 'g');
        this._compass.classList.add('CTATProtractor--compass', 'unselectable');
        this._labels = document.createElementNS(svgNS, 'g');
        this._labels.classList.add('CTATProtractor--labels', 'unselectable');
        this._protrays = document.createElementNS(svgNS, 'g');
        this._protrays.classList.add('CTATProtractor--protrays');
        this._fgrays = document.createElementNS(svgNS, 'g');
        this._fgrays.classList.add('CTATProtractor--fgrays', 'unselectable');

        this.component.appendChild(this._compass);
        this.component.appendChild(this._labels);
        this.component.appendChild(this._protrays);
        this.component.appendChild(this._fgrays);

        // Add the event listeners.
        this.component.addEventListener('mousedown', handle_drag_start);
        this.component.addEventListener('mousemove', handle_drag);
        this.component.addEventListener('mouseup', handle_drag_end);

        // Dimension the SVG based on its parent size.
        let bbox = this.getBoundingBox();

        this.leftBound = Math.floor(bbox.width * .05);
        this.rightBound = Math.floor(bbox.width * .95);
        this.topBound = Math.floor(bbox.height * .05);
        this.bottomBound = Math.floor(bbox.width * .95);

        // Dimension and position the protractor itself within the SVG
        this.magnitude = Math.min(bbox.width * .4, bbox.height * 0.8);
        this.origin.x = bbox.width / 2;
        this.origin.y = bbox.height / 2 + this.magnitude / 2;

        // Draw the protractor, create protrays based on the initial elements, and add them to the SVG.
        this.drawCompass();
        this.addProtrays(this.numRays);
        this.protRays.forEach(function (item) { item.drawProtRay() })

        // Set snapping points in case snaps are turned on.
        this.setSnaps();

        // Draw the labels 
        this.drawLabelB();
        this.drawLabels();

        // console.log("CTAT Protractor object on next line"); //DBG final protractor object
        // console.log(this);

        this.setComponent(div);
        this.setFontSize();


        // finish any initialization here.
        this.setInitialized(true);
        this.addComponentReference(this, div);
    };


    /**
     * SpecifiedAngleSet
     * Primary action for the CTATProtractor, defines moving protrays around the interface and setting them
     * at a particular angle. 
     * 
     * @param {JSON} JSONangles	A specifically formatted string of a JS object where the key is the angle name, and the value is the angle measure.
     * 
     * JSONangles specifies up to 3 angles for each protray:
     * {"ABC": degree, "ABD": degree, "ABE": degree}
     * A: ABC, ABD, ABE
     * B: EBC, EBD, ABE
     * 
     * When generated from the interface, JSONangles will contain 2 or 3 of the angles desired.
     * When matching for correctness, only the first angle specified will be considered.
     */

    this.SpecifiedAngleSet = function (JSONangles) {

        var selectedProtRay;  // Protray object being moved/set
        var selectedKey;      // Key of object being moved/set (either "A" or "E")
        var oppKey;           // Key of protray opposite the protray being moved/set (either "A" or "E", opposite of selectedKey)

        //TODO consider separate processInputString for SpecifiedAngleSet AND hint/error/correct hightlighting

        // If only a number is passed, it will move Protray A/angle ABC only.
        if (!isNaN(parseInt(JSONangles))) {
            specified_angle = parseInt(JSONangles);
            selectedProtRay = this.protRays[0];
            selectedProtRay.setPoint(180 - specified_angle);
            return;
        } else {
            specified_angles = JSON.parse(JSONangles);
        }

        // If protray E is not in the protractor, automatically select A.
        if (this.protRays.length < 3) {
            selectedProtRay = this.protRays[0];
            selectedKey = "A";
        } else {
            //grab the first letter of the first angle specified in the JSON input; designates the targeted protray.
            selectedKey = Object.keys(specified_angles)[0][0];
            if (selectedKey == "A") {
                selectedProtRay = this.findProtray("A");
                oppKey = "E";
            } else if (selectedKey == "E") {
                selectedProtRay = this.findProtray("E");
                oppKey = "A";
            } else {
                console.log("Improper angle name passed to SpecifiedAngleSet!"); console.log(JSONangles); return;
            }
        }

        var targetedAngle;
        //iterate through each possible key, starting with ?BC -> ?BD -> ?B?, and move based on that.
        // we test for null in each case to help with correct highlighting -
        //      Correct highlighting works based on "replace student input with..." a specific angle measure.
        //      If we merely want to check if a value is in range, but not move it from the student's position afterward,
        //      we pass 'null' as the value of the angle we are concerned with.  Otherwise it will just default to 
        //      ?BC of whatever protray was moved.

        if (specified_angles[selectedKey + "BC"]) {
            targetedAngle = selectedKey + "BC";
            if (specified_angles[targetedAngle] != null) {
                selectedProtRay.setPoint(180 - specified_angles[selectedKey + "BC"]);
            } else {
                console.log('ABC null return');
                return;
            }

        } else if (specified_angles[selectedKey + "BD"]) {
            targetedAngle = selectedKey + "BD";
            if (specified_angles[targetedAngle] != null) {
                selectedProtRay.setPoint(specified_angles[selectedKey + "BD"]);

            } else {
                return;
            }

        } else if (specified_angles[selectedKey + "B" + oppKey]) {
            // The angle is actually defined as "ABE" in the protractor object, but which protray moves depends on the first letter passed.
            targetedAngle = selectedKey + "B" + oppKey;
            if (specified_angles[targetedAngle] != null) {
                selectedProtRay.differentialProtrayMove(this.findProtray(oppKey), specified_angles[selectedKey + "B" + oppKey]);
            } else {
                return;
            }

        } else {
            console.log("Improper or null arguments passed to SpecifiedAngleSet.");  //DBG specified angle set bottom-out failure
            console.log("Argument passed: " + JSONangles);
            // console.log(specified_angles);
            // console.log(selectedKey);
            // console.log(Object.keys(specified_angles));
            // console.log(Object.keys(specified_angles)[0]);
            // console.log(Object.keys(specified_angles)[0][0]);
        }
    };

    this.findProtray = function (name) {
        // utility function to find a protray object by giving its name as a string
        var protray;
        this.protRays.forEach(function (item) {
            if (item.name === name) {
                protray = item;
            }
        });

        // potential error here if there's multiple protrays with same name.
        // not doing this right now since protrays aren't added by user, but if they can be created, need to guarantee names aren't repeated.
        return protray;
    }

    this.addProtrays = function (numRays) {
        // this runs on init, based on the value set in data-ctat-protrays
        // 0 only gives ray A
        // 1 gives A and C
        // 2 gives A C D
        // 3+ gives ACDE

        // always draw A at least, so there's something in the interface.
        var startA = 135;
        let coordA = this.getPointFromAnglitude(startA, this.magnitude);
        this.angleABD = startA;
        this.angleABC = 180 - startA;
        this.protRays.push(new ProtRay(this, 'A', coordA.x, coordA.y));

        if (numRays > 0) {
            let coordC = this.getPointFromAnglitude(180, this.magnitude);
            this.protRays.push(new ProtRay(this, 'C', coordC.x, coordC.y, false));
        }

        // allows for the second 'base' ray, like point D, that is unmovable but gives rise to angles ?BD.
        if (numRays > 1) {
            let coordD = this.getPointFromAnglitude(0, this.magnitude);
            this.protRays.push(new ProtRay(this, 'D', coordD.x, coordD.y, false));
        }

        if (numRays > 2) {
            var startE = 45
            let coordE = this.getPointFromAnglitude(startE, this.magnitude);
            this.angleEBD = startE;
            this.angleEBC = 180 - startE;
            this.angleABE = Math.abs(startA - startE);
            this.protRays.push(new ProtRay(this, 'E', coordE.x, coordE.y));
        }
    }

    /*************** Compass Setup ***************/
    /**
    * These functions are used to draw the background compass
    * 
    * createTick and createTicks generate the tickmarks that are on the compass
    * drawCompass creates the arc at the appropriate size, then adds the tickmarks.
    */

    this.createTick = function (coord1, coord2) {
        tick = document.createElementNS(svgNS, "line");
        tick.setAttributeNS(null, 'x1', coord1.x);
        tick.setAttributeNS(null, 'y1', coord1.y);
        tick.setAttributeNS(null, 'x2', coord2.x);
        tick.setAttributeNS(null, 'y2', coord2.y);
        tick.classList.add("CTATProtractor--ticks");

        return tick;
    }

    this.createTicks = function () {

        intrv = this.interval;

        for (j = intrv; j <= 179; j += intrv) {
            coord1 = this.getPointFromAnglitude(j, this.magnitude * .97);
            coord2 = this.getPointFromAnglitude(j, this.magnitude * 1.03);
            this._compass.appendChild(this.createTick(coord1, coord2));
        }
    }

    this.drawCompass = function () {
        compass = document.createElementNS(svgNS, "path");
        compass.setAttributeNS(null, 'd', "M " + this.origin.x + " " + this.origin.y +
            "H " + (this.origin.x + this.magnitude) +
            " A " + this.magnitude + " " + this.magnitude + " 0 0 0 " + (this.origin.x - this.magnitude) + " " + this.origin.y +
            " H " + this.origin.x);
        this._compass.appendChild(compass);
        this.createTicks();
    }

    /*************** Label Setup ***************/
    /**
    * These functions are used to draw angle labels on top of the compass
    */

    this.resetLabels = function (labelcode) {
        this.compLabels = parseInt(labelcode);
        this.getDivWrap().setAttribute("data-ctat-complabels", labelcode);
        this.redrawLabels();
    }

    this.setFontSize = function () {
        // min font size of 6, scale up as magnitude increases.
        var fontSize = 6 + this.magnitude * .04;
        this.component.style.fontSize = fontSize + "px";
    }

    this.resetRadians = function (radcode) {
        this.radians = parseInt(radcode);
        this.getDivWrap().setAttribute("data-ctat-radians", labelcode);
        this.redrawLabels();
    }

    this.createLabel = function (x, y, text, htmlclass) {
        label = document.createElementNS(svgNS, "text");
        label.setAttributeNS(null, 'x', x);
        label.setAttributeNS(null, 'y', y);
        label.setAttributeNS(null, 'class', htmlclass);
        label.appendChild(document.createTextNode(text));
        this._labels.appendChild(label);
    }

    this.drawLabelB = function () {
        // This is the label for the origin point; different from all the other labeling of the compass.
        this.createLabel(this.origin.x, this.origin.y + this.magnitude * .1, 'B', 'CTATProtractor--labelB');
    }

    this.drawLabels = function () {

        //TODO change drawLabel90 so that it can go above/below the line
        // also, just have it called from inside draw label 1 and 2?
        //      --Nah, doesn't make anything easier or more comprehensible, plus they're already pretty complicated.
        // find a way to prevent it from being duplicated tho; if radians = 0 or 3 

        //FIXME man, these if/cases for the 90 interval are kinda incomprehensible.  It's all to make it so that you don't
        //      have a redundant 90 label, which was a feature of the original Flash tutor.  Probably a way to refactor this and
        //      make it more comprehensible.

        var showLabels = this.compLabels;

        if (90 % this.interval == 0) {
            if (showLabels == 3 && (this.radians == 1 || this.radians == 2)) {
                this.drawLabel90("top");
            }
            if (showLabels > 0) {
                this.drawLabel90();
            }
        }

        switch (showLabels) {
            case 1: this.drawLabel1(); break;
            case 2: this.drawLabel2(); break;
            case 3: this.drawLabel1(); this.drawLabel2(); break;
        }
    }

    this.redrawLabels = function () {
        this.deleteLabels();
        this.drawLabels();
        this.drawLabelB();
    }

    this.lookupRadians = function (degree) {
        // Provides the radian strings for radian labels.  Could also be used if we wanted text inputs in radians.
        // reduce() source: https://stackoverflow.com/questions/4652468/is-there-a-javascript-function-that-reduces-a-fraction
        // I really should know this.
        function reduce(numerator, denominator) {
            var gcd = function gcd(a, b) {
                return b ? gcd(b, a % b) : a;
            };
            gcd = gcd(numerator, denominator);
            return [numerator / gcd, denominator / gcd];
        }

        var fraction = reduce(degree, 180);
        var numerator = fraction[0];

        if (fraction[0] === 0) {
            return '0';
        } else if (fraction[0] === 1) {
            numerator = "";
        }

        if (fraction[1] === 1) {
            return "π";
        }

        return numerator + "π/" + fraction[1];

    }

    //TODO should come up with and set a standard magnitude multiplier based on radian code, and an offset multiplier based on
    // magnitude (offset multiplier is used in coord.x-this.origin.x * multiplier in code below)
    // maybe its own method, uses this.radians and whether it's label1 or label2 to convert coords passed in?

    // drawLabel1 handles the "outer" labels.
    this.drawLabel1 = function () {
        var rads = false;
        if (this.radians == 1 || this.radians == 3) {
            rads = true;
        }

        var intrv;
        (this.interval < 10) ? intrv = this.interval * 2 : intrv = this.interval;


        for (j = 0; j <= 180; j += intrv) {
            if (j !== 90) {
                coord = this.getPointFromAnglitude(j, this.magnitude * 1.1);
                if (rads) {
                    this.createLabel(coord.x + (coord.x - this.origin.x) * .05, coord.y + 5, this.lookupRadians(180 - j), 'set1');
                } else {
                    this.createLabel(coord.x, coord.y + 5, j, 'set1');
                }

            }

        }
    }

    // drawLabel2 handles the "inner" labels.
    this.drawLabel2 = function () {
        var rads = false;
        if (this.radians == 2 || this.radians == 3) {
            rads = true;
        }

        var intrv;
        (this.interval < 10 || this.interval < 15 && rads) ? intrv = this.interval * 2 : intrv = this.interval;

        for (j = 0; j <= 180; j += intrv) {
            if (j !== 90) {
                if (j === 0 || j === 180) {
                    coord = this.getPointFromAnglitude(j, this.magnitude * 0.9);
                    if (rads) {
                        this.createLabel(coord.x, coord.y - 5, this.lookupRadians(j), 'set2');
                    } else {
                        this.createLabel(coord.x, coord.y - 5, 180 - j, 'set2');
                    }

                } else {
                    coord = this.getPointFromAnglitude(j, this.magnitude * 0.9);
                    if (rads) {
                        this.createLabel(coord.x - (coord.x - this.origin.x) * .07, coord.y, this.lookupRadians(j), 'set2');
                    } else {
                        this.createLabel(coord.x, coord.y, 180 - j, 'set2');
                    }

                }
            }
        }

    }

    this.drawLabel90 = function (location = "bottom") {
        var rad = false;
        var mag = this.magnitude * 0.88;
        if (location == "top") {
            mag = this.magnitude * 1.05;
            if (this.radians == 1) {
                rad = true;
            }
        } else if ((this.radians == 2 && this.compLabels > 1) || this.radians == 3 || (this.radians == 1 && this.compLabels == 1)) {
            rad = true;
        }


        coord = this.getPointFromAnglitude(90, mag);
        var text;
        if (rad) {
            text = this.lookupRadians(90);
        } else { text = '90'; }
        this.createLabel(coord.x, coord.y, text, 'CTATProtractor--label90');
    }


    this.hideLabels = function (labelset) {

        if (labelset == 1) {
            $(".set1").hide();
        } else if (labelset == 2) {
            $(".set2").hide();
        } else {
            $(".set1").hide();
            $(".set2").hide();
            $(".CTATProtractor--label90").hide();
        }
    }

    this.deleteLabels = function () {
        labels = this._labels.children;
        length = labels.length;

        for (i = length - 1; i >= 0; i--) {
            labels[i].remove();
        }
    }

    /*************** Angle Helpers ***************/
    /**
    * These functions are used to convert angles and (x, y) points back and forth
    */

    this.calcAngle = function (newCoords) {
        // Takes a set of (x,y) coordinates, and returns an angle in degrees based on the origin of protractor
        let x = newCoords.x;
        let y = newCoords.y;

        var rise;
        var run;
        var acute = true;

        // account for which side of the protractor x is on
        if (x <= this.origin.x) {
            run = this.origin.x - x;
        } else {
            run = x - this.origin.x;
            acute = false;
        }
        // limit y so that it only measures 'above' the protractor base
        if (y <= this.origin.y) {
            rise = this.origin.y - y;
        } else {
            rise = 0;
        }

        calcd_angle = (Math.atan(rise / run)) * (180 / Math.PI);
        if (!acute) {
            calcd_angle = 180 - calcd_angle;
        }

        return calcd_angle;

    }

    this.getPointFromAnglitude = function (inp_angle, magnitude) {
        // Takes an angle and magnitude from centerX,Y and returns the xy coord in the canvas for it.

        x = this.origin.x - (Math.cos(inp_angle * Math.PI / 180) * magnitude);
        y = this.origin.y - (Math.sin(inp_angle * Math.PI / 180) * magnitude);
        coord = { x: x, y: y };
        return coord;
    }

    /* Snapping helpers for when snapping is turned on */

    this.setSnaps = function () {
        for (i = 0; i <= 180; i += this.interval) {
            this.snaps.push(i);
        }
    }

    this.getClosestSnap = function (coord) {
        var curAngle = this.calcAngle(coord);
        var index = this.snaps.findIndex(function (currentValue) {
            if (curAngle <= currentValue) {
                return true;
            }
        });

        var botSnap = this.snaps[index - 1];
        var topSnap = this.snaps[index];

        if ((topSnap - curAngle) >= (curAngle - botSnap)) {
            return this.getPointFromAnglitude(botSnap, this.magnitude);
        } else {
            return this.getPointFromAnglitude(topSnap, this.magnitude);
        }

    }

    /*************** Correct/Incorrect Highlighting ***************/
    /**
    * Determines which protrays to highlight when correct/incorrect values received
    */
    //TODO need to handle non-highlighting input for tutor-performed actions

    this.showCorrect = function (aSAI) {
        var inp = aSAI.getInput();
        var action = aSAI.getAction();
        var baseray;
        var selectedProtRay;

        switch (action) {
            case "SpecifiedAngleSet":
                //If only a number is passed, it will move angle ABC only.
                if (!isNaN(parseInt(inp))) {
                    showcorrect_angle = parseInt(inp);
                    selectedProtRay = this.protRays[0];
                    baseray = this.protRays[1];

                } else {
                    showcorrect_angles = JSON.parse(inp);
                    selectedProtRay = this.findProtray(Object.keys(showcorrect_angles)[0][0]);
                    baseray = this.findProtray(Object.keys(showcorrect_angles)[0][2]);
                }

                selectedProtRay.styleCorrect();
                baseray.styleCorrect();
                break;
            default: console.log("Correct highlight's broke son."); break;
        }

    }

    this.showInCorrect = function (aSAI) {
        var inp = aSAI.getInput();
        var action = aSAI.getAction();
        var baseray;
        var selectedProtRay;

        switch (action) {
            case "SpecifiedAngleSet":
                //If only a number is passed, it will move angle ABC only.
                if (!isNaN(parseInt(inp))) {
                    showincorrect_angle = parseInt(inp);
                    selectedProtRay = this.protRays[0];
                    baseray = this.protRays[1];

                } else {
                    showincorrect_angles = JSON.parse(inp);
                    selectedProtRay = this.findProtray(Object.keys(showincorrect_angles)[0][0]);
                    baseray = this.findProtray(Object.keys(showincorrect_angles)[0][2]);
                }

                selectedProtRay.styleIncorrect();
                break;
            default: console.log("Incorrect highlight's broke son."); break;
        }

    }

    this.showHintHighlight = function (p_show, aSAI) {
        if (aSAI) {
            var inp = aSAI.getInput();
            var action = aSAI.getAction();
        }
        var baseray;
        var selectedProtRay;

        switch (action) {
            case "SpecifiedAngleSet":
                //If only a number is passed, it will assume angle ABC.
                if (!isNaN(parseInt(inp))) {
                    showhint_angle = parseInt(inp);
                    selectedProtRay = this.protRays[0];
                    baseray = this.protRays[1];

                } else {
                    showhint_angles = JSON.parse(inp);

                    selectedProtRay = this.findProtray(Object.keys(showhint_angles)[0][0]);
                    baseray = this.findProtray(Object.keys(showhint_angles)[0][2]);
                }

                selectedProtRay.styleHint();
                baseray.styleHint();
                break;
            default: //console.log("Hint's broke son.  Or maybe not; hint unhighlighting triggers this error msg."); 
                break;
        }

    }



};

// Set up inheritance.
// set the protractor prototype to an instance of the superclass prototype
CTATProtractor.prototype = Object.create(CTAT.Component.Base.SVG.prototype);
CTATProtractor.prototype.constructor = CTATProtractor;

// Register the component: the first argument is the string used in the
// class attribute of the div to indicate the type of component, the
// second argument is the function defined above.
CTAT.ComponentRegistry.addComponentType('CTATProtractor', CTATProtractor);