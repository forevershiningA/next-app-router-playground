package pl.pkapusta.engine.common.enums;


/**
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.enums.EmbedType")
@:final
class EmbedType {
    
	/**
	 * The default value that determines whether the object is embeddable or not, depending on the settings of the entire project
	 */
    public static inline var DEFAULT : String = "default";
	
	/**
	 * The model will be saved in embedded mode. So the binary data defining the model and all its properties will be saved in the project.
	 */
    public static inline var EMBEDDED : String = "embedded";
	
	/**
	 * The model will not be saved in embedded mode. So in the project, the only path to the resource with the model and the paths to resources defining its properties will be saved.
	 */
    public static inline var NO_EMBEDDED : String = "no_embedded";

    public function new() {}
	
}

