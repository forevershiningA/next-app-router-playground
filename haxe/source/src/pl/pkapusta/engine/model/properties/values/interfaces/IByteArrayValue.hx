package pl.pkapusta.engine.model.properties.values.interfaces;

import pl.pkapusta.engine.common.interfaces.IEmbeddable;
import pl.pkapusta.engine.project.data.structure.interfaces.IExtraDataHolder;
import pl.pkapusta.engine.project.data.structure.interfaces.IUniqueIdHolder;
import openfl.utils.ByteArray;

/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.values.interfaces.IByteArrayValue")
interface IByteArrayValue extends ICompositeValue extends IEmbeddable extends IUniqueIdHolder extends IExtraDataHolder
{
    
    var data(get, never) : ByteArray;

}

