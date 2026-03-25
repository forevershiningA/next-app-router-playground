package forevershining.headstones.headstone_8;

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
			"M 232.25 51.3" + "\n" + 
			"Q 198.5 29.8 162.45 13.55 147.05 6.7 130.65 2.5 117.9 -1 104.75 0.45 104.15 0.65 103.7 1 103.1 1.45 102.6 1.95 101.65 3 101.05 4.2 93.1 25.1 90.15 47.5 86.1 75.85 85.05 104.6 82.85 170.8 86.85 236.35 91.45 318.5 101.05 400" + "\n" + 
			"L 315.8 400 315.8 108.95" + "\n" + 
			"Q 275.2 78.15 232.25 51.3 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

