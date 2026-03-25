package forevershining.urns;

import away3d.containers.ObjectContainer3D;
import away3d.containers.View3D;
import away3d.core.pick.HaxePickingCollider;
import away3d.entities.Mesh;
import away3d.materials.ColorMaterial;
import away3d.materials.ColorMultiPassMaterial;
import away3d.materials.TextureMaterial;
import away3d.materials.methods.BasicSpecularMethod;
import away3d.materials.methods.CelSpecularMethod;
import away3d.materials.methods.FresnelEnvMapMethod;
import away3d.textures.BitmapTexture;
import away3d.textures.CubeReflectionTexture;
import away3d.tools.utils.Bounds;
import away3d.tools.utils.TextureUtils;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorRenderer;
import pl.pkapusta.engine.model.executors.file.proxies.IStandardSelectionProxy;
import pl.pkapusta.engine.model.executors.file.proxies.ISurfaceRegionProxy;
import pl.pkapusta.engine.model.properties.values.BitmapTextureValue;
import pl.pkapusta.engine.model.properties.values.DisplayObjectValue;
import pl.pkapusta.engine.model.properties.values.TextureValue;
import openfl.display.Bitmap;
import openfl.display.BitmapData;
import openfl.display.IBitmapDrawable;
import openfl.geom.Matrix;
import openfl.geom.Rectangle;
import openfl.geom.Vector3D;
import forevershining.ForevershiningSceneParams;

/**
	 * @author Przemysław Kapusta
	 */
class AbstractUrnModel3D extends SimpleSceneModel3D implements IM3DExecutor implements IM3DExecutorProperty
{
    
    private var MODEL_SCALING_BASE : Float = 2.547 * 10;
    private var MODEL_SCALING : Float = 10;
    
    private var Z_OFFSET(default, never) : Float = 15;
    
    private var PROP_WIDTH(default, never) : String = "width";
    private var PROP_HEIGHT(default, never) : String = "height";
    private var PROP_DEPTH(default, never) : String = "depth";
    
    private var PROP_FRONT_BITMAP(default, never) : String = "front-bitmap";
    
    private var _initialWidth : Float;
    private var _initialHeight : Float;
    private var _initialDepth : Float;
    private var _initialRegionPos : Vector3D;
    private var _initialRegionRect : Rectangle;
    
    private var _modelContainerPos : Vector3D;
    private var _modelContainerRot : Vector3D;
    
    private var _width : Float;
    private var _height : Float;
    private var _depth : Float;
    private var _frontBitmap : Dynamic;
    
    private var modelContainer : ObjectContainer3D;
    private var borderMesh : Mesh;
    private var frontMesh : Mesh;
    
    private var modelBaseContainer : ObjectContainer3D;
    private var baseMesh : Mesh;
    
    private var modelDiffuseMap : BitmapData;
    
    private var reflectionTextureBig : CubeReflectionTexture;
    private var reflectionTextureSmall : CubeReflectionTexture;
    
    private var _borderMaterial : ColorMaterial;
    private var _baseMaterial : ColorMaterial;
    private var _frontMaterial : TextureMaterial;
    private var _borderFresnelMethod : FresnelEnvMapMethod;
    private var _frontFresnelMethod : FresnelEnvMapMethod;
    private var _baseFresnelMethod : FresnelEnvMapMethod;
    
    private var _blackFrontBitmap : BitmapData;
    private var _frontTextureBitmap : BitmapData = null;
    private var _frontTexture : BitmapTexture;
    
    private var inscriptionsRegion : ISurfaceRegionProxy;
    private var inscriptionsRegionBounds : Dynamic;
    
    private var selection : IStandardSelectionProxy;
    
    private var updateSizeIsDirty : Bool = false;
    
    /** @abstract */
    private function initializeUrn() : Void
    {
    }
    
