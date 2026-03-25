package pl.pkapusta.engine.model.regions;

import away3d.containers.View3D;
import away3d.entities.Mesh;
import away3d.events.MouseEvent3D;
import away3d.materials.ColorMaterial;
import away3d.primitives.PlaneGeometry;
import away3d.tools.utils.Drag3D;
import away3d.tools.utils.Ray;
import box2D.common.math.B2Vec2;
import box2D.dynamics.B2DebugDraw;
import box2D.dynamics.B2World;
import pl.pkapusta.engine.Engine3D;
import pl.pkapusta.engine.Engine3DModel;
import pl.pkapusta.engine.events.Engine3DCameraEvent;
import pl.pkapusta.engine.model.collision.AbstractCollisionShape;
import pl.pkapusta.engine.model.collision.c2d.Abstract2DCollisionShape;
import pl.pkapusta.engine.model.events.Model3DEvent;
import pl.pkapusta.engine.model.Model3D;
import pl.pkapusta.engine.model.regions.AbstractRegion;
import pl.pkapusta.engine.model.regions.bounds.AbstractBoundShape;
import pl.pkapusta.engine.model.regions.bounds.RectangleBoundShape;
import pl.pkapusta.engine.model.regions.position.AbstractRegionPosition;
import pl.pkapusta.engine.model.regions.position.SurfaceRegionPosition;
import pl.pkapusta.engine.model.regions.utils.SurfaceRegionObjectMove;
import pl.pkapusta.engine.project.Project3D;
import pl.pkapusta.engine.utils.mouse.Mouse3DUtil;
import openfl.display.Sprite;
import openfl.display.Stage;
import openfl.events.MouseEvent;
import openfl.geom.Point;
import openfl.geom.Rectangle;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
@:access(pl.pkapusta.engine.model.Model3D._project)
@:access(pl.pkapusta.engine.model.regions.bounds.AbstractBoundShape.setCollisionWorld)
@:access(pl.pkapusta.engine.model.collision.c2d.Abstract2DCollisionShape.setCollisionWorld)
class SurfaceRegion extends AbstractRegion
{   
    private static inline var STAGE_DISTANCE_TO_MOVE : Float = 3;
    
    public static inline var BOUNDS_TYPE_RECTANGLE : String = "rectangle";
    
    private var collisionWorld : B2World;
    private var boundsShape : AbstractBoundShape;
    
    #if config_debug
    private var collisionDebugDraw : B2DebugDraw;
    private var collisionDebugSprite : Sprite;
	#end
    
    private var stage : Stage;
    private var view : View3D;
    private var mvcModel : Engine3DModel;
    
    private var stageMouseDown : Bool = false;
    
    private var _moving : Bool = true;
    
    
    public function new(data : Dynamic)
    {
        super(data);
    }
    
    private function initCollisionWorld() : Void
    {
        collisionWorld = new B2World(new B2Vec2(0, 0), false);
        
        #if config_debug
			trace("building b2DebugDraw...");
			collisionDebugDraw = new B2DebugDraw();
			collisionDebugSprite = new Sprite();
			collisionDebugSprite.mouseEnabled = false;
			collisionDebugSprite.x = Engine3D.stage.stageWidth / 2;
			collisionDebugSprite.y = Engine3D.stage.stageHeight / 2;
			Engine3D.stage.addChild(collisionDebugSprite);
			collisionDebugDraw.setSprite(collisionDebugSprite);
			collisionDebugDraw.setFillAlpha(0.3);
			collisionDebugDraw.setLineThickness(1.0);
			collisionDebugDraw.setFlags(B2DebugDraw.e_shapeBit | B2DebugDraw.e_jointBit);
			collisionWorld.setDebugDraw(collisionDebugDraw);
			collisionWorld.drawDebugData();
		#end
    }
    
    override private function onAfterInit() : Void
    {
        if (cast((_parent), Model3D)._project != null)
        {
            registerProjectData();
        }
        else
        {
            cast((_parent), Model3D).addEventListener(Model3DEvent.ADDED_TO_PROJECT, addedToProjectHandler);
        }
    }
    private function addedToProjectHandler(e : Model3DEvent) : Void
    {
        cast((_parent), Model3D).removeEventListener(Model3DEvent.ADDED_TO_PROJECT, addedToProjectHandler);
        registerProjectData();
    }
    
