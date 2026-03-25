package forevershining.headstones.headstone_31;

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
			"M 343.8 136.5" + "\n" + 
			"Q 343.65 134.65 342.55 133.05 341.45 131.35 339.9 130.15" + "\n" + 
			"L 327.3 121.7" + "\n" + 
			"Q 320.75 117.5 315.1 112.8 302.9 102.9 295.05 89.15 291.25 82.15 289.7 74.35 288.1 66.55 288.8 58.65 288.95 57.05 288.65 55.55 288.4 54.4 287.6 53.5 286.75 52.65 285.6 52.45 284.25 52.2 282.8 52.5 280 53.3 277.1 52.8 274.25 52.3 271.85 50.65 267.4 46.8 264.95 41.45 260.4 32.55 253.85 25.05 247.3 17.5 239.15 11.75 230.85 6.25 221.35 3.35 211.85 0.45 201.9 0.4 191.05 0 180.65 2.9 170.2 5.85 161.2 11.85 152.35 18.15 145.3 26.45 138.3 34.75 133.55 44.5 131.9 48.35 128.7 51.1 127 52.25 125 52.6 122.95 53 121 52.45 119.3 52.4 118.15 52.4 116.55 52.2 114.95 52.55 113.75 52.8 112.9 53.65 112.1 54.65 111.75 55.9 111.35 57.65 111.3 59.3 111.25 71.95 107.1 83.95 104.05 91.55 99.4 98.2 94.7 104.9 88.65 110.35 76.45 121.2 62.05 128.8 59.25 130.15 57.45 132.75 55.9 135.45 56.05 138.55" + "\n" + 
			"L 56.6 312.1 56.2 395.35" + "\n" + 
			"Q 56.35 397.6 56.8 399.65" + "\n" + 
			"L 343.6 399.65 343.95 395.6 343.8 136.5 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 260, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

