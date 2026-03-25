package pl.pkapusta.engine.graphics.path;

import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.geom.Point;
import openfl.geom.Rectangle;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.graphics.path.DiscretePath")
class DiscretePath extends EventDispatcher
{
    public var length(get, never) : Int;
    public var hasNormals(get, never) : Bool;
    public var hasTangents(get, never) : Bool;
    public var normalsDirection(get, never) : Int;
    public var closed(get, never) : Bool;
    public var bounds(get, never) : Rectangle;
    public var width(get, dynamic) : Float;
    public var height(get, dynamic) : Float;

    
    public static function fromNumberVector(vector : Array<Float>, hasNormals : Bool = false, hasTangents : Bool = false, normalsDirection : Int = 0, closed : Bool = true) : DiscretePath
    {
        var points : Array<DiscretePoint> = new Array<DiscretePoint>();
        var n : Int = Std.int(vector.length / 2);
        for (i in 0...n)
        {
            points.push(new DiscretePoint(vector[i * 2], vector[i * 2 + 1]));
        }
        return new DiscretePath(points, hasNormals, hasTangents, normalsDirection, closed);
    }
    
    private var _hasNormals : Bool;
    private var _hasTangents : Bool;
    private var _normalsDirection : Int;
    private var _closed : Bool;
    
    private var _bounds : Rectangle;
    
    private var _points : Array<DiscretePoint>;
	
	private var _innerPaths : Array<DiscretePath>;
    
    public function new(points : Array<DiscretePoint> = null, hasNormals : Bool = false, hasTangents : Bool = false, normalsDirection : Int = 0, closed : Bool = true)
    {
        super();
        _hasNormals = hasNormals;
        _hasTangents = hasTangents;
        _normalsDirection = normalsDirection;
        _closed = closed;
        
        _points = (points != null)?points:new Array<DiscretePoint>();
		
		_innerPaths = new Array<DiscretePath>();
        
        doInvalidateBounds();
        
        if (!hasNormals)
        {
            computeNormals(_normalsDirection, !hasTangents);
        }
    }
    
    public function clone(clonePoints : Bool = true) : DiscretePath
    {
        return new DiscretePath(((clonePoints)) ? this.clonePoints(_points) : _points, _hasNormals, _hasTangents, _normalsDirection, _closed);
    }
    
    private function clonePoints(points : Array<DiscretePoint>) : Array<DiscretePoint>
    {
        if (points == null)
        {
            return null;
        }
        var cloned : Array<DiscretePoint> = new Array<DiscretePoint>();
        var i : Int = 0;
        while (i < _points.length)
        {
            cloned.push(try cast(_points[i].clone(), DiscretePoint) catch(e:Dynamic) null);
            i++;
        }
        return cloned;
    }
    
    public function setPoints(points : Array<DiscretePoint>) : Void
    {
        _points = (points != null)?points:new Array<DiscretePoint>();
        invalidateBounds();
        computeNormals(_normalsDirection, !hasTangents);
        dispatchChange();
    }
	
	public function addInnerPath(path : DiscretePath) : Void {
		_innerPaths.push(path);
		dispatchChange();
	}
	
	public function getInnerPaths() : Array<DiscretePath> {
		return _innerPaths;
	}
    
    private function dispatchChange() : Void
    {
        if (hasEventListener(Event.CHANGE))
        {
            dispatchEvent(new Event(Event.CHANGE));
        }
    }
	
	public function invalidate() : Void {
		invalidateBounds();
		invalidateNormals();
	}
	
	public function invalidateNormals() : Void {
		computeNormals(_normalsDirection, !hasTangents);
	}
    
    public function invalidateBounds() : Void
    {
        doInvalidateBounds();
    }
    
