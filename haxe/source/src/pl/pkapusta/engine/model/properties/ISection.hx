package pl.pkapusta.engine.model.properties;


/**
	 * @author Przemysław Kapusta
	 */
interface ISection
{
    
    
    var label(get, never) : String;    
    var id(get, never) : String;    
    var properties(get, never) : Array<IProperty>;

}

