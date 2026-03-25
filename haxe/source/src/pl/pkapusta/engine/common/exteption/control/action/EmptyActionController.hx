package pl.pkapusta.engine.common.exteption.control.action;


/**
	 * @author Przemysław Kapusta
	 */
class EmptyActionController extends ActionController
{
    
    public function new()
    {
        super(function()
                {
                    this.complete();
                });
    }
}

