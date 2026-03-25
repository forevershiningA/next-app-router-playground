package forevershining.urns.slim_heart;

import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import openfl.geom.Rectangle;
import openfl.geom.Vector3D;
import forevershining.urns.AbstractUrnModel3D;

/**
 * @author Przemysław Kapusta
 */
@:expose("Executor")
class MainExecutor extends AbstractUrnModel3D implements IM3DExecutor
{
    
    override private function initializeUrn() : Void
    {
        _initialWidth = 265;
        _initialHeight = 307;
        _initialDepth = 78;
        _initialRegionPos = new Vector3D(0, 160, 75);
        _initialRegionRect = new Rectangle(-119.5, -135, 239, 270);
        _modelContainerPos = new Vector3D(0, _initialHeight / 2, _initialDepth / 2);
    }

    public function new()
    {
        super();
    }
}

