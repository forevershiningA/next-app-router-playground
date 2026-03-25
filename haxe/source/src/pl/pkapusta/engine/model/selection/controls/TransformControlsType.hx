package pl.pkapusta.engine.model.selection.controls;


/**
	 * @author Przemysław Kapusta
	 */
class TransformControlsType
{
    
    public static inline var RECTANGLE : Int = 0;
    public static inline var SPHERE : Int = 1;
    public static inline var PLANE : Int = 2;
    
    public static function fromString(type : String) : Int
    {
        switch (type.toLowerCase())
        {
            case "rectangle":return RECTANGLE;
            case "sphere":return SPHERE;
            case "plane":return PLANE;
        }
        return RECTANGLE;
    }

    public function new()
    {
    }
}

