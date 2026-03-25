package forevershining.headstones;

import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.graphics.path.ScalingDiscretePath;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;

/**
 * @author Przemysław Kapusta
 */
class T1InnerLineHeadstoneModel3D extends InnerLineHeadstoneModel3D implements IM3DExecutor implements IM3DExecutorProperty {
	
	override private function buildModelPath() : ScalingDiscretePath {
		
		var reader = new SVGPathReader(buildOuterPath());
        var points : Array<DiscretePoint> = reader.getPoints();
		var path: ScalingDiscretePath = buildScalingDiscretePath(points, getOuterDirection());
		
		reader = new SVGPathReader(buildInnerPath());
		points = reader.getPoints();
		path.addInnerPath(buildScalingDiscretePath(points, getInnerDirection()));
		
		Utils.svgToModelCoordinatesPath(path);
		
		//modelOptions.set("innerCornerRound", 0.8);
		modelOptions.set("hasInnerSide", false);
		modelOptions.set("hasFrontInnerCorner", true);
		modelOptions.set("hasBackInnerCorner", false);
		modelOptions.set("hasBackHoles", false);
		
		return path;
    }
	
	override private function buildSecModelPath() : ScalingDiscretePath {
		
		var reader = new SVGPathReader(buildOuterPath());
        var points : Array<DiscretePoint> = reader.getPoints();
		var path: ScalingDiscretePath = buildScalingDiscretePath(points, getOuterDirection());
		
		reader = new SVGPathReader(buildInnerPath());
		points = reader.getPoints();
		path.addInnerPath(buildScalingDiscretePath(points, getInnerDirection()));
		
		Utils.svgToModelCoordinatesPath(path);
		
		//secModelOptions.set("innerCornerRound", 0.8);
		secModelOptions.set("hasSide", false);
		secModelOptions.set("hasInnerSide", false);
		secModelOptions.set("hasFront", false);
		secModelOptions.set("hasFrontCorner", false);
		secModelOptions.set("hasFrontInnerCorner", false);
		secModelOptions.set("hasFrontCappedHoles", true);
		secModelOptions.set("hasBackInnerCorner", false);
		secModelOptions.set("hasBack", false);
		secModelOptions.set("hasBackCorner", false);
		secModelOptions.set("hasBackInnerCorner", false);
		secModelOptions.set("hasBackCappedHoles", false);
		secModelOptions.set("hasBackHoles", false);
		
		return path;
    }
	
	/** @abstract */
    private function getOuterDirection() : Int {
        throw "Abstract Method!";
    }
	
	/** @abstract */
    private function getInnerDirection() : Int {
        throw "Abstract Method!";
    }
	
	/** @abstract */
    private function buildOuterPath() : String {
        throw "Abstract Method!";
    }
	
		/** @abstract */
    private function buildInnerPath() : String {
        throw "Abstract Method!";
    }
	
    private function buildScalingDiscretePath(points: Array<DiscretePoint>, direction:Int) : ScalingDiscretePath {
        return new ScalingDiscretePath(points, false, false, direction);
    }

	public function new() {
        super();
    }
	
}