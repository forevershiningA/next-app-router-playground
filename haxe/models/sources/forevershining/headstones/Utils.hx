package forevershining.headstones;

import pl.pkapusta.engine.graphics.path.DiscretePath;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import openfl.geom.Point;
import openfl.geom.Rectangle;

/**
 * @author Przemysław Kapusta
 */
class Utils {
	
	public static function svgToModelCoordinatesPath(path:DiscretePath):Void {
		var points:Array<DiscretePoint> = [];
		for (p in path.getVector()) points.push(try cast(p.clone(), DiscretePoint) catch(e:Dynamic) null);
		var bounds:Rectangle = calculateBounds(points);
		recalculatePoints(points, bounds);
		path.setPoints(points);
		for (innerPath in path.getInnerPaths()) {
			points = [];
			for (p in innerPath.getVector()) points.push(try cast(p.clone(), DiscretePoint) catch(e:Dynamic) null);
			recalculatePoints(points, bounds);
			innerPath.setPoints(points);
		}
	}
	
	public static function svgToModelCoordinates(points:Array<DiscretePoint>):Void {
		var bounds:Rectangle = calculateBounds(points);
		recalculatePoints(points, bounds);
	}
	
	private static function recalculatePoints(points:Array<DiscretePoint>, bounds:Rectangle) {
		for (point in points) {
			point.x -= bounds.left;
			point.x -= bounds.width / 2;
			point.x *= -1;
			point.y -= bounds.top;
			point.y *= -1;
			point.y += bounds.height;
		}
	}
	
	public static function calculateBounds(points:Array<DiscretePoint>):Rectangle {
        var left : Float = Math.POSITIVE_INFINITY;
        var top : Float = Math.POSITIVE_INFINITY;
        var right : Float = Math.NEGATIVE_INFINITY;
        var bottom : Float = Math.NEGATIVE_INFINITY;
        
        var i : Int = 1;
        while (i < points.length)
        {
            var point : DiscretePoint = points[i];
            if (point.x < left)
            {
                left = point.x;
            }
            if (point.y < top)
            {
                top = point.y;
            }
            if (point.x > right)
            {
                right = point.x;
            }
            if (point.y > bottom)
            {
                bottom = point.y;
            }
            i++;
        }
        
		var bounds:Rectangle = new Rectangle();
        bounds.left = left;
        bounds.top = top;
        bounds.right = right;
        bounds.bottom = bottom;
		return bounds;
    }

}