    override public function build() : Void
    {
        super.build();
        
        initializeUrn();
        _width = _initialWidth;
        _height = _initialHeight;
        _depth = _initialDepth;
        if (_modelContainerRot == null)
        {
            _modelContainerRot = new Vector3D(0, 180, 0);
        }
        
        selection = try cast(model.getSelectionObject(), IStandardSelectionProxy) catch(e:Dynamic) null;
        
        buildRegions();
        
        if (getObject3DAsset("model-base") != null)
        {
            modelBaseContainer = getObject3DAsset("model-base").loader;
            modelBaseContainer.scale(MODEL_SCALING_BASE);
            modelBaseContainer.rotationY = 180;
            modelBaseContainer.z = _depth / 2;
            baseMesh = getObject3DAsset("model-base").assets["mesh"][0];
        }
        
        modelContainer = getObject3DAsset("model").loader;
        modelContainer.scale(MODEL_SCALING);
        modelContainer.rotateTo(_modelContainerRot.x, _modelContainerRot.y, _modelContainerRot.z);
        //modelContainer.moveTo(0, _height / 2, _depth / 2);
		
        modelContainer.moveTo(_modelContainerPos.x, _modelContainerPos.y, _modelContainerPos.z);
        borderMesh = sharedData.getParam("borderMesh");
        frontMesh = sharedData.getParam("frontMesh");
        
        modelDiffuseMap = getTextureAsset("model-diffusemap").texture;
        
        borderMesh.castsShadows = true;
        borderMesh.pickingCollider = new HaxePickingCollider(false);
        frontMesh.castsShadows = true;
        
        reflectionTextureBig = new CubeReflectionTexture(1024);
        reflectionTextureBig.farPlaneDistance = 1000;
        reflectionTextureBig.nearPlaneDistance = 5;
        reflectionTextureBig.position = new Vector3D(0, 0, 0);
        
        reflectionTextureSmall = new CubeReflectionTexture(256);
        reflectionTextureSmall.farPlaneDistance = 1000;
        reflectionTextureSmall.nearPlaneDistance = 5;
        reflectionTextureSmall.position = new Vector3D(0, 0, 0);
        
        var borderSpecularBitmapTexture : BitmapTexture = new BitmapTexture(modelDiffuseMap);
        
        _borderMaterial = new ColorMaterial(0xcccdd1);
        _borderMaterial.specularMap = borderSpecularBitmapTexture;
        _borderMaterial.specular = 1;
        var borderMatSpecularMethod : CelSpecularMethod = new CelSpecularMethod(0.25, new BasicSpecularMethod());
        borderMatSpecularMethod.gloss = 100;
        _borderMaterial.specularMethod = borderMatSpecularMethod;
        registerMaterialForSceneLightPicker(_borderMaterial, ForevershiningSceneParams.STEEL_LIGHTS_PICKER);
        
        if (baseMesh != null)
        {
            _baseMaterial = new ColorMaterial(0xcccdd1);
            _baseMaterial.specularMap = borderSpecularBitmapTexture;
            _baseMaterial.specular = 1;
            _baseMaterial.ambient = 1.7;
            var baseMatSpecularMethod : CelSpecularMethod = new CelSpecularMethod(0.25, new BasicSpecularMethod());
            baseMatSpecularMethod.gloss = 100;
            _baseMaterial.specularMethod = baseMatSpecularMethod;
            registerMaterialForSceneLightPicker(_baseMaterial, ForevershiningSceneParams.STEEL_LIGHTS_PICKER);
        }
        
        _blackFrontBitmap = new BitmapData(1, 1, false, 0x000000);
        _frontTexture = new BitmapTexture(_blackFrontBitmap, false);
        _frontMaterial = new TextureMaterial(_frontTexture, true, false, true);
        _frontMaterial.specular = 0.7;
        _frontMaterial.ambient = 0.1;
        registerMaterialForSceneLightPicker(_frontMaterial, ForevershiningSceneParams.LIGHTS_PICKER);
        
        _borderFresnelMethod = new FresnelEnvMapMethod(reflectionTextureSmall, 0.55);
        _borderFresnelMethod.normalReflectance = 0.55;
        
        _baseFresnelMethod = new FresnelEnvMapMethod(reflectionTextureSmall, 0.55);
        _baseFresnelMethod.normalReflectance = 0.55;
        
        _frontFresnelMethod = new FresnelEnvMapMethod(reflectionTextureBig, 1);
        _frontFresnelMethod.normalReflectance = 0.09;
        
        registerCubeReflection(reflectionTextureBig, beforeReflectionRender, afterReflectionRender);
        registerCubeReflection(reflectionTextureSmall, beforeReflectionRender, afterReflectionRender);
        registerReflectionMethod(_borderFresnelMethod, _borderMaterial);
        if (baseMesh != null)
        {
            registerReflectionMethod(_baseFresnelMethod, _baseMaterial);
        }
        registerReflectionMethod(_frontFresnelMethod, _frontMaterial);
        
        if (borderMesh != null)
        {
            borderMesh.material = _borderMaterial;
        }
        if (frontMesh != null)
        {
            frontMesh.material = _frontMaterial;
        }
        if (baseMesh != null)
        {
            baseMesh.material = _baseMaterial;
        }
        
        if (baseMesh != null)
        {
            container.addChild(modelBaseContainer);
        }
        container.addChild(modelContainer);
        
        updateSize();
        
        calibrateReflections();
        
        dispatchPropertyChange(PROP_WIDTH, _width, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_HEIGHT, _height, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_DEPTH, _depth, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_FRONT_BITMAP, _frontBitmap, DISPATCH_PROPERTY_TYPE_INIT);
    }
    
