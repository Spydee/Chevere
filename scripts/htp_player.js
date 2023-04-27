/*********************************************
 ready function
 *********************************************/
$(document).ready(function () {

    /*** GLOBAL VARIABLES ****/
    /* may be put somewhere else */
    media_div = "#ht4f_image_div";
    controller_div = ".ht4f_controlGroup";
    media_section = "#ht4f_graphics";
    content_section = "#ht4f_content_text";
    myDebugger = new debugWriter();
    debugMask = 5;
	defaultDebugMode = 4;
    myDebugger.write(-1, "Debug initialized");
    myPlayer = null;
    searchPath = null;
    myaniarray = [];
	
	jsondata = "";
	gsapDefinitions = "";
	
	/* Audio API Global context */
//	const AudioContext = window.AudioContext || window.webkitAudioContext;
//	audioCtx = new AudioContext();
//	masterGainNode = audioCtx.createGain();
//	masterGainNode.connect(audioCtx.destination);
//	masterGainNode.gain.value = 0.4;
  masterTimeline = gsap.timeline({paused:true});
		
	SLIDE_DURATION_OFF = -1;	// duration = -1
	SLIDE_DELAY_OFF = -1;		// DELAY=-1
	
	
	async function loadJson(slideJSON, animationJSON) {
     //   myDebugger.write(1,"Fetching json data");
		var xhrA = $.get(animationJSON, function(data, status) {
			gsapDefinitions = data;
	//		myDebugger.write(1,"gsapDefinitions loaded");
		}).fail(function(data) { alert("error loading gsapDefinitons " + xhrA.responseText)});

		xhrJ = $.get(slideJSON, function(data, status, xhr) {
			jsondata = data;
	//		myDebugger.write(1,"now jsondata = " + jsondata.title);
		}, 'json').fail(function(data, status, xhr) { handleJsonLoadErrors(status, xhr); });
	
		try {
			await Promise.all([xhrA, xhrJ]);
			ht4f_player_start();
			console.log("All json definition files loaded");
		}
		catch (e) {
		}
	}

	function handleJsonLoadErrors(status, xhrResp) {
		jsondata = {
		"title": "Unable to load JSON file",
		"version": "0.0",
		"assetPath": "media/",
		"altPath": "animations/",
		"slides": [{
				"slideNo": "1",
				"slideTitle": "Slide data load error",
				"animations": [],
				"media": [ {
					"tag": "img",
					"classLst": [
					   "ht4f_image",
					   "ht4f_aspect_ratio",
					   "background"
					],
					"text":"default.jpg"
				}]
		}]};
		var strcont = "Error Status:"+status;
		var content = [strcont, xhrResp];
		jsondata.slides[0].content = content;
		ht4f_player_start();
	}

	loadJson(slideJSONfile, animationJSONfile);
    function ht4f_player_start() {

        /*
          The player starts from this function
          Make sure you have a DIV element with ID of ht4f_graphics

          This creates and initializes the player and controller objects
          (myPlayer is global for ease of debugging)
        */

		//debugger must come first
		console.log("Starting player: title = " + jsondata.title);

        myPlayer = new player();
        myPlayer.init();

        let myController = new controller();
        myController.init();
		
    }
});

let debugWriteEnable = true;
class debugWriter{

	constructor() {
	}
		
	write(mode, message) {
			// mode = -1 : use global debugLogMode
			// mode = 0: no output
			// mode = 1: use console,log
			// mode = 2: use alert
			// mode = 3 use alert AND console
			// mode = 4: use debug html Area
		if (debugWriteEnable === false)
        return;
            if (mode === -1)
			mode = defaultDebugMode; // global
		mode &= debugMask;
		switch (mode) {
			case 1: console.log(message);
				break;
			case 2: alert(message);
				break;
			case 3: console.log(message);
					alert(message);
				break;
			case 4: this.writeHTML(message);
                break;
			default: break;
		}
	}
    writeHTML(message) {
        const debugDiv = $('#debug');
        if (debugDiv) {
            var newP = document.createElement("p");
            //debugSec.children('p')[0].innerHTML += message;
            newP.innerHTML = message;
            debugDiv[0].appendChild(newP);
        }


    }

}


/***********************************************
 Player object
 media is an object with
 type = 'audio', image, video, animation
 an animated GIF also has a frame number associated with it
 start = time to start the media playing
 length = time it takes to run the media
 ***********************************************/
class player {

    constructor() {
        this.state = 'stopped';   /* stopped, playing, paused, ended */
        this.ULE = null;
        this.myActiveSlide = null;
        this.myNextSlide = null;
        this.gsapSlides = [];
    }

