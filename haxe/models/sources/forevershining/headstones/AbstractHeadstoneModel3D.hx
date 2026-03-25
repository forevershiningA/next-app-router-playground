package forevershining.headstones;

import away3d.containers.View3D;
import away3d.containers.ObjectContainer3D;
import away3d.core.pick.HaxePickingCollider;
import away3d.entities.Mesh;
import away3d.materials.methods.FresnelEnvMapMethod;
import away3d.materials.TextureMaterial;
import away3d.textures.BitmapTexture;
import away3d.textures.CubeReflectionTexture;
import away3d.tools.utils.Bounds;
import away3d.tools.utils.TextureUtils;
import pl.pkapusta.engine.common.interfaces.IParamStorage;
import pl.pkapusta.engine.graphics.path.ScalingDiscretePath;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;
import pl.pkapusta.engine.model.executors.file.proxies.IStandardSelectionProxy;
import pl.pkapusta.engine.model.executors.file.proxies.ISurfaceRegionProxy;
import pl.pkapusta.engine.model.executors.utils.properties.ColorTextureProperty;
import pl.pkapusta.engine.view.graphics3d.primitives.PathGeometry;
import openfl.display.Bitmap;
import openfl.display.BitmapData;
import openfl.geom.Matrix;
import openfl.geom.Rectangle;
import openfl.geom.Vector3D;
import forevershining.ForevershiningSceneParams;

/**
 * @author Przemysław Kapusta
 */
class AbstractHeadstoneModel3D extends SimpleSceneModel3D implements IM3DExecutor implements IM3DExecutorProperty
{
    public var stoneAreaSquareMetersInfo(get, never) : Float;
    
    private var Z_OFFSET(default, never) : Float = 10;
    
    private var PROP_WIDTH(default, never) : String = "width";
    private var PROP_HEIGHT(default, never) : String = "height";
    private var PROP_DEPTH(default, never) : String = "depth";
    private var PROP_COLOR(default, never) : String = "color";
    private var PROP_FRONT_BITMAP(default, never) : String = "front-bitmap";
    
    private var cornerRound(default, never) : Float = 1.2;
    
    private var _width : Float = 400;
    private var _height : Float = 400;
    private var _depth : Float = 60;
    private var _colorProperty : ColorTextureProperty;
    
    private var colorReflectionCube : CubeReflectionTexture;
    private var colorReflectionMethod : FresnelEnvMapMethod;
    
    private var _frontBitmap : BitmapData;
    private var _frontBmpWidth : Int;
    private var _frontBmpHeight : Int;
    
    private var modelPath : ScalingDiscretePath;
	private var modelOptions : haxe.DynamicAccess<Dynamic> = {};
    private var modelGeometry : PathGeometry;
    private var modelMesh : Mesh;
    private var modelMaterial : TextureMaterial;
    
    private var frontGeometry : PathGeometry;
    private var frontMesh : Mesh;
    private var frontMaterial : TextureMaterial;
    
    private var inscriptionsRegion : ISurfaceRegionProxy;
    private var inscriptionsRegionBounds : Dynamic;
    
    private var selection : IStandardSelectionProxy;
	
	private var updateSizeIsDirty:Bool = false;
    
