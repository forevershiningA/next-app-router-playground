package forevershining.headstones.headstone_29;

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
			"M 299.05 5.6" + "\n" + 
			"Q 297.15 2.15 293.45 0.55 289.6 -0.7 285.65 0.25 279.85 1.6 274.65 4" + "\n" + 
			"L 274.6 4.05" + "\n" + 
			"Q 227.35 24 186.15 54.65 152.7 79.65 127.75 112.7 107.6 139.55 95.5 170.85 83.35 202.15 80.2 235.55 77.7 262.3 80.05 289.1 82.45 315.8 89.65 341.7 94.75 360.65 102.55 378.85 107.15 390 113.85 400.15" + "\n" + 
			"L 285.25 400.2" + "\n" + 
			"Q 288.6 400.25 291.8 399.15 294.95 398 297.55 395.85 301.4 392.5 302.85 387.6 307 366.55 309.6 345 315.8 298 318.8 250.6 322.75 191.05 320.1 131.8 318.65 101.65 314.55 71.75 310.7 43.6 303.15 15.95 301.8 10.5 299.05 5.6 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

