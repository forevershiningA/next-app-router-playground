package pl.pkapusta.engine.model;

import pl.pkapusta.engine.common.InfoType;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.ModelInfoType")
class ModelInfoType extends InfoType
{
    
	/**
	 * Returns stone area in square meters
	 */
    public static inline var MODEL_STONE_AREA_SQUARE_METERS : String = "stone_area_square_meters";
	
	/**
	 * Returns stone volume in cubic meters
	 */
    public static inline var MODEL_STONE_VOLUME_CUBIC_METERS : String = "stone_volume_cubic_meters";

	@:dox(hide)
    public function new()
    {
        super();
    }
}