    override public function build(): Void {
        super.build();
        
        selection = try cast(model.getSelectionObject(), IStandardSelectionProxy) catch (e:Dynamic) null;
        
        buildRegions();
        
        modelPath = buildModelPath();
		
		_width = modelPath.bounds.width;
		_height = modelPath.bounds.height;
		
        modelPath.width = _width;
        modelPath.height = _height;
        
        modelGeometry = new PathGeometry(modelPath, _depth, cornerRound, true, true, true, null, modelOptions);
        
        _colorProperty = new ColorTextureProperty(PROP_COLOR);
        modelMaterial = _colorProperty.material;
        //modelMaterial = new TextureMaterial(new BitmapTexture(new BitmapData(1, 1, false, 0x000000)), true, true);
        //modelMaterial.specular = 0.7;
        //modelMaterial.ambient = 0.1;
        registerMaterialForSceneLightPicker(modelMaterial, ForevershiningSceneParams.LIGHTS_PICKER);
        
        colorReflectionCube = new CubeReflectionTexture(512);
        colorReflectionCube.position = new Vector3D(0, 0, 0);
        colorReflectionMethod = new FresnelEnvMapMethod(colorReflectionCube, 0.36);
        colorReflectionMethod.fresnelPower = 0.3;
        
        modelMesh = new Mesh(modelGeometry, modelMaterial);
        modelMesh.castsShadows = true;
        modelMesh.mouseEnabled = true;
        modelMesh.pickingCollider = new HaxePickingCollider(false);
        
        frontMaterial = new TextureMaterial(null, true, false);
        frontMaterial.alphaBlending = true;
        registerMaterialForSceneLightPicker(frontMaterial, ForevershiningSceneParams.LIGHTS_PICKER);
        
        registerCubeReflection(colorReflectionCube, beforeColorReflectionRender, afterColorReflectionRender);
        registerReflectionMethod(colorReflectionMethod, modelMaterial);
        registerReflectionMethod(colorReflectionMethod, frontMaterial);        
        
        //build reflections
        /*var reflection:CubeReflectionTexture = new CubeReflectionTexture(512);
			reflection.farPlaneDistance = 1000;
			reflection.nearPlaneDistance = 5;
			reflection.position = new Vector3D(0, 50, 0);
			registerCubeReflection(
				reflection,
				function():void {
					trace("before");
					container.removeChild(modelMesh);
					if (frontMesh != null) container.removeChild(frontMesh);
				},
				function():void {
					trace("after");
					container.addChild(modelMesh);
					if (frontMesh != null) container.addChild(frontMesh);
				}
			);
			var reflectionMethod:FresnelEnvMapMethod = new FresnelEnvMapMethod(reflection, 1);
			reflectionMethod.normalReflectance = 0.09;
			registerReflectionMethod(reflectionMethod, modelMaterial);
			registerReflectionMethod(reflectionMethod, frontMaterial);*/
			
		dispatchPropertyChange(PROP_WIDTH, _width, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_HEIGHT, _height, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_DEPTH, _depth, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_COLOR, _colorProperty.textureValue, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_FRONT_BITMAP, null, DISPATCH_PROPERTY_TYPE_INIT);
        
        container.addChild(modelMesh);
        
        updateDimensions();
        
        calibrateColorReflection();
		if (selection != null) updateSelection(selection);
		
    }
    
    override public function dispose() : Void
    {
        if (_colorProperty != null)
        {
            _colorProperty.dispose();
            _colorProperty = null;
        }
        if (modelMesh != null)
        {
            container.removeChild(modelMesh);
            modelMesh.disposeWithChildren();
            modelMesh = null;
        }
        if (frontMesh != null)
        {
            container.removeChild(frontMesh);
            frontMesh.disposeWithChildren();
            frontMesh = null;
        }
        if (modelGeometry != null)
        {
            modelGeometry.dispose();
            modelGeometry = null;
        }
        if (frontMaterial != null && frontMaterial.texture != null)
        {
            frontMaterial.texture.dispose();
            frontMaterial.texture = null;
        }
        if (_frontBitmap != null)
        {
            _frontBitmap.dispose();
            _frontBitmap = null;
        }
        if (colorReflectionCube != null)
        {
            colorReflectionCube.dispose();
            colorReflectionCube = null;
        }
        if (colorReflectionMethod != null)
        {
            colorReflectionMethod.dispose();
            colorReflectionMethod = null;
        }
        modelPath = null;
        super.dispose();
    }
    
    private function get_stoneAreaSquareMetersInfo() : Float
    {
        return (_width / 1000) * (_height / 1000);
    }
    
    public function stoneVolumeCubicMetersInfo(params : IParamStorage) : Float
    {
        return stoneAreaSquareMetersInfo * (_depth / 1000);
    }
    
