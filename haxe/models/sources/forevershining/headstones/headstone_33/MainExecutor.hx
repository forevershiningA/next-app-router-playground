package forevershining.headstones.headstone_33;

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
			"M 274.35 35.85" + "\n" + 
			"Q 263.85 21.7 248.55 13.1 230.3 3.05 209.6 1 188.9 -1 169.05 5.3 158.85 8.55 149.75 14.1 140.65 19.65 133.15 27.2 124.85 35.8 119.05 46.2 113.15 56.65 110.2 68.2 109.85 69.5 109.2 70.65 108.7 71.6 107.8 72.25 107 72.85 105.9 73.1 104.65 73.3 103.3 73.25" + "\n" + 
			"L 78.65 73.2 78.65 399.55 321.35 399.55 321.35 73.2" + "\n" + 
			"Q 310.1 72.9 298.15 73.3 296.5 73.4 294.75 73.1 293.45 72.85 292.35 72 291.3 71.1 290.7 69.9 289.85 68.4 289.4 66.7 284.65 50 274.35 35.85 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 325, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

