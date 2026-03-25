package pl.pkapusta.engine.view.graphics3d.primitives;

import away3d.primitives.PrimitiveBase;
import pl.pkapusta.engine.graphics.path.DiscretePath;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import openfl.geom.Rectangle;

@:native("Engine3D.view.graphics3d.primitives.PathGeometry")
extern class PathGeometry extends PrimitiveBase {
	public var thickness(get, set):Float;
	public var cornerRound(get, set):Float;
	public var uvMappingRect(get, set):Rectangle;
	public var path(get, set):DiscretePath;
	public function new(path:DiscretePath, thickness:Float, cornerRound:Float = 0, hasFront:Bool = true, hasBack:Bool = true, hasSide:Bool = true, uvMappingRect:Rectangle = null, options:haxe.DynamicAccess<Dynamic> = null);
}