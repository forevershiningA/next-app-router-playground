package forevershining.headstones.headstone_23;

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
			"M 171.75 0.25" + "\n" + 
			"L 171.75 64.45 107.05 64.45 107.05 125.1 172 125.1" + "\n" + 
			"Q 172.15 127 172 128.9" + "\n" + 
			"L 168.7 157.5" + "\n" + 
			"Q 164.15 191.25 149.55 222.05 142.2 237.35 132.25 251.1 122.25 264.85 110.05 276.6 108.6 278.1 107.8 280 107 281.9 106.85 283.95" + "\n" + 
			"L 106.9 363.35 88.3 363.3" + "\n" + 
			"Q 87.35 363.25 86.25 363.5 85.5 363.65 84.85 364.2 84.3 364.75 84.1 365.55 83.85 366.65 83.95 367.7 84.55 380.2 84.15 392.7 84 394.35 84.3 396.1 84.5 397.3 85.4 398.3 86.3 399.2 87.55 399.45 89.25 399.85 91.05 399.8" + "\n" + 
			"L 308.75 399.8" + "\n" + 
			"Q 310.6 399.85 312.25 399.45 313.5 399.2 314.45 398.3 315.25 397.3 315.5 396.1 315.8 394.35 315.65 392.7 315.3 380.2 315.85 367.7 315.95 366.6 315.7 365.55 315.5 364.75 314.9 364.2 314.3 363.65 313.55 363.5 312.45 363.25 311.45 363.3" + "\n" + 
			"L 292.9 363.35 292.95 283.95" + "\n" + 
			"Q 292.85 281.9 292 280 291.2 278.1 289.8 276.6 277.5 264.85 267.55 251.1 257.6 237.35 250.25 222.05 235.7 191.25 231.1 157.5" + "\n" + 
			"L 227.8 128.9" + "\n" + 
			"Q 227.7 128.1 227.75 127.2" + "\n" + 
			"L 227.75 125.1 292.75 125.1 292.75 64.45 228 64.45 228 0.25 171.75 0.25 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 270, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

