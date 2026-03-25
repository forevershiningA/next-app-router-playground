package away3d.cameras.lenses;

@:native("Engine3D.core.cameras.lenses.FreeMatrixLens")
extern class FreeMatrixLens extends LensBase {
	public function new();
	override public function clone():LensBase;
}