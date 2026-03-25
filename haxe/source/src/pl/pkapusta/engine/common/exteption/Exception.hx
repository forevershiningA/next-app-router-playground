package pl.pkapusta.engine.common.exteption;

import openfl.errors.Error;
import haxe.Constraints.Function;
import pl.pkapusta.engine.common.exteption.control.ExceptionControl;
import pl.pkapusta.engine.common.exteption.control.IExceptionControl;
import pl.pkapusta.engine.common.exteption.control.mainControls.OKExceptionControl;

/**
	 * @author Przemysław Kapusta
	 */
class Exception extends Error
{
    public var type(get, never) : Int;
    public var controlList(get, never) : Array<IExceptionControl>;

    
    public static inline var TYPE_INFO : Int = 1;
    public static inline var TYPE_WARNING : Int = 2;
    public static inline var TYPE_FATAL : Int = 3;
    
    private var _type : Int;
    
    private var _controls : Map<String, IExceptionControl>;
    private var _controlList : Array<IExceptionControl>;
    
    public function new(message : String, type : Int = 3, controlList : Array<IExceptionControl> = null)
    {
        super(message);
		_type = type;
        _controls = new Map<String, IExceptionControl>();
        _controlList = new Array<IExceptionControl>();
        if (controlList == null || controlList.length == 0)
        {
            var okControl : OKExceptionControl = new OKExceptionControl();
            _controls.set(okControl.id, okControl);
            _controlList.push(okControl);
        }
        else
        {
            var i : Int = 0;
            while (i < controlList.length)
            {
                _controls.set(controlList[i].id, controlList[i]);
                _controlList.push(controlList[i]);
                i++;
            }
        }
        var em : ExceptionManager = ExceptionManager.getInstance();
        if (em.autoDispatchException)
        {
            em.doDispatchException(this);
        }
        em = null;
    }
    
    private function get_type() : Int
    {
        return _type;
    }
    
    private function get_controlList() : Array<IExceptionControl>
    {
        return _controlList;
    }
    
    public function doControlAction(id : String, onComplete : Function = null) : Void
    {
        if (_controls.exists(id)) {
			_controls.get(id).doAction(onComplete);
        }
    }
}

