function gsaptest() {
	var media_div = "#ht4f_image_div";
	
	let slide1 = document.createElement("img");
	$(slide1).data('viewable', 1);
	slide1.src = "../../media/ht4f1.png";
	slide1.classList.add("ht4f_image");
	slide1.classList.add("ht4f_aspect_ratio");
	slide1.setAttribute("style","position:absolute;z-index:0;");
	$(slide1).data('content', "Hello dolly");
	$(media_div)[0].appendChild(slide1);
	
	let slide2 = document.createElement("img");
	$(slide2).data('viewable', 1);
	slide2.src = "../../media/ht4f2.png";
	slide2.classList.add("ht4f_image");
	slide2.classList.add("ht4f_aspect_ratio");
	slide2.setAttribute("style","position:absolute;z-index:0;");
	$(slide2).data('content', "Hello dolly");
	$(media_div)[0].appendChild(slide2);	
	
	let myTimeline = gsap.timeline();
	myTimeline.fromTo(slide1, {"opacity":0.0}, {"opacity":1.0, "duration":1.75});
	myTimeline.to(slide1, {"opacity":0.0, "delay":8,  "duration":0.75});
	myTimeline.fromTo(slide2, {"opacity":0.0}, {"opacity":1.0, "duration":1.75}, "<-0.75");
	myTimeline.to(slide2, {"opacity":0.0, "delay":8,  "duration":0.75});
		
	myTimeline.play();
	
}

async function gsaptest2() {
	var media_div = "#ht4f_image_div";

		let slides = null;
		let anims = null;
     	xhrJ = $.get(slideJSONfile, function(data, status, xhr) {
			if (!data) {
				alert("Null results loading slide definition file in function start");
			}
			else {
				slides = data;
			}
	    }, "json").fail(function(data, status, xhr) { alert("Failed file load: " + slideJSONfile + " " + xhrJ.responseText) });

		let xhrA = $.get(animationJSONfile, function(data, status) {
			if (!data) {
				alert("Null results loading animation definition file in function start");
			}
			anims = data;
		}, "json").fail(function(data) { alert("Fail file load: " + animationJSONfile + " " + xhrA.responseText) });

	await Promise.all([xhrJ, xhrA]);
	
	let max = 3;
	/**************************************************
	 filter out those that should not start with tranin
          animations, background music	 
	 **************************************************/
	 
	 let masterTimeline = gsap.timeline({paused:true});
	 
	for (slide of slides.slides) {
		if (max-- <= 0)
			break;
		
		let slideTimeline = gsap.timeline();
		let slidetraninTarget = "." + slide.slideNo + ":not(.animation)";
		let slidetranoutTarget = "." + slide.slideNo;
		mySlideElements = buildSlide(slide, $(media_div)[0], slides.assetPath);
		slideTimeline.fromTo(slidetraninTarget, {"left":"-=100%", "opacity":0.0}, {"left":"+=100%", "opacity":1.0, "duration":1.75});
		slideTimeline.to(slidetranoutTarget, {"delay":4, "left":"+=100%", "opacity":0 } , ">");
		
		masterTimeline.add(slideTimeline, ">");
		
	}
	masterTimeline.play();
//	myTimeline.play();
	
	// function buildElements
	// takes the json file and creates DOM elements
	// each DOM element has properties saved
	// slide is the json definition for one slide
	// parent is the DOM element parent
	// mediapath is the global location for the media
	function buildSlide(slide, parentElem, mediaPath) {
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
			if ((m.text) && (m.text.length > 0)) {
				ele.src = mediaPath + m.text;
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
			
			if (m.content) {
				$(ele).data('content', m.content);
			}
			
			parentElem.appendChild(ele);
		}
		return ele;
    }
}

async function gsaptest3() {
	var media_div = "#ht4f_image_div";

		let slides = null;
		let anims = null;
     	xhrJ = $.get(slideJSONfile, function(data, status, xhr) {
			if (!data) {
				alert("Null results loading slide definition file in function start");
			}
			else {
				slides = data;
			}
	    }, "json").fail(function(data, status, xhr) { alert("Failed file load: " + slideJSONfile + " " + xhrJ.responseText) });

		let xhrA = $.get(animationJSONfile, function(data, status) {
			if (!data) {
				alert("Null results loading animation definition file in function start");
			}
			anims = data;
		}, "json").fail(function(data) { alert("Fail file load: " + animationJSONfile + " " + xhrA.responseText) });

	await Promise.all([xhrJ, xhrA]);
	
	let max = 3;
	/**************************************************
	 filter out those that should not start with tranin
          animations, background music	 
	 **************************************************/
	 
	 let masterTimeline = gsap.timeline({paused:true});
	 
	for (slide of slides.slides) {
		if (max-- <= 0)
			break;

		let myTimeline = new slideTimeline(slide, slides, anims, media_div);
		masterTimeline.add(myTimeline.createTimeline());
	}
	masterTimeline.play();
}