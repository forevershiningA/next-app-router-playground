package forevershining.urns.rectangle;

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
        MODEL_SCALING = 2.547 * 10;
        _initialWidth = 200;
        _initialHeight = 270;
        _initialDepth = 78;
        _initialRegionPos = new Vector3D(0, 135, 75);
        _initialRegionRect = new Rectangle(-85, -120, 170, 240);
        _modelContainerPos = new Vector3D(0, 0, _initialDepth);
        _modelContainerRot = new Vector3D(90, 0, 180);
    }

    public function new()
    {
        super();
    }
}

