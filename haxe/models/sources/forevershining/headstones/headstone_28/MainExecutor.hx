package forevershining.headstones.headstone_28;

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
        return NormalsDirection.ANTICLOCKWISE;
    }
	
    override private function buildOuterPath() : String {
        return
			"M93.1,305.2c-11-15.7-19.5-32.6-25.4-51C60,231.1,56.3,207.3,56.3,183" +
			"c-0.1-24.3,3.7-48.1,11.3-71.3c3.4-10.5,7.7-20.6,12.9-30.4c5.2-9.8,11.1-19,17.9-27.8c6.2-8.1,13.1-15.4,20.8-22" +
			"s16-12.4,24.9-17.3c8.6-4.7,17.6-8.3,27-10.7C180.6,1.2,190.2,0,200,0c9.8,0,19.4,1.3,28.9,3.7c9.5,2.4,18.5,6,27.1,10.7" +
			"c8.9,4.9,17.2,10.6,24.8,17.3c7.7,6.6,14.6,13.9,20.8,22c6.8,8.7,12.7,17.9,17.9,27.8c5.2,9.8,9.5,19.9,12.9,30.4" +
			"c7.6,23.1,11.4,46.9,11.3,71.3c0.1,24.4-3.7,48.1-11.3,71.3c-6,18.3-14.5,35.3-25.4,51l1.7,1.5l59.2,54.7V400H32.3v-38.6" +
			"l59.2-54.7L93.1,305.2z";
    }
	
    override private function buildInnerPath() : String {
        return
			"M94.3,306.9l4.2,5.6c6.2,8,13.1,15.4,20.8,22c7.7,6.6,16,12.3,24.9,17.2" +
			"c8.6,4.7,17.6,8.3,27,10.7c9.5,2.4,19.1,3.7,28.9,3.7c9.8,0,19.4-1.3,28.9-3.7c9.5-2.4,18.5-6,27.1-10.7" +
			"c8.9-4.9,17.2-10.6,24.8-17.2c7.7-6.6,14.6-14,20.8-22c1.5-1.9,2.9-3.5,4.3-5.7l1.6,1.5c-1.8,2.5-2.4,3.3-4.2,5.5" +
			"c-6.3,8.2-13.3,15.6-21.1,22.3c-7.8,6.7-16.2,12.6-25.2,17.5c-8.8,4.8-18,8.4-27.6,10.9c-9.6,2.5-19.4,3.7-29.4,3.8" +
			"c-10,0-19.8-1.3-29.4-3.8c-9.6-2.5-18.8-6.1-27.6-10.9c-9-5-17.4-10.8-25.2-17.5c-7.8-6.7-14.8-14.1-21.1-22.3" +
			"c-1.7-2.1-2.2-2.8-4.1-5.4L94.3,306.9z";
    }

    public function new() {
        super();
    }
	
}

