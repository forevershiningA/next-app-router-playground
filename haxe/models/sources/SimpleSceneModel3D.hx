package;

import away3d.containers.View3D;
import away3d.materials.lightpickers.LightPickerBase;
import away3d.materials.MaterialBase;
import away3d.materials.methods.EffectMethodBase;
import away3d.materials.methods.FresnelEnvMapMethod;
import away3d.materials.methods.ShadingMethodBase;
import away3d.textures.CubeReflectionTexture;
import pl.pkapusta.engine.common.interfaces.IParamStorage;
import pl.pkapusta.engine.globals.Globals;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorRenderer;
import pl.pkapusta.engine.model.executors.file.M3DBasicExecutor;
import haxe.Constraints.Function;
import openfl.geom.Vector3D;

/**
 * @author Przemysław Kapusta
 */
class SimpleSceneModel3D extends M3DBasicExecutor implements IM3DExecutor implements IM3DExecutorRenderer implements IM3DExecutorProperty {
	
	private var PROP_SHOW_REFLECTIONS(default, never) : String = "showReflections";
	
	private var _showReflections:Bool = null;
	
	private var reflectionsRendered:Bool = false;
	private var reflectionsMetchodsAdded:Bool = false;
	
	private var sceneLightPickerDict:Map<String, Array<MaterialBase>>;
	
	private var cubeReflections:Array<Dynamic>;
	private var reflectionMethods:Array<Dynamic>;
	
	public function build():Void {
		
		//globals
		_showReflections = setGlobalParamIfNull(Globals.VIEW_DEFAULT_SHOW_REFLECTIONS, _showReflections);
		
		sceneLightPickerDict = new Map<String, Array<MaterialBase>>();
		cubeReflections = new Array<Dynamic>();
		reflectionMethods = new Array<Dynamic>();
		
	}
	
	public override function dispose():Void {
		sceneLightPickerDict = null;
		cubeReflections = null;
		reflectionMethods = null;
		super.dispose();
	}
	
	public function setGlobalParamIfNull(globalName:String, currentValue:Any):Any {
		if (currentValue != null) return currentValue;
		return getGlobals().get(globalName);
	}
	
	public function registerMaterialForSceneLightPicker(material:MaterialBase, lightPickerParamName:String):Void {
		var pickerMaterials:Array<MaterialBase>;
		if (sceneLightPickerDict.exists(lightPickerParamName)) {
			pickerMaterials = sceneLightPickerDict.get(lightPickerParamName);
		} else {
			pickerMaterials = new Array<MaterialBase>();
			sceneLightPickerDict.set(lightPickerParamName, pickerMaterials);
		}
		pickerMaterials.push(material);
	}
	
	public function registerCubeReflection(reflection:CubeReflectionTexture, beforeRenderCallback:Function, afterRenderCallback:Function):Void {
		cubeReflections.push({
			reflection: reflection,
			beforeRenderCallback: beforeRenderCallback,
			afterRenderCallback: afterRenderCallback
		});
	}
	
	public function registerReflectionMethod(method:EffectMethodBase, material:MaterialBase):Void {
		reflectionMethods.push({
			method: method,
			material: material
		});
	}
	
	public function onAddedToScene(sceneData:IParamStorage):Void {
		for (lname in sceneLightPickerDict.keys()) {
			if (!sceneData.hasParam(lname)) {
				trace("Warning! Light picker '" + lname + "' not exists");
				continue;
			}
			var picker:LightPickerBase = try cast(sceneData.getParam(lname), LightPickerBase) catch (e:Dynamic) null;
			if (picker == null) {
				trace("Warning! Light picker '" + lname + "' is different type than LightPickerBase");
				continue;
			}
			var pickerMaterials:Array<MaterialBase> = sceneLightPickerDict.get(lname);
			for (i in 0...pickerMaterials.length) pickerMaterials[i].lightPicker = picker;
		}
	}
	public function onRemovedFromScene(sceneData:IParamStorage):Void {
		for (i in 0...reflectionMethods.length) {
			var item:Dynamic = reflectionMethods[i];
			item.material.removeMethod(item.method);
		}
		
		for (lname in sceneLightPickerDict.keys()) {
			var pickerMaterials:Array<MaterialBase> = sceneLightPickerDict.get(lname);
			for (i in 0...pickerMaterials.length) pickerMaterials[i].lightPicker = null;
		}
		
		reflectionsRendered = false;
		reflectionsMetchodsAdded = false;
	}
	public function onSceneDataChanged(sceneData:IParamStorage):Void {
		onRemovedFromScene(sceneData);
		onAddedToScene(sceneData);
	}
	
	private function updateReflections():Void {
		reflectionsRendered = false;
	}
	
	public function beforeViewRender(view:View3D):Void {
		if (_showReflections) {
			var item:Dynamic;
			
			if (!reflectionsRendered) {
				reflectionsRendered = true;
				
				//render reflections
				for (i in 0...cubeReflections.length) {
					item = cubeReflections[i];
					if (item.beforeRenderCallback != null) item.beforeRenderCallback.call();
					try {
						item.reflection.render(view);
					} catch (e:Dynamic) {}
					if (item.afterRenderCallback != null) item.afterRenderCallback.call();
				}
			
			}
			
			if (!reflectionsMetchodsAdded) {
				reflectionsMetchodsAdded = true;
			
				for (i in 0...reflectionMethods.length) {
					item = reflectionMethods[i];
					item.material.addMethod(item.method);
				}
			}
		}
	}
	public function afterViewRender(view:View3D):Void {}
	
	public function updateProperty(name : String, data : Dynamic) : Void {
		if (name == this.PROP_SHOW_REFLECTIONS) {
			if (_showReflections == data) return;
				_showReflections = data;
			if (_showReflections == true) {
				//do nothing (it will set in beforeViewRender method)
			} else {
				if (reflectionsMetchodsAdded) {
					var item:Dynamic;
					for (i in 0...reflectionMethods.length) {
						item = reflectionMethods[i];
						item.material.removeMethod(item.method);
					}
					reflectionsMetchodsAdded = false;
				}
				if (reflectionsRendered) {
					reflectionsRendered = false;
				}
			}
			dispatchPropertyChange(PROP_SHOW_REFLECTIONS, _showReflections, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		}
	}
	
}