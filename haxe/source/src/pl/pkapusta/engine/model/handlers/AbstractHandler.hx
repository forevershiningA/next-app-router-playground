package pl.pkapusta.engine.model.handlers;

import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import pl.pkapusta.engine.model.handlers.exceptions.InvalidHandlerTypeException;
import pl.pkapusta.engine.model.handlers.IHandler;
import pl.pkapusta.engine.model.handlers.PointHandler;
import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.geom.Matrix3D;
import openfl.geom.Vector3D;

class AbstractHandler extends EventDispatcher implements IHandler
{
    public var position(get, never) : Vector3D;
    public var rotation(get, never) : Vector3D;
    public var id(get, never) : String;
    public var type(get, never) : String;

    
    public static inline var TYPE_POINT : String = "point";
    
    public static function buildHandler(data : Dynamic) : AbstractHandler
    {
        if (Std.is(data, FastXML) || Std.is(data, String))
        {
            var d : FastXML;
            if (Std.is(data, String))
            {
                d = new FastXML(data);
            }
            else
            {
                d = data;
            }
            return buildFromXML(d);
        }
        return null;
    }
    private static function buildFromXML(data : FastXML) : AbstractHandler
    {
        var type : String = data.att.type;
        switch (type)
        {
            case TYPE_POINT:
                return new PointHandler(data);
            default:
                ExceptionManager.Throw(new InvalidHandlerTypeException());
                return null;
        }
        return null;
    }
    
    private var _id : String;
    private var _position : Vector3D;
    private var _rotation : Vector3D;
    
    public function new(data : Dynamic)
    {
        super();
        if (Std.is(data, FastXML) || Std.is(data, FastXML))
        {
            parseFromXML(data);
        }
    }
    
    private function parseFromXML(data : FastXML) : Void
    {
        _id = data.att.id;
        _position = getVector3DFromXMLArrtibutes(data.nodes.position.get(0));
        _rotation = getVector3DFromXMLArrtibutes(data.nodes.rotation.get(0));
    }
    
    private function getVector3DFromXMLArrtibutes(xmlNode : FastXML, def : Vector3D = null) : Vector3D
    {
        if (def == null)
        {
            def = new Vector3D(0, 0, 0, 0);
        }
        if (xmlNode == null)
        {
            return def.clone();
        }
        return new Vector3D(
        ((xmlNode.att.x != null)) ? as3hx.Compat.parseFloat(xmlNode.att.x) : def.x, 
        ((xmlNode.att.y != null)) ? as3hx.Compat.parseFloat(xmlNode.att.y) : def.y, 
        ((xmlNode.att.z != null)) ? as3hx.Compat.parseFloat(xmlNode.att.z) : def.z, 
        ((xmlNode.att.w != null)) ? as3hx.Compat.parseFloat(xmlNode.att.w) : def.w);
    }
    
    private function get_position() : Vector3D
    {
        return _position;
    }
    
    private function get_rotation() : Vector3D
    {
        return _rotation;
    }
    
    private function get_id() : String
    {
        return _id;
    }
    
    public function moveTo(x : Float, y : Float, z : Float) : Void
    {
        _position.x = x;
        _position.y = y;
        _position.z = z;
        //_regionContainer.moveTo(_position.x, _position.y, _position.z);
        dispatchEvent(new Event(Event.CHANGE));
    }
    
    public function rotateTo(x : Float, y : Float, z : Float) : Void
    {
        _rotation.x = x;
        _rotation.y = y;
        _rotation.z = z;
        //_regionContainer.rotateTo(_rotation.x, _rotation.y, _rotation.z);
        dispatchEvent(new Event(Event.CHANGE));
    }
    
    private function get_type() : String
    {
        throw new AbstractMethodException();
        return null;
    }
}

