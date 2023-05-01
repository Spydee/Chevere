class slideTimeline {
    constructor(slide) {
        this.slide = slide;
        this.timeline = gsap.timeline({paused:true});
        this.elems = [];
        myDebugger.write(-1, "constructing");
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

        myDebugger.write(-1, "Starting preload " + this.slide.media.length + " elements for slide " + this.slide.slideNo);
        var boxSize = this.getContainerSize($(media_div)[0]);
        myDebugger.write(-1, "Container is " + boxSize.w + " x " + boxSize.h);

        this.tranTimeline = gsap.timeline({paused:true});
        /************ First create the transitions ******************/
        for (const m of this.slide.media) {
//            if ( (!m.text.includes("ht4f")) && (!m.text.includes("oud") ) && (!m.text.includes("olt") ) )
  //              continue;
            myDebugger.write(-1, "creating " + m.tag + ": " + m.text);
            var elem = this.createMedia(m);
            myDebugger.write(-1, "add props");
            this.addProperties(m, elem);
            myDebugger.write(-1, "add transitions: " + m.text);
            this.addTransitions(m, elem);

            myDebugger.write(-1, "push and append");
            this.elems.push(elem);
            $(media_div)[0].appendChild(elem);
        }
        myDebugger.write(-1, "media and transitions created");
        this.animationTimeline = gsap.timeline({paused:true});
        this.createAnimation(this.slide);

        myDebugger.write(-1, "adding timelines");
        try {
//            this.tranTimeline.eventCallback("onComplete", updateText, ["slide"]);
            this.timeline.add(this.tranTimeline, '<');
            this.timeline.add(this.animationTimeline, '<');
        }
        catch(e)
            {myDebugger.write(-1, "$ERROR$: " + e.message)};

        myDebugger.write(-1, "done with slide " + this.slide.slideNo);
        return this.timeline;
    }

    createMedia(m) {
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

        if ((m.text) && (m.text.length > 0)) {
            ele.src = jsondata.assetPath + m.text;
        }

        if (m.content) {
            $(ele).data('content', m.content);
        }
            // find a way to make sure we don't load more than one background
            // only permit background to extend beyond the slide
            // when prev and next are pressed, make sure we take into account the time for the audio
        return ele;
    }

    addProperties(m, ele) {
        if (m.classLst) {
            let classes = "Setting classList = ";
            for (const cc of m.classLst) {
                ele.classList.add(cc);
                classes += " " + cc;
            }
            myDebugger.write(-1, classes);
        }

        if (m.style) {
            ele.setAttribute("style", m.style);
            myDebugger.write(-1, "Setting styles = " + m.style);
        }

        if (m.innerHTML) {
            ele.innerHTML = m.innerHTML;
            myDebugger.write(-1, "Adding innerHTML");
        }

        if (m.set) {
            myDebugger.write("setting ..");
            $(ele).data('set', m.set );
//              gsap.set(ele, {x:0, y:0, scaleX:"80%", alpha:0});
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
    }

    addTransitions(m, ele) {
        if (m.transition) {
            //$(ele).data('tranin', m.transition.tranIn);
            //$(ele).data('tranout', m.transition.tranOut);
            this.tranTimeline.fromTo(ele, m.transition.tranin.from, m.transition.tranin.to, 0);

            myDebugger.write(-1, "transition is " + m.transition);
            this.tranTimeline.to(ele, m.transition.tranout.to, '>');
        }
        else {
            myDebugger.write(-1, "no transition");
        }

    }

    getContainerSize(elem) {
        var containSize = { w: 0, h: 0 };
        //containSize.w = elem.clientWidth;
        containSize.w = elem.getBoundingClientRect().width;
        containSize.h = elem.getBoundingClientRect().height;
        return containSize;
    }

    createAnimation(slide) {
        myDebugger.write(-1, "creating animation timeline");
        for (const animName of slide.animations) {
            myDebugger.write(-1, "Searching ...");

            let gsapDef;
            try {
                gsapDef = gsapDefinitions.animations.find(this.findAnimation, animName);
                console.log(gsapDef);
                if (gsapDef){
                    myDebugger.write(-1, "animation found: ", animName);
                  //  var mygsap = new gsapAnimation(gsapDef);
                    this.animationTimeline.add(this.buildAnimation(gsapDef));
                }
                else {
                    myDebugger.write(-1, "No animations found for slide " + slide.slideNo);
                }
            }
            catch (e) {
                myDebugger.write(-1, "Error adding " + gsapDef + " to animations");
            }


        }
    }
    
// 'this' is actually animationName - it is passed as the second parameter
// in the find statement below.  Not the most obvious coding, but it works

    findAnimation(animation) {
        return animation.name == String(this);
    }

    buildAnimation(anidef) {
        myDebugger.write(-1, "Building animation: " + anidef.name + " : " + anidef.tweens.length + " tweens to build");
        
        let tl = gsap.timeline({paused:true});
        for (const twx of anidef.tweens) {
                //if ($(twx.target)[0] instanceof HTMLAudioElement) {
                    // handle this different
                    // if (twx.from.volume && twx.from.volume > 0){
                    //     tl.from(twx.target, twx.from[0],
                    //         {onStart:function() { $(twx.target)[0].play()}}, 0);
                    // }
            myDebugger.write(-1, "building " + twx.target);
            if (twx.from)
                tl.from(twx.target, twx.from[0], 0);
            if (twx.to) {
                for (const twto of twx.to) {
                    tl.to(twx.target, twto, ">");
                } 
            }
        }
        myDebugger.write(-1, "built animations ");
        return tl;
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
    updateText(slide) {
        myDebugger.write(-1, "Updating content");
        try{
            let contentElem = $(content_section)[0];
            let headingElem = contentElem.querySelector('h2');
            let paragraphs = contentElem.querySelectorAll('p');
            let myId = paragraphs[0].id;
            let myClass = paragraphs[0].className;
            for (var i = 0; i < paragraphs.length - 1; i++) {
                paragraphs[i].remove();
            }

            var newText = slide.content;
            myDebugger.write(-1, "New content text: ");

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
            myDebugger.write(-1, "$ERROR$ inserting content text for slide " + slide.slideNo);
            myDebugger.write(-1, e.message);
        }
    }
}