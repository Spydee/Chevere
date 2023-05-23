
/***********************************************
 Player object
 media is an object with
 type = 'audio', image, video, animation
 an animated GIF also has a frame number associated with it
 start = time to start the media playing
 length = time it takes to run the media
 ***********************************************/
class player {

    constructor(slides, animations) {
        this.state = 'stopped';   /* stopped, playing, paused, ended */
        this.ULE = null;
        this.myActiveSlide = null;
        this.myNextSlide = null;
        this.gsapSlides = [];
		this.slideJsonData = slides;
        this.gsapJsonData = animations;
        this.masterTimeline = null;
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
        let searchPath = [this.slideJsonData.assetPath, this.slideJsonData.altPath, "."];
        myDebugger.setMode(4);
        myDebugger.log("Search paths are " + searchPath[0] + ", " + searchPath[1]);
        myDebugger.restoreMode();
        
        // GSAP timelines
        this.masterTimeline = gsap.timeline({paused:true});
        this.loadTimeLines();

    }

    // called from init() and rewind()
    loadTimeLines() {
        myDebugger.setMode(4);
        myDebugger.log("loading timeLines");
        myDebugger.setMode(0);

        try {
            $("#ht4f_image_div").empty();
            let first = true;
            for (const slide of this.slideJsonData.slides) {
                myDebugger.setMode(4);
                myDebugger.log("Preparing slide " + slide.slideNo);
                var tili = new slideTimeline(slide, this.slideJsonData, this.gsapJsonData, "#ht4f_image_div");

                if (first) {


                    myDebugger.log("First slide");
                    this.masterTimeline.add(tili.createTimeline());
                    this.masterTimeline.addLabel(slide.slideNo, '<+0.75');
                    first = false;
                }
                else {
                    this.masterTimeline.add(tili.createTimeline(), '>-0.75');
                    myDebugger.log("GSAP slide time is " + this.masterTimeline.duration());
                    this.masterTimeline.addLabel(slide.slideNo, '<+0.75' );
                }
                myDebugger.log("Label is " + slide.slideNo);
            }
        }
        catch(e) {
            myDebugger.setMode(4);
            myDebugger.log("$ERROR$ creating time line: " + e.message);
            myDebugger.restoreMode();

        }
        
        myDebugger.setMode(4);
        myDebugger.log('Verifying ...');
        if (this.masterTimeline.labels) {
            for (const p in this.masterTimeline.labels) {
                myDebugger.log(p + ":" + this.masterTimeline.labels[p]);
            }
        }
        else {
            myDebugger.log("No MasterTimeline labels");
        }
        myDebugger.restoreMode();
        try {
        tili.updateText(this.slideJsonData.slides[0]);
        this.masterTimeline.seek(0.75);
        }
        catch(e) {
            myDebugger.log(e.message);
        }
        myDebugger.restoreMode();
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
    //    myDebugger.log("Playing timelines");
        
        this.masterTimeline.play();
        this.updatePlayState("play");
        return;
    }

    pause() {
        this.masterTimeline.pause();
        this.updatePlayState("pause");
    }

    resume() {
        this.masterTimeline.resume();
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
        this.masterTimeline.pause();
        this.masterTimeline.seek(0);
    }

    prev() {
        this.masterTimeline.pause();
        const lbl = this.masterTimeline.previousLabel();
        if (lbl) {
            console.log("Seek to " + lbl);
            this.masterTimeline.seek(lbl);
        }
        this.updatePlayState("prev");
    }

    next() {
        myDebugger.setMode(4);
        myDebugger.log(" Next slide");
        this.masterTimeline.pause();
        const lbl =  this.masterTimeline.nextLabel();
        if (lbl) {
            myDebugger.log("Seek to " + lbl);
            this.masterTimeline.seek(lbl);
           this.updatePlayState("next");
        }
        myDebugger.restoreMode();
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
        //     "<br> slide time: " + this.slideJsonData.slides[this.slidePlaying-1].media[0].duration;

    };

    updateController(state) {
        if (state == 'playing')
            this.ULE.dispatchEvent(new Event('playing'));
        else
            this.ULE.dispatchEvent(new Event('paused'));
    };

}