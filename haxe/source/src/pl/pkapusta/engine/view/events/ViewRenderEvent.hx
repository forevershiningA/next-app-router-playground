package pl.pkapusta.engine.view.events;

import away3d.containers.View3D;
import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
class ViewRenderEvent extends Event
{
    public var view(get, never) : View3D;

    
    public static inline var BEFORE_RENDER : String = "beforeRender";
    public static inline var AFTER_RENDER : String = "afterRender";
    
    private var _view : View3D;
    
    public function new(type : String, view : View3D, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _view = view;
    }
    
    override public function clone() : Event
    {
        return new ViewRenderEvent(type, _view, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("ViewRenderEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    private function get_view() : View3D
    {
        return _view;
    }
}

