package pl.pkapusta.engine.project.data.structure.storage;

import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.project.data.structure.storage.IProjectStorageObject")
interface IProjectStorageObject
{

    
    function createStorageObject() : IProjectStorageObject
    ;
    
    function readString(key : String, def : String = null) : String
    ;
    function readNumber(key : String, def : Null<Float> = null) : Null<Float>
    ;
    function readInt(key : String, def : Int = 0) : Int
    ;
    function readByteArray(key : String) : ByteArray
    ;
    function readSubAdapter(key : String) : IProjectStorageObject
    ;
    
    function writeString(key : String, value : String) : Void
    ;
    function writeNumber(key : String, value : Float) : Void
    ;
    function writeInt(key : String, value : Int) : Void
    ;
    function writeByteArray(key : String, value : ByteArray) : Void
    ;
    function writeSubAdapter(key : String, value : IProjectStorageObject) : Void
    ;
}

