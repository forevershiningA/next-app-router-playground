package pl.pkapusta.engine;

import pl.pkapusta.engine.common.exteption.IExceptionManager;
import pl.pkapusta.engine.IEngine3DController;

/**
 * The root Engine 3D interface for acces to the model, view and controller.
 * 
 * @author Przemysław Kapusta
 */
interface IEngine3D {
	
	/**
	 * Returns the main controller
	 */
	function getController() : IEngine3DController;
	
	/**
	 * Returns an instance of the error manager
	 */
	function getExceptionManager() : IExceptionManager;

}

