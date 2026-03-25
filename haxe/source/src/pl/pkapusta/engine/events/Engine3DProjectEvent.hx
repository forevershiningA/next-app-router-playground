package pl.pkapusta.engine.events;

import pl.pkapusta.engine.project.IProject3D;
import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.Engine3DProjectEvent")
class Engine3DProjectEvent extends Event
{   
    public static inline var PROJECT_LOADED : String = "project.loaded";
    
    private var _project : IProject3D;
    
    public function new(type : String, project : IProject3D, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _project = project;
    }
    
    override public function clone() : Event
    {
        return new Engine3DProjectEvent(type, _project, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("Engine3DProjectEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    public function getProject() : IProject3D
    {
        return _project;
    }
}

