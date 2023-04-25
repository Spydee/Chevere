class slideTimeline {
    constructor(slide) {
        this.slide = slide;
        this.timeline = gsap.timeline();
        this.elems = [];
        myDebugger.write(-1,"constructing");
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
    this.preloadSlideMedia();
    this.timeline.add(this.tlTransition());
    return this.timeline;
    }

    preloadSlideMedia() {
        myDebugger.write(-1, "Preloading "+ this.slide.media.length + " elements for slide " + this.slide.slideNo);
        for (const m of this.slide.media) {
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
      //              $(ele).data('playable', 0);
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

            if ( (m.text) && (m.text.length > 0) ) {
                ele.src = jsondata.assetPath + m.text;

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

                if (m.transition) {
                    $(ele).data('transition', m.transition);
    //                $(ele).data('tranin',  m.transition.tranIn);
    //              $(ele).data('tranout', m.transition.tranOut);    
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
                $(media_div)[0].appendChild(ele);
            }
            myDebugger.write(-1, ".   preloading " + ele.tagName + ": " + ele.src);
        }
    }
    tlTransition() {
        var t1 = gsap.timeline();
        for (const ele of this.elems) {
            if (!$(ele).data('viewable'))
                break;
            let fromVars = {};
            let toInVars = {};
            let toOutVars = {};
            if ($(ele).data('transition')) {
          //      myDebugger.write(-1, "checking " + $(ele).data('transition').tranCss);
                if($(ele).data('transition').tranCss) {
                    fromVars = $(ele).data('transition').tranCss;
                    if (!fromVars.duration)
                        fromVars.duration=1.5;
//                    if (!fromVars.delay)
  //                      fromVars.delay = $(ele).data.delay;
                }
                else {
                     fromVars = {duration:1.5, opacity:0};
                }
                t1.from(ele, fromVars);

                if($(ele).data('transition').tranIn) {
                    toInVars = ($(ele).data('transition').tranIn)
                    if (!toInVars.duration)
                        toInVars.duration = 1.5;
                    if (!toInVars.delay)
                        toInVars.delay = 0;
                }
                else {
                    toInVars = {delay:$(ele).duration/1000, opacity:1,duration:1.5};
                }
                t1.to(ele, toInVars);

                if($(ele).data('transition').tranOut) {
                    toOutVars = $(ele).data('transition').tranOut;
                    if (!toOutVars.delay)
                        toOutVars.delay = $(ele).duration/1000;
                    if (!toOutVars.duration)
                        toOutVars.duration = 1.5;
                } 
                else {
                    toOutVars = {opacity:0};
                }
                t1.to(ele, toOutVars);
                //          myDebugger.write(-1, ele.tagName + "has trancss = " + $(ele).data('transition').tranCss);
            }
        }
        return t1;
    }

}