

window.onload = function () {

    bangles = this.CTATShellTools.findComponent('angles')[0];

    crayA = bangles.protRays[0];

    crayE = bangles.protRays[3];





    // assocRulesListener =
    // {
    //     processCommShellEvent: function (evt, msg) {

    //         // if ("AssociatedRules" != evt || !msg) {
    //         //     return;
    //         // }
    //         var indicator = msg.getIndicator();
    //         var sai = msg.getSAI();                               // selection-action-input from tutor engine
    //         var selection = (sai ? sai.getSelection() : "_noSuchComponent_");
    //         var comps = CTATShellTools.findComponent(selection);  // array of components with this name
    //         var component = (comps && comps.length ? comps[0] : null);
    //         console.log("Tutor's answer is " + sai.toString());
    //         if (component && "incorrect" == indicator.toLowerCase()) {
    //             console.log("Tutor's answer is " + sai.toString());
    //         }
    //     }
    // };

    // CTATCommShell.commShell.addGlobalEventListener(assocRulesListener);
}

