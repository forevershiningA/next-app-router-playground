package pl.pkapusta.engine.project.data;

import pl.pkapusta.engine.project.data.parsers.Project3DParser;
import pl.pkapusta.engine.project.Project3D;
import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.utils.ByteArray;

class Project3DData extends EventDispatcher
{
    
    private var _project : Project3D;
    private var _data : ByteArray;
    private var _context : ProjectContext;
    
    public function new(project : Project3D)
    {
        super();
        _project = project;
    }
    
    public function buildFromBytes(data : ByteArray, context : ProjectContext) : Void
    {
        _context = context;
        _data = data;
        if (_context == null)
        {
            _context = new ProjectContext();
        }
        
        var parser : Project3DParser = new Project3DParser();
        parser.project = _project;
        parser.context = _context;
        parser.addEventListener(Event.COMPLETE, dispatchEvent);
        parser.readStream(data);
    }
}

