package forevershining.headstones.square_intest;

import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
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
        points.push(new DiscreteCornerPoint(200, 400));
        points.push(new DiscreteCornerPoint(200, 0));
        points.push(new DiscreteCornerPoint(-200, 0));
        points.push(new DiscreteCornerPoint(-200, 400));
		
		var innerPoints : Array<DiscretePoint> = new Array<DiscretePoint>();
        innerPoints.push(new DiscreteCornerPoint(100, 300));
        innerPoints.push(new DiscreteCornerPoint(100, 100));
        innerPoints.push(new DiscreteCornerPoint(-100, 100));
        innerPoints.push(new DiscreteCornerPoint(-100, 300));
        
        
        var path: ScalingDiscretePath = new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE);
		path.addInnerPath(new ScalingDiscretePath(innerPoints, false, false, NormalsDirection.CLOCKWISE));
		
		modelOptions.set("cornerRound", 20);
		modelOptions.set("innerCornerRound", 20);
		
		return path;
    }

    public function new()
    {
        super();
    }
}

