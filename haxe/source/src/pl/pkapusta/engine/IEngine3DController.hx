package pl.pkapusta.engine;

import haxe.Constraints.Function;
import pl.pkapusta.engine.project.data.ProjectContext;
import pl.pkapusta.engine.project.data.ProjectSaveCustomizator;
import pl.pkapusta.engine.project.IProject3D;
import openfl.events.IEventDispatcher;
import openfl.utils.ByteArray;

/**
 * Main controller interface. Manages the 3d project state, initializes a new project, loads and saves.
 * 
 * @author Przemysław Kapusta
 */
interface IEngine3DController extends IEventDispatcher
{
    
    
	/**
	 * Get current project instance
	 */
    function getCurrentProject() : IProject3D;

    
	/**
	 * Creates new empty engine project. Current project will be destoyed.
	 */
    function newEmptyProject() : Void;
    
	
	/**
	 * Closes the current project
	 */
    function closeProject() : Void;
	
	/**
	 * Closes the current project and clears all models and their resources
	 */
    function closeProjectAndDisposeChildren() : Void;
    
	/**
	 * Loads project from file or from byteArray. Current project will be destoyed.
	 * @param	urlOrData	Path to project file (String or URLRequest) or project binary data (ByteArray)
	 * @param	context		Specify load context data and customize loading operation (for example: relative path for external M3D model, parsing callbacks, etc.)
	 * @param	onComplete	Callbacks when loading is done
	 */
    function loadProject(urlOrData : Dynamic, context : ProjectContext = null, onComplete: IProject3D -> Void = null) : Void;
    
	/**
	 * Saves current project do binary data. After saving project is still exists.
	 * @param	customizator	Put customizator class here for customize save data. Using this class you can affect to saving process.
	 * @param	output			Output type, possible values from Engine3D.enums.IOFormat: Uint8Array, Base64String, Bytes
	 * @return	Binary data for project.
	 * @see pl.pkapusta.engine.common.enums.IOFormat
	 */
    function saveProject(customizator : ProjectSaveCustomizator = null, output: String = "Uint8Array") : Dynamic;
}

