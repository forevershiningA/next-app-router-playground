package forevershining.headstones.headstone_22;

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
			"M 216.7 6.7" + "\n" + 
			"Q 212.95 3.9 208.45 2.35 203.95 0.85 199.2 0.8 194.55 1 190.15 2.55 185.8 4.1 182.05 6.85 174.6 11.8 167.45 17.45 142.5 37.45 122.15 62.15 101.75 87.05 89.2 116.6 87.75 119.85 86.65 123.15 85.9 125.2 86.35 127.3 87.1 129.35 88.75 130.75" + "\n" + 
			"L 94.25 135.1" + "\n" + 
			"Q 100.9 139.8 104.75 146.9 108.65 154 108.95 162.1 108.85 170.25 105.15 177.45 101.5 184.7 94.95 189.55" + "\n" + 
			"L 89.15 194.1" + "\n" + 
			"Q 101.55 217.9 108.9 243.75 115.95 268.85 119.5 294.85 123 320.95 124.7 346.85" + "\n" + 
			"L 128.15 399.2 271.6 399.2 274.95 349.95" + "\n" + 
			"Q 276.15 330.15 278.5 309.55 281.5 279.75 288.25 250.3 295.15 220.65 311 194.6" + "\n" + 
			"L 302.3 187.7" + "\n" + 
			"Q 295.45 182.2 292.55 174 289.9 165.7 291.2 157.25 291.75 153.15 293.35 149.35 294.95 145.5 297.5 142.3 302.7 136 309.85 131.95 311.25 131.15 312.3 130.1 313.15 129.3 313.6 128.1 313.95 127 313.8 125.8 313.5 124.3 312.85 123.05" + "\n" + 
			"L 310.85 117.9" + "\n" + 
			"Q 296.1 83.8 271.85 55.5 247.5 27.4 216.7 6.7 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 205, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

