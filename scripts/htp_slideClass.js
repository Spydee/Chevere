class ht4f_timer {
    constructor(callback, delay) {
        this.callback = callback;
        this.remaining = delay;
        this.resume();
    }

    pause() {
        this.paused = true;
        window.clearTimeout(this.id);
        this.remaining -= new Date() - this.start;
    }

    resume() {
        this.paused = false;
        this.start = new Date();
        window.clearTimeout(this.id);
        if (this.remaining > 0)
            this.id = window.setTimeout(this.callback, this.remaining);
    }

    clear() {
        window.clearTimeout(this.id);
    }

}


class ht4f_mediaClass {

    // the constructor takes two parameters
    //      myMedia_ is the JSON definition data for the media
    //      oldElem is an existing DOM element whose source is already defined and probably playing
    // if oldElem is null, a new DOM element is created
    // 
    // defineMedia takes the JSON data and adds or changes the dataset data
    // this scheme allows the DOM element to be self dependent
    constructor(myMedia_, oldElem) {

        this.tag = myMedia_.tag;
        this.filename = myMedia_.text;
        if (oldElem) {
            this.elem = oldElem;
            this.gainNode = $(this.elem).data("gainNode");
            if (!this.gainNode)
                alert("Can't set gainNode for " + this.filename);
        }
        else {
            this.elem = document.createElement(myMedia_.tag);
            this.gainNode = null;
        }
        //this.elem.src = myMedia_.text;
        if (myMedia_.transition)
            this.transition = myMedia_.transition;
        this.delay = myMedia_.delay;
        this.delaytimer = null;
        this.duration = myMedia_.duration;
        this.durationtimer = null;
        this.status = '';
        this.playStart = null;     // when the play button is pressed
        this.actualStart = null;   // when the play actually started
        this.actualEnd = null;     // when the play actually ended
		this.ajaxFileFind = null;
        this.defineMedia(myMedia_);
    }

    defineMedia(myMedia_) {
        var classList = "";
        for (const cl of myMedia_.classLst) {
            classList += cl + " ";
            // this.elem.classList.add(cl);
        }

		//myDebugger.write(1, "Building " + this.filename);

        if (myMedia_.style)
            this.elem.setAttribute("style", myMedia_.style);
        if (myMedia_.animation_name)
            this.elem.dataset.animation_name = myMedia_.animation_name;
        if (myMedia_.delay) {
            this.delay = myMedia_.delay;
            this.elem.dataset.delay = myMedia_.delay;
        }
        if (myMedia_.duration) {
            this.duration = myMedia_.duration;
            this.elem.dataset.duration = myMedia_.duration;
        }

        this.elem.classList = classList;
        if (this.delay < 0) {
            this.elem.classList.add("nopreload");
        }

        if (this.duration < 0) {
            this.elem.classList.add("keep");
            //myDebugger.write(3, "Keeping " + myMedia_.text);
        }

        if (myMedia_.offsetTime)
            this.elem.dataset.offsetTime = myMedia_.offsetTime;

        if ( (myMedia_.tag === "audio") || (myMedia_.tag === "video") ) {
            if (myMedia_.volume) {
				this.elem.dataset.volume = myMedia_.volume;
			}
			else {
				this.elem.dataset.volume = 0;
			}
			myDebugger.write(1, "setting volume for " + this.filename + " to " + this.elem.dataset.volume);
		}

        if (myMedia_.innerHTML)
            this.elem.innerHTML = myMedia_.innerHTML;

        if (myMedia_.transition) {
            $(this.elem).data('trancss', myMedia_.transition.tranCss);
            $(this.elem).data('tranin', myMedia_.transition.tranIn);
            $(this.elem).data('tranout', myMedia_.transition.tranOut);
        }
    }

    getTag() {
        return this.tag;
    }
    getSource() {
        return this.elem.src;
    }
    setSource(src) {
        
		myDebugger.write(-1, "Setting source " + src);
        if (this.elem.src)
            return; // can't redefine
        this.elem.src = src;
		if ((this.tag === "audio") || (this.tag === "video")) {
			this.audioTrack = audioCtx.createMediaElementSource(this.elem);
			this.gainNode = audioCtx.createGain();
			this.gainNode.gain.value = this.elem.dataset.volume;
			this.audioTrack.connect(this.gainNode);
			this.gainNode.connect(masterGainNode);
            $(this.elem).data('track', this.audioTrack);
            $(this.elem).data('gainNode', this.gainNode);
			//this.gainNode.connect(audioCtx.destination);
		}
//		else
//			myDebugger.write(1, "Non-audio elemement: src= " + this.elem.src) + " : tag = " + this.tag;
    }

