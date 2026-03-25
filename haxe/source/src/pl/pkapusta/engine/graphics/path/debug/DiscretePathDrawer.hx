package pl.pkapusta.engine.graphics.path.debug;

import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePath;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import openfl.display.DisplayObjectContainer;
import openfl.display.Graphics;

/**
	 * @author Przemysław Kapusta
	 */
class DiscretePathDrawer
{
    
    private var _container : Graphics;
    private var _path : DiscretePath;
    
    public var colorLine : Int = 0xFFFFFF;
    public var colorNormals : Int = 0x00FF00;
    public var colorTangents : Int = 0xFF0000;
    public var lengthNormals : Float = 1;
    public var lengthTangents : Float = 1;
    
    public var scale : Float;
    
    public function new(path : DiscretePath, container : Graphics, scale : Float = 1)
    {
        _path = path;
        _container = container;
        this.scale = scale;
    }
    
    public function draw() : Void
    //clear();
    {
        
        
        //init
        var i : Int;
        var p : DiscretePoint;
        
        //draw lines
        if (_path.length < 2)
        {
            return;
        }
        p = _path.getPointAt(0);
        _container.lineStyle(2, colorLine, 1);
        _container.moveTo(p.x * scale, p.y * scale);
        
        i = 0;
        while (i < _path.length)
        {
            p = _path.getPointAt(i);
            _container.lineTo(p.x * scale, p.y * scale);
            i++;
        }
        if (_path.closed)
        {
            _container.lineTo(_path.getPointAt(0).x * scale, _path.getPointAt(0).y * scale);
        }
        
        //draw normals
        _container.lineStyle(1, colorNormals, 1);
        i = 0;
        while (i < _path.length)
        {
            p = _path.getPointAt(i);
            if (p.normalAngle != null)
            {
                _container.moveTo(p.x * scale, p.y * scale);
                _container.lineTo((p.x + Math.cos(p.normalAngle) * lengthNormals) * scale, (p.y + Math.sin(p.normalAngle) * lengthNormals) * scale);
            }
            if (Std.is(p, DiscreteCornerPoint))
            {
                if (cast((p), DiscreteCornerPoint).secondNormalAngle != null)
                {
                    _container.moveTo(p.x * scale, p.y * scale);
                    _container.lineTo((p.x + Math.cos(cast((p), DiscreteCornerPoint).secondNormalAngle) * lengthNormals) * scale, (p.y + Math.sin(cast((p), DiscreteCornerPoint).secondNormalAngle) * lengthNormals) * scale);
                }
            }
            i++;
        }
        
        //draw tangents
        _container.lineStyle(1, colorTangents, 1);
        i = 0;
        while (i < _path.length)
        {
            p = _path.getPointAt(i);
            if (!Math.isNaN(p.tangentAngle))
            {
                _container.moveTo(p.x * scale, p.y * scale);
                _container.lineTo((p.x + Math.cos(p.tangentAngle) * lengthTangents) * scale, (p.y + Math.sin(p.tangentAngle) * lengthTangents) * scale);
            }
            if (Std.is(p, DiscreteCornerPoint))
            {
                if (!Math.isNaN(cast((p), DiscreteCornerPoint).secondTangentAngle))
                {
                    _container.moveTo(p.x * scale, p.y * scale);
                    _container.lineTo((p.x + Math.cos(cast((p), DiscreteCornerPoint).secondTangentAngle) * lengthTangents) * scale, (p.y + Math.sin(cast((p), DiscreteCornerPoint).secondTangentAngle) * lengthTangents) * scale);
                }
            }
            i++;
        }
    }
    
    public function clear() : Void
    {
        _container.clear();
    }
    
    public function dispose() : Void
    {
        if (_container != null)
        {
            _container.clear();
            _container = null;
        }
        _path = null;
    }
}

