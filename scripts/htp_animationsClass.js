class animatable {
    constructor(_elem) {
        this.elem = _elem;
    }

    play() {
        console.log("Doing undefined animation");
    }

}

class gsapSlide {

    constructor(slide) {

        this.targets = [];
        this.next = null;
        this.prev = null;
        this.timeline = null;
        this.label = "slide" + slide.slideNo;
        for (const med of slide.media) {
            if (med.tag == "img") {
                if (med.text.includes("ht4f")) {
                    var elem = this.preload(med);
               //     this.targets.push(elem);
                    myDebugger.write(-1, "pushing: " + elem.text);
                }
                else {

                }
            }
        }
//        this.timeline = this.inLeftOutRight(this.target);
        this.timeline = gsap.timeline();
        this.timeline.add(this.growInShrinkOut(this.target[0]));
    //    this.timeline.add(this.inLeftOutRight)(this.target[1]);
        this.timeline.addLabel("slideEnd_"+slide.slideNo);
   //     this.loadSlideAnimations(slide);

        //this.inLeftOutRight();
    }


    inLeftOutRight(tgt) {
        let t1 = gsap.timeline();
        t1.from(tgt, {duration:1.5, x:"-100%",opacity:0.0})
                .to(tgt, {duration:1.5, opacity:1.0, x:"+=0%"})
                .to(tgt, {delay:3.0, duration:1.5, x:"+=100%", opacity:0.0});
        return t1;
    }

    growInShrinkOut(tgt) {
        let t1 = gsap.timeline();
        t1.from(tgt, {duration:1.5, scaleX:0, scaleY:0, opacity:0.0})
                .to(tgt, {duration:1.5, scaleX:1.0, scaleY:1.0, opacity:1.0})
                .to(tgt, {delay:3.0, duration:1.5, scaleX:0.1, scaleY:0.1, opacity:0.2})
                .to(tgt, {duration:1.5, x:"+=100%", opacity:0});
        return t1;
    }


    preload(med) {
        //myDebugger.write(-1, "creating " + med.tag);
        const id = document.createElement(med.tag);
        switch(med.tag) {
            case "img":
                    id.classList.add("ht4f_image");
                    id.classList.add("ht4f_aspect_ratio");
                    id.src = jsondata.assetPath + med.text;
                break;
            case "div":
                break;
            case "audio":
                break;
            default:
                break;
        }
        myDebugger.write(-1, "Preloading" + id.src);
        return id;
    }

    buildAnimations(anidef) {
        var ta = gsap.timeline();
        for (const twx of anidef.tweens) {
            if (twx.from)
                this.timeline.from(twx.target, twx.from[0], 0);
            if (twx.to)
                for (const twto of twx.to) {
                    this.timeline.to(twx.target, twto, ">");
                } 
        }
    }

    findAnimation(animation) {
        return animation.name == String(this);
    }
    
    loadSlideAnimations(slide) {
        var myArray = [];
        myDebugger.write(-1, "There are " + slide.animations.length + " animations for this slide");
        for (const animName of slide.animations) {
            //myDebugger.write(-1, " Finding animations");
            var gsapDef = gsapDefinitions.animations.find(this.findAnimation, animName);
            if (gsapDef){
                myDebugger.write(-1, "animation found: " + animName + " + " + gsapDef);
            buildAnimations(gsapDef);
           //     var mygsap = new gsapAnimation(gsapDef);
           //     myArray.push(mygsap);
            }
        }
    }


    play() {
        myDebugger.write(-1, "Starting play: " + this.target.src);
        this.timeline.play();
    }

    pause() {
        this.timeline.pause();
    }

    resume() {
        this.timeline.resume();
    }

    next() {
        this.timeline.next.seek(0);
    }

    prev() {
        this.timeline.prev.seek(0);
    }

    stop() {
        this.timeline.pause();
    }

}

/**********************************************************************/
class gsapAnimation {

    constructor(anidef) {
        this.def = anidef;
        this.buildTimeline(anidef);
    }

    buildTimeline(anidef) {
    
        for (const twx of anidef.tweens) {
            if (twx.from)
                this.timeline.from(twx.target, twx.from[0], 0);
            if (twx.to)
                for (const twto of twx.to) {
                    this.timeline.to(twx.target, twto, ">");
                } 
        }
    }

    play() {
        this.tl.play();
    }

    pause() {
        this.tl.pause();
    }

    resume() {
        this.tl.resume();
    }

    seek(time) {
        this.tl.seek(time);
    }



}

// 'this' is actually animationName - it is passed as the second parameter
// in the find statement below.  Not the most obvious coding, but it works

function findAnimation(animation) {
    return animation.name == String(this);
}


/*********** Animation testers **************/

async function playGSAPanimation(slide) {

    // var anims = $('.current.animation');
    myaniarray = []; // global variable defined in player

    if (slide > 0)
        slide = slide-1;
    if (jsondata.slides[slide].animations) {
        for (animName of jsondata.slides[slide].animations){
            var gsapDef = gsapDefinitions.animations.find(findAnimation, animName);
            if (gsapDef){
                console.log("animation found: ", animName);
                var mygsap = new gsapAnimation(gsapDef);
                myaniarray.push(mygsap);
            }
        }
    }
    for (ani of myaniarray) {
        ani.play();
    }   
}

