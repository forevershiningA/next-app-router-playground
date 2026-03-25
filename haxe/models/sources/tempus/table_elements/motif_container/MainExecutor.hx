package tempus.table_elements.motif_container;

import away3d.containers.View3D;
import away3d.entities.Mesh;
import away3d.materials.TextureMaterial;
import away3d.primitives.PlaneGeometry;
import away3d.textures.BitmapTexture;
import away3d.tools.utils.TextureUtils;
import pl.pkapusta.engine.model.executors.file.events.RegionPositionEvent;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorDuplicator;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProjectRW;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;
import pl.pkapusta.engine.model.executors.file.proxies.IModel3DProxy;
import pl.pkapusta.engine.model.executors.file.proxies.ISurfaceSelectionProxy;
import pl.pkapusta.engine.model.properties.values.DisplayObjectValue;
import pl.pkapusta.engine.project.data.structure.storage.IProjectStorageObject;
import openfl.display.Bitmap;
import openfl.display.BitmapData;
import openfl.display.DisplayObject;
import openfl.display.IBitmapDrawable;
import openfl.geom.Matrix;
import openfl.geom.Matrix3D;
import openfl.geom.Point;
import openfl.geom.Rectangle;
import tempus.TempusSceneParams;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Executor")
class MainExecutor extends SimpleSceneModel3D implements IM3DExecutor implements IM3DExecutorProperty implements IM3DExecutorDuplicator implements IM3DExecutorProjectRW
{
    public var defaultPropertiesDuplicator(get, never) : Bool;
    public var useDefaultProjectReader(get, never) : Bool;
    public var useDefaultProjectWriter(get, never) : Bool;

    
    private var MAX_TEXTURE_DIM(default, never) : Int = 1024;
    private var MAX_GEOM_DIM(default, never) : Float = 200;
    
	private var PROP_LAYER(default, never) : String = "layer";
    private var PROP_WIDTH(default, never) : String = "width";
    private var PROP_HEIGHT(default, never) : String = "height";
    private var PROP_DISPLAY_OBJECT(default, never) : String = "display_object";
    private var PROP_COLOR(default, never) : String = "color";
    private var PROP_SANDBLASTED(default, never) : String = "sandblasted";
    private var PROP_SANDBLAST_DEPTH(default, never) : String = "sandblast_depth";
    private var PROP_ALPHA(default, never) : String = "alpha";
    
	public var _layer : Int = 0;
    public var _width : Float = 100;
    public var _height : Float = 100;
    public var _display_object : Dynamic = null;
    private var _color : Float = Math.NaN;
    private var _sandblasted : Bool = false;
    private var _sandblastDepth : Float = 2;
    private var _alpha : Float = 1;
    
    private var _sandblastWorldDepth : Float = Math.NaN;
    
    public var _fixedAspectRatio : Float = 1;
    public var _scaleU : Float = 1;
    public var _scaleV : Float = 1;
    public var _scaleDim : Float = 1;
    
    private var mesh : Mesh;
    private var geom : PlaneGeometry;
    private var material : TextureMaterial;
    
    public var displayObjectCache : BitmapData;
    //private var displayObjectUMap:Number;
    //private var displayObjectVMap:Number;
    
    private var textureIsDirty : Bool = false;
    private var sanblastWorldDepthIsDirty : Bool = false;
    private var updateSizeIsDirty : Bool = false;
    
    public var ignoreDimensionsCompute : Bool = false;
    
    private var collisionShape : Dynamic;
    private var selection : ISurfaceSelectionProxy;
    
    private var alphaZOrderOffset(default, never) : Float = 500;
    private var zOrderMatrix(default, never) : Matrix3D = new Matrix3D();
    
    override public function build() : Void
    {
        super.build();
        
        zOrderMatrix.appendTranslation(0, -alphaZOrderOffset, 0);
        
        collisionShape = model.getBaseInstance().getCollisionShape("2d");
        selection = try cast(model.getSelectionObject(), ISurfaceSelectionProxy) catch(e:Dynamic) null;
        if (selection != null)
        {
            selection.getBaseInstance().addEventListener("selection.resizing", selectionResizingEvent);
            selection.getBaseInstance().addEventListener("selection.rotating", selectionRotatingEvent);
        }
        
        initGeometry();
        updateSize();
        
        dispatchPropertyChange(PROP_LAYER, _layer, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_WIDTH, _width, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_HEIGHT, _height, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_DISPLAY_OBJECT, _display_object, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_COLOR, _color, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_SANDBLASTED, _sandblasted, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_SANDBLAST_DEPTH, _sandblastDepth, DISPATCH_PROPERTY_TYPE_INIT);
        dispatchPropertyChange(PROP_ALPHA, _alpha, DISPATCH_PROPERTY_TYPE_INIT);
    }
    
