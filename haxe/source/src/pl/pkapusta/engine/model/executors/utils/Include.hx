package pl.pkapusta.engine.model.executors.utils;

import away3d.materials.methods.FresnelPlanarReflectionMethod;
import away3d.textures.CubeReflectionTexture;
import away3d.textures.PlanarReflectionTexture;
import pl.pkapusta.engine.model.executors.file.M3DBasicExecutor;
import pl.pkapusta.engine.model.executors.utils.properties.ColorTextureProperty;

@:keep
class Include
{
    
    private var mbe : M3DBasicExecutor;
    private var ctp : ColorTextureProperty;
    
    private var fprm : FresnelPlanarReflectionMethod;
    private var prt : PlanarReflectionTexture;
    private var crt : CubeReflectionTexture;

    public function new()
    {
    }
}

