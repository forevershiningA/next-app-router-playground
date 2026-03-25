package pl.pkapusta.engine.model.executors.utils.properties;

import away3d.materials.TextureMaterial;
import away3d.textures.ATFTexture;
import away3d.textures.BitmapTexture;
import away3d.tools.utils.TextureUtils;
import pl.pkapusta.engine.model.properties.values.ATFTextureValue;
import pl.pkapusta.engine.model.properties.values.BitmapTextureValue;
import pl.pkapusta.engine.model.properties.values.interfaces.ITextureValue;
import openfl.display.BitmapData;
import openfl.geom.Matrix;
import openfl.geom.Rectangle;
import openfl.utils.ByteArray;

@:keep
@:expose("Engine3D.model.executors.utils.properties.ColorTextureProperty")
class ColorTextureProperty implements IM3DProperty
{
    public var propertyId(get, never) : String;
    public var material(get, never) : TextureMaterial;
    public var textureValue(get, never) : Dynamic;
    public var optimumUVMap(get, never) : Rectangle;

    
    private var BLANK_TEXTURE : BitmapData;
    
    private var _propertyId : String;
    
    private var _textureValue : ITextureValue = null;
    private var _texture : BitmapData = null;
    private var _atfTexture : ByteArray = null;
    
    private var _optimumUVMap : Rectangle;
    
    private var _material : TextureMaterial;
    
    public function new(propertyId : String = "color", defaultFillColor : UInt = 0x00000000)
    {
		BLANK_TEXTURE = new BitmapData(1, 1, false, defaultFillColor);
        _propertyId = propertyId;
        _material = new TextureMaterial(new BitmapTexture(BLANK_TEXTURE, false), true, true, true);
    }
    
    public function dispose() : Void
    {
        if (_material != null)
        {
            if (_material.texture != null)
            {
                _material.texture.dispose();
            }
            _material.dispose();
            _material = null;
        }
        if (_texture != null)
        {
            _texture.dispose();
            _texture = null;
        }
        if (_atfTexture != null)
        {
            _atfTexture.clear();
            _atfTexture = null;
        }
        _optimumUVMap = null;
        _textureValue = null;
    }
    
    private function get_propertyId() : String
    {
        return _propertyId;
    }
    
    private function get_material() : TextureMaterial
    {
        return _material;
    }
    
    private function get_textureValue() : Dynamic
    {
        return _textureValue;
    }
    
    private function get_optimumUVMap() : Rectangle
    {
        return _optimumUVMap;
    }
    
    public function change(data : Dynamic) : Bool
    {
        if (_textureValue == data)
        {
            return false;
        }
        _textureValue = try cast(data, ITextureValue) catch(e:Dynamic) null;
        if (_textureValue != null)
        {
            if (_texture != null)
            {
                _texture.dispose();
                _texture = null;
            }
            if (_atfTexture != null)
            {
                _atfTexture.clear();
                _atfTexture = null;
            }
            if (Std.is(_textureValue, ATFTextureValue))
            {
                var atfTex : ByteArray = cast((data), ATFTextureValue).texture;
                if (atfTex == null)
                {
                    return change(null);
                }
                _atfTexture = new ByteArray();
                _atfTexture.writeBytes(atfTex);
                var atex : ATFTexture = new ATFTexture(_atfTexture);
                var uvW : Float = atex.width / _textureValue.surfaceCoatingScale;
                var uvH : Float = atex.height / _textureValue.surfaceCoatingScale;
                _optimumUVMap = new Rectangle(-uvW / 2, -uvH / 2, uvW, uvH);
                if (_material.texture != null)
                {
                    _material.texture.dispose();
                }
                _material.texture = atex;
            }
            else if (Std.is(_textureValue, BitmapTextureValue))
            {
                var tex : BitmapData = cast((data), BitmapTextureValue).texture;
                if (tex == null)
                {
                    return change(null);
                }
                _texture = getValidTexture(tex);
                var uvW : Float = tex.width / _textureValue.surfaceCoatingScale;
                var uvH : Float = tex.height / _textureValue.surfaceCoatingScale;
                _optimumUVMap = new Rectangle(-uvW / 2, -uvH / 2, uvW, uvH);
                if (_material.texture != null)
                {
                    _material.texture.dispose();
                }
                //_material = new TextureMaterial(new BitmapTexture(_texture), true, true, true);
                _material.texture = new BitmapTexture(_texture);
            }
            else
            {
                return change(null);
            }
        }
        else
        {
            if (_atfTexture != null)
            {
                _atfTexture.clear();
                _atfTexture = null;
            }
            if (_texture != null)
            {
                _texture.dispose();
                _texture = null;
            }
            _optimumUVMap = new Rectangle(-0.5, -0.5, 1, 1);
            if (_material.texture != null)
            {
                _material.texture.dispose();
            }
            _material.texture = new BitmapTexture(BLANK_TEXTURE, false);
        }
        return true;
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
}

