package forevershining.headstones.headstone_34;

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
			"M 325.9 119.25" + "\n" + 
			"Q 326 116.75 325.4 114.25 324.9 112.3 323.65 110.85 322.4 109.45 320.55 108.75 318.3 107.85 315.8 107.5 309.75 106.75 304.2 104.3 298.6 101.8 293.95 97.8 289.45 93.65 286.4 88.3 283.35 82.95 282 76.95 281.1 73.15 279.95 69.75 279.3 67.5 277.65 65.85 275.9 64.4 273.65 64" + "\n" + 
			"L 266.45 62.8 264.7 48.95" + "\n" + 
			"Q 263.6 41.9 260.8 35.25 258.05 28.65 253.75 22.9 249.25 17.3 243.5 13 237.7 8.75 231.05 6.1 219.25 1.15 206.5 0.15 193.7 -0.9 181.25 2.05 172.75 3.7 165 7.65 157.25 11.55 150.9 17.5 144.75 23.7 140.75 31.4 136.75 39.2 135.2 47.75 133.95 55.25 133.25 63.3" + "\n" + 
			"L 131.2 63.45" + "\n" + 
			"Q 130.4 63.55 129.5 63.5 127.15 63.15 124.85 63.55 123 63.9 121.55 65.1 120.05 66.45 119.4 68.2 118.5 70.5 118.2 72.95 117.5 79.7 114.6 85.8 111.75 91.95 107 96.8 102.3 101.3 96.35 103.85 89.65 106.75 82.35 107.8 80.25 108.05 78.25 108.9 76.75 109.55 75.6 110.85 74.55 112.25 74.2 113.85 73.75 116 73.85 118.05" + "\n" + 
			"L 73.9 400.05 325.95 400.05 325.9 119.25 Z"
		);
        
        var points : Array<DiscretePoint> = reader.getPoints();
		
		Utils.svgToModelCoordinates(points);
        
        return new HeadScalingDiscretePath(points, 280, false, false, NormalsDirection.ANTICLOCKWISE);
    }

    public function new() {
        super();
    }
	
}

