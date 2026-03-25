package pl.pkapusta.engine.common.data.primitive;

import openfl.geom.Vector3D;

/**
	 * Read-only Vector3D 
	 * @author Przemysław Kapusta
	 */
class ROVector3D
{
    public var x(get, never) : Float;
    public var y(get, never) : Float;
    public var z(get, never) : Float;

    
    public static function fromVector3D(v : Vector3D) : ROVector3D
    {
        return new ROVector3D(v.x, v.y, v.z);
    }
    
    private var _x : Float;
    private var _y : Float;
    private var _z : Float;
    
    public function new(x : Float, y : Float, z : Float)
    {
        _z = z;
        _y = y;
        _x = x;
    }
    
    private function get_x() : Float
    {
        return _x;
    }
    
    private function get_y() : Float
    {
        return _y;
    }
    
    private function get_z() : Float
    {
        return _z;
    }
}

