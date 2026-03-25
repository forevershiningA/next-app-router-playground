package forevershining.headstones.headstone_39;

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
			"M 278.95 46.55" + "\n" + 
			"Q 271.4 32.85 259.8 22.35 248.4 12.2 234.1 6.8 218.6 1 202.1 0.6" + "\n" + 
			"L 202.1 0.55 198 0.55 198 0.6" + "\n" + 
			"Q 181.5 1 165.9 6.8 151.6 12.2 140.25 22.35 128.65 32.85 121.1 46.55 112.75 61.75 108.5 78.6" + "\n" + 
			"L 85.1 78.6 85.15 100.2" + "\n" + 
			"Q 85.3 101.35 85.75 102.3 85.95 102.85 86.25 103.2" + "\n" + 
			"L 86.5 103.45" + "\n" + 
			"Q 86.6 103.6 86.75 103.6 88.35 103.65 89.6 104.55 90.5 105.25 90.7 106.4 90.9 107.5 90.8 108.7" + "\n" + 
			"L 90.65 111.05 90.6 304.95" + "\n" + 
			"Q 90.55 307.05 90.05 309.1 89.8 310 89.4 310.85 89.35 311.1 89.1 311.35" + "\n" + 
			"L 88.95 311.5 88.8 311.55" + "\n" + 
			"Q 87.3 311.65 86 312.45 85.2 313.1 85 314.2 84.85 315.25 84.9 316.25" + "\n" + 
			"L 85.05 318.4 85.1 392.75 85.55 399.5 314.5 399.5 314.9 392.75 315 318.4" + "\n" + 
			"Q 315.25 316.3 315.05 314.2 314.85 313.1 314 312.45 312.8 311.65 311.25 311.55 311.1 311.55 311.1 311.5" + "\n" + 
			"L 310.95 311.35" + "\n" + 
			"Q 310.8 311.2 310.6 310.85 310.25 309.95 310.05 309.1 309.5 307.05 309.45 304.95" + "\n" + 
			"L 309.4 111.05" + "\n" + 
			"Q 309.15 108.75 309.35 106.4 309.5 105.25 310.4 104.55 311.7 103.65 313.3 103.6 313.45 103.6 313.55 103.45 313.65 103.4 313.8 103.2 314.1 102.85 314.3 102.3 314.75 101.35 314.85 100.2" + "\n" + 
			"L 314.95 78.6 291.5 78.6" + "\n" + 
			"Q 287.3 61.75 278.95 46.55 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 290, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

