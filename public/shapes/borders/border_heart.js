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
(lib.border_heart = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FF0000").s().p("A/NfqQgVAAgOgPQgPgOAAgVMAAAgphQAAgUAOgPIAEgEQgJhwAJhuIAAgBQAPiLAhh0IAAAAQAliAA8hxIAAAAQA9h0BVhkIABgBQBahnBlhIIAAAAQBlhKB9gwQB6gwCEgQIACAAIB9gHIAHAAIB6AIIADAAQCEARB4ArIAAAAQB+AuBqBIIAAAAQBsBJBaBeIAAAAQBOBSA1BaQB8jPDQiHIgBABQBmhHCDgvQB8guCDgNIgBAAQERghD1BhIAAAAQB9AyBqBNIACABQBjBLBZBpIAAABQCmDNBHEGIAAAAQAgB6AJCMIAAAFIgIDYIABABQAOAOAAAUMAAAApLQAAAVgPAOQgOAPgVAAgA+beGMA83AAAMAAAgiOQgWA5gbA9IAAAAQhrDniiDZIgBABQhhB7hFBNIgBABQhiBphUBRIAAAAQjBC1jLCYIAAABQhUA/lPDrIk8DcIgCACQhNAvhWgJQgmgCgwgVIgQgHIgJgFIgMgIIgEgCIgFgEIlMjsIAAAAQlYj5hIg2IAAgBQh4hbhQhGIAAAAQhvhhhQhLIgBAAQjDi8iYjGIAAAAQhQhnhChwIAAgBQhBhpg4h+QgZg5gUg1gABGWQIgBAAQENi7D+izIDPiUIgBABQDfiiCnicIABgBQDHi1COi4IABgBQBOhfBBhqQBHh0AvhnIAAAAQAwhoAqiAIgBABQAhhtARiBIAKj4QgIiAgehxIAAABQhAjyiZi8IAAAAQhQhfhahFIgBAAQhhhFhyguIABAAQjdhXj3AeIgCAAQh3AMhwApQh2AqhcBAIgBABQjOCFhzDSIgXAnQgJAQgRAHQgRAGgQgGQgRgHgJgPIgXgnIAAgBQg2hjhVhZIAAgBQhShWhjhCIAAAAQhghBhygqIAAAAQhtgoh5gOIh1gIIh4AHQh2AOhtArQhxAshcBCIAAAAQhbBChTBeIABAAQhPBbg3BqIAAABQg4BogiB2IAAgBQgfBtgNCBIAAgBQgKB4ANB6QANBzAfCBIAAgCQAgB2AyBxIAAAAQAzB2A9BnIABABQA6BpBNBmIAAAAQCfDPC0CiIABABQCbCTDqCuIAAAAQBKA2CFBbIAAAAIIfFyQAHACAGAFIAHAFIAHADIAFACQARAIAUACIgCAAQArACAhgVg");
	this.shape.setTransform(200.8,202.4,0.977,0.987);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(200.8,202.4,400,400);
// library properties:
lib.properties = {
	id: 'AE73493528F8314984C715821BC95068',
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
an.compositions['AE73493528F8314984C715821BC95068'] = {
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