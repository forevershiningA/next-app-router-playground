package pl.pkapusta.engine.view.graphics3d.primitives.deprecated;

import away3d.core.base.CompactSubGeometry;
import away3d.core.base.SubGeometry;
import away3d.primitives.PrimitiveBase;
import openfl.Vector;

/**
	 * A Tomb Cube primitive mesh.
	 */
class TombSinCubeGeometry extends PrimitiveBase
{
    public var width(get, set) : Float;
    public var height(get, set) : Float;
    public var depth(get, set) : Float;
    public var segmentsW(get, set) : Int;
    public var segmentsH(get, set) : Int;
    public var segmentsD(get, set) : Int;
    public var startU(get, set) : Float;
    public var endU(get, set) : Float;
    public var startV(get, set) : Float;
    public var endV(get, set) : Float;
    public var cornerHeight(get, set) : Float;
    public var cornerOffset(get, set) : Float;
    public var cornerWidthMultiply(get, set) : Float;
    public var correctUV(get, set) : Bool;

    private var _width : Float;
    private var _height : Float;
    private var _depth : Float;
    
    private var _segmentsW : Int;
    private var _segmentsH : Int;
    private var _segmentsD : Int;
    
    private var _startU : Float;
    private var _endU : Float;
    private var _startV : Float;
    private var _endV : Float;
    
    private var _cornerHeight : Float;
    private var _cornerOffset : Float;
    private var _cornerWidthMultiply : Float;
    
    private var _correctUV : Bool;
    
    /**
		 * Creates a new Cube object.
		 * @param width The size of the cube along its X-axis.
		 * @param height The size of the cube along its Y-axis.
		 * @param depth The size of the cube along its Z-axis.
		 * @param segmentsW The number of segments that make up the cube along the X-axis.
		 * @param segmentsH The number of segments that make up the cube along the Y-axis.
		 * @param segmentsD The number of segments that make up the cube along the Z-axis.
		 */
    public function new(width : Float = 100, height : Float = 100, depth : Float = 100,
            segmentsW : Int = 1, segmentsH : Int = 1, segmentsD : Int = 1, startU : Float = 0, endU : Float = 1, startV : Float = 0, endV : Float = 1,
            cornerHeight : Float = 10, cornerOffset : Float = 0, cornerWidthMultiply : Float = 1, correctUV : Bool = true)
    {
        super();
        
        _width = width;
        _height = height;
        _depth = depth;
        _segmentsW = segmentsW;
        _segmentsH = segmentsH;
        _segmentsD = segmentsD;
        _startU = startU;
        _endU = endU;
        _startV = startV;
        _endV = endV;
        _cornerHeight = cornerHeight;
        _cornerOffset = cornerOffset;
        _cornerWidthMultiply = cornerWidthMultiply;
        _correctUV = correctUV;
    }
    
    /**
		 * The size of the cube along its X-axis.
		 */
    private function get_width() : Float
    {
        return _width;
    }
    
    private function set_width(value : Float) : Float
    {
        _width = value;
        invalidateGeometry();
        return value;
    }
    
    /**
		 * The size of the cube along its Y-axis.
		 */
    private function get_height() : Float
    {
        return _height;
    }
    
    private function set_height(value : Float) : Float
    {
        _height = value;
        invalidateGeometry();
        return value;
    }
    
    /**
		 * The size of the cube along its Z-axis.
		 */
    private function get_depth() : Float
    {
        return _depth;
    }
    
    private function set_depth(value : Float) : Float
    {
        _depth = value;
        invalidateGeometry();
        return value;
    }
    
    /**
		 * The number of segments that make up the cube along the X-axis. Defaults to 1.
		 */
    private function get_segmentsW() : Int
    {
        return _segmentsW;
    }
    
