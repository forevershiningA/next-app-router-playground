package pl.pkapusta.engine.graphics;

import pl.pkapusta.engine.graphics.algorithms.Bezier;
import pl.pkapusta.engine.graphics.algorithms.DiscretePathOffset;
import pl.pkapusta.engine.graphics.path.debug.DiscretePathDrawer;
import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePath;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.graphics.path.HeadScalingDiscretePath;
import pl.pkapusta.engine.graphics.path.NineScalingDiscretePath;
import pl.pkapusta.engine.graphics.path.NormalsDirection;
import pl.pkapusta.engine.graphics.path.ScalingDiscretePath;

/**
	 * @author Przemysław Kapusta
	 */
class Include
{
    
    //algorithms
    private var bezier : Bezier;
    private var discretePathOffset : DiscretePathOffset;
    
    //path
    private var discretePathDrawer : DiscretePathDrawer;
    private var discreteCornerPoint : DiscreteCornerPoint;
    private var discretePath : DiscretePath;
    private var discretePoint : DiscretePoint;
    private var headScalingDiscretePath : HeadScalingDiscretePath;
    private var nineScalingDiscretePath : NineScalingDiscretePath;
    private var normalsDirection : NormalsDirection;
    private var scalingDiscretePath : ScalingDiscretePath;

    public function new()
    {
    }
}

