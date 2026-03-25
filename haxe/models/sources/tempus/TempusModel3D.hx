package tempus;

import away3d.containers.View3D;
import away3d.materials.methods.FresnelEnvMapMethod;
import away3d.materials.TextureMaterial;
import away3d.textures.CubeReflectionTexture;
import away3d.tools.utils.Bounds;
import away3d.tools.utils.TextureUtils;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;
import pl.pkapusta.engine.model.executors.utils.properties.ColorTextureProperty;
import openfl.display.BitmapData;
import openfl.geom.Matrix;
import openfl.geom.Rectangle;
import openfl.geom.Vector3D;
import pl.pkapusta.engine.model.executors.utils.properties.ColorTextureProperty;

class TempusModel3D extends SimpleSceneModel3D implements IM3DExecutorProperty {
	
	private var PROP_COLOR:String = "color";
	
	private var colorPropertiesMap:Map<String, ColorProperty>;
	private var colorPropertiesList:Array<ColorProperty>;
	
	private var colorReflectionCube:CubeReflectionTexture;
	private var colorReflectionMethod:FresnelEnvMapMethod;
	
	public override function build():Void {
		super.build();
		
		colorPropertiesMap = new Map<String, ColorProperty>();
		colorPropertiesList = new Array<ColorProperty>();
		
		colorReflectionCube = new CubeReflectionTexture(512);
		colorReflectionCube.position = new Vector3D(0, 0, 0);
		colorReflectionMethod = new FresnelEnvMapMethod(colorReflectionCube, 0.36);
		colorReflectionMethod.fresnelPower = 0.3;
		
		enableColorProperty(PROP_COLOR);
	}
	
	private function calibrateColorReflection():Void {
		Bounds.getObjectContainerBounds(container, true);
		var reflectionPosition:Vector3D = new Vector3D(
			Bounds.minX + (Bounds.maxX - Bounds.minX) * 0.5,
			Bounds.minY + (Bounds.maxY - Bounds.minY) * 0.5,
			Bounds.minZ + (Bounds.maxZ - Bounds.minZ) * 0.5
		);
		colorReflectionCube.position = reflectionPosition;
		updateReflections();
	}
	
	public override function dispose():Void {
		if (colorPropertiesList != null) {
			for (i in 0...colorPropertiesList.length) {
				colorPropertiesList[i].dispose();
			}
			colorPropertiesList = null;
			colorPropertiesMap = null;
		}
		if (colorReflectionCube != null) {
			colorReflectionCube.dispose();
			colorReflectionCube = null;
		}
		if (colorReflectionMethod != null) {
			colorReflectionMethod.dispose();
			colorReflectionMethod = null;
		}
		super.dispose();
	}
	
	private function enableColorProperty(propertyName:String):ColorProperty {
		if (colorPropertiesMap.exists(propertyName)) throw "Color with propertyName = '" + propertyName + "' exists";
		var cp:ColorProperty = new ColorProperty(propertyName);
		colorPropertiesMap.set(propertyName, cp);
		colorPropertiesList.push(cp);
		registerMaterialForSceneLightPicker(cp.material, TempusSceneParams.LIGHTS_PICKER);
		registerCubeReflection(colorReflectionCube, beforeColorReflectionRender, afterColorReflectionRender);
		registerReflectionMethod(colorReflectionMethod, cp.material);
		dispatchPropertyChange(propertyName, cp.property.textureValue, DISPATCH_PROPERTY_TYPE_INIT);
		//trace("enable and init color property: " + propertyName);
		return cp;
	}
	
	private function getColorMaterial(propertyName:String):TextureMaterial {
		if (!colorPropertiesMap.exists(propertyName)) return null;
		return colorPropertiesMap.get(propertyName).material;
	}
	
	private function beforeColorReflectionRender():Void {
		container.visible = false;
	}
	private function afterColorReflectionRender():Void {
		container.visible = true;
	}
	
	/** @abstract */
	private function updateUVMap(uvMap:Rectangle, propertyName:String):Void {}
	
	override public function updateProperty(name:String, data:Dynamic):Void {
		if (colorPropertiesMap.exists(name)) {
			//trace("update color to: " + data);
			var cp:ColorProperty = colorPropertiesMap.get(name);
			if (cp.property.change(data)) {
				updateUVMap(cp.property.optimumUVMap, name);
				dispatchPropertyChange(name, data, DISPATCH_PROPERTY_TYPE_EXTERNAL);
			}
		} else {
			super.updateProperty(name, data);
		}
	}
	
}

@:keep
class ColorProperty {
	
	public var name(get, never) : String;
	public var property(get, never) : ColorTextureProperty;
	public var material(get, never) : TextureMaterial;

	private var _property:ColorTextureProperty;
	private var _material:TextureMaterial;
	private var _name:String;

	public function new(name:String) {
		_name = name;
		_property = new ColorTextureProperty(_name);
		_material = _property.material;
	}

	public function dispose():Void {
		if (_property != null) {
			_property.dispose();
			_property = null;
			_material = null;
			_name = null;
		}
	}

	private function get_name():String {
		return _name;
	}

	private function get_property():ColorTextureProperty {
		return _property;
	}

	private function get_material():TextureMaterial {
		return _material;
	}

}