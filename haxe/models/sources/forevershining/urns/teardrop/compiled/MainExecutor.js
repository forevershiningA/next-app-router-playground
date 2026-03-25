var $hx_exports = $hx_exports || {};
(function ($global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); },$hxEnums = $hxEnums || {},$_;
function $extend(from, fields) {
	var proto = Object.create(from);
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	this.r = new RegExp(r,opt.split("u").join(""));
};
EReg.__name__ = "EReg";
EReg.prototype = {
	match: function(s) {
		if(this.r.global) {
			this.r.lastIndex = 0;
		}
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) {
			return this.r.m[n];
		} else {
			throw haxe_Exception.thrown("EReg::matched");
		}
	}
	,matchedLeft: function() {
		if(this.r.m == null) {
			throw haxe_Exception.thrown("No string matched");
		}
		return HxOverrides.substr(this.r.s,0,this.r.m.index);
	}
	,matchedRight: function() {
		if(this.r.m == null) {
			throw haxe_Exception.thrown("No string matched");
		}
		var sz = this.r.m.index + this.r.m[0].length;
		return HxOverrides.substr(this.r.s,sz,this.r.s.length - sz);
	}
	,matchedPos: function() {
		if(this.r.m == null) {
			throw haxe_Exception.thrown("No string matched");
		}
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchSub: function(s,pos,len) {
		if(len == null) {
			len = -1;
		}
		if(this.r.global) {
			this.r.lastIndex = pos;
			this.r.m = this.r.exec(len < 0 ? s : HxOverrides.substr(s,0,pos + len));
			var b = this.r.m != null;
			if(b) {
				this.r.s = s;
			}
			return b;
		} else {
			var b = this.match(len < 0 ? HxOverrides.substr(s,pos,null) : HxOverrides.substr(s,pos,len));
			if(b) {
				this.r.s = s;
				this.r.m.index += pos;
			}
			return b;
		}
	}
	,split: function(s) {
		var d = "#__delim__#";
		return s.replace(this.r,d).split(d);
	}
	,map: function(s,f) {
		var offset = 0;
		var buf_b = "";
		while(true) {
			if(offset >= s.length) {
				break;
			} else if(!this.matchSub(s,offset)) {
				buf_b += Std.string(HxOverrides.substr(s,offset,null));
				break;
			}
			var p = this.matchedPos();
			buf_b += Std.string(HxOverrides.substr(s,offset,p.pos - offset));
			buf_b += Std.string(f(this));
			if(p.len == 0) {
				buf_b += Std.string(HxOverrides.substr(s,p.pos,1));
				offset = p.pos + 1;
			} else {
				offset = p.pos + p.len;
			}
			if(!this.r.global) {
				break;
			}
		}
		if(!this.r.global && offset > 0 && offset < s.length) {
			buf_b += Std.string(HxOverrides.substr(s,offset,null));
		}
		return buf_b;
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = "HxOverrides";
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
Math.__name__ = "Math";
var SimpleSceneModel3D = function() {
	this.reflectionsMetchodsAdded = false;
	this.reflectionsRendered = false;
	this._showReflections = null;
	this.PROP_SHOW_REFLECTIONS = "showReflections";
	Engine3D.model.executors.file.M3DBasicExecutor.call(this);
};
SimpleSceneModel3D.__name__ = "SimpleSceneModel3D";
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
Std.__name__ = "Std";
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var ValueType = $hxEnums["ValueType"] = { __ename__:true,__constructs__:null
	,TNull: {_hx_name:"TNull",_hx_index:0,__enum__:"ValueType",toString:$estr}
	,TInt: {_hx_name:"TInt",_hx_index:1,__enum__:"ValueType",toString:$estr}
	,TFloat: {_hx_name:"TFloat",_hx_index:2,__enum__:"ValueType",toString:$estr}
	,TBool: {_hx_name:"TBool",_hx_index:3,__enum__:"ValueType",toString:$estr}
	,TObject: {_hx_name:"TObject",_hx_index:4,__enum__:"ValueType",toString:$estr}
	,TFunction: {_hx_name:"TFunction",_hx_index:5,__enum__:"ValueType",toString:$estr}
	,TClass: ($_=function(c) { return {_hx_index:6,c:c,__enum__:"ValueType",toString:$estr}; },$_._hx_name="TClass",$_.__params__ = ["c"],$_)
	,TEnum: ($_=function(e) { return {_hx_index:7,e:e,__enum__:"ValueType",toString:$estr}; },$_._hx_name="TEnum",$_.__params__ = ["e"],$_)
	,TUnknown: {_hx_name:"TUnknown",_hx_index:8,__enum__:"ValueType",toString:$estr}
};
ValueType.__constructs__ = [ValueType.TNull,ValueType.TInt,ValueType.TFloat,ValueType.TBool,ValueType.TObject,ValueType.TFunction,ValueType.TClass,ValueType.TEnum,ValueType.TUnknown];
var Type = function() { };
Type.__name__ = "Type";
Type.typeof = function(v) {
	switch(typeof(v)) {
	case "boolean":
		return ValueType.TBool;
	case "function":
		if(v.__name__ || v.__ename__) {
			return ValueType.TObject;
		}
		return ValueType.TFunction;
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) {
			return ValueType.TInt;
		}
		return ValueType.TFloat;
	case "object":
		if(v == null) {
			return ValueType.TNull;
		}
		var e = v.__enum__;
		if(e != null) {
			return ValueType.TEnum($hxEnums[e]);
		}
		var c = js_Boot.getClass(v);
		if(c != null) {
			return ValueType.TClass(c);
		}
		return ValueType.TObject;
	case "string":
		return ValueType.TClass(String);
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
};
var as3hx_Compat = function() { };
as3hx_Compat.__name__ = "as3hx.Compat";
as3hx_Compat.typeof = function(v) {
	var _g = Type.typeof(v);
	switch(_g._hx_index) {
	case 0:
		return "object";
	case 1:
		return "number";
	case 2:
		return "number";
	case 3:
		return "boolean";
	case 4:
		return "object";
	case 5:
		return "function";
	case 6:
		var c = _g.c;
		switch(c.__name__) {
		case "String":
			return "string";
		case "Xml":
			return "xml";
		case "haxe.xml.Fast":
			return "xml";
		default:
			return "object";
		}
		break;
	case 7:
		var e = _g.e;
		return "object";
	case 8:
		return "undefined";
	}
};
as3hx_Compat.setArrayLength = function(a,length) {
	if(a.length > length) {
		a.splice(length,a.length - length);
	} else {
		a[length - 1] = null;
	}
};
as3hx_Compat.arraySplice = function(a,startIndex,deleteCount,values) {
	var result = a.splice(startIndex,deleteCount);
	if(values != null) {
		var _g = 0;
		var _g1 = values.length;
		while(_g < _g1) {
			var i = _g++;
			a.splice(startIndex + i,0,values[i]);
		}
	}
	return result;
};
as3hx_Compat._parseInt = function(s,base) {
	if(base == null) {
		base = s.indexOf("0x") == 0 ? 16 : 10;
	}
	var v = parseInt(s,base);
	if(isNaN(v)) {
		return null;
	} else {
		return v;
	}
};
as3hx_Compat.setInterval = function(closure,delay,values) {
	return setInterval(closure,delay,values);
};
as3hx_Compat.clearInterval = function(id) {
	clearInterval(id);
};
as3hx_Compat.setTimeout = function(closure,delay,values) {
	return setTimeout(closure,delay,values);
};
as3hx_Compat.clearTimeout = function(id) {
	clearTimeout(id);
};
as3hx_Compat.get_FLOAT_MAX = function() {
	return Number.MAX_VALUE;
};
as3hx_Compat.get_FLOAT_MIN = function() {
	return Number.MIN_VALUE;
};
as3hx_Compat.get_INT_MAX = function() {
	return Number.MAX_SAFE_INTEGER;
};
as3hx_Compat.get_INT_MIN = function() {
	return Number.MIN_SAFE_INTEGER;
};
as3hx_Compat.toFixed = function(v,fractionDigits) {
	return v.toFixed(fractionDigits);
};
var as3hx_FlashRegExpAdapter = function(r,opt) {
	this._lastTestedStringProcessedSize = 0;
	this._ereg = new EReg(r,opt);
	this._global = opt.indexOf("g") != -1;
};
as3hx_FlashRegExpAdapter.__name__ = "as3hx.FlashRegExpAdapter";
as3hx_FlashRegExpAdapter.prototype = {
	exec: function(str) {
		var testStr = this._lastTestedString == str ? this._restOfLastTestedString : str;
		var matched = this._ereg.match(testStr);
		var index = 0;
		if(this._global) {
			this._lastTestedString = str;
			if(matched) {
				var matchedLeftLength = this._ereg.matchedLeft().length;
				index = this._lastTestedStringProcessedSize + matchedLeftLength;
				this._restOfLastTestedString = this._ereg.matchedRight();
				this._lastTestedStringProcessedSize += matchedLeftLength + this._ereg.matched(0).length;
			} else {
				this._restOfLastTestedString = null;
				this._lastTestedStringProcessedSize = 0;
			}
		}
		if(matched) {
			return new as3hx__$Compat_FlashRegExpExecResult(str,this._ereg,index).matches;
		} else {
			return null;
		}
	}
	,test: function(str) {
		return this.match(str);
	}
	,map: function(s,f) {
		return this._ereg.map(s,f);
	}
	,match: function(s) {
		return this._ereg.match(s);
	}
	,matched: function(n) {
		return this._ereg.matched(n);
	}
	,matchedLeft: function() {
		return this._ereg.matchedLeft();
	}
	,matchedPos: function() {
		return this._ereg.matchedPos();
	}
	,matchedRight: function() {
		return this._ereg.matchedRight();
	}
	,matchSub: function(s,pos,len) {
		if(len == null) {
			len = -1;
		}
		return this._ereg.matchSub(s,pos,len);
	}
	,replace: function(s,by) {
		return s.replace(this._ereg.r,by);
	}
	,split: function(s) {
		return this._ereg.split(s);
	}
	,__class__: as3hx_FlashRegExpAdapter
};
var as3hx__$Compat_FlashRegExpExecResult = function(str,ereg,index) {
	this.index = 0;
	this.input = str;
	this.index = index;
	this.populateMatches(ereg);
};
as3hx__$Compat_FlashRegExpExecResult.__name__ = "as3hx._Compat.FlashRegExpExecResult";
as3hx__$Compat_FlashRegExpExecResult.prototype = {
	populateMatches: function(ereg) {
		this.matches = [];
		try {
			var group = 0;
			while(true) {
				this.matches.push(ereg.matched(group));
				++group;
			}
		} catch( _g ) {
		}
	}
	,__class__: as3hx__$Compat_FlashRegExpExecResult
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
forevershining_ForevershiningSceneParams.__name__ = "forevershining.ForevershiningSceneParams";
var forevershining_urns_AbstractUrnModel3D = function() {
	this.updateSizeIsDirty = false;
	this._frontTextureBitmap = null;
	this.PROP_FRONT_BITMAP = "front-bitmap";
	this.PROP_DEPTH = "depth";
	this.PROP_HEIGHT = "height";
	this.PROP_WIDTH = "width";
	this.Z_OFFSET = 15;
	this.MODEL_SCALING = 10;
	this.MODEL_SCALING_BASE = 25.470000000000002;
	SimpleSceneModel3D.call(this);
};
forevershining_urns_AbstractUrnModel3D.__name__ = "forevershining.urns.AbstractUrnModel3D";
forevershining_urns_AbstractUrnModel3D.__interfaces__ = [Engine3D.model.executors.file.IM3DExecutorProperty,Engine3D.model.executors.file.IM3DExecutor];
forevershining_urns_AbstractUrnModel3D.__super__ = SimpleSceneModel3D;
forevershining_urns_AbstractUrnModel3D.prototype = $extend(SimpleSceneModel3D.prototype,{
	initializeUrn: function() {
	}
	,build: function() {
		SimpleSceneModel3D.prototype.build.call(this);
		this.initializeUrn();
		this._width = this._initialWidth;
		this._height = this._initialHeight;
		this._depth = this._initialDepth;
		if(this._modelContainerRot == null) {
			this._modelContainerRot = new Engine3D.core.geom.Vector3D(0,180,0);
		}
		var tmp;
		try {
			tmp = js_Boot.__cast(this.get_model().getSelectionObject() , Engine3D.model.executors.file.proxies.IStandardSelectionProxy);
		} catch( _g ) {
			tmp = null;
		}
		this.selection = tmp;
		this.buildRegions();
		if(this.getObject3DAsset("model-base") != null) {
			this.modelBaseContainer = this.getObject3DAsset("model-base").get_loader();
			this.modelBaseContainer.scale(this.MODEL_SCALING_BASE);
			this.modelBaseContainer.set_rotationY(180);
			this.modelBaseContainer.set_z(this._depth / 2);
			this.baseMesh = this.getObject3DAsset("model-base").get_assets().h["mesh"][0];
		}
		this.modelContainer = this.getObject3DAsset("model").get_loader();
		this.modelContainer.scale(this.MODEL_SCALING);
		this.modelContainer.rotateTo(this._modelContainerRot.x,this._modelContainerRot.y,this._modelContainerRot.z);
		this.modelContainer.moveTo(this._modelContainerPos.x,this._modelContainerPos.y,this._modelContainerPos.z);
		this.borderMesh = this.get_sharedData().getParam("borderMesh");
		this.frontMesh = this.get_sharedData().getParam("frontMesh");
		this.modelDiffuseMap = this.getTextureAsset("model-diffusemap").get_texture();
		this.borderMesh.set_castsShadows(true);
		this.borderMesh.set_pickingCollider(new Engine3D.core.core.pick.HaxePickingCollider(false));
		this.frontMesh.set_castsShadows(true);
		this.reflectionTextureBig = new Engine3D.core.textures.CubeReflectionTexture(1024);
		this.reflectionTextureBig.set_farPlaneDistance(1000);
		this.reflectionTextureBig.set_nearPlaneDistance(5);
		this.reflectionTextureBig.set_position(new Engine3D.core.geom.Vector3D(0,0,0));
		this.reflectionTextureSmall = new Engine3D.core.textures.CubeReflectionTexture(256);
		this.reflectionTextureSmall.set_farPlaneDistance(1000);
		this.reflectionTextureSmall.set_nearPlaneDistance(5);
		this.reflectionTextureSmall.set_position(new Engine3D.core.geom.Vector3D(0,0,0));
		var borderSpecularBitmapTexture = new Engine3D.core.textures.BitmapTexture(this.modelDiffuseMap);
		this._borderMaterial = new Engine3D.core.materials.ColorMaterial(13422033);
		this._borderMaterial.set_specularMap(borderSpecularBitmapTexture);
		this._borderMaterial.set_specular(1);
		var borderMatSpecularMethod = new Engine3D.core.materials.methods.CelSpecularMethod(0.25,new Engine3D.core.materials.methods.BasicSpecularMethod());
		borderMatSpecularMethod.set_gloss(100);
		this._borderMaterial.set_specularMethod(borderMatSpecularMethod);
		this.registerMaterialForSceneLightPicker(this._borderMaterial,"steel_lights_picker");
		if(this.baseMesh != null) {
			this._baseMaterial = new Engine3D.core.materials.ColorMaterial(13422033);
			this._baseMaterial.set_specularMap(borderSpecularBitmapTexture);
			this._baseMaterial.set_specular(1);
			this._baseMaterial.set_ambient(1.7);
			var baseMatSpecularMethod = new Engine3D.core.materials.methods.CelSpecularMethod(0.25,new Engine3D.core.materials.methods.BasicSpecularMethod());
			baseMatSpecularMethod.set_gloss(100);
			this._baseMaterial.set_specularMethod(baseMatSpecularMethod);
			this.registerMaterialForSceneLightPicker(this._baseMaterial,"steel_lights_picker");
		}
		this._blackFrontBitmap = new Engine3D.core.display.BitmapData(1,1,false,0);
		this._frontTexture = new Engine3D.core.textures.BitmapTexture(this._blackFrontBitmap,false);
		this._frontMaterial = new Engine3D.core.materials.TextureMaterial(this._frontTexture,true,false,true);
		this._frontMaterial.set_specular(0.7);
		this._frontMaterial.set_ambient(0.1);
		this.registerMaterialForSceneLightPicker(this._frontMaterial,"lights_picker");
		this._borderFresnelMethod = new Engine3D.core.materials.methods.FresnelEnvMapMethod(this.reflectionTextureSmall,0.55);
		this._borderFresnelMethod.set_normalReflectance(0.55);
		this._baseFresnelMethod = new Engine3D.core.materials.methods.FresnelEnvMapMethod(this.reflectionTextureSmall,0.55);
		this._baseFresnelMethod.set_normalReflectance(0.55);
		this._frontFresnelMethod = new Engine3D.core.materials.methods.FresnelEnvMapMethod(this.reflectionTextureBig,1);
		this._frontFresnelMethod.set_normalReflectance(0.09);
		this.registerCubeReflection(this.reflectionTextureBig,$bind(this,this.beforeReflectionRender),$bind(this,this.afterReflectionRender));
		this.registerCubeReflection(this.reflectionTextureSmall,$bind(this,this.beforeReflectionRender),$bind(this,this.afterReflectionRender));
		this.registerReflectionMethod(this._borderFresnelMethod,this._borderMaterial);
		if(this.baseMesh != null) {
			this.registerReflectionMethod(this._baseFresnelMethod,this._baseMaterial);
		}
		this.registerReflectionMethod(this._frontFresnelMethod,this._frontMaterial);
		if(this.borderMesh != null) {
			this.borderMesh.set_material(this._borderMaterial);
		}
		if(this.frontMesh != null) {
			this.frontMesh.set_material(this._frontMaterial);
		}
		if(this.baseMesh != null) {
			this.baseMesh.set_material(this._baseMaterial);
		}
		if(this.baseMesh != null) {
			this.get_container().addChild(this.modelBaseContainer);
		}
		this.get_container().addChild(this.modelContainer);
		this.updateSize();
		this.calibrateReflections();
		this.dispatchPropertyChange(this.PROP_WIDTH,this._width,this.DISPATCH_PROPERTY_TYPE_INIT);
		this.dispatchPropertyChange(this.PROP_HEIGHT,this._height,this.DISPATCH_PROPERTY_TYPE_INIT);
		this.dispatchPropertyChange(this.PROP_DEPTH,this._depth,this.DISPATCH_PROPERTY_TYPE_INIT);
		this.dispatchPropertyChange(this.PROP_FRONT_BITMAP,this._frontBitmap,this.DISPATCH_PROPERTY_TYPE_INIT);
	}
	,dispose: function() {
		this.modelContainer = null;
		this.borderMesh = null;
		this.frontMesh = null;
		this.modelBaseContainer = null;
		this.baseMesh = null;
		this.modelDiffuseMap = null;
		this._frontBitmap = null;
		if(this._borderMaterial != null) {
			this._borderMaterial.dispose();
			this._borderMaterial = null;
		}
		if(this._baseMaterial != null) {
			this._baseMaterial.dispose();
			this._baseMaterial = null;
		}
		if(this._frontMaterial != null) {
			this._frontMaterial.dispose();
			this._frontMaterial = null;
		}
		if(this._frontTexture != null) {
			this._frontTexture.dispose();
			this._frontTexture = null;
		}
		if(this._blackFrontBitmap != null) {
			this._blackFrontBitmap.dispose();
			this._blackFrontBitmap = null;
		}
		if(this._frontTextureBitmap != null) {
			this._frontTextureBitmap.dispose();
			this._frontTextureBitmap = null;
		}
		if(this.reflectionTextureBig != null) {
			this.reflectionTextureBig.dispose();
			this.reflectionTextureBig = null;
		}
		if(this.reflectionTextureSmall != null) {
			this.reflectionTextureSmall.dispose();
			this.reflectionTextureSmall = null;
		}
		SimpleSceneModel3D.prototype.dispose.call(this);
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
	,beforeReflectionRender: function() {
		this.get_container().set_visible(false);
	}
	,afterReflectionRender: function() {
		this.get_container().set_visible(true);
	}
	,calibrateReflections: function() {
		Engine3D.core.tools.utils.Bounds.getObjectContainerBounds(this.get_container(),true);
		var reflectionPosition = new Engine3D.core.geom.Vector3D(Engine3D.core.tools.utils.Bounds.get_minX() + (Engine3D.core.tools.utils.Bounds.get_maxX() - Engine3D.core.tools.utils.Bounds.get_minX()) * 0.5,Engine3D.core.tools.utils.Bounds.get_minY() + (Engine3D.core.tools.utils.Bounds.get_maxY() - Engine3D.core.tools.utils.Bounds.get_minY()) * 0.5,Engine3D.core.tools.utils.Bounds.get_minZ() + (Engine3D.core.tools.utils.Bounds.get_maxZ() - Engine3D.core.tools.utils.Bounds.get_minZ()) * 0.5);
		this.reflectionTextureBig.set_position(reflectionPosition);
		this.reflectionTextureSmall.set_position(reflectionPosition);
		this.updateReflections();
	}
	,getValidTexture: function(tex,texWidth,texHeight) {
		if(((tex) instanceof Engine3D.core.display.BitmapData) && Engine3D.core.tools.utils.TextureUtils.isBitmapDataValid(js_Boot.__cast(tex , Engine3D.core.display.BitmapData))) {
			return (js_Boot.__cast(tex , Engine3D.core.display.BitmapData)).clone();
		}
		if(((tex) instanceof Engine3D.core.display.Bitmap) && Engine3D.core.tools.utils.TextureUtils.isBitmapDataValid((js_Boot.__cast(tex , Engine3D.core.display.Bitmap)).get_bitmapData())) {
			return (js_Boot.__cast(tex , Engine3D.core.display.Bitmap)).get_bitmapData().clone();
		}
		var w = Engine3D.core.tools.utils.TextureUtils.getBestPowerOf2(texWidth);
		var h = Engine3D.core.tools.utils.TextureUtils.getBestPowerOf2(texHeight);
		var bmp = new Engine3D.core.display.BitmapData(w,h,false,16711680);
		bmp.draw(tex,new Engine3D.core.geom.Matrix(w / texWidth,0,0,h / texHeight),null,null,null,true);
		return bmp;
	}
	,updateSize: function() {
		this.updateSizeIsDirty = true;
	}
	,doUpdateSize: function() {
		this.get_container().set_scaleX(this._width / this._initialWidth);
		this.get_container().set_scaleY(this._height / this._initialHeight);
		this.get_container().set_scaleZ(this._depth / this._initialDepth);
		if(this.selection != null) {
			this.selection.moveTo(0,this._depth / 2,this._height / 2);
			this.selection.resizeTo(this._width,this._depth,this._height);
		}
		if(this.inscriptionsRegion != null) {
			this.inscriptionsRegion.moveTo(0,this._initialRegionPos.y * this.get_container().get_scaleY(),this._initialRegionPos.z * this.get_container().get_scaleZ());
			if(this.inscriptionsRegionBounds != null) {
				this.inscriptionsRegionBounds.updateBounds(new Engine3D.core.geom.Rectangle(this._initialRegionRect.x * this.get_container().get_scaleX(),this._initialRegionRect.y * this.get_container().get_scaleY(),this._initialRegionRect.width * this.get_container().get_scaleX(),this._initialRegionRect.height * this.get_container().get_scaleY()));
			}
		}
	}
	,updateProperty: function(name,data) {
		if(name == this.PROP_WIDTH) {
			if(this._width == parseFloat(Std.string(data))) {
				return;
			}
			this._width = parseFloat(Std.string(data));
			this.updateSize();
			this.dispatchPropertyChange(this.PROP_WIDTH,this._width,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if(name == this.PROP_DEPTH) {
			if(this._depth == parseFloat(Std.string(data))) {
				return;
			}
			this._depth = parseFloat(Std.string(data));
			this.updateSize();
			this.dispatchPropertyChange(this.PROP_DEPTH,this._depth,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if(name == this.PROP_HEIGHT) {
			if(this._height == parseFloat(Std.string(data))) {
				return;
			}
			this._height = parseFloat(Std.string(data));
			this.updateSize();
			this.dispatchPropertyChange(this.PROP_HEIGHT,this._height,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if(name == this.PROP_FRONT_BITMAP) {
			if(data == this._frontBitmap) {
				return;
			}
			if(data != null) {
				var bmp;
				var validBmp = null;
				if(((data) instanceof Engine3D.values.BitmapTextureValue)) {
					var btVal = js_Boot.__cast(data , Engine3D.values.BitmapTextureValue);
					validBmp = this.getValidTexture(btVal.get_texture(),btVal.get_texture().width,btVal.get_texture().height);
				} else if(((data) instanceof Engine3D.values.DisplayObjectValue)) {
					var doVal = js_Boot.__cast(data , Engine3D.values.DisplayObjectValue);
					validBmp = this.getValidTexture(doVal.get_display(),doVal.get_display().get_width() | 0,doVal.get_display().get_height() | 0);
				} else if(((data) instanceof Engine3D.core.display.Bitmap) || ((data) instanceof Engine3D.core.display.BitmapData)) {
					bmp = ((data) instanceof Engine3D.core.display.Bitmap) ? (js_Boot.__cast(data , Engine3D.core.display.Bitmap)).get_bitmapData() : js_Boot.__cast(data , Engine3D.core.display.BitmapData);
					validBmp = this.getValidTexture(bmp,bmp.width,bmp.height);
				}
				if(validBmp != null) {
					if(this._frontTextureBitmap != null) {
						this._frontTextureBitmap.dispose();
						this._frontTextureBitmap = null;
					}
					this._frontTextureBitmap = validBmp;
					this._frontTexture.dispose();
					this._frontTexture = new Engine3D.core.textures.BitmapTexture(this._frontTextureBitmap,true);
					this._frontMaterial.set_texture(this._frontTexture);
					this._frontBitmap = data;
				} else {
					throw haxe_Exception.thrown("Unsupported front bitmap value type");
				}
			} else {
				if(this._frontTextureBitmap != null) {
					this._frontTextureBitmap.dispose();
					this._frontTextureBitmap = null;
				}
				this._frontTexture.dispose();
				this._frontTexture = new Engine3D.core.textures.BitmapTexture(this._blackFrontBitmap,false);
				this._frontMaterial.set_texture(this._frontTexture);
				this._frontBitmap = null;
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
				var e = haxe_Exception.caught(_g).unwrap();
				this.updateSizeIsDirty = false;
				throw haxe_Exception.thrown(e);
			}
		}
		SimpleSceneModel3D.prototype.beforeViewRender.call(this,view);
	}
	,__class__: forevershining_urns_AbstractUrnModel3D
});
var forevershining_urns_teardrop_MainExecutor = $hx_exports["Executor"] = function() {
	forevershining_urns_AbstractUrnModel3D.call(this);
};
forevershining_urns_teardrop_MainExecutor.__name__ = "forevershining.urns.teardrop.MainExecutor";
forevershining_urns_teardrop_MainExecutor.__interfaces__ = [Engine3D.model.executors.file.IM3DExecutor];
forevershining_urns_teardrop_MainExecutor.__super__ = forevershining_urns_AbstractUrnModel3D;
forevershining_urns_teardrop_MainExecutor.prototype = $extend(forevershining_urns_AbstractUrnModel3D.prototype,{
	initializeUrn: function() {
		this._initialWidth = 188;
		this._initialHeight = 307;
		this._initialDepth = 78;
		this._initialRegionPos = new Engine3D.core.geom.Vector3D(0,149,75);
		this._initialRegionRect = new Engine3D.core.geom.Rectangle(-82,-130,164,260);
		this._modelContainerPos = new Engine3D.core.geom.Vector3D(0,this._initialHeight / 2,this._initialDepth / 2);
	}
	,__class__: forevershining_urns_teardrop_MainExecutor
});
var haxe_IMap = function() { };
haxe_IMap.__name__ = "haxe.IMap";
haxe_IMap.__isInterface__ = true;
var haxe_Exception = function(message,previous,native) {
	Error.call(this,message);
	this.message = message;
	this.__previousException = previous;
	this.__nativeException = native != null ? native : this;
};
haxe_Exception.__name__ = "haxe.Exception";
haxe_Exception.caught = function(value) {
	if(((value) instanceof haxe_Exception)) {
		return value;
	} else if(((value) instanceof Error)) {
		return new haxe_Exception(value.message,null,value);
	} else {
		return new haxe_ValueException(value,null,value);
	}
};
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
	unwrap: function() {
		return this.__nativeException;
	}
	,get_native: function() {
		return this.__nativeException;
	}
	,__class__: haxe_Exception
});
var haxe_ValueException = function(value,previous,native) {
	haxe_Exception.call(this,String(value),previous,native);
	this.value = value;
};
haxe_ValueException.__name__ = "haxe.ValueException";
haxe_ValueException.__super__ = haxe_Exception;
haxe_ValueException.prototype = $extend(haxe_Exception.prototype,{
	unwrap: function() {
		return this.value;
	}
	,__class__: haxe_ValueException
});
var haxe_ds_StringMap = function() {
	this.h = Object.create(null);
};
haxe_ds_StringMap.__name__ = "haxe.ds.StringMap";
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	__class__: haxe_ds_StringMap
};
var haxe_iterators_ArrayIterator = function(array) {
	this.current = 0;
	this.array = array;
};
haxe_iterators_ArrayIterator.__name__ = "haxe.iterators.ArrayIterator";
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
js_Boot.__name__ = "js.Boot";
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
		if(o.__enum__) {
			var e = $hxEnums[o.__enum__];
			var con = e.__constructs__[o._hx_index];
			var n = con._hx_name;
			if(con.__params__) {
				s = s + "\t";
				return n + "(" + ((function($this) {
					var $r;
					var _g = [];
					{
						var _g1 = 0;
						var _g2 = con.__params__;
						while(true) {
							if(!(_g1 < _g2.length)) {
								break;
							}
							var p = _g2[_g1];
							_g1 = _g1 + 1;
							_g.push(js_Boot.__string_rec(o[p],s));
						}
					}
					$r = _g;
					return $r;
				}(this))).join(",") + ")";
			} else {
				return n;
			}
		}
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
		return o.__enum__ != null ? $hxEnums[o.__enum__] == cl : false;
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
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $global.$haxeUID++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = m.bind(o); o.hx__closures__[m.__id__] = f; } return f; }
$global.$haxeUID |= 0;
if(typeof(performance) != "undefined" ? typeof(performance.now) == "function" : false) {
	HxOverrides.now = performance.now.bind(performance);
}
String.prototype.__class__ = String;
String.__name__ = "String";
Array.__name__ = "Array";
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
