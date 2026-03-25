package pl.pkapusta.engine.common.enums;

/**
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.enums.IOFormat")
@:final
class IOFormat {
	
	/**
	 * Uint8 array, convenient for further data processing on the JS side
	 */
	public static inline var Uint8Array : String = "Uint8Array";
	
	/**
	 * String variable with data in base64 format
	 */
    public static inline var Base64String : String = "Base64String";
	
	/**
	 * Byte array
	 */
    public static inline var Bytes : String = "Bytes";

	public function new() {}
	
}