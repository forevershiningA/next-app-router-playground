package pl.pkapusta.engine;

import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.exteption.IExceptionManager;
import pl.pkapusta.engine.common.Includes;
import pl.pkapusta.engine.Engine3DController;
import pl.pkapusta.engine.IEngine3DController;
import pl.pkapusta.engine.Engine3DModel;
import pl.pkapusta.engine.globals.Globals;
import pl.pkapusta.engine.utils.mouse.MouseUtil;
import pl.pkapusta.engine.Engine3DView;
import pl.pkapusta.engine.IEngine3DView;
import pl.pkapusta.engine.view.utils.SharedStage3D;
import openfl.display.DisplayObjectContainer;
import openfl.display.Stage;

	/**
	 * The root Engine 3D object that initializes the model, view and controller.
	 * 
	 * @author Przemysław Kapusta
	 */
class Engine3D implements IEngine3D
{
	public static var Globals(get, never) : Globals;
	#if config_debug
		public static var stage(get, never) : Stage;
	#end
    
    private var includes : Includes;
    
	private static var _globals : Globals = new Globals();
	private static function get_Globals() : Globals {
		return _globals;
	}
    #if config_debug
		private static var _stage : Stage;
		private static function get_stage() : Stage
		{
			return _stage;
		}
	#end
    
    private var _model : Engine3DModel;
    private var _controller : Engine3DController;
    private var _view : Engine3DView;
    
    private var _displayParent : DisplayObjectContainer;
    private var _sharedStage3D : SharedStage3D;
    
    private var _exceptionManager : IExceptionManager;
    
    public function new(display : DisplayObjectContainer, width : Null<Float> = null, height : Null<Float> = null, sharedStage3D : SharedStage3D = null)
    {
        _displayParent = display;
        _sharedStage3D = sharedStage3D;
		
        #if config_debug
        _stage = display.stage;
        #end
		
        init();
        if (width != null)
        {
            _view.width = width;
        }
        if (height != null)
        {
            _view.height = height;
        }
    }
    
    private function init() : Void
    {
        if (!MouseUtil.active)
        {
            MouseUtil.activate(_displayParent.stage);
        }
        _model = new Engine3DModel();
        _controller = new Engine3DController(_model);
        _view = new Engine3DView(_model, _controller, _displayParent, _sharedStage3D);
        _exceptionManager = ExceptionManager.getInstance();
        _controller.firstInit();
        _model.setView(_view.getView());
    }
    
	/**
	 * Returns the main controller
	 */
    public function getController() : IEngine3DController
    {
        return _controller;
    }
    
	/**
	 * Returns the main view
	 */
    public function getView() : IEngine3DView
    {
        return _view;
    }
	
	/**
	 * Returns the main model (not to be confused with a model3d object!).
	 */
	public function getModel() : Engine3DModel {
		return _model;
	}
    
	/**
	 * Returns an instance of the error manager
	 */
    public function getExceptionManager() : IExceptionManager
    {
        return _exceptionManager;
    }
}

