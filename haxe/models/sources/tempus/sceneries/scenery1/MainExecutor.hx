package tempus.sceneries.scenery1;

import away3d.containers.Scene3D;
import away3d.containers.View3D;
import away3d.entities.Mesh;
import away3d.lights.DirectionalLight;
import away3d.lights.shadowmaps.CascadeShadowMapper;
import away3d.materials.lightpickers.StaticLightPicker;
import away3d.materials.methods.CascadeShadowMapMethod;
import away3d.materials.methods.FilteredShadowMapMethod;
import away3d.materials.methods.FresnelPlanarReflectionMethod;
import away3d.materials.TextureMultiPassMaterial;
import away3d.primitives.PlaneGeometry;
import away3d.primitives.SkyBox;
import away3d.textures.BitmapCubeTexture;
import away3d.textures.BitmapTexture;
import away3d.textures.PlanarReflectionTexture;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementReader;
import pl.pkapusta.engine.common.interfaces.IParamStorage;
import pl.pkapusta.engine.globals.Globals;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorRenderer;
import pl.pkapusta.engine.model.executors.file.M3DBasicExecutor;
import pl.pkapusta.engine.project.data.SceneData;
import pl.pkapusta.engine.project.IProject3D;
import openfl.display.BitmapData;
import openfl.geom.Vector3D;
import tempus.TempusSceneParams;

/**
 * @author Przemysław Kapusta
 */
@:expose("Executor")
class MainExecutor extends M3DBasicExecutor implements IM3DExecutor implements IM3DExecutorRenderer implements IM3DExecutorProperty {
	
	private var PROP_SHOW_REFLECTIONS:String = "showReflections";
	
	private var _showReflections:Bool = null;
	
	private var PLANE_SIZE:Int = 4000;
	
	private var materialGround:TextureMultiPassMaterial;
	private var groundReflectionMethod:FresnelPlanarReflectionMethod;
	
	private var cubeTexture:BitmapCubeTexture;
	private var reflectionTexture:PlanarReflectionTexture;
	private var floorDiffuseTexture:BitmapTexture;
	private var floorSpecularTexture:BitmapTexture;
	
	private var groundMesh:Mesh;
	private var skyBox:SkyBox;
	
	private var light:DirectionalLight;
	private var steelLight:DirectionalLight;
	private var otherLight:DirectionalLight;
	
	private var lightPicker:StaticLightPicker;
	private var steelLightPicker:StaticLightPicker;
	private var otherLightPicker:StaticLightPicker;
	
	private var shadowMapper:CascadeShadowMapper;
	private var baseShadowMerhod:FilteredShadowMapMethod;
	private var castShadowMethod:CascadeShadowMapMethod;
	
	private var scene:Scene3D;
	
