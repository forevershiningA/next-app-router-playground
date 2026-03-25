package pl.pkapusta.engine.project.data.triggers.response;


/**
	 * @author Przemysław Kapusta
	 */
interface ITriggerResponse
{

    function returnResponse(data : Dynamic) : Void
    ;
    function returnFail(message : String) : Void
    ;
}

