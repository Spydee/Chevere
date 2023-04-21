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
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	audioCtx = new AudioContext();
	masterGainNode = audioCtx.createGain();
	masterGainNode.connect(audioCtx.destination);
	masterGainNode.gain.value = 0.4;
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
        myDebugger.write(-1, "There are " + jsondata.slides.length + " slides");
        for (const slide of jsondata.slides) {
            var slideTween = new gsapSlide(slide);
            this.gsapSlides.push(slideTween);
            for (const media of slide.media)
            {
                

            }
        }
        myDebugger.write(-1, "There are " + this.gsapSlides.length + " slides ready");
        

        var len = this.gsapSlides.length;
        console.log(len);
        
        this.gsapSlides[0].next = this.gsapSlides[1];
        for (let step = 1; step < len-1; step++) {
            this.gsapSlides[step].next = this.gsapSlides[step+1];
            this.gsapSlides[step].prev = this.gsapSlides[step-1];
        }
        this.gsapSlides[len-1].prev = this.gsapSlides[len-2];

        myDebugger.write(-1, "loading...")
           for (const slide of this.gsapSlides) {
               $(media_div)[0].appendChild(slide.target);
               masterTimeline.addLabel("slide" + slide.slideNo);
               masterTimeline.add(slide.timeline, ">-1.5");
        }

/*        for (var sl of this.gsapSlides) {
            myDebugger.write(-1, " current is " + sl.target.src);
            if (sl.next)
                myDebugger.write(-1, " next is " + sl.next.target.src);
            if (sl.prev)
                myDebugger.write(-1, " prev is " + sl.prev.target.src);
        } 
        */
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

	testAudio() {
        if (debugWriteEnable === false)
            return;
		let myAudio = $('.ht4f_audio');
		let s = "";
		myAudio.each(function (index, value) {
			$.each(myAudio.attr('class').split(' '), function(index, value) {
                s += value;
            });
			myDebugger.write(-1,"Media is : " + value.src);
			myDebugger.write(-1,"ClassList is : " + s + ' ');
		});

	}
	
    async play() {

        if (this.state == "paused") {
            this.resume();
            return;
        }

        if (this.state == "ended") {
            console.log("already at end");
            return;
        }
        myDebugger.write(-1,"Playing timelines");
        //this.playtimelines();
        masterTimeline.play(0);
         //  for (var slide of this.gsapSlides) {
         //     slide.play();
   // }
        this.updatePlayState("play");
        return;
        this.updatePlayState("play");

    }

    pause() {
        //    console.log('pause received');
/*        if (this.autoTimer != null)
            this.autoTimer.pause();
        this.myActiveSlide.pauseAll();
        for (const m of myaniarray) {
            m.pause();
        }
        const animations = document.querySelectorAll('.animation');
        animations.forEach(animation => {
            animation.style.animationPlayState = 'paused';
        })
*/
        masterTimeline.pause();
        //for (var slide of this.gsapSlides) {
        //    slide.pause();
        //}
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
        masterTimeline.pause(0);
    }

    prev() {
        masterTimeline.pause();
        for (var child of masterTimeline.getChildren()) {
            if (child.isActive) {
                child.seek(0);
            }
        }
//        masterTimeline.seek(4); //seek("slide3");
        this.updatePlayState("prev");
    }

    next() {
    }

    stop() {
        this.fullStop();
        this.updatePlayState("stop");
    }

    /**
     * called from timeout function
     * stop timers
     * check if at the end
     * transition and play slides
     * start next timeout timer
     */

    async autoNext() {
		//this.testAudio();
		//this.myActiveSlide.setMasterVolume(this.masterVolume);
        // if timer is stopped, prevent glitch caused by late timeout
        if (this.timerStop)
            return;

        this.stopAutoTimer();

        if (this.state === "ended") {  // shouldn't happen, but...
            return;
        }

        // get background music if it continues
        let bg = null;
        if (!this.myActiveSlide.bgEnds)
            bg = this.myActiveSlide.getBg();

        // stop all except bg (stop bg if it ends)
        this.myActiveSlide.stopAll(this.myActiveSlide.bgEnds);

        // on last slide?
        if (this.slidePlaying >= jsondata.slides.length) {
            if (bg)
                bg.stop();
            this.state = "ended";
            this.updatePlayState('ended');
            return;
        }

        this.slidePlaying += 1;
        this.updatePlayState("auto");

        // TRANSITION TO NEXT SLIDE
        console.log("\n\r audio level");
        this.myActiveSlide.updateBackground();
        console.log("\n\n\r\r audio level");
        this.ULE.dispatchEvent(new Event('transition-start'));
        await Promise.all([this.transition_out(), this.transition_in()]);
        //console.log("Initial loadSlide volume is " + this.masterVolume);

        $('.next').each(function () {
            $(this).addClass('current');
            $(this).removeClass('next');
        });
        this.ULE.dispatchEvent(new Event('transition-end'));

        this.myActiveSlide = this.myNextSlide;
        playGSAPanimation(this.slidePlaying);
        this.myActiveSlide.playNewMedia(false);

        //        await this.animation(this.myActiveSlide.mediaArray);

        if (bg != null) {
            this.myActiveSlide.mediaArray.push(bg);
        }

        this.setDuration();

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