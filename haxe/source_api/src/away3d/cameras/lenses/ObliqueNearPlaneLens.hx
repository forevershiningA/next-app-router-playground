package away3d.cameras.lenses;

@:native("Engine3D.core.cameras.lenses.ObliqueNearPlaneLens")
extern class ObliqueNearPlaneLens extends LensBase {
	public var plane(get, set):Any;
	public var baseLens(never, set):LensBase;
	public function new(baseLens:LensBase, plane:Any);
}