package pl.pkapusta.engine.project.data.parsers.project3d;

import haxe.Json;
import haxe.io.Bytes;
import openfl.errors.Error;
import haxe.Constraints.Function;
import haxe.crypto.Crc32;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedReader;
import pl.pkapusta.engine.common.data.parsers.embed.IParserEmbedWriter;
import pl.pkapusta.engine.common.data.parsers.IParserReader;
import pl.pkapusta.engine.common.data.parsers.IParserWriter;
import pl.pkapusta.engine.common.enums.IOFormat;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.NotLongerSupportedFileVersionException;
import pl.pkapusta.engine.common.exteption.predefined.data.parser.UnknownFileVersionException;
import pl.pkapusta.engine.common.StringUtils;
import pl.pkapusta.engine.model.data.ExecutorJS;
import pl.pkapusta.engine.project.data.ProjectContext;
import pl.pkapusta.engine.project.data.ProjectSaveCustomizator;
import pl.pkapusta.engine.project.Project3D;
import pl.pkapusta.engine.IEngine3DView;
import openfl.events.Event;
import openfl.events.EventDispatcher;
import openfl.utils.ByteArray;
import away3d.cameras.Camera3D;
import away3d.cameras.lenses.LensBase;
import away3d.cameras.lenses.OrthographicLens;
import away3d.cameras.lenses.PerspectiveLens;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementAsyncReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementReader;
import pl.pkapusta.engine.common.data.parsers.project.IProjectElementWriter;
import pl.pkapusta.engine.common.enums.EmbedType;
import pl.pkapusta.engine.common.exteption.control.action.ActionController;
import pl.pkapusta.engine.model.events.Model3DEvent;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProjectRW;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.properties.IProperty;
import pl.pkapusta.engine.model.properties.writers.EmbeddableWriter;
import pl.pkapusta.engine.model.regions.*;
import pl.pkapusta.engine.model.utils.iterators.Model3DPropertyIterator;
import pl.pkapusta.engine.project.data.IProjectContext;
import pl.pkapusta.engine.project.data.structure.context.BaseResourceContext;
import pl.pkapusta.engine.project.data.structure.context.IResourceContext;
import pl.pkapusta.engine.project.data.structure.context.ResourceURLContext;
import pl.pkapusta.engine.project.data.structure.storage.XMLProjectStorageObject;
import pl.pkapusta.engine.project.exceptions.ProjectLoadedWithErrorException;
import pl.pkapusta.engine.project.exceptions.ProjectLoaderErrorException;
import pl.pkapusta.engine.view.data.RenderToImageParams;
import openfl.geom.Vector3D;

/**
 * @author Przemysław Kapusta
 */
class Project3DModelsTreeParser extends EventDispatcher implements IParserReader implements IParserWriter
{
    public var success(get, never) : Bool;

    
    public static inline var EVENT_BYTES_READED : String = "bytes.readed";
    
    public var version : Int = 2;
    
    public var innerVersion : Int = 1;
    
    public var writeCustomizator : ProjectSaveCustomizator = null;
    public var project : Project3D;
    public var context : ProjectContext;
    public var engineView : IEngine3DView;
    
    public var embedDataWriter : IParserEmbedWriter;
    public var embedDataReader : IParserEmbedReader;
    
    private var _success : Bool = false;
    
    public function readStream(data : ByteArray) : Void
    {
        switch (version)
        {
			case 1:
                _success = false;
				ExceptionManager.Throw(new NotLongerSupportedFileVersionException());return;
            case 2:readV2(data);
            default:
                _success = false;
                ExceptionManager.Throw(new UnknownFileVersionException());return;
        }
    }
    
    private function readV2(data : ByteArray) : Void
    {
        innerVersion = data.readByte();
        switch (innerVersion)
        {
            case 1:readInnerV1(data);
            default:
                _success = false;
                ExceptionManager.Throw(new UnknownFileVersionException());return;
        }
    }
    
    private function readInnerV1(data : ByteArray) : Void
    {
        var xml : FastXML = FastXML.parse(data.readUTF());
        trace("Loading project XML");
        trace(xml.toString());
        dispatchEvent(new Event(EVENT_BYTES_READED));
        var reader : XMLV1READER = new XMLV1READER(project, context, embedDataReader);
        reader.addEventListener(Event.COMPLETE, dispatchEvent);
        reader.read(xml);
    }
    
