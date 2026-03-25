package forevershining.headstones.headstone_27;

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
        return NormalsDirection.CLOCKWISE;
    }
	
    override private function getInnerDirection() : Int {
        return NormalsDirection.CLOCKWISE;
    }
	
    override private function buildOuterPath() : String {
        return
			"M60.8,251c-0.3-0.3-2.1-2.2-2.1-2.2" +
			"C46.6,235.9,36,221.8,27,206.4c-5.5-9.2-10.1-18.8-13.9-28.8c-3.8-10-6.7-20.3-8.7-30.8c-1.8-9.4-2.7-18.9-2.7-28.4s1-19,2.9-28.4" +
			"c1.8-8.7,4.5-17.1,8.2-25.2c3.7-8.1,8.3-15.6,13.7-22.7c5.6-7.1,12-13.4,19.1-18.9c7.1-5.5,14.8-10,23.1-13.6" +
			"C79,5.3,89.6,2.3,100.6,0.7c11-1.6,21.9-1.9,32.9-0.7c11.7,1.2,23.2,3.6,34.4,7.2C179,10.7,189.7,15.3,200,21" +
			"c10.2-5.7,20.9-10.3,32.1-13.9c11.2-3.5,22.6-5.9,34.3-7.2c11-1.2,22-0.9,33,0.7c10.9,1.6,21.5,4.6,31.7,8.9" +
			"c8.3,3.6,16,8.1,23.1,13.6c7.1,5.5,13.5,11.8,19.1,18.9c5.4,7.1,10,14.6,13.7,22.7c3.7,8.1,6.5,16.5,8.3,25.2" +
			"c1.9,9.4,2.9,18.8,3,28.4c0,9.6-0.9,19.1-2.6,28.4c-4.1,21.2-11.6,41-22.6,59.5c-8.6,14.9-18.6,28.7-30.1,41.5" +
			"c-1.1,1.3-2.3,2.5-3.4,3.8l1,2.2c1.5,3.2,3.2,6.3,4.9,9.4c1.3,2.3,2.9,4.5,4.8,6.6c3.5,3.2,7.6,5.3,12.3,6.4" +
			"c5,1.3,10.2,2,15.4,2.3c6.1,0.4,12.4,0.3,18.7-0.3v122.4H204.4v0.1h-8.8v-0.1H3.5V278.2c6.3,0.6,12.6,0.7,18.8,0.3" +
			"c5.2-0.3,10.3-1,15.4-2.3c4.6-1.1,8.7-3.2,12.3-6.4c1.9-2.1,3.5-4.3,4.8-6.6C56.5,260,60.8,251,60.8,251z";
    }
	
    override private function buildInnerPath() : String {
        return
			"M61.2,254.5" +
			"c11.1,11.3,21.7,20.3,34.5,29.6c15.2,11,30.7,21.3,46.7,31l57.6,35.5l59.8-35.5c15.8-9.5,31.3-19.8,46.5-31" +
			"c12.3-9,22.3-17.6,32.7-28.7l-1.1-2.1c-10.6,11.3-20.6,19.9-33,29c-14.8,10.9-30.2,21.2-46.3,30.9L200,347.9l-56.4-34.8" +
			"c-16-9.7-31.5-20-46.6-30.9c-0.5-0.3-1-0.7-1.4-1c0,0-22.7-17.3-33.4-28.8L61.2,254.5z";
    }

    public function new() {
        super();
    }
	
}