    private function calibrateColorReflection() : Void
    {
        Bounds.getObjectContainerBounds(container, true);
        var reflectionPosition : Vector3D = new Vector3D(
        Bounds.minX + (Bounds.maxX - Bounds.minX) * 0.5, 
        Bounds.minY + (Bounds.maxY - Bounds.minY) * 0.5, 
        Bounds.minZ + (Bounds.maxZ - Bounds.minZ) * 0.5);
        colorReflectionCube.position = reflectionPosition;
        updateReflections();
    }
    
    private function beforeColorReflectionRender() : Void
    {
        container.visible = false;
    }
    private function afterColorReflectionRender() : Void
    {
        container.visible = true;
    }
    
    /** @abstract */
    private function buildModelPath() : ScalingDiscretePath
    {
        throw "Abstract Method!";
    }
    
    private function buildRegions() : Void
    {
        inscriptionsRegion = try cast(model.getRegion("inscriptions"), ISurfaceRegionProxy) catch(e:Dynamic) null;
        inscriptionsRegionBounds = inscriptionsRegion.getBaseInstance().getBoundsShape();
    }
    
    private function updateRegions() : Void
    {
        if (inscriptionsRegion != null)
        {
            inscriptionsRegion.moveTo(0, _height / 2, _depth + Z_OFFSET);
        }
        if (inscriptionsRegionBounds != null)
        {
            var regionBoundsWidth : Int = Std.int(_width);
            var regionBoundsHeight : Int = Std.int(_height);
            inscriptionsRegionBounds.updateBounds(new Rectangle(-regionBoundsWidth / 2, -regionBoundsHeight / 2, regionBoundsWidth, regionBoundsHeight));
        }
    }
    
    private function updateDimensions() : Void {
		updateSizeIsDirty = true;
	}
	
	
	private function doUpdateSize():Void
    {
        modelPath.width = _width;
        modelPath.height = _height;
        modelGeometry.thickness = _depth;
        modelMesh.moveTo(0, 0, _depth / 2 + Z_OFFSET);
        
        if (frontGeometry != null)
        {
            frontGeometry.thickness = _depth;
            frontGeometry.uvMappingRect = getFrontUVMappging();
            frontMesh.moveTo(0, 0, _depth / 2 + Z_OFFSET);
        }
        
        updateRegions();
        
        if (selection != null) updateSelection(selection);
    }
	
	private function updateSelection(selection:IStandardSelectionProxy):Void {
		selection.resizeTo(_width, _depth, _height);
		selection.moveTo(0, _depth / 2 + Z_OFFSET, _height / 2);
	}
    
    private function getValidTexture(tex : BitmapData) : BitmapData
    {
        if (TextureUtils.isBitmapDataValid(tex))
        {
            return tex.clone();
        }
        var w : Int = TextureUtils.getBestPowerOf2(tex.width);
        var h : Int = TextureUtils.getBestPowerOf2(tex.height);
        var bmp : BitmapData = new BitmapData(w, h, tex.transparent, 0x00000000);
        bmp.draw(tex, new Matrix(w / tex.width, 0, 0, h / tex.height), null, null, null, true);
        return bmp;
    }
    
    private function getFrontUVMappging() : Rectangle
    {
        var bounds : Rectangle = modelPath.bounds;
        var scale : Float = ((bounds.width / bounds.height < _frontBmpWidth / _frontBmpHeight)) ? bounds.width / _frontBmpWidth : bounds.height / _frontBmpHeight;
        var w : Float = _frontBmpWidth * scale;
        var h : Float = _frontBmpHeight * scale;
        return new Rectangle(bounds.left + (bounds.width - w) * 0.5, bounds.top + (bounds.height - h) * 0.5, w, h);
    }
    
