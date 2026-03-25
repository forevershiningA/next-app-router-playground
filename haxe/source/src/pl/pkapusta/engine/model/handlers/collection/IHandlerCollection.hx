package pl.pkapusta.engine.model.handlers.collection;

import pl.pkapusta.engine.model.handlers.IHandler;

interface IHandlerCollection
{
    
    var count(get, never) : Int;

    function getAll() : Array<IHandler>
    ;
    function isEmpty() : Bool
    ;
    function contains(id : String) : Bool
    ;
    function getById(id : String) : IHandler
    ;
}

