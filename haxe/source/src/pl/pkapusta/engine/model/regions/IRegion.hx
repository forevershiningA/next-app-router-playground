package pl.pkapusta.engine.model.regions;

import pl.pkapusta.engine.model.IModel3D;
import openfl.events.IEventDispatcher;
import openfl.geom.Vector3D;

/**
 * @author Przemysław Kapusta
 */
interface IRegion extends IEventDispatcher {
	
	function getId() : String;
	function getType() : String;
	function getChildLimit() : UInt;
	function getParent() : IModel3D;
	function getPosition() : Vector3D;
	function getRotation() : Vector3D;
	function getChildList() : Array<IModel3D>;

    function canAddChild(child : IModel3D, checkChildLimit : Bool = true) : Bool;
    function addChild(child : IModel3D) : Void;
    function hasChild(child : IModel3D) : Bool;
    function removeChild(child : IModel3D) : Void;
	
}

