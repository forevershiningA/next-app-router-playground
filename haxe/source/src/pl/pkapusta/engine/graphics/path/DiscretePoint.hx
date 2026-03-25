package pl.pkapusta.engine.graphics.path;

import openfl.geom.Point;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.graphics.path.DiscretePoint")
class DiscretePoint extends Point
{
    public var normalAngle(get, set) : Null<Float>;
    public var tangentAngle(get, set) : Null<Float>;

    
    public static function fromPoint(pt : Point) : DiscretePoint
    {
        return new DiscretePoint(pt.x, pt.y);
    }
    
    private var _normalAngle : Float;
    private var _tangentAngle : Float;
    
    private var _previous : DiscretePoint;
    private var _next : DiscretePoint;
    
    public function new(x : Float, y : Float, normalAngle : Null<Float> = null, tangentAngle : Null<Float> = null)
    {
        super(x, y);
        _normalAngle = normalAngle;
        _tangentAngle = tangentAngle;
    }
    
    private function get_normalAngle() : Null<Float>
    {
        return _normalAngle;
    }
    
    private function set_normalAngle(value : Null<Float>) : Null<Float>
    {
        if (_normalAngle == value)
        {
            return value;
        }
        _normalAngle = value;
        return value;
    }
    
    private function get_tangentAngle() : Null<Float>
    {
        return _tangentAngle;
    }
    
    private function set_tangentAngle(value : Null<Float>) : Null<Float>
    {
        if (_tangentAngle == value)
        {
            return value;
        }
        _tangentAngle = value;
        return value;
    }
    
    override public function clone() : Point
    {
        return new DiscretePoint(x, y, normalAngle, tangentAngle);
    }
    
    override public function toString() : String
    {
        return "[DiscretePoint x=" + x + " y=" + y + " normalAngle=" + normalAngle + " tangentAngle=" + tangentAngle + "]";
    }
}

