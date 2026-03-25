package pl.pkapusta.engine.model;

import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.model.collision.*;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.model.definition.data.ICollection;
import pl.pkapusta.engine.model.definition.data.IEditAttributes;
import pl.pkapusta.engine.model.handlers.collection.IHandlerCollection;
import pl.pkapusta.engine.model.properties.IProperty;
import pl.pkapusta.engine.model.properties.ISection;
import pl.pkapusta.engine.model.regions.IRegion;
import pl.pkapusta.engine.model.regions.position.*;
import pl.pkapusta.engine.model.selection.*;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IResourceContextHolder;
import pl.pkapusta.engine.project.IProject3D;
import openfl.events.IEventDispatcher;

/**
 * The main interface defining the 3d model available in the scene. This object is used to load M3D, manage the states and properties of the 3d model that is displayed on the stage.
 * 
 * @author Przemysław Kapusta
 */
interface IModel3D extends IEventDispatcher extends IDisposable extends IEmbeddable extends IExtraDataHolder extends IResourceContextHolder {
    
	/**
	 * Returns the definition of the 3d model as an object holding definition.xml
	 */
    function getDescription() : FastXML;  
	
	/**
	 * Returns model3d version
	 */
    function getVersion() : Int;  
	
	/**
	 * Returns true when model3d is ready and its context was created
	 */
    function isContextReady() : Bool;
	
	/**
	 * Returns main project object
	 */
    function getProject() : IProject3D;
	
	/**
	 * Returns the parent 3d model of the given 3d model or null if the given model is the root
	 */
    function getParent() : IModel3D;
	
	/**
	 * Returns the parent region of the given 3d model or null if the given model is the root
	 * @see pl.pkapusta.engine.model.regions.AbstractRegion
	 * @see pl.pkapusta.engine.model.regions.LineRegion
	 * @see pl.pkapusta.engine.model.regions.PointRegion
	 * @see pl.pkapusta.engine.model.regions.SurfaceRegion
	 */
    function getParentRegion() : IRegion;
	
	/**
	 * Returns model3d main general type id
	 */
    function getGeneralType() : String;
	
	/**
	 * Returns model3d general types collection (ex. subtypes)
	 */
    function getGeneralCollection() : ICollection;
	
	/**
	 * Returns handle definitions for some models. Grips are used to specify different places where you can snap a model to another model.
	 */
    function getHandlers() : IHandlerCollection;
	
	/**
	 * Returns a list of available regions for a given 3d model
	 * @see pl.pkapusta.engine.model.regions.AbstractRegion
	 * @see pl.pkapusta.engine.model.regions.LineRegion
	 * @see pl.pkapusta.engine.model.regions.PointRegion
	 * @see pl.pkapusta.engine.model.regions.SurfaceRegion
	 */
    function getRegionList() : Array<IRegion>;
	
	/**
	 * Returns an object describing the position of the model relative to the region of the parent model it is in.
	 * @see pl.pkapusta.engine.model.regions.position.AbstractRegionPosition
	 * @see pl.pkapusta.engine.model.regions.position.SurfaceRegionPosition
	 */
    function getRegionPosition() : AbstractRegionPosition;   
	
	/**
	 * Returns a list of model edit attributes
	 */
    function getEditAttributes() : IEditAttributes;
	
	/**
	 * Returns a list of sections, i.e. groups of properties. Each 3d model contains properties that are grouped into sections. This can be used to group parameters in the user GUI.
	 */
    function getSections() : Array<ISection>;
	
	/**
	 * Returns a list of all model3d available properties
	 */
    function getProperties() : Array<IProperty>;
	
	/**
	 * If true, the model will automatically delete used resources (e.g. textures, mesh) and state from memory each time it is removed from the scene. If false model3d will keep resources and state in memory for reuse when reloaded into the scene.
	 */
    function isAutoDisposeContext() : Bool;
	
	/**
	 * Sets whether the model will automatically clear used resources (e.g. textures, mesh) from memory and the state each time it is removed from the scene. If false model3d will keep resources and state in memory for reuse when reloaded into the scene. If true, the model should destroy its resources after being removed from the scene.
	 * @param	value	true or false
	 * @see isAutoDisposeContext()
	 */
    function setAutoDisposeContext(value : Bool) : Bool;
	
	/**
	 * If true, the model will automatically build its resources when it is loaded into the scene. For example, when it is read from a file for the first time or it is removed from the scene and it destroys its resources because the value of isAutoDisposeContext was true.
	 * @see isAutoDisposeContext()
	 */
    function isAutoBuildContext() : Bool;
	
	/**
	 * Sets whether the model will automatically build its resources when it is loaded into the scene. For example, when it is read from a file for the first time or it is removed from the scene and it destroys its resources because the value of isAutoDisposeContext was true.
	 * @param	value	true or false
	 * @see isAutoDisposeContext()
	 */
	function setAutoBuildContext(value : Bool) : Bool;
	
	/**
	 * Changes the properties of a model3d object
	 * @param	id	The unique ID of the property
	 * @param	value	The value to which we change the property
	 */
    function changeProperty(id : String, value : Any) : Void;
	