    public function writeStream(data : ByteArray) : Void
    {
        switch (version)
        {
            case 2:writeV2(data);
            default:
                _success = false;
                ExceptionManager.Throw(new UnknownFileVersionException());return;
        }
    }
    
    private function writeV2(data : ByteArray) : Void
    {
        data.writeByte(innerVersion);
        switch (innerVersion)
        {
            case 1:writeInnerV1(data);
            default:
                _success = false;
                ExceptionManager.Throw(new UnknownFileVersionException());return;
        }
    }
    
    private function writeInnerV1(data : ByteArray) : Void
    {
        var builder : XMLV1WITER = new XMLV1WITER(project, writeCustomizator, embedDataWriter, engineView);
        var treeXML : FastXML = builder.build();
        var treeXMLString : String = treeXML.toString();
        data.writeUTF(treeXMLString);
        
        trace("Writting project XML:");
        trace(treeXMLString);
    }
    
    private function get_success() : Bool
    {
        return _success;
    }

    public function new()
    {
        super();
    }
}






class XMLV1WITER
{
    
    private var project : Project3D;
    private var writeCustomizator : ProjectSaveCustomizator;
    private var embedDataWriter : IParserEmbedWriter;
    private var engineView : IEngine3DView;
    
    public function new(project : Project3D, writeCustomizator : ProjectSaveCustomizator, embedDataWriter : IParserEmbedWriter, engineView : IEngine3DView)
    {
        this.project = project;
        this.writeCustomizator = writeCustomizator;
        this.embedDataWriter = embedDataWriter;
        this.engineView = engineView;
    }
    
    public function build() : FastXML
    {
        var xml : FastXML = FastXML.parse("<project></project>");
        if (project.getRootModel() != null)
        {
            xml.appendChild(_buildModelNode(project.getRootModel()));
        }
        return xml;
    }
    
