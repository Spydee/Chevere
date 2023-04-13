
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

    constructor(myMedia_) {

        this.tag = myMedia_.tag;
        this.filename = myMedia_.text;
        this.elem = document.createElement(myMedia_.tag);
        //this.elem.src = myMedia_.text;
        if (myMedia_.transition)
            this.transition = myMedia_.transition;
        this.delay = null;
        this.delaytimer = null;
        this.duration = null;
        this.durationtimer = null;
        this.status = '';
        this.playStart = null;     // when the play button is pressed
        this.actualStart = null;   // when the play actually started
        this.actualEnd = null;     // when the play actually ended
		this.ajaxFileFind = null;

        for (const cl of myMedia_.classLst) {
            this.elem.classList.add(cl);
        }

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
        if (myMedia_.offsetTime)
            this.elem.dataset.offsetTime = myMedia_.offsetTime;

        if ((myMedia_.volume) && ((myMedia_.tag === "audio") || (myMedia_.tag === "video")))
            this.elem.dataset.volume = myMedia_.volume;

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
        this.elem.src = src;
    }

    play() {
        if (this.tag === "video" || this.tag === "audio") {
			
			if  ( (deviceSupportsVolume == false) && (this.tag == "audio") && this.elem.classList.contains("background") )
				return;
			if (this.elem) {
				this.elem.play();
                this.actualStart = performance.now();
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
        }
        myDebugger.write(1,"Media " + this.filename + " was scheduled at " + this.playStart);
        myDebugger.write(1," delay was: " + (this.actualStart - this.playStart));
        myDebugger.write(1," duration was: " + (this.actualEnd - this.actualStart));
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
                myDebugger.write(1,"Media " + this.filename + " was scheduled at " + this.playStart);
                myDebugger.write(1," delay was: " + (this.actualStart - this.playStart));
                myDebugger.write(1," duration was: " + (this.actualEnd - this.actualStart));
   
                me.elem.currentTime = me.offsetTime/1000;
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
        myDebugger.write(1, "There are " + files.length + " files to seaarch");
        if (files.length > 0) {
            let file = files.shift();
            myDebugger.write(1, "Looking for " + file + " of " + files.length);
            var xhr = $.ajax({
                type: 'HEAD',
                url: file,
                success: function () {
                    console.log("Found: " + file);
                 //   xhr.abort();
                    successCallback(file);
                },
                error: function () {
                    myDebugger.write(1,"Not found: " + file);
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
        this.masterVolume = 0.1;

	// some devices (iPHone iPad, etc) do not support volume control.
	// In this case do not load background music
        for (const m of slideData.media) {
			var isAudio = false;
			var isBackground = false;
			for (const c of m.classLst)
			{
				if (c === "ht4f_audio")
					isAudio = true;
				if (c === "background")
					isBackground = true;
			}
			
			if ( deviceSupportsVolume || !isAudio || !isBackground) {
				if (m.delay === SLIDE_DELAY_OFF) {  // is continuing audio?
					// if it is created from PREV/NEXT, then we want to add it to media
					// and also set it to start at the offsetTime
					var loadNewBkg = false;
					if (isPrevNext) {
						loadNewBkg = true;
					}
					else {
						var prevBg = $('.current.background.ht4f_audio');
						//var filename = fullPath.replace(/^.*[\\\/]/, '')
						if (prevBg) {
							prevBg.each(function (index, value) {
								if (value.src.includes(m.text)){
									value.dataset.offsetTime = m.offsetTime;
									value.dataset.duration = m.duration;
									value.dataset.delay = m.delay;
									value.dataset.volume = m.volume;
									loadNewBkg = false;
								}
							});
						}
						else
							loadNewBkg = true;
					}
					if (loadNewBkg === true) {
						let mNew = new ht4f_mediaClass(m);
						mNew.elem.currentTime = m.offsetTime;
						mNew.delay = 0;
						myDebugger.write(1, "Pushing new " + mNew.text);
						this.mediaArray.push(mNew);
					}
					if (m.duration !== SLIDE_DURATION_OFF)
						this.bgEnds = true;
				}
				else { // add all non-background audio to media
					myDebugger.write(1,"Pushing " + m.text);
					this.mediaArray.push(new ht4f_mediaClass(m));
				}
			}
        }
        this.pathList = searchPath; // searchPath is global
    }

    preLoad(classToAdd) {
        for (const m of this.mediaArray) {
            m.elem.classList.add(classToAdd);
            this.preloadMedia(m);
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

    setMasterVolume(volume) {
        this.masterVolume = volume;
        this.setVolume();
    }
	
    setVolume() {
        let masterV = this.masterVolume;
		let level = masterV;
        myDebugger.write(1,"Master volume is " + this.masterVolume);
        let audioMedia = $('.ht4f_audio');
        myDebugger.write(1,"there are " + audioMedia.length + " audio flies loaded");
        audioMedia.each(function (index, value) {
			let level = masterV * value.dataset["volume"];
			if (value.dataset["volume"] === undefined)
			{
				console.log("Warning undefined volume for slide");
			}
			else
			{
				level = masterV * value.dataset["volume"];
			}
            myDebugger.write(1,"volume for audio" + index + " should be : " + level);
            value.volume = level;
			myDebugger.write(1,'Actual volume is ' + value.volume);
        });

        let videoMedia = $('.ht4f_video');
        myDebugger.write(1,"there are " + videoMedia.length + " video flies loaded");
        videoMedia.each(function (index, value) {
			if (value.dataset["volume"] === undefined)
			{
				console.log("Warning undefined volume for slide");
			}
			else
			{
				level = masterV * value.dataset["volume"];
			}
            console.log("volume for " + index + " : " + level);
            value.volume = level;
			
        });
    }


    /**
     * Callback function when media is loaded. Check against count
     * Need to find a way to determine if there was an error loading the files
     * @param {*} elem
     * @param {*} file
     */
    mediaLoaded(elem, file) {
        this.loadCount++;

		if (elem.classList.contains("ht4f_audio"))
		{
			elem.volume = this.masterVolume*elem.dataset["volume"];
		}

        if (this.loadCount == this.mediaArray.length) {
            //  myDebugger.write("Finished loading");
        }
    }

    playNewMedia(useOffsetTime) {
        console.log('playNewMedia: ' + this.slideNo);

        for (const mediaWrap of this.mediaArray) {
            var justPlay = true;
            if ((mediaWrap.tag === "video") || (mediaWrap.tag === "audio")) {
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
                                    myDebugger.write(1,mediaWrap.filename + ": Started at " + (mediaWrap.actualStart-mediaWrap.playStart));
                                    myDebugger.write(1,mediaWrap.filename + ": Duration is " + (mediaWrap.actualEnd-mediaWrap.actualStart));
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

        this.updateText();

        // var showPlaying = $('#showlist')[0];
        // showPlaying.innerHTML = "Playing slide " + this.slideNo + " \n";
        // for (const med of this.mediaArray) {
        //     var t = med.elem.tagName + ": " + med.elem.src;
        //     showPlaying.innerHTML += (t + "\n");
        // }
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