    play() {
		myDebugger.write(4, "playing " + this.filename);
        if (this.tag === "video" || this.tag === "audio") {
			
			if (this.elem) {
                var gNode = $(this.elem).data("gainNode");
				gNode.gain.value = this.elem.dataset.volume;
                $(this.elem).data("gainNode", gNode);
                this.elem.play();
                this.actualStart = performance.now();
				myDebugger.write(-1,"Setting volume to " + this.elem.dataset.volume);
            }
			else
				console.log("Warning:  Bad media");
        }
        else if (this.tag === "img") {
            //            this.getTran();
        }
        else if (this.tag === "canvas") {
            //this.animateCanvas;
        }
    }

    pause() {
        if (this.tag === "video" || this.tag === "audio") {
			if (this.elem) {
				this.elem.pause();
                this.actualEnd = performance.now();
            }
			else
				console.log("Warning:  Bad media");
            myDebugger.write(-1,"Pausing " + this.filename );
        }
        else {
            myDebugger.write(-1,"Pausing " + this.tag );
        }

     //   myDebugger.write(-1," delay was: " + (this.actualStart - this.playStart));
     //   myDebugger.write(-1," duration was: " + (this.actualEnd - this.actualStart));
    }

    /**
     * The timer is short but never gets cleared
     */
    stop() {
        if (this.tag === "video" || this.tag === "audio") {
            let me = this;
            this.actualEnd = performance.now();
    
            setTimeout(function () {
                me.elem.pause();
                myDebugger.write(-1,"Stopping and disconnecting" + this.filename);
       //         myDebugger.write(-1," delay was: " + (this.actualStart - this.playStart));
       //         myDebugger.write(-1," duration was: " + (this.actualEnd - this.actualStart));
   
                me.elem.currentTime = me.offsetTime/1000;
				this.gainNode.disconnect(); // not tested
            }, 10);
        }
    }


    /**
     * checks if a file exists before trying to fetch it. Useful when you don't know which folder it is in
     * @param {string array} files : complete path to files to search
     * @param {function} successCallback : function to call when results are ready
     * @param {function} errorCallback : fucntion to call if the search failed
     */
    checkFileExists(files, successCallback, errorCallback) {
        //myDebugger.write(-1, "There are " + files.length + " locations to search");
        if (files.length > 0) {
            let file = files.shift();
            myDebugger.write(-1, "Looking for " + file);
            var xhr = $.ajax({
                type: 'HEAD',
                url: file,
                success: function () {
                    myDebugger.write(-1, "Found: " + file);
                 //   xhr.abort();
                    successCallback(file);
                },
                error: function () {
                    myDebugger.write(-1,"Not found: " + file);
                    errorCallback(files, successCallback, errorCallback);
                }
            });
        } else {
            alert("Failed to preload file " + this.filename);
        }
    }

    preload(pathList, callbackFunction) {
//        var debugstr = "Searching " + pathList.length + "folders \r";
        this.callback = callbackFunction;
        if (this.filename) {
            let filesToCheck = [];
            for (var p of pathList) {
                filesToCheck.push(p + this.filename);
            }
			if (this.ajaxFileFind)
				myDebugger.write(1,"Ajax running");
            this.checkFileExists(filesToCheck, this.foundMedia.bind(this), this.checkFileExists.bind(this));
        }
        else { //if no file name it is a DIV or SECTION element, etc
            $(media_div)[0].appendChild(this.elem);
        }
    }

    foundMedia(file) {
        this.setSource(file);
        $(media_div)[0].appendChild(this.elem);
        //this.ajaxFileFind.abort();
        this.callback(this.elem, file);
    }

    copyDataset(from) {
        this.elem

    }
}

/**
 * Needs jsondata to be global so we can get the path
 */