    override public function updateProperty(name : String, data : Dynamic) : Void
    {
        if (name == this.PROP_WIDTH) {
			if (!Std.is(data, Float) && !Std.is(data, Int) && !Std.is(data, String)) throw "Property " + name + " is not type: number";
			if (Std.is(data, String)) data = Std.parseFloat(data);
			if (_width == data)
			{
				return;
			}
			_width = data;
			updateDimensions();
			dispatchPropertyChange(PROP_WIDTH, _width, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_HEIGHT) {
			if (!Std.is(data, Float) && !Std.is(data, Int) && !Std.is(data, String)) throw "Property " + name + " is not type: number";
			if (Std.is(data, String)) data = Std.parseFloat(data);
			if (_height == data)
			{
				return;
			}
			_height = data;
			updateDimensions();
			dispatchPropertyChange(PROP_HEIGHT, _height, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_DEPTH) {
			if (!Std.is(data, Float) && !Std.is(data, Int) && !Std.is(data, String)) throw "Property " + name + " is not type: number";
			if (Std.is(data, String)) data = Std.parseFloat(data);
			if (_depth == data)
			{
				return;
			}
			_depth = data;
			updateDimensions();
			dispatchPropertyChange(PROP_DEPTH, _depth, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_COLOR) {
			if (_colorProperty.change(data))
			{
				var uvMap : Rectangle = _colorProperty.optimumUVMap.clone();
				uvMap.inflate(uvMap.width * 2.8, uvMap.height * 2.8);
				modelGeometry.uvMappingRect = uvMap;
				dispatchPropertyChange(PROP_COLOR, data, DISPATCH_PROPERTY_TYPE_EXTERNAL);
			}
		} else if (name == this.PROP_FRONT_BITMAP) {
			if (data != null && (Std.is(data, BitmapData) || Std.is(data, Bitmap)))
			{
				if (frontMaterial != null && frontMaterial.texture != null)
				{
					frontMaterial.texture.dispose();
					frontMaterial.texture = null;
				}
				if (_frontBitmap != null)
				{
					_frontBitmap.dispose();
					_frontBitmap = null;
				}
				
				if (Std.is(data, Bitmap))
				{
					_frontBmpWidth = cast((data), Bitmap).bitmapData.width;
					_frontBmpHeight = cast((data), Bitmap).bitmapData.height;
					_frontBitmap = getValidTexture(cast((data), Bitmap).bitmapData);
				}
				else
				{
					_frontBmpWidth = cast((data), BitmapData).width;
					_frontBmpHeight = cast((data), BitmapData).height;
					_frontBitmap = getValidTexture(try cast(data, BitmapData) catch(e:Dynamic) null);
				}
				
				frontMaterial.texture = new BitmapTexture(_frontBitmap);
				
				if (frontGeometry == null || frontMesh == null)
				{
					frontGeometry = new PathGeometry(modelPath, _depth, cornerRound, true, false, false, getFrontUVMappging());
					frontMesh = new Mesh(frontGeometry, frontMaterial);
					frontMesh.moveTo(0, 0, 0.1);
					container.addChild(frontMesh);
				}
			}
			else
			{
				if (frontMaterial != null && frontMaterial.texture != null)
				{
					frontMaterial.texture.dispose();
					frontMaterial.texture = null;
				}
				if (_frontBitmap != null)
				{
					_frontBitmap.dispose();
					_frontBitmap = null;
				}
				if (frontMesh != null)
				{
					if (frontMesh.parent != null)
					{
						container.removeChild(frontMesh);
					}
					frontMesh.dispose();
					frontMesh = null;
				}
				if (frontGeometry != null)
				{
					frontGeometry.dispose();
					frontGeometry = null;
				}
			}
        } else {
			super.updateProperty(name, data);
		}
    }
	
	public override function beforeViewRender(view:View3D):Void {
		if (updateSizeIsDirty) {
			try {
				doUpdateSize();
				updateSizeIsDirty = false;
			} catch (e:Dynamic) {
				updateSizeIsDirty = false;
			}
		}
		super.beforeViewRender(view);
	}

    public function new()
    {
        super();
    }
}

