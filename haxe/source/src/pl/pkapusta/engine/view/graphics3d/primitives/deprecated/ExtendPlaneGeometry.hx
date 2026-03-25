package pl.pkapusta.engine.view.graphics3d.primitives.deprecated;

import away3d.core.base.SubGeometry;
import away3d.core.base.CompactSubGeometry;
import away3d.primitives.PlaneGeometry;
import openfl.Vector;

/**
	 * @author Przemysław Kapusta
	 */
class ExtendPlaneGeometry extends PlaneGeometry
{
    public var startU(get, set) : Float;
    public var endU(get, set) : Float;
    public var startV(get, set) : Float;
    public var endV(get, set) : Float;

    
    private var _startU : Float;
    private var _endU : Float;
    private var _startV : Float;
    private var _endV : Float;
    
    public function new(width : Float = 100, height : Float = 100, segmentsW : Int = 1, segmentsH : Int = 1, yUp : Bool = true, doubleSided : Bool = false, startU : Float = 0, endU : Float = 1, startV : Float = 0, endV : Float = 1)
    {
        _startU = startU;
        _endU = endU;
        _startV = startV;
        _endV = endV;
        super(width, height, segmentsW, segmentsH, yUp, doubleSided);
    }
    
    override private function buildUVs(target : CompactSubGeometry) : Void
    /*var uvs : Vector.<Number> = new Vector.<Number>();
			var numUvs : uint = (segmentsH + 1) * (segmentsW + 1) * 2;

			if (target.UVData && numUvs == target.UVData.length)
				uvs = target.UVData;
			else
				uvs = new Vector.<Number>(numUvs, true);
				
			var uClip:Number = _endU - _startU;
			var vClip:Number = _endV - _startV;

			numUvs = 0;
			for (var yi : uint = 0; yi <= segmentsH; ++yi) {
				for (var xi : uint = 0; xi <= segmentsW; ++xi) {
					uvs[numUvs++] = xi/segmentsW * uClip + _startU;
					uvs[numUvs++] = 1 - (yi/segmentsH * vClip + _startV);
				}
			}

			target.updateUVData(uvs);*/
    {
        
        
        var data : Array<Float>;
        var stride : Int = target.UVStride;
        var numUvs : Int = as3hx.Compat.parseInt((segmentsH + 1) * (segmentsW + 1) * stride);
        var skip : Int = as3hx.Compat.parseInt(stride - 2);
        
        if (doubleSided)
        {
            numUvs *= 2;
        }
        
        if (target.UVData != null && numUvs == target.UVData.length)
        {
			data = new Array<Float>();
			for (f in target.UVData) data.push(f);
        }
        else
        {
            data = new Array<Float>();
            invalidateGeometry();
        }
        
        var index : Int = target.UVOffset;
        
        var uClip : Float = _endU - _startU;
        var vClip : Float = _endV - _startV;
        
        for (yi in 0...segmentsH + 1)
        {
            for (xi in 0...segmentsW + 1)
            {
                data[index++] = xi / segmentsW * uClip + _startU;
                data[index++] = 1 - (yi / segmentsH * vClip + _startV);
                index += skip;
                
                if (doubleSided)
                {
                    data[index++] = xi / segmentsW * uClip + _startU;
                    data[index++] = 1 - (yi / segmentsH * vClip + _startV);
                    index += skip;
                }
            }
        }
        
        target.updateData(Vector.ofArray(data));
    }
    
    private function get_startU() : Float
    {
        return _startU;
    }
    
    private function set_startU(value : Float) : Float
    {
        _startU = value;
        invalidateUVs();
        return value;
    }
    
    private function get_endU() : Float
    {
        return _endU;
    }
    
    private function set_endU(value : Float) : Float
    {
        _endU = value;
        invalidateUVs();
        return value;
    }
    
    private function get_startV() : Float
    {
        return _startV;
    }
    
    private function set_startV(value : Float) : Float
    {
        _startV = value;
        invalidateUVs();
        return value;
    }
    
    private function get_endV() : Float
    {
        return _endV;
    }
    
    private function set_endV(value : Float) : Float
    {
        _endV = value;
        invalidateUVs();
        return value;
    }
    
    public function setUVRect(startU : Float = 0, endU : Float = 1, startV : Float = 0, endV : Float = 1)
    {
        _startU = startU;
        _endU = endU;
        _startV = startV;
        _endV = endV;
        invalidateUVs();
    }
}

