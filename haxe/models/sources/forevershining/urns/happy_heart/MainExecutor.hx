package forevershining.urns.happy_heart;

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
        _initialWidth = 294;
        _initialHeight = 307;
        _initialDepth = 78;
        _initialRegionPos = new Vector3D(0, 162, 75);
        _initialRegionRect = new Rectangle(-134, -134, 268, 268);
        _modelContainerPos = new Vector3D(0, _initialHeight / 2, _initialDepth / 2);
    }

    public function new()
    {
        super();
    }
}

