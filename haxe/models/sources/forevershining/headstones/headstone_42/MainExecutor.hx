package forevershining.headstones.headstone_42;

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
			"M 222.05 9.2" + "\n" + 
			"Q 218.25 17.25 215.5 25.35 208 47.8 199.3 73.4 189.2 102.9 175.1 130.55 160.7 159.4 138.25 182.65 120.45 200.3 110.5 223.3 101.15 245.45 99.2 269.35 97.15 293.85 100.35 318.35 103.6 343.45 110.1 368.15 113.05 384.5 118.6 400.05 197.25 400.5 275.9 400.45 279.5 400.45 283 399.45 285.65 398.7 287.9 397 290.3 395.2 291.1 392.2 297.95 365.9 300.1 339 302.4 310.65 301.2 282 298.5 224 286.75 167 276.65 116.9 261.65 68.2 252.25 36.8 239.85 6.5 238.3 2.6 234.8 0.45 233.3 -0.45 231.6 -0.4 229.85 -0.35 228.4 0.6 226.55 1.95 225.25 3.85 223.45 6.35 222.05 9.2 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

