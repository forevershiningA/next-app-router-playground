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
(lib.border8 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#CA9845").s().p("EgdLAidQABjcACgqQghgDh7AzQh7AwhsgbQgPiKBOhpQBphpAtg5Qh7h+gbgnQhFhpAGiKQBjgnBpAtQA8AYBmA8QAPg2AAhCQADgngDhXQgJhaAAgkQgDhLAVhFQgJAAifBCQhmAnh1gSQAJkUDMiBQiHiZgSgbQhLh+A2iKQBggGBaAwQCHBRAGAAQAhhjgVikQgYilAhhUQgngGh4AzQh+AwhmgVQgMiNBLhmQBmhsAwg2Qhvhsgqg8QhRhsAViWQB1gMBgAnQA5AYBgA5IAGAAIAAoTQg8A/g2AhQh4BIhygeQgnhUAnhgQAYg8A8hOIAAgDQAYgkgbgqIgJgbQgDgDg/iWQgqhdAShpQEUAGB+C6QCQh7AhgSQB7hCCHAwQAGBagwBRQhLB+gDADQBgAhCogYQCigSBOAbQAGgegthyQgwhyAVhdQCHgPBpBFQA5AnBmBjQA/gnBmhjQBshLCTAVQAPBsgnBUQgYAzg5BaQBdAPCZAAIEWADQADgbgzhyQgthvAYhjQCKgPBmBFQA5AqBpBgQB4hvAngYQBphCCHAJQAqBXgtBjQgYA2g8BdQBOASCigGIAAADQBdgJAhAAQBLgDBFASQAAgDhCiZQgnhaAShsQERAJCBC6QCNh7AkgSQB4hCCKAwQAGBagwBRQhOB+gDADQBjAhClgYIA5gGIAABsIghAAQjbgGgzADQAPA5BCByQAqBghFBFQiHAMhdhCQgqgbhghyQhaBphRAwQh1BIh1geQgkhXAkhgQAYg8BChLQhpgbi0AGIgGAAQiiAGg5gGQAPAzA5BvQAnBmg5BIQiKAVhghLQhdhjg5gqQhFBmhgA2Qh4BFh1geQgPhsAhhUQAVgzA/hLQgwgbjUAGIkUADQAGAwA5BjQAtBdgqBOQh4AqhvhFQhCgqhXhsQhmBjg2AqQhmBLh7gDQg/hRAqhvQAJgVBOiNQhFADi6AAQjbgGgwADQAPA5A/BvQAqBjhFBFQiHAMhdg/QgbgYhIhLIAAIQIASgDQA5gJBpg8QBmgqBUAqQAwB7hOBvQgtBFh1BUQAwA2BmBpQBRBjAACBQhaA8h4gnQghgMiQhRQAGBLgDC6IgDEQQA/gSB7hCQBsgmBIBEQAPCHhIBgQgeAqh7BjQB1BdAwBLQBRB4gkB4QhaAkhsgkQhCgbhRg/QgbBpADC3IADAAQADC9gGAnQA5gPB4g5QBygnBLA5QAVCNhRBgQgtA2hpBjQBvBIA5BdQBLB4ghB4Qh1AShdgkQg2gVhRhCQgbAwADDYIABAigA9aZoQA8BLBLhIQAJg5ghgbQgJgMhCgeQhaAwA2BLgA9mG4QgJBXB1gVQAngYAAgtQAAgwgngYIgXgCQhPAAgGBNgA9UqpQA5BLBLhIQAJhmhsgSQhaAtA5BIgA8t5CQAMAAAMgDQgDgGgGgGQgGAJgJAGgAHA9EQhIAzBIBFQA5AJAbgeQAMgMAYg5QgZg0gnAAQgZAAgfAWgArO9EQhLAzBFBFQBpAJAVhjQgbgygnAAQgZAAgdAUgAYf7tQAYAhAwAAQAqAAAYghQAPhdhUgGIgMgBQhJAAAQBkgA9m7wQAYAhAwAAQAtAAAYghQAPhdhXgGIgMgBQhJAAAQBkg");
	this.shape.setTransform(225.6,220.5);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(200.2,200,450.8,441);
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