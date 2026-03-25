package forevershining.headstones.leftwave;

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
                new DiscreteCornerPoint(200, 390)
        );
        points.push(
                new DiscreteCornerPoint(200, 0)
        );
        points.push(
                new DiscreteCornerPoint(-200, 0)
        );
        points.push(
                new DiscreteCornerPoint(-200, 343)
        );
        
        var bezierControlPoints : Array<Point> = new Array<Point>();
        bezierControlPoints.push(
                new Point(-200, 343)
        );
        bezierControlPoints.push(
                new Point(-28, 304)
        );
        bezierControlPoints.push(
                new Point(-10, 400)
        );
        bezierControlPoints.push(
                new Point(130, 400)
        );
        
        Bezier.toDiscretePoints(bezierControlPoints, points, 35);
        points.push(new DiscretePoint(130, 400));
        bezierControlPoints = new Array<Point>();
        bezierControlPoints.push(
                new Point(130, 400)
        );
        bezierControlPoints.push(
                new Point(170, 400)
        );
        bezierControlPoints.push(
                new Point(200, 390)
        );
        bezierControlPoints.push(
                new Point(200, 390)
        );
        
        Bezier.toDiscretePoints(bezierControlPoints, points, 10);
        
        return new HeadScalingDiscretePath(points, 330, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new()
    {
        super();
    }
}

