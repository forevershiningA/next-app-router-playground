package forevershining.headstones.headstone_9;

import pl.pkapusta.engine.graphics.algorithms.Bezier;
import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.graphics.path.HeadScalingDiscretePath;
import pl.pkapusta.engine.graphics.path.NormalsDirection;
import pl.pkapusta.engine.graphics.path.DiscretePath;
import pl.pkapusta.engine.graphics.path.ScalingDiscretePath;
import openfl.geom.Point;
import forevershining.headstones.InnerLineHeadstoneModel3D;
import forevershining.headstones.SVGPathReader;
import forevershining.headstones.Utils;

/**
 * @author Przemysław Kapusta
 */
@:expose("Executor")
class MainExecutor extends T1InnerLineHeadstoneModel3D {
	
    override private function getOuterDirection() : Int {
        return NormalsDirection.ANTICLOCKWISE;
    }
	
    override private function getInnerDirection() : Int {
        return NormalsDirection.CLOCKWISE;
    }
	
    override private function buildOuterPath() : String {
        return
			"M129.4,380.8c0.6,5.1,1.2,10.8,2,17.1h212.4V110" +
			"c-26.5-20.1-54.1-39.2-82.6-57c-22.1-14.1-45.1-26.5-69-37.3c-10.2-4.5-20.7-8.2-31.5-10.9c-5.3-1.5-10.7-2.3-16.1-2.4l-6.1-0.1" +
			"c-2.9,0-5.5,0.8-7.8,2.4c-2.1,1.5-3.6,3.5-4.5,6l-1.7,3.8c-0.6,1.3-1.3,2.6-2.2,4l-6.6,9.4c-2,2.9-3.3,6.1-3.9,9.5" +
			"c-0.4,3.7-1.8,7.1-4.2,10c-2.4,2.7-5.1,5-8.1,6.8c-2,1.3-3.7,2.9-5.2,4.8c-1.5,1.9-2.6,3.9-3.4,6.2c-0.7,2.2-1,4.5-1,6.9" +
			"c0,2.4,0.3,4.7,1,6.9c0.4,1.2,0.5,2.4,0.5,3.7c-0.1,1-0.4,1.8-0.9,2.6c-0.5,0.8-1.1,1.4-1.9,1.9c-0.9,0.6-1.8,1.2-2.8,1.6" +
			"c-4.4,2.3-8.5,5.1-12.1,8.4c-3.7,3.4-6.8,7.2-9.4,11.4c-2.5,4.3-4.4,8.8-5.8,13.5c-1.4,4.7-2.1,9.6-2.2,14.5" +
			"c-0.3,7,0.9,13.8,3.5,20.3c2.7,6.5,5.9,12.6,9.8,18.3c1.3,2,2.2,4.1,2.5,6.4c0.3,2.4-0.2,4.6-1.3,6.7c-4.5,8.9-7,18.4-7.7,28.4" +
			"c-0.5,9.8,0.1,19.6,1.9,29.3c2.4,13.5,5.9,26.8,10.3,39.8c4.6,14.5,10.5,28.5,17.7,41.9c9.5,18.4,21.5,35,35.9,49.8L129.4,380.8z";
    }
	
    override private function buildInnerPath() : String {
        return
			"M131.1,382.2c3.1,2.9,4.6,4.2,8,6.7l11.1,6.8l6.7-0.8l2.1-5.6" +
			"c0.7-1.7,1.1-3.5,1.3-5.2c1.6-12.2,5.1-23.9,10.4-35c5.4-11,11.9-21.4,19.6-31l14.8-17.6c5-5.7,9.8-11.8,14.4-18.2" +
			"c9-12.5,15.2-26.3,18.6-41.3c3.5-15,3.9-30.1,1.4-45.3c-1.3-7.1-3.3-14.1-5.9-20.9c-2.9-8.3-6.8-16-11.8-23.1" +
			"c-4.2-5.9-8.8-11.5-13.7-16.9c-4.8-5.3-10.3-9.6-16.6-13.1c-1.1-0.5-1.9-1.3-2.4-2.3c-0.3-1.2-0.3-2.4,0.1-3.6" +
			"c1.2-4.5,1.8-9,1.7-13.7c0-4.6-0.7-9.2-2.1-13.6c-1.5-4.4-3.7-8.5-6.4-12.2c-2.8-3.7-6.1-6.9-9.9-9.7c-1.7-1.1-3.1-2.6-4.1-4.4" +
			"c-0.8-1.9-1.2-3.9-0.9-6c0-2.9-0.8-5.5-2.3-8c-1.2-2.2-2.7-4.4-4.4-6.5c-2-2.8-3.4-5.8-4.2-9.2c-1.4-4.8-3-9.6-5-14.4L146,4.4" +
			"l-2.5-0.1l6.1,14.5c1.9,4.6,3.5,9.3,4.8,14.2c0.8,3.7,2.4,7,4.6,10c1.6,1.9,3.1,4,4.3,6.3c1.3,2.1,1.9,4.3,2,6.8" +
			"c-0.2,2.5,0.2,4.8,1.2,7.1c1.2,2.1,2.8,3.9,4.9,5.3c3.6,2.5,6.7,5.6,9.3,9.1s4.7,7.4,6.1,11.6c1.3,4.2,1.9,8.5,2,12.9" +
			"c0.1,4.4-0.5,8.8-1.7,13c-0.5,1.7-0.5,3.4,0,5c0.7,1.6,1.9,2.8,3.5,3.6c6,3.4,11.3,7.6,15.9,12.6c4.9,5.4,9.3,11,13.4,16.7" +
			"c4.9,7,8.7,14.6,11.5,22.6c2.5,6.6,4.5,13.5,5.9,20.7c2.5,14.8,2,29.6-1.4,44.3c-3.4,14.7-9.4,28.2-18.2,40.5" +
			"c-4.5,6.3-9.3,12.3-14.3,18l-14.8,17.6c-7.8,9.8-14.4,20.3-19.9,31.5c-5.4,11.3-9,23.2-10.6,35.7c-0.2,1.5-0.6,3.1-1.3,4.7" +
			"l-1.7,4.6l-4.5,0.6l-10.3-6.7c-3.4-2.4-6.7-5.1-9.8-8L131.1,382.2z";
    }

    public function new() {
        super();
    }
	
}

