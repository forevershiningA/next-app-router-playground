package pl.pkapusta.engine.model.executors.file;

import pl.pkapusta.engine.project.data.structure.storage.IProjectStorageObject;


/**
	 * @author Przemysław Kapusta
	 */
@:expose("Engine3D.model.executors.file.IM3DExecutorProjectRW")
interface IM3DExecutorProjectRW
{
    
    
    var useDefaultProjectReader(get, never) : Bool;    
    var useDefaultProjectWriter(get, never) : Bool;

    function projectReadAction(reader : IProjectStorageObject) : Void
    ;
    function projectWriteAction(writer : IProjectStorageObject) : Void
    ;
}