	public function build():Void {
		
		/********
		 * Blank Std.is() is needed, because Haxe 4.x optimizations removes __inferface__ list from object compilation output.
		 * Without __inferface__ list Engine can't dynamically check interfaces of this object!
		 */
		Std.is(this, IM3DExecutor);
		
		
		//globals
		_showReflections = setGlobalParamIfNull(Globals.VIEW_DEFAULT_SHOW_REFLECTIONS, _showReflections);
		
		var skyboxPX:BitmapData = getTextureAsset("sky-box-pos-x").texture;
		var skyboxNX:BitmapData = getTextureAsset("sky-box-neg-x").texture;
		var skyboxPY:BitmapData = getTextureAsset("sky-box-pos-y").texture;
		var skyboxNY:BitmapData = getTextureAsset("sky-box-neg-y").texture;
		var skyboxPZ:BitmapData = getTextureAsset("sky-box-pos-z").texture;
		var skyboxNZ:BitmapData = getTextureAsset("sky-box-neg-z").texture;
		
		cubeTexture = new BitmapCubeTexture(skyboxPX, skyboxNX, skyboxPY, skyboxNY, skyboxPZ, skyboxNZ);
		skyBox = new SkyBox(cubeTexture);
		container.addChild(skyBox);
		
		floorDiffuseTexture = new BitmapTexture(getTextureAsset("floor-diffuse-map").texture);
		floorSpecularTexture = new BitmapTexture(getTextureAsset("floor-specular-map").texture);
		
		materialGround = new TextureMultiPassMaterial(floorDiffuseTexture, true, true);
		materialGround.specularMap = floorSpecularTexture;
		
		var planeGeom:PlaneGeometry = new PlaneGeometry(PLANE_SIZE, PLANE_SIZE, 1, 1, false);
		planeGeom.scaleUV(6, 6);
		groundMesh = new Mesh(planeGeom, materialGround);
		groundMesh.rotateTo(90, 0, 0);
		groundMesh.castsShadows = false;
		container.addChild(groundMesh);
		
		light = new DirectionalLight();
		light.direction = new Vector3D( -0.5, -0.7, -1);
		light.castsShadows = true;
		light.ambient = 0.10;
		light.diffuse = 1.2;
		light.specular = 1;
		
		steelLight = new DirectionalLight();
		steelLight.direction = new Vector3D( -1, -0.1, -0.1);
		//steelLight.castsShadows = true;
		steelLight.ambient = 0.05;
		steelLight.diffuse = 0;
		steelLight.specular = 0.3;
		
		otherLight = new DirectionalLight();
		otherLight.direction = new Vector3D( -0.5, -0.9, 1);
		//otherLight.castsShadows = true;
		otherLight.ambient = 0;
		otherLight.diffuse = 0.15;
		otherLight.specular = 0.23;
		
		shadowMapper = new CascadeShadowMapper(4);
		shadowMapper.lightOffset = 40000;
		shadowMapper.depthMapSize = 2048;
		shadowMapper.setSplitRatio(0, .1);
		shadowMapper.setSplitRatio(1, .2);
		shadowMapper.setSplitRatio(2, .4);
		shadowMapper.setSplitRatio(3, 1.0);
		light.shadowMapper = shadowMapper;
		
		lightPicker = new StaticLightPicker([light]);
		steelLightPicker = new StaticLightPicker([light, steelLight]);
		otherLightPicker = new StaticLightPicker([light, otherLight]);
		
		baseShadowMerhod = new FilteredShadowMapMethod(light);
		castShadowMethod = new CascadeShadowMapMethod(baseShadowMerhod);
		castShadowMethod.epsilon = 0.0002;
		
		materialGround.lightPicker = otherLightPicker;
		materialGround.shadowMethod = castShadowMethod;
	}
	
	public override function dispose():Void {
		if (cubeTexture != null) {
			cubeTexture.dispose();
			cubeTexture = null;
		}
		if (reflectionTexture != null) {
			reflectionTexture.dispose();
			reflectionTexture = null;
		}
		if (floorDiffuseTexture != null) {
			floorDiffuseTexture.dispose();
			floorDiffuseTexture = null;
		}
		if (floorSpecularTexture != null) {
			floorSpecularTexture.dispose();
			floorSpecularTexture = null;
		}
		if (materialGround != null) {
			materialGround.dispose();
			materialGround = null;
		}
		if (groundReflectionMethod != null) {
			groundReflectionMethod.dispose();
			groundReflectionMethod = null;
		}
		if (groundMesh != null) {
			groundMesh.disposeWithAnimatorAndChildren();
			groundMesh = null;
		}
		if (skyBox != null) {
			skyBox.disposeWithChildren();
			skyBox = null;
		}
		if (lightPicker != null) {
			lightPicker.dispose();
			lightPicker = null;
		}
		if (steelLightPicker != null) {
			steelLightPicker.dispose();
			steelLightPicker = null;
		}
		if (otherLightPicker != null) {
			otherLightPicker.dispose();
			otherLightPicker = null;
		}
		if (light != null) {
			light.dispose();
			light = null;
		}
		if (steelLight != null) {
			steelLight.dispose();
			steelLight = null;
		}
		if (otherLight != null) {
			otherLight.dispose();
			otherLight = null;
		}
		if (shadowMapper != null) {
			shadowMapper.dispose();
			shadowMapper = null;
		}
		if (baseShadowMerhod != null) {
			baseShadowMerhod.dispose();
			baseShadowMerhod = null;
		}
		if (castShadowMethod != null) {
			castShadowMethod.dispose();
			castShadowMethod = null;
		}
		super.dispose();
	}
	