	@:access(pl.pkapusta.engine.model.regions.position.AbstractRegionPosition.toXML)
	@:access(pl.pkapusta.engine.model.Model3D.getModelHash)
	@:access(pl.pkapusta.engine.model.Model3D.modelData)
	@:access(pl.pkapusta.engine.model.data.Model3DData.binaryData)
    private function _buildModelNode(model : IModel3D) : FastXML
    {
        var xml : FastXML = FastXML.parse("<model />");
        
        //context data
        if (model.getContext() != null)
        {
            xml.appendChild(model.getContext().writeProjectElement(embedDataWriter));
        }
        
        //extra data
        var extraDataXML : FastXML = FastXML.parse("<extra-data/>");
		var innerCopy:Xml = Xml.parse(model.getExtraData().innerHTML);
		for (e in innerCopy.iterator()) {
			if (e.nodeType != Xml.Element) continue;
			extraDataXML.appendChild(Xml.parse(e.toString()).firstElement());
		}
        xml.appendChild(extraDataXML.x);
		
		//extra json data
		if (Std.is(model, Model3D)) {
			if (cast (model, Model3D).extra != null) {
				var extraXML:FastXML = FastXML.parse("<extra><![CDATA[" + haxe.Json.stringify(cast (model, Model3D).extra) + "]]></extra>");
				extraXML.setAttribute("type", "json");
				xml.appendChild(extraXML.x);
			}
		}
        
        //position xml
        if (model.getRegionPosition() != null)
        {
            //#AS3 var posxml : FastXML = model.regionPosition.e3d::toXML();
            var posxml : FastXML = model.getRegionPosition().toXML();
            if (posxml != null)
            {
                xml.appendChild(posxml);
            }
        }
        
        //embed data
        if (EmbeddableWriter.isNeedWriteData(model))
        {
            var modelHash : String = cast((model), Model3D).getModelHash();
            EmbeddableWriter.writeEmbedData(model, embedDataWriter, xml, modelHash, cast((model), Model3D).modelData.binaryData);
        }
        
        //model description attrs
        xml.setAttribute("generalType", model.getGeneralType());
        
        //use IM3DExecutorProjectRW if exists
        var exec : IM3DExecutorProjectRW = null;
        //#AS3 if (cast((model), Model3D).e3d::modelData.executor && Std.is(cast((model), Model3D).e3d::modelData.executor, IM3DExecutorProjectRW))
        if (cast((model), Model3D).modelData.executor != null && ExecutorJS.instanceOf(cast((model), Model3D).modelData.executor, IM3DExecutorProjectRW))
        {
            //#AS3 exec = try cast(cast((model), Model3D).e3d::modelData.executor, IM3DExecutorProjectRW) catch(e:Dynamic) null;
            //exec = try cast(cast((model), Model3D).modelData.executor, IM3DExecutorProjectRW) catch (e:Dynamic) null;
			exec = ExecutorJS.castTo(cast((model), Model3D).modelData.executor, IM3DExecutorProjectRW);
            var storage : XMLProjectStorageObject = new XMLProjectStorageObject();
            try
            {
                exec.projectWriteAction(storage);
                var storageObjectXML : FastXML = storage.writeProjectElement(embedDataWriter);
                xml.appendChild(storageObjectXML);
            }
            catch (e : Error)
            {
                trace("ERROR WHILE WRITTING MODEL!");
                trace(e.getStackTrace());
            }
        }
        
        if (exec == null || exec.useDefaultProjectWriter) {
        
			//properties
            
            var pIterator : Model3DPropertyIterator = new Model3DPropertyIterator(model, true);
            var property : IProperty;
            var propertyWriter : IProjectElementWriter;
            var propertiesXML : FastXML = FastXML.parse("<properties />");
            while ((property = pIterator.next()) != null)
            {
                var propertyWriter : IProjectElementWriter = try cast(property, IProjectElementWriter) catch(e:Dynamic) null;
                if (propertyWriter == null)
                {
                    continue;
                }
                var propertyNode : FastXML = propertyWriter.writeProjectElement(embedDataWriter);
                propertiesXML.appendChild(propertyNode);
            }
            xml.appendChild(propertiesXML);
        }
        
        //regions and childs
        var regions : Array<IRegion> = model.getRegionList();
        var regionsNode : FastXML = null;
        var i : Int = 0;
        while (i < regions.length)
        {
            var region : IRegion = regions[i];
            var childs : Array<IModel3D> = region.getChildList();
            if (childs.length > 0)
            {
                if (regionsNode == null)
                {
                    regionsNode = FastXML.parse("<regions />");
                }
				var cRegionNode : FastXML = null;
				if (regionsNode.hasNode.resolve(region.getId())) {
					cRegionNode = regionsNode.node.resolve(region.getId());
				} else {
                    cRegionNode = FastXML.parse("<" + region.getId() + " />");
                    regionsNode.appendChild(cRegionNode);
                }
                var j : Int = 0;
                while (j < childs.length)
                {
                    cRegionNode.appendChild(_buildModelNode(childs[j]));
                    j++;
                }
            }
            i++;
        }
        if (regionsNode != null)
        {
            xml.appendChild(regionsNode);
        }
        
        //screens
        if (writeCustomizator.buildScreens && model.getDescription().hasNode.project && model.getDescription().node.project.hasNode.screens && model.getDescription().node.project.node.screens.hasNode.screen)
        {
            var screensXML : FastXML = FastXML.parse("<screens />");
            for (itemXML in model.getDescription().node.project.node.screens.nodes.screen)
            {
                screensXML.appendChild(buildScreen(itemXML));
            }
            xml.appendChild(screensXML);
        }
        
        return xml;
    }
    