	/**
	 * Returns a property of the object
	 * @param	id	The unique ID of the property
	 * @return	Property value
	 */
    function getProperty(id : String) : Any;
	
	/**
	 * Returns information from the model instance, e.g. area
	 * @param	type	The type of information we're asking for
	 * @param	params	Optional input parameters
	 * @return	Information we request
	 */
    function getInfo(type : String, params : Dynamic = null) : Dynamic;
	
	/**
	 * Returns an object that defines the region of the model
	 * @param	id	The unique identifier of the region
	 * @return	IRegion object
	 * @see pl.pkapusta.engine.model.regions.AbstractRegion
	 * @see pl.pkapusta.engine.model.regions.LineRegion
	 * @see pl.pkapusta.engine.model.regions.PointRegion
	 * @see pl.pkapusta.engine.model.regions.SurfaceRegion
	 */
    function getRegion(id : String) : IRegion;
	
	/**
	 * Adding another 3d model as a child to a given model. The function is used for hierarchical arrangement of the model on itself.
	 * @param	model	The instance of the model that is being added
	 * @param	regionId	Identifier of the region in which the object should be added. If no region is specified, the object will be added to the default region for that parent.
	 */
    function addChild(model : IModel3D, regionId : String = null) : Void;
	
	/**
	 * Loads a 3d model from a file or binary data and immediately puts it into the scene.
	 * @param	urlOrData	File path or binary data
	 * @param	regionId	Identifier of the region in which the object should be added. If no region is specified, the object will be added to the default region for that parent.
	 * @return
	 */
    function loadChild(urlOrData : Dynamic, regionId : String = null) : IModel3D;
	
	/**
	 * Checks if you can add a given 3d model as a child. Not every model can be added as a child, eg you cannot add inscriptions directly to the scene.
	 * @param	model	The instance of the model that is being added
	 * @param	regionId	Identifier of the region in which the object should be added. If no region is specified, the object will be added to the default region for that parent.
	 * @param	checkChildLimit	If true, it also checks the limit of added objects. In some cases, there may only be one object as a child.
	 * @return	true if a 3d model can be added as a child
	 */
    function canAddChild(model : IModel3D, regionId : String = null, checkChildLimit : Bool = true) : Bool;
	
	/**
	 * Removes the model3d child from this parent
	 * @param	model	child model3d
	 */
    function removeChild(model : IModel3D) : Void;
	
	/**
	 * If this 3d model is brought into the scene as a child of another 3d model, it removes it from the parent
	 */
    function removeFromParent() : Void;
	
	/**
	 * Checks if this 3d model has a given child
	 * @param	model	child model3d
	 * @return	true or false
	 */
    function hasChild(model : IModel3D) : Bool;
	
	/**
	 * Returns the collision shape of an object to calculate whether it collides with another object in a given region. The functionality has not been implemented!
	 * @param	name	collision name ID
	 * @return	collision shape
	 */
    function getCollisionShape(name : String) : AbstractCollisionShape;
	
	/**
	 * Clones the model and its state to a new instance
	 * @return	Copy of this model3d
	 */
    function clone() : IModel3D;
	
	/**
	 * Returns an object describing a 3d model property based on the property ID
	 * @param	id	property ID
	 * @return	an object describing a 3d model property
	 */
    function propertyById(id : String) : IProperty;
	
	/**
	 * Checks if model3d has a property with the given ID
	 * @param	id	property ID
	 * @return	true or false
	 */
    function hasProperty(id : String) : Bool;
	
	/**
	 * Clears the resources and state of this model and all of its children from memory.
	 */
    function disposeWithChildren() : Void;
	
	/**
	 * Returns an object describing the 3d model selection.
	 * @see pl.pkapusta.engine.model.selection.AbstractSelection
	 * @see pl.pkapusta.engine.model.selection.StandardSelection
	 * @see pl.pkapusta.engine.model.selection.SurfaceSelection
	 */
	function getSelectionObject() : AbstractSelection;
	
	/**
	 * Returns true if the model is ready to be inserted into the scene
	 */
	function isReady() : Bool;
	
	/**
	 * Returns true if the model is currently selected
	 */
	function isSelected() : Bool;
	
	/**
	 * Marks or unmarks an object. If another object is selected at the moment, it deselects it.
	 * @param	value	true or false
	 */
	function setSelected(value : Bool) : Bool;
	
	/**
	 * Returns whether the 3d model is interactive. By default, each model is interactive, but you can set it to stop being so. A model that is not interactive does not react to user interactions, i.e. selecting, moving, etc.
	 * @return	true or false
	 * @see setInteractive(value : Bool)
	 */
	function isInteractive() : Bool;
	
	/**
	 * Set whether the 3d model is interactive. By default, each model is interactive, but you can set it to stop being so. A model that is not interactive does not react to user interactions, i.e. selecting, moving, etc.
	 * @param	value	true or false
	 */
	function setInteractive(value : Bool) : Bool;
	
}

