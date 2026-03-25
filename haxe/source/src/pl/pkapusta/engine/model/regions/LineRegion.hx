package pl.pkapusta.engine.model.regions;

import pl.pkapusta.engine.model.regions.AbstractRegion;
import pl.pkapusta.engine.model.regions.event.RegionLimitEvent;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
class LineRegion extends AbstractRegion implements IRegion
{
    public static inline var LIMIT_TYPE_WIDTH : String = "width";
    
    private var _lineOrientation : String;
    
    private var _widthLimit : Float = Math.NaN;
    
    public function new(data : Dynamic)
    {
        super(data);
    }
    
    override private function parseFromXML(data : FastXML) : Void
    {
        super.parseFromXML(data);
        
        if (data.hasNode.resolve("line-orientation"))
        {
            _lineOrientation = data.node.resolve("line-orientation").att.value;
        }
        else
        {
            _lineOrientation = "w";
        }
        
        if (data.hasNode.resolve("width-limit"))
        {
            _widthLimit = Std.parseFloat(data.node.resolve("width-limit").att.value);
        }
    }
    
    override public function getType() : String
    {
        return AbstractRegion.TYPE_LINE;
    }
    
    public function getLineOrientation() : String
    {
        return _lineOrientation;
    }
    
    public function getWidthLimit() : Float
    {
        return _widthLimit;
    }
    
    public function setWidthLimit(value : Float) : Float
    {
        if (_widthLimit == value)
        {
            return value;
        }
        _widthLimit = value;
        dispatchEvent(new RegionLimitEvent(RegionLimitEvent.CHANGE, LIMIT_TYPE_WIDTH, value, this));
        return value;
    }
    
    override private function dispatchLimitEvents() : Void
    {
        dispatchEvent(new RegionLimitEvent(RegionLimitEvent.INIT, LIMIT_TYPE_WIDTH, _widthLimit, this));
    }
}

