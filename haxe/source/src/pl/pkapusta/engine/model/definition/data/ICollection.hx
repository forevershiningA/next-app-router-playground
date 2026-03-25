package pl.pkapusta.engine.model.definition.data;


/**
	 * @author Przemysław Kapusta
	 */
interface ICollection
{
    
    var count(get, never) : Int;

    function getAll() : Array<String>
    ;
    function isEmpty() : Bool
    ;
    function contains(name : String) : Bool
    ;
}

