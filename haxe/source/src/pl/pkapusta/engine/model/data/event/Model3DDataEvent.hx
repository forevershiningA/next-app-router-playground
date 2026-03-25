package pl.pkapusta.engine.model.data.event;

import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
class Model3DDataEvent extends Event
{
    
    public static var BUILD_COMPLETE : String;
    
    public function new(type : String, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
    }
    
    override public function clone() : Event
    {
        return new Model3DDataEvent(type, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("Model3DDataEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
}

