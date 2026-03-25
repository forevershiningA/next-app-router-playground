package forevershining.headstones.headstone_17;

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
			"M 201.5 -0.2" + "\n" + 
			"L 198.55 -0.2" + "\n" + 
			"Q 177.65 0 157.8 6.45 137.95 12.9 120.95 25.05 108.35 33.75 97.9 44.95 87.45 56.2 79.6 69.4 72 82.7 67.2 97.3 62.4 111.9 60.65 127.15 59.4 127 58.2 126.55 50.5 121.85 41.5 121.85 32.5 121.9 24.8 126.65 16.75 131.85 12.3 140.35 7.85 148.85 8.3 158.45 9.15 274.5 8.65 390.55" + "\n" + 
			"L 9.15 400.25 390.85 400.25 391.4 390.55" + "\n" + 
			"Q 390.9 274.5 391.75 158.45 392.2 148.85 387.75 140.35 383.3 131.85 375.2 126.65 367.55 121.9 358.55 121.85 349.5 121.85 341.85 126.55 341.4 126.8 340.85 126.85" + "\n" + 
			"L 339.4 127.15" + "\n" + 
			"Q 337.6 111.9 332.85 97.3 328.05 82.7 320.4 69.4 312.6 56.2 302.15 44.95 291.7 33.75 279.1 25.05 262.1 12.9 242.25 6.45 222.35 0 201.5 -0.2 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 233, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

