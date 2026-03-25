package forevershining.headstones.headstone_37;

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
			"M434.8,261.6c0.7,0.3,14.6,6.7,21.3,9" +
			"c9.8,3.4,19.9,5.6,30.2,6.6h16.5c1.8-0.1,3.6,0.1,5.5,0.4c1,0.1,1.9,0.6,2.7,1.3c0.5,0.7,0.8,1.5,0.8,2.5l0,117.6h-624.9l0-117.6" +
			"c0-0.9,0.3-1.7,0.8-2.5c0.8-0.8,1.7-1.2,2.7-1.3c1.9-0.4,3.8-0.5,5.5-0.4h16.5c10.3-1,20.4-3.2,30.2-6.6" +
			"c6.9-2.4,13.7-5.3,20.3-8.6c0.7-0.3,1.4-0.7,2-1c-1.2-0.8-2.4-1.7-3.5-2.5c-12.5-9.1-24.2-19.2-34.9-30.4" +
			"c-11.1-11.8-20.7-24.7-28.8-38.6c-10.1-16.8-16.9-34.9-20.6-54.2c-1.7-8.5-2.5-17.2-2.4-25.9c0-8.7,0.9-17.3,2.7-25.8" +
			"c1.6-8,4.1-15.6,7.4-22.9c3.4-7.4,7.6-14.2,12.5-20.6c5.1-6.5,10.8-12.2,17.3-17.2c6.5-5,13.5-9.2,21.1-12.4" +
			"c9.3-4,18.9-6.7,28.9-8.2c10-1.5,20-1.7,30-0.6C5.6,2.5,16,4.7,26.2,7.9s20,7.4,29.3,12.6c9.3-5.2,19.1-9.4,29.3-12.6" +
			"s20.6-5.4,31.2-6.5c10-1.1,20-0.9,30,0.6c10,1.5,19.6,4.2,28.9,8.2c7.5,3.3,14.6,7.4,21.1,12.4c1.2,0.9,2.3,1.8,3.4,2.7" +
			"c1-0.8,2-1.6,3-2.4l10.2-7c3.6-2.1,7.4-4.1,11.3-5.7c9.3-4,18.9-6.7,28.9-8.2c10-1.5,20-1.7,30-0.6c10.6,1.1,21,3.3,31.2,6.5" +
			"c10.2,3.2,20,7.4,29.3,12.6c9.3-5.2,19.1-9.4,29.3-12.6c10.2-3.2,20.6-5.4,31.2-6.5c10-1.1,20-0.9,30,0.6" +
			"c10,1.5,19.6,4.2,28.9,8.2c7.5,3.2,14.5,7.4,21,12.4c6.5,5,12.3,10.8,17.3,17.2c5,6.4,9.1,13.3,12.5,20.6c3.4,7.3,5.9,15,7.5,22.9" +
			"c1.7,8.5,2.6,17.1,2.7,25.8c0,8.7-0.8,17.4-2.4,25.9c-3.7,19.4-10.6,37.4-20.6,54.2c-7.8,13.5-17,26.1-27.4,37.8" +
			"c-10.4,11.6-22,22.1-34.6,31.3C437.7,259.5,436.2,260.6,434.8,261.6z";
    }
	
    override private function buildInnerPath() : String {
        return
			"M433.1,262.8c-11.8,8.5-23.7,16.3-36.2,23.8l-53.4,31.7l-51.4-31.7" +
			"c-14.6-8.9-28.7-18.2-42.4-28.1c-12.5-9.1-24.2-19.2-34.9-30.4c-4.9-5.3-9.5-10.7-13.8-16.3c5-6.8,9.6-13.9,13.9-21.3" +
			"c5-8.5,9.3-17.3,12.8-26.5c3.5-9.2,6.2-18.6,8-28.3c1.7-8.7,2.5-17.5,2.4-26.3c0-8.9-0.9-17.6-2.7-26.3" +
			"c-1.7-8.1-4.2-15.8-7.6-23.3c-3.4-7.5-7.7-14.5-12.7-21c-3.8-4.8-7.9-9.2-12.5-13.2l-1.6,1.3c4.6,4,8.7,8.4,12.5,13.2" +
			"c5,6.4,9.1,13.3,12.5,20.6c3.4,7.3,5.9,15,7.5,22.9c1.7,8.5,2.6,17.1,2.6,25.8c0.1,8.7-0.7,17.4-2.4,25.9" +
			"c-3.7,19.3-10.6,37.4-20.6,54.2c-7.8,13.5-16.9,26.1-27.3,37.8c-10.5,11.6-22,22.1-34.6,31.3c-13.6,10-27.7,19.4-42.2,28.1" +
			"l-53.4,31.7L4.1,286.6C-8.6,278.9-21,270.7-33,262.3l-2,1.1c12.3,8.7,25.1,17.1,38.1,25l52.5,32.3l54.4-32.3" +
			"c14.7-8.8,28.8-18.2,42.3-28.2c18-13.2,33.8-28.8,47.3-46.7c4.4,5.6,8.9,11,13.7,16c10.7,11.3,22.4,21.5,35.1,30.7" +
			"c13.9,10,28,19.4,42.5,28.2l52.4,32.3l54.5-32.3c12.9-7.7,25.2-15.9,37.2-24.6L433.1,262.8z";
    }

    public function new() {
        super();
    }
	
}

