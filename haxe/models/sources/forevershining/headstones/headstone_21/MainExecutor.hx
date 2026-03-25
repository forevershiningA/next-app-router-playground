package forevershining.headstones.headstone_21;

import pl.pkapusta.engine.graphics.algorithms.Bezier;
import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.graphics.path.HeadScalingDiscretePath;
import pl.pkapusta.engine.graphics.path.NormalsDirection;
import pl.pkapusta.engine.graphics.path.ScalingDiscretePath;
import openfl.geom.Point;
import forevershining.headstones.AbstractHeadstoneModel3D;
import forevershining.headstones.SVGPathReader;
import forevershining.headstones.Utils;

/**
 * @author Przemysław Kapusta
 */
@:expose("Executor")
class MainExecutor extends AbstractHeadstoneModel3D {
    
    override private function buildModelPath() : ScalingDiscretePath {
		
		var reader = new SVGPathReader(
			"M 358.1 91.25" + "\n" + 
			"Q 358.25 85.35 357.3 79.45 356.7 75.15 354.25 71.7 351.6 68.25 347.7 66.35 342.35 63.65 336.65 61.95" + "\n" + 
			"L 330.85 60.2" + "\n" + 
			"Q 316.55 56.4 303.75 48.85 291 41.3 280.75 30.55 268.6 17.6 252.65 9.9 236.45 2.3 218.6 1.8" + "\n" + 
			"L 194.35 1.3" + "\n" + 
			"Q 171.9 -0.05 151.1 8.6 130.3 17.2 115.4 34.1 107.8 42.1 98.45 47.9 89.05 53.75 78.55 57.1" + "\n" + 
			"L 59.2 63.4" + "\n" + 
			"Q 54.75 64.9 50.75 67.3 47.55 69.2 45.45 72.15 43.4 75.2 42.7 78.85 41.8 83.45 41.9 88.1" + "\n" + 
			"L 41.9 398.95 358.1 398.95 358.1 91.25 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 270, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

