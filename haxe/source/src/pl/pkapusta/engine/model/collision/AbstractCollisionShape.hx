package pl.pkapusta.engine.model.collision;

import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import pl.pkapusta.engine.model.collision.c2d.Rectangle2DCollisionShape;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.position.AbstractRegionPosition;

/**
	 * @author Przemysław Kapusta
	 */
class AbstractCollisionShape
{
    public var name(get, never) : String;

    
    private static inline var TYPE_RECTANGLE_2D : String = "rectangle_2d";
    
    public static function factoryXML(model : Model3D, data : FastXML) : AbstractCollisionShape
    {
        var res : AbstractCollisionShape = null;
        var type : String = data.att.type;
        switch (type)
        {
            case TYPE_RECTANGLE_2D:
                res = new Rectangle2DCollisionShape(model, data.att.name, ((data.att.width != null)) ? as3hx.Compat.parseFloat(data.att.width) : 0, ((data.att.height != null)) ? as3hx.Compat.parseFloat(data.att.height) : 0, ((data.att.x != null)) ? as3hx.Compat.parseFloat(data.att.x) : 0, ((data.att.y != null)) ? as3hx.Compat.parseFloat(data.att.y) : 0);
        }
        return res;
    }
    
    private var _name : String;
    
    private var model : Model3D;
    private var rp : AbstractRegionPosition;
    
    public function new(model : Model3D, name : String)
    {
        this.model = model;
        _name = name;
    }
    
	@:allow(pl.pkapusta.engine.model.Model3D)
    private function setRegionPositionObject(rp : AbstractRegionPosition) : Void
    {
        this.rp = rp;
    }
    
    /** @abstract */
	@:allow(pl.pkapusta.engine.model.Model3D)
    private function updatePosition() : Void
    {
        throw new AbstractMethodException();
    }
    
    /** @abstract */
    private function createShape() : Void
    {
        throw new AbstractMethodException();
    }
    
    /** @abstract */
    private function destroyShape() : Void
    {
        throw new AbstractMethodException();
    }
    
    /** @abstract */
    private function rebuildShape() : Void
    {
        throw new AbstractMethodException();
    }
    
    private function get_name() : String
    {
        return _name;
    }
}

