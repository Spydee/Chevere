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

        this.target = null;
        this.next = null;
        this.prev = null;
        this.timeline = null;
        for (const med of slide.media) {
            if (med.tag == "img") {
                if (med.text.includes("ht4f")) {
                    myDebugger.write(-1, "found: " + med.text);
                    var elem = this.preload(med);
                    this.target = elem;
                }
            }
        }
//        this.timeline = this.inLeftOutRight(this.target);
        this.timeline = this.growInShrinkOut(this.target);

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
        id.classList.add("ht4f_image");
        id.classList.add("ht4f_aspect_ratio");
        id.src = "media/" + med.text;
        myDebugger.write(-1, "Source is " + id.src);

        return id;
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


class gsapAnimation {

    constructor(anidef) {
        this.def = anidef;
        this.buildTimeline(anidef);
    }

    buildTimeline(anidef) {
    
    let tl = gsap.timeline({paused:true});

    //console.log(anidef.tweens.target, anidef.tweens[0].from);

    // tl.from(anidef.tweens[0].target, anidef.tweens[0].from[0]);
    // tl.to  (anidef.tweens[0].target, anidef.tweens[0].to[0]);
    // tl.to  (anidef.tweens[0].target, anidef.tweens[0].to[1]);

        for (const twx of anidef.tweens) {
            //if ($(twx.target)[0] instanceof HTMLAudioElement) {
                // handle this different
                // if (twx.from.volume && twx.from.volume > 0){
                //     tl.from(twx.target, twx.from[0],
                //         {onStart:function() { $(twx.target)[0].play()}}, 0);
                // }

            //     console.log("audio element");
            // }
            // else {
                if (twx.from)
                    tl.from(twx.target, twx.from[0], 0);
                if (twx.to)
                    for (const twto of twx.to) {
                        tl.to(twx.target, twto, ">");
                    } 
            //}
        }
        this.tl = tl;
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