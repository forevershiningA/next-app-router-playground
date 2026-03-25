package;

import pl.pkapusta.engine.common.exteption.event.ExceptionEvent;
import pl.pkapusta.engine.common.exteption.ExceptionManager;
import pl.pkapusta.engine.Engine3D;
import pl.pkapusta.engine.model.events.Model3DEvent;
import pl.pkapusta.engine.model.IModel3D;
import pl.pkapusta.engine.model.Model3D;
import openfl.display.Sprite;
import openfl.display.StageScaleMode;
import openfl.display.StageAlign;
import openfl.events.Event;
import openfl.Lib;
import openfl.utils.ByteArray;

/**
 * ...
 * @author Przemysław Kapusta
 */
class Main extends Sprite 
{
	private var engine: Engine3D;
	
	private var GROUND_URL:String = "scenery1.m3d";
	private var TOMB_BASE_URL:String = "tomb_042/base.m3d";
	private var TOMB_KERB_URL:String = "tomb_042/kerb.m3d";
	private var TOMB_LID_URL:String = "tomb_042/lid.m3d";
	private var TOMB_TABLE_URL:String = "tomb_042/table.m3d";
	//private var TOMB_TABLE_URL:String = "models/forevershining/headstones/cropped-peak.m3d";
	
	private var groundModel:IModel3D;
	private var tombBaseModel:IModel3D;
	private var tombKerbModel:IModel3D;
	private var tombLidModel:IModel3D;
	//private var tombStandModel:IModel3D;
	private var tombTableModel:IModel3D;

	public function new() 
	{
		super();
		
		stage.scaleMode = StageScaleMode.NO_SCALE;
		stage.align = StageAlign.TOP_LEFT;
		
		engine = new Engine3D(this, stage.stageWidth, stage.stageHeight);
		
		untyped __js__("$hx_exports[{0}][{1}] = {2}", "Engine3D", "Controller", engine.getController());
		untyped __js__("$hx_exports[{0}][{1}] = {2}", "Engine3D", "View", engine.getView());
		untyped __js__("$hx_exports[{0}][{1}] = {2}", "Engine3D", "Globals", Engine3D.Globals);
		untyped __js__("$hx_exports[{0}][{1}] = {2}", "Engine3D", "ExceptionManager", engine.getExceptionManager());
		
		//ExceptionManager.getInstance().addEventListener(ExceptionEvent.ON_EXCEPTION, engineExceptionHandler);
		ExceptionManager.getInstance().autoThrowException = false;
		
		//groundModel = engine.controller.currentProject.loadRootModel(GROUND_URL);
		//groundModel.addEventListener(Model3DEvent.IS_READY, groundModelReadyHandler);
		
		stage.addEventListener(Event.RESIZE, resizeHandler);
	}
	
	private function resizeHandler(e:Event):Void {
		engine.getView().width = stage.stageWidth;
		engine.getView().height = stage.stageHeight;
	}
	
	private function engineExceptionHandler(e:ExceptionEvent):Void {
		trace(e.exception);
	}
	
	private function groundModelReadyHandler(e:Model3DEvent):Void {
		tombBaseModel = new Model3D(TOMB_BASE_URL);
		tombBaseModel.addEventListener(Model3DEvent.IS_READY, tombBaseModelReadyHandler);
	}
	
	private function tombBaseModelReadyHandler(e:Model3DEvent):Void {
		groundModel.addChild(tombBaseModel);
		tombKerbModel = new Model3D(TOMB_KERB_URL);
		tombKerbModel.addEventListener(Model3DEvent.IS_READY, tombKerbModelReadyHandler);
	}
	
	private function tombKerbModelReadyHandler(e:Model3DEvent):Void {
		tombBaseModel.addChild(tombKerbModel);
		tombLidModel = new Model3D(TOMB_LID_URL);
		tombLidModel.addEventListener(Model3DEvent.IS_READY, tombLidModelReadyHandler);
	}
	
	private function tombLidModelReadyHandler(e:Model3DEvent):Void {
		tombKerbModel.addChild(tombLidModel);
		tombTableModel = new Model3D(TOMB_TABLE_URL);
		tombTableModel.addEventListener(Model3DEvent.IS_READY, tombTableModelReadyHandler);
	}
	
	private function tombTableModelReadyHandler(e:Model3DEvent):Void {
		tombLidModel.addChild(tombTableModel);
	}

}