	public function setGlobalParamIfNull(globalName:String, currentValue:Any):Any {
		if (currentValue != null) {
			return currentValue;
		}
		return getGlobals().get(globalName);
	}
	
	public function updateProperty(name:String, data:Dynamic):Void {
		
		if (name == this.PROP_SHOW_REFLECTIONS) {
			if (_showReflections == data) return;
				_showReflections = data;
			if (_showReflections == true) {
				//do nothing (it will set in beforeViewRender method)
			} else {
				if (groundReflectionMethod != null) {
					materialGround.removeMethod(groundReflectionMethod);
					if (reflectionTexture != null) {
						reflectionTexture.dispose();
						reflectionTexture = null;
					}
					if (groundReflectionMethod != null) {
						groundReflectionMethod.dispose();
						groundReflectionMethod = null;
					}
				}
			}
			dispatchPropertyChange(PROP_SHOW_REFLECTIONS, _showReflections, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		}
		
	}
	
	public function onAddedToScene(sceneData:IParamStorage):Void {
		
		sceneData.setParam(TempusSceneParams.LIGHTS, [light]);
		sceneData.setParam(TempusSceneParams.STEEL_LIGHTS, [steelLight]);
		sceneData.setParam(TempusSceneParams.OTHER_LIGHTS, [otherLight]);
		
		sceneData.setParam(TempusSceneParams.LIGHTS_PICKER, lightPicker);
		sceneData.setParam(TempusSceneParams.STEEL_LIGHTS_PICKER, steelLightPicker);
		
		sceneData.setParam(TempusSceneParams.CAST_SHADOW_METHOD, castShadowMethod);
		
		scene = container.scene;
		scene.addChild(light);
		
	}
	public function onRemovedFromScene(sceneData:IParamStorage):Void {
		
		sceneData.clearParam(TempusSceneParams.LIGHTS);
		sceneData.clearParam(TempusSceneParams.STEEL_LIGHTS);
		sceneData.clearParam(TempusSceneParams.OTHER_LIGHTS);
		
		sceneData.clearParam(TempusSceneParams.LIGHTS_PICKER);
		sceneData.clearParam(TempusSceneParams.STEEL_LIGHTS_PICKER);
		
		sceneData.clearParam(TempusSceneParams.CAST_SHADOW_METHOD);
		
		scene.removeChild(light);
		scene = null;
		
	}
	public function onSceneDataChanged(sceneData:IParamStorage):Void {}
	
	public function beforeViewRender(view:View3D):Void {
		if (_showReflections) {
			if (groundReflectionMethod == null) {
				reflectionTexture = new PlanarReflectionTexture();
				reflectionTexture.applyTransform(groundMesh.sceneTransform);
				groundReflectionMethod = new FresnelPlanarReflectionMethod(reflectionTexture, 0.5);
				//groundReflectionMethod.normalDisplacement = 2;
				groundReflectionMethod.fresnelPower = 3.1;
				groundReflectionMethod.normalReflectance = 0.4;
				materialGround.addMethod(groundReflectionMethod);
			}
			if (reflectionTexture != null) {
				try {
					reflectionTexture.render(view);
				} catch (e:Dynamic) {}
			}
		}
	}
	public function afterViewRender(view:View3D):Void {}
	
}