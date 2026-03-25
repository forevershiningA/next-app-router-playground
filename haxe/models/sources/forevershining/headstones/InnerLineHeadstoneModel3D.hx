package forevershining.headstones;

import away3d.core.pick.HaxePickingCollider;
import away3d.entities.Mesh;
import away3d.materials.TextureMaterial;
import pl.pkapusta.engine.graphics.path.ScalingDiscretePath;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;
import pl.pkapusta.engine.model.executors.utils.properties.ColorTextureProperty;
import pl.pkapusta.engine.view.graphics3d.primitives.PathGeometry;
import openfl.geom.Rectangle;

/**
 * @author Przemysław Kapusta
 */
class InnerLineHeadstoneModel3D extends AbstractHeadstoneModel3D implements IM3DExecutor implements IM3DExecutorProperty {
	
	private var PROP_COLOR_2(default, never) : String = "color2";
	
	private var _secColorProperty : ColorTextureProperty;
	
	private var secModelPath : ScalingDiscretePath;
	private var secModelOptions : haxe.DynamicAccess<Dynamic> = {};
	private var secModelGeometry : PathGeometry;
	private var secModelMesh : Mesh;
	private var secModelMaterial : TextureMaterial;
	
	override public function build(): Void {
        super.build();
		
		secModelPath = buildSecModelPath();
		
		if (secModelPath != null) {
			secModelPath.width = _width;
			secModelPath.height = _height;
			secModelGeometry = new PathGeometry(secModelPath, _depth, cornerRound, true, true, true, null, secModelOptions);
			_secColorProperty = new ColorTextureProperty(PROP_COLOR_2, 0xBBBBBB);
			secModelMaterial = _secColorProperty.material;
			registerMaterialForSceneLightPicker(secModelMaterial, ForevershiningSceneParams.LIGHTS_PICKER);
			secModelMesh = new Mesh(secModelGeometry, secModelMaterial);
			secModelMesh.castsShadows = false;
			secModelMesh.mouseEnabled = true;
			secModelMesh.pickingCollider = new HaxePickingCollider(false);
			registerReflectionMethod(colorReflectionMethod, secModelMaterial);
			container.addChild(secModelMesh);
		}
		
	}
	
	override public function dispose() : Void {
		if (_secColorProperty != null) {
            _secColorProperty.dispose();
            _secColorProperty = null;
        }
        if (secModelMesh != null) {
            container.removeChild(secModelMesh);
            secModelMesh.disposeWithChildren();
            secModelMesh = null;
        }
        if (secModelGeometry != null) {
            secModelGeometry.dispose();
            secModelGeometry = null;
        }
        secModelPath = null;
        super.dispose();
	}
	
	private function buildSecModelPath() : ScalingDiscretePath {
        return null;
    }
	
	override private function doUpdateSize():Void {
		super.doUpdateSize();
		
		if (secModelPath != null) {
			secModelPath.width = _width;
			secModelPath.height = _height;
			secModelGeometry.thickness = _depth;
			secModelMesh.moveTo(0, 0, _depth / 2 + Z_OFFSET);
		}
	}
	
	override public function updateProperty(name : String, data : Dynamic) : Void {
		if (name == this.PROP_COLOR_2) {
			if (_secColorProperty.change(data)) {
				var uvMap : Rectangle = _secColorProperty.optimumUVMap.clone();
				uvMap.inflate(uvMap.width * 2.8, uvMap.height * 2.8);
				secModelGeometry.uvMappingRect = uvMap;
				dispatchPropertyChange(PROP_COLOR_2, data, DISPATCH_PROPERTY_TYPE_EXTERNAL);
			}
		} else {
			super.updateProperty(name, data);
		}
	}

    public function new() {
        super();
    }
	
}