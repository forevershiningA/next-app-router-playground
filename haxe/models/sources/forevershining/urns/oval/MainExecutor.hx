package forevershining.urns.oval;

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
        _initialWidth = 206;
        _initialHeight = 285;
        _initialDepth = 78;
        _initialRegionPos = new Vector3D(0, 149.5, 75);
        _initialRegionRect = new Rectangle(-89.5, -129, 179, 258);
        _modelContainerPos = new Vector3D(0, 0, 0);
    }

    public function new()
    {
        super();
    }
}

