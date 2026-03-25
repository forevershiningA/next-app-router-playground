package pl.pkapusta.engine.model.executors.file;


/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.file.IM3DExecutorProperty")
interface IM3DExecutorProperty
{

    public function updateProperty(name : String, data : Dynamic) : Void;
}

