package forevershining.headstones.headstone_35;

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
			"M 337.2 158.5" + "\n" + 
			"Q 337.2 143.6 331 130 324.75 116.45 313.45 106.7 281.4 77.4 251.35 49" + "\n" + 
			"L 200.2 1.4 197.55 3.6" + "\n" + 
			"Q 145 53.25 90.15 103.2 83.35 109.15 78 116.45 72.7 123.75 69.1 132.05 62.2 148.8 62.6 166.95" + "\n" + 
			"L 62.7 398.65 336.8 398.65 337.2 397" + "\n" + 
			"Q 337.4 396.4 337.4 395.85 337.6 275.1 337.2 158.5 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 230, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

