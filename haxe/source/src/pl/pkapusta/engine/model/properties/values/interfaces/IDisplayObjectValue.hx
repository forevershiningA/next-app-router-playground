package pl.pkapusta.engine.model.properties.values.interfaces;

import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;
import openfl.display.DisplayObject;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.values.interfaces.IDisplayObjectValue")
interface IDisplayObjectValue extends ICompositeValue extends IEmbeddable extends IUniqueIdHolder extends IExtraDataHolder
{
    
    var display(get, never) : DisplayObject;    
    var bytes(get, never) : ByteArray;

}

