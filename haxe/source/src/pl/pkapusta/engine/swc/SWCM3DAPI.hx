package pl.pkapusta.engine.swc;

import pl.pkapusta.engine.model.executors.file.asset.IModel3DAssetExecutor;
import pl.pkapusta.engine.model.executors.file.IM3DExecutor;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorDuplicator;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorLimiter;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorProperty;
import pl.pkapusta.engine.model.executors.file.IM3DExecutorRenderer;
import pl.pkapusta.engine.model.executors.file.M3DBasicExecutor;
import pl.pkapusta.engine.model.executors.file.proxies.ILineRegionProxy;
import pl.pkapusta.engine.model.executors.file.proxies.IPointRegionProxy;
import pl.pkapusta.engine.model.executors.file.proxies.IStandardSelectionProxy;
import pl.pkapusta.engine.model.executors.file.proxies.ISurfaceRegionProxy;
import pl.pkapusta.engine.model.executors.file.proxies.ISurfaceSelectionProxy;
import openfl.display.Sprite;

/**
	 * @author Przemysław Kapusta
	 */
class SWCM3DAPI extends Sprite
{
    
    private var a000 : IM3DExecutorLimiter;
    private var a001 : IM3DExecutorProperty;
    private var a002 : IM3DExecutorDuplicator;
    private var a003 : IM3DExecutorRenderer;
    private var a004 : IM3DExecutor;
    private var a005 : IModel3DAssetExecutor;
    private var a006 : M3DBasicExecutor;
    private var a007 : ISurfaceRegionProxy;
    private var a008 : IPointRegionProxy;
    private var a009 : ILineRegionProxy;
    private var a010 : IStandardSelectionProxy;
    private var a011 : ISurfaceSelectionProxy;

    public function new()
    {
        super();
    }
}

