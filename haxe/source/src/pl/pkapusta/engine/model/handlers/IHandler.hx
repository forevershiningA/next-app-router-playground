package pl.pkapusta.engine.model.handlers;

import openfl.events.IEventDispatcher;
import openfl.geom.Vector3D;

interface IHandler extends IEventDispatcher
{
    
    var position(get, never) : Vector3D;    
    var rotation(get, never) : Vector3D;    
    var id(get, never) : String;    
    var type(get, never) : String;

    function moveTo(x : Float, y : Float, z : Float) : Void
    ;
    function rotateTo(x : Float, y : Float, z : Float) : Void
    ;
}

