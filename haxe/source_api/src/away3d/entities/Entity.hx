package away3d.entities;

import away3d.containers.ObjectContainer3D;
import away3d.containers.Scene3D;

import openfl.geom.Vector3D;

@:native("Engine3D.core.entities.Entity")
extern class Entity extends ObjectContainer3D {
	public var shaderPickingDetails(get, set):Bool;
	public var staticNode(get, set):Bool;
	public var pickingCollisionVO(get, never):Any;
	public var showBounds(get, set):Bool;
	public var bounds(get, set):Any;
	public var worldBounds(get, never):Any;
	public var pickingCollider(get, set):Any;
	public function new();
	public function getEntityPartitionNode():Any;
	public function isIntersectingRay(rayPosition:Vector3D, rayDirection:Vector3D):Bool;
	public function internalUpdate():Void;
}