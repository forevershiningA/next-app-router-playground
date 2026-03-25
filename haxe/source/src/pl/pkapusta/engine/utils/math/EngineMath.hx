package pl.pkapusta.engine.utils.math;


/**
	 * @author Przemysław Kapusta
	 */
class EngineMath
{
	public static inline var LOG2E : Float = 1.442695040888963387;
	public static inline var SQRT2 : Float = 1.4142135623730951;
    
    public static function convertToPow2Dimension(value : Float) : Int
    {
        return Std.int(Math.pow(2, Math.ceil(Math.log(value) * LOG2E)));
    }
}