    private function buildScreen(screen : FastXML) : FastXML
    {
        
        var xml : FastXML = FastXML.parse("<screen />");
        xml.setAttribute("name", screen.getAttribute("name"));
        xml.setAttribute("mode", screen.getAttribute("mode"));
        
        var renderParams : RenderToImageParams = new RenderToImageParams();
        if (screen.has.width)
        {
            renderParams.width = as3hx.Compat.parseInt(screen.att.width);
        }
        if (screen.has.height)
        {
            renderParams.height = as3hx.Compat.parseInt(screen.att.height);
        }
        
        if (screen.hasNode.camera)
        {
            var cameraXML : FastXML = screen.node.camera;
            var lens : LensBase = null;
            if (cameraXML.hasNode.lens)
            {
                var type : String = cameraXML.node.lens.att.type;
                switch (type)
                {
                    case "perspective":
                        lens = new PerspectiveLens();
                        if (cameraXML.node.lens.has.fov)
                        {
                            cast((lens), PerspectiveLens).fieldOfView = as3hx.Compat.parseFloat(cameraXML.node.lens.att.fov);
                        }
                    case "orthographic":
                        lens = new OrthographicLens();
                        if (cameraXML.node.lens.has.height)
                        {
                            cast((lens), OrthographicLens).projectionHeight = as3hx.Compat.parseFloat(cameraXML.node.lens.att.height);
                        }
                }
            }
            var camera : Camera3D = new Camera3D(lens);
            if (cameraXML.hasNode.position)
            {
                camera.moveTo(
                        ((cameraXML.node.position.has.x)) ? as3hx.Compat.parseFloat(cameraXML.node.position.att.x) : 0, 
                        ((cameraXML.node.position.has.y)) ? as3hx.Compat.parseFloat(cameraXML.node.position.att.y) : 0, 
                        ((cameraXML.node.position.has.z)) ? as3hx.Compat.parseFloat(cameraXML.node.position.att.z) : 0
            );
            }
            if (cameraXML.hasNode.target)
            {
                camera.lookAt(new Vector3D(
                        ((cameraXML.node.target.has.x)) ? as3hx.Compat.parseFloat(cameraXML.node.target.att.x) : 0, 
                        ((cameraXML.node.target.has.y)) ? as3hx.Compat.parseFloat(cameraXML.node.target.att.y) : 0, 
                        ((cameraXML.node.target.has.z)) ? as3hx.Compat.parseFloat(cameraXML.node.target.att.z) : 0));
            }
            renderParams.camera = camera;
        }
        
        var jpegBytes : Bytes = engineView.renderToImage(writeCustomizator.imageEncoder, renderParams, IOFormat.Bytes);
        var crc32 : Int = Crc32.make(jpegBytes);
        var pointer : Int = embedDataWriter.writeEmbedObject(crc32, jpegBytes);
        xml.setAttribute("embedPointer", StringUtils.IntToHexString(pointer));
        return xml;
    }
}

class XMLV1READER extends EventDispatcher
{
    
    private var project : Project3D;
    private var context : ProjectContext;
    private var embedDataReader : IParserEmbedReader;
    
    private var waiting : Bool = false;
    private var modelCount : Int = 0;
    private var modelErrors : Int = 0;
    private var modelSuccess : Int = 0;
    private var rootEntry : XMLV1READERENTRYMODEL3D;
    
    private var asyncProjectReaders : Array<XMLV1READERASYNCREADER>;
    private var asyncProjectReadersComplete : Int = 0;
    
    private var _currentXML : FastXML = null;
    
    private var _retryActionController : ActionController = null;
    private var _cancelActionController : ActionController = null;
    
    public function new(project : Project3D, context : ProjectContext, embedDataReader : IParserEmbedReader)
    {
        super();
        this.project = project;
        this.context = context;
        this.embedDataReader = embedDataReader;
        asyncProjectReaders = new Array<XMLV1READERASYNCREADER>();
    }
    
    public function read(xml : FastXML) : Void
    {
        _currentXML = xml;
        _retryActionController = null;
        _cancelActionController = null;
        doRead();
    }
    
    private function doRead() : Void
    {
        if (_currentXML.hasNode.model)
        {
            rootEntry = _readModelNode(_currentXML.nodes.model.get(0), null, null);
            waiting = true;
        }
        else
        {
            if (modelErrors > 0)
            {
                ExceptionManager.Throw(new ProjectLoadedWithErrorException());
            }
            dispatchEvent(new Event(Event.COMPLETE));
        }
    }
    
