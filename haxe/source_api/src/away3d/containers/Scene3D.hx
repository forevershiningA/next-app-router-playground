package away3d.containers;

import away3d.entities.Entity;

@:native("Engine3D.core.containers.Scene3D")
extern class Scene3D {
	public var partition(get, set):Any;
	public var numChildren(get, never):Int;
	public var _sceneGraphRoot:ObjectContainer3D;
	public function new();
	public function traversePartitions(traverser:Any):Void;
	public function contains(child:ObjectContainer3D):Bool;
	public function addChild(child:ObjectContainer3D):ObjectContainer3D;
	public function removeChild(child:ObjectContainer3D):Void;
	public function removeChildAt(index:Int):Void;
	public function getChildAt(index:Int):ObjectContainer3D;
	public function invalidateEntityBounds(entity:Entity):Void;
	public function registerPartition(entity:Entity):Void;
	public function unregisterPartition(entity:Entity):Void;
}