    override public function dispose() : Void
    {
        if (geom != null)
        {
            geom.dispose();geom = null;
        }
        if (mesh != null)
        {
            if (container.contains(mesh))
            {
                container.removeChild(mesh);
            }
            mesh.disposeWithAnimatorAndChildren();mesh = null;
        }
        disposeTexture();
        if (material != null)
        {
            material.dispose();material = null;
        }
        disposeCache();
        super.dispose();
    }
    
    private function initGeometry() : Void
    {
        geom = new PlaneGeometry(_width, _height, 25, 25);
        material = new TextureMaterial(buildBlankTexture());
        material.alphaBlending = true;
        registerMaterialForSceneLightPicker(material, TempusSceneParams.LIGHTS_PICKER);
        mesh = new Mesh(geom, material);
        mesh.rotationY = 180;
        mesh.mouseEnabled = true;
        mesh.y = alphaZOrderOffset + 0.04;
        
        container.addChild(mesh);
    }
    
    private function buildBlankTexture() : BitmapTexture
    {
        return new BitmapTexture(new BitmapData(1, 1, true, 0x00000000), false);
    }
    
    private function doRenderTexture() : Void
    {
        disposeTexture();
        if (_display_object != null)
        {
            var bmp : BitmapData;
            if (Math.isNaN(_color))
            {
                bmp = displayObjectCache.clone();
            }
            else
            {
                bmp = new BitmapData(displayObjectCache.width, displayObjectCache.height, true, 0xFF000000 + Std.int(_color));
                bmp.copyChannel(displayObjectCache, bmp.rect, new Point(0, 0), 8 /*BitmapDataChannel.ALPHA*/, 8 /*BitmapDataChannel.ALPHA*/);
            }
            
			/*
            if (_sandblasted)
            {
                var bevelScale : Float = _sandblastDepth * _scaleDim * ((_scaleU + _scaleV) / 2);
                
                var bevelFilter : BevelFilter = new BevelFilter(bevelScale, 225, 
                0xFFFFFF, 1, 
                0x000000, 1, 
                bevelScale / 2, bevelScale / 2, 
                2, 1, 
                BitmapFilterType.INNER);
                
                var editRect : Rectangle = new Rectangle(0, 0, Math.ceil(bmp.width * _scaleU), Math.ceil(bmp.height * _scaleV));
                bmp.applyFilter(bmp, editRect, new Point(0, 0), bevelFilter);
            }
			*/
            
            
            material.texture = new BitmapTexture(bmp, true);
        }
        else
        {
            material.texture = buildBlankTexture();
        }
    }
    
    /*private function doSanblastWorldDepth():void {
			if (!_sandblasted) return;
			
			var worldDepth:Number = _sandblastDepth / _width * 1000;
			if (isNaN(_sandblastWorldDepth) || worldDepth != _sandblastWorldDepth) {
				_sandblastWorldDepth = worldDepth;
				renderTexture();
			}
			
		}*/
    
    private function buildBitmapCacheFromDisplayObject(display : IBitmapDrawable, width : Float, height : Float) : Dynamic
    {
        var drawScale : Float = 1;
        if (width > MAX_TEXTURE_DIM || height > MAX_TEXTURE_DIM)
        {
            drawScale = Math.min(MAX_TEXTURE_DIM / width, MAX_TEXTURE_DIM / height);
        }
        var tw : Int = Std.int(Math.min(TextureUtils.getBestPowerOf2(Std.int(width * drawScale)), MAX_TEXTURE_DIM));
        var th : Int = Std.int(Math.min(TextureUtils.getBestPowerOf2(Std.int(height * drawScale)), MAX_TEXTURE_DIM));
        //var ct:ColorTransform = new ColorTransform(0, 0, 0, 1, 255, 255, 255, 0);
        var bmp : BitmapData = new BitmapData(tw, th, true, 0x00000000);
        bmp.draw(display, new Matrix(drawScale, 0, 0, drawScale, 0, 0), null, null, null, true);
        return {
            bmp : bmp,
            uScale : (width * drawScale) / tw,
            vScale : (height * drawScale) / th
        };
    }
    
