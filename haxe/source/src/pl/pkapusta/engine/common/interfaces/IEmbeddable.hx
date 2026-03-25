package pl.pkapusta.engine.common.interfaces;


/**
 * @author Przemysław Kapusta
 */
interface IEmbeddable
{
	
    function getDefaultEmbed() : Bool;
	function setDefaultEmbed(value : Bool) : Bool;
    function getEmbedType() : String;
	function setEmbedType(value : String) : String;

}

