package pl.pkapusta.engine.graphics.algorithms;

import pl.pkapusta.engine.graphics.path.DiscretePath;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.graphics.path.NormalsDirection;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.graphics.algorithms.DiscretePathOffset")
class DiscretePathOffset
{
    
    public static function basicOffset(path : DiscretePath, offset : Float) : Array<Float>
    {
        var length : Int = path.length;
        var res : Array<Float> = new Array<Float>();
        
        for (i in 0...length)
        {
            var p : DiscretePoint = path.getPointAt(i);
            var pPrev : DiscretePoint = path.getPointAt(((i == 0)) ? (length - 1) : (i - 1));
            var pNext : DiscretePoint = path.getPointAt(((i == length - 1)) ? 0 : (i + 1));
            
            var alpha : Float = Math.atan2(p.y - pPrev.y, p.x - pPrev.x);
            var beta : Float = Math.atan2(pNext.y - p.y, pNext.x - p.x);
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
            
            var normalAngle : Float = (alpha + beta) * 0.5 - Math.PI / 2;
            if (path.normalsDirection == NormalsDirection.ANTICLOCKWISE)
            {
                normalAngle += Math.PI;
            }
            
            res[i * 2] = p.x + Math.cos(normalAngle) * offset;
            res[i * 2 + 1] = p.y + Math.sin(normalAngle) * offset;
        }
        
        return res;
    }

    public function new()
    {
    }
}

