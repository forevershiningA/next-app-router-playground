package away3d.core.pick;

@:native("Engine3D.core.core.pick.HaxePickingCollider")
extern class HaxePickingCollider {
	public function new(findClosestCollision:Bool = false);
	public function testSubMeshCollision(subMesh:Any, pickingCollisionVO:Any, shortestCollisionDistance:Float):Bool;
}