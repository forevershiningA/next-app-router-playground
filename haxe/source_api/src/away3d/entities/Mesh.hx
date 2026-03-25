package away3d.entities;

import away3d.library.assets.IAsset;
import away3d.core.base.Geometry;
import away3d.materials.MaterialBase;

@:native("Engine3D.core.entities.Mesh")
extern class Mesh extends Entity implements IAsset {
	public var castsShadows(get, set):Bool;
	public var animator(get, set):Any;
	public var geometry(get, set):Geometry;
	public var material(get, set):MaterialBase;
	public var subMeshes(get, never):Any;
	public var shareAnimationGeometry(get, set):Bool;
	public function new(geometry:Geometry, material:MaterialBase = null);
	public function bakeTransformations():Void;
	public function clearAnimationGeometry():Void;
	override public function dispose():Void;
	public function disposeWithAnimatorAndChildren():Void;
	override public function clone():Mesh;
	public function getSubMeshForSubGeometry(subGeometry:Any):Any;
	public function collidesBefore(shortestCollisionDistance:Float, findClosest:Bool):Bool;
}