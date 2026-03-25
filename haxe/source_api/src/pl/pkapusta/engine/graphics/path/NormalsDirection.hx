package pl.pkapusta.engine.graphics.path;

@:native("Engine3D.graphics.path.NormalsDirection")
extern class NormalsDirection {
	public static inline var DEFAULT : Int = 0;
    public static inline var CLOCKWISE : Int = 1;
    public static inline var ANTICLOCKWISE : Int = 2;
	public function new();
}