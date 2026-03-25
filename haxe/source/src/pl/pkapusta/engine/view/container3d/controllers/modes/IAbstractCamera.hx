package pl.pkapusta.engine.view.container3d.controllers.modes;

import pl.pkapusta.engine.common.data.primitive.ROVector3D;

/**
	 * @author Przemysław Kapusta
	 */
interface IAbstractCamera
{
    
    
    var position(get, never) : ROVector3D;    
    var target(get, never) : ROVector3D;    
    
    var isLocked(get, never) : Bool;    
    
    /**
		 * One of CameraMode class modes
		 */
    var mode(get, never) : String;

}

