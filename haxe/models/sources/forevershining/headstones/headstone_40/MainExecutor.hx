package forevershining.headstones.headstone_40;

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
			"M 305.8 53.25" + "\n" + 
			"Q 300.5 26.8 289.55 2.25 276.8 0.6 264.05 1.65 251.25 2.7 239 6.45 216.8 13.55 197.5 26.3 178.75 38.75 160.2 52.2 142.25 65.2 122.05 74.35 115.15 77.5 107.6 78.85 102.55 79.45 97.1 80.6 90.7 103.75 87.65 127.55 84.35 152.9 83.45 178.5 81.75 229.55 85.95 280.35 90 334.45 99.55 387.4 100.5 393.25 101.95 398.8" + "\n" + 
			"L 300.05 398.8" + "\n" + 
			"Q 311.5 322.15 315.45 244.85 319.2 179.3 314.4 114.1 312 83.3 305.8 53.25 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

