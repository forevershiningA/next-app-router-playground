package pl.pkapusta.engine.graphics.path;

import openfl.geom.Rectangle;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.graphics.path.NineScalingDiscretePath")
class NineScalingDiscretePath extends ScalingDiscretePath
{
    public var nineScalingBounds(get, set) : Rectangle;

    
    private var _nineScalingBounds : Rectangle;
    
    private var _primeHLeftConstPoints : Array<DiscretePoint>;
    private var _primeHRightConstPoints : Array<DiscretePoint>;
    private var _primeVTopConstPoints : Array<DiscretePoint>;
    private var _primeVBottomConstPoints : Array<DiscretePoint>;
    private var _primeHResizablePoints : Array<DiscretePoint>;
    private var _primeVResizablePoints : Array<DiscretePoint>;
    
    private var _HLeftConstPoints : Array<DiscretePoint>;
    private var _HRightConstPoints : Array<DiscretePoint>;
    private var _VTopConstPoints : Array<DiscretePoint>;
    private var _VBottomConstPoints : Array<DiscretePoint>;
    private var _HResizablePoints : Array<DiscretePoint>;
    private var _VResizablePoints : Array<DiscretePoint>;
    
    public function new(points : Array<DiscretePoint>, nineScalingBounds : Rectangle, hasNormals : Bool = false, hasTangents : Bool = false, normalsDirection : Int = 0, closed : Bool = true)
    {
        super(points, hasNormals, hasTangents, normalsDirection, closed);
        _nineScalingBounds = nineScalingBounds;
        allocateNineScalingPoints();
    }
    
