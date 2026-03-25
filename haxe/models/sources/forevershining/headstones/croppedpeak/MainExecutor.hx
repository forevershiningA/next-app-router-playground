package forevershining.headstones.croppedpeak;

import pl.pkapusta.engine.graphics.algorithms.Bezier;
import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.graphics.path.HeadScalingDiscretePath;
import pl.pkapusta.engine.graphics.path.NormalsDirection;
import pl.pkapusta.engine.graphics.path.ScalingDiscretePath;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorRenderer;
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
                new DiscreteCornerPoint(-200, 349)
        );
        points.push(
                new DiscreteCornerPoint(-200, 0)
        );
        points.push(
                new DiscreteCornerPoint(200, 0)
        );
        points.push(
                new DiscreteCornerPoint(200, 349)
        );
        
        var bezierControlPoints : Array<Point> = new Array<Point>();
        bezierControlPoints.push(
                new Point(200, 349)
        );
        bezierControlPoints.push(
                new Point(130, 360)
        );
        bezierControlPoints.push(
                new Point(105, 368)
        );
        bezierControlPoints.push(
                new Point(35, 400)
        );
        
        Bezier.toDiscretePoints(bezierControlPoints, points, 25);
        points.push(new DiscreteCornerPoint(35, 400));
        points.push(new DiscreteCornerPoint(-35, 400));
        bezierControlPoints = new Array<Point>();
        bezierControlPoints.push(
                new Point(-35, 400)
        );
        bezierControlPoints.push(
                new Point(-105, 368)
        );
        bezierControlPoints.push(
                new Point(-130, 360)
        );
        bezierControlPoints.push(
                new Point(-200, 349)
        );
        
        Bezier.toDiscretePoints(bezierControlPoints, points, 25);
        
        return new HeadScalingDiscretePath(points, 349, false, false, NormalsDirection.CLOCKWISE);
    }

    public function new()
    {
        super();
    }
}

