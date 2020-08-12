

/**
 * My custom component
 */
var Protractor = function (aDescription, aX, aY, aWidth, aHeight) {
    // CTAT.Component.Base.SVG.call(this, "CTATProtractor", "aProtractor", aDescription, aX, aY, aWidth, aHeight);
    this.magnitude;
    this.numRays = 3;
    this.radians = 0;
    this.interval = 15;
    this.snap = false;
    this.snaps = [];
    this.compLabels = 2;
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

    var svgNS = "http://www.w3.org/2000/svg";  // convenience reference
    var selectedProtRay; //needed for event handlers

    // TODO this.setDefaultWidth, setDefaultHeight

    /*************** ProtRay Setup ***************/
	/**
	 * Private object for managing a protractor ray.
	 * 
     * there's a bunch of old stuff from CTAT numberline as a template for how to doc this
	 * @param {CTATProtractor} protractor	The protractor that contains the ProtRay(s).
	 * @param {String} name	    Name and label of the protray (B or E, practically)
	 * @param {Number} x	Starting horizontal position of the protray inside its parent (pixels offset from origin)
	 * @param {Number} y	Starting vertical position of the protray inside its parent (pixels offset from origin)
	 * @param {Boolean} move	Whether the protray can be moved by the user (defaults to true)
	 */

    function ProtRay(protractor, name, x, y, move = true) {
        this.protractor = protractor;
        this.name = name;
        this.point;
        this.ray;
        this.label;
        this.x = x;
        this.y = y;
        this.move = move;
        this.bd; // this corresponds to the base degree system, as well as angle ?BD for this protractor
        var self = this;

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
                // self.protractor._fgrays.append(this.point);
            }
            this.bd = this.getAngle();
        }

        // helper methods for ProtRay objects

        // necessary for the startDrag event in rayDrag
        this.point.getProtRay = function () {
            return self;
        }


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
        }


        this.getAngle = function () {
            // returns the current angle of the ProtRay, measured from left to right
            let x = this.point.getAttributeNS(null, 'cx');
            let y = this.point.getAttributeNS(null, 'cy');
            coord = { x: x, y: y };

            return this.protractor.calcAngle(coord);

        }

        this.reportAngles = function (finalAngle) {
            if (this.name == "A") {
                console.log("angle A should be changing angles now");
                this.protractor.angleABD = finalAngle;
                this.protractor.angleABC = 180 - finalAngle;
                if (this.protractor.numRays > 2) {
                    this.protractor.angleABE = Math.abs(finalAngle - this.getOpp().bd);
                }

            } else if (this.name == "E") {
                console.log("angle E should be changing angles now");
                this.protractor.angleEBD = finalAngle;
                this.protractor.angleEBC = 180 - finalAngle;
                this.protractor.angleABE = Math.abs(finalAngle - this.getOpp().bd);
            }
        }

        this.setPoint = function (angle) {
            // moves the ProtRay to a new angle, and animates the movement
            //FIXME there's a bug causing an infinite loop when this calls moveTo (setAttributeNS is receiving null)

            //BUG YOU NEED TO FIX REPORT ANGLES FOR THE MAIN PROTRACTOR FUNCTION; THE ELSE IF DIRECTLY BELOW
            // FAILS TO REPORT ANGLES WHEN IT ACTUALLY NEEDS TO DO SO!!!!
            // ALSO - NEED TO CHANGE THE condition in reportAngles to be this.protractor.numRays >2, not >3!!!

            // also you changed the definition of startAngle dood!  may not matter, but may!
            let startAngle = Math.floor(this.bd);
            let finalAngle = Math.floor(angle);

            let report = { "startAngle": startAngle, "finalAngle": finalAngle, "this.bd": this.bd, "getAngle": this.getAngle };
            console.log(report);

            // console.log("Start angle: " + startAngle);  //DBG startangle/finalAngle for setPoint
            // console.log("Final angle: " + finalAngle);

            let dir = true; // direction: true means travel clockwise, false means counterclockwise
            if (startAngle - finalAngle > 0) {
                dir = false;
            } else if (startAngle === finalAngle) {
                self.moveTo(self.protractor.getPointFromAnglitude(finalAngle, self.protractor.magnitude));
                this.reportAngles(finalAngle);
                return;
            }

            this.reportAngles(finalAngle);

            // let incr = Math.abs(startAngle - finalAngle);

            function animFrame(i) {
                setTimeout(function () {
                    incrAngle = self.protractor.getPointFromAnglitude(i, self.protractor.magnitude);
                    self.moveTo(incrAngle);
                    if (dir) { i++ } else { i-- };
                    if (i != finalAngle) {
                        animFrame(i);
                    } else {
                        self.moveTo(self.protractor.getPointFromAnglitude(finalAngle, self.protractor.magnitude));
                    }
                    7  // this is the time in ms between frames
                });
            }

            let i = startAngle;
            animFrame(i);

            // report the angle to the parent protractor

        }

        this.deactivateProtRay = function () {
            this.point.classList.add('unselectable');
            this.point.classList.remove('CTATProtractor--select');
        }

        this.reactivateProtRay = function () {
            this.point.classList.remove('unselectable');
            this.point.classList.add('CTATProtractor--select');
        }

        this.differentialProtrayMove = function (oppProtray, angle) {

            var currentDiff = this.bd - oppProtray.bd;
            var moveAngle = angle - Math.abs(currentDiff);

            var newAngle;

            console.log("Current Differential: " + currentDiff);

            if (Math.abs(moveAngle) < 1) {
                console.log("No diff movement needed; angle diff is appropriate");
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

        this.getOpp = function () {
            // only for the 2 protractor solution, not designed for custom names/protrays
            var opp;
            this.name === "A" ? opp = "E" : opp = "A";
            return this.protractor.findProtray(opp);
        }

        this.genInput = function () {
            var protrays = this.protractor.protRays.length;

            // if (protrays == 2) {
            //     return Math.round(180 - this.bd);
            // }

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
    // Number of protractor rays
    // this.setParameterHandler('raynum', function (numRays) {
    //     // TODO check to ensure that it's either 1 or 2
    //     if (this.getDivWrap()) { $(this.getDivWrap()).attr('numRays', numRays) }
    // });



    /*************** Event Handlers ******************/
    var handle_drag_start = function (evt) {
        if (evt.target.classList.contains('CTATProtractor--select')) {
            evt.preventDefault();
            this.removeRayStyles();
            selectedProtRay = evt.target.getProtRay();
            //console.log(selectedProtRay); // DBG on start drag, log the selected ray
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

            // console.log("End drag event:"); //DBG end drag coord log
            // console.log(angle);

            if (this.snap) {
                coord = this.getClosestSnap(coord);
            }
            var angle = Math.round(this.calcAngle(coord));
            selectedProtRay.setPoint(angle);

            input = selectedProtRay.genInput();
            // console.log(input);

            newinput = JSON.stringify(input);
            // console.log(newinput);

            // this.setActionInput("SpecifiedAngleSet", newinput);
            // this.processAction();

            updateAngles(); //this comes from the master demo-testing.js file

            selectedProtRay = null;
        }
    }.bind(this);


    this.getMousePosition = function (evt) {
        //something was fuggered here - with multiple protractors onscreen, this function is failing (not a function?)
        // the reference to First child is instead returning a text reference instead of the <svg>
        // maybe the result of multiple SVG namespaces being confused?

        //Maybe the fix is to change firstChild to firstElementChild?
        //There's some random blank <text> node being inserted before the SVG in the DOM?
        // first element child seems to be working!!
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
     * This function is called when CTAT initialized the tutor.
     * Its should initialize the component and add any entities or
     * custom event handlers needed to construct and use the component.
     */
    this.init = function () {
        // if there are any attributes to check, here is a good place to
        // check them.

        // construct your component here

        // this.initSVG();
        this.component = $("#canvas")[0];
        console.log(this.component);
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

        this.component.addEventListener('mousedown', handle_drag_start);
        this.component.addEventListener('mousemove', handle_drag);
        this.component.addEventListener('mouseup', handle_drag_end);


        let bbox = this.component.getBoundingClientRect();
        console.log(bbox);

        this.leftBound = Math.floor(bbox.width * .05);
        this.rightBound = Math.floor(bbox.width * .95);
        this.topBound = Math.floor(bbox.height * .05);
        this.bottomBound = Math.floor(bbox.width * .95);

        this.magnitude = Math.min(bbox.width * .4, bbox.height * 0.8);
        console.log("Magnitude: " + this.magnitude); //DBG Magnitude log
        this.origin.x = bbox.width / 2;
        this.origin.y = bbox.height / 2 + this.magnitude / 2;

        this.drawCompass();
        console.log("Here da init protrays"); //DBG init Protrays array
        this.addProtrays(this.numRays);
        console.log(this.protRays);
        this.protRays.forEach(function (item) { item.drawProtRay() })

        this.setSnaps();

        this.drawLabelB();
        this.drawLabels();

        console.log("Dafuq dis"); //DBG final protractor object
        console.log(this);



        // For example, this is where we add the textarea to the div
        // for CTATTextArea.
        // this.setComponent(div); // this should be the div used to define the
        // component in the interface or the entity added to make the
        // component. This decision often depends on if only a single entity
        // is added and it is a form like entity that responds to the
        // "disabled" attribute.

        var fontSize = 6 + this.magnitude * .04;
        this.component.style.fontSize = fontSize + "px";
        console.log(this.component.style.fontSize);
        console.log(this.component);

        // finish any initialization here.
        // this.setInitialized(true);
        // this.addComponentReference(this, div);
    };

    /**
     * This function is required to get a CTATSubmitButton to work
     * with your custom compontent.
     */
    this.updateSAI = function () {
        // you will replace 'Action' and 'Input' with the action
        // and input that will be sent to the tutor.
        this.setActionInput('Action', 'Input');
    };

    /**
     * 'Action': There needs to be a function with the same name
     * as any of the actions that the component emits. Each of
     * these functions should update the state of the component
     * to as if the action with the given input was just performed.
     * For example in CTATTextInput, it has the action "setText" which
     * has an input of a text string. Its "setText" method updates
     * the text in the input entity that was inserted in init.
     * @param Input - this function should be able to process the
     *  inputs that are emitted with the action
     */
    this.action = function (input) {
        // perform action with input
    };

    this.SpecifiedAngleSet = function (JSONangles) {

        //Input will specify 3 angles for each protray:
        //{"ABC": degree, "ABD": degree, "ABE": degree}
        // A: ABC, ABD, ABE
        // B: EBC, EBD, ABE
        // based on the argument, it will select the approtray, and move it there.

        var selectedProtRay;
        var selectedKey;
        var oppKey;
        var numRays = this.protRays.length;



        //If only a number is passed, it will move angle ABC only.
        if (!isNaN(parseInt(JSONangles))) {
            console.log("A number was passed as the Specified Angle Set argument; condition triggered."); //DBG numeric SpecifiedAngleSet trigger
            angle = parseInt(JSONangles);
            selectedProtRay = this.protRays[0];
            selectedProtRay.setPoint(180 - angle);
            return;
        } else {
            angles = JSON.parse(JSONangles);
        }



        if (numRays < 4) {
            selectedProtRay = this.protRays[0];
        } else {
            switch (Object.keys(angles)[0][0]) {
                case "A": selectedProtRay = this.findProtray("A"); selectedKey = "A"; oppKey = "E"; break;
                case "E": selectedProtRay = this.findProtray("E"); selectedKey = "E"; oppKey = "A"; break;
                default: console.log("Improper angle passed to SpecifiedAngleSet!"); console.log(JSONangles); return;
            }
        }


        //iterate through each possible key, starting with ?BC > ?BD > ?B?, and move based on that.
        if (angles[selectedKey + "BC"] != null) {
            selectedProtRay.setPoint(180 - angles[selectedKey + "BC"]);
            return;
        } else if (angles[selectedKey + "BD"] != null) {
            selectedProtRay.setPoint(angles[selectedKey + "BD"]);
            return;
        } else if (angles[selectedKey + "B" + oppKey] != null) {
            // The angle is actually defined as "ABE" for both, but which one moves depends on the first letter passed.
            selectedProtRay.differentialProtrayMove(this.findProtray(oppKey), angles[selectedKey + "B" + oppKey]);
        } else {
            console.log("Improper arguments passed to SpecifiedAngleSet!");
            console.log(JSONangles);
            return;
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

        // potential error here if there's multiple protrays with same name, need to guarantee names aren't repeated.
        // not doing this right now since protrays aren't added by user. 
        return protray;
    }


    this.setProtrays = function (numRays) {
        this.numRays = numRays;
        // 0 only gives ray A
        // 1 gives A and C
        // 2 gives A C D
        // 3+ gives ACDE
    }
    // this.setParameterHandler('protrays', this.setProtrays);
    // this.data_ctat_handlers['protrays'] = this.setProtrays;

    this.addProtrays = function (numRays) {

        // this runs on init, based on the value set in data-ctat-protrays
        // 0 only gives ray A
        // 1 gives A and C
        // 2 gives A C D
        // 3+ gives ACDE

        // always draw A and C, otherwise you're not really making any angles.
        var startA = 135;
        let coordA = this.getPointFromAnglitude(startA, this.magnitude);
        this.angleABD = startA;
        this.angleABC = 180 - startA;
        this.protRays.push(new ProtRay(this, 'A', coordA.x, coordA.y));


        if (numRays > 0) {
            let coordC = this.getPointFromAnglitude(180, this.magnitude);
            this.protRays.push(new ProtRay(this, 'C', coordC.x, coordC.y, false));
        }

        // allows for the second 'base' ray, like point D, that is unmovable but gives rise to angle3.
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

    this.removeProtrays = function () {
        this.protRays.forEach(function (item) {
            item.selfDestruct();
        })
    }


    /**
     * This is run during the generation of InterfaceDescription messages and
     * it generates interface actions for options set by the author in the
     * html code.
     * @returns {Array<CTATSAI>} of SAIs.
     */
    this.getConfigurationActions = function () {
        console.log("getConfigActions running!");  //DBG configActions running
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

        }// repeat if block for each of the parameters that
        // authors can manipulate.
        // As a reminder, custom attributes in html should have the
        // 'data-' prefix
        return actions;
    };

    // Add additional code such as event listeners that get the component to
    // work.

    /**
     * my_event_listener: some student action
     * Every gradable action should update the current SAI by calling
     * <instance>.setActionInput('Action',input); and
     * <instance>.processAction();
     */

    /*************** Compass Setup ***************/
    /**
    * These functions are used to draw the background compass 
    * 
    * createTick and createTicks generate the tickmarks that are on the compass
    * drawCompass creates the arc at the appropriate size, then adds the tickmarks.
    */

    this.setSnap = function (snapbool) {
        if (snapbool == "true") {
            this.snap = true;
        }
    }
    // this.setParameterHandler('snap', this.setSnap);
    // this.data_ctat_handlers['snap'] = this.setSnap;

    this.setInterval = function (interval) {

        if (180 % interval !== 0 || interval > 90) {
            console.log("Unacceptable value for data-ctat-interval set.  Value must evenly divide 180 degrees. Defaulting to 15.")
            return;
        }

        this.interval = interval;
    }
    // this.setParameterHandler('interval', this.setInterval);
    // this.data_ctat_handlers['interval'] = this.setInterval;

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

    this.removeTicks = function () {
        ticks = this._compass.children;
        length = ticks.length;

        for (i = length - 1; i >= 0; i--) {
            ticks[i].remove();
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

    this.setLabels = function (labelcode) {
        this.compLabels = labelcode;
    }
    // this.setParameterHandler('complabels', this.setLabels);
    // this.data_ctat_handlers['complabels'] = this.setLabels;

    this.setRadians = function (radcode) {
        this.radians = radcode;
        // 0 is degrees
        // 1 sets label set 1 to radians 
        // 2 sets label set 2 to radians
        // 3 sets both to radians
        // NOTE: radians only travel in one direction? (to allow for )
    }
    // this.setParameterHandler('radians', this.setRadians);
    // this.data_ctat_handlers['radians'] = this.setRadians;

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

    this.lookupRadians = function (degree) {

        //https://stackoverflow.com/questions/4652468/is-there-a-javascript-function-that-reduces-a-fraction
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
        } else if (this.radians == 2 || this.radians == 3 || (this.radians == 1 && this.compLabels == 1)) {
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

        angle = (Math.atan(rise / run)) * (180 / Math.PI);
        if (!acute) {
            angle = 180 - angle;
        }

        return angle;

    }

    this.getPointFromAnglitude = function (angle, magnitude) {
        // Takes an angle and magnitude from centerX,Y and returns the xy coord in the canvas for it.

        // x = this.origin.x - Math.floor((Math.cos(angle * Math.PI / 180) * magnitude)); //TODO change to acute/non-acute?
        // y = this.origin.y - Math.floor((Math.sin(angle * Math.PI / 180) * magnitude));
        x = this.origin.x - (Math.cos(angle * Math.PI / 180) * magnitude);
        y = this.origin.y - (Math.sin(angle * Math.PI / 180) * magnitude);
        coord = { x: x, y: y };
        return coord;
    }

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
                    angle = parseInt(inp);
                    selectedProtRay = this.protRays[0];
                    baseray = this.protRays[1];

                } else {
                    angles = JSON.parse(inp);
                    selectedProtRay = this.findProtray(Object.keys(angles)[0][0]);
                    baseray = this.findProtray(Object.keys(angles)[0][2]);
                }

                selectedProtRay.styleCorrect();
                baseray.styleCorrect();
                break;
            default: console.log("Shit's broke son."); break;
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
                    angle = parseInt(inp);
                    selectedProtRay = this.protRays[0];
                    baseray = this.protRays[1];

                } else {
                    angles = JSON.parse(inp);
                    selectedProtRay = this.findProtray(Object.keys(angles)[0][0]);
                    baseray = this.findProtray(Object.keys(angles)[0][2]);
                }

                selectedProtRay.styleIncorrect();
                break;
            default: console.log("Shit's broke son."); break;
        }

    }

    this.showHintHighlight = function (p_show, aSAI) {
        var inp = aSAI.getInput();
        var action = aSAI.getAction();
        var baseray;
        var selectedProtRay;

        switch (action) {
            case "SpecifiedAngleSet":
                //If only a number is passed, it will move angle ABC only.
                if (!isNaN(parseInt(inp))) {
                    angle = parseInt(inp);
                    selectedProtRay = this.protRays[0];
                    baseray = this.protRays[1];

                } else {
                    angles = JSON.parse(inp);
                    selectedProtRay = this.findProtray(Object.keys(angles)[0][0]);
                    baseray = this.findProtray(Object.keys(angles)[0][2]);
                }

                selectedProtRay.styleHint();
                baseray.styleHint();
                break;
            default: console.log("Hint's broke son."); break;
        }

    }

    this.init();

};

// Set up inheritance.
// // set the protractor prototype to an instance of the superclass prototype
// CTATProtractor.prototype = Object.create(CTAT.Component.Base.SVG.prototype);
// CTATProtractor.prototype.constructor = CTATProtractor;

// // Register the component: the first argument is the string used in the
// // class attribute of the div to indicate the type of component, the
// // second argument is the function defined above.
// CTAT.ComponentRegistry.addComponentType('CTATProtractor', CTATProtractor);