    private function disposeTexture() : Void
    {
        if (material.texture != null)
        {
            if (cast((material.texture), BitmapTexture).bitmapData != null)
            {
                cast((material.texture), BitmapTexture).bitmapData.dispose();
            }
            if (material.texture != null)
            {
                material.texture.dispose();
            }
            material.texture = null;
        }
    }
    
    private function disposeCache() : Void
    {
        if (displayObjectCache != null)
        {
            displayObjectCache.dispose();
            displayObjectCache = null;
        }
    }
    
    public function updateSize() : Void
    {
        updateSizeIsDirty = true;
    }
    
    private function doUpdateSize() : Void
    {
        geom.width = _width;
        geom.height = _height;
        geom.applyTransformation(zOrderMatrix);
        if (collisionShape != null)
        {
            collisionShape.setSize(_width, _height);
        }
        if (selection != null)
        {
            selection.setArea(new Rectangle(-_width / 2, -_height / 2, _width, _height));
        }
    }
    
    private function selectionResizingEvent(e : Dynamic) : Void
    {
        //var vector : Point = cast((e), Dynamic).resizingVector;
        //var point : Point = cast((e), Dynamic).resizingPoint;
        
		var vector : Point = e.resizingVector;
		var point : Point = e.resizingPoint;
		
        var newWidth : Float = Math.NaN;
        var newHeight : Float = Math.NaN;
        var scaledDim : Point;
        var changed : Bool = false;
        
        if (vector.x != 0 && vector.y != 0)
        {
            if (Math.abs(point.x) > Math.abs(point.y))
            {
                newWidth = Math.abs(point.x) * 2;
                newHeight = newWidth * (1 / _fixedAspectRatio);
            }
            else
            {
                newHeight = Math.abs(point.y) * 2;
                newWidth = newHeight * _fixedAspectRatio;
            }
        }
        else
        {
            if (vector.x != 0)
            {
                newWidth = Math.abs(point.x) * 2;
                newHeight = newWidth * (1 / _fixedAspectRatio);
            }
            if (vector.y != 0)
            {
                newHeight = Math.abs(point.y) * 2;
                newWidth = newHeight * _fixedAspectRatio;
            }
        }
        
        if ((!Math.isNaN(newWidth)) && (newWidth != _width))
        {
            changed = true;
            _width = newWidth;
            dispatchPropertyChange(PROP_WIDTH, _width, DISPATCH_PROPERTY_TYPE_INTERNAL);
        }
        if ((!Math.isNaN(newHeight)) && (newHeight != _height))
        {
            changed = true;
            _height = newHeight;
            dispatchPropertyChange(PROP_HEIGHT, _height, DISPATCH_PROPERTY_TYPE_INTERNAL);
        }
        
        if (changed) {
			//updateSanblastWorldDepth();
            
            updateSize();
        }
    }
    
    private function selectionRotatingEvent(e : Dynamic) : Void
    {
        //var vector : Point = cast((e), Object).resizingVector;
        //var point : Point = cast((e), Object).resizingPoint;
        
		var vector : Point = e.resizingVector;
		var point : Point = e.resizingPoint;
		
        var baseRotation : Float = Math.atan2(_width * 0.5 * vector.x, _height * 0.5 * vector.y);
        var currentRotation : Float = Math.atan2(point.x, point.y);
        
        var rotation : Float = currentRotation - baseRotation;
        
        dispatchEvent(new RegionPositionEvent(RegionPositionEvent.UPDATE_ROTATION_BY_INCREASE, rotation * 180 / Math.PI));
        
        updateSize();
    }
    
    private function renderTexture() : Void
    {
        textureIsDirty = true;
    }
    
