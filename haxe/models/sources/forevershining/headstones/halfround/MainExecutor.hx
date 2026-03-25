package forevershining.headstones.halfround;

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
                new DiscretePoint(-200, 200)
        );
        points.push(
                new DiscreteCornerPoint(-200, 0)
        );
        points.push(
                new DiscreteCornerPoint(200, 0)
        );
        points.push(
                new DiscretePoint(200, 200)
        );
        
        var bezierControlPoints : Array<Point> = new Array<Point>();
        bezierControlPoints.push(
                new Point(200, 200)
        );
        bezierControlPoints.push(
                new Point(200, 310)
        );
        bezierControlPoints.push(
                new Point(110, 400)
        );
        bezierControlPoints.push(
                new Point(0, 400)
        );
        
        Bezier.toDiscretePoints(bezierControlPoints, points, 25);
        points.push(new DiscretePoint(0, 400));
        bezierControlPoints = new Array<Point>();
        bezierControlPoints.push(
                new Point(0, 400)
        );
        bezierControlPoints.push(
                new Point(-110, 400)
        );
        bezierControlPoints.push(
                new Point(-200, 310)
        );
        bezierControlPoints.push(
                new Point(-200, 200)
        );
        
        Bezier.toDiscretePoints(bezierControlPoints, points, 25);
        
        return new ScalingDiscretePath(points, false, false, NormalsDirection.CLOCKWISE);
    }

    public function new()
    {
        super();
    }
}

