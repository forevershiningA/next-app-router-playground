package pl.pkapusta.engine.events;

import away3d.containers.ObjectContainer3D;
import openfl.events.Event;

/**
	 * ...
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.Engine3DContainerEvent")
class Engine3DContainerEvent extends Event
{   
    public static inline var ROOT_CONNECT : String = "root.connect";
    
    private var _container : ObjectContainer3D;
    private var _enviromentXML : FastXML;
    
    public function new(type : String, container : ObjectContainer3D, enviromentXML : FastXML = null, bubbles : Bool = false, cancelable : Bool = false)
    {
        super(type, bubbles, cancelable);
        _container = container;
        _enviromentXML = enviromentXML;
    }
    
    override public function clone() : Event
    {
        return new Engine3DContainerEvent(type, _container, _enviromentXML, bubbles, cancelable);
    }
    
    override public function toString() : String
    {
        return formatToString("Engine3DContainerEvent", "type", "bubbles", "cancelable", "eventPhase");
    }
    
    public function getContainer() : ObjectContainer3D
    {
        return _container;
    }
    
    public function getEnviromentXML() : FastXML
    {
        return _enviromentXML;
    }
}

