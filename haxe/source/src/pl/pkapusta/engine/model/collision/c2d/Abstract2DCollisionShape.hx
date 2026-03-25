package pl.pkapusta.engine.model.collision.c2d;

import box2D.dynamics.B2World;
import pl.pkapusta.engine.common.exteption.predefined.AbstractMethodException;
import pl.pkapusta.engine.model.collision.AbstractCollisionShape;
import pl.pkapusta.engine.model.Model3D;

/**
	 * @author Przemysław Kapusta
	 */
class Abstract2DCollisionShape extends AbstractCollisionShape
{
    private var world : B2World;
    
    public function new(model : Model3D, name : String)
    {
        super(model, name);
    }
    
    private function setCollisionWorld(world : B2World) : Void
    {
        if (world == this.world)
        {
            return;
        }
        if (this.world != null)
        {
            destroyShape();
            this.world = null;
        }
        this.world = world;
        if (this.world != null)
        {
            createShape();
        }
    }
    
    override private function rebuildShape() : Void
    {
        if (world != null)
        {
            destroyShape();
            createShape();
        }
    }
}

