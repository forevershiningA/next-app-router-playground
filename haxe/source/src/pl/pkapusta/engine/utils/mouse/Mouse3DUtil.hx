package pl.pkapusta.engine.utils.mouse;

import away3d.containers.View3D;
import away3d.tools.utils.Ray;
import pl.pkapusta.engine.common.exteption.predefined.StaticClassException;
import openfl.display.Stage;
import openfl.events.MouseEvent;
import openfl.geom.Matrix3D;
import openfl.geom.Point;
import openfl.geom.Vector3D;

/**
	 * @author Przemysław Kapusta
	 */
@:access(away3d.tools.utils.Ray.new)
class Mouse3DUtil
{
    
    public static inline var AXIS_XY : String = "xy";
    public static inline var AXIS_XZ : String = "xz";
    public static inline var AXIS_YZ : String = "yz";
    
    private static var vFrom : Vector3D = new Vector3D();
    private static var vTo : Vector3D = new Vector3D();
    
    private static var XZ_INIT_SV1 : Vector3D = new Vector3D(-9999999, 0, -9999999);
    private static var XZ_INIT_SV2 : Vector3D = new Vector3D(9999999, 0, -9999999);
    private static var XZ_INIT_SV3 : Vector3D = new Vector3D(9999999, 0, 9999999);
    private static var XZ_INIT_SV4 : Vector3D = new Vector3D(-9999999, 0, 9999999);
    
    private static var XY_INIT_SV1 : Vector3D = new Vector3D(-9999999, -9999999, 0);
    private static var XY_INIT_SV2 : Vector3D = new Vector3D(9999999, -9999999, 0);
    private static var XY_INIT_SV3 : Vector3D = new Vector3D(9999999, 9999999, 0);
    private static var XY_INIT_SV4 : Vector3D = new Vector3D(-9999999, 9999999, 0);
    
    private static var YZ_INIT_SV1 : Vector3D = new Vector3D(0, -9999999, -9999999);
    private static var YZ_INIT_SV2 : Vector3D = new Vector3D(0, 9999999, -9999999);
    private static var YZ_INIT_SV3 : Vector3D = new Vector3D(0, 9999999, 9999999);
    private static var YZ_INIT_SV4 : Vector3D = new Vector3D(0, -9999999, 9999999);
    
    private static var ray : Ray = new Ray();
    private static var distanceFromScreen : Float;
    
    public static function stageTo3DPlanarPoint(stagePoint : Point, view : View3D, globalTransform : Matrix3D, planeAxis : String, resultVector : Vector3D) : Bool
    {
        var viewPoint : Point = view.globalToLocal(stagePoint);
        
        view.unproject(viewPoint.x, viewPoint.y, 0, vFrom);
        view.unproject(viewPoint.x, viewPoint.y, 9999999, vTo);
        vTo.x -= vFrom.x;
        vTo.y -= vFrom.y;
        vTo.z -= vFrom.z;
        
        var sv1 : Vector3D;
        var sv2 : Vector3D;
        var sv3 : Vector3D;
        var sv4 : Vector3D;
        
        if (planeAxis == AXIS_XZ)
        {
            sv1 = globalTransform.transformVector(XZ_INIT_SV1);
            sv2 = globalTransform.transformVector(XZ_INIT_SV2);
            sv3 = globalTransform.transformVector(XZ_INIT_SV3);
            sv4 = globalTransform.transformVector(XZ_INIT_SV4);
        }
        else if (planeAxis == AXIS_XY)
        {
            sv1 = globalTransform.transformVector(XY_INIT_SV1);
            sv2 = globalTransform.transformVector(XY_INIT_SV2);
            sv3 = globalTransform.transformVector(XY_INIT_SV3);
            sv4 = globalTransform.transformVector(XY_INIT_SV4);
        }
        else
        {
            sv1 = globalTransform.transformVector(YZ_INIT_SV1);
            sv2 = globalTransform.transformVector(YZ_INIT_SV2);
            sv3 = globalTransform.transformVector(YZ_INIT_SV3);
            sv4 = globalTransform.transformVector(YZ_INIT_SV4);
        }
        
        var rayVector : Vector3D = ray.getRayToTriangleIntersection(vFrom, vTo, sv1, sv2, sv3);
        if (rayVector == null)
        {
            rayVector = ray.getRayToTriangleIntersection(vFrom, vTo, sv1, sv3, sv4);
        }
        
        if (rayVector != null)
        {
            var invGlobalTransform : Matrix3D = globalTransform.clone();
            invGlobalTransform.invert();
            distanceFromScreen = Vector3D.distance(rayVector, vFrom);
            var inRayVector : Vector3D = invGlobalTransform.transformVector(rayVector);
            if (planeAxis == AXIS_XZ)
            {
                resultVector.x = inRayVector.x;
                resultVector.y = inRayVector.z;
                resultVector.z = 0;
                resultVector.w = distanceFromScreen;
            }
            else if (planeAxis == AXIS_XY)
            {
                resultVector.x = inRayVector.x;
                resultVector.y = inRayVector.y;
                resultVector.z = 0;
                resultVector.w = distanceFromScreen;
            }
            else
            {
                resultVector.x = inRayVector.y;
                resultVector.y = inRayVector.z;
                resultVector.z = 0;
                resultVector.w = distanceFromScreen;
            }
        }
        
        return (rayVector != null);
    }
    
    public function new()
    {
        throw new StaticClassException();
    }
}

