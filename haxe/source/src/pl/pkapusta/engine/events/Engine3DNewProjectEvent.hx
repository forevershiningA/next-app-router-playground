package pl.pkapusta.engine.events;

import pl.pkapusta.engine.project.IProject3D;
import openfl.events.Event;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.Engine3DNewProjectEvent")
class Engine3DNewProjectEvent extends Event
{
	public static inline var NEW_PROJECT_CREATED : String = "new.project.created";
    
    private var _project : IProject3D;
    
    public function new(type : String, project : IProject3D, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _project = project;
    }
    
    override public function clone() : Event
    {
        return new Engine3DNewProjectEvent(type, _project, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("Engine3DNewProjectEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    public function getProject() : IProject3D
    {
        return _project;
    }
}

