package pl.pkapusta.engine.project.data.parsers.project3d;

import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.IParserReader;
import pl.pkapusta.engine.common.data.parsers.IParserWriter;
import pl.pkapusta.engine.common.interfaces.IDisposable;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.project.data.ProjectSaveCustomizator;
import pl.pkapusta.engine.project.Project3D;
import pl.pkapusta.engine.project.utils.Project3DModelsIterator;
import haxe.ds.Map;
import haxe.ds.ObjectMap;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
class Project3DEmbedModelsParser implements IParserWriter implements IParserReader implements IParserEmbedWriter implements IParserEmbedReader implements IDisposable
{
    
    public var writeCustomizator : ProjectSaveCustomizator = null;
    public var uniqueObjectPointers : ObjectMap<Dynamic, Int>;
    public var uniqueIntPointers : Map<Int, Int>;
    public var cacheBytes : ByteArray;
    
	private var allocatedReadBytes : Map<Int, ByteArray>;
    private var allocatedReadObjects : Map<Int, Dynamic>;
    
    public function new()
    {
        uniqueObjectPointers = new ObjectMap<Dynamic, Int>();
		uniqueIntPointers = new Map<Int, Int>();
        allocatedReadBytes = new Map<Int, ByteArray>();
        allocatedReadObjects = new Map<Int, Dynamic>();
        cacheBytes = new ByteArray();
    }
    
    public function readModelStream(data : ByteArray, pointer : Int) : ByteArray
    //TODO: Write reading
    {
        
        return null;
    }
    
    public function writeStream(data : ByteArray) : Void
    {
        cacheBytes.position = 0;
        data.writeBytes(cacheBytes);
    }
    
    public function writeEmbedObject(uniqueObject : Dynamic, data : ByteArray) : Int
    {
		if (Std.is(uniqueObject, Int)) {
			if (uniqueIntPointers.exists(uniqueObject)) {
				return uniqueIntPointers.get(uniqueObject);
			}
		} else {
			if (uniqueObjectPointers.exists(uniqueObject)) {
				return uniqueObjectPointers.get(uniqueObject);
			}
		}
        
        var pointer : Int = cacheBytes.position;
        
        data.position = 0;
        cacheBytes.writeUnsignedInt(data.length);
        cacheBytes.writeBytes(data);
        
		if (Std.is(uniqueObject, Int)) {
			uniqueIntPointers.set(uniqueObject, pointer);
		} else {
			uniqueObjectPointers.set(uniqueObject, pointer);
		}
        
        return pointer;
    }
    
    public function embedPointerByUniqueObject(uniqueObject : Dynamic) : Int
    {
		if (Std.is(uniqueObject, Int)) {
			if (uniqueIntPointers.exists(uniqueObject)) {
				return uniqueIntPointers.get(uniqueObject);
			}
		} else {
			if (uniqueObjectPointers.exists(uniqueObject)) {
				return uniqueObjectPointers.get(uniqueObject);
			}
		}
        return -1;
    }
    
    public function readEmbedObject(pointer : Int) : ByteArray
    {
        if (allocatedReadBytes.exists(pointer))
        {
            return allocatedReadBytes.get(pointer);
        }
        
        cacheBytes.position = pointer;
        var length : Int = cacheBytes.readUnsignedInt();
        //trace("readEmbedObject length: " + length);
        var bytes : ByteArray = new ByteArray();
        cacheBytes.readBytes(bytes, 0, length);
        
        allocatedReadBytes.set(pointer, bytes);
        
        return bytes;
    }
    
    public function allocateObject(pointer : Int, object : Dynamic) : Void
    {
        allocatedReadObjects.set(pointer, object);
    }
    
    public function hasAllocatedObject(pointer : Int) : Bool
    {
        return (allocatedReadObjects.exists(pointer));
    }
    
    public function getAllocatedObject(pointer : Int) : Dynamic
    {
        if (hasAllocatedObject(pointer))
        {
            return allocatedReadObjects.get(pointer);
        }
        return null;
    }
    
    public function readStream(data : ByteArray) : Void
    {
        cacheBytes = new ByteArray();
        cacheBytes.writeBytes(data, data.position);
    }
    
    public function dispose() : Void
    {
        if (cacheBytes != null)
        {
            cacheBytes.clear();
            cacheBytes = null;
        }
        uniqueObjectPointers = null;
		uniqueIntPointers = null;
		allocatedReadBytes = null;
        allocatedReadObjects = null;
    }
}