	@:access(pl.pkapusta.engine.project.data.structure.context.BaseResourceContext.buildContextFromXML)
	@:access(pl.pkapusta.engine.model.Model3D._extraData)
    private function _readModelNode(nodeXML : FastXML, regionId : String = null, parent : Model3D = null) : XMLV1READERENTRYMODEL3D
    {
        var entry : XMLV1READERENTRYMODEL3D = new XMLV1READERENTRYMODEL3D();
        entry.parent = parent;
        entry.regionId = regionId;
        entry.modelXML = nodeXML;
        entry.entries = new Array<XMLV1READERENTRYMODEL3D>();
        
        //load context
        var resourceContext : IResourceContext = null;
        if (nodeXML.hasNode.context)
        {
            //#AS3 resourceContext = BaseResourceContext.e3d::buildContextFromXML(nodeXML.nodes.context.get(0), embedDataReader, context);
            resourceContext = BaseResourceContext.buildContextFromXML(nodeXML.node.context, embedDataReader, context);
        }
        
        var embedPointer : Int = -1;
        if (nodeXML.has.embedPointer)
        {
            embedPointer = StringUtils.HexStringToInt(nodeXML.att.embedPointer);
        }
        
        //embed data
        if (EmbeddableWriter.isNeedReadData(nodeXML))
        {
            var bytes : ByteArray = EmbeddableWriter.readEmbedData(embedDataReader, nodeXML);
            entry.model = new Model3D(bytes, resourceContext);
            entry.model.setEmbedType(EmbedType.EMBEDDED);
        }
        else if (resourceContext != null && Std.is(resourceContext, ResourceURLContext))
        {
            var url : String = cast((resourceContext), ResourceURLContext).url.url;
            if (context.relativeURL != null)
            {
                url = context.relativeURL + url;
            }
            entry.model = new Model3D(url, resourceContext);
        }
        else
        {
            throw new Error("Can't load model without ResourceURLContext or EmbedData. Models not support load by triggers - yet.");
        }
        
        //extra data
        if (nodeXML.hasNode.resolve("extra-data"))
        {
            entry.model._extraData = FastXML.parse(nodeXML.node.resolve("extra-data").toString());
        }
		
		//extra json data
		if (nodeXML.hasNode.extra) {
			var extraXML:FastXML = nodeXML.node.extra;
			var type:String = extraXML.att.type;
			if (type == "json") {
				entry.model.extra = Json.parse(extraXML.innerData);
			}
		}
        
        modelCount++;
        entry.model.addEventListener(Model3DEvent.IS_READY, _onModelReadyHandler);
        entry.model.addEventListener(Model3DEvent.LOAD_ERROR, _onModelError);
        
        if (nodeXML.hasNode.regions)
        {
            for (regionXML in nodeXML.node.regions.elements)
            {
                var regionId : String = regionXML.name;
                
                if (regionXML.hasNode.model)
                {
                    for (modelXML in regionXML.nodes.model)
                    {
                        entry.entries.push(_readModelNode(modelXML, regionId, entry.model));
                    }
                }
            }
        }
        
        return entry;
    }
    
    private function _onModelReadyHandler(e : Model3DEvent) : Void
    {
        modelSuccess++;
        prepareScene();
    }
    
    private function _onModelError(e : Model3DEvent) : Void
    {
        modelErrors++;
        prepareScene();
    }
    
    private function prepareScene() : Void
    {
        if (!waiting || (modelErrors + modelSuccess) < modelCount)
        {
            return;
        }
        //trace("prepare");
        //trace("modelSuccess: " + modelSuccess);
        //trace("modelErrors: " + modelErrors);
        
        if (modelErrors > 0)
        {
            if (_retryActionController != null)
            {
                _retryActionController.complete();
            }
            _retryActionController = new ActionController(function()
                    {
                        doRead();
                    });
            _cancelActionController = new ActionController(function()
                    {
                        this.complete();
                        prepareSceneAndComplete();
                    });
            ExceptionManager.Throw(new ProjectLoaderErrorException(_retryActionController, _cancelActionController));
        }
        else
        {
            prepareSceneAndComplete();
        }
    }
    
    private function prepareSceneAndComplete() : Void
    {
        prepareEntryModel(rootEntry);
        if (modelErrors > 0)
        {
            ExceptionManager.Throw(new ProjectLoadedWithErrorException());
        }
        if (asyncProjectReaders.length > asyncProjectReadersComplete)
        {
            processAsyncReaders();
        }
        else
        {
            complete();
        }
    }
    
    private function complete() : Void
    {
        placeEntryModel(rootEntry);
        if (_retryActionController != null)
        {
            _retryActionController.complete();
        }
        dispatchEvent(new Event(Event.COMPLETE));
    }
    
