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
	myDebugger = null;
    myPlayer = null;
    searchPath = null;
    myaniarray = [];
	deviceSupportsVolume = true;
	jsondata = "";
	gsapDefinitions = "";
	
	
	async function loadJson(slideJSON, animationJSON) {
		console.log("Fetching json data");
		var xhrA = $.get(animationJSON, function(data, status) {
			gsapDefinitions = data;
			console.log("now gsapDefinitions loaded");
		}).fail(function(data) { alert("error loading gsapDefinitons " + xhrA.responseText)});

		xhrJ = $.get(slideJSON, function(data, status, xhr) {
			jsondata = data;
			console.log("now jsondata = " + jsondata.title);
		}, 'json').fail(function(data, status, xhr) { handleJsonLoadErrors(status, xhr); });
	
		try {
			await Promise.all([xhrA, xhrJ]);
			ht4f_player_start();
			console.log("all loaded");
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
		myDebugger = new debugWriter();
		debugMode = 4;
		myDebugger.write(-1, "Debug initialized");

        myPlayer = new player();
        myPlayer.init();

        let myController = new controller();
        myController.init();
		
    }
});

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
		if (mode === -1)
			mode = debugMode; // global
		switch (mode) {
			case 1: console.log(message);
				break;
			case 2: alert(message);
				break;
			case 3: console.log(message);
					alert(message);
				break;
			case 4: 
			default: break;
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
        this.slidePlaying = 1;    /* current slide (no longer 0 based) */

        this.timerStop = true;
        this.ULE = null;
        this.autoTimer = null;
        this.myActiveSlide = null;
        this.myNextSlide = null;
        this.masterVolume = 0.1;
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
            myPlayer.setMasterVolume(e.detail.volume);
        });
        //    this.ULE.addEventListener('full',  () => console.log('full') );
        searchPath = [jsondata.assetPath, jsondata.altPath];

		deviceSupportsVolume = this.supportsVolume();
		if (deviceSupportsVolume !== true) {
			jsondata.assetPath = "";
			alert("Your device does not support volume control");
		}
		else
			myDebugger.write(-1, "Volume supported");
			
		$("h2.PresTitle").innerHTML = jsondata.title;
		
        this.loadFirstSlide();
    }

	supportsVolume() {
		//return false;
//		var elem = document.getElementById('debug');
		const tstAudio = document.createElement("audio");
		if (tstAudio) {
			tstAudio.src = jsondata.assetPath + "/blank.mp3";
		//	myDebugger.write(-1, testAudio.src);
		}
			
		var currVol = tstAudio.volume;
		tstAudio.volume = 0.5;
		var testVol = tstAudio.volume;
		tstAudio.volume = currVol;
		if (testVol === 1.0)
			return false;
		else if (testVol === 0.5)
			return true;
		else
			myDebugger.write(-1, "Error testing volume: is " + testVol + ". Should be 0.5" );
	}
	
    setMasterVolume(volume) {
        this.masterVolume = volume;
        if (this.myActiveSlide != null) {
            this.myActiveSlide.setMasterVolume(volume);
            myDebugger.write(-1, "Master volume set to " + this.masterVolume);
        }
        else
            myDebugger.write(-1, "No active slide defined");
    }

    // called from init() and rewind()
    loadFirstSlide() {
        this.loadSlide(1, "rewind");
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
            myDebugger.write(1, 'Loaded slide ' + slideno);
        }.bind(this), 100);
    }

    stopAutoTimer() {
        if (this.autoTimer != null)
            this.autoTimer.clear();
        this.autoTimer = null;
    }

    fullStop() {
        this.timerStop = true;
        this.stopAutoTimer();
        this.myActiveSlide.stopAll(true);
        for (const m of myaniarray) {
            m.pause();
            m.seek(0);
        }

    }

    checkAutoPlay() {
        return 1;
        /*
        let ap = document.getElementById("autoPlay");
        if (!ap)
            return 0;
        else if (ap.checked)
            return 1;
        return 0;
        */
    }

    transition_out() {

        return new Promise(function (resolve, reject) {
            $('.current').each(function () {
                if ($(this).data('duration') !== -1)
                    if (this.tagName === "IMG" || this.tagName === "VIDEO" || this.tagName === "DIV")
                        $(this).animate($(this).data('tranout'), "slow");
            });
            $('.current').promise().done(function () {
                $('.current').each(function () {
                    if ($(this).data('duration') !== -1) {
						console.log("Removing " + this.src);
                        $(this).remove();
					}
                });
                resolve();
            });
        });
    }

    transition_in() {
        return new Promise(function (resolve, reject) {
            // console.log('begin in');
            $('.next').each(function () {
                if ((this.tagName === "IMG" || this.tagName === "VIDEO") && $(this).data('tranin'))
                    $(this).css($(this).data('trancss')).animate($(this).data('tranin'), "slow");
            });
            $('.next').promise().done(function () {
                resolve();
            });
        });
    }


    setDuration() {
        let duration = 0;
		const med = jsondata.slides[this.slidePlaying - 1].media;
        for (const m of med) {
            try {
                if (m.delay + m.duration > duration)
                    duration = m.delay + m.duration;
            }
            catch {
                duration = 5000;
            }
        }
        myDebugger.write(0,'Duration: ' + duration);
        this.autoTimer = new ht4f_timer(() => this.autoNext(), duration);

        if (this.checkAutoPlay()) {
            // preload next slide
            if (this.slidePlaying < jsondata.slides.length) {
                this.myNextSlide = new ht4f_slide(this.slidePlaying + 1, jsondata.slides[this.slidePlaying], false);
                this.myNextSlide.preLoad('next');
				//this.myNextSlide.setMasterVolume(this.masterVolume);
                myDebugger.write(1,'Preloaded slide ' + (this.slidePlaying + 1));
            }
        }
    }


    /************************************************
     * CONTROLLER FUNCTIONS
     * **********************************************/

    // Play or Resume from Pause

	testAudio(source) {
		console.log("Audio test at " + source);
		let myAudio = $('.ht4f_audio');
		myAudio.each(function (index, value) {
			if (value.paused) {
				console.log(value.src + " is paused at time " + value.currentTime);
			}
			else {
				console.log(value.src + " is playing at time " + value.currentTime + ": volume is " + value.volume);
			}
			console.log("ClassList is : " + myAudio.attr('class'));
//			$.each(myAudio.attr('class').split(' '), function(index, value) {
  //              s += value + ' ';
    //        });

		});

	}
	
    async play() {
		this.myActiveSlide.setMasterVolume(this.masterVolume);
        if (this.state == "paused") {
            this.resume();
            return;
        }

        if (this.state == "ended") {
            console.log("already at end");
            return;
        }

        // play from stopped
        this.timerStop = false;
        this.updatePlayState("play");

        //console.log("Initial loadSlide volume is " + this.masterVolume);
        //this.myActiveSlide.setMasterVolume(this.masterVolume);

        this.myActiveSlide.playNewMedia(true);
        playGSAPanimation(this.slidePlaying);

        this.setDuration();
		this.testAudio("end of play event");
    }

    pause() {
        //    console.log('pause received');
        if (this.autoTimer != null)
            this.autoTimer.pause();
        this.myActiveSlide.pauseAll();
        for (const m of myaniarray) {
            m.pause();
        }
        const animations = document.querySelectorAll('.animation');
        animations.forEach(animation => {
            animation.style.animationPlayState = 'paused';
        })
        this.updatePlayState("pause");
    }

    resume() {
        //    console.log('resume received');
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
        this.fullStop();
        this.loadFirstSlide();
        this.updatePlayState("rewind");
    }

    prev() {
        this.fullStop();
        if (this.slidePlaying <= 1) {
            console.log("already at beginning");
            this.updatePlayState("prev");
        }
        else
            this.loadSlide(this.slidePlaying - 1, "prev");
    }

    next() {
        this.fullStop();
        if (this.slidePlaying >= jsondata.slides.length) {
            console.log("already at end");
            this.updatePlayState("next");
        }
        else
            this.loadSlide(this.slidePlaying + 1, "next");
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
		this.testAudio(" beginning of autoNext");
		this.myActiveSlide.setMasterVolume(this.masterVolume);
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
		if (this.myActiveSlide.bgEnds)
			console.log();
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
        this.ULE.dispatchEvent(new Event('transition-start'));
        await Promise.all([this.transition_out(), this.transition_in()]);
        console.log("Initial loadSlide volume is " + this.masterVolume);
        //this.myActiveSlide.setMasterVolume(this.masterVolume);

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
		this.testAudio(" end of autoNext");
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