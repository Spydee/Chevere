class slideTimeline {
    constructor(slide) {
        this.slide = slide;
        this.timeline = gsap.timeline();
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

        this.tranTimeline = gsap.timeline();
//        var animationTimeline = gsap.timeline();
        for (const m of this.slide.media) {
            if (!m.text.includes("ht4f")) 
                continue;
            myDebugger.write(-1, "creating " + m.tag + ": " + m.text);
            var elem = this.createMedia(m);
            myDebugger.write(-1, "add props");
            this.addProperties(m, elem);
            myDebugger.write(-1, "add transitions");
            this.addTransitions(m, elem);
  //          myDebugger.write(-1, "add animations");
  //          this.addAnimations(m, elem, animationTimeline);

            myDebugger.write(-1, "push and append");
            this.elems.push(elem);
            $(media_div)[0].appendChild(elem);
        }
        myDebugger.write(-1, "adding timelines");
        this.timeline.add(this.tranTimeline, '<');
        //this.timeline.add(animationTimeline);

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
            default:
                $(ele).data('viewable', 1);
                $(ele).data('audible', 0);
                $(ele).data('playable', 0);
        } // end switch

        if ((m.text) && (m.text.length > 0)) {
            ele.src = jsondata.assetPath + m.text;
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
            this.tranTimeline.fromTo(ele, m.transition.tranin.from, m.transition.tranin.to, '<');

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

    fixedTransition() {
        for (const ele of this.elems) {
            if (!$(ele).data('viewable'))
                continue;
            myDebugger.write(-1, "setting properties and transitions for " + ele.src);
            if (!$(ele).data('set')) {
                myDebugger.write(-1, "Setting default props for img: " + ele.tagName);
                gsap.set(ele, {x:0, y:0, scaleX:"80%", alpha:0});
                ele.style="position:absolute";
            }
            myDebugger.write(-1, 'properties set');

            var t1 = gsap.timeline();
            let fromVars = {};
            let toInVars = {};
            let toOutVars = {};

            if ($(ele).data('tranin')) {
                    fromVars = $(ele).data('tranin').from;
                    toInVars = $(ele).data('tranin').to;
                }
            else {
                fromVars = { alpha: 0.0, x: "-100%", y: 0 };  // this is relative to set position above
                toInVars = { opacity: 1, x: "+=100%", y: 0, duration: 0.75 };
            }
      //      if (!$(ele).data.tranout) {
                toOutVars = { delay: 3.5, opacity: 0, duration: 0.75, x: "+=100%" };
      //      }
            myDebugger.write(-1, "trans set");
                t1.fromTo(ele, fromVars, toInVars);
                t1.to(ele, toOutVars, '>');
                this.timeline.add(t1, '<');
        }
    }


tlTransition() {
    for (const ele of this.elems) {
        if (!$(ele).data('viewable'))
            continue;
        var t1 = gsap.timeline();
        let fromVars = {};
        let toInVars = {};
        let toOutVars = {};
        if ($(ele).data('transition')) {
            //      myDebugger.write(-1, "checking " + $(ele).data('transition').tranCss);
            if ($(ele).data('transition').tranCss) {
                fromVars = $(ele).data('transition').tranCss;
                if (!fromVars.duration)
                    fromVars.duration = 1.5;
                //                    if (!fromVars.delay)
                //                      fromVars.delay = $(ele).data.delay;
            }
            else {
                fromVars = { duration: 1.5, opacity: 0 };
            }
            t1.from(ele, fromVars, 0);

            if ($(ele).data('transition').tranIn) {
                toInVars = ($(ele).data('transition').tranIn)
                if (!toInVars.duration)
                    toInVars.duration = 1.5;
                if (!toInVars.delay)
                    toInVars.delay = $(ele).data("delay") / 1000;
            }
            else {
                toInVars = { delay: $(ele).delay / 1000, opacity: 1, duration: 1.5 };
            }
            t1.to(ele, toInVars, '>');
            //   myDebugger.write(1, "Defining TranOut for " + ele.src);
            if ($(ele).data('transition').tranOut) {
                toOutVars = $(ele).data('transition').tranOut;
                if (!toOutVars.delay)
                    toOutVars.delay = 6; //$(ele).data('duration')/1000;
                if (!toOutVars.duration)
                    toOutVars.duration = 1.5;
            }
            else {
                toOutVars = { opacity: 0 };
            }
            t1.to(ele, toOutVars, '>');
            myDebugger.write(1, "Defined TranOut for " + ele.src);
            myDebugger.write(1, toOutVars);

            //          myDebugger.write(-1, ele.tagName + "has trancss = " + $(ele).data('transition').tranCss);

            // this is added at the end even though it is played in the middle.
            if ($(ele).data("playable")) {
                t1.add(function () { ele.play(); }, $(ele).data("playStart"));
                t1.add(function () { ele.pause(); }, $(ele).data('playPause'));
            }

            if (ele.src === 'tki_movie2_x264_001.mp4') {
                myDebugger.write("MP4 Data coming");
                myDebugger.write(1, toOutVars);
            }
        }
        this.timeline.add(t1, '<');
    }
    return t1;
}

}