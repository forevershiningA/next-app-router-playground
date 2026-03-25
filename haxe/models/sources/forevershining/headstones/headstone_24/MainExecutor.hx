package forevershining.headstones.headstone_24;

import pl.pkapusta.engine.graphics.algorithms.Bezier;
import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.graphics.path.HeadScalingDiscretePath;
import pl.pkapusta.engine.graphics.path.NormalsDirection;
import pl.pkapusta.engine.graphics.path.DiscretePath;
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
			"M 277.65 62.65" +
			"L 263.75 62.7" +
			"Q 261.4 63.05 259.4 61.95 257.4 60.6 256.6 58.35 253.6 51.15 248.75 45.05 243.9 38.95 237.6 34.4 228.6 28.5 219.15 23.3" +
			"L 223.15 1.25 173.3 1.25 177.55 24.05" +
			"Q 163.85 28.95 153.4 39.1 142.95 49.25 137.75 62.85" +
			"L 118.8 62.85 118.8 111.15 134.45 111.1" +
			"Q 136.6 110.85 138.6 111.8 140.6 112.95 141.5 115.1 145 121.9 150 127.65 154.95 133.4 161.15 137.85 162.4 138.95 163 140.5 163.7 142.05 163.55 143.7 160.35 164 158.75 174.15 158.65 175.45 158.15 176.65 157.8 177.5 157.05 178.1 156.3 178.65 155.35 178.75 154.2 179 153 178.95 140.3 178.65 126 178.95 122.7 178.9 119.55 180 116.35 181.05 113.8 183.15 111.4 185.3 109.9 188.15 108.45 191 108.1 194.15" +
			"L 78.05 398.95 321.1 398.95 307.4 316.4" +
			"Q 298.1 259.1 288.95 198.8 288.35 193.95 286.65 189.4 285.4 185.85 282.65 183.25 279.9 180.8 276.25 179.9 271.55 178.8 266.7 178.9" +
			"L 238.6 178.9 232.9 143.35" +
			"Q 232.8 141.65 233.6 140.2 234.3 138.65 235.65 137.55 248 128.2 255.45 114.85 256.45 113.3 258 112.5 259.55 111.55 261.4 111.3 269.8 110.85 277.65 111.15" +
			"L 277.65 62.65 Z"
		);
        var points : Array<DiscretePoint> = reader.getPoints();
		var path: ScalingDiscretePath = new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE);
		
		reader = new SVGPathReader(
			"M 209.3 47.05" +
			"Q 210.05 42.85 212.15 39.1 223.6 42.6 232.1 50.95 240.6 59.4 244.2 70.8 241.25 72.95 237.7 73.95 234.2 75 230.55 74.75 226.8 74.5 223.35 73.05 219.9 71.6 217.1 69.15 213.95 66.55 211.9 63.05 209.85 59.55 209.15 55.5 208.5 51.25 209.3 47.05 Z"
		);
		points = reader.getPoints();
		path.addInnerPath(new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE));
		
		reader = new SVGPathReader(
			"M 183.95 39.05" +
			"Q 186.15 42.35 187.1 46.15 188.05 50 187.65 53.95 187.2 57.85 185.45 61.35 183.75 64.9 180.95 67.7 178.3 70.55 174.8 72.3 171.35 74.1 167.5 74.6 163.45 75 159.55 74.1 155.6 73.15 152.2 71 155.8 59.65 164.25 51.2 172.65 42.75 183.95 39.05 Z"
		);
		points = reader.getPoints();
		path.addInnerPath(new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE));
		
		reader = new SVGPathReader(
			"M 162.15 95.45" +
			"Q 165.75 95.1 169.25 96 172.9 96.85 176.15 98.7 179.35 100.6 181.9 103.4 184.4 106.2 185.95 109.65 187.4 113.05 187.75 116.8 188.05 120.6 187.1 124.25 186.15 127.9 184.05 131.05 173.3 127.85 165.2 120.15 157.1 112.4 153.3 101.9 153.15 101.35 153.25 100.8 153.45 100.05 153.75 99.45 154.05 98.8 154.5 98.2 154.85 97.75 155.4 97.4 158.6 95.85 162.15 95.45 Z"
		);
		points = reader.getPoints();
		path.addInnerPath(new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE));
		
		reader = new SVGPathReader(
			"M 221.6 98" +
			"Q 225.15 96.2 229.1 95.7 233.1 95.2 237 96.2 240.9 97.15 244.25 99.35 240.7 110.7 232.3 119.1 223.9 127.55 212.55 131.05 210.3 127.95 209.35 124.2 208.35 120.5 208.75 116.65 209.2 112.7 210.9 109.15 212.55 105.55 215.3 102.75 218.05 99.8 221.6 98 Z"
		);
		points = reader.getPoints();
		path.addInnerPath(new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE));
		
		Utils.svgToModelCoordinatesPath(path);
		
		//modelOptions.set("innerCornerRound", 0);
		modelOptions.set("hasInnerSide", true);
		//modelOptions.set("hasBackCorner", false);
		
		return path;
    }

    public function new() {
        super();
    }
	
}

