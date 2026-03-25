package forevershining.headstones.headstone_19;

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
			"M 283.1 48.65" + "\n" + 
			"Q 280.8 42.85 275.95 38.8 273.4 36.9 270.45 35.85 267.45 34.75 264.3 34.65 249.7 33 235.9 27.8 225.9 24.6 216.9 18.9 212.4 15.9 208.85 11.85 205.3 7.8 202.95 2.95 202.35 1.55 201.15 0.7 200.3 0.1 199.35 0.45 198.35 0.9 197.7 1.75 196.85 2.8 196.4 4.05 193.35 10.8 187.65 15.35 182 19.85 175.6 22.95 165.95 28.15 155.45 31.15 144.9 34.2 133.95 34.95 130.95 35 128.1 36.15 125.3 37.3 123.1 39.35 119.1 43.6 116.6 48.7" + "\n" + 
			"L 119.3 51.55" + "\n" + 
			"Q 122.9 55.15 125.1 59.7 126.95 63.6 126.9 67.95 126.75 72.25 124.65 75.95 122.1 80.35 118.15 83.45 109.4 90.6 98.65 94.05 91.7 96.15 84.5 97.45" + "\n" + 
			"L 69.8 100.05 69.8 399.75 330.3 399.75 330.3 99.1 318.3 98.05" + "\n" + 
			"Q 308.5 96.95 299.15 93.75 289.75 90.45 282.15 84.05 278.2 80.85 275.6 76.4 273.35 72.55 273.15 68.25 272.95 63.85 274.75 59.85 276.95 55.2 280.5 51.6" + "\n" + 
			"L 283.1 48.65 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 270, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

