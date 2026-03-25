package forevershining.headstones.headstone_41;

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
			"M 332.7 281.45" + "\n" + 
			"Q 335.4 242.55 332.05 203.6 314 164.05 290.75 127.6 272.05 98.35 246.95 74.2 223.15 51.8 194.55 35.75 162.1 17.7 127.4 4.45 120.95 1.65 114.2 0.65 110.6 0.15 107 0.75 103.45 1.4 100.25 3.1 90.1 41 81.25 80.45 71.15 126.1 67.5 172.7 63.55 224.4 71.25 275.75 80.1 333.05 104.75 385.6 106.1 388.95 108.35 391.65 110.65 394.4 113.6 396.35 120.2 399.95 127.7 399.65" + "\n" + 
			"L 292.75 399.1" + "\n" + 
			"Q 296.3 399.4 299.85 399.05 301.8 398.75 303.3 397.5 304.8 396.3 305.45 394.5 309.7 385.65 313 376.95 319.9 358.35 324.2 339.25 330.65 310.7 332.7 281.45 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

