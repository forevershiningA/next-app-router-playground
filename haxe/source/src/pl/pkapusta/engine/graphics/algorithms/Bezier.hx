package pl.pkapusta.engine.graphics.algorithms;

import pl.pkapusta.engine.graphics.path.DiscretePoint;
import openfl.geom.Point;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.graphics.algorithms.Bezier")
class Bezier
{
    
    public static function toDiscretePoints(controlPoints : Array<Point>, addToVector : Array<DiscretePoint>, divisionCount : Int = 20) : Void
    {
        var i : Int;
		var j : Int;
		var k : Int;
        var offsetFrom : Int;
        var offsetTo : Int;
        var t : Float;
        
        var n : Int = controlPoints.length;
        var Sn : Int = Std.int((1 + n) * 0.5 * n);
        
        var computationVector : Array<Float> = new Array<Float>();
        for (i in 0...n)
        {
            computationVector[i * 2] = controlPoints[i].x;
            computationVector[i * 2 + 1] = controlPoints[i].y;
        }
        var rxInx:Int = Sn * 2 - 2;
        var ryInx:Int = Sn * 2 - 1;
        
        n--;
        
        for (j in 1...divisionCount)
        {
            t = j / divisionCount;
            
            offsetFrom = 0;
            offsetTo = (n + 1) * 2;
            
            i = n;
            while (i >= 1)
            {
                for (k in 0...i)
                {
                    computationVector[offsetTo + (k * 2)] = computationVector[offsetFrom + (k * 2)] + (computationVector[offsetFrom + (k + 1) * 2] - computationVector[offsetFrom + k * 2]) * t;
                    computationVector[offsetTo + (k * 2) + 1] = computationVector[offsetFrom + (k * 2) + 1] + (computationVector[offsetFrom + (k + 1) * 2 + 1] - computationVector[offsetFrom + k * 2 + 1]) * t;
                }
                
                offsetFrom = offsetTo;
                offsetTo += i * 2;
                i--;
            }
            
            addToVector.push(new DiscretePoint(computationVector[rxInx], computationVector[ryInx]));
        }
    }

    public function new()
    {
    }
}

