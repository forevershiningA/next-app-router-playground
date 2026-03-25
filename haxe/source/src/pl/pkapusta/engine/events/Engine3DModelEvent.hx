package pl.pkapusta.engine.events;

import pl.pkapusta.engine.model.IModel3D;
import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.Engine3DModelEvent")
class Engine3DModelEvent extends Event
{
    public static inline var MODEL_SELECT : String = "model.select";
    
    private var _model : IModel3D;
    
    public function new(type : String, model : IModel3D, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _model = model;
    }
    
    override public function clone() : Event
    {
        return new Engine3DModelEvent(type, _model, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("EngineModel3D", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    public function getModel() : IModel3D
    {
        return _model;
    }
}

