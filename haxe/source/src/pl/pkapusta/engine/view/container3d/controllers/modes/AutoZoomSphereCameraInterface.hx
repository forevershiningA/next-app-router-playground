package pl.pkapusta.engine.view.container3d.controllers.modes;


/**
	 * @author Przemysław Kapusta
	 */
class AutoZoomSphereCameraInterface extends SphereCameraInterface implements IAutoZoomSphereCamera
{
    
    public function new(cameraMode : AutoZoomSphereCameraMode)
    {
        super(cameraMode);
    }
    
    override private function get_distance() : Float
    {
        return cast((cameraMode), AutoZoomSphereCameraMode).linearDistance;
    }
    
    override private function set_distance(value : Float) : Float
    {
        cast((cameraMode), AutoZoomSphereCameraMode).linearDistance = value;
        return value;
    }
    
    override public function zoom(deltaDistance : Float) : Void
    {
        distance -= deltaDistance;
    }
}

