package pl.pkapusta.engine.model.executors.utils.properties;

import pl.pkapusta.engine.common.interfaces.IDisposable;

@:keep
@:expose("Engine3D.model.executors.utils.properties.IM3DProperty")
interface IM3DProperty extends IDisposable
{
    
    var propertyId(get, never) : String;

    function change(data : Dynamic) : Bool
    ;
}

