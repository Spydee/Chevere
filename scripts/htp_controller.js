/**********************************************
 Controller
 **********************************************/

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.controller = factory();
    }
}(this, function () {

    let controller = function () {

        const pauseEvent = new Event('pause');
        const playEvent = new Event('play');
        const prevEvent = new Event('prev');
        const nextEvent = new Event('next');
        const rewindEvent = new Event('rewind');
        const settings = new Event('settings');
        const fullscreenEvent = new Event('fullscreen');
        //        const volControlEvent = new Event('volume');
        //		const volumeChanged = new CustomEvent('volumeChanged', {
        //			"detail":{"x":x)"
        //			});

        let init = function () {
            getViewPort();
            const ULE = document.getElementById("ht4f_div_graphics");
            const ctrlPlayB = document.getElementById("ht4f_play");
            const ctrlPauseB = document.getElementById("ht4f_pause");
            const ctrlPrevB = document.getElementById("ht4f_prev");
            const ctrlNextB = document.getElementById("ht4f_next");
            const ctrlRewindB = document.getElementById("ht4f_rewind");
            const fullscrnB = document.getElementById("ht4f_fullscrn");
            const settingsB = document.getElementById("ht4f_settings_menu");
            

            var inTransition = false;
            var pauseDuringTransition = false;

            // send events to Player

            if (ctrlPlayB != null) {
                ctrlPlayB.addEventListener('click', function () { ULE.dispatchEvent(playEvent) });
            }
            if (ctrlPauseB != null) {
                ctrlPauseB.addEventListener('click', function () {
                    // delay pause during transition
                    if (inTransition)
                        pauseDuringTransition = true;
                    else
                        ULE.dispatchEvent(pauseEvent)
                });
                ctrlPauseB.style.display = "none";
            }
            if (ctrlPrevB != null) {
                ctrlPrevB.addEventListener('click', function () { ULE.dispatchEvent(prevEvent) });
            }
            if (ctrlNextB != null) {
                ctrlNextB.addEventListener('click', function () { ULE.dispatchEvent(nextEvent) });
            }
            if (ctrlRewindB != null) {
                ctrlRewindB.addEventListener('click', function () { ULE.dispatchEvent(rewindEvent) });
            }
            if (fullscrnB != null) {
                fullscrnB.addEventListener('click', function () {
                    // Fullscreen clicked
                    fullscreen("ht4f_view_area");
                });
            }

            if (settingsB != null) {
                settingsB.addEventListener('click', function () {
                    // Settings clicked
                });
            }

            console.log('Setting up volume control');
            volumeControllerInit();

            // listen for status change events from Player

            ULE.addEventListener('playing', function () {
                //    console.log('is playing event');
                ctrlPauseB.style.display = "inline";
                ctrlPlayB.style.display = "none";
            });
            ULE.addEventListener('paused', function () {
                //    console.log('is paused event');
                ctrlPlayB.style.display = "inline-flex";
                ctrlPauseB.style.display = "none";
            });
            ULE.addEventListener('transition-start', function () {
                // detect and delay pause event during transition
                inTransition = true;
                pauseDuringTransition = false;
                console.log('transition starting');
            });
            ULE.addEventListener('transition-end', function () {
                // dispatch pause if detected during transition
                inTransition = false;
                if (pauseDuringTransition) {
                    pauseDuringTransition = false;
                    ULE.dispatchEvent(pauseEvent);
                }
                console.log('transition finished');
            });
        }

        let volumeControllerInit = function () {
            const volumeB = document.getElementById("ht4f_volume");
            var slider = document.querySelector("input.volume");
            var sliderState = 'off';
            var volumeBtnTimer;
            volcont = document.getElementById("vol-control");

            if (volumeB != null) {
                volumeB.addEventListener('click', function () {
                    sliderState = 'waiting';
                    console.log(sliderState);
					clearTimeout(volumeBtnTimer);
					if (volcont.classList.contains('hidden')) {
						volcont.classList.remove('hidden');
						volumeBtnTimer = setTimeout(function () {
							if (sliderState === 'waiting') {
								volcont.classList.add('hidden');
								sliderState = 'off';
								console.log("off with it");
							}
						}, 4000);
					}
					else {
						volcont.classList.add('hidden');
					}
				});
            }

            slider.oninput = function () {
                sliderState = 'setting';
                const ULE = document.getElementById("ht4f_div_graphics");
                progressBar = document.querySelector("progress.volume");
                console.log("Created" + progressBar);
                progressBar.value = slider.value;
                sliderValue = document.getElementById("mySliderval");
                sliderValue = document.querySelector(".sliderValue");
                sliderValue.innerHTML = slider.value;
                console.log(myPlayer.myActiveSlide);
                volexp = Math.exp(2.3 / 50 * (slider.value - 100));
                console.log("Set vol to " + volexp);
                setTimeout(function () {
                    volcont.classList.add('hidden');
                    clearTimeout(volumeBtnTimer);
                }, 800);

                ULE.dispatchEvent(new CustomEvent("volumeChanged", {
                    detail: { volume: volexp }
                }));
                //				myPlayer.setMasterVolume(volexp);
                slider.onmouseleave = function () {
                    setTimeout(function () {
                        volcont.classList.add('hidden');
                        slider.onmouseleave = null;
                        clearTimeout(volumeBtnTimer);
                    }, 300);
                }
            }
        }


        let getViewPort = function () {
            const root = document.documentElement;
            viewportWidth = jQuery(window).width();
            viewportHeight = jQuery(window).height();
            root.style.setProperty("--viewPortWidth", viewportWidth);
            root.style.setProperty("--viewPortHeight", viewportHeight);
            var aspectRatio = viewportWidth / viewportHeight;
            root.style.setProperty("--aspectRatio", aspectRatio);
        }

        let fullscreen = function (elemID) {
            var elem = document.getElementById(elemID);
            if (!document.fullscreenElement) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) { /* Safari */
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) { /* IE11 */
                    elem.msRequestFullscreen();
                }
            }
            else { // exit
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    document.msExitFullscreen();
                }
            }
        }

        return {
            init: init,
            fullscreen: fullscreen,
            getViewPort: getViewPort
        }
    }

    return controller;
}));

