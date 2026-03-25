package away3d.textures;

@:native("Engine3D.core.textures.BitmapCubeTexture")
extern class BitmapCubeTexture extends CubeTextureBase {
	public var positiveX(get, set):Any;
	public var negativeX(get, set):Any;
	public var positiveY(get, set):Any;
	public var negativeY(get, set):Any;
	public var positiveZ(get, set):Any;
	public var negativeZ(get, set):Any;
	public function new(posX:Any, negX:Any, posY:Any, negY:Any, posZ:Any, negZ:Any);
}