    private function set_segmentsW(value : Int) : Int
    {
        _segmentsW = value;
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
    
    /**
		 * The number of segments that make up the cube along the Y-axis. Defaults to 1.
		 */
    private function get_segmentsH() : Int
    {
        return _segmentsH;
    }
    
    private function set_segmentsH(value : Int) : Int
    {
        _segmentsH = value;
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
    
    /**
		 * The number of segments that make up the cube along the Z-axis. Defaults to 1.
		 */
    private function get_segmentsD() : Int
    {
        return _segmentsD;
    }
    
    private function set_segmentsD(value : Int) : Int
    {
        _segmentsD = value;
        invalidateGeometry();
        invalidateUVs();
        return value;
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
    
    private function get_cornerHeight() : Float
    {
        return _cornerHeight;
    }
    
    private function set_cornerHeight(value : Float) : Float
    {
        _cornerHeight = value;
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
    
    private function get_cornerOffset() : Float
    {
        return _cornerOffset;
    }
    
    private function set_cornerOffset(value : Float) : Float
    {
        _cornerOffset = value;
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
    
    private function get_cornerWidthMultiply() : Float
    {
        return _cornerWidthMultiply;
    }
    
    private function set_cornerWidthMultiply(value : Float) : Float
    {
        _cornerWidthMultiply = value;
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
    
    private function get_correctUV() : Bool
    {
        return _correctUV;
    }
    
    private function set_correctUV(value : Bool) : Bool
    {
        _correctUV = value;
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
    
    private function cornerFunc(range : Float, height : Float) : Float
    {
        return (Math.sin(range * Math.PI * 2) * 0.5 * height) - height * 0.5;
    }
    
    /**
		 * @inheritDoc
		 */
	@:access(away3d.core.base.CompactSubGeometry.indexData)
    override private function buildGeometry(target : CompactSubGeometry) : Void
    {
        var data : Array<Float>;
        var indices : Array<Int>;
        
        var tl : Int;
        var tr : Int;
        var bl : Int;
        var br : Int;
        var i : Int;
        var j : Int;
        var inc : Int = 0;
        
        var vidx : Int;
        var fidx : Int;  // indices  
        var hw : Float;
        var hh : Float;
        var hd : Float;  // halves  
        var dw : Float;
        var dh : Float;
        var dd : Float;  // deltas  
        
        var outer_pos : Float;
        
        var numVerts : Int = as3hx.Compat.parseInt(((_segmentsW + 1) * (_segmentsH + 1) +
                (_segmentsW + 1) * (_segmentsD + 1) +
                (_segmentsH + 1) * (_segmentsD + 1)) * 2);
        
        var stride : Int = target.vertexStride;
        var skip : Int = as3hx.Compat.parseInt(stride - 9);
        
        if (numVerts == target.numVertices)
        {
			data = new Array<Float>();
			for (e in target.vertexData) data.push(e);
			indices = new Array<Int>();
			if (target.indexData != null) for (e in target.indexData) indices.push(e);
        }
        else
        {
            data = new Array<Float>();
            indices = new Array<Int>();
            invalidateUVs();
        }
        
        // Indices
        vidx = target.vertexOffset;
        fidx = 0;
        
        // half cube dimensions
        hw = _width / 2;
        hh = _height / 2;
        hd = _depth / 2;
        
        // Segment dimensions
        dw = _width / _segmentsW;
        dh = _height / _segmentsH;
        dd = _depth / _segmentsD;
        
        for (i in 0..._segmentsW + 1)
        {
            outer_pos = -hw + i * dw;
            
            //var sine_x_pos:Number = hd + Math.sin((outer_pos / _width) * Math.PI * 2) * 10;
            var sine_x_pos : Float = hd + cornerFunc((outer_pos / _width) * _cornerWidthMultiply + _cornerOffset, _cornerHeight);
            
            for (j in 0..._segmentsH + 1) {
            
				// front
                data[vidx++] = outer_pos;
                data[vidx++] = -hh + j * dh;
                data[vidx++] = -hd;
                data[vidx++] = 0;
                data[vidx++] = 0;
                data[vidx++] = -1;
                data[vidx++] = 1;
                data[vidx++] = 0;
                data[vidx++] = 0;
                vidx += skip;
                
                // back
                data[vidx++] = outer_pos;
                data[vidx++] = -hh + j * dh;
                //data[vidx++] = hd;
                data[vidx++] = sine_x_pos;
                data[vidx++] = 0;
                data[vidx++] = 0;
                data[vidx++] = 1;
                data[vidx++] = -1;
                data[vidx++] = 0;
                data[vidx++] = 0;
                vidx += skip;
                
                if (i != 0 && j != 0)
                {
                    tl = as3hx.Compat.parseInt(2 * ((i - 1) * (_segmentsH + 1) + (j - 1)));
                    tr = as3hx.Compat.parseInt(2 * (i * (_segmentsH + 1) + (j - 1)));
                    bl = as3hx.Compat.parseInt(tl + 2);
                    br = as3hx.Compat.parseInt(tr + 2);
                    
                    indices[fidx++] = tl;
                    indices[fidx++] = bl;
                    indices[fidx++] = br;
                    indices[fidx++] = tl;
                    indices[fidx++] = br;
                    indices[fidx++] = tr;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = br + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tl + 1;
                }
            }
        }
        
        inc += as3hx.Compat.parseInt(2 * (_segmentsW + 1) * (_segmentsH + 1));
        
        for (i in 0..._segmentsW + 1)
        {
            outer_pos = -hw + i * dw;
            
            for (j in 0..._segmentsD + 1) {
            
				// top
                data[vidx++] = outer_pos;
                data[vidx++] = hh;
                
                if (j == _segmentsD)
                {
                    data[vidx++] = -hd + j * dd + cornerFunc((outer_pos / _width) * _cornerWidthMultiply + _cornerOffset, _cornerHeight);
                }
                else
                {
                    data[vidx++] = -hd + j * dd;
                }
                
                data[vidx++] = 0;
                data[vidx++] = 1;
                data[vidx++] = 0;
                data[vidx++] = 1;
                data[vidx++] = 0;
                data[vidx++] = 0;
                vidx += skip;
                
                // bottom
                data[vidx++] = outer_pos;
                data[vidx++] = -hh;
                
                if (j == _segmentsD)
                {
                    data[vidx++] = -hd + j * dd + cornerFunc((outer_pos / _width) * _cornerWidthMultiply + _cornerOffset, _cornerHeight);
                }
                else
                {
                    data[vidx++] = -hd + j * dd;
                }
                
                
                data[vidx++] = 0;
                data[vidx++] = -1;
                data[vidx++] = 0;
                data[vidx++] = 1;
                data[vidx++] = 0;
                data[vidx++] = 0;
                vidx += skip;
                
                if (i != 0 && j != 0)
                {
                    tl = as3hx.Compat.parseInt(inc + 2 * ((i - 1) * (_segmentsD + 1) + (j - 1)));
                    tr = as3hx.Compat.parseInt(inc + 2 * (i * (_segmentsD + 1) + (j - 1)));
                    bl = as3hx.Compat.parseInt(tl + 2);
                    br = as3hx.Compat.parseInt(tr + 2);
                    
                    indices[fidx++] = tl;
                    indices[fidx++] = bl;
                    indices[fidx++] = br;
                    indices[fidx++] = tl;
                    indices[fidx++] = br;
                    indices[fidx++] = tr;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = br + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tl + 1;
                }
            }
        }
        
        inc += as3hx.Compat.parseInt(2 * (_segmentsW + 1) * (_segmentsD + 1));
        
        for (i in 0..._segmentsD + 1)
        {
            outer_pos = hd - i * dd;
            
            for (j in 0..._segmentsH + 1) {
            
				// left
                data[vidx++] = -hw;
                data[vidx++] = -hh + j * dh;
                
                if (i == 0)
                {
                    data[vidx++] = outer_pos + cornerFunc((-hw / _width) * _cornerWidthMultiply + _cornerOffset, _cornerHeight);
                }
                else
                {
                    data[vidx++] = outer_pos;
                }
                data[vidx++] = -1;
                data[vidx++] = 0;
                data[vidx++] = 0;
                data[vidx++] = 0;
                data[vidx++] = 0;
                data[vidx++] = -1;
                vidx += skip;
                
                // right
                data[vidx++] = hw;
                data[vidx++] = -hh + j * dh;
                
                if (i == 0)
                {
                    data[vidx++] = outer_pos + cornerFunc((hw / _width) * _cornerWidthMultiply + _cornerOffset, _cornerHeight);
                }
                else
                {
                    data[vidx++] = outer_pos;
                }
                
                data[vidx++] = 1;
                data[vidx++] = 0;
                data[vidx++] = 0;
                data[vidx++] = 0;
                data[vidx++] = 0;
                data[vidx++] = 1;
                vidx += skip;
                
                if (i != 0 && j != 0)
                {
                    tl = as3hx.Compat.parseInt(inc + 2 * ((i - 1) * (_segmentsH + 1) + (j - 1)));
                    tr = as3hx.Compat.parseInt(inc + 2 * (i * (_segmentsH + 1) + (j - 1)));
                    bl = as3hx.Compat.parseInt(tl + 2);
                    br = as3hx.Compat.parseInt(tr + 2);
                    
                    indices[fidx++] = tl;
                    indices[fidx++] = bl;
                    indices[fidx++] = br;
                    indices[fidx++] = tl;
                    indices[fidx++] = br;
                    indices[fidx++] = tr;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = br + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tl + 1;
                }
            }
        }
        
        target.updateData(Vector.ofArray(data));
        target.updateIndexData(Vector.ofArray(indices));
    }
    
    /**
		 * @inheritDoc
		 */
    override private function buildUVs(target : CompactSubGeometry) : Void
    {
        var i : Int;
        var j : Int;
        var uidx : Int;
        var data : Array<Float>;
        
        var u_tile_dim : Float;
        var v_tile_dim : Float;
        var tl0u : Float;
        var tl0v : Float;
        var tl1u : Float;
        var tl1v : Float;
        var du : Float;
        var dv : Float;
        var stride : Int = target.UVStride;
        var numUvs : Int = as3hx.Compat.parseInt(((_segmentsW + 1) * (_segmentsH + 1) +
                (_segmentsW + 1) * (_segmentsD + 1) +
                (_segmentsH + 1) * (_segmentsD + 1)) * 2 * stride);
        var skip : Int = as3hx.Compat.parseInt(stride - 2);
        
        if (target.UVData != null && numUvs == target.UVData.length)
        {
			data = new Array<Float>();
			for (e in target.UVData) data.push(e);
        }
        else
        {
            data = new Array<Float>();
            invalidateGeometry();
        }
        
        // Create planes two and two, the same way that they were
        // constructed in the buildGeometry() function. First calculate
        // the top-left UV coordinate for both planes, and then loop
        // over the points, calculating the UVs from these numbers.
        
        // When tile6 is true, the layout is as follows:
        //       .-----.-----.-----. (1,1)
        //       | Bot |  T  | Bak |
        //       |-----+-----+-----|
        //       |  L  |  F  |  R  |
        // (0,0)'-----'-----'-----'
        
        uidx = target.UVOffset;
        
        var global_u_dim = _endU - _startU;
        var global_v_dim = _endV - _startV;
        
        var corner_v_dim = (_cornerHeight / (_height * 2 + _depth)) * global_v_dim;
        
        // FRONT / BACK
        
        tl0u = _startU + (_height / (_height * 2 + _width)) * global_u_dim;
        tl0v = _startV + ((_height + _depth) / (_height * 2 + _depth)) * global_v_dim;
        tl1u = tl0u;
        tl1v = _startV;
        
        u_tile_dim = (_width / (_height * 2 + _width)) * global_u_dim;
        v_tile_dim = (_height / (_height * 2 + _depth)) * global_v_dim;
        
        du = u_tile_dim / _segmentsW;
        dv = v_tile_dim / _segmentsH;
        for (i in 0..._segmentsW + 1)
        {
            for (j in 0..._segmentsH + 1)
            {
                data[uidx++] = tl0u + i * du;
                data[uidx++] = tl0v + (v_tile_dim - j * dv);
                uidx += skip;
                data[uidx++] = tl1u + i * du;
                data[uidx++] = tl1v + j * dv;
                uidx += skip;
            }
        }
        
        // TOP / BOTTOM
        
        tl0u = _startU + (_height / (_height * 2 + _width)) * global_u_dim;
        tl0v = _startV + (_height / (_height * 2 + _depth)) * global_v_dim;
        tl1u = tl0u;
        tl1v = tl0v;
        
        u_tile_dim = (_width / (_height * 2 + _width)) * global_u_dim;
        v_tile_dim = (_depth / (_height * 2 + _depth)) * global_v_dim;
        
        du = u_tile_dim / _segmentsW;
        dv = v_tile_dim / _segmentsD;
        
        if (_correctUV)
        {
            for (i in 0..._segmentsW + 1)
            {
                for (j in 0..._segmentsD + 1)
                {
                    if (j == _segmentsD)
                    {
                        data[uidx++] = tl0u + i * du;
                        data[uidx++] = tl0v + (v_tile_dim - j * dv) - cornerFunc(((i / _segmentsW) - 0.5) * _cornerWidthMultiply + _cornerOffset, corner_v_dim);
                        uidx += skip;
                        data[uidx++] = tl1u + i * du;
                        data[uidx++] = tl1v + (v_tile_dim - j * dv) - cornerFunc(((i / _segmentsW) - 0.5) * _cornerWidthMultiply + _cornerOffset, corner_v_dim);
                        uidx += skip;
                    }
                    else
                    {
                        data[uidx++] = tl0u + i * du;
                        data[uidx++] = tl0v + (v_tile_dim - j * dv);
                        uidx += skip;
                        data[uidx++] = tl1u + i * du;
                        data[uidx++] = tl1v + (v_tile_dim - j * dv);
                        uidx += skip;
                    }
                }
            }
        }
        else
        {
            for (i in 0..._segmentsW + 1)
            {
                for (j in 0..._segmentsD + 1)
                {
                    data[uidx++] = tl0u + i * du;
                    data[uidx++] = tl0v + (v_tile_dim - j * dv);
                    uidx += skip;
                    data[uidx++] = tl1u + i * du;
                    data[uidx++] = tl1v + (v_tile_dim - j * dv);
                    uidx += skip;
                }
            }
        }
        
        // LEFT / RIGHT
        
        tl0u = _startU;
        tl0v = _startV + (_height / (_height * 2 + _depth)) * global_v_dim;
        tl1u = _startU + ((_height + _width) / (_height * 2 + _width)) * global_u_dim;
        tl1v = tl0v;
        
        u_tile_dim = (_height / (_height * 2 + _width)) * global_u_dim;
        v_tile_dim = (_depth / (_height * 2 + _depth)) * global_v_dim;
        
        du = u_tile_dim / _segmentsD;
        dv = v_tile_dim / _segmentsH;
        
        if (_correctUV)
        {
            for (i in 0..._segmentsD + 1)
            {
                if (i == 0)
                {
                    for (j in 0..._segmentsH + 1)
                    {
                        data[uidx++] = tl0u + j * du;
                        data[uidx++] = tl0v + i * dv - cornerFunc(((i / _segmentsW) - 0.5) * _cornerWidthMultiply + _cornerOffset, corner_v_dim);
                        uidx += skip;
                        data[uidx++] = tl1u + (u_tile_dim - j * du);
                        data[uidx++] = tl1v + i * dv - cornerFunc(((i / _segmentsW) - 0.5) * _cornerWidthMultiply + _cornerOffset, corner_v_dim);
                        uidx += skip;
                    }
                }
                else
                {
                    for (j in 0..._segmentsH + 1)
                    {
                        data[uidx++] = tl0u + j * du;
                        data[uidx++] = tl0v + i * dv;
                        uidx += skip;
                        data[uidx++] = tl1u + (u_tile_dim - j * du);
                        data[uidx++] = tl1v + i * dv;
                        uidx += skip;
                    }
                }
            }
        }
        else
        {
            for (i in 0..._segmentsD + 1)
            {
                for (j in 0..._segmentsH + 1)
                {
                    data[uidx++] = tl0u + j * du;
                    data[uidx++] = tl0v + i * dv;
                    uidx += skip;
                    data[uidx++] = tl1u + (u_tile_dim - j * du);
                    data[uidx++] = tl1v + i * dv;
                    uidx += skip;
                }
            }
        }
        
        target.updateData(Vector.ofArray(data));
    }
}