    override public function dispose() : Void
    {
        modelContainer = null;
        borderMesh = null;
        frontMesh = null;
        modelBaseContainer = null;
        baseMesh = null;
        modelDiffuseMap = null;
        _frontBitmap = null;
        if (_borderMaterial != null)
        {
            _borderMaterial.dispose();
            _borderMaterial = null;
        }
        if (_baseMaterial != null)
        {
            _baseMaterial.dispose();
            _baseMaterial = null;
        }
        if (_frontMaterial != null)
        {
            _frontMaterial.dispose();
            _frontMaterial = null;
        }
        if (_frontTexture != null)
        {
            _frontTexture.dispose();
            _frontTexture = null;
        }
        if (_blackFrontBitmap != null)
        {
            _blackFrontBitmap.dispose();
            _blackFrontBitmap = null;
        }
        if (_frontTextureBitmap != null)
        {
            _frontTextureBitmap.dispose();
            _frontTextureBitmap = null;
        }
        if (reflectionTextureBig != null)
        {
            reflectionTextureBig.dispose();
            reflectionTextureBig = null;
        }
        if (reflectionTextureSmall != null)
        {
            reflectionTextureSmall.dispose();
            reflectionTextureSmall = null;
        }
        super.dispose();
    }
    
    private function buildRegions() : Void
    {
        inscriptionsRegion = try cast(model.getRegion("inscriptions"), ISurfaceRegionProxy) catch(e:Dynamic) null;
        inscriptionsRegionBounds = inscriptionsRegion.getBaseInstance().getBoundsShape();
    }
    
    private function beforeReflectionRender() : Void
    {
        container.visible = false;
    }
    private function afterReflectionRender() : Void
    {
        container.visible = true;
    }
    
    private function calibrateReflections() : Void
    {
        Bounds.getObjectContainerBounds(container, true);
        var reflectionPosition : Vector3D = new Vector3D(
        Bounds.minX + (Bounds.maxX - Bounds.minX) * 0.5, 
        Bounds.minY + (Bounds.maxY - Bounds.minY) * 0.5, 
        Bounds.minZ + (Bounds.maxZ - Bounds.minZ) * 0.5);
        reflectionTextureBig.position = reflectionPosition;
        reflectionTextureSmall.position = reflectionPosition;
        updateReflections();
    }
    
    private function getValidTexture(tex : IBitmapDrawable, texWidth : Int, texHeight : Int) : BitmapData
    {
        if (Std.is(tex, BitmapData) && TextureUtils.isBitmapDataValid(cast((tex), BitmapData)))
        {
            return cast((tex), BitmapData).clone();
        }
        if (Std.is(tex, Bitmap) && TextureUtils.isBitmapDataValid(cast((tex), Bitmap).bitmapData))
        {
            return cast((tex), Bitmap).bitmapData.clone();
        }
        var w : Int = TextureUtils.getBestPowerOf2(texWidth);
        var h : Int = TextureUtils.getBestPowerOf2(texHeight);
        //trace("w: " + w + ", h: " + h);
        var bmp : BitmapData = new BitmapData(w, h, false, 0xff0000);
        bmp.draw(tex, new Matrix(w / texWidth, 0, 0, h / texHeight), null, null, null, true);
        return bmp;
    }
    
