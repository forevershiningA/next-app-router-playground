package pl.pkapusta.engine.graphics.path;

import openfl.geom.Point;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.graphics.path.DiscreteCornerPoint")
class DiscreteCornerPoint extends DiscretePoint
{
    public var secondNormalAngle(get, set) : Null<Float>;
    public var secondTangentAngle(get, set) : Null<Float>;

    
    public static function fromPoint(pt : Point) : DiscreteCornerPoint
    {
        return new DiscreteCornerPoint(pt.x, pt.y);
    }
    
    private var _secondNormalAngle : Float;
    private var _secondTangentAngle : Float;
    
    public function new(x : Float, y : Float, normalAngle : Null<Float> = null, tangentAngle : Null<Float> = null, secondNormalAngle : Null<Float> = null, secondTangentAngle : Null<Float> = null)
    {
        super(x, y, normalAngle, tangentAngle);
        _secondNormalAngle = secondNormalAngle;
        _secondTangentAngle = secondTangentAngle;
    }
    
    private function get_secondNormalAngle() : Null<Float>
    {
        return _secondNormalAngle;
    }
    
    private function set_secondNormalAngle(value : Null<Float>) : Null<Float>
    {
        if (_secondNormalAngle == value)
        {
            return value;
        }
        _secondNormalAngle = value;
        return value;
    }
    
    private function get_secondTangentAngle() : Null<Float>
    {
        return _secondTangentAngle;
    }
    
    private function set_secondTangentAngle(value : Null<Float>) : Null<Float>
    {
        if (_secondTangentAngle == value)
        {
            return value;
        }
        _secondTangentAngle = value;
        return value;
    }
    
    override public function clone() : Point
    {
        return new DiscreteCornerPoint(x, y, normalAngle, tangentAngle, secondNormalAngle, secondTangentAngle);
    }
    
    override public function toString() : String
    {
        return "[DiscreteCornerPoint x=" + x + " y=" + y + " normalAngle=" + normalAngle + " tangentAngle=" + tangentAngle + "]";
    }
}

