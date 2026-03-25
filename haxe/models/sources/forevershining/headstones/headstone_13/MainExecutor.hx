package forevershining.headstones.headstone_13;

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
			"M 270.2 84.7" + "\n" + 
			"Q 269.35 83.75 268.5 83.1" + "\n" + 
			"L 152 4.75" + "\n" + 
			"Q 148.85 2.75 145.2 2 141.55 1.3 137.9 1.9 136.4 2.3 135.35 3.45 134.55 4.45 134.35 5.65 134.2 6.85 134.35 8.15" + "\n" + 
			"L 134.65 10.65" + "\n" + 
			"Q 137.15 36.4 137.3 61.95 137.75 103 134.25 143.45 129.85 194.35 119.15 244.25 107.15 300.35 85.75 353.55 84.1 357.05 84.7 360.95 85.8 364.85 89.15 367.15 98.65 375.05 108.45 383.7" + "\n" + 
			"L 121.2 395" + "\n" + 
			"Q 122.85 396.55 124.9 397.4 126.95 398.3 129.15 398.4" + "\n" + 
			"L 295.05 398.25" + "\n" + 
			"Q 296.9 397.95 298.2 396.8" + "\n" + 
			"L 315.5 374.1" + "\n" + 
			"Q 308.9 270.2 290.55 167.3 283.3 125.6 270.4 84.9" + "\n" + 
			"L 270.2 84.7 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