    /*********************************************************
     * INIT
     *   add event listeners
     *   load first slide
     *********************************************************/
    init() {
        this.ULE = document.getElementById("ht4f_div_graphics");
        this.ULE.addEventListener('play', () => this.play());
        this.ULE.addEventListener('pause', () => this.pause());
        this.ULE.addEventListener('prev', () => this.prev());
        this.ULE.addEventListener('next', () => this.next());
        this.ULE.addEventListener('rewind', () => this.rewind());
        this.ULE.addEventListener('volumeChanged', function (e) {
            masterGainNode.gain.value = (e.detail.volume);
        });
        //    this.ULE.addEventListener('full',  () => console.log('full') );
        searchPath = [jsondata.assetPath, jsondata.altPath, "."];
        // set up global settings
        this.loadTimeLines();
    }

    // called from init() and rewind()
    loadTimeLines() {
        $(media_div).empty();
        let first = true;
        for (const slide of jsondata.slides) {
            myDebugger.write(-1, "Preparing slide " + slide.slideNo);
            var tili = new slideTimeline(slide);

            if (first) {
                masterTimeline.add(tili.createTimeline());
                masterTimeline.addLabel("slide_" + slide.slideNo, '<+0.75');
                first = false;
            }
            else {
                masterTimeline.add(tili.createTimeline(), '>-0.75');
                masterTimeline.addLabel("slide_" + slide.slideNo, '<+0.75' );
            }
            myDebugger.write(-1, "Label is " + "slide_" + slide.slideNo);
            console.log(tili);
        }
        masterTimeline.seek(0.75);
    }


    // called from prev() and next()
    loadSlide(slideno, playstate) {
        // short delay to allow any current activity to end
        setTimeout(function () {
            $(media_div).empty();
            this.myActiveSlide = new ht4f_slide(slideno, jsondata.slides[slideno - 1], true);
            this.myActiveSlide.preLoad("current");
            this.myActiveSlide.updateText();
            this.slidePlaying = slideno;
            this.updatePlayState(playstate);
            myDebugger.write(-1, 'Loaded slide ' + slideno);
        }.bind(this), 100);
    }

    stopAutoTimer() {
    }

    fullStop() {

    }

    checkAutoPlay() {
        return 1;
    }

    transition_out() {
    }

    transition_in() {

    }


    /************************************************
     * CONTROLLER FUNCTIONS
     * **********************************************/

    // Play or Resume from Pause

    play() {

        if (this.state == "paused") {
            this.resume();
            return;
        }

        if (this.state == "ended") {
            console.log("already at end");
            return;
        }
        myDebugger.write(-1,"Playing timelines");
        
        masterTimeline.play();
        this.updatePlayState("play");
        return;
    }

    pause() {
        masterTimeline.pause();
        this.updatePlayState("pause");
    }

    resume() {
        masterTimeline.resume();
        for (var slide of this.gsapSlides) {
            slide.resume();
        }
        this.updatePlayState("play");
        return;    


        if (this.autoTimer != null)
            this.autoTimer.resume();
        this.myActiveSlide.resumeAll();

        for (const m of myaniarray) {
            m.resume();
        }
        const animations = document.querySelectorAll('.animation');
        animations.forEach(animation => {
            animation.style.animationPlayState = 'running';
        })
        this.updatePlayState("play");
    }

    rewind() {
        masterTimeline.pause();
        masterTimeline.seek(0);
    }

    prev() {
        masterTimeline.pause();
        const lbl = masterTimeline.previousLabel();
        if (lbl) {
            console.log("Seek to " + lbl);
            masterTimeline.seek(lbl);
        }
        this.updatePlayState("prev");
    }

    next() {
        masterTimeline.pause();
        const lbl =  masterTimeline.nextLabel();
        if (lbl) {
            console.log("Seek to " + lbl);
            masterTimeline.seek(lbl);
           this.updatePlayState("next");
        }
    }

    stop() {
        this.fullStop();
        this.updatePlayState("stop");
    }


    updatePlayState(event) {
        switch (event) {
            case "prev":
            case "next":
            case "rewind":
            case "stop":
                this.state = "stopped";
                break;
            case "play":
            case "auto":
                this.state = "playing";
                break;
            case "pause":
                this.state = "paused";
                break;
            case "ended":
                this.state = "ended";
                break;
            default:
                this.state = event;
        }

        this.updateController(this.state);

        // $('#playState')[0].innerHTML =  "event: " + event +
        //     "<br>playState: " + this.state +
        //     "<br>slidePlaying: " + this.slidePlaying +
        //     "<br> slide time: " + jsondata.slides[this.slidePlaying-1].media[0].duration;

    };

    updateController(state) {
        if (state == 'playing')
            this.ULE.dispatchEvent(new Event('playing'));
        else
            this.ULE.dispatchEvent(new Event('paused'));
    };

}