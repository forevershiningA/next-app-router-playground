package pl.pkapusta.engine.view.container3d.controllers.modes;

import pl.pkapusta.engine.view.container3d.controllers.modes.IAbstractCamera;

/**
	 * @author Przemysław Kapusta
	 */
interface ISphereCamera extends IAbstractCamera
{
    
    
    /**
		 * Horizontal camera angle
		 */
    
    
    /**
		 * Horizontal camera angle
		 */
    var angleH(get, set) : Float;    
    
    /**
		 * Vertical camera angle
		 */
    
    
    /**
		 * Vertical camera angle
		 */
    var angleV(get, set) : Float;    
    
    
    var distance(get, set) : Float;

    
    function rotateH(deltaAngle : Float) : Void
    ;
    function rotateV(deltaAngle : Float) : Void
    ;
    
    function zoom(deltaDistance : Float) : Void
    ;
}

