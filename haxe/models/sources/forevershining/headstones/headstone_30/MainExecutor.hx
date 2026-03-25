package forevershining.headstones.headstone_30;

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
			"M 280.6 46.3" + "\n" + 
			"Q 272.85 32.45 260.9 21.95 249.05 11.7 234.3 6.5 218.1 0.95 201.05 0.95 183.65 0.65 167.1 6.05 151.95 11.1 139.95 21.3 127.75 31.8 119.75 45.9 110.95 61.5 106.7 78.85" + "\n" + 
			"L 83.3 78.85 83.4 100.4" + "\n" + 
			"Q 83.45 101.45 83.95 102.5 84.05 102.9 84.45 103.4" + "\n" + 
			"L 84.7 103.65" + "\n" + 
			"Q 84.75 103.75 84.95 103.75 86.5 103.8 87.8 104.75 88.7 105.45 88.9 106.6 89.1 108.9 88.85 111.25" + "\n" + 
			"L 88.8 304.7" + "\n" + 
			"Q 88.75 306.8 88.2 308.8 87.95 309.85 87.6 310.55 87.5 310.8 87.3 311.05" + "\n" + 
			"L 87.15 311.2" + "\n" + 
			"Q 87.05 311.3 86.95 311.3 85.45 311.35 84.25 312.2 83.4 312.85 83.2 313.9 83 316 83.25 318.1" + "\n" + 
			"L 83.3 392.25 83.75 399.05 316.85 399.05 316.75 315.45" + "\n" + 
			"Q 316.7 314.35 316.25 313.35 316.15 313 315.75 312.45" + "\n" + 
			"L 315.5 312.2" + "\n" + 
			"Q 315.45 312.1 315.25 312.05 313.6 312 312.2 311 311.3 310.15 311.1 308.95 311 306.55 311.3 303.95" + "\n" + 
			"L 311.2 106.4 314.8 103.25" + "\n" + 
			"Q 315.55 102.6 316.1 101.95 316.55 101.45 316.65 100.75 317.1 89.7 316.85 78.7" + "\n" + 
			"L 293.35 78.7" + "\n" + 
			"Q 289.15 61.7 280.6 46.3 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 290, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

