var $hx_exports = $hx_exports || {};
(function ($global) { "use strict";
function $extend(from, fields) {
	var proto = Object.create(from);
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	this.r = new RegExp(r,opt.split("u").join(""));
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) {
			this.r.lastIndex = 0;
		}
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,split: function(s) {
		var d = "#__delim__#";
		return s.replace(this.r,d).split(d);
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) {
		return undefined;
	}
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(len == null) {
		len = s.length;
	} else if(len < 0) {
		if(pos == 0) {
			len = s.length + len;
		} else {
			return "";
		}
	}
	return s.substr(pos,len);
};
HxOverrides.now = function() {
	return Date.now();
};
Math.__name__ = true;
var SimpleSceneModel3D = function() {
	this.reflectionsMetchodsAdded = false;
	this.reflectionsRendered = false;
	this._showReflections = null;
	this.PROP_SHOW_REFLECTIONS = "showReflections";
	Engine3D.model.executors.file.M3DBasicExecutor.call(this);
};
SimpleSceneModel3D.__name__ = true;
SimpleSceneModel3D.__interfaces__ = [Engine3D.model.executors.file.IM3DExecutorProperty,Engine3D.model.executors.file.IM3DExecutorRenderer,Engine3D.model.executors.file.IM3DExecutor];
SimpleSceneModel3D.__super__ = Engine3D.model.executors.file.M3DBasicExecutor;
SimpleSceneModel3D.prototype = $extend(Engine3D.model.executors.file.M3DBasicExecutor.prototype,{
	build: function() {
		this._showReflections = this.setGlobalParamIfNull(Globals.VIEW_DEFAULT_SHOW_REFLECTIONS,this._showReflections);
		this.sceneLightPickerDict = new haxe_ds_StringMap();
		this.cubeReflections = [];
		this.reflectionMethods = [];
	}
	,dispose: function() {
		this.sceneLightPickerDict = null;
		this.cubeReflections = null;
		this.reflectionMethods = null;
		Engine3D.model.executors.file.M3DBasicExecutor.prototype.dispose.call(this);
	}
	,setGlobalParamIfNull: function(globalName,currentValue) {
		if(currentValue != null) {
			return currentValue;
		}
		return this.getGlobals().get(globalName);
	}
	,registerMaterialForSceneLightPicker: function(material,lightPickerParamName) {
		var pickerMaterials;
		if(Object.prototype.hasOwnProperty.call(this.sceneLightPickerDict.h,lightPickerParamName)) {
			pickerMaterials = this.sceneLightPickerDict.h[lightPickerParamName];
		} else {
			pickerMaterials = [];
			this.sceneLightPickerDict.h[lightPickerParamName] = pickerMaterials;
		}
		pickerMaterials.push(material);
	}
	,registerCubeReflection: function(reflection,beforeRenderCallback,afterRenderCallback) {
		this.cubeReflections.push({ reflection : reflection, beforeRenderCallback : beforeRenderCallback, afterRenderCallback : afterRenderCallback});
	}
	,registerReflectionMethod: function(method,material) {
		this.reflectionMethods.push({ method : method, material : material});
	}
	,onAddedToScene: function(sceneData) {
		var h = this.sceneLightPickerDict.h;
		var lname_h = h;
		var lname_keys = Object.keys(h);
		var lname_length = lname_keys.length;
		var lname_current = 0;
		while(lname_current < lname_length) {
			var lname = lname_keys[lname_current++];
			if(!sceneData.hasParam(lname)) {
				console.log("SimpleSceneModel3D.hx:88:","Warning! Light picker '" + lname + "' not exists");
				continue;
			}
			var picker;
			try {
				picker = js_Boot.__cast(sceneData.getParam(lname) , Engine3D.core.materials.lightpickers.LightPickerBase);
			} catch( _g ) {
				picker = null;
			}
			if(picker == null) {
				console.log("SimpleSceneModel3D.hx:93:","Warning! Light picker '" + lname + "' is different type than LightPickerBase");
				continue;
			}
			var pickerMaterials = this.sceneLightPickerDict.h[lname];
			var _g1 = 0;
			var _g2 = pickerMaterials.length;
			while(_g1 < _g2) {
				var i = _g1++;
				pickerMaterials[i].set_lightPicker(picker);
			}
		}
	}
	,onRemovedFromScene: function(sceneData) {
		var _g = 0;
		var _g1 = this.reflectionMethods.length;
		while(_g < _g1) {
			var i = _g++;
			var item = this.reflectionMethods[i];
			item.material.removeMethod(item.method);
		}
		var h = this.sceneLightPickerDict.h;
		var lname_h = h;
		var lname_keys = Object.keys(h);
		var lname_length = lname_keys.length;
		var lname_current = 0;
		while(lname_current < lname_length) {
			var lname = lname_keys[lname_current++];
			var pickerMaterials = this.sceneLightPickerDict.h[lname];
			var _g = 0;
			var _g1 = pickerMaterials.length;
			while(_g < _g1) {
				var i = _g++;
				pickerMaterials[i].set_lightPicker(null);
			}
		}
		this.reflectionsRendered = false;
		this.reflectionsMetchodsAdded = false;
	}
	,onSceneDataChanged: function(sceneData) {
		this.onRemovedFromScene(sceneData);
		this.onAddedToScene(sceneData);
	}
	,updateReflections: function() {
		this.reflectionsRendered = false;
	}
	,beforeViewRender: function(view) {
		if(this._showReflections) {
			var item;
			if(!this.reflectionsRendered) {
				this.reflectionsRendered = true;
				var _g = 0;
				var _g1 = this.cubeReflections.length;
				while(_g < _g1) {
					var i = _g++;
					item = this.cubeReflections[i];
					if(item.beforeRenderCallback != null) {
						item.beforeRenderCallback.call();
					}
					try {
						item.reflection.render(view);
					} catch( _g2 ) {
					}
					if(item.afterRenderCallback != null) {
						item.afterRenderCallback.call();
					}
				}
			}
			if(!this.reflectionsMetchodsAdded) {
				this.reflectionsMetchodsAdded = true;
				var _g = 0;
				var _g1 = this.reflectionMethods.length;
				while(_g < _g1) {
					var i = _g++;
					item = this.reflectionMethods[i];
					item.material.addMethod(item.method);
				}
			}
		}
	}
	,afterViewRender: function(view) {
	}
	,updateProperty: function(name,data) {
		if(name == this.PROP_SHOW_REFLECTIONS) {
			if(this._showReflections == data) {
				return;
			}
			this._showReflections = data;
			if(this._showReflections != true) {
				if(this.reflectionsMetchodsAdded) {
					var item;
					var _g = 0;
					var _g1 = this.reflectionMethods.length;
					while(_g < _g1) {
						var i = _g++;
						item = this.reflectionMethods[i];
						item.material.removeMethod(item.method);
					}
					this.reflectionsMetchodsAdded = false;
				}
				if(this.reflectionsRendered) {
					this.reflectionsRendered = false;
				}
			}
			this.dispatchPropertyChange(this.PROP_SHOW_REFLECTIONS,this._showReflections,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
		}
	}
	,__class__: SimpleSceneModel3D
});
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	if(!(c > 8 && c < 14)) {
		return c == 32;
	} else {
		return true;
	}
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) ++r;
	if(r > 0) {
		return HxOverrides.substr(s,r,l - r);
	} else {
		return s;
	}
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) ++r;
	if(r > 0) {
		return HxOverrides.substr(s,0,l - r);
	} else {
		return s;
	}
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
var away3d_textures_Anisotropy = {};
away3d_textures_Anisotropy.fromString = function(value) {
	switch(value) {
	case "anisotropic16x":
		return 4;
	case "anisotropic2x":
		return 1;
	case "anisotropic4x":
		return 2;
	case "anisotropic8x":
		return 3;
	case "none":
		return 0;
	default:
		return null;
	}
};
away3d_textures_Anisotropy.toString = function(this1) {
	switch(this1) {
	case 0:
		return "bool";
	case 1:
		return "anisotropic2x";
	case 2:
		return "anisotropic4x";
	case 3:
		return "anisotropic8x";
	case 4:
		return "anisotropic16x";
	default:
		return null;
	}
};
var forevershining_ForevershiningSceneParams = function() { };
forevershining_ForevershiningSceneParams.__name__ = true;
var forevershining_headstones_AbstractHeadstoneModel3D = function() {
	this.updateSizeIsDirty = false;
	this.modelOptions = { };
	this._depth = 60;
	this._height = 400;
	this._width = 400;
	this.cornerRound = 1.2;
	this.PROP_FRONT_BITMAP = "front-bitmap";
	this.PROP_COLOR = "color";
	this.PROP_DEPTH = "depth";
	this.PROP_HEIGHT = "height";
	this.PROP_WIDTH = "width";
	this.Z_OFFSET = 10;
	SimpleSceneModel3D.call(this);
};
forevershining_headstones_AbstractHeadstoneModel3D.__name__ = true;
forevershining_headstones_AbstractHeadstoneModel3D.__interfaces__ = [Engine3D.model.executors.file.IM3DExecutorProperty,Engine3D.model.executors.file.IM3DExecutor];
forevershining_headstones_AbstractHeadstoneModel3D.__super__ = SimpleSceneModel3D;
forevershining_headstones_AbstractHeadstoneModel3D.prototype = $extend(SimpleSceneModel3D.prototype,{
	build: function() {
		SimpleSceneModel3D.prototype.build.call(this);
		var tmp;
		try {
			tmp = js_Boot.__cast(this.get_model().getSelectionObject() , Engine3D.model.executors.file.proxies.IStandardSelectionProxy);
		} catch( _g ) {
			tmp = null;
		}
		this.selection = tmp;
		this.buildRegions();
		this.modelPath = this.buildModelPath();
		this._width = this.modelPath.get_bounds().width;
		this._height = this.modelPath.get_bounds().height;
		this.modelPath.set_width(this._width);
		this.modelPath.set_height(this._height);
		this.modelGeometry = new Engine3D.view.graphics3d.primitives.PathGeometry(this.modelPath,this._depth,this.cornerRound,true,true,true,null,this.modelOptions);
		this._colorProperty = new Engine3D.model.executors.utils.properties.ColorTextureProperty(this.PROP_COLOR);
		this.modelMaterial = this._colorProperty.get_material();
		this.registerMaterialForSceneLightPicker(this.modelMaterial,"lights_picker");
		this.colorReflectionCube = new Engine3D.core.textures.CubeReflectionTexture(512);
		this.colorReflectionCube.set_position(new Engine3D.core.geom.Vector3D(0,0,0));
		this.colorReflectionMethod = new Engine3D.core.materials.methods.FresnelEnvMapMethod(this.colorReflectionCube,0.36);
		this.colorReflectionMethod.set_fresnelPower(0.3);
		this.modelMesh = new Engine3D.core.entities.Mesh(this.modelGeometry,this.modelMaterial);
		this.modelMesh.set_castsShadows(true);
		this.modelMesh.set_mouseEnabled(true);
		this.modelMesh.set_pickingCollider(new Engine3D.core.core.pick.HaxePickingCollider(false));
		this.frontMaterial = new Engine3D.core.materials.TextureMaterial(null,true,false);
		this.frontMaterial.set_alphaBlending(true);
		this.registerMaterialForSceneLightPicker(this.frontMaterial,"lights_picker");
		this.registerCubeReflection(this.colorReflectionCube,$bind(this,this.beforeColorReflectionRender),$bind(this,this.afterColorReflectionRender));
		this.registerReflectionMethod(this.colorReflectionMethod,this.modelMaterial);
		this.registerReflectionMethod(this.colorReflectionMethod,this.frontMaterial);
		this.dispatchPropertyChange(this.PROP_WIDTH,this._width,this.DISPATCH_PROPERTY_TYPE_INIT);
		this.dispatchPropertyChange(this.PROP_HEIGHT,this._height,this.DISPATCH_PROPERTY_TYPE_INIT);
		this.dispatchPropertyChange(this.PROP_DEPTH,this._depth,this.DISPATCH_PROPERTY_TYPE_INIT);
		this.dispatchPropertyChange(this.PROP_COLOR,this._colorProperty.get_textureValue(),this.DISPATCH_PROPERTY_TYPE_INIT);
		this.dispatchPropertyChange(this.PROP_FRONT_BITMAP,null,this.DISPATCH_PROPERTY_TYPE_INIT);
		this.get_container().addChild(this.modelMesh);
		this.updateDimensions();
		this.calibrateColorReflection();
		if(this.selection != null) {
			this.updateSelection(this.selection);
		}
	}
	,dispose: function() {
		if(this._colorProperty != null) {
			this._colorProperty.dispose();
			this._colorProperty = null;
		}
		if(this.modelMesh != null) {
			this.get_container().removeChild(this.modelMesh);
			this.modelMesh.disposeWithChildren();
			this.modelMesh = null;
		}
		if(this.frontMesh != null) {
			this.get_container().removeChild(this.frontMesh);
			this.frontMesh.disposeWithChildren();
			this.frontMesh = null;
		}
		if(this.modelGeometry != null) {
			this.modelGeometry.dispose();
			this.modelGeometry = null;
		}
		if(this.frontMaterial != null && this.frontMaterial.get_texture() != null) {
			this.frontMaterial.get_texture().dispose();
			this.frontMaterial.set_texture(null);
		}
		if(this._frontBitmap != null) {
			this._frontBitmap.dispose();
			this._frontBitmap = null;
		}
		if(this.colorReflectionCube != null) {
			this.colorReflectionCube.dispose();
			this.colorReflectionCube = null;
		}
		if(this.colorReflectionMethod != null) {
			this.colorReflectionMethod.dispose();
			this.colorReflectionMethod = null;
		}
		this.modelPath = null;
		SimpleSceneModel3D.prototype.dispose.call(this);
	}
	,get_stoneAreaSquareMetersInfo: function() {
		return this._width / 1000 * (this._height / 1000);
	}
	,stoneVolumeCubicMetersInfo: function(params) {
		return this.get_stoneAreaSquareMetersInfo() * (this._depth / 1000);
	}
	,calibrateColorReflection: function() {
		Engine3D.core.tools.utils.Bounds.getObjectContainerBounds(this.get_container(),true);
		var reflectionPosition = new Engine3D.core.geom.Vector3D(Engine3D.core.tools.utils.Bounds.get_minX() + (Engine3D.core.tools.utils.Bounds.get_maxX() - Engine3D.core.tools.utils.Bounds.get_minX()) * 0.5,Engine3D.core.tools.utils.Bounds.get_minY() + (Engine3D.core.tools.utils.Bounds.get_maxY() - Engine3D.core.tools.utils.Bounds.get_minY()) * 0.5,Engine3D.core.tools.utils.Bounds.get_minZ() + (Engine3D.core.tools.utils.Bounds.get_maxZ() - Engine3D.core.tools.utils.Bounds.get_minZ()) * 0.5);
		this.colorReflectionCube.set_position(reflectionPosition);
		this.updateReflections();
	}
	,beforeColorReflectionRender: function() {
		this.get_container().set_visible(false);
	}
	,afterColorReflectionRender: function() {
		this.get_container().set_visible(true);
	}
	,buildModelPath: function() {
		throw haxe_Exception.thrown("Abstract Method!");
	}
	,buildRegions: function() {
		var tmp;
		try {
			tmp = js_Boot.__cast(this.get_model().getRegion("inscriptions") , Engine3D.model.executors.file.proxies.ISurfaceRegionProxy);
		} catch( _g ) {
			tmp = null;
		}
		this.inscriptionsRegion = tmp;
		this.inscriptionsRegionBounds = this.inscriptionsRegion.getBaseInstance().getBoundsShape();
	}
	,updateRegions: function() {
		if(this.inscriptionsRegion != null) {
			this.inscriptionsRegion.moveTo(0,this._height / 2,this._depth + this.Z_OFFSET);
		}
		if(this.inscriptionsRegionBounds != null) {
			var regionBoundsWidth = this._width | 0;
			var regionBoundsHeight = this._height | 0;
			this.inscriptionsRegionBounds.updateBounds(new Engine3D.core.geom.Rectangle(-regionBoundsWidth / 2,-regionBoundsHeight / 2,regionBoundsWidth,regionBoundsHeight));
		}
	}
	,updateDimensions: function() {
		this.updateSizeIsDirty = true;
	}
	,doUpdateSize: function() {
		this.modelPath.set_width(this._width);
		this.modelPath.set_height(this._height);
		this.modelGeometry.set_thickness(this._depth);
		this.modelMesh.moveTo(0,0,this._depth / 2 + this.Z_OFFSET);
		if(this.frontGeometry != null) {
			this.frontGeometry.set_thickness(this._depth);
			this.frontGeometry.set_uvMappingRect(this.getFrontUVMappging());
			this.frontMesh.moveTo(0,0,this._depth / 2 + this.Z_OFFSET);
		}
		this.updateRegions();
		if(this.selection != null) {
			this.updateSelection(this.selection);
		}
	}
	,updateSelection: function(selection) {
		selection.resizeTo(this._width,this._depth,this._height);
		selection.moveTo(0,this._depth / 2 + this.Z_OFFSET,this._height / 2);
	}
	,getValidTexture: function(tex) {
		if(Engine3D.core.tools.utils.TextureUtils.isBitmapDataValid(tex)) {
			return tex.clone();
		}
		var w = Engine3D.core.tools.utils.TextureUtils.getBestPowerOf2(tex.width);
		var h = Engine3D.core.tools.utils.TextureUtils.getBestPowerOf2(tex.height);
		var bmp = new Engine3D.core.display.BitmapData(w,h,tex.transparent,0);
		bmp.draw(tex,new Engine3D.core.geom.Matrix(w / tex.width,0,0,h / tex.height),null,null,null,true);
		return bmp;
	}
	,getFrontUVMappging: function() {
		var bounds = this.modelPath.get_bounds();
		var scale = bounds.width / bounds.height < this._frontBmpWidth / this._frontBmpHeight ? bounds.width / this._frontBmpWidth : bounds.height / this._frontBmpHeight;
		var w = this._frontBmpWidth * scale;
		var h = this._frontBmpHeight * scale;
		return new Engine3D.core.geom.Rectangle(bounds.get_left() + (bounds.width - w) * 0.5,bounds.get_top() + (bounds.height - h) * 0.5,w,h);
	}
	,updateProperty: function(name,data) {
		if(name == this.PROP_WIDTH) {
			if(typeof(data) != "number" && !(typeof(data) == "number" && ((data | 0) === data)) && typeof(data) != "string") {
				throw haxe_Exception.thrown("Property " + name + " is not type: number");
			}
			if(typeof(data) == "string") {
				data = parseFloat(data);
			}
			if(this._width == data) {
				return;
			}
			this._width = data;
			this.updateDimensions();
			this.dispatchPropertyChange(this.PROP_WIDTH,this._width,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if(name == this.PROP_HEIGHT) {
			if(typeof(data) != "number" && !(typeof(data) == "number" && ((data | 0) === data)) && typeof(data) != "string") {
				throw haxe_Exception.thrown("Property " + name + " is not type: number");
			}
			if(typeof(data) == "string") {
				data = parseFloat(data);
			}
			if(this._height == data) {
				return;
			}
			this._height = data;
			this.updateDimensions();
			this.dispatchPropertyChange(this.PROP_HEIGHT,this._height,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if(name == this.PROP_DEPTH) {
			if(typeof(data) != "number" && !(typeof(data) == "number" && ((data | 0) === data)) && typeof(data) != "string") {
				throw haxe_Exception.thrown("Property " + name + " is not type: number");
			}
			if(typeof(data) == "string") {
				data = parseFloat(data);
			}
			if(this._depth == data) {
				return;
			}
			this._depth = data;
			this.updateDimensions();
			this.dispatchPropertyChange(this.PROP_DEPTH,this._depth,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if(name == this.PROP_COLOR) {
			if(this._colorProperty.change(data)) {
				var uvMap = this._colorProperty.get_optimumUVMap().clone();
				uvMap.inflate(uvMap.width * 2.8,uvMap.height * 2.8);
				this.modelGeometry.set_uvMappingRect(uvMap);
				this.dispatchPropertyChange(this.PROP_COLOR,data,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
			}
		} else if(name == this.PROP_FRONT_BITMAP) {
			if(data != null && (((data) instanceof Engine3D.core.display.BitmapData) || ((data) instanceof Engine3D.core.display.Bitmap))) {
				if(this.frontMaterial != null && this.frontMaterial.get_texture() != null) {
					this.frontMaterial.get_texture().dispose();
					this.frontMaterial.set_texture(null);
				}
				if(this._frontBitmap != null) {
					this._frontBitmap.dispose();
					this._frontBitmap = null;
				}
				if(((data) instanceof Engine3D.core.display.Bitmap)) {
					this._frontBmpWidth = (js_Boot.__cast(data , Engine3D.core.display.Bitmap)).get_bitmapData().width;
					this._frontBmpHeight = (js_Boot.__cast(data , Engine3D.core.display.Bitmap)).get_bitmapData().height;
					this._frontBitmap = this.getValidTexture((js_Boot.__cast(data , Engine3D.core.display.Bitmap)).get_bitmapData());
				} else {
					this._frontBmpWidth = (js_Boot.__cast(data , Engine3D.core.display.BitmapData)).width;
					this._frontBmpHeight = (js_Boot.__cast(data , Engine3D.core.display.BitmapData)).height;
					var tmp;
					try {
						tmp = js_Boot.__cast(data , Engine3D.core.display.BitmapData);
					} catch( _g ) {
						tmp = null;
					}
					this._frontBitmap = this.getValidTexture(tmp);
				}
				this.frontMaterial.set_texture(new Engine3D.core.textures.BitmapTexture(this._frontBitmap));
				if(this.frontGeometry == null || this.frontMesh == null) {
					this.frontGeometry = new Engine3D.view.graphics3d.primitives.PathGeometry(this.modelPath,this._depth,this.cornerRound,true,false,false,this.getFrontUVMappging());
					this.frontMesh = new Engine3D.core.entities.Mesh(this.frontGeometry,this.frontMaterial);
					this.frontMesh.moveTo(0,0,0.1);
					this.get_container().addChild(this.frontMesh);
				}
			} else {
				if(this.frontMaterial != null && this.frontMaterial.get_texture() != null) {
					this.frontMaterial.get_texture().dispose();
					this.frontMaterial.set_texture(null);
				}
				if(this._frontBitmap != null) {
					this._frontBitmap.dispose();
					this._frontBitmap = null;
				}
				if(this.frontMesh != null) {
					if(this.frontMesh.get_parent() != null) {
						this.get_container().removeChild(this.frontMesh);
					}
					this.frontMesh.dispose();
					this.frontMesh = null;
				}
				if(this.frontGeometry != null) {
					this.frontGeometry.dispose();
					this.frontGeometry = null;
				}
			}
		} else {
			SimpleSceneModel3D.prototype.updateProperty.call(this,name,data);
		}
	}
	,beforeViewRender: function(view) {
		if(this.updateSizeIsDirty) {
			try {
				this.doUpdateSize();
				this.updateSizeIsDirty = false;
			} catch( _g ) {
				this.updateSizeIsDirty = false;
			}
		}
		SimpleSceneModel3D.prototype.beforeViewRender.call(this,view);
	}
	,__class__: forevershining_headstones_AbstractHeadstoneModel3D
});
var forevershining_headstones_InnerLineHeadstoneModel3D = function() {
	this.secModelOptions = { };
	this.PROP_COLOR_2 = "color2";
	forevershining_headstones_AbstractHeadstoneModel3D.call(this);
};
forevershining_headstones_InnerLineHeadstoneModel3D.__name__ = true;
forevershining_headstones_InnerLineHeadstoneModel3D.__interfaces__ = [Engine3D.model.executors.file.IM3DExecutorProperty,Engine3D.model.executors.file.IM3DExecutor];
forevershining_headstones_InnerLineHeadstoneModel3D.__super__ = forevershining_headstones_AbstractHeadstoneModel3D;
forevershining_headstones_InnerLineHeadstoneModel3D.prototype = $extend(forevershining_headstones_AbstractHeadstoneModel3D.prototype,{
	build: function() {
		forevershining_headstones_AbstractHeadstoneModel3D.prototype.build.call(this);
		this.secModelPath = this.buildSecModelPath();
		if(this.secModelPath != null) {
			this.secModelPath.set_width(this._width);
			this.secModelPath.set_height(this._height);
			this.secModelGeometry = new Engine3D.view.graphics3d.primitives.PathGeometry(this.secModelPath,this._depth,this.cornerRound,true,true,true,null,this.secModelOptions);
			this._secColorProperty = new Engine3D.model.executors.utils.properties.ColorTextureProperty(this.PROP_COLOR_2,12303291);
			this.secModelMaterial = this._secColorProperty.get_material();
			this.registerMaterialForSceneLightPicker(this.secModelMaterial,"lights_picker");
			this.secModelMesh = new Engine3D.core.entities.Mesh(this.secModelGeometry,this.secModelMaterial);
			this.secModelMesh.set_castsShadows(false);
			this.secModelMesh.set_mouseEnabled(true);
			this.secModelMesh.set_pickingCollider(new Engine3D.core.core.pick.HaxePickingCollider(false));
			this.registerReflectionMethod(this.colorReflectionMethod,this.secModelMaterial);
			this.get_container().addChild(this.secModelMesh);
		}
	}
	,dispose: function() {
		if(this._secColorProperty != null) {
			this._secColorProperty.dispose();
			this._secColorProperty = null;
		}
		if(this.secModelMesh != null) {
			this.get_container().removeChild(this.secModelMesh);
			this.secModelMesh.disposeWithChildren();
			this.secModelMesh = null;
		}
		if(this.secModelGeometry != null) {
			this.secModelGeometry.dispose();
			this.secModelGeometry = null;
		}
		this.secModelPath = null;
		forevershining_headstones_AbstractHeadstoneModel3D.prototype.dispose.call(this);
	}
	,buildSecModelPath: function() {
		return null;
	}
	,doUpdateSize: function() {
		forevershining_headstones_AbstractHeadstoneModel3D.prototype.doUpdateSize.call(this);
		if(this.secModelPath != null) {
			this.secModelPath.set_width(this._width);
			this.secModelPath.set_height(this._height);
			this.secModelGeometry.set_thickness(this._depth);
			this.secModelMesh.moveTo(0,0,this._depth / 2 + this.Z_OFFSET);
		}
	}
	,updateProperty: function(name,data) {
		if(name == this.PROP_COLOR_2) {
			if(this._secColorProperty.change(data)) {
				var uvMap = this._secColorProperty.get_optimumUVMap().clone();
				uvMap.inflate(uvMap.width * 2.8,uvMap.height * 2.8);
				this.secModelGeometry.set_uvMappingRect(uvMap);
				this.dispatchPropertyChange(this.PROP_COLOR_2,data,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
			}
		} else {
			forevershining_headstones_AbstractHeadstoneModel3D.prototype.updateProperty.call(this,name,data);
		}
	}
	,__class__: forevershining_headstones_InnerLineHeadstoneModel3D
});
var forevershining_headstones_SVGPathReader = function(pathString) {
	this.pathString = pathString;
	this.discretePoints = [];
	this.parse(pathString);
};
forevershining_headstones_SVGPathReader.__name__ = true;
forevershining_headstones_SVGPathReader.prototype = {
	getPoints: function() {
		return this.discretePoints;
	}
	,parse: function(pathString) {
		var splitRegex = new EReg("(?<=\\d)(?=[A-Za-z])|(?=\\d)(?<=[A-Za-z])|(?=\\-)|[\\s,]+","g");
		var isNumberRegex = new EReg("^\\-?\\d*(\\.\\d+)?$","");
		var splitted = splitRegex.split(StringTools.trim(pathString));
		var i = splitted.length;
		while(i-- > 0) if(splitted[i].length == 0) {
			splitted.splice(i,1);
		}
		var firstMode = null;
		var fpoint = false;
		var fptx = 0;
		var fpty = 0;
		var lastMode = null;
		var mode = null;
		var relativeMode = false;
		var ptx;
		var pty = 0;
		var it_current = 0;
		var it_array = splitted;
		while(it_current < it_array.length) {
			var cmd = it_array[it_current++];
			if(!isNumberRegex.match(cmd)) {
				lastMode = mode;
				mode = cmd.toUpperCase();
				relativeMode = cmd.toLowerCase() == cmd;
				continue;
			}
			switch(mode) {
			case "C":
				var cx1 = parseFloat(cmd);
				var cy1 = parseFloat(it_array[it_current++]);
				var cx2 = parseFloat(it_array[it_current++]);
				var cy2 = parseFloat(it_array[it_current++]);
				ptx = parseFloat(it_array[it_current++]);
				pty = parseFloat(it_array[it_current++]);
				if(!fpoint) {
					fptx = ptx;
					fpty = pty;
					fpoint = true;
				}
				if(firstMode == null) {
					firstMode = mode;
				}
				var firstPoint = new Engine3D.core.geom.Point(fptx,fpty);
				if(this.discretePoints.length > 0) {
					firstPoint = this.discretePoints[this.discretePoints.length - 1];
				}
				if(relativeMode) {
					cx1 += firstPoint.x;
					cy1 += firstPoint.y;
					cx2 += firstPoint.x;
					cy2 += firstPoint.y;
					ptx += firstPoint.x;
					pty += firstPoint.y;
				}
				Engine3D.graphics.algorithms.Bezier.toDiscretePoints([new Engine3D.core.geom.Point(firstPoint.x,firstPoint.y),new Engine3D.core.geom.Point(cx1,cy1),new Engine3D.core.geom.Point(cx2,cy2),new Engine3D.core.geom.Point(ptx,pty)],this.discretePoints,10);
				this.discretePoints.push(new Engine3D.graphics.path.DiscretePoint(ptx,pty));
				break;
			case "H":
				ptx = parseFloat(cmd);
				if(!fpoint) {
					fptx = ptx;
					fpoint = true;
				}
				if(firstMode == null) {
					firstMode = mode;
				}
				var firstPoint1 = new Engine3D.core.geom.Point(fptx,fpty);
				if(this.discretePoints.length > 0) {
					firstPoint1 = this.discretePoints.pop();
					this.discretePoints.push(new Engine3D.graphics.path.DiscreteCornerPoint(firstPoint1.x,firstPoint1.y));
				}
				if(relativeMode) {
					ptx += firstPoint1.x;
				}
				this.discretePoints.push(new Engine3D.graphics.path.DiscreteCornerPoint(ptx,firstPoint1.y));
				break;
			case "L":
				ptx = parseFloat(cmd);
				pty = parseFloat(it_array[it_current++]);
				if(!fpoint) {
					fptx = ptx;
					fpty = pty;
					fpoint = true;
				}
				if(firstMode == null) {
					firstMode = mode;
				}
				var firstPoint2 = new Engine3D.core.geom.Point(fptx,fpty);
				if(this.discretePoints.length > 0) {
					firstPoint2 = this.discretePoints.pop();
					this.discretePoints.push(new Engine3D.graphics.path.DiscreteCornerPoint(firstPoint2.x,firstPoint2.y));
				}
				if(relativeMode) {
					ptx += firstPoint2.x;
					pty += firstPoint2.y;
				}
				this.discretePoints.push(new Engine3D.graphics.path.DiscreteCornerPoint(ptx,pty));
				break;
			case "M":
				ptx = parseFloat(cmd);
				pty = parseFloat(it_array[it_current++]);
				if(!fpoint) {
					fptx = ptx;
					fpty = pty;
					fpoint = true;
				}
				break;
			case "Q":
				var cx = parseFloat(cmd);
				var cy = parseFloat(it_array[it_current++]);
				ptx = parseFloat(it_array[it_current++]);
				pty = parseFloat(it_array[it_current++]);
				if(!fpoint) {
					fptx = ptx;
					fpty = pty;
					fpoint = true;
				}
				if(firstMode == null) {
					firstMode = mode;
				}
				var firstPoint3 = new Engine3D.core.geom.Point(fptx,fpty);
				if(this.discretePoints.length > 0) {
					firstPoint3 = this.discretePoints[this.discretePoints.length - 1];
				}
				Engine3D.graphics.algorithms.Bezier.toDiscretePoints([new Engine3D.core.geom.Point(firstPoint3.x,firstPoint3.y),new Engine3D.core.geom.Point(cx,cy),new Engine3D.core.geom.Point(ptx,pty)],this.discretePoints,10);
				this.discretePoints.push(new Engine3D.graphics.path.DiscretePoint(ptx,pty));
				break;
			case "S":
				var cx21 = parseFloat(cmd);
				var cy21 = parseFloat(it_array[it_current++]);
				ptx = parseFloat(it_array[it_current++]);
				pty = parseFloat(it_array[it_current++]);
				if(!fpoint) {
					fptx = ptx;
					fpty = pty;
					fpoint = true;
				}
				if(firstMode == null) {
					firstMode = mode;
				}
				var firstPoint4 = new Engine3D.core.geom.Point(fptx,fpty);
				if(this.discretePoints.length > 0) {
					firstPoint4 = this.discretePoints[this.discretePoints.length - 1];
				}
				if(relativeMode) {
					cx21 += firstPoint4.x;
					cy21 += firstPoint4.y;
					ptx += firstPoint4.x;
					pty += firstPoint4.y;
				}
				Engine3D.graphics.algorithms.Bezier.toDiscretePoints([new Engine3D.core.geom.Point(firstPoint4.x,firstPoint4.y),new Engine3D.core.geom.Point(cx21,cy21),new Engine3D.core.geom.Point(ptx,pty)],this.discretePoints,10);
				this.discretePoints.push(new Engine3D.graphics.path.DiscretePoint(ptx,pty));
				break;
			case "V":
				pty = parseFloat(cmd);
				if(!fpoint) {
					fpty = pty;
					fpoint = true;
				}
				if(firstMode == null) {
					firstMode = mode;
				}
				var firstPoint5 = new Engine3D.core.geom.Point(fptx,fpty);
				if(this.discretePoints.length > 0) {
					firstPoint5 = this.discretePoints.pop();
					this.discretePoints.push(new Engine3D.graphics.path.DiscreteCornerPoint(firstPoint5.x,firstPoint5.y));
				}
				if(relativeMode) {
					pty += firstPoint5.y;
				}
				this.discretePoints.push(new Engine3D.graphics.path.DiscreteCornerPoint(firstPoint5.x,pty));
				break;
			case "Z":
				break;
			default:
				throw haxe_Exception.thrown("Unsupported mode " + mode);
			}
		}
	}
	,__class__: forevershining_headstones_SVGPathReader
};
var forevershining_headstones_T1InnerLineHeadstoneModel3D = function() {
	forevershining_headstones_InnerLineHeadstoneModel3D.call(this);
};
forevershining_headstones_T1InnerLineHeadstoneModel3D.__name__ = true;
forevershining_headstones_T1InnerLineHeadstoneModel3D.__interfaces__ = [Engine3D.model.executors.file.IM3DExecutorProperty,Engine3D.model.executors.file.IM3DExecutor];
forevershining_headstones_T1InnerLineHeadstoneModel3D.__super__ = forevershining_headstones_InnerLineHeadstoneModel3D;
forevershining_headstones_T1InnerLineHeadstoneModel3D.prototype = $extend(forevershining_headstones_InnerLineHeadstoneModel3D.prototype,{
	buildModelPath: function() {
		var reader = new forevershining_headstones_SVGPathReader(this.buildOuterPath());
		var points = reader.getPoints();
		var path = this.buildScalingDiscretePath(points,this.getOuterDirection());
		reader = new forevershining_headstones_SVGPathReader(this.buildInnerPath());
		points = reader.getPoints();
		path.addInnerPath(this.buildScalingDiscretePath(points,this.getInnerDirection()));
		forevershining_headstones_Utils.svgToModelCoordinatesPath(path);
		this.modelOptions["hasInnerSide"] = false;
		this.modelOptions["hasFrontInnerCorner"] = true;
		this.modelOptions["hasBackInnerCorner"] = false;
		this.modelOptions["hasBackHoles"] = false;
		return path;
	}
	,buildSecModelPath: function() {
		var reader = new forevershining_headstones_SVGPathReader(this.buildOuterPath());
		var points = reader.getPoints();
		var path = this.buildScalingDiscretePath(points,this.getOuterDirection());
		reader = new forevershining_headstones_SVGPathReader(this.buildInnerPath());
		points = reader.getPoints();
		path.addInnerPath(this.buildScalingDiscretePath(points,this.getInnerDirection()));
		forevershining_headstones_Utils.svgToModelCoordinatesPath(path);
		this.secModelOptions["hasSide"] = false;
		this.secModelOptions["hasInnerSide"] = false;
		this.secModelOptions["hasFront"] = false;
		this.secModelOptions["hasFrontCorner"] = false;
		this.secModelOptions["hasFrontInnerCorner"] = false;
		this.secModelOptions["hasFrontCappedHoles"] = true;
		this.secModelOptions["hasBackInnerCorner"] = false;
		this.secModelOptions["hasBack"] = false;
		this.secModelOptions["hasBackCorner"] = false;
		this.secModelOptions["hasBackInnerCorner"] = false;
		this.secModelOptions["hasBackCappedHoles"] = false;
		this.secModelOptions["hasBackHoles"] = false;
		return path;
	}
	,getOuterDirection: function() {
		throw haxe_Exception.thrown("Abstract Method!");
	}
	,getInnerDirection: function() {
		throw haxe_Exception.thrown("Abstract Method!");
	}
	,buildOuterPath: function() {
		throw haxe_Exception.thrown("Abstract Method!");
	}
	,buildInnerPath: function() {
		throw haxe_Exception.thrown("Abstract Method!");
	}
	,buildScalingDiscretePath: function(points,direction) {
		return new Engine3D.graphics.path.ScalingDiscretePath(points,false,false,direction);
	}
	,__class__: forevershining_headstones_T1InnerLineHeadstoneModel3D
});
var forevershining_headstones_Utils = function() { };
forevershining_headstones_Utils.__name__ = true;
forevershining_headstones_Utils.svgToModelCoordinatesPath = function(path) {
	var points = [];
	var _g = 0;
	var _g1 = path.getVector();
	while(_g < _g1.length) {
		var p = _g1[_g];
		++_g;
		var tmp;
		try {
			tmp = js_Boot.__cast(p.clone() , Engine3D.graphics.path.DiscretePoint);
		} catch( _g2 ) {
			tmp = null;
		}
		points.push(tmp);
	}
	var bounds = forevershining_headstones_Utils.calculateBounds(points);
	forevershining_headstones_Utils.recalculatePoints(points,bounds);
	path.setPoints(points);
	var _g = 0;
	var _g1 = path.getInnerPaths();
	while(_g < _g1.length) {
		var innerPath = _g1[_g];
		++_g;
		points = [];
		var _g2 = 0;
		var _g3 = innerPath.getVector();
		while(_g2 < _g3.length) {
			var p = _g3[_g2];
			++_g2;
			var tmp;
			try {
				tmp = js_Boot.__cast(p.clone() , Engine3D.graphics.path.DiscretePoint);
			} catch( _g4 ) {
				tmp = null;
			}
			points.push(tmp);
		}
		forevershining_headstones_Utils.recalculatePoints(points,bounds);
		innerPath.setPoints(points);
	}
};
forevershining_headstones_Utils.svgToModelCoordinates = function(points) {
	var bounds = forevershining_headstones_Utils.calculateBounds(points);
	forevershining_headstones_Utils.recalculatePoints(points,bounds);
};
forevershining_headstones_Utils.recalculatePoints = function(points,bounds) {
	var _g = 0;
	while(_g < points.length) {
		var point = points[_g];
		++_g;
		point.x -= bounds.get_left();
		point.x -= bounds.width / 2;
		point.x *= -1;
		point.y -= bounds.get_top();
		point.y *= -1;
		point.y += bounds.height;
	}
};
forevershining_headstones_Utils.calculateBounds = function(points) {
	var left = Infinity;
	var top = Infinity;
	var right = -Infinity;
	var bottom = -Infinity;
	var i = 1;
	while(i < points.length) {
		var point = points[i];
		if(point.x < left) {
			left = point.x;
		}
		if(point.y < top) {
			top = point.y;
		}
		if(point.x > right) {
			right = point.x;
		}
		if(point.y > bottom) {
			bottom = point.y;
		}
		++i;
	}
	var bounds = new Engine3D.core.geom.Rectangle();
	bounds.set_left(left);
	bounds.set_top(top);
	bounds.set_right(right);
	bounds.set_bottom(bottom);
	return bounds;
};
var forevershining_headstones_headstone_$43_MainExecutor = $hx_exports["Executor"] = function() {
	forevershining_headstones_T1InnerLineHeadstoneModel3D.call(this);
};
forevershining_headstones_headstone_$43_MainExecutor.__name__ = true;
forevershining_headstones_headstone_$43_MainExecutor.__super__ = forevershining_headstones_T1InnerLineHeadstoneModel3D;
forevershining_headstones_headstone_$43_MainExecutor.prototype = $extend(forevershining_headstones_T1InnerLineHeadstoneModel3D.prototype,{
	getOuterDirection: function() {
		return 1;
	}
	,getInnerDirection: function() {
		return 1;
	}
	,buildOuterPath: function() {
		return "M64.4,177.6l4.2-11.1c0.9-2.1,2.2-4.1,3.8-5.8c0.1-0.9,0.5-1.6,1.3-2.2l2.3-1.7" + "l4.3-2.4l6.2-2.7l5.9-2l3.1-0.6l-16.2-0.8l-8-0.9c-4.4-0.2-8.5-1.4-12.4-3.4c-3.9-2-7.2-4.8-9.8-8.3c-0.7-3.3-1.8-6.5-3.5-9.6" + "l-4.9-35.1L38.5,79l-0.3-4.8c0-2.6-0.5-5.1-1.5-7.6c-2.2-6.3-4.6-12.4-7.3-18.3l-0.7-3.4L27,42.2L19.8,24l-1.5-5" + "c-0.6-2.4-0.5-4.7,0.4-7.1c0.1-1.7,0.5-3.3,1.3-4.8c0.7-1.5,1.8-2.8,3.1-3.9l3.6-2.7c2.7-1.7,5.6-2.7,8.8-3c2.9-0.2,5.9,0,8.8,0.4" + "l19,2.3c9,2.3,17.8,5,26.4,8.1c5.5,2.1,10.7,4.8,15.6,8c10.3,4.5,19.6,10.5,27.8,18c10,9.1,18.7,19.2,26.2,30.4" + "c7.5,11.4,14.3,23.1,20.4,35l10.8,20.3l0.3-0.6l0.4-8c0.4-3.7,1.5-7.2,3.3-10.6l-2.1-2.4c-1.3-2-1.9-4.1-1.8-6.4" + "c0.1-2.4,0.9-4.4,2.4-6.3c0.9-1.1,1.9-1.9,3.1-2.6c1.2-0.6,2.5-1,3.9-1c1.4,0,2.7,0.4,3.9,1c1.2,0.6,2.3,1.5,3.1,2.6" + "c1.5,1.8,2.3,3.9,2.4,6.3c0.1,2.3-0.5,4.4-1.8,6.4l-2.2,2.4c1.8,3.3,2.8,6.8,3.3,10.6l0.3,8l0.4,0.6l10.8-20.3" + "c6.1-11.9,12.9-23.6,20.3-35c7.5-11.1,16.2-21.3,26.3-30.4c8.3-7.5,17.6-13.5,27.8-18c5-3.2,10.2-5.9,15.6-8" + "c8.7-3.1,17.5-5.8,26.4-8.1L355.9-2c2.9-0.4,5.9-0.5,8.8-0.4c3.2,0.3,6.1,1.3,8.8,3l3.6,2.7c1.3,1.1,2.3,2.4,3.1,3.9" + "s1.2,3.1,1.3,4.8c0.9,2.3,1,4.7,0.4,7.1l-1.4,5l-7.1,18.2l-1.8,2.8l-0.7,3.4c-2.8,6.1-5.2,12.2-7.3,18.3c-1,2.5-1.5,5-1.6,7.6" + "l-0.2,4.8l-2.1,11.9l-4.9,35.1c-1.6,3-2.8,6.2-3.4,9.6c-2.7,3.5-6,6.3-9.9,8.3c-3.9,2-8,3.2-12.5,3.4l-8,0.9l-16.1,0.8l3.1,0.6" + "l5.9,2l6.3,2.7l4.3,2.4l2.3,1.7c0.7,0.6,1.2,1.3,1.3,2.2c1.5,1.8,2.8,3.7,3.7,5.8l4.2,11.1l5,4.6l60.3,55.6v164.7H-0.9V237.8" + "L64.4,177.6z";
	}
	,buildInnerPath: function() {
		return "M59.4,184.5c1.5,2.8,2.3,5.8,2.4,8.9c0,1.7-0.4,3.3-1.2,4.8c-0.8,1.5-1.8,2.8-3.1,3.9l-1.1,4.3l-1.1,2.7l2.5,4.1" + "c1,1.3,2.2,2.4,3.8,3.2c1.5,0.7,3.1,1.1,4.8,0.9c0.6,0.4,1.1,0.9,1.5,1.5l1.8,5.8c0.7,1.9,1.8,3.5,3.4,4.9l0.2,0.6" + "c-0.1,0.9-0.5,1.7-1,2.5l-3.2,5.5c-0.8,1.5-1.2,3.2-1,5c0.1,1.7,0.7,3.3,1.8,4.7c1.4,1.9,3.2,3.5,5.2,4.9l4.1,2.7" + "c2.2,1.6,3.9,3.6,5,6.1c1.5,3.6,2.2,7.3,2.1,11.2L82.9,284c-0.4,1.4-1,2.7-1.8,3.8l-6.8,13.1l-4.1,9.7l-2.6,7.4" + "c-0.8,2.3-1,4.6-0.8,7.1c0.3,2.4,1,4.6,2.3,6.7c1,1.4,2.1,2.6,3.5,3.6c1.4,1,3,1.7,4.7,2.1c1.5-0.1,2.8-0.5,4.1-1.2" + "c1.3-0.7,2.3-1.6,3.3-2.8l2.2-2.6l1.2-10.8c0.2-5.2,1-10.3,2.3-15.3c0.7-2.7,1.6-5.4,2.8-7.9c0.8-1.9,1.8-3.7,3.1-5.4" + "c1.3-2.1,3.2-3.6,5.6-4.4l6.3-1.2l3.8,0.6l3.1,1.2l6.4,1.5c4.6,1.8,9.4,2.5,14.3,2.1l5.6-0.7l4.8-1.2l3.4-1.5" + "c1.9-0.9,3.3-2.3,4.2-4.1l0.9-3.2c0-0.7,0.2-1.3,0.6-1.8l0.5-0.4l6.6-3.9c2.3-1.4,4.2-3.2,5.4-5.5l1.3-2.9" + "c1.7-16.8,4.8-33.3,9.4-49.4l2.6-11.4l2.5-8.7l2.4-6.4l4.6-8.4l2.3,19.6l1.4,7.5l1.3,4c0.5,1.6,1.4,3,2.6,4.3" + "c0.5,0.6,1.2,1,1.9,1.3c0.8-0.3,1.4-0.7,1.9-1.3c1.2-1.2,2-2.7,2.6-4.3l1.3-4l1.4-7.5l2.4-19.6l4.5,8.4l2.5,6.4l2.5,8.7l2.6,11.4" + "c4.7,16.1,7.8,32.6,9.5,49.4l1.2,2.9c1.3,2.3,3.2,4.2,5.5,5.5l6.6,3.9l0.6,0.4c0.4,0.5,0.6,1.1,0.6,1.8l0.8,3.2" + "c0.9,1.9,2.3,3.2,4.2,4.1l3.4,1.5l4.7,1.2l5.6,0.7c4.9,0.4,9.7-0.3,14.3-2.1l6.4-1.5l3.2-1.2l3.8-0.6l6.3,1.2" + "c2.4,0.8,4.3,2.3,5.6,4.4c1.2,1.7,2.2,3.5,3.1,5.4c1.2,2.6,2.1,5.3,2.8,7.9c1.3,5.1,2.1,10.1,2.3,15.3l1.2,10.8l2.2,2.6" + "c0.9,1.1,2,2,3.3,2.8s2.6,1.1,4.1,1.2c1.7-0.4,3.3-1.1,4.6-2.1c1.4-1,2.6-2.2,3.6-3.6c1.3-2.1,2-4.3,2.3-6.7" + "c0.3-2.4,0-4.8-0.8-7.1l-2.6-7.4l-4-9.7l-6.9-13.1c-0.8-1.2-1.4-2.5-1.8-3.8l-3.4-11.4c-0.1-3.9,0.7-7.7,2.2-11.2" + "c1.1-2.5,2.8-4.5,5-6.1l4-2.7c2-1.3,3.7-3,5.2-4.9c1-1.4,1.6-3,1.8-4.7c0.1-1.8-0.2-3.4-1-5l-3.2-5.5c-0.5-0.8-0.8-1.6-1-2.5" + "l0.2-0.6c1.6-1.3,2.7-2.9,3.5-4.9l1.8-5.8c0.3-0.6,0.8-1.1,1.5-1.5c1.7,0.1,3.3-0.2,4.8-0.9c1.5-0.8,2.8-1.8,3.8-3.2l2.5-4.1" + "l-1-2.7l-1.1-4.3c-1.3-1-2.4-2.3-3.1-3.9c-0.7-1.5-1.1-3.1-1.2-4.8c0.1-3.2,0.9-6.1,2.5-8.9l-2.3-2.3c0.1,0.5,0.1,1,0.1,1.6" + "c-1.6,3-2.4,6.2-2.5,9.6c0.1,1.9,0.5,3.7,1.3,5.4c0.8,1.7,1.9,3.2,3.4,4.5l1,3.7l0.7,1.8l-1.8,3.1c-0.8,1.1-1.9,1.9-3.2,2.4" + "c-1.2,0.6-2.5,0.8-3.9,0.7c-1.5,0.5-2.5,1.5-3.1,2.9l-1.9,6c-0.5,1.3-1.3,2.5-2.4,3.4h-0.7l-0.8,2.5c0.1,1.4,0.5,2.7,1.3,3.9" + "l3.2,5.4c0.6,1.1,0.9,2.3,0.8,3.6c-0.1,1.3-0.6,2.5-1.4,3.6c-1.3,1.7-2.9,3.2-4.6,4.4l-4,2.6c-2.6,1.9-4.5,4.2-5.8,7" + "c-1.7,3.9-2.4,8.1-2.3,12.5l3.4,11.6c0.5,1.6,1.2,3,2.1,4.4l6.7,12.9l6.6,16.9c0.6,2,0.8,4,0.6,6c-0.2,2.1-0.9,4-2,5.8" + "c-0.8,1.1-1.7,2.1-2.8,2.9c-1.1,0.8-2.3,1.4-3.6,1.8c-1.1-0.1-2.1-0.5-3.1-1c-1-0.5-1.8-1.2-2.4-2.1l-1.8-2l-1.1-9.9" + "c-0.2-5.4-1-10.6-2.4-15.7c-0.7-2.9-1.7-5.7-2.9-8.3c-0.9-2.1-2-4-3.3-5.8c-0.8-1.2-1.8-2.3-3-3.2c-1.2-0.9-2.5-1.6-3.9-2.1" + "l-6.9-1.4l-4.4,0.7l-3.2,1.3l-6.4,1.5c-4.3,1.7-8.8,2.4-13.4,2l-5.4-0.6l-4.4-1.1l-3.2-1.4c-1.3-0.6-2.3-1.6-3.1-2.9l-0.7-2.7" + "c-0.1-1.2-0.6-2.3-1.4-3.2l-0.9-0.6l-6.6-3.9c-1.9-1.1-3.5-2.6-4.6-4.5l-1-2.5c-1.7-16.7-4.9-33.2-9.5-49.4l-2.6-11.3l-2.6-8.9" + "l-2.5-6.6l-2.5-5.2l-2.4-3.8l-2.8-3.3l-0.4,0.1l-0.4,1.4l-2.7,22.5l-1.4,7.3l-1.2,3.9c-0.4,1.3-1.1,2.4-2,3.4l-0.3,0.3l-0.3-0.3" + "c-0.9-1-1.6-2.1-2.1-3.4l-1.3-3.9l-1.4-7.3l-2.7-22.5l-0.4-1.4l-0.4-0.1l-2.8,3.3l-2.4,3.8l-2.5,5.2l-2.5,6.6l-2.5,8.9l-2.6,11.3" + "c-4.7,16.1-7.8,32.6-9.6,49.4l-1,2.5c-1.2,1.9-2.7,3.4-4.6,4.5l-7.5,4.5c-0.8,0.9-1.3,1.9-1.4,3.2l-0.7,2.7" + "c-0.7,1.3-1.7,2.3-3.1,2.9l-3.2,1.4l-4.4,1.1l-5.4,0.6c-4.6,0.4-9.1-0.3-13.4-2l-6.4-1.5l-3.2-1.3l-4.4-0.7l-6.9,1.4" + "c-1.4,0.4-2.7,1.1-3.8,2.1c-1.2,0.9-2.2,2-3,3.2c-1.3,1.8-2.4,3.8-3.3,5.8c-1.2,2.6-2.1,5.3-2.9,8.3c-1.3,5.2-2.1,10.4-2.3,15.7" + "l-1.1,9.9l-1.8,2c-0.7,0.9-1.5,1.6-2.4,2.1c-0.9,0.5-1.9,0.9-3,1c-1.3-0.4-2.6-0.9-3.7-1.8c-1.1-0.8-2.1-1.8-2.8-2.9" + "c-1.1-1.8-1.7-3.7-2-5.8c-0.2-2.1,0-4.1,0.6-6l6.6-16.9L83,289c0.9-1.3,1.6-2.8,2.1-4.4l3.4-11.6c0.1-4.3-0.6-8.5-2.3-12.5" + "c-1.3-2.8-3.2-5.2-5.8-7l-4.1-2.6c-1.8-1.3-3.3-2.7-4.6-4.4c-0.8-1.1-1.3-2.3-1.3-3.6c-0.1-1.3,0.1-2.5,0.7-3.6l3.2-5.4" + "c0.7-1.2,1.2-2.5,1.3-3.9l-0.8-2.5h-0.7c-1-1-1.8-2.1-2.3-3.4l-1.8-6c-0.7-1.4-1.7-2.4-3.2-2.9c-1.4,0.1-2.7-0.1-4-0.7" + "c-1.3-0.5-2.3-1.3-3.1-2.4l-1.9-3.1l0.7-1.8l1-3.7c1.4-1.2,2.5-2.7,3.3-4.5c0.8-1.7,1.2-3.6,1.3-5.4c-0.1-3.4-0.9-6.6-2.5-9.6" + "c-0.1-0.6,0-1.1,0.1-1.6L59.4,184.5z";
	}
	,__class__: forevershining_headstones_headstone_$43_MainExecutor
});
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
haxe_IMap.__isInterface__ = true;
var haxe_Exception = function(message,previous,native) {
	Error.call(this,message);
	this.message = message;
	this.__previousException = previous;
	this.__nativeException = native != null ? native : this;
};
haxe_Exception.__name__ = true;
haxe_Exception.thrown = function(value) {
	if(((value) instanceof haxe_Exception)) {
		return value.get_native();
	} else if(((value) instanceof Error)) {
		return value;
	} else {
		var e = new haxe_ValueException(value);
		return e;
	}
};
haxe_Exception.__super__ = Error;
haxe_Exception.prototype = $extend(Error.prototype,{
	get_native: function() {
		return this.__nativeException;
	}
	,__class__: haxe_Exception
});
var haxe_ValueException = function(value,previous,native) {
	haxe_Exception.call(this,String(value),previous,native);
	this.value = value;
};
haxe_ValueException.__name__ = true;
haxe_ValueException.__super__ = haxe_Exception;
haxe_ValueException.prototype = $extend(haxe_Exception.prototype,{
	__class__: haxe_ValueException
});
var haxe_ds_StringMap = function() {
	this.h = Object.create(null);
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	__class__: haxe_ds_StringMap
};
var haxe_iterators_ArrayIterator = function(array) {
	this.current = 0;
	this.array = array;
};
haxe_iterators_ArrayIterator.__name__ = true;
haxe_iterators_ArrayIterator.prototype = {
	hasNext: function() {
		return this.current < this.array.length;
	}
	,next: function() {
		return this.array[this.current++];
	}
	,__class__: haxe_iterators_ArrayIterator
};
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if(o == null) {
		return null;
	} else if(((o) instanceof Array)) {
		return Array;
	} else {
		var cl = o.__class__;
		if(cl != null) {
			return cl;
		}
		var name = js_Boot.__nativeClassName(o);
		if(name != null) {
			return js_Boot.__resolveNativeClass(name);
		}
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) {
		return "null";
	}
	if(s.length >= 5) {
		return "<...>";
	}
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) {
		t = "object";
	}
	switch(t) {
	case "function":
		return "<function>";
	case "object":
		if(((o) instanceof Array)) {
			var str = "[";
			s += "\t";
			var _g = 0;
			var _g1 = o.length;
			while(_g < _g1) {
				var i = _g++;
				str += (i > 0 ? "," : "") + js_Boot.__string_rec(o[i],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( _g ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") {
				return s2;
			}
		}
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		var k = null;
		for( k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) {
			str += ", \n";
		}
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) {
		return false;
	}
	if(cc == cl) {
		return true;
	}
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g = 0;
		var _g1 = intf.length;
		while(_g < _g1) {
			var i = _g++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) {
				return true;
			}
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) {
		return false;
	}
	switch(cl) {
	case Array:
		return ((o) instanceof Array);
	case Bool:
		return typeof(o) == "boolean";
	case Dynamic:
		return o != null;
	case Float:
		return typeof(o) == "number";
	case Int:
		if(typeof(o) == "number") {
			return ((o | 0) === o);
		} else {
			return false;
		}
		break;
	case String:
		return typeof(o) == "string";
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(js_Boot.__downcastCheck(o,cl)) {
					return true;
				}
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(((o) instanceof cl)) {
					return true;
				}
			}
		} else {
			return false;
		}
		if(cl == Class ? o.__name__ != null : false) {
			return true;
		}
		if(cl == Enum ? o.__ename__ != null : false) {
			return true;
		}
		return false;
	}
};
js_Boot.__downcastCheck = function(o,cl) {
	if(!((o) instanceof cl)) {
		if(cl.__isInterface__) {
			return js_Boot.__interfLoop(js_Boot.getClass(o),cl);
		} else {
			return false;
		}
	} else {
		return true;
	}
};
js_Boot.__cast = function(o,t) {
	if(o == null || js_Boot.__instanceof(o,t)) {
		return o;
	} else {
		throw haxe_Exception.thrown("Cannot cast " + Std.string(o) + " to " + Std.string(t));
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") {
		return null;
	}
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var $_;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $global.$haxeUID++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = m.bind(o); o.hx__closures__[m.__id__] = f; } return f; }
$global.$haxeUID |= 0;
if(typeof(performance) != "undefined" ? typeof(performance.now) == "function" : false) {
	HxOverrides.now = performance.now.bind(performance);
}
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Int = { };
var Dynamic = { };
var Float = Number;
var Bool = Boolean;
var Class = { };
var Enum = { };
js_Boot.__toStr = ({ }).toString;
away3d_textures_Anisotropy.NONE = 0;
away3d_textures_Anisotropy.ANISOTROPIC2X = 1;
away3d_textures_Anisotropy.ANISOTROPIC4X = 2;
away3d_textures_Anisotropy.ANISOTROPIC8X = 3;
away3d_textures_Anisotropy.ANISOTROPIC16X = 4;
forevershining_ForevershiningSceneParams.LIGHTS = "lights";
forevershining_ForevershiningSceneParams.STEEL_LIGHTS = "steelLights";
forevershining_ForevershiningSceneParams.OTHER_LIGHTS = "otherLights";
forevershining_ForevershiningSceneParams.LIGHTS_PICKER = "lights_picker";
forevershining_ForevershiningSceneParams.STEEL_LIGHTS_PICKER = "steel_lights_picker";
forevershining_ForevershiningSceneParams.CAST_SHADOW_METHOD = "cast_shadow_method";
})(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
var Executor = $hx_exports["Executor"];