    private function updateSize() : Void
    {
        updateSizeIsDirty = true;
    }
    
    private function doUpdateSize() : Void
    {
        container.scaleX = _width / _initialWidth;
        container.scaleY = _height / _initialHeight;
        container.scaleZ = _depth / _initialDepth;
        
        if (selection != null)
        {
            selection.moveTo(0, _depth / 2, _height / 2);
            selection.resizeTo(_width, _depth, _height);
        }
        
        if (inscriptionsRegion != null)
        {
            inscriptionsRegion.moveTo(0, _initialRegionPos.y * container.scaleY, _initialRegionPos.z * container.scaleZ);
            if (inscriptionsRegionBounds != null)
            {
                inscriptionsRegionBounds.updateBounds(new Rectangle(_initialRegionRect.x * container.scaleX, _initialRegionRect.y * container.scaleY, 
                        _initialRegionRect.width * container.scaleX, _initialRegionRect.height * container.scaleY));
            }
        }
    }
    
    override public function updateProperty(name : String, data : Dynamic) : Void
    {
		if (name == this.PROP_WIDTH) {
			if (_width == as3hx.Compat.parseFloat(data))
			{
				return;
			}
			_width = as3hx.Compat.parseFloat(data);
			updateSize();
			dispatchPropertyChange(PROP_WIDTH, _width, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_DEPTH) {
			if (_depth == as3hx.Compat.parseFloat(data))
			{
				return;
			}
			_depth = as3hx.Compat.parseFloat(data);
			updateSize();
			dispatchPropertyChange(PROP_DEPTH, _depth, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_HEIGHT) {
			if (_height == as3hx.Compat.parseFloat(data))
			{
				return;
			}
			_height = as3hx.Compat.parseFloat(data);
			updateSize();
			dispatchPropertyChange(PROP_HEIGHT, _height, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_FRONT_BITMAP) {
			if (data == _frontBitmap)
			{
				return;
			}
			if (data != null)
			{
				var bmp : BitmapData;
				var validBmp : BitmapData = null;
				if (Std.is(data, BitmapTextureValue))
				{
					var btVal : BitmapTextureValue = cast((data), BitmapTextureValue);
					validBmp = getValidTexture(btVal.texture, btVal.texture.width, btVal.texture.height);
				}
				else if (Std.is(data, DisplayObjectValue))
				{
					var doVal : DisplayObjectValue = cast((data), DisplayObjectValue);
					validBmp = getValidTexture(doVal.display, Std.int(doVal.display.width), Std.int(doVal.display.height));
				}
				else if (Std.is(data, Bitmap) || Std.is(data, BitmapData))
				{
					bmp = ((Std.is(data, Bitmap))) ? cast((data), Bitmap).bitmapData : cast((data), BitmapData);
					validBmp = getValidTexture(bmp, bmp.width, bmp.height);
				}
				if (validBmp != null)
				{
					if (_frontTextureBitmap != null)
					{
						_frontTextureBitmap.dispose();
						_frontTextureBitmap = null;
					}
					_frontTextureBitmap = validBmp;
					_frontTexture.dispose();
					_frontTexture = new BitmapTexture(_frontTextureBitmap, true);
					_frontMaterial.texture = _frontTexture;
					_frontBitmap = data;
				}
				else
				{
					throw "Unsupported front bitmap value type";
				}
			}
			else
			{
				if (_frontTextureBitmap != null)
				{
					_frontTextureBitmap.dispose();
					_frontTextureBitmap = null;
				}
				_frontTexture.dispose();
				_frontTexture = new BitmapTexture(_blackFrontBitmap, false);
				_frontMaterial.texture = _frontTexture;
				_frontBitmap = null;
			}
		} else {
			super.updateProperty(name, data);
		}
    }
    
    override public function beforeViewRender(view : View3D) : Void
    {
        if (updateSizeIsDirty)
        {
            try
            {
                doUpdateSize();
				updateSizeIsDirty = false;
            } catch( e : Dynamic ) {
                updateSizeIsDirty = false;
				throw e;
            }
        }
        super.beforeViewRender(view);
    }

    public function new()
    {
        super();
    }
}

