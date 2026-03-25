var $hx_exports = $hx_exports || {};
(function ($global) { "use strict";
function $extend(from, fields) {
	var proto = Object.create(from);
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
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
var forevershining_headstones_halfround_MainExecutor = $hx_exports["Executor"] = function() {
	forevershining_headstones_AbstractHeadstoneModel3D.call(this);
};
forevershining_headstones_halfround_MainExecutor.__name__ = true;
forevershining_headstones_halfround_MainExecutor.__super__ = forevershining_headstones_AbstractHeadstoneModel3D;
forevershining_headstones_halfround_MainExecutor.prototype = $extend(forevershining_headstones_AbstractHeadstoneModel3D.prototype,{
	buildModelPath: function() {
		var points = [];
		points.push(new Engine3D.graphics.path.DiscretePoint(-200,200));
		points.push(new Engine3D.graphics.path.DiscreteCornerPoint(-200,0));
		points.push(new Engine3D.graphics.path.DiscreteCornerPoint(200,0));
		points.push(new Engine3D.graphics.path.DiscretePoint(200,200));
		var bezierControlPoints = [];
		bezierControlPoints.push(new Engine3D.core.geom.Point(200,200));
		bezierControlPoints.push(new Engine3D.core.geom.Point(200,310));
		bezierControlPoints.push(new Engine3D.core.geom.Point(110,400));
		bezierControlPoints.push(new Engine3D.core.geom.Point(0,400));
		Engine3D.graphics.algorithms.Bezier.toDiscretePoints(bezierControlPoints,points,25);
		points.push(new Engine3D.graphics.path.DiscretePoint(0,400));
		bezierControlPoints = [];
		bezierControlPoints.push(new Engine3D.core.geom.Point(0,400));
		bezierControlPoints.push(new Engine3D.core.geom.Point(-110,400));
		bezierControlPoints.push(new Engine3D.core.geom.Point(-200,310));
		bezierControlPoints.push(new Engine3D.core.geom.Point(-200,200));
		Engine3D.graphics.algorithms.Bezier.toDiscretePoints(bezierControlPoints,points,25);
		return new Engine3D.graphics.path.ScalingDiscretePath(points,false,false,1);
	}
	,__class__: forevershining_headstones_halfround_MainExecutor
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