    private function doInvalidateBounds() : Void
    {
        if (_bounds == null)
        {
            _bounds = new Rectangle();
        }
        if ((_points == null) || (_points.length == 0))
        {
            return;
        }
        
        var left : Float = Math.POSITIVE_INFINITY;
        var top : Float = Math.POSITIVE_INFINITY;
        var right : Float = Math.NEGATIVE_INFINITY;
        var bottom : Float = Math.NEGATIVE_INFINITY;
        
        var i : Int = 1;
        while (i < _points.length)
        {
            var point : DiscretePoint = _points[i];
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
        
        _bounds.left = left;
        _bounds.top = top;
        _bounds.right = right;
        _bounds.bottom = bottom;
    }
    
    public function computeNormals(direction : Int = 0, tangentsBasedOnNormals : Bool = true) : Void
    {
        doComputeNormals(_points, direction, tangentsBasedOnNormals);
    }
    
    private function doComputeNormals(points : Array<DiscretePoint>, direction : Int, tangentsBasedOnNormals : Bool) : Void
    {
        if (points.length == 0)
        {
            return;
        }
        
        /**
			 * TODO: W przyszłości napisać rekurencyjny algorytm wykorzystujący polimorfizm punktów!!!
			 */
        
        //initial
        var length : Int = this.length;
        var i : Int;var j : Int;
        var p : DiscretePoint;
        var currSegment : Array<DiscretePoint>;
        var pt1 : DiscretePoint;
        var pt2 : DiscretePoint;
        var angle : Float;
        var alpha : Float;
        var beta : Float;
        var comparisonAngle : Float;
        
        var dir : Int = ((direction == NormalsDirection.DEFAULT)) ? 
        (((_normalsDirection != NormalsDirection.DEFAULT)) ? _normalsDirection : NormalsDirection.CLOCKWISE) : 
        (direction);
        
        //split to corner-corner segments
        var ccSegments : Array<Array<DiscretePoint>> = new Array<Array<DiscretePoint>>();
        length = points.length;
        currSegment = new Array<DiscretePoint>();
        for (i in 0...length)
        {
            p = points[i];
            currSegment.push(p);
            if (Std.is(p, DiscreteCornerPoint))
            {
                if (i > 0)
                {
                    ccSegments.push(currSegment);
                }
                currSegment = new Array<DiscretePoint>();
                currSegment.push(p);
            }
        }
        if (closed)
        {
            currSegment.push(points[0]);
            if (ccSegments.length == 0)
            {
                ccSegments.push(currSegment);
            }
            else if (!(Std.is(points[0], DiscreteCornerPoint)))
            {
                i = currSegment.length - 2;
                while (i >= 0)
                {
                    ccSegments[0].unshift(currSegment[i]);
                    i--;
                }
            }
            else
            {
                ccSegments.push(currSegment);
            }
        }
        else if (currSegment.length > 1 || !(Std.is(currSegment[0], DiscreteCornerPoint)))
        {
            ccSegments.push(currSegment);
        }
        
        /*trace(ccSegments.length);
			for (i = 0; i < ccSegments.length; i++) {
				trace("s" + i + ": " + ccSegments[i]);
			}*/
        
        //computing normals
        j = 0;
        while (j < ccSegments.length)
        {
            currSegment = ccSegments[j];
            length = currSegment.length;
            
            if (length < 2)
            {
                currSegment[0].normalAngle = 0;
            }
            else if (length == 2)
            {
                pt1 = currSegment[0];
                pt2 = currSegment[1];
                angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) - Math.PI / 2;
                setPointSecondNormalAngle(pt1, angle);
                pt2.normalAngle = angle;
            }
            //segment inner points
            else
            {
                
                i = 1;
                while (i < length - 1)
                {
                    p = currSegment[i];
                    
                    alpha = Math.atan2(p.y - currSegment[i - 1].y, p.x - currSegment[i - 1].x);
                    beta = Math.atan2(currSegment[i + 1].y - p.y, currSegment[i + 1].x - p.x);
                    if (Math.abs(alpha - beta) > Math.PI)
                    {
                        if (alpha < 0)
                        {
                            alpha += Math.PI * 2;
                        }
                        else if (beta < 0)
                        {
                            beta += Math.PI * 2;
                        }
                    }
                    p.normalAngle = (alpha + beta) * 0.5 - Math.PI / 2;
                    i++;
                }
                
                if (currSegment[0] == currSegment[length - 1] && !(Std.is(currSegment[0], DiscreteCornerPoint)))
                {
                    p = currSegment[0];
                    pt1 = currSegment[1];
                    pt2 = currSegment[length - 2];
                    
                    alpha = Math.atan2(p.y - pt2.y, p.x - pt2.x);
                    beta = Math.atan2(pt1.y - p.y, pt1.x - p.x);
                    if (Math.abs(alpha - beta) > Math.PI)
                    {
                        if (alpha < 0)
                        {
                            alpha += Math.PI * 2;
                        }
                        else if (beta < 0)
                        {
                            beta += Math.PI * 2;
                        }
                    }
                    p.normalAngle = (alpha + beta) * 0.5 - Math.PI / 2;
                }
                //first point
                else
                {
                    
                    angle = Math.atan2(currSegment[1].y - currSegment[0].y, currSegment[1].x - currSegment[0].x) - Math.PI / 2;
                    comparisonAngle = currSegment[1].normalAngle;
                    if (Math.abs(angle - comparisonAngle) > Math.PI)
                    {
                        if (angle < 0)
                        {
                            angle += Math.PI * 2;
                        }
                        else if (comparisonAngle < 0)
                        {
                            comparisonAngle += Math.PI * 2;
                        }
                    }
                    setPointSecondNormalAngle(currSegment[0], angle * 2 - comparisonAngle);
                    
                    //last point
                    angle = Math.atan2(currSegment[length - 1].y - currSegment[length - 2].y, currSegment[length - 1].x - currSegment[length - 2].x) - Math.PI / 2;
                    comparisonAngle = currSegment[length - 2].normalAngle;
                    if (Math.abs(angle - comparisonAngle) > Math.PI)
                    {
                        if (angle < 0)
                        {
                            angle += Math.PI * 2;
                        }
                        else if (comparisonAngle < 0)
                        {
                            comparisonAngle += Math.PI * 2;
                        }
                    }
                    currSegment[length - 1].normalAngle = angle * 2 - comparisonAngle;
                }
            }
            j++;
        }
        
        length = points.length;
        
        //tangents
        if (tangentsBasedOnNormals)
        {
            for (i in 0...length)
            {
                p = points[i];
                p.tangentAngle = p.normalAngle + Math.PI / 2;
                if (Std.is(p, DiscreteCornerPoint))
                {
                    cast((p), DiscreteCornerPoint).secondTangentAngle = cast((p), DiscreteCornerPoint).secondNormalAngle + Math.PI / 2;
                }
            }
        }
        
        //anti clockwise
        if (dir == NormalsDirection.ANTICLOCKWISE)
        {
            for (i in 0...length)
            {
                p = points[i];
                p.normalAngle += Math.PI;
                if (Std.is(p, DiscreteCornerPoint))
                {
                    cast((p), DiscreteCornerPoint).secondNormalAngle += Math.PI;
                }
            }
        }
        
        _hasNormals = true;
        if (tangentsBasedOnNormals)
        {
            _hasTangents = true;
        }
    }
    
