class animatable {

    constructor(_elem) {
        this.elem = _elem;
        this.timer = null;
    }

    play() {
        console.log("Doing undefined animation");
    }

    delayTimer(duration) {
        return new Promise ( async (resolve) => {
            var t = new ht4f_timer(function() {
                if (this.timer)
                    this.timer.clear();
                this.timer = null;
                resolve();
            }, duration);
            this.timer = t;
        })
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