    /*private function updateSanblastWorldDepth():void {
			if (!_sandblasted) return;
			sanblastWorldDepthIsDirty = true;
		}*/
    
    
    override public function updateProperty(name : String, data : Dynamic) : Void
    {
		if (name == this.PROP_LAYER) {
			if (!Std.is(data, Float) && !Std.is(data, Int) && !Std.is(data, String)) throw "Property " + name + " is not type: number";
			if (Std.is(data, String)) data = Std.parseInt(data);
			data = Std.int(data);
			if (_layer == data)
			{
				return;
			}
			_layer = data;
			mesh.zOffset = _layer * 128;
			container.zOffset = _layer * 128;
			dispatchPropertyChange(PROP_LAYER, _layer, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_WIDTH) {
			if (!Std.is(data, Float) && !Std.is(data, Int) && !Std.is(data, String)) throw "Property " + name + " is not type: number";
			if (Std.is(data, String)) data = Std.parseFloat(data);
			if (_width == data)
			{
				return;
			}
			_width = data;
			_height = _width * (1 / _fixedAspectRatio);
			//updateSanblastWorldDepth();
			updateSize();
			dispatchPropertyChange(PROP_WIDTH, _width, DISPATCH_PROPERTY_TYPE_EXTERNAL);
			dispatchPropertyChange(PROP_HEIGHT, _height, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_HEIGHT) {
			if (!Std.is(data, Float) && !Std.is(data, Int) && !Std.is(data, String)) throw "Property " + name + " is not type: number";
			if (Std.is(data, String)) data = Std.parseFloat(data);
			if (_height == data)
			{
				return;
			}
			_height = data;
			_width = _height * _fixedAspectRatio;
			//updateSanblastWorldDepth();
			updateSize();
			dispatchPropertyChange(PROP_WIDTH, _width, DISPATCH_PROPERTY_TYPE_EXTERNAL);
			dispatchPropertyChange(PROP_HEIGHT, _height, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_DISPLAY_OBJECT) {
			if (data != null)
			{
				var drawable : IBitmapDrawable = null;
				if (Std.is(data, DisplayObjectValue))
				{
					drawable = ((Std.is(cast((data), DisplayObjectValue).display, Bitmap))) ? cast((cast((data), DisplayObjectValue).display), Bitmap).bitmapData : cast((data), DisplayObjectValue).display;
				}
				var displayWidth : Float = ((Std.is(drawable, DisplayObject))) ? (cast((drawable), DisplayObject).width) : (((Std.is(drawable, BitmapData))) ? cast((drawable), BitmapData).width : Math.NaN);
				var displayHeight : Float = ((Std.is(drawable, DisplayObject))) ? (cast((drawable), DisplayObject).height) : (((Std.is(drawable, BitmapData))) ? cast((drawable), BitmapData).height : Math.NaN);
				if (!Math.isNaN(displayWidth) && displayWidth > 0 && !Math.isNaN(displayHeight) && displayHeight > 0)
				{
					disposeTexture();
					disposeCache();
					var drawResponse : Dynamic = buildBitmapCacheFromDisplayObject(drawable, displayWidth, displayHeight);
					displayObjectCache = drawResponse.bmp;
					//material.texture = data.texture;
					_scaleU = drawResponse.uScale;
					_scaleV = drawResponse.vScale;
					geom.scaleUV(_scaleU, _scaleV);
					_scaleDim = ((displayWidth > MAX_GEOM_DIM || displayHeight > MAX_GEOM_DIM)) ? Math.min(MAX_GEOM_DIM / displayWidth, MAX_GEOM_DIM / displayHeight) : 1;
					if (!ignoreDimensionsCompute)
					{
						_width = displayWidth * _scaleDim;
						_height = displayHeight * _scaleDim;
					}
					ignoreDimensionsCompute = false;
					_fixedAspectRatio = displayWidth / displayHeight;
					_display_object = data;
					dispatchPropertyChange(PROP_DISPLAY_OBJECT, data, DISPATCH_PROPERTY_TYPE_EXTERNAL);
				}
				else
				{
					throw "Unsupported DisplayObject type or object is empy";
				}
			}
			else
			{
				disposeTexture();
				disposeCache();
				_fixedAspectRatio = 1;
				_scaleU = 1;
				_scaleV = 1;
				_scaleDim = 1;
				_width = 100;
				_height = 100;
				_display_object = null;
				geom.scaleUV(1, 1);
				dispatchPropertyChange(PROP_DISPLAY_OBJECT, null, DISPATCH_PROPERTY_TYPE_EXTERNAL);
			}
			renderTexture();
			//updateSanblastWorldDepth();
			updateSize();
			dispatchPropertyChange(PROP_WIDTH, _width, DISPATCH_PROPERTY_TYPE_EXTERNAL);
			dispatchPropertyChange(PROP_HEIGHT, _height, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_COLOR) {
			if (_color == as3hx.Compat.parseFloat(data))
			{
				return;
			}
			//_color = (data != null && typeof(data) == "number" && !isNaN(Number(data)))?Number(data):NaN;
			_color = as3hx.Compat.parseFloat(data);
			renderTexture();
			dispatchPropertyChange(PROP_COLOR, _color, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_SANDBLASTED) {
			if (_sandblasted == cast(data, Bool))
			{
				return;
			}
			_sandblasted = cast(data, Bool);
			//if (_sandblasted) updateSanblastWorldDepth();
			renderTexture();
			dispatchPropertyChange(PROP_SANDBLASTED, _sandblasted, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_SANDBLAST_DEPTH) {
			if (!Std.is(data, Float) && !Std.is(data, Int) && !Std.is(data, String)) throw "Property " + name + " is not type: number";
			if (Std.is(data, String)) data = Std.parseFloat(data);
			if (_sandblastDepth == Math.max(0, data))
			{
				return;
			}
			_sandblastDepth = Math.max(0, data);
			//updateSanblastWorldDepth();
			renderTexture();
			dispatchPropertyChange(PROP_SANDBLAST_DEPTH, _sandblastDepth, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else if (name == this.PROP_ALPHA) {
			if (!Std.is(data, Float) && !Std.is(data, Int) && !Std.is(data, String)) throw "Property " + name + " is not type: number";
			if (Std.is(data, String)) data = Std.parseFloat(data);
			if (_alpha == data)
			{
				return;
			}
			_alpha = Math.max(0, Math.min(1, data));
			material.alpha = _alpha;
			dispatchPropertyChange(PROP_ALPHA, _alpha, DISPATCH_PROPERTY_TYPE_EXTERNAL);
		} else {
			super.updateProperty(name, data);
		}
    }
    
    override public function beforeViewRender(view : View3D) : Void
    /*if (sanblastWorldDepthIsDirty) {
				try {
					doSanblastWorldDepth();
				} finally {
					sanblastWorldDepthIsDirty = false;
				}
			}*/
    {
        
        if (textureIsDirty)
        {
            try
            {
                doRenderTexture();
				textureIsDirty = false;
            } catch (e:Dynamic) {
                textureIsDirty = false;
				throw e;
            }
        }
        if (updateSizeIsDirty)
        {
            try
            {
                doUpdateSize();
				updateSizeIsDirty = false;
            } catch (e:Dynamic) {
                updateSizeIsDirty = false;
				throw e;
            }
        }
        super.beforeViewRender(view);
    }
    
    /** DUPLICATOR */
    
    private function get_defaultPropertiesDuplicator() : Bool
    {
        return false;
    }
    
    public function duplicate(newModel : IModel3DProxy) : Void
    {
        newModel.changeProperty(PROP_DISPLAY_OBJECT, _display_object);
        var executor : Dynamic = ((newModel.getBaseInstance().modelData)) ? newModel.getBaseInstance().modelData.executor : null;
        if (executor != null) {
			//executor._display_object = _display_object;
            
            //executor.displayObjectCache = displayObjectCache.clone();
            //executor._fixedAspectRatio = _fixedAspectRatio;
            executor._width = _width;
            executor._height = _height;
            executor.ignoreDimensionsCompute = true;
        }
        newModel.changeProperty(PROP_COLOR, _color);
        newModel.changeProperty(PROP_SANDBLASTED, _sandblasted);
        newModel.changeProperty(PROP_SANDBLAST_DEPTH, _sandblastDepth);
        newModel.changeProperty(PROP_ALPHA, _alpha);
    }
    
    /** PROJECT READ WRITE */
    
    private function get_useDefaultProjectReader() : Bool
    {
        return true;
    }
    
    private function get_useDefaultProjectWriter() : Bool
    {
        return true;
    }
    
    public function projectReadAction(reader : IProjectStorageObject) : Void
    {
        _fixedAspectRatio = reader.readNumber("fixedAspectRatio", _fixedAspectRatio);
        ignoreDimensionsCompute = true;
    }
    
    public function projectWriteAction(writer : IProjectStorageObject) : Void
    {
        writer.writeNumber("fixedAspectRatio", _fixedAspectRatio);
    }

    public function new()
    {
        super();
    }
}

