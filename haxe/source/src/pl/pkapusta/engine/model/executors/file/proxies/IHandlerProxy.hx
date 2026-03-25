package pl.pkapusta.engine.model.executors.file.proxies;

import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.file.proxies.IHandlerProxy")
interface IHandlerProxy extends IBaseProxy
{
    
    
    var id(get, never) : String;    
    var type(get, never) : String;    
    var position(get, never) : Vector3D;    
    var rotation(get, never) : Vector3D;

    function moveTo(x : Float, y : Float, z : Float) : Void
    ;
    function rotateTo(x : Float, y : Float, z : Float) : Void
    ;
}

