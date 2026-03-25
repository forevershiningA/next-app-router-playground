package pl.pkapusta.engine.graphics.path;

import openfl.geom.Rectangle;

/**
	 * ...
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.graphics.path.ScalingDiscretePath")
class ScalingDiscretePath extends DiscretePath
{
    private var _scaledPoints : Array<DiscretePoint>;
    private var _scaledBounds : Rectangle;
	private var _scaleX : Float;
	private var _scaleY : Float;
	
	public var scaleX(get, set) : Float;
    public var scaleY(get, set) : Float;
    
    public function new(points : Array<DiscretePoint> = null, hasNormals : Bool = false, hasTangents : Bool = false, normalsDirection : Int = 0, closed : Bool = true)
    {
        copyToScaledPoints((points!=null)?points:new Array<DiscretePoint>());
        super(points, hasNormals, hasTangents, normalsDirection, closed);
        _scaledBounds = _bounds.clone();
    }
    
    private function copyToScaledPoints(points : Array<DiscretePoint>) : Void
    {
        if (_scaledPoints == null || points.length != _scaledPoints.length)
        {
            _scaledPoints = new Array<DiscretePoint>();
        }
        var i : Int = 0;
        while (i < points.length)
        {
            _scaledPoints[i] = try cast(points[i].clone(), DiscretePoint) catch(e:Dynamic) null;
            i++;
        }
    }
    
    override public function clone(clonePoints : Bool = true) : DiscretePath
    {
        var r : ScalingDiscretePath = new ScalingDiscretePath(((clonePoints)) ? this.clonePoints(_points) : _points, hasNormals, hasTangents, normalsDirection, closed);
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
    
    private function doComputeScaleX(value : Float) : Void {
        _scaleX = value / _bounds.width;
        doComputePointsX(_scaleX);
    }
	
	private function doComputePointsX(scaleX : Float) : Void {
        var i : Int = 0;
        while (i < _points.length) {
            _scaledPoints[i].x = _points[i].x * scaleX;
            i++;
        }
    }
    
    private function doComputeScaleY(value : Float) : Void {
        _scaleY = value / _bounds.height;
        doComputePointsY(_scaleY);
    }
	
	private function doComputePointsY(scaleY : Float) : Void {
        var i : Int = 0;
        while (i < _points.length) {
            _scaledPoints[i].y = _points[i].y * scaleY;
            i++;
        }
    }
    
    override public function setPoints(points : Array<DiscretePoint>) : Void
    {
        copyToScaledPoints((points!=null)?points:new Array<DiscretePoint>());
        super.setPoints(points);
        _scaledBounds = _bounds.clone();
    }
    
    override public function invalidateBounds() : Void
    {
        if (_scaledBounds == null)
        {
            _scaledBounds = new Rectangle();
        }
        if ((_scaledPoints == null) || (_scaledPoints.length == 0))
        {
            return;
        }
        
        var left : Float = Math.POSITIVE_INFINITY;
        var top : Float = Math.POSITIVE_INFINITY;
        var right : Float = Math.NEGATIVE_INFINITY;
        var bottom : Float = Math.NEGATIVE_INFINITY;
        
        var i : Int = 1;
        while (i < _scaledPoints.length)
        {
            var point : DiscretePoint = _scaledPoints[i];
            if (point.x < left)
            {
                left = point.x;
            }
            if (point.y < top)
            {
                top = point.y;
            }
            if (point.x > right)
            {
                right = point.x;
            }
            if (point.y > bottom)
            {
                bottom = point.y;
            }
            i++;
        }
        
        _scaledBounds.left = left;
        _scaledBounds.top = top;
        _scaledBounds.right = right;
        _scaledBounds.bottom = bottom;
    }
    
    override public function computeNormals(direction : Int = 0, tangentsBasedOnNormals : Bool = true) : Void
    {
        doComputeNormals(_scaledPoints, direction, tangentsBasedOnNormals);
    }
    
    override public function getPointAt(index : Int) : DiscretePoint
    {
        return _scaledPoints[index];
    }
    
    override public function getVector() : Array<DiscretePoint>
    {
        return _scaledPoints;
    }
    
    override private function get_length() : Int
    {
        return _scaledPoints.length;
    }
    
    override private function get_bounds() : Rectangle
    {
        return _scaledBounds;
    }
    
    override private function get_width() : Float
    {
        return _scaledBounds.width;
    }
    
    override private function get_height() : Float
    {
        return _scaledBounds.height;
    }
    
    private function set_width(value : Float) : Float {
        if (bounds.width == value) return value;
        doComputeScaleX(value);
		for (innerPath in _innerPaths) if (Std.is(innerPath, ScalingDiscretePath)) cast((innerPath), ScalingDiscretePath).scaleX = _scaleX;
        invalidateBounds();
        computeNormals();
        dispatchChange();
        return value;
    }
    
    private function set_height(value : Float) : Float {
        if (bounds.height == value) return value;
        doComputeScaleY(value);
		for (innerPath in _innerPaths) if (Std.is(innerPath, ScalingDiscretePath)) cast((innerPath), ScalingDiscretePath).scaleY = _scaleY;
        invalidateBounds();
        computeNormals();
        dispatchChange();
        return value;
    }
	
	private function set_scaleX(value : Float) : Float {
        if (_scaleX == value) return _scaleX;
        doComputePointsX(value);
		for (innerPath in _innerPaths) if (Std.is(innerPath, ScalingDiscretePath)) cast((innerPath), ScalingDiscretePath).scaleX = value;
        invalidateBounds();
        computeNormals();
        dispatchChange();
        return value;
    }
	
	private function set_scaleY(value : Float) : Float {
        if (_scaleY == value) return _scaleY;
        doComputePointsY(value);
		for (innerPath in _innerPaths) if (Std.is(innerPath, ScalingDiscretePath)) cast((innerPath), ScalingDiscretePath).scaleY = value;
        invalidateBounds();
        computeNormals();
        dispatchChange();
        return value;
    }
	
	private function get_scaleX() : Float {
        return _scaleX;
    }
    
    private function get_scaleY() : Float {
        return _scaleY;
    }
	
}

