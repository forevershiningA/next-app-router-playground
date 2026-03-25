var $hx_exports = $hx_exports || {};
(function ($global) { "use strict";
function $extend(from, fields) {
	var proto = Object.create(from);
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var haxe_IMap = function() { };
var haxe_ds_StringMap = function() { };
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
var haxe_iterators_ArrayIterator = function(array) {
	this.current = 0;
	this.array = array;
};
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
js_Boot.__implements = function(o,iface) {
	return js_Boot.__interfLoop(js_Boot.getClass(o),iface);
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") {
		return null;
	}
	return name;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var tempus_TempusSceneParams = function() { };
var tempus_sceneries_scenery_$solid_$color_MainExecutor = $hx_exports["Executor"] = function() {
	this._showReflections = null;
	this._color = 13625596;
	this.PROP_SHOW_FLOOR_REFLECTION = "showFloorReflection";
	this.PROP_SHOW_REFLECTIONS = "showReflections";
	this.PROP_COLOR = "color";
	this.PLANE_SIZE = 400000;
	Engine3D.model.executors.file.M3DBasicExecutor.call(this);
};
tempus_sceneries_scenery_$solid_$color_MainExecutor.__interfaces__ = [Engine3D.model.executors.file.IM3DExecutorProperty,Engine3D.model.executors.file.IM3DExecutorRenderer,Engine3D.model.executors.file.IM3DExecutor];
tempus_sceneries_scenery_$solid_$color_MainExecutor.__super__ = Engine3D.model.executors.file.M3DBasicExecutor;
tempus_sceneries_scenery_$solid_$color_MainExecutor.prototype = $extend(Engine3D.model.executors.file.M3DBasicExecutor.prototype,{
	build: function() {
		js_Boot.__implements(this,Engine3D.model.executors.file.IM3DExecutor);
		this._showReflections = this.setGlobalParamIfNull(Globals.VIEW_DEFAULT_SHOW_REFLECTIONS,this._showReflections);
		this._skyColorBmp = new Engine3D.core.display.BitmapData(1,1,false,this._color);
		this.cubeTexture = new Engine3D.core.textures.BitmapCubeTexture(this._skyColorBmp,this._skyColorBmp,this._skyColorBmp,this._skyColorBmp,this._skyColorBmp,this._skyColorBmp);
		this.skyBox = new Engine3D.core.primitives.SkyBox(this.cubeTexture);
		this.get_container().addChild(this.skyBox);
		this.materialGround = new Engine3D.core.materials.ColorMaterial(this._color,1);
		var planeGeom = new Engine3D.core.primitives.PlaneGeometry(this.PLANE_SIZE,this.PLANE_SIZE,1,1,false);
		planeGeom.scaleUV(6,6);
		this.groundMesh = new Engine3D.core.entities.Mesh(planeGeom,this.materialGround);
		this.groundMesh.rotateTo(90,0,0);
		this.groundMesh.set_castsShadows(false);
		if(this._showReflections) {
			this.get_container().addChild(this.groundMesh);
		}
		this.light = new Engine3D.core.lights.DirectionalLight();
		this.light.set_direction(new Engine3D.core.geom.Vector3D(-0.5,-0.7,-1));
		this.light.set_castsShadows(true);
		this.light.set_ambient(0.10);
		this.light.set_diffuse(1.2);
		this.light.set_specular(1);
		this.steelLight = new Engine3D.core.lights.DirectionalLight();
		this.steelLight.set_direction(new Engine3D.core.geom.Vector3D(-1,-0.1,-0.1));
		this.steelLight.set_ambient(0.05);
		this.steelLight.set_diffuse(0);
		this.steelLight.set_specular(0.3);
		this.otherLight = new Engine3D.core.lights.DirectionalLight();
		this.otherLight.set_direction(new Engine3D.core.geom.Vector3D(-0.5,-0.9,1));
		this.otherLight.set_ambient(0);
		this.otherLight.set_diffuse(0.15);
		this.otherLight.set_specular(0.23);
		this.shadowMapper = new Engine3D.core.lights.shadowmaps.CascadeShadowMapper(4);
		this.shadowMapper.set_lightOffset(40000);
		this.shadowMapper.set_depthMapSize(2048);
		this.shadowMapper.setSplitRatio(0,.1);
		this.shadowMapper.setSplitRatio(1,.2);
		this.shadowMapper.setSplitRatio(2,.4);
		this.shadowMapper.setSplitRatio(3,1.0);
		this.light.set_shadowMapper(this.shadowMapper);
		this.lightPicker = new Engine3D.core.materials.lightpickers.StaticLightPicker([this.light]);
		this.steelLightPicker = new Engine3D.core.materials.lightpickers.StaticLightPicker([this.light,this.steelLight]);
		this.otherLightPicker = new Engine3D.core.materials.lightpickers.StaticLightPicker([this.light,this.otherLight]);
		this.baseShadowMerhod = new Engine3D.core.materials.methods.FilteredShadowMapMethod(this.light);
		this.castShadowMethod = new Engine3D.core.materials.methods.CascadeShadowMapMethod(this.baseShadowMerhod);
		this.castShadowMethod.set_epsilon(0.0002);
	}
	,dispose: function() {
		if(this._skyColorBmp != null) {
			this._skyColorBmp.dispose();
			this._skyColorBmp = null;
		}
		if(this.cubeTexture != null) {
			this.cubeTexture.dispose();
			this.cubeTexture = null;
		}
		if(this.reflectionTexture != null) {
			this.reflectionTexture.dispose();
			this.reflectionTexture = null;
		}
		if(this.materialGround != null) {
			this.materialGround.dispose();
			this.materialGround = null;
		}
		if(this.groundReflectionMethod != null) {
			this.groundReflectionMethod.dispose();
			this.groundReflectionMethod = null;
		}
		if(this.groundMesh != null) {
			this.groundMesh.disposeWithAnimatorAndChildren();
			this.groundMesh = null;
		}
		if(this.skyBox != null) {
			this.skyBox.disposeWithChildren();
			this.skyBox = null;
		}
		if(this.lightPicker != null) {
			this.lightPicker.dispose();
			this.lightPicker = null;
		}
		if(this.steelLightPicker != null) {
			this.steelLightPicker.dispose();
			this.steelLightPicker = null;
		}
		if(this.otherLightPicker != null) {
			this.otherLightPicker.dispose();
			this.otherLightPicker = null;
		}
		if(this.light != null) {
			this.light.dispose();
			this.light = null;
		}
		if(this.steelLight != null) {
			this.steelLight.dispose();
			this.steelLight = null;
		}
		if(this.otherLight != null) {
			this.otherLight.dispose();
			this.otherLight = null;
		}
		if(this.shadowMapper != null) {
			this.shadowMapper.dispose();
			this.shadowMapper = null;
		}
		if(this.baseShadowMerhod != null) {
			this.baseShadowMerhod.dispose();
			this.baseShadowMerhod = null;
		}
		if(this.castShadowMethod != null) {
			this.castShadowMethod.dispose();
			this.castShadowMethod = null;
		}
		Engine3D.model.executors.file.M3DBasicExecutor.prototype.dispose.call(this);
	}
	,setGlobalParamIfNull: function(globalName,currentValue) {
		if(currentValue != null) {
			return currentValue;
		}
		return this.getGlobals().get(globalName);
	}
	,updateProperty: function(name,data) {
		if(name == this.PROP_COLOR) {
			if(this._color == data) {
				return;
			}
			this._color = data;
			this.materialGround.set_color(this._color);
			if(this._skyColorBmp != null) {
				this._skyColorBmp.dispose();
				this._skyColorBmp = null;
			}
			this._skyColorBmp = new Engine3D.core.display.BitmapData(1,1,false,this._color);
			this.cubeTexture.set_positiveX(this._skyColorBmp);
			this.cubeTexture.set_positiveY(this._skyColorBmp);
			this.cubeTexture.set_positiveZ(this._skyColorBmp);
			this.cubeTexture.set_negativeX(this._skyColorBmp);
			this.cubeTexture.set_negativeY(this._skyColorBmp);
			this.cubeTexture.set_negativeZ(this._skyColorBmp);
			this.dispatchPropertyChange(this.PROP_COLOR,this._color,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if(name == this.PROP_SHOW_REFLECTIONS || name == this.PROP_SHOW_FLOOR_REFLECTION) {
			if(this._showReflections == data) {
				return;
			}
			this._showReflections = data;
			if(this._showReflections == true) {
				this.get_container().addChild(this.groundMesh);
			} else {
				this.get_container().removeChild(this.groundMesh);
			}
			this.dispatchPropertyChange(this.PROP_SHOW_REFLECTIONS,this._showReflections,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
			this.dispatchPropertyChange(this.PROP_SHOW_FLOOR_REFLECTION,this._showReflections,this.DISPATCH_PROPERTY_TYPE_EXTERNAL);
		}
	}
	,onAddedToScene: function(sceneData) {
		sceneData.setParam("lights",[this.light]);
		sceneData.setParam("steelLights",[this.steelLight]);
		sceneData.setParam("otherLights",[this.otherLight]);
		sceneData.setParam("lights_picker",this.lightPicker);
		sceneData.setParam("steel_lights_picker",this.steelLightPicker);
		sceneData.setParam("cast_shadow_method",this.castShadowMethod);
		this.scene = this.get_container().get_scene();
		this.scene.addChild(this.light);
	}
	,onRemovedFromScene: function(sceneData) {
		sceneData.clearParam("lights");
		sceneData.clearParam("steelLights");
		sceneData.clearParam("otherLights");
		sceneData.clearParam("lights_picker");
		sceneData.clearParam("steel_lights_picker");
		sceneData.clearParam("cast_shadow_method");
		this.scene.removeChild(this.light);
		this.scene = null;
	}
	,onSceneDataChanged: function(sceneData) {
	}
	,beforeViewRender: function(view) {
		if(this.groundReflectionMethod == null) {
			this.reflectionTexture = new Engine3D.core.textures.PlanarReflectionTexture();
			this.reflectionTexture.applyTransform(this.groundMesh.get_sceneTransform());
			this.groundReflectionMethod = new Engine3D.core.materials.methods.FresnelPlanarReflectionMethod(this.reflectionTexture,0.5);
			this.groundReflectionMethod.set_fresnelPower(3.1);
			this.groundReflectionMethod.set_normalReflectance(0.4);
			this.materialGround.addMethod(this.groundReflectionMethod);
		}
		if(this.reflectionTexture != null) {
			try {
				this.reflectionTexture.render(view);
			} catch( _g ) {
			}
		}
	}
	,afterViewRender: function(view) {
	}
	,__class__: tempus_sceneries_scenery_$solid_$color_MainExecutor
});
String.prototype.__class__ = String;
js_Boot.__toStr = ({ }).toString;
tempus_TempusSceneParams.LIGHTS = "lights";
tempus_TempusSceneParams.STEEL_LIGHTS = "steelLights";
tempus_TempusSceneParams.OTHER_LIGHTS = "otherLights";
tempus_TempusSceneParams.LIGHTS_PICKER = "lights_picker";
tempus_TempusSceneParams.STEEL_LIGHTS_PICKER = "steel_lights_picker";
tempus_TempusSceneParams.CAST_SHADOW_METHOD = "cast_shadow_method";
})(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
var Executor = $hx_exports["Executor"];
