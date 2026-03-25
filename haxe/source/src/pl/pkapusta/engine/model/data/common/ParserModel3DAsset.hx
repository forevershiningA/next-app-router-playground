package pl.pkapusta.engine.model.data.common;

import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class ParserModel3DAsset
{
    
    public static inline var TYPE_UNDEFINED : Int = 0;
    public static inline var TYPE_3D_OBJECT : Int = 1;
    public static inline var TYPE_TEXTURE : Int = 2;
    public static inline var TYPE_FLASH_OBJECT : Int = 3;
    
    public var id : String;
    public var type : Int;
    public var data : ByteArray;
    public var executor : ByteArray = null;

    public function new()
    {
    }
}

