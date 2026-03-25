package pl.pkapusta.engine.model.regions.bounds;

import box2D.dynamics.B2DebugDraw;
import box2D.dynamics.B2World;
import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import openfl.geom.Point;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
@:keepSub
class AbstractBoundShape
{
    
    private var world : B2World;
    
    public function new()
    {
    }
    
    /** @abstract */
    public function pointToBound(rayPoint : Vector3D, outputPoint : Vector3D) : Void
    {
        throw new AbstractMethodException();
    }
    
    /** @abstract */
    public function pointInBound(rayPoint : Vector3D) : Bool
    {
        throw new AbstractMethodException();
    }
    
    private function setCollisionWorld(world : B2World) : Void
    {
        if (world == this.world)
        {
            return;
        }
        if (this.world != null)
        {
            destroyBound();
            this.world = null;
        }
        this.world = world;
        if (this.world != null)
        {
            createBound();
        }
    }
    
    /** @abstract */
    private function createBound() : Void
    {
        throw new AbstractMethodException();
    }
    
    /** @abstract */
    private function destroyBound() : Void
    {
        throw new AbstractMethodException();
    }
}