    override public function clone(clonePoints : Bool = true) : DiscretePath
    {
        var r : NineScalingDiscretePath = new NineScalingDiscretePath(
        ((clonePoints)) ? this.clonePoints(_points) : _points, 
        nineScalingBounds.clone(), 
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
    
    private function allocateNineScalingPoints() : Void
    {
        if (_nineScalingBounds == null)
        {
            _HLeftConstPoints = _HRightConstPoints = _VTopConstPoints = _VBottomConstPoints = _HResizablePoints = _VResizablePoints = null;
            _primeHLeftConstPoints = _primeHRightConstPoints = _primeVTopConstPoints = _primeVBottomConstPoints = _primeHResizablePoints = _primeVResizablePoints = null;
            return;
        }
        
        var i : Int;
        var length : Int;
        var p : DiscretePoint;
        var scaleP : DiscretePoint;
        var px : Float;var py : Float;
        
        _primeHLeftConstPoints = new Array<DiscretePoint>();
        _primeHRightConstPoints = new Array<DiscretePoint>();
        _primeVTopConstPoints = new Array<DiscretePoint>();
        _primeVBottomConstPoints = new Array<DiscretePoint>();
        _primeHResizablePoints = new Array<DiscretePoint>();
        _primeVResizablePoints = new Array<DiscretePoint>();
        
        _HLeftConstPoints = new Array<DiscretePoint>();
        _HRightConstPoints = new Array<DiscretePoint>();
        _VTopConstPoints = new Array<DiscretePoint>();
        _VBottomConstPoints = new Array<DiscretePoint>();
        _HResizablePoints = new Array<DiscretePoint>();
        _VResizablePoints = new Array<DiscretePoint>();
        
        var leftLimit : Float = _nineScalingBounds.left;
        var topLimit : Float = _nineScalingBounds.top;
        var rightLimit : Float = _nineScalingBounds.right;
        var bottomLimit : Float = _nineScalingBounds.bottom;
        
        length = _points.length;
        for (i in 0...length)
        {
            p = _points[i];
            scaleP = _scaledPoints[i];
            px = p.x;
            py = p.y;
            if (px < leftLimit)
            {
                _primeHLeftConstPoints.push(p);
                _HLeftConstPoints.push(scaleP);
            }
            else if (px > rightLimit)
            {
                _primeHRightConstPoints.push(p);
                _HRightConstPoints.push(scaleP);
            }
            else
            {
                _primeHResizablePoints.push(p);
                _HResizablePoints.push(scaleP);
            }
            if (py < topLimit)
            {
                _primeVTopConstPoints.push(p);
                _VTopConstPoints.push(scaleP);
            }
            else if (py > bottomLimit)
            {
                _primeVBottomConstPoints.push(p);
                _VBottomConstPoints.push(scaleP);
            }
            else
            {
                _primeVResizablePoints.push(p);
                _VResizablePoints.push(scaleP);
            }
        }
    }
    
    override private function doComputeScaleX(value : Float) : Void
    {
        var i : Int;
        var length : Int;
        var offset : Float;
        var scale : Float;
        
        var primeDimension : Float = _bounds.width;
        var primeMinBound : Float = _bounds.left;
        var primeMaxBound : Float = _bounds.right;
        var dimensionScale : Float = value / primeDimension;
        var minBound : Float = primeMinBound * dimensionScale;
        var maxBound : Float = primeMaxBound * dimensionScale;
        
        var primeMinLimit : Float = Math.max(primeMinBound, Math.min(primeMaxBound, _nineScalingBounds.left));
        var primeMaxLimit : Float = Math.max(primeMinBound, Math.min(primeMaxBound, _nineScalingBounds.right));
        
        var primeMinAllocation : Array<DiscretePoint> = _primeHLeftConstPoints;
        var primeCenterAllocation : Array<DiscretePoint> = _primeHResizablePoints;
        var primeMaxAllocation : Array<DiscretePoint> = _primeHRightConstPoints;
        
        var minAllocation : Array<DiscretePoint> = _HLeftConstPoints;
        var centerAllocation : Array<DiscretePoint> = _HResizablePoints;
        var maxAllocation : Array<DiscretePoint> = _HRightConstPoints;
        
        //calculate minimum allocation
        offset = minBound - primeMinBound;
        scale = 1;
        length = minAllocation.length;
        for (i in 0...length)
        {
            Reflect.field(minAllocation, Std.string(i)).x = Reflect.field(primeMinAllocation, Std.string(i)).x * scale + offset;
        }
        
        //calculate center allocation
        var minAreaWidth : Float = primeMinLimit - primeMinBound;
        var maxAreaWidth : Float = primeMaxBound - primeMaxLimit;
        scale = (primeDimension * dimensionScale - minAreaWidth - maxAreaWidth) / (primeDimension - minAreaWidth - maxAreaWidth);
        offset = minBound - (primeMinBound - primeMinLimit) - primeMinLimit * scale;
        length = centerAllocation.length;
        for (i in 0...length)
        {
            Reflect.field(centerAllocation, Std.string(i)).x = Reflect.field(primeCenterAllocation, Std.string(i)).x * scale + offset;
        }
        
        //calculate minimum allocation
        offset = maxBound - primeMaxBound;
        scale = 1;
        length = maxAllocation.length;
        for (i in 0...length)
        {
            Reflect.field(maxAllocation, Std.string(i)).x = Reflect.field(primeMaxAllocation, Std.string(i)).x * scale + offset;
        }
    }
    
    override private function doComputeScaleY(value : Float) : Void
    {
        var i : Int;
        var length : Int;
        var offset : Float;
        var scale : Float;
        
        var primeDimension : Float = _bounds.height;
        var primeMinBound : Float = _bounds.top;
        var primeMaxBound : Float = _bounds.bottom;
        var dimensionScale : Float = value / primeDimension;
        var minBound : Float = primeMinBound * dimensionScale;
        var maxBound : Float = primeMaxBound * dimensionScale;
        
        var primeMinLimit : Float = Math.max(primeMinBound, Math.min(primeMaxBound, _nineScalingBounds.top));
        var primeMaxLimit : Float = Math.max(primeMinBound, Math.min(primeMaxBound, _nineScalingBounds.bottom));
        
        var primeMinAllocation : Array<DiscretePoint> = _primeVTopConstPoints;
        var primeCenterAllocation : Array<DiscretePoint> = _primeVResizablePoints;
        var primeMaxAllocation : Array<DiscretePoint> = _primeVBottomConstPoints;
        
        var minAllocation : Array<DiscretePoint> = _VTopConstPoints;
        var centerAllocation : Array<DiscretePoint> = _VResizablePoints;
        var maxAllocation : Array<DiscretePoint> = _VBottomConstPoints;
        
        //calculate minimum allocation
        offset = minBound - primeMinBound;
        scale = 1;
        length = minAllocation.length;
        for (i in 0...length)
        {
            Reflect.field(minAllocation, Std.string(i)).y = Reflect.field(primeMinAllocation, Std.string(i)).y * scale + offset;
        }
        
        //calculate center allocation
        var minAreaWidth : Float = primeMinLimit - primeMinBound;
        var maxAreaWidth : Float = primeMaxBound - primeMaxLimit;
        scale = (primeDimension * dimensionScale - minAreaWidth - maxAreaWidth) / (primeDimension - minAreaWidth - maxAreaWidth);
        offset = minBound - (primeMinBound - primeMinLimit) - primeMinLimit * scale;
        length = centerAllocation.length;
        for (i in 0...length)
        {
            Reflect.field(centerAllocation, Std.string(i)).y = Reflect.field(primeCenterAllocation, Std.string(i)).y * scale + offset;
        }
        
        //calculate minimum allocation
        offset = maxBound - primeMaxBound;
        scale = 1;
        length = maxAllocation.length;
        for (i in 0...length)
        {
            Reflect.field(maxAllocation, Std.string(i)).y = Reflect.field(primeMaxAllocation, Std.string(i)).y * scale + offset;
        }
    }
    
    private function get_nineScalingBounds() : Rectangle
    {
        return _nineScalingBounds;
    }
    
    private function set_nineScalingBounds(value : Rectangle) : Rectangle
    {
        if ((_nineScalingBounds != null && value != null && _nineScalingBounds.equals(value))
            || (_nineScalingBounds == value && _nineScalingBounds == null))
        {
            return value;
        }
        _nineScalingBounds = value;
        allocateNineScalingPoints();
        doComputeScaleX(width);
        doComputeScaleY(height);
        invalidateBounds();
        computeNormals();
        dispatchChange();
        return value;
    }
}