class ht4f_slide {
    constructor(slideNo, slideData, isPrevNext) {
        this.slideData = slideData;
        this.slideNo = slideNo;
        this.mediaArray = [];
        this.bgEnds = false;
        this.timers = [];
        this.loadCount = 0;
        this.loadLast = 0;

        for (const m of slideData.media) {
			var isAudio = false;
			var isBackground = false;
            var isKeeper = false;
            var noPreload = false;
            
			for (const c of m.classLst)
			{
				if (c === "ht4f_audio")
					isAudio = true;
				if (c === "background")
					isBackground = false;
			}

            if (m.delay === SLIDE_DELAY_OFF)
                noPreload = !isPrevNext;
            if (m.duration === SLIDE_DURATION_OFF)
                isKeeper = true;

            var message = "Media " + m.tag;
            if (m.text)
                message += " is " + m.text;
            if (isAudio)
                message += ": Is Audio";
            if (isBackground)
                message += " Is Background";
            if (isKeeper)
                message += " Is keeper";
            if (noPreload)
                message += "no preload";
            myDebugger.write(-1, message);

            if (noPreload) {
                // find the DOM element of last slide
                var prevBg = $('.keep.background.ht4f_audio');
                var localPusher = this.mediaArray;
                prevBg.each(function (index, value) {
                    if (value.src) {
                        const keepFile = value.src.replace(/^.*[\\\/]/, '');
                        myDebugger.write(1, "Comparing " + keepFile + " to " + m.text);
                        myDebugger.write(1, "gainNode is " + $(value).data("gainNode"));
                        if (m.text === keepFile) {
                            localPusher.push(new ht4f_mediaClass(m, value));
                        }
                        myDebugger.write(1, "keeping " + keepFile);
                    }
                });
            }
            else {
                if (m.text)
                    myDebugger.write(1,"Pushing " + m.text);
                else
                    myDebugger.write(1,"Pushing " + m.tag);
            this.mediaArray.push(new ht4f_mediaClass(m, null));
            }
        }
        this.pathList = searchPath; // searchPath is global
    }

    preLoad(classToAdd) {
        for (const m of this.mediaArray) {
            if ( !(m.elem.classList.contains("nopreload")) || (classToAdd === "current") ) {
                m.elem.classList.add(classToAdd);
               this.preloadMedia(m);
               if (m.filename)
                   this.loadLast += 1;
            }
        }
    }

    /**
     * this function tries to determine if a requested media file is aleady
     * loaded
     * I also should allow image and video to span multiple slides
     *   */
    preloadMedia(myNext) {
        myNext.preload(this.pathList, this.mediaLoaded.bind(this));
    }


    /**
     * Callback function when media is loaded. Check against count
     * Need to find a way to determine if there was an error loading the files
     * @param {*} elem
     * @param {*} file
     */
    mediaLoaded(elem, file) {
        this.loadCount++;
		myDebugger.write(-1, "Loaded " + this.loadCount + " of " + this.loadLast);

		if (elem.classList.contains("ht4f_audio"))
		{
			//elem.volume = this.masterVolume*elem.dataset["volume"];
		}

        if (this.loadCount == this.mediaArray.length) {
            myDebugger.write(-1, "Finished loading");
        }
    }

    playNewMedia(useOffsetTime) {
        console.log('playNewMedia: ' + this.slideNo);

        for (const mediaWrap of this.mediaArray) {
            var justPlay = true;
            if ((mediaWrap.tag === "video") || (mediaWrap.tag === "audio")) {
				myDebugger.write(-1, "playNewMedia: Setting volume of " + mediaWrap.filename + " to " + mediaWrap.elem.dataset.volume);
                var gNode = $(mediaWrap.elem).data("gainNode");
                gNode.gain.value = mediaWrap.elem.dataset.volume;
				$(mediaWrap).data("gainNode", gNode);
				if (useOffsetTime) {
					if (mediaWrap.elem.dataset.offsetTime)
						mediaWrap.elem.currentTime = mediaWrap.elem.dataset.offsetTime/1000;
				}
				
				mediaWrap.playStart = performance.now();
				// check for undefined timing (this is not a bug. Some objects don't have timing)
				let _delay = -1;
				if (mediaWrap.delay)
					_delay = mediaWrap.delay;
				
				let _duration = 0;
				if ( (mediaWrap.duration) && (mediaWrap.duration > 0))
					_duration = mediaWrap.duration;

				if ( (_delay === -1) && (_duration > 0) )
					_delay = 2;
				if ( (_delay > 0) && (_duration > 0) ) {
					justPlay = false;
				}
                myDebugger.write(1, mediaWrap.source);
				myDebugger.write(1, "Delay = " + _delay);
				myDebugger.write(1, "Duration = " + _duration);
				//if (!mediaWrap.elem.classList.contains("animation"))
				//	justPlay = false;
                if (justPlay === false) {
                            var t = new ht4f_timer(function () {
							mediaWrap.delaytimer.clear();
                            mediaWrap.delaytimer = null;
                            mediaWrap.play();
                            mediaWrap.status = '';
                            // If delay, also check duration
                            if (_duration > 0) {
                                var t2 = new ht4f_timer(function () {
									mediaWrap.durationtimer.clear();
                                    mediaWrap.durationtimer = null;
                                    mediaWrap.actualEnd = performance.now();
                                    myDebugger.write(-1,mediaWrap.filename + ": Started at " + (mediaWrap.actualStart-mediaWrap.playStart));
                                    myDebugger.write(-1,mediaWrap.filename + ": Duration is " + (mediaWrap.actualEnd-mediaWrap.actualStart));
                                    mediaWrap.pause();
                                }, _duration);
                                mediaWrap.durationtimer = t2;
                            }
                        }, _delay);
                        mediaWrap.status = 'delay';
                        mediaWrap.delaytimer = t;
                    }
            }
			myDebugger.write(1, "justPlay is " + justPlay);
            if (justPlay) {
                mediaWrap.play();
            }
			
        }
		if (audioCtx.state === "suspended")
			audioCtx.resume();

        this.updateText();

        // var showPlaying = $('#showlist')[0];
        // showPlaying.innerHTML = "Playing slide " + this.slideNo + " \n";
        // for (const med of this.mediaArray) {
        //     var t = med.elem.tagName + ": " + med.elem.src;
        //     showPlaying.innerHTML += (t + "\n");
        // }
    }