	@:access(pl.pkapusta.engine.model.Model3D.modelData)
    private function prepareEntryModel(entry : XMLV1READERENTRYMODEL3D) : Void
    //trace("prepareEntryModel " + entry.model.generalType);
    {
        
        
        if (!entry.model.isReady())
        {
            return;
        }
        
        //use IM3DExecutorProjectRW if exists
        var exec : IM3DExecutorProjectRW = null;
        //#AS3 if (entry.model.e3d::modelData.executor && Std.is(entry.model.e3d::modelData.executor, IM3DExecutorProjectRW))
        if (entry.model.modelData.executor != null && ExecutorJS.instanceOf(entry.model.modelData.executor, IM3DExecutorProjectRW))
        {
            //#AS3 exec = try cast(entry.model.e3d::modelData.executor, IM3DExecutorProjectRW) catch(e:Dynamic) null;
            exec = ExecutorJS.castTo(entry.model.modelData.executor, IM3DExecutorProjectRW);
            if (entry.modelXML.hasNode.storageObject)
            {
                var storage : XMLProjectStorageObject = new XMLProjectStorageObject();
                storage.readProjectElement(entry.modelXML.node.storageObject, embedDataReader, context);
                try
                {
                    exec.projectReadAction(storage);
                }
                catch (e : Error)
                {
                    trace("ERROR WHILE READ MODEL!");
                    trace(e.getStackTrace());
                }
            }
            else
            {
                try
                {
                    exec.projectReadAction(null);
                }
                catch (e : Error)
                {
                    trace("ERROR WHILE READ MODEL!");
                    trace(e.getStackTrace());
                }
            }
        }
        
        //set properties
        if ((exec == null || exec.useDefaultProjectReader) && entry.modelXML.hasNode.properties && entry.modelXML.node.properties.hasNode.property)
        {
            for (propertyXML in entry.modelXML.node.properties.nodes.property)
            {
                var propertyId : String = propertyXML.att.id;
                var property : IProperty = entry.model.propertyById(propertyId);
                if (Std.is(property, IProjectElementReader))
                {
                    cast((property), IProjectElementReader).readProjectElement(propertyXML, embedDataReader, context);
                }
                else if (Std.is(property, IProjectElementAsyncReader)) {
                
					//trace("reade push: " + propertyXML.toXMLString());
                    
                    asyncProjectReaders.push(new XMLV1READERASYNCREADER(propertyXML, embedDataReader, context, asyncReadingComplete, try cast(property, IProjectElementAsyncReader) catch(e:Dynamic) null));
                }
            }
        }
        
        //prepare next childrens
        var i : Int = 0;
        while (i < entry.entries.length)
        {
            prepareEntryModel(entry.entries[i]);
            i++;
        }
    }
    
	@:access(pl.pkapusta.engine.model.regions.position.AbstractRegionPosition.fromXML)
    private function placeEntryModel(entry : XMLV1READERENTRYMODEL3D) : Void
    //trace("placeEntryModel " + entry.model.generalType);
    {
        
        
        //add childrens to parents
        if (entry.parent != null && entry.model.isReady() && entry.parent.isReady())
        {
            entry.parent.addChild(entry.model, entry.regionId);
            
            //set region posision
            if (entry.modelXML.hasNode.regionPosition)
            {
                //#AS3 entry.model.regionPosition.e3d::fromXML(entry.modelXML.regionPosition[0]);
                entry.model.getRegionPosition().fromXML(entry.modelXML.node.regionPosition);
            }
        }
        else
        {
            project.setRootModel(entry.model);
        }
        
        //place next childrens
        var i : Int = 0;
        while (i < entry.entries.length)
        {
            placeEntryModel(entry.entries[i]);
            i++;
        }
    }
    
    private function processAsyncReaders() : Void
    {
        var i : Int = 0;
        while (i < asyncProjectReaders.length)
        {
            asyncProjectReaders[i].process();
            i++;
        }
    }
    
    private function asyncReadingComplete() : Void
    {
        asyncProjectReadersComplete++;
        //trace("asyncReadingComplete, readers: " + asyncProjectReaders.length + ", completed: " + asyncProjectReadersComplete);
        if (asyncProjectReaders.length <= asyncProjectReadersComplete)
        {
            complete();
        }
    }
}

class XMLV1READERENTRYMODEL3D
{
    public var model : Model3D;
    public var regionId : String;
    public var parent : Model3D;
    public var modelXML : FastXML;
    public var entries : Array<XMLV1READERENTRYMODEL3D>;

    public function new()
    {
    }
}

class XMLV1READERASYNCREADER
{
    private var _xml : FastXML;
    private var _embedDataReader : IParserEmbedReader;
    private var _context : IProjectContext;
    private var _completeFunction : Function;
    private var _asyncReaderObject : IProjectElementAsyncReader;
    public function new(xml : FastXML, embedDataReader : IParserEmbedReader, context : IProjectContext, completeFunction : Function, asyncReaderObject : IProjectElementAsyncReader)
    {
        _xml = xml;
        _embedDataReader = embedDataReader;
        _context = context;
        _completeFunction = completeFunction;
        _asyncReaderObject = asyncReaderObject;
    }
    public function process() : Void
    {
        _asyncReaderObject.readProjectElement(_xml, _embedDataReader, _context, _completeFunction);
        _xml = null;
        _embedDataReader = null;
        _completeFunction = null;
        _asyncReaderObject = null;
    }
}