package pl.pkapusta.engine.graphics.path;


/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.graphics.path.HeadScalingDiscretePath")
class HeadScalingDiscretePath extends ScalingDiscretePath
{
    public var headLimit(get, set) : Float;

    
    private var _headLimit : Float;
    
    private var _primeHeadPoints : Array<DiscretePoint>;
    private var _primeRestPoints : Array<DiscretePoint>;
    
    private var _headPoints : Array<DiscretePoint>;
    private var _restPoints : Array<DiscretePoint>;
    
    public function new(points : Array<DiscretePoint>, headLimit : Float, hasNormals : Bool = false, hasTangents : Bool = false, normalsDirection : Int = 0, closed : Bool = true)
    {
        super(points, hasNormals, hasTangents, normalsDirection, closed);
        _headLimit = headLimit;
        allocateScalingPoints();
    }
    
    override public function clone(clonePoints : Bool = true) : DiscretePath
    {
        var r : HeadScalingDiscretePath = new HeadScalingDiscretePath(
        ((clonePoints)) ? this.clonePoints(_points) : _points, 
        headLimit, 
        hasNormals, 
        hasTangents, 
        normalsDirection, 
        closed);
        if (r.width != this.width)
        {
            r.width = this.width;
        }
        if (r.height != this.height)
        {
            r.height = this.height;
        }
        return r;
    }
    
    private function allocateScalingPoints() : Void
    {
        if (Math.isNaN(_headLimit))
        {
            _primeHeadPoints = _primeRestPoints = _headPoints = _restPoints = null;
            return;
        }
        
        var i : Int;
        var length : Int;
        var p : DiscretePoint;
        var scaleP : DiscretePoint;
        var px : Float;var py : Float;
        
        _primeHeadPoints = new Array<DiscretePoint>();
        _primeRestPoints = new Array<DiscretePoint>();
        
        _headPoints = new Array<DiscretePoint>();
        _restPoints = new Array<DiscretePoint>();
        
        length = _points.length;
        for (i in 0...length)
        {
            p = _points[i];
            scaleP = _scaledPoints[i];
            px = p.x;
            py = p.y;
            if (py >= _headLimit)
            {
                _primeHeadPoints.push(p);
                _headPoints.push(scaleP);
            }
            else
            {
                _primeRestPoints.push(p);
                _restPoints.push(scaleP);
            }
        }
    }
    
    override private function doComputeScaleX(value : Float) : Void
    {
        doComputeScale(value, height);
    }
    
    override private function doComputeScaleY(value : Float) : Void
    {
        doComputeScale(width, value);
    }
    
    private function doComputeScale(newWidth : Float, newHeight : Float) : Void
    {
        var i : Int;
        var length : Int;
        var p : DiscretePoint;
        var ps : DiscretePoint;
        
        var primeWidth : Float = _bounds.width;
        var primeHeight : Float = _bounds.height;
        var primeLimit : Float = Math.min(_bounds.bottom, Math.max(_headLimit, _bounds.top));
        
        var scaleWidth : Float = newWidth / primeWidth;
        var scaleHeightHead : Float = scaleWidth;
        
        var primeHeadHeight : Float = _bounds.bottom - primeLimit;
        var newHeadHeight : Float = primeHeadHeight * scaleHeightHead;
        
        var scaleHeightRest : Float = (newHeight - newHeadHeight) / (primeHeight - primeHeadHeight);
        
        var yOffsetHead : Float = _bounds.bottom * (newHeight / primeHeight) - _bounds.bottom * scaleHeightHead;
        var yOffsetRest : Float = _bounds.top * (newHeight / primeHeight) - _bounds.top * scaleHeightRest;
        
        length = _headPoints.length;
        for (i in 0...length)
        {
            p = Reflect.field(_primeHeadPoints, Std.string(i));
            ps = Reflect.field(_headPoints, Std.string(i));
            ps.x = p.x * scaleWidth;
            ps.y = p.y * scaleHeightHead + yOffsetHead;
        }
        
        length = _restPoints.length;
        for (i in 0...length)
        {
            p = Reflect.field(_primeRestPoints, Std.string(i));
            ps = Reflect.field(_restPoints, Std.string(i));
            ps.x = p.x * scaleWidth;
            ps.y = p.y * scaleHeightRest + yOffsetRest;
        }
    }
    
    private function get_headLimit() : Float
    {
        return _headLimit;
    }
    
    private function set_headLimit(value : Float) : Float
    {
        if (_headLimit == value)
        {
            return value;
        }
        _headLimit = value;
        allocateScalingPoints();
        doComputeScaleX(width);
        doComputeScaleY(height);
        invalidateBounds();
        computeNormals();
        dispatchChange();
        return value;
    }
}