    // used to update volume etc for media that crosses to the next slide

    updateBackground() {
        var prevBg = $('.keep.current.background.ht4f_audio');
        if (prevBg) {
            prevBg.each(function (index, value) {
                var gainNode = $(value).data("gainNode");
                myDebugger.write(-1, 'Changing volume of ' + value.src);
                myDebugger.write(-1, ' from  ' + gainNode.gain.value + " to " + value.dataset.volume);
                if (gainNode)
                    gainNode.gain.value = value.dataset.volume;
            });
        }


//        $('.keep.ht4f_audio').each(function() {
//            myDebugger.write(1, 'Changing volume from ' + $(this).data('gainNode').gain.value + " to " + $(this).data('volume'))
//            $(this).data('gainNode').gain.value = $(this).data('volume');
//            
//        });

    }

    pauseAll() {
        for (const m of this.mediaArray) {
            m.pause();
            if (m.delaytimer)
                m.delaytimer.pause();
                if (m.durationtimer)
                m.durationtimer.pause();
        }
        this.updateText();
    }

    resumeAll() {
        for (const m of this.mediaArray) {
            if (m.status != 'delay')
                m.play();
            if (m.delaytimer)
                m.delaytimer.resume();
                if (m.durationtimer)
                m.durationtimer.resume();
        }
        this.updateText();
    }

    stopAll(stop_bg) {
        // stop all except background audio
        // if stop_bg = true, will also stop bg audio
        for (const m of this.mediaArray) {
            if (stop_bg || m.duration !== SLIDE_DURATION_OFF)
                m.pause();
            if (m.delaytimer)
                m.delaytimer.clear();
            if (m.durationtimer)
                m.durationtimer.clear();

        }

        for (const t of this.timers) {
            clearTimeout(t);
        }
        this.timers = [];
        this.updateText();
    }

    getBg() {
        for (const m of this.mediaArray) {
            if (m.duration === SLIDE_DURATION_OFF)
                return m;
        }
        return null;
    }

    getNextBg() {
        for (const m of this.mediaArray) {
            if (m.delay === SLIDE_DELAY_OFF)
                return m;
        }
        return null;
    }

    /**********************************
     * updateText
     * finds the heading/title assumed to be h2
     * changes the innerHTML
     * finds and removes all but the last paragraph
     * last paragraph is assumed to be ULEclear
     * adds new paragraphs before the ULEclear paragraph
     * if the paragraph is blank, add a blank placeholder
     **********************************/
    updateText() {
        let contentElem = $(content_section)[0];
        let headingElem = contentElem.querySelector('h2');
        let paragraphs = contentElem.querySelectorAll('p');
        let myId = paragraphs[0].id;
        let myClass = paragraphs[0].className;
        for (var i = 0; i < paragraphs.length - 1; i++) {
            paragraphs[i].remove();
        }

        var newText = this.slideData.content;

        headingElem.innerHTML = this.slideData.slideTitle;

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

}
