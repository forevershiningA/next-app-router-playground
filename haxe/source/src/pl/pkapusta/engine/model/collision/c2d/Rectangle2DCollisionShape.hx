package pl.pkapusta.engine.model.collision.c2d;

import box2D.collision.shapes.B2PolygonShape;
import box2D.common.math.B2Vec2;
import box2D.dynamics.B2Body;
import box2D.dynamics.B2BodyDef;
import box2D.dynamics.B2FixtureDef;
import pl.pkapusta.engine.model.collision.AbstractCollisionShape;
import pl.pkapusta.engine.model.collision.c2d.Abstract2DCollisionShape;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.position.events.RegionInnerPositionEvent;
import pl.pkapusta.engine.model.regions.position.implementations.IRegionPosition2DPos;
import pl.pkapusta.engine.model.regions.position.implementations.IRegionPosition2DRotation;
import openfl.geom.Point;

/**
	 * @author Przemysław Kapusta
	 */
class Rectangle2DCollisionShape extends Abstract2DCollisionShape
{
    public var width(get, set) : Float;
    public var height(get, set) : Float;
    public var x(get, set) : Float;
    public var y(get, set) : Float;

    
    private var _width : Float;
    private var _height : Float;
    private var _x : Float;
    private var _y : Float;
    
    private var _body : B2Body;
    private var _shape : B2PolygonShape;
    
    public function new(model : Model3D, name : String, width : Float, height : Float, x : Float = 0, y : Float = 0)
    {
        super(model, name);
        _width = width;
        _height = height;
        _x = x;
        _y = y;
    }
    
    override private function createShape() : Void
    {
        var def : B2BodyDef;
        var fixdef : B2FixtureDef;
        
        var posx:Float = 0;
        var posy:Float = 0;
        var rotation : Float = 0;
        if (rp != null)
        {
            if (Std.is(rp, IRegionPosition2DPos))
            {
                posx = cast((rp), IRegionPosition2DPos).x;
                posy = cast((rp), IRegionPosition2DPos).y;
            }
            if (Std.is(rp, IRegionPosition2DRotation))
            {
                rotation = cast((rp), IRegionPosition2DRotation).rotation;
            }
        }
        
        def = new B2BodyDef();
        def.position.set(posx, posy);
        def.fixedRotation = true;
        _shape = new B2PolygonShape();
        _shape.setAsBox(_width / 2, _height / 2);
        fixdef = new B2FixtureDef();
        fixdef.shape = _shape;
        fixdef.density = 0;
        _body = world.createBody(def);
        _body.createFixture(fixdef);
        
        #if config_debug
        world.drawDebugData();
		#end
    }
    
    override private function destroyShape() : Void
    {
        world.destroyBody(_body);
        _body = null;
        _shape = null;
    }
    
    override private function updatePosition() : Void
    {
        if (_body == null)
        {
            return;
        }
        var posx:Float = 0;
        var posy:Float = 0;
        var rotation : Float = 0;
        if (rp != null)
        {
            if (Std.is(rp, IRegionPosition2DPos))
            {
                posx = cast((rp), IRegionPosition2DPos).x;
                posy = cast((rp), IRegionPosition2DPos).y;
            }
            if (Std.is(rp, IRegionPosition2DRotation))
            {
                rotation = cast((rp), IRegionPosition2DRotation).rotation;
            }
        }
        _body.setPosition(new B2Vec2(posx, posy));
        _body.setType(B2Body.b2_dynamicBody);
        world.step(1, 1000, 1000);
        //world.Step(1, 1000, 1000);
        var px : Float = Math.round(_body.getPosition().x * 100) / 100;
        var py : Float = Math.round(_body.getPosition().y * 100) / 100;
        
        _x = px;
        _y = py;
        
        if (rp != null)
        {
            rp.dispatchEvent(new RegionInnerPositionEvent(RegionInnerPositionEvent.CHANGE_INNER_X, _x));
            rp.dispatchEvent(new RegionInnerPositionEvent(RegionInnerPositionEvent.CHANGE_INNER_Y, _y));
        }
        
        _body.setPosition(new B2Vec2(_x, _y));
        
        #if config_debug
        world.drawDebugData();
        #end
        
        as3hx.Compat.setTimeout(function()
                {
                    _body.setType(B2Body.b2_staticBody);
                    #if config_debug
                    world.drawDebugData();
					#end
                }, 0);
    }
    
    public function setSize(width : Float, height : Float) : Void
    {
        if (width == _width && height == _height)
        {
            return;
        }
        _width = width;
        _height = height;
        rebuildShape();
    }
    
    private function get_width() : Float
    {
        return _width;
    }
    
    private function set_width(value : Float) : Float
    {
        if (_width == value)
        {
            return value;
        }
        _width = value;
        rebuildShape();
        return value;
    }
    
    private function get_height() : Float
    {
        return _height;
    }
    
    private function set_height(value : Float) : Float
    {
        if (_height == value)
        {
            return value;
        }
        _height = value;
        rebuildShape();
        return value;
    }
    
    private function get_x() : Float
    {
        return _x;
    }
    
    private function set_x(value : Float) : Float
    {
        if (_x == value)
        {
            return value;
        }
        _x = value;
        rebuildShape();
        return value;
    }
    
    private function get_y() : Float
    {
        return _y;
    }
    
    private function set_y(value : Float) : Float
    {
        if (_y == value)
        {
            return value;
        }
        _y = value;
        rebuildShape();
        return value;
    }
}

