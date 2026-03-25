package pl.pkapusta.engine.model.executors.file.proxies;

import openfl.geom.Rectangle;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.file.proxies.ISurfaceSelectionProxy")
interface ISurfaceSelectionProxy extends ISelectionProxy
{
    
    var area(get, never) : Rectangle;
    
    function setArea(area : Rectangle) : Void;
	function isResizable() : Bool;
	function setResizable(value : Bool) : Bool;
    function setRotation(rotation : Float) : Void;
	
}

