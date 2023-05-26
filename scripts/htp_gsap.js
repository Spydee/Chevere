class slideTimeline {
    constructor(slide, jsondata, gsapDefinitions, audioContext, masterGain, media_div) {
        this.slide = slide;
        this.timeline = gsap.timeline({paused:true});
        this.elems = [];
        this.jsondata = jsondata;
        this.media_div = media_div;
        this.gsapDefs = gsapDefinitions;
        this.content = slide.content;
        this.players = [];
        this.playing = [];
        this.audioContext = audioContext;
        this.masterGainNode = masterGain;
    }

    createTimeline() {
        // need to find all media and preload it
        // do a foreach and create an element and preload it. Save this in an array of elements
        //       this array will be used later to create the targets of the timeline
        //
        //
        //1. create the array of media for the slide
        // a. add class transition, animation, audio to do a search on
        //2. from this array
        // create a transition timeline for all elements that have a transition
        // create an animation timeline for all should not be transition for audio - use

        try {
            this.timeline = gsap.timeline();

            this.tranline = gsap.timeline();
            this.audioTimeline = gsap.timeline();

            this.slidetraninTarget = "." + this.slide.slideNo + ":not(.animation)";
            this.slidetranoutTarget = "." + this.slide.slideNo;
            this.mySlideElements = this.buildSlide(this.slide, $(this.media_div)[0], this.jsondata.assetPath);
            this.tranline.fromTo(this.slidetraninTarget, this.slide.transition.tranin.from, this.slide.transition.tranin.to);
//            this.tranline.eventCallback( "onStart", this.updateText, [this.slide]);
            this.tranline.to(this.slidetranoutTarget, this.slide.transition.tranout.to, ">");

            this.timeline.add(this.tranline, 0);
            this.timeline.add(this.createAnimation(this.slide), 0);
            this.timeline.add(this.audioTimeline, 0);

            return this.timeline;
        }
        catch(e) {
            "$ERROR$ in createTimeline: " + e.message;
        }
    }

    getTimeline() {
        return this.timeline;
    }
    getSlide() {
        return this.slide;
    }
    getPlaying() {
        if (this.playing)
            return this.playing;
        else
            throw "No audio playing";
    }
    	// function buildElements
	// takes the json file and creates DOM elements
	// each DOM element has properties saved
	// slide is the json definition for one slide
	// parent is the DOM element parent
	// mediapath is the global location for the media
	buildSlide(slide, parentElem, mediaPath) {
		for (const m of slide.media) {
	        var ele = document.createElement(m.tag);
			switch (m.tag) {
				case 'img':
					$(ele).data('viewable', 1);
					//                    $(ele).data('audible', 0);
					//                  $(ele).data('playable', 0);
					break;
				case 'audio':
					//                $(ele).data('viewable', 0);
					$(ele).data('audible', 1);
					$(ele).data('playable', 1);
					break;
				case 'video':
					$(ele).data('viewable', 1);
					$(ele).data('audible', 1);
					$(ele).data('playable', 1);
					break;
				case 'div':
					$(ele).data('viewable', 1);
					//            $(ele).data('audible', 0);
					//          $(ele).data('playable', 0);
					break;
				default: // ul, li, 
					$(ele).data('viewable', 1);
					$(ele).data('audible', 0);
					$(ele).data('playable', 0);
			} // end switch
			
		// add properties
        if ($(ele).data('playable')) {
            if (m.volume) {
                $(ele).data('volume', m.volume);
            }
            else {
                $(ele).data('volume', 0.01);
            }
            let apiPlayer = new audioPlayer(ele, this.audioContext, this.masterGainNode);
            apiPlayer.setSource(mediaPath + m.text);
            if (!m.offsetTime) {
                m.offsetTime = 0;
            }
            if (m.delay > 0) {
                var apStart = gsap.delayedCall(m.delay, this.playAudio, [ele]);
                this.audioTimeline.add(apStart, 0);
            }
            this.playing.push(ele);
            //            var apStop = gsap.delayedCall(m.duration, apiPlayer.stop);
//            this.audioTimeline.add(apStop);
        }
        else {
			if ((m.text) && (m.text.length > 0)) {
				ele.src = mediaPath + m.text;
			}
        }
			if (m.classLst) {
				if (!m.classLst.includes(slide.slideNo) && !(m.tag === "audio" && m.duration < 0) )
					m.classLst.push(slide.slideNo);
//				if ( m.classLst.includes(slide.slideNo) || !(m.classLst.includes("animation") ) ) {
//					if ( !(m.tag === "audio" && m.duration < 0) )
//				}

				for (const cc of m.classLst) {
					ele.classList.add(cc);
				}
				console.log(m.text + " classes: " + m.classLst);
			}

			if (m.style) {
				ele.setAttribute("style", m.style);
			}

			if (m.innerHTML) {
				ele.innerHTML = m.innerHTML;
			}

			if (m.set) {
				$(ele).data('set', m.set );
				//      gsap.set(ele, {x:0, y:0, scaleX:"80%", alpha:0});
			}

			if (m.duration) {
				$(ele).data('duration', m.duration);
			}
			if (m.delay) {
				$(ele).data('delay', m.delay);
			}

			if (m.offsetTime) {
				$(ele).data('offsetTime', m.offsetTime);
			}
			
            this.elems.push(ele);
			parentElem.appendChild(ele);
		}
		return ele;
    }

    playAudio(elem){
        myDebugger.log("Playing " + elem.src);
//        $(elem).data('gainNode').connect(this.masterGainNode);

        elem.play();
        return;
/*        try {
            if (!this.audioContext) {
                throw "Undefined audio context in setSource: " + src;
            }
            var audioTrack = this.audioContext.createMediaElementSource(elem);
            if (!audioTrack) {
                throw "Cannot create audio track for " + elem.src;
            }
            var gainNode = this.audioContext.createGain();
            var vol = $(elem).data('volume');
            if (!vol) {
                throw "node volume not set in setSource: " + elem.src;
            }
            gainNode.gain.value = vol;
            audioTrack.connect(gainNode);
            gainNode.connect(this.masterGainNode);
            $(elem).data('track', audioTrack);
            $(elem).data('gainNode', gainNode);
            //this.gainNode.connect(audioCtx.destination);
            myDebugger.log("Set source to " + elem.src);
        }
        catch(e) {
            myDebugger.log("$ERROR$ " + e);
        }

        elem.play(); */
    }

    stopAudio(elem) {
        ele.pause();
        $(elem).data('gainNode').disconnect();
    }

    getContainerSize(elem) {
        var containSize = { w: 0, h: 0 };
        //containSize.w = elem.clientWidth;
        containSize.w = elem.getBoundingClientRect().width;
        containSize.h = elem.getBoundingClientRect().height;
        return containSize;
    }

    createAnimation(slide) {
        let animline = gsap.timeline();

        myDebugger.log("creating animations: " + slide.slideNo + " " + slide.animations.length + " animations");
        for (const animName of slide.animations) {
            myDebugger.log("Searching ...");

            let gsapDef;
            try {
                gsapDef = this.gsapDefs.animations.find(this.findAnimation, animName);
                if (gsapDef){
                    myDebugger.log("animation found: ", animName);
                  //  var mygsap = new gsapAnimation(gsapDef);
                    animline.add(this.buildAnimation(gsapDef), 0);
                }
                else {
                    myDebugger.log("No animations found for slide " + slide.slideNo);
                }
            }
            catch (e) {
                myDebugger.log("Error adding " + gsapDef + " to animations" + e.message);
            }
        }
        return animline;
    }
    
// 'this' is actually animationName - it is passed as the second parameter
// in the find statement below.  Not the most obvious coding, but it works

    findAnimation(animation) {
        return animation.name == String(this);
    }

    buildAnimation(anidef) {
        myDebugger.log("Building animation: " + anidef.name + " : " + anidef.tweens.length + " tweens to build");
        
        let tl = gsap.timeline();
        for (const twx of anidef.tweens) {
                //if ($(twx.target)[0] instanceof HTMLAudioElement) {
                    // handle this different
                    // if (twx.from.volume && twx.from.volume > 0){
                    //     tl.from(twx.target, twx.from[0],
                    //         {onStart:function() { $(twx.target)[0].play()}}, 0);
                    // }
            myDebugger.log("building " + twx.target);
            if (twx.from)
                tl.from(twx.target, twx.from[0], 0);
            if (twx.to) {
                for (const twto of twx.to) {
                    tl.to(twx.target, twto, ">");
                } 
            }
        }
        myDebugger.log("built animations ");
        return tl;
    }

 
}