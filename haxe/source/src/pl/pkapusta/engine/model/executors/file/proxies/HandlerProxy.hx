package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.model.handlers.AbstractHandler;
import pl.pkapusta.engine.model.handlers.PointHandler;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
class HandlerProxy implements IHandlerProxy
{
    public var id(get, never) : String;
    public var type(get, never) : String;
    public var position(get, never) : Vector3D;
    public var rotation(get, never) : Vector3D;
    
    public static function factory(handler : AbstractHandler) : IHandlerProxy
    {
        if (handler == null)
        {
            return null;
        }
        if (Std.is(handler, PointHandler))
        {
            return new PointHandlerProxy(handler);
        }
        return new HandlerProxy(handler);
    }
    
    private var _handler : AbstractHandler;
    
    public function new(handler : AbstractHandler)
    {
        _handler = handler;
    }
    
    private function get_id() : String
    {
        return _handler.id;
    }
    
    private function get_type() : String
    {
        return _handler.type;
    }
    
    private function get_position() : Vector3D
    {
        return _handler.position;
    }
    
    private function get_rotation() : Vector3D
    {
        return _handler.rotation;
    }
    
    public function moveTo(x : Float, y : Float, z : Float) : Void
    {
        _handler.moveTo(x, y, z);
    }
    
    public function rotateTo(x : Float, y : Float, z : Float) : Void
    {
        _handler.rotateTo(x, y, z);
    }
    
    public function getBaseInstance() : Dynamic
    {
        return _handler;
    }
    
    public function dispose() : Void
    {
        _handler = null;
    }
}

