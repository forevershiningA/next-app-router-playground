package forevershining.headstones.headstone_1;

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
			"M 210.05 88.35" + "\n" + 
			"Q 202.2 76.15 193.25 63.8 175.85 39.35 153.1 20" + "\n" + 
			"L 143.55 11.95" + "\n" + 
			"Q 138.85 8 133.4 5 127.65 1.8 121.05 1.35 114.5 0.9 108.4 3.3 89.2 71.1 84.7 141.35 80.15 211.65 90.45 281.3 96.7 324.55 108.8 366.65 113.1 381.9 118.65 396.45" + "\n" + 
			"L 119.55 398.75 290.05 398.6" + "\n" + 
			"Q 311.7 336.5 315.95 271.05 317.35 249.6 316.3 227.85 315.85 215.85 313.65 204.35" + "\n" + 
			"L 300.05 197.5" + "\n" + 
			"Q 293 194.25 286.95 189.7 267.65 174.3 253.05 154.3 245.75 144.5 239.1 134.3" + "\n" + 
			"L 210.05 88.35 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

