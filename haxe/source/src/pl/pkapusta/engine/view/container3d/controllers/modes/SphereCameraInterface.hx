package pl.pkapusta.engine.view.container3d.controllers.modes;

import pl.pkapusta.engine.view.container3d.controllers.modes.AbstractCameraInterface;

/**
	 * @author Przemysław Kapusta
	 */
class SphereCameraInterface extends AbstractCameraInterface implements ISphereCamera
{
    public var angleH(get, set) : Float;
    public var angleV(get, set) : Float;
    public var distance(get, set) : Float;

    
    public function new(cameraMode : SphereCameraMode)
    {
        super(cameraMode);
    }
    
    /**
		 * Horizontal camera angle
		 */
    private function get_angleH() : Float
    {
        return cast((cameraMode), SphereCameraMode).angleA * 180 / Math.PI;
    }
    
    /**
		 * Horizontal camera angle
		 */
    private function set_angleH(value : Float) : Float
    {
        cast((cameraMode), SphereCameraMode).angleA = value * Math.PI / 180;
        return value;
    }
    
    /**
		 * Vertical camera angle
		 */
    private function get_angleV() : Float
    {
        return cast((cameraMode), SphereCameraMode).angleB * 180 / Math.PI;
    }
    
    /**
		 * Vertical camera angle
		 */
    private function set_angleV(value : Float) : Float
    {
        cast((cameraMode), SphereCameraMode).angleB = value * Math.PI / 180;
        return value;
    }
    
    public function rotateH(deltaAngle : Float) : Void
    {
        angleH += deltaAngle;
    }
    
    public function rotateV(deltaAngle : Float) : Void
    {
        angleV += deltaAngle;
    }
    
    private function get_distance() : Float
    {
        return cast((cameraMode), SphereCameraMode).radius;
    }
    
    private function set_distance(value : Float) : Float
    {
        cast((cameraMode), SphereCameraMode).radius = value;
        return value;
    }
    
    public function zoom(deltaDistance : Float) : Void
    {
        distance -= deltaDistance;
    }
}

