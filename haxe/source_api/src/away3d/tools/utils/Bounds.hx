package away3d.tools.utils;

import away3d.containers.ObjectContainer3D;
import away3d.entities.Mesh;

@:native("Engine3D.core.tools.utils.Bounds")
extern class Bounds {
	public static var minX(get, never):Float;
	public static var minY(get, never):Float;
	public static var minZ(get, never):Float;
	public static var maxX(get, never):Float;
	public static var maxY(get, never):Float;
	public static var maxZ(get, never):Float;
	public static var width(get, never):Float;
	public static var height(get, never):Float;
	public static var depth(get, never):Float;
	public static function getMeshBounds(mesh:Mesh):Void;
	public static function getObjectContainerBounds(container:ObjectContainer3D, worldBased:Bool = true):Void;
	public static function getVerticesVectorBounds(vertices:Any):Void;
	public static function getCenter(outCenter:Any = null):Any;
	public static function reset():Void;
}