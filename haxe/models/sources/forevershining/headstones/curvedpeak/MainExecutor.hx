package forevershining.headstones.curvedpeak;

import pl.pkapusta.engine.graphics.algorithms.Bezier;
import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.graphics.path.HeadScalingDiscretePath;
import pl.pkapusta.engine.graphics.path.NormalsDirection;
import pl.pkapusta.engine.graphics.path.ScalingDiscretePath;
import openfl.geom.Point;
import forevershining.headstones.AbstractHeadstoneModel3D;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Executor")
class MainExecutor extends AbstractHeadstoneModel3D
{
    
    override private function buildModelPath() : ScalingDiscretePath
    //build model
    {
        
        var points : Array<DiscretePoint> = new Array<DiscretePoint>();
        points.push(
                new DiscreteCornerPoint(-200, 333)
        );
        points.push(
                new DiscreteCornerPoint(-200, 0)
        );
        points.push(
                new DiscreteCornerPoint(200, 0)
        );
        points.push(
                new DiscreteCornerPoint(200, 333)
        );
        
        var bezierControlPoints : Array<Point> = new Array<Point>();
        bezierControlPoints.push(
                new Point(200, 333)
        );
        bezierControlPoints.push(
                new Point(116, 346)
        );
        bezierControlPoints.push(
                new Point(57, 371)
        );
        bezierControlPoints.push(
                new Point(0, 400)
        );
        
        Bezier.toDiscretePoints(bezierControlPoints, points, 25);
        points.push(new DiscreteCornerPoint(0, 400));
        bezierControlPoints = new Array<Point>();
        bezierControlPoints.push(
                new Point(0, 400)
        );
        bezierControlPoints.push(
                new Point(-57, 371)
        );
        bezierControlPoints.push(
                new Point(-116, 346)
        );
        bezierControlPoints.push(
                new Point(-200, 333)
        );
        
        Bezier.toDiscretePoints(bezierControlPoints, points, 25);
        
        return new HeadScalingDiscretePath(points, 333, false, false, NormalsDirection.CLOCKWISE);
    }

    public function new()
    {
        super();
    }
}

