package pl.pkapusta.engine.model.executors.file.proxies;

import pl.pkapusta.engine.model.handlers.AbstractHandler;

/**
	 * @author Przemysław Kapusta
	 */
class PointHandlerProxy extends HandlerProxy implements IPointHandlerProxy
{
    
    public function new(region : AbstractHandler)
    {
        super(region);
    }
}

