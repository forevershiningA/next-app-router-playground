package forevershining.headstones.headstone_32;

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
			"M 352.75 124.8" + "\n" + 
			"Q 349 114.9 341.05 108 333 101.2 322.7 98.8 310.5 95.95 297.9 96.9" + "\n" + 
			"L 297.9 78.35 284.7 78.2" + "\n" + 
			"Q 282.85 78.1 281.35 77.05 280 75.75 279.65 73.95" + "\n" + 
			"L 278.4 67.95" + "\n" + 
			"Q 274.25 43.55 257.1 25.7 239.95 7.85 215.8 2.75 204.4 0.35 192.85 1.5 181.25 2.65 170.6 7.2 159.55 11.8 150.25 19.35 140.95 26.9 134.1 36.75 127.85 45.95 124.65 56.45 121.4 67.2 119.95 78.35" + "\n" + 
			"L 101.7 78.35 101.7 96.95" + "\n" + 
			"Q 90.05 96.25 78.6 98.45 73 99.6 67.85 102.15 62.8 104.65 58.45 108.4 54.2 112.2 51.1 116.9 48 121.7 46.25 127.1 42.9 137.95 42.4 149.3" + "\n" + 
			"L 27.3 150 27.3 398.9 372.7 398.9 372.7 149.65 357.5 149.65" + "\n" + 
			"Q 357.25 136.85 352.75 124.8 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 250, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

