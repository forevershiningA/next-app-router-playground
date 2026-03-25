package pl.pkapusta.engine.model.selection;

import away3d.containers.ObjectContainer3D;
import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.model.Model3D;
import openfl.events.EventDispatcher;

/**
	 * @author Przemysław Kapusta
	 */
@:keepSub
@:expose("Engine3D.AbstractSelection")
class AbstractSelection extends EventDispatcher implements IDisposable
{
    public var active(get, never) : Bool;

    
    public static inline var TYPE_STANDARD : String = "standard";
    public static inline var TYPE_SURFACE : String = "surface";
    
    public static function factory(model : Model3D, container : ObjectContainer3D, settings : FastXML) : AbstractSelection
    {
        var type : String = settings.att.type;
        switch (type)
        {
            case TYPE_STANDARD:return new StandardSelection(model, container, settings);
            case TYPE_SURFACE:return new SurfaceSelection(model, container, settings);
        }
        return null;
    }
    
    private var _active : Bool = false;
    
    private var model : Model3D;
    private var container : ObjectContainer3D;
    
    public function new(model : Model3D, container : ObjectContainer3D, settings : FastXML = null)
    {
        super();
        this.model = model;
        this.container = container;
        if (settings != null)
        {
            parseSettings(settings);
        }
    }
    
    public function activate() : Void
    {
        if (_active)
        {
            return;
        }
        _active = true;
        doActivate();
    }
    
    public function deactivate() : Void
    {
        if (!_active)
        {
            return;
        }
        _active = false;
        doDeactivate();
    }
	
	/** @abstract */
	public function getType() : String {
		throw new AbstractMethodException();
	}
    
    /** @abstract */
    private function parseSettings(data : FastXML) : Void
    {
        throw new AbstractMethodException();
    }
    
    /** @abstract */
    private function doActivate() : Void
    {
        throw new AbstractMethodException();
    }
    
    /** @abstract */
    private function doDeactivate() : Void
    {
        throw new AbstractMethodException();
    }
    
    
    private function get_active() : Bool
    {
        return _active;
    }
    
    public function dispose() : Void
    {
        _active = false;
        model = null;
        container = null;
    }
}

