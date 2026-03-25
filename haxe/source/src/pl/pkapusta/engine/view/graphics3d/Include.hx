package pl.pkapusta.engine.view.graphics3d;

import pl.pkapusta.engine.view.graphics3d.algorithms.Triangulator;
import pl.pkapusta.engine.view.graphics3d.primitives.deprecated.ExtendPlaneGeometry;
import pl.pkapusta.engine.view.graphics3d.primitives.deprecated.SlopedTombCubeGeometry;
import pl.pkapusta.engine.view.graphics3d.primitives.deprecated.TombCubeGeometry;
import pl.pkapusta.engine.view.graphics3d.primitives.deprecated.TombSinCubeGeometry;
import pl.pkapusta.engine.view.graphics3d.primitives.PathGeometry;
import pl.pkapusta.engine.view.graphics3d.primitives.RectangleGeometry;

/**
	 * @author Przemysław Kapusta
	 */
class Include
{
    
    //algorithms
    private var triangulator : Triangulator;
    
    //primitives
    private var pathGeometry : PathGeometry;
    private var rectangleGeometry : RectangleGeometry;
    
    //primitives deprecated
    private var extendPlaneGeometry : ExtendPlaneGeometry;
    private var slopedTombCubeGeometry : SlopedTombCubeGeometry;
    private var tombCubeGeometry : TombCubeGeometry;
    private var tombSinCubeGeometry : TombSinCubeGeometry;

    public function new()
    {
    }
}

