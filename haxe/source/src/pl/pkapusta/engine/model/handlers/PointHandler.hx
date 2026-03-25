package pl.pkapusta.engine.model.handlers;

import pl.pkapusta.engine.model.handlers.AbstractHandler;

class PointHandler extends AbstractHandler implements IHandler
{
    
    public function new(data : Dynamic)
    {
        super(data);
    }
    
    override private function get_type() : String
    {
        return AbstractHandler.TYPE_POINT;
    }
}

