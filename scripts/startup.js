$(document).ready(function () {
    /*** GLOBAL VARIABLES ****/
    media_div = "#ht4f_image_div";
    const controller_div = ".ht4f_controlGroup";
    const media_section = "#ht4f_graphics";
    const content_section = "#ht4f_content_text";
    const logSelector = "#debug";
    const filterSelector = "#debugFilter";
    myDebugger = new debugLogger(logSelector, filterSelector);
	//myPlayer = null;
	 
	const slideJSONfile = "hightech4funSlides.json";
	const animationJSONfile = "hightech4funAnimations.json";

    async function start() {
		let slides = null;
		let anims = null;
     	let xhrJ = $.get(slideJSONfile, function(data, status, xhr) {
			if (!data) {
				alert("Null results loading slide definition file in function start");
			}
			else {
				slides = data;
			}
	    }, "json").fail(function(data, status, xhr) { alert("Failed file load: " + slideJSONfile + " " + xhrJ.responseText); });

		let xhrA = $.get(animationJSONfile, function(data, status) {
			if (!data) {
				alert("Null results loading animation definition file in function start");
			}
			anims = data;
		}, "json").fail(function(data) { alert("Fail file load: " + animationJSONfile + " " + xhrA.responseText); });

		await Promise.all([xhrJ, xhrA]);
		myDebugger.setMode(4);
		myDebugger.log("json data files loaded");
		
		const myPlayer = new player(slides, anims);
		myPlayer.init();

		const myController = new controller();
		myController.init();

    }

    start();
	
});
