package forevershining.headstones;

import pl.pkapusta.engine.graphics.algorithms.Bezier;
import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import openfl.geom.Point;

/**
 * @author Przemysław Kapusta
 */
class SVGPathReader {
	
	private var pathString:String;
	private var discretePoints:Array<DiscretePoint>;

	public function new(pathString:String) {
		this.pathString = pathString;
		this.discretePoints = new Array<DiscretePoint>();
		parse(pathString);
	}
	
	public function getPoints():Array<DiscretePoint> {
		return discretePoints;
	}
	
	private function parse(pathString:String) {
		//var splitRegex = ~/[\s,]+/g;
		var splitRegex = ~/(?<=\d)(?=[A-Za-z])|(?=\d)(?<=[A-Za-z])|(?=\-)|[\s,]+/g;
		var isNumberRegex = ~/^\-?\d*(\.\d+)?$/;
		var splitted:Array<String> = splitRegex.split(StringTools.trim(pathString));
		//trace("splitted: " + splitted);
		//trace("splitted.length: " + splitted.length);
		
		//removing empty elements after splitting
		var i = splitted.length;
		while (i-- > 0) 
		   if (splitted[i].length == 0) 
			  splitted.splice(i, 1);
			  
		//trace("splitted2: " + splitted);
		//trace("splitted2.length: " + splitted.length);
		
		var firstMode:String = null;
		var fpoint:Bool = false;
		var fptx:Float = 0;
		var fpty:Float = 0;
		var lastMode:String = null;
		var mode:String = null;
		var relativeMode:Bool = false;
		var ptx, pty:Float = 0;
		
		var it:Iterator<String> = splitted.iterator();
		while (it.hasNext()) {
			var cmd:String = it.next();
			if (!isNumberRegex.match(cmd)) {
				//change mode
				lastMode = mode;
				mode = cmd.toUpperCase();
				relativeMode = cmd.toLowerCase() == cmd;
				continue;
			}
			switch (mode) {
				case "M": //move mode
					ptx = Std.parseFloat(cmd);
					pty = Std.parseFloat(it.next());
					if (!fpoint) {
						fptx = ptx;
						fpty = pty;
						fpoint = true;
					}
					//trace("M", relativeMode, ptx, pty);
				case "L": //line mode
					ptx = Std.parseFloat(cmd);
					pty = Std.parseFloat(it.next());
					if (!fpoint) {
						fptx = ptx;
						fpty = pty;
						fpoint = true;
					}
					if (firstMode == null) firstMode = mode;
					
					//first point
					var firstPoint:Point = new Point(fptx, fpty);
					if (discretePoints.length > 0) {
						//replace last point to CornerType
						firstPoint = discretePoints.pop();
						discretePoints.push(new DiscreteCornerPoint(firstPoint.x, firstPoint.y));
					}
					if (relativeMode) {
						ptx += firstPoint.x;
						pty += firstPoint.y;
					}
					discretePoints.push(new DiscreteCornerPoint(ptx, pty));
					
					//trace("L", relativeMode, ptx, pty);
				case "H": //horizontal move mode
					ptx = Std.parseFloat(cmd);
					if (!fpoint) {
						fptx = ptx;
						fpoint = true;
					}
					if (firstMode == null) firstMode = mode;
					
					//first point
					var firstPoint:Point = new Point(fptx, fpty);
					if (discretePoints.length > 0) {
						//replace last point to CornerType
						firstPoint = discretePoints.pop();
						discretePoints.push(new DiscreteCornerPoint(firstPoint.x, firstPoint.y));
					}
					if (relativeMode) {
						ptx += firstPoint.x;
					}
					discretePoints.push(new DiscreteCornerPoint(ptx, firstPoint.y));
					
					//trace("H", relativeMode, ptx);
				case "V": //vertival move mode
					pty = Std.parseFloat(cmd);
					if (!fpoint) {
						fpty = pty;
						fpoint = true;
					}
					if (firstMode == null) firstMode = mode;
					
					//first point
					var firstPoint:Point = new Point(fptx, fpty);
					if (discretePoints.length > 0) {
						//replace last point to CornerType
						firstPoint = discretePoints.pop();
						discretePoints.push(new DiscreteCornerPoint(firstPoint.x, firstPoint.y));
					}
					if (relativeMode) {
						pty += firstPoint.y;
					}
					discretePoints.push(new DiscreteCornerPoint(firstPoint.x, pty));
					
					//trace("V", relativeMode, pty);
				case "Q": //quadratic bezier mode
					var cx:Float = Std.parseFloat(cmd);
					var cy:Float = Std.parseFloat(it.next());
					ptx = Std.parseFloat(it.next());
					pty = Std.parseFloat(it.next());
					if (!fpoint) {
						fptx = ptx;
						fpty = pty;
						fpoint = true;
					}
					if (firstMode == null) firstMode = mode;
					
					//first point
					var firstPoint:Point = new Point(fptx, fpty);
					if (discretePoints.length > 0) {
						firstPoint = discretePoints[discretePoints.length - 1];
					}
					Bezier.toDiscretePoints([new Point(firstPoint.x, firstPoint.y), new Point(cx, cy), new Point(ptx, pty)], discretePoints, 10);
					discretePoints.push(new DiscretePoint(ptx, pty));
					
					//trace("Q", relativeMode, cx, cy, ptx, pty);
				case "C": //cubic bezier mode
					var cx1:Float = Std.parseFloat(cmd);
					var cy1:Float = Std.parseFloat(it.next());
					var cx2:Float = Std.parseFloat(it.next());
					var cy2:Float = Std.parseFloat(it.next());
					ptx = Std.parseFloat(it.next());
					pty = Std.parseFloat(it.next());
					if (!fpoint) {
						fptx = ptx;
						fpty = pty;
						fpoint = true;
					}
					if (firstMode == null) firstMode = mode;
					
					//first point
					var firstPoint:Point = new Point(fptx, fpty);
					if (discretePoints.length > 0) {
						firstPoint = discretePoints[discretePoints.length - 1];
					}
					if (relativeMode) {
						cx1 += firstPoint.x;
						cy1 += firstPoint.y;
						cx2 += firstPoint.x;
						cy2 += firstPoint.y;
						ptx += firstPoint.x;
						pty += firstPoint.y;
					}
					Bezier.toDiscretePoints([new Point(firstPoint.x, firstPoint.y), new Point(cx1, cy1), new Point(cx2, cy2), new Point(ptx, pty)], discretePoints, 10);
					discretePoints.push(new DiscretePoint(ptx, pty));
					
					//trace("C", relativeMode, cx1, cy1, cx2, cy2, ptx, pty);
					
				case "S": //cubic bezier mode
					//TODO obliczyć cx1 i cy2 dla lepszej dokładności!
					//var cx1:Float = Std.parseFloat(cmd);
					//var cy1:Float = Std.parseFloat(it.next());
					var cx2:Float = Std.parseFloat(cmd);
					var cy2:Float = Std.parseFloat(it.next());
					ptx = Std.parseFloat(it.next());
					pty = Std.parseFloat(it.next());
					if (!fpoint) {
						fptx = ptx;
						fpty = pty;
						fpoint = true;
					}
					if (firstMode == null) firstMode = mode;
					
					//first point
					var firstPoint:Point = new Point(fptx, fpty);
					if (discretePoints.length > 0) {
						firstPoint = discretePoints[discretePoints.length - 1];
					}
					if (relativeMode) {
						cx2 += firstPoint.x;
						cy2 += firstPoint.y;
						ptx += firstPoint.x;
						pty += firstPoint.y;
					}
					Bezier.toDiscretePoints([new Point(firstPoint.x, firstPoint.y), new Point(cx2, cy2), new Point(ptx, pty)], discretePoints, 10);
					discretePoints.push(new DiscretePoint(ptx, pty));
					
					//trace("S", relativeMode, cx2, cy2, ptx, pty);
					
				case "Z": //close
				default:
					throw "Unsupported mode " + mode;
			}
		}
		
	}
	
}