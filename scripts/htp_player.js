
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
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();

        this.masterGainNode = null;
        this.audioInitialized = false;
        this.initAudioCtx();

    }

    initAudioCtx() {
        try {
            this.masterGainNode = this.audioCtx.createGain();
            this.masterGainNode.connect(this.audioCtx.destination);
            this.masterGainNode.gain.value = 0.4;
            this.audioInitialized = true;
        }
        catch(e) {
            myDebugger.log("$ERROR$ Failed to initialize audio context");
        }
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
                let tili = new slideTimeline(slide, this.slideJsonData, this.gsapJsonData, this.audioCtx, this.masterGainNode, "#ht4f_image_div");
                let tl = tili.createTimeline();
                this.gsapSlides.push(tili);
                tl.eventCallback( "onStart", this.updateText, [slide]);

                if (first) {
                    myDebugger.log("First slide");
                    this.masterTimeline.add(tl);
                    let pos = '<+' + slide.transition.tranin.duration;
                    this.masterTimeline.addLabel(slide.slideNo, pos);
                    
                    first = false;
                }
                else {
                    let pos = '>-' + slide.transition.tranin.to.duration;
                    this.masterTimeline.add(tl, pos);
                    myDebugger.log("GSAP slide time is " + this.masterTimeline.duration());
                    pos = '<+' + slide.transition.tranin.to.duration;
                    this.masterTimeline.addLabel(slide.slideNo, pos );
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
            this.updateText(this.slideJsonData.slides[0]);
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
        myDebugger.setMode(4);
        myDebugger.log("Starting play");
        if (this.state === "paused") {
            this.resume();
            return;
        }
        if (this.state === "ended") {
            myDebugger.log("already at end");
            return;
        }
        let allAudio = document.getElementsByTagName('audio');
        for (const a of allAudio) {
            a.play();
            a.pause();
        }


//        if (this.audioCtx === null) {
//            this.initAudioCtx();
//        }
        if (this.audioCtx.state === 'suspended')
            this.audioCtx.resume();

    //    myDebugger.log("Playing timelines");

        const curSlideLbl = this.masterTimeline.currentLabel();
        for (const sldTime of this.gsapSlides) {
            let sld = sldTime.getSlide();
            if (sld.slideNo === curSlideLbl) {
                for (const perp of sldTime.getPerpetuals()) {
                    if (perp.delay < 0){
                        myDebugger.log("Continue playing: " + perp.elem.src);
                        perp.elem.currentTime = perp.offsetTime;
                        sldTime.playAudio(perp.elem, this.audioCtx, this.masterGainNode);
                    }
                }
            }
        }
        this.masterTimeline.play();
        this.updatePlayState("play");
        return;
    }

    pause() {
        this.masterTimeline.pause();
        this.updatePlayState("pause");
        this.audioCtx.suspend();

        const curSlideLbl = this.masterTimeline.currentLabel();
        for (const sldTime of this.gsapSlides) {
            let sld = sldTime.getSlide();
            if (sld.slideNo === curSlideLbl) {
                for (const ele of sldTime.getPlaying()) {
                    myDebugger.log("Time: " + ele.currentTime + " for " + ele.src);

                }
            }
        }

    }

    resume() {
        this.masterTimeline.resume();
        this.audioCtx.resume();
        //        for (var slide of this.gsapSlides) {
//            slide.resume();
//        }
        this.updatePlayState("play");
        return;    

/*
        if (this.autoTimer != null)
            this.autoTimer.resume();
        this.myActiveSlide.resumeAll();

        for (const m of myaniarray) {
            m.resume();
        }
        */
        const animations = document.querySelectorAll('.animation');
        animations.forEach(animation => {
            animation.style.animationPlayState = 'running';
        })
        this.updatePlayState("play");
    }

    rewind() {
        this.masterTimeline.pause();
        this.masterTimeline.seek(0);
        this.masterTimeline.revert();
        this.updateText(this.slideJsonData.slides[0]);
    }

    prev() {
        this.masterTimeline.pause();
        this.audioCtx.suspend();
        const curSlideLbl = this.masterTimeline.currentLabel();
        for (const sldTime of this.gsapSlides) {
            let sld = sldTime.getSlide();
            if (sld.slideNo === curSlideLbl) {
                for (const ele of sldTime.getPlaying()) {
                    sldTime.stopAudio(ele);
                }
            }
        }

        const lbl = this.masterTimeline.previousLabel();
        if (lbl) {
            myDebugger.log("Seek to " + lbl);
            this.masterTimeline.seek(lbl);
            this.updatePlayState("prev");

            for (const sldTime of this.gsapSlides) {
                let sld = sldTime.getSlide();
                if (sld.slideNo === lbl) {
                    this.updateText(sldTime.getSlide());
                }
            }
        }
        this.updatePlayState("prev");
    }

    next() {
        this.masterTimeline.pause();
        this.audioCtx.suspend();
        const curSlideLbl = this.masterTimeline.currentLabel();
        for (const sldTime of this.gsapSlides) {
            let sld = sldTime.getSlide();
            if (sld.slideNo === curSlideLbl) {
                for (const ele of sldTime.getPlaying()) {
                    sldTime.stopAudio(ele);
                }
            }
        }
        const nextLbl = this.masterTimeline.nextLabel();
        if (nextLbl) {
            for (const sldTime of this.gsapSlides) {
                let sld = sldTime.getSlide();
                if (sld.slideNo === nextLbl) {
                    this.updateText(sldTime.getSlide());
                }
            }
            myDebugger.log("Seek to " + nextLbl);
            this.masterTimeline.seek(nextLbl);
        }
        this.updatePlayState("next");
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

    /**********************************
     * updateText
     * finds the heading/title assumed to be h2
     * changes the innerHTML
     * finds and removes all but the last paragraph
     * last paragraph is assumed to be ULEclear
     * adds new paragraphs before the ULEclear paragraph
     * if the paragraph is blank, add a blank placeholder
     **********************************/
    updateText(slide) {
        const content_section = "#ht4f_content_text";
        myDebugger.log("Updating content");
        let contentElem;
        let headingElem;
        let paragraphs;
        let myId;
        let myClass;

        try{
            contentElem = $(content_section)[0];
            if (!contentElem) {
                throw "Undefined contentElem in updatetext";
            }
            headingElem = contentElem.querySelector('h2');
            if (!headingElem) {
                throw "Undefined headingElem in updatetext";
            }
            paragraphs = contentElem.querySelectorAll('p');
            myId = paragraphs[0].id;
            myClass = paragraphs[0].className;
            for (var i = 0; i < paragraphs.length - 1; i++) {
                paragraphs[i].remove();
            }
        }
        catch (e) {
            myDebugger.log("$ERROR$ removing content at updateText " + slide.slideNo);
            myDebugger.log(e.message);
        }

        try {
            var newText = slide.content;
            myDebugger.log(slide.slideTitle);
            myDebugger.log(" text: " + newText[0]);

            headingElem.innerHTML = slide.slideTitle;

            if (newText === "" || newText === undefined) {
                var newP = document.createElement('p');
                newP.classList.add(myClass);
                contentElem.insertBefore(newP, contentElem.lastElementChild);
            }
            else {
                for (var para of newText) {
                    var newP = document.createElement('p');
                    newP.classList.add(myClass);
                    newP.innerHTML = para;
                    contentElem.insertBefore(newP, contentElem.lastElementChild);
                }
            }
        }
        catch(e) {
            myDebugger.log("$ERROR$ inserting content text for slide " + slide.slideNo);
            myDebugger.log(e.message);
        }
    }
    
}