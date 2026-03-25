package pl.pkapusta.engine.view.graphics3d.primitives;

import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePath;
import openfl.geom.Rectangle;

@:native("Engine3D.view.graphics3d.primitives.RectangleGeometry")
extern class RectangleGeometry extends PathGeometry {
	public var width(get, set):Float;
	public var height(get, set):Float;
	public function new(width:Float, height:Float, thickness:Float, cornerRound:Float = 0, hasFront:Bool = true, hasBack:Bool = true, hasSide:Bool = true, uvMappingRect:Rectangle = null);
}