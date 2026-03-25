package pl.pkapusta.engine.project.data.triggers;


/**
 * Programmable abstract trigger for solving dependencies when loading a scene.
 * 
 * @author Przemysław Kapusta
 */
class ResourceLoadTriggerType
{
    
    public static inline var BASE : String = "base";
    public static inline var PROPERTY_VALUE : String = "propertyValue";
    public static inline var TEXTURE_VALUE : String = "textureValue";
    public static inline var BITMAP_TEXTURE_VALUE : String = "bitmapTextureValue";
    public static inline var ATF_TEXTURE_VALUE : String = "atfTextureValue";
    public static inline var BYTE_ARRAY_VALUE : String = "byteArrayValue";
    public static inline var DISPLAY_OBJECT_VALUE : String = "displayObjectValue";
    public static inline var MFONT_VALUE : String = "mfontValue";

    public function new()
    {
    }
}

