package pl.pkapusta.engine.project.data;

import openfl.errors.Error;
import pl.pkapusta.engine.project.data.triggers.IResourceLoadTrigger;

/**
 * Context used when loading the scene
 * 
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.project.ProjectContext")
class ProjectContext implements IProjectContext
{
	
	/**
	 * Relative path after which dependencies will be resolved, i.e. loaded textures, models, etc
	 */
    public var relativeURL(get, set) : String;

    
    private var _relativeURL : String = "";
    
    private var _resourceLoadTriggers : Map<String, Class<IResourceLoadTrigger>>;
    
	/**
	 * Builds a project loading context
	 * @param	relativeURL	Relative path after which dependencies will be resolved, i.e. loaded textures, models, etc
	 */
    public function new(relativeURL : String = "")
    {
        _relativeURL = relativeURL;
        _resourceLoadTriggers = new Map<String, Class<IResourceLoadTrigger>>();
    }
    
	/**
	 * Registers a trigger that performs dependency resolution on project load
	 * @param	triggerClass	trigger class
	 */
    public function registerResourceLoadTrigger(triggerClass : Class<IResourceLoadTrigger>) : Void
    {
        var trigger : IResourceLoadTrigger = Type.createInstance(triggerClass, []);
        if (trigger == null)
        {
            throw new Error("Trigger Class must implement IResourceLoadTrigger interface");
        }
        var type : String = trigger.resourceType;
        trigger.dispose();
        _resourceLoadTriggers.set(type, triggerClass);
    }
    
    public function buildResourceLoadTrigger(includingTypes : Array<String>) : IResourceLoadTrigger
    {
        var i : Int = 0;
        while (i < includingTypes.length)
        {
            var type : String = includingTypes[i];
            if (_resourceLoadTriggers.exists(type))
            {
                var triggerClass : Class<IResourceLoadTrigger> = _resourceLoadTriggers.get(type);
                var ret : IResourceLoadTrigger = Type.createInstance(triggerClass, []);
                return ret;
            }
            i++;
        }
        return null;
    }
    
    private function get_relativeURL() : String
    {
        return _relativeURL;
    }
    
    private function set_relativeURL(value : String) : String
    {
        _relativeURL = value;
        return value;
    }
}

