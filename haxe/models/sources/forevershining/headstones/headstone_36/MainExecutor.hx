package forevershining.headstones.headstone_36;

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
			"M 347.55 44.35" + "\n" + 
			"Q 342.1 39.85 335.65 37.05 311.45 25.5 285.8 17.65 260.4 9.95 233.9 4.95 223.2 2.6 211.55 0.65 200.2 -1.25 188.75 0.75 170.6 4 152.75 7.65 106 17.3 62.85 37.8 56.65 40.6 51.45 44.95 46.3 49.4 42.55 55.05 39.05 60.95 37.4 67.65 35.7 74.35 36.05 81.2 36.9 173.35 36.65 265.5" + "\n" + 
			"L 36.25 400.3 363.7 400.3 363.7 389.85" + "\n" + 
			"Q 363.4 235.8 364 81.75 364.3 74.6 362.5 67.65 360.75 60.75 357 54.65 353 48.8 347.55 44.35 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 310, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

