package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.model.handlers.AbstractHandler;
import pl.pkapusta.engine.model.handlers.collection.HandlerCollection;
import pl.pkapusta.engine.model.handlers.collection.IHandlerCollection;
import pl.pkapusta.engine.model.handlers.IHandler;
import pl.pkapusta.engine.model.handlers.PointHandler;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
class HandlerCollectionProxy implements IHandlerCollectionProxy
{
    private var _handlerCollection : IHandlerCollection;
    
    private var _handlerProxyDict : Map<String, IHandlerProxy>;
    private var _handlerProxyList : Array<IHandlerProxy>;
    
    public function new(handlerCollection : IHandlerCollection)
    {
        _handlerCollection = handlerCollection;
        _handlerProxyDict = new Map<String, IHandlerProxy>();
    }
    
    public function getAll() : Array<IHandlerProxy>
    {
        if (_handlerProxyList != null)
        {
            return _handlerProxyList;
        }
        _handlerProxyList = new Array<IHandlerProxy>();
        var handlers : Array<IHandler> = _handlerCollection.getAll();
        var i : Int = 0;
        while (i < handlers.length)
        {
            _handlerProxyList.push(HandlerProxy.factory(try cast(handlers[i], AbstractHandler) catch(e:Dynamic) null));
            i++;
        }
        return _handlerProxyList;
    }
    
    public function isEmpty() : Bool
    {
        return _handlerCollection.isEmpty();
    }
    
    public function contains(id : String) : Bool
    {
        return _handlerCollection.contains(id);
    }
    
    public function getById(id : String) : IHandlerProxy
    {
        if (_handlerProxyDict.exists(id))
        {
            return _handlerProxyDict.get(id);
        }
        else
        {
            var hp : IHandlerProxy = HandlerProxy.factory(try cast(_handlerCollection.getById(id), AbstractHandler) catch(e:Dynamic) null);
            _handlerProxyDict.set(id, hp);
            return hp;
        }
    }
    
    public function getCount() : Int
    {
        return _handlerCollection.count;
    }
    
    public function getBaseInstance() : Dynamic
    {
        return _handlerCollection;
    }
    
    public function dispose() : Void
    {
        _handlerCollection = null;
        if (_handlerProxyDict != null)
        {
            for (handler in _handlerProxyDict)
            {
                handler.dispose();
            }
            _handlerProxyDict = null;
        }
        if (_handlerProxyList != null)
        {
            var i : Int = 0;
            while (i < _handlerProxyList.length)
            {
                _handlerProxyList[i].dispose();
                i++;
            }
            _handlerProxyList = null;
        }
    }
}

