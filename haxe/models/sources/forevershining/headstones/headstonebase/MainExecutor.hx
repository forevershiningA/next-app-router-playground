package forevershining.headstones.headstonebase;

import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.graphics.path.NormalsDirection;
import pl.pkapusta.engine.graphics.path.ScalingDiscretePath;
import pl.pkapusta.engine.model.executors.file.proxies.IPointRegionProxy;
import openfl.geom.Point;
import forevershining.headstones.AbstractHeadstoneModel3D;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Executor")
class MainExecutor extends AbstractHeadstoneModel3D
{
    
    private var headstoneRegion : IPointRegionProxy;
    
    public function new()
    {
        super();
        _width = 400;
        _height = 200;
        _depth = 80;
    }
    
    override private function buildModelPath() : ScalingDiscretePath
    //build model
    {
        
        var points : Array<DiscretePoint> = new Array<DiscretePoint>();
        points.push(
                new DiscreteCornerPoint(200, 400)
        );
        points.push(
                new DiscreteCornerPoint(200, 0)
        );
        points.push(
                new DiscreteCornerPoint(-200, 0)
        );
        points.push(
                new DiscreteCornerPoint(-200, 400)
        );
        
        
        return new ScalingDiscretePath(points, false, false, NormalsDirection.ANTICLOCKWISE);
    }
    
    override private function buildRegions() : Void
    {
        headstoneRegion = try cast(model.getRegion("headstone"), IPointRegionProxy) catch(e:Dynamic) null;
    }
    
    override private function updateRegions() : Void
    {
        if (headstoneRegion != null)
        {
            headstoneRegion.moveTo(0, _height, 0);
        }
    }
}

