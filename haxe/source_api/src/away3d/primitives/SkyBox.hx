package away3d.primitives;

import away3d.entities.Entity;
import away3d.materials.MaterialBase;
import away3d.textures.CubeTextureBase;
import away3d.cameras.Camera3D;

@:native("Engine3D.core.primitives.SkyBox")
extern class SkyBox extends Entity {
	public var animator(get, never):Any;
	public var numTriangles(get, never):Int;
	public var sourceEntity(get, never):Entity;
	public var material(get, set):MaterialBase;
	public var castsShadows(get, never):Bool;
	public var uvTransform(get, never):Any;
	public var uvTransform2(get, never):Any;
	public var vertexData(get, never):Any;
	public var indexData(get, never):Any;
	public var UVData(get, never):Any;
	public var numVertices(get, never):Int;
	public var vertexStride(get, never):Int;
	public var vertexNormalData(get, never):Any;
	public var vertexTangentData(get, never):Any;
	public var vertexOffset(get, never):Int;
	public var vertexNormalOffset(get, never):Int;
	public var vertexTangentOffset(get, never):Int;
	public function new(cubeMap:CubeTextureBase);
	public function activateVertexBuffer(index:Int, stage3DProxy:Any):Void;
	public function activateUVBuffer(index:Int, stage3DProxy:Any):Void;
	public function activateVertexNormalBuffer(index:Int, stage3DProxy:Any):Void;
	public function activateVertexTangentBuffer(index:Int, stage3DProxy:Any):Void;
	public function activateSecondaryUVBuffer(index:Int, stage3DProxy:Any):Void;
	public function getIndexBuffer(stage3DProxy:Any):Any;
	public function getRenderSceneTransform(camera:Camera3D):Any;
}