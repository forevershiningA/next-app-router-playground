package pl.pkapusta.engine.model.regions.bounds;

import box2D.collision.shapes.B2PolygonShape;
import box2D.collision.shapes.B2Shape;
import box2D.dynamics.B2Body;
import box2D.dynamics.B2BodyDef;
import box2D.dynamics.B2FixtureDef;
import box2D.dynamics.B2World;
import pl.pkapusta.engine.model.regions.bounds.AbstractBoundShape;
import openfl.geom.Point;
import openfl.geom.Rectangle;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
class RectangleBoundShape extends AbstractBoundShape
{
    
    private var BOUNDS_WIDTH(default, never) : Float = 50;
    
    private var _bounds : Rectangle;
    private var _snapMargin : Float = 0;
    
    private var _leftBody : B2Body;
    private var _leftShape : B2PolygonShape;
    private var _topBody : B2Body;
    private var _topShape : B2PolygonShape;
    private var _rightBody : B2Body;
    private var _rightShape : B2PolygonShape;
    private var _bottomBody : B2Body;
    private var _bottomShape : B2PolygonShape;
    
    private var _tmpVector : Vector3D = new Vector3D();
    
    public function new(bounds : Rectangle, snapMargin : Float)
    {
        super();
        _bounds = bounds;
        _snapMargin = snapMargin;
    }
    
    public function updateBounds(bounds : Rectangle)
    //trace("RectangleBoundShape::updateBounds");
    {
        
        _bounds = bounds;
        if (world != null)
        {
            destroyBound();
            createBound();
        }
    }
    
    override public function pointToBound(rayPoint : Vector3D, outputPoint : Vector3D) : Void
    {
        if (rayPoint.x < _bounds.left)
        {
            outputPoint.x = _bounds.left;
        }
        else if (rayPoint.x > _bounds.right)
        {
            outputPoint.x = _bounds.right;
        }
        else
        {
            outputPoint.x = rayPoint.x;
        }
        if (rayPoint.y < _bounds.top)
        {
            outputPoint.y = _bounds.top;
        }
        else if (rayPoint.y > _bounds.bottom)
        {
            outputPoint.y = _bounds.bottom;
        }
        else
        {
            outputPoint.y = rayPoint.y;
        }
    }
    
    override public function pointInBound(rayPoint : Vector3D) : Bool
    {
        pointToBound(rayPoint, _tmpVector);
        var distance : Float = Math.sqrt((rayPoint.x - _tmpVector.x) * (rayPoint.x - _tmpVector.x) + (rayPoint.y - _tmpVector.y) * (rayPoint.y - _tmpVector.y));
        return (distance <= _snapMargin);
    }
    
    override private function createBound() : Void
    //trace("RectangleBoundShape::createBound");
    {
        
        
        var def : B2BodyDef;
        var fixdef : B2FixtureDef;
        
        var bw2 : Float = BOUNDS_WIDTH / 2;
        
        def = new B2BodyDef();
        def.position.set(_bounds.left - bw2, _bounds.top + _bounds.height / 2);
        _leftShape = new B2PolygonShape();
        _leftShape.setAsBox(bw2, _bounds.height / 2 + BOUNDS_WIDTH);
        fixdef = new B2FixtureDef();
        fixdef.shape = _leftShape;
        fixdef.density = 0;
        _leftBody = world.createBody(def);
        _leftBody.createFixture(fixdef);
        
        def = new B2BodyDef();
        def.position.set(_bounds.right + bw2, _bounds.top + _bounds.height / 2);
        _rightShape = new B2PolygonShape();
        _rightShape.setAsBox(bw2, _bounds.height / 2 + BOUNDS_WIDTH);
        fixdef = new B2FixtureDef();
        fixdef.shape = _rightShape;
        fixdef.density = 0;
        _rightBody = world.createBody(def);
        _rightBody.createFixture(fixdef);
        
        def = new B2BodyDef();
        def.position.set(_bounds.left + _bounds.width / 2, _bounds.top - bw2);
        _topShape = new B2PolygonShape();
        _topShape.setAsBox(_bounds.width / 2 + BOUNDS_WIDTH, bw2);
        fixdef = new B2FixtureDef();
        fixdef.shape = _topShape;
        fixdef.density = 0;
        _topBody = world.createBody(def);
        _topBody.createFixture(fixdef);
        
        def = new B2BodyDef();
        def.position.set(_bounds.left + _bounds.width / 2, _bounds.bottom + bw2);
        _bottomShape = new B2PolygonShape();
        _bottomShape.setAsBox(_bounds.width / 2 + BOUNDS_WIDTH, bw2);
        fixdef = new B2FixtureDef();
        fixdef.shape = _bottomShape;
        fixdef.density = 0;
        _bottomBody = world.createBody(def);
        _bottomBody.createFixture(fixdef);
        
        #if config_debug
        world.drawDebugData();
		#end
    }
    
    override private function destroyBound() : Void
    {
        world.destroyBody(_leftBody);
        _leftBody = null;
        _leftShape = null;
        
        world.destroyBody(_rightBody);
        _rightBody = null;
        _rightShape = null;
        
        world.destroyBody(_topBody);
        _topBody = null;
        _topShape = null;
        
        world.destroyBody(_bottomBody);
        _bottomBody = null;
        _bottomShape = null;
    }
}

