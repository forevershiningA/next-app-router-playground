package forevershining.headstones.headstone_25;

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
			"M 228.4 64.35" + "\n" + 
			"L 228.4 0.45 171.45 0.45 171.45 64.35 106.4 64.35 106.4 125.35 171.15 125.35" + "\n" + 
			"Q 171.4 135.35 168.45 144.9 165.5 154.45 159.7 162.55 155.2 169.05 149.25 174.3 143.35 179.55 136.35 183.25 121.9 190.45 105.8 191" + "\n" + 
			"L 105.8 363.7 83.65 363.7 83.65 399.6 316.35 399.6 316.35 363.55 293.9 363.55 293.9 191.05" + "\n" + 
			"Q 279.65 189.45 266.45 183.35 254.5 177.85 245.35 168.6 236.6 160.15 232.3 148.7 228.05 137.3 229.1 125.15" + "\n" + 
			"L 293.75 125.15 293.75 64.35 228.4 64.35 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 205, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