    private function setPointSecondNormalAngle(point : DiscretePoint, angle : Float) : Void
    {
        if (Std.is(point, DiscreteCornerPoint))
        {
            cast((point), DiscreteCornerPoint).secondNormalAngle = angle;
        }
        else
        {
            point.normalAngle = angle;
        }
    }
    
    private function setPointSecondTangentAngle(point : DiscretePoint, angle : Float) : Void
    {
        if (Std.is(point, DiscreteCornerPoint))
        {
            cast((point), DiscreteCornerPoint).secondTangentAngle = angle;
        }
        else
        {
            point.tangentAngle = angle;
        }
    }
    
    override public function toString() : String
    {
        if (length == 0)
        {
            return "[DiscretePath length=0]";
        }
        var s : String = "[DiscretePath length=" + length + " :\n";
        for (i in 0...length)
        {
            var p : DiscretePoint = _points[i];
            s += "\t" + Std.string(p) + "\n";
        }
        s += "]";
        return s;
    }
    
    public function getPointAt(index : Int) : DiscretePoint
    {
        return _points[index];
    }
    
    public function getVector() : Array<DiscretePoint>
    {
        return _points;
    }
    
    private function get_length() : Int
    {
        return _points.length;
    }
    
    private function get_hasNormals() : Bool
    {
        return _hasNormals;
    }
    
    private function get_hasTangents() : Bool
    {
        return _hasTangents;
    }
    
    private function get_normalsDirection() : Int
    {
        return _normalsDirection;
    }
    
    private function get_closed() : Bool
    {
        return _closed;
    }
    
    private function get_bounds() : Rectangle
    {
        return _bounds;
    }
    
    private function get_width() : Float
    {
        return _bounds.width;
    }
    
    private function get_height() : Float
    {
        return _bounds.height;
    }
}

