$(document).ready(function () {
    /*** GLOBAL VARIABLES ****/
    media_div = "#ht4f_image_div";
    controller_div = ".ht4f_controlGroup";
    media_section = "#ht4f_graphics";
    content_section = "#ht4f_content_text";
    logSelector = '#debug';
    filterSelector = '#debugFilter';
    myDebugger = new debugLogger(logSelector, filterSelector);
	//myPlayer = null;
	 
	slideJSONfile = 'hightech4funSlides.json';
	animationJSONfile = 'hightech4funAnimations.json';

    async function start() {
		let slides = null;
		let anims = null;
     	xhrJ = $.get(slideJSONfile, function(data, status, xhr) {
			if (!data) {
				alert("Null results loading slide definition file in function start");
			}
			else {
				slides = data;
			}
	    }, "json").fail(function(data, status, xhr) { alert("Failed file load: " + slideJSONfile + " " + xhrJ.responseText) });

		let xhrA = $.get(animationJSONfile, function(data, status) {
			if (!data) {
				alert("Null results loading animation definition file in function start");
			}
			anims = data;
		}, "json").fail(function(data) { alert("Fail file load: " + animationJSONfile + " " + xhrA.responseText) });

		await Promise.all([xhrJ, xhrA]);
		myDebugger.setMode(4);
		myDebugger.log("json data files loaded");
		
		myPlayer = new player(slides, anims);
		myPlayer.init();

		let myController = new controller();
		myController.init();

	}
	
    start();
	
});
