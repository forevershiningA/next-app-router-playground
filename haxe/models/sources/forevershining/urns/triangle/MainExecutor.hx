package forevershining.urns.triangle;

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
        _initialWidth = 242;
        _initialHeight = 209.5;
        _initialDepth = 78;
        _initialRegionPos = new Vector3D(0, 98.5, 75);
        _initialRegionRect = new Rectangle(-99.5, -86, 199, 172);
        _modelContainerPos = new Vector3D(0, 0, _initialDepth);
        _modelContainerRot = new Vector3D(90, 0, 90);
    }

    public function new()
    {
        super();
    }
}

