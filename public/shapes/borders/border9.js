(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.webFontTxtInst = {}; 
var loadedTypekitCount = 0;
var loadedGoogleCount = 0;
var gFontsUpdateCacheList = [];
var tFontsUpdateCacheList = [];
lib.ssMetadata = [];



lib.updateListCache = function (cacheList) {		
	for(var i = 0; i < cacheList.length; i++) {		
		if(cacheList[i].cacheCanvas)		
			cacheList[i].updateCache();		
	}		
};		

lib.addElementsToCache = function (textInst, cacheList) {		
	var cur = textInst;		
	while(cur != null && cur != exportRoot) {		
		if(cacheList.indexOf(cur) != -1)		
			break;		
		cur = cur.parent;		
	}		
	if(cur != exportRoot) {		
		var cur2 = textInst;		
		var index = cacheList.indexOf(cur);		
		while(cur2 != null && cur2 != cur) {		
			cacheList.splice(index, 0, cur2);		
			cur2 = cur2.parent;		
			index++;		
		}		
	}		
	else {		
		cur = textInst;		
		while(cur != null && cur != exportRoot) {		
			cacheList.push(cur);		
			cur = cur.parent;		
		}		
	}		
};		

lib.gfontAvailable = function(family, totalGoogleCount) {		
	lib.properties.webfonts[family] = true;		
	var txtInst = lib.webFontTxtInst && lib.webFontTxtInst[family] || [];		
	for(var f = 0; f < txtInst.length; ++f)		
		lib.addElementsToCache(txtInst[f], gFontsUpdateCacheList);		

	loadedGoogleCount++;		
	if(loadedGoogleCount == totalGoogleCount) {		
		lib.updateListCache(gFontsUpdateCacheList);		
	}		
};		

lib.tfontAvailable = function(family, totalTypekitCount) {		
	lib.properties.webfonts[family] = true;		
	var txtInst = lib.webFontTxtInst && lib.webFontTxtInst[family] || [];		
	for(var f = 0; f < txtInst.length; ++f)		
		lib.addElementsToCache(txtInst[f], tFontsUpdateCacheList);		

	loadedTypekitCount++;		
	if(loadedTypekitCount == totalTypekitCount) {		
		lib.updateListCache(tFontsUpdateCacheList);		
	}		
};
// symbols:



// stage content:
(lib.border9 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#CA9845").s().p("EghRAg+MAAAhB7MBCjAAAIAADRMgv6AAAIAAL2MAv6AAAIAADkMgv6AAAMAAAAvQIjPAAMAAAgvQIr4AAMAAAAvQgEgZ7Ag+QAChbAghNQAchHBKhcQgMgzgsgsQg3gwgXgcQglgFgXAxQgVAugygOQgjgSgLgOQgTgXAHgnQAOg4A8ADQAiAABRANQAVhXAOgnQAXhIA5gJQAFAFA5AQQAqAOgJApQAEA+g5AAQg8AAgDAhQAHB+BtAaQArhPAKhzQALh1gbhqQiiA8hxhxQhsiWhHgsQAXgiA+gFQA3gCAxAUQghhQgEhzQgDhvAVhHQBqgTA6A+QAgAlAzBaQAigHAxg+QApg3BBAJQgFBjAsDNQAQCviDBIQBeEGioEwIiIDrQgbAzgRAwgA8RWLQAchOBHApQBFAng1BKIgYACQhVAAgGhOgA3FJ8QAEg8gNgeQh9jLg8hnQhqi5AajlQAGgsAhhFQiWhMAXimQA3jIgEhtQA5gCAqAuQA5A+AOAHQBBhVAlgnQBChFB0AXQgMAiAHCfQAFB6g4AvQAOAXBKgTQBMgSAZAgQh4C2h+BlQh/AHg+gZQgeBTAHB4QAECHA4BOQApgTAcguQALgQAhhHQgFgHg3gYQgogTAFgsQgHgbAVgOQAZgTAAgQQAcgHAXAOQAXAQAVgCQAUATAAA3IgCBgQA+gXA1ANQAaAKBFAkQAEBMgLAhQgQAug1gDQghgXgNgQQgXgZALgwQhFAAgpAwQgRASgrBTQAZA/BMCHQA3B/grBxQg/gQgEgugA1bgEQg1g+A+gyQBAgzAoBFQgHBfhdAAIgNgBgAOtzyQgDg3AVgxQhQAhh0AGQhsADhKgVQgShqA+g6QAlggBagzQgFgihAgwQg1gqAJhDQBhAHDNguQCvgQBHCDQEJhcEwCoQBRAsCaBaQBKAmBBATIAAA6Qh1AFhdglQhIgehchHQgyALgsAsIhMBMQgFAlAxAXQAuAXgOAyQgQAhgOALQgZATgogFQg3gQACg6QAOhMAAgpQhXgTgogNQhHgXgJg6QACgCATg/QANgnAqAJQBAgEgCA3QAAA8AgACQCBgHAXhqQhMgrh1gMQhzgJhtAZQA6CihvBwQiVBvgsBHQgjgXgEhAgAoly0QjLg3hsAEQgCg5AugqQBAg8AHgLQhXhBgngkQhDhDAVh2QAiAMChgHQB4gCAuA3QAXgOgShKQgThMAhgZQC4B1BlCBQAFCCgZA7QBVAcB1gFQCHgGBPg4QgRgngugcIhWguQgHAHgcA4QgSAkgsgEQgcAHgNgVQgRgXgQAAQgJgcAQgXQAOgXgCgVQASgUA4AAIBfAAQgWg8ANg1QAJgeAlhBQBKgGAiANQAuAQgCA1QgXAhgQAOQgZAXgxgOQAABHAxAqQAOALBZAxQA8gaCIhMQCBg3BvApQgQBBguAEQg8gEgeALQjLB9hoA8Qi4BqjlgaQgcgChVgjQhDCCiGAAQgTAAgUgDgAVQ01QAphFBIA1QALBvhXACQhOgcAphFgEAg9gYEQhIhFAXh4IBGABIAADQIgVgUgAiL6RQgyhABFgqQBlAHgHBsQgdAZgaAAQgfAAgbgig");
	this.shape.setTransform(213,211);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(200,200,426.1,422.1);
// library properties:
lib.properties = {
	id: '9F1E9BED85D3854594C8776AA5495FE4',
	width: 400,
	height: 400,
	fps: 24,
	color: "#FFFFFF",
	opacity: 1.00,
	webfonts: {},
	manifest: [],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['9F1E9BED85D3854594C8776AA5495FE4'] = {
	getStage: function() { return exportRoot.getStage(); },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}



})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;