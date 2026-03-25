package pl.pkapusta.engine.view.container3d.controllers.modes;

import pl.pkapusta.engine.common.data.primitive.ROVector3D;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
class AbstractCameraInterface implements IAbstractCamera
{
    public var position(get, never) : ROVector3D;
    public var target(get, never) : ROVector3D;
    public var isLocked(get, never) : Bool;
    public var mode(get, never) : String;

    
    private var cameraMode : AbstractCameraMode;
    
    public function new(cameraMode : AbstractCameraMode)
    {
        this.cameraMode = cameraMode;
    }
    
    private function get_position() : ROVector3D
    {
        return ROVector3D.fromVector3D(cameraMode.position);
    }
    
    
    private function get_target() : ROVector3D
    {
        return ROVector3D.fromVector3D(cameraMode.target);
    }
    
    private function get_isLocked() : Bool
    {
        return cameraMode.locked;
    }
    
    /**
		 * One of CameraMode class modes
		 */
    private function get_mode() : String
    {
        return cameraMode.mode;
    }
}