    private function registerProjectData() : Void
    {
        view = cast((cast((_parent), Model3D)._project), Project3D).model.getView();
        mvcModel = cast((cast((_parent), Model3D)._project), Project3D).model;
        stage = view.stage;
        stage.addEventListener(MouseEvent.MOUSE_DOWN, mouseDownHandler);
        stage.addEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);
    }
    private function mouseDownHandler(e : MouseEvent) : Void
    {
        stageMouseDown = true;
    }
    private function mouseUpHandler(e : MouseEvent) : Void
    {
        stageMouseDown = false;
    }
    
    override private function parseFromXML(data : FastXML) : Void
    {
        initCollisionWorld();
        
        super.parseFromXML(data);
        
        if (data.hasNode.resolve("bounds-shape"))
        {
            var bsdata : FastXML = data.node.resolve("bounds-shape");
            switch (bsdata.att.type)
            {
                case BOUNDS_TYPE_RECTANGLE:
                    var atrX : Float = ((bsdata.has.x)) ? as3hx.Compat.parseFloat(bsdata.att.x) : 0;
                    var atrY : Float = ((bsdata.has.y)) ? as3hx.Compat.parseFloat(bsdata.att.y) : 0;
                    var atrWidth : Float = ((bsdata.has.width)) ? as3hx.Compat.parseFloat(bsdata.att.width) : 100;
                    var atrHeight : Float = ((bsdata.has.height)) ? as3hx.Compat.parseFloat(bsdata.att.height) : 100;
                    var atrSnapMargin : Float = ((bsdata.has.resolve("snap-margin"))) ? as3hx.Compat.parseFloat(bsdata.att.resolve("snap-margin")) : 0;
                    boundsShape = new RectangleBoundShape(new Rectangle(atrX, atrY, atrWidth, atrHeight), atrSnapMargin);
                    boundsShape.setCollisionWorld(collisionWorld);
            }
        }
        if (data.hasNode.moving)
        {
            _moving = ((data.node.moving.innerData.toLowerCase() == "true")) ? true : false;
        }
        
        #if config_debug
        collisionWorld.drawDebugData();
		#end
    }
    
    override private function buildRegionPosition(model : Model3D) : AbstractRegionPosition
    {
        return new SurfaceRegionPosition(model, this);
    }
    
    override private function setCollisionShapes(collisionShapes : Array<AbstractCollisionShape>) : Void
    {
        var i : Int = 0;
        while (i < collisionShapes.length)
        {
            if (Std.is(collisionShapes[i], Abstract2DCollisionShape))
            {
                var sh : Abstract2DCollisionShape = try cast(collisionShapes[i], Abstract2DCollisionShape) catch(e:Dynamic) null;
                sh.setCollisionWorld(collisionWorld);
            }
            i++;
        }
    }
    override private function resetCollisionShapes(collisionShapes : Array<AbstractCollisionShape>) : Void
    {
        var i : Int = 0;
        while (i < collisionShapes.length)
        {
            if (Std.is(collisionShapes[i], Abstract2DCollisionShape))
            {
                var sh : Abstract2DCollisionShape = try cast(collisionShapes[i], Abstract2DCollisionShape) catch(e:Dynamic) null;
                sh.setCollisionWorld(null);
            }
            i++;
        }
    }
    
    override private function verifyPositionOnRegion(rp : AbstractRegionPosition, model : Model3D) : Void
    {
        var regPos : SurfaceRegionPosition = try cast(rp, SurfaceRegionPosition) catch(e:Dynamic) null;
        model.updateCollisionsPosition();
    }
    
    private var globalDownPoint : Point;
    private var selectedModel : Model3D;
    private var modelRegionPos : SurfaceRegionPosition;
    private var offsetRayPoint : Vector3D = new Vector3D();
    override private function notifySelectedMouseDown(e : MouseEvent3D, model : Model3D) : Void
    {
        if (stageMouseDown)
        {
            var localPoint : Point = new Point(view.width * (e.screenX / 100), view.height * (e.screenY / 100));
            globalDownPoint = view.localToGlobal(localPoint);
            
            selectedModel = model;
            modelRegionPos = try cast(getModelRegionPosition(selectedModel), SurfaceRegionPosition) catch(e:Dynamic) null;
            
            if (!Mouse3DUtil.stageTo3DPlanarPoint(globalDownPoint, view, _regionContainer.sceneTransform, Mouse3DUtil.AXIS_XZ, offsetRayPoint))
            {
                trace("WARNING! SurfaceRegion->notifySelectedMouseDown()->offsetRayPoint is null!");
                return;
            }
            offsetRayPoint.x = modelRegionPos.x - offsetRayPoint.x;
            offsetRayPoint.y = modelRegionPos.y - offsetRayPoint.y;
            
            stage.addEventListener(MouseEvent.MOUSE_MOVE, selectedMouseMoveHandler);
            stage.addEventListener(MouseEvent.MOUSE_UP, selectedMouseUpHandler);
            
            mvcModel.dispatchEvent(new Engine3DCameraEvent(Engine3DCameraEvent.LOCK_CAMERA));
        }
    }
    private function selectedMouseMoveHandler(e : MouseEvent) : Void
    {
        var stagePos : Point = new Point(e.stageX, e.stageY);
        if (Point.distance(stagePos, globalDownPoint) >= STAGE_DISTANCE_TO_MOVE)
        {
            stage.removeEventListener(MouseEvent.MOUSE_MOVE, selectedMouseMoveHandler);
            stage.removeEventListener(MouseEvent.MOUSE_UP, selectedMouseUpHandler);
            SurfaceRegionObjectMove.start(selectedModel, offsetRayPoint, view, stage, draggingMouseComplete);
        }
    }
    private function selectedMouseUpHandler(e : MouseEvent) : Void
    {
        stage.removeEventListener(MouseEvent.MOUSE_MOVE, selectedMouseMoveHandler);
        stage.removeEventListener(MouseEvent.MOUSE_UP, selectedMouseUpHandler);
        selectedModel = null;
        mvcModel.dispatchEvent(new Engine3DCameraEvent(Engine3DCameraEvent.UNLOCK_CAMERA));
    }
    
    private function draggingMouseComplete() : Void
    {
        selectedModel = null;
        mvcModel.dispatchEvent(new Engine3DCameraEvent(Engine3DCameraEvent.UNLOCK_CAMERA));
    }
    
    public function getBoundsShape() : AbstractBoundShape
    {
        return boundsShape;
    }
    
    public function updateCollisions() : Void
    {
    }
    
    public function isMoving() : Bool
    {
        return _moving;
    }
}

