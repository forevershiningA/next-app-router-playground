package pl.pkapusta.engine.view.graphics3d.primitives;

import away3d.core.base.CompactSubGeometry;
import away3d.primitives.PrimitiveBase;
import pl.pkapusta.engine.graphics.algorithms.DiscretePathOffset;
import pl.pkapusta.engine.graphics.path.DiscreteCornerPoint;
import pl.pkapusta.engine.graphics.path.DiscretePath;
import pl.pkapusta.engine.graphics.path.NormalsDirection;
import pl.pkapusta.engine.graphics.path.DiscretePoint;
import pl.pkapusta.engine.view.graphics3d.algorithms.Earcut;
import pl.pkapusta.engine.utils.math.EngineMath;
import openfl.events.Event;
import openfl.geom.Rectangle;
import openfl.Vector;

/**
 * PathGeometry object is auto-building object to path smooth data
 * 
 * @author Przemysław Kapusta
 */
@:expose("Engine3D.view.graphics3d.primitives.PathGeometry")
class PathGeometry extends PrimitiveBase
{
    public var thickness(get, set) : Float;
    public var cornerRound(get, set) : Float;
	public var innerCornerRound(get, set) : Float;
    public var uvMappingRect(get, set) : Rectangle;
    public var path(get, set) : DiscretePath;
    
    private var _triangulationDirty : Bool = true;
    
    private var _path : DiscretePath;
    private var _thickness : Float;
    private var _cornerRound : Float;
    private var _innerCornerRound : Float;
    private var _hasFront : Bool;
    private var _hasBack : Bool;
    private var _hasFrontHoles : Bool = true;
    private var _hasBackHoles : Bool = true;
	private var _hasFrontCappedHoles : Bool = false;
    private var _hasBackCappedHoles : Bool = false;
    private var _hasSide : Bool;
    private var _hasInnerSide : Bool;
	private var _hasFrontCorner : Bool;
	private var _hasBackCorner : Bool;
	private var _hasFrontInnerCorner : Bool;
	private var _hasBackInnerCorner : Bool;
    private var _uvMappingRect : Rectangle;
    
	private var _pathBuildHolders : Array<PathBuildHolder>;
    private var _rawData : Vector<Float>;
    private var _rawIndices : Vector<UInt>;
    private var _nextVertexIndex : Int;
    private var _currentIndex : Int;
    private var _currentTriangleIndex : Int;
    private var _numVertices : Int;
    private var _numTriangles : Int;
    private var _stride : Int;
    private var _vertexOffset : Int;
    private var _triangulationPoints : Array<DiscretePoint>;
    private var _frontTriangulationIndices : Array<Int>;
    private var _backTriangulationIndices : Array<Int>;
	private var _holesTriangulationIndices : Array<Array<Int>>;
    private var _cornerPoints : Array<Float>;
    
    public function new(path : DiscretePath, thickness : Float, cornerRound : Float = 0, hasFront : Bool = true, hasBack : Bool = true, hasSide : Bool = true, uvMappingRect : Rectangle = null, options : haxe.DynamicAccess<Dynamic> = null) {
        super();
        _path = path;
        _path.addEventListener(Event.CHANGE, pathChangeHandler);
        _thickness = Math.max(thickness, 0);
        _cornerRound = Math.max(Math.min(_thickness / 2, cornerRound), 0);
        _innerCornerRound = _cornerRound;
		_hasFrontCorner = _hasBackCorner = _cornerRound > 0;
		_hasFrontInnerCorner = _hasBackInnerCorner = _innerCornerRound > 0;
        _hasFront = hasFront;
        _hasBack = hasBack;
        _hasSide = hasSide;
		_hasInnerSide = _hasSide;
        _uvMappingRect = uvMappingRect;
		
		if (options != null) {
			if (options.exists("cornerRound")) _cornerRound = options.get("cornerRound");
			if (options.exists("innerCornerRound")) _innerCornerRound = options.get("innerCornerRound");
			if (options.exists("hasFront")) _hasFront = options.get("hasFront");
			if (options.exists("hasFrontCorner")) _hasFrontCorner = options.get("hasFrontCorner");
			if (options.exists("hasFrontInnerCorner")) _hasFrontInnerCorner = options.get("hasFrontInnerCorner");
			if (options.exists("hasFrontCappedHoles")) _hasFrontCappedHoles = options.get("hasFrontCappedHoles");
			if (options.exists("hasFrontHoles")) _hasFrontHoles = options.get("hasFrontHoles");
			if (options.exists("hasBack")) _hasBack = options.get("hasBack");
			if (options.exists("hasBackCorner")) _hasBackCorner = options.get("hasBackCorner");
			if (options.exists("hasBackInnerCorner")) _hasBackInnerCorner = options.get("hasBackInnerCorner");
			if (options.exists("hasBackCappedHoles")) _hasBackCappedHoles = options.get("hasBackCappedHoles");
			if (options.exists("hasBackHoles")) _hasBackHoles = options.get("hasBackHoles");
			if (options.exists("hasSide")) _hasSide = options.get("hasSide");
			if (options.exists("hasInnerSide")) _hasInnerSide = options.get("hasInnerSide");
			if (options.exists("uvMappingRect")) _uvMappingRect = options.get("uvMappingRect");
		}
		
		/*_hasFront = true;
		_hasFrontCorner = true;
		_hasFrontInnerCorner = true;
		_hasFrontCappedHoles = true;
		_hasBack = true;
		_hasBackCorner = true;
		_hasBackInnerCorner = false;
		_hasBackHoles = false;
		_hasBackCappedHoles = false;
		_hasSide = true;
		_hasInnerSide = false;*/
		
		//_hasFrontCappedHoles = true;
		//_hasBackCappedHoles = true;
    }
    
    private function pathChangeHandler(e : Event) : Void
    {
        invalidateTriangulation();
        invalidateGeometry();
        invalidateUVs();
    }
    
    private function addVertex(px : Float, py : Float, pz : Float, nx : Float, ny : Float, nz : Float, tx : Float, ty : Float, tz : Float) : Void
    {
        var compVertInd : Int = _vertexOffset + _nextVertexIndex * _stride;  // current component vertex index  
        _rawData[compVertInd++] = px;
        _rawData[compVertInd++] = py;
        _rawData[compVertInd++] = pz;
        _rawData[compVertInd++] = nx;
        _rawData[compVertInd++] = ny;
        _rawData[compVertInd++] = nz;
        _rawData[compVertInd++] = tx;
        _rawData[compVertInd++] = ty;
        _rawData[compVertInd++] = tz;
        _nextVertexIndex++;
    }
    
    private function addTriangle(cwVertexIndex0 : Int, cwVertexIndex1 : Int, cwVertexIndex2 : Int, clockwise : Bool = true) : Void
    {
		if (clockwise) {
			_rawIndices[_currentIndex++] = cwVertexIndex0;
			_rawIndices[_currentIndex++] = cwVertexIndex1;
			_rawIndices[_currentIndex++] = cwVertexIndex2;
		} else {
			_rawIndices[_currentIndex++] = cwVertexIndex0;
			_rawIndices[_currentIndex++] = cwVertexIndex2;
			_rawIndices[_currentIndex++] = cwVertexIndex1;
		}
        _currentTriangleIndex++;
    }
    
    private function invalidateTriangulation() : Void
    {
        _triangulationDirty = true;
    }
    
    private function updateTriangulation() : Void
    {
        buildTriangulation();
        _triangulationDirty = false;
    }
    
    private function buildTriangulation() : Void {
		if (_hasFront || _hasFrontCorner || _hasFrontInnerCorner || _hasFrontCappedHoles ||
			_hasBack || _hasBackCorner || _hasBackInnerCorner || _hasBackCappedHoles) {
			
			//make triangulationPoints and calculate hole offsets
			var holeIndices: Array<Int> = [];
			_triangulationPoints = _path.getVector().copy();
			for (innerPath in _path.getInnerPaths()) {
				holeIndices.push(_triangulationPoints.length);
				_triangulationPoints = _triangulationPoints.concat(innerPath.getVector());
			}
			
			//make coordinates with holes
			var holesCoordinates: Array<Float> = [];
			for (p in _triangulationPoints) {
				holesCoordinates.push(p.x);
				holesCoordinates.push(p.y);
			}
			
			//make coordinates without holes
			var coordinates: Array<Float> = holesCoordinates.copy();
			coordinates.resize(_path.length * 2);
			
			//build front triangulation indices
			if (_hasFront) {
				_frontTriangulationIndices = Earcut.earcut(
					_hasFrontHoles ? holesCoordinates : coordinates,
					_hasFrontHoles ? holeIndices : null
				);
			} else {
				_frontTriangulationIndices = null;
			}
			
			//build back triangulation indices
			if (_hasBack) {
				if (_frontTriangulationIndices != null && _hasFrontHoles == _hasBackHoles) {
					//use same indices when front and back are identical
					_backTriangulationIndices = _frontTriangulationIndices;
				} else {
					_backTriangulationIndices = Earcut.earcut(
						_hasBackHoles ? holesCoordinates : coordinates,
						_hasBackHoles ? holeIndices : null
					);
				}
			}
			
			//build corner points
			_cornerPoints = DiscretePathOffset.basicOffset(_path, -_cornerRound);
			for (innerPath in _path.getInnerPaths()) {
				_cornerPoints = _cornerPoints.concat(DiscretePathOffset.basicOffset(innerPath, -_innerCornerRound));
			}
			
			//build holes triagulation
			if (_hasFrontCappedHoles || _hasBackCappedHoles) {
				_holesTriangulationIndices = [];
				for (innerPath in _path.getInnerPaths()) {
					coordinates = [];
					for (p in innerPath.getVector()) {
						coordinates.push(p.x);
						coordinates.push(p.y);
					}
					_holesTriangulationIndices.push(Earcut.earcut(coordinates));
				}
			} else {
				_holesTriangulationIndices = null;
			}
		} else {
			_triangulationPoints = null;
			_frontTriangulationIndices = null;
			_backTriangulationIndices = null;
			_holesTriangulationIndices = null;
		}
    }
	
	private function printGeometryDetails() : Void {
		js.Browser.console.log(":: GEOMETRY DETAILS ::");
		js.Browser.console.log("numVertices: " + _numVertices);
		js.Browser.console.log("numVertices in rawData: " + _rawData.length / _stride);
		js.Browser.console.log("numTriangles: " + _numTriangles);
		js.Browser.console.log("numTriangles in rawIndices: " + _rawIndices.length / 3);
		//var i,j : Int = 0;
		for (i in 0...as3hx.Compat.parseInt(_rawIndices.length / 3)) {
			js.Browser.console.log("indices " + i + ": " + _rawIndices[i*3] + ", " + _rawIndices[i*3 + 1] + ", " + _rawIndices[i*3 + 2]);
		}
		for (i in 0...as3hx.Compat.parseInt(_rawData.length / _stride)) {
			var rawStr:String = "raw " + i + ": ";
			for (j in i * _stride...(i + 1) * _stride) {
				rawStr += _rawData[j] + ", ";
			}
			js.Browser.console.log(rawStr);
		}
		js.Browser.console.log("frontTriangulationIndices: " + _frontTriangulationIndices);
		js.Browser.console.log("backTriangulationIndices: " + _backTriangulationIndices);
		js.Browser.console.log("holesTriangulationIndices: " + _holesTriangulationIndices);
	}
    
	@:access(away3d.core.base.CompactSubGeometry.indexData)
    override private function buildGeometry(target : CompactSubGeometry) : Void {
        
        if (_triangulationDirty) {
            updateTriangulation();
        }
        
        //disable side if object is flat
        if (_thickness == 0) {
            _hasSide = false;
        }
        
        //init vars
        var length : Int;
        
        //init compact geometry offest
        _stride = target.vertexStride;
        _vertexOffset = target.vertexOffset;
        
        
        //reset utility variables
        _numVertices = 0;
		_numTriangles = 0;
        _nextVertexIndex = 0;
        _currentIndex = 0;
        _currentTriangleIndex = 0;
        
        //evaluate target number of vertices - side
		var buildFront:Bool = _hasSide || _hasFrontCorner;
		var buildBack:Bool = _hasSide || _hasBackCorner;
        if (buildFront || buildBack) {
			var pointVerticesCount:Int = (buildFront && buildBack) ? 2 : 1;
            for (point in _path.getVector()) {
                if (Std.is(point, DiscreteCornerPoint)) {
                    _numVertices += pointVerticesCount * 2;
                } else {
                    _numVertices += pointVerticesCount;
                }
            }
        }
		buildFront = _hasInnerSide || _hasFrontInnerCorner;
		buildBack = _hasInnerSide || _hasBackInnerCorner;
		if (buildFront || buildBack) {
			var pointVerticesCount:Int =  (buildFront && buildBack) ? 2 : 1;
			for (innerPath in _path.getInnerPaths()) {
				for (in_p in innerPath.getVector()) {
					if (Std.is(in_p, DiscreteCornerPoint)) {
						_numVertices += pointVerticesCount * 2;
					} else {
						_numVertices += pointVerticesCount;
					}
				}
			}
		}
		
		//evaluate target number of vertices - front/back
		var buildOuter:Bool = (_hasFront || _hasFrontCorner) && _triangulationPoints != null;
		var buildInner:Bool = ((_hasFront && _hasFrontHoles)  || _hasFrontInnerCorner) && _triangulationPoints != null;
		if (buildOuter && buildInner) {
			_numVertices += _triangulationPoints.length;
		} else if (buildOuter) {
			_numVertices += _path.length;
		} else if (buildInner) {
			_numVertices += _triangulationPoints.length - _path.length;
		}
		buildOuter = (_hasBack || _hasBackCorner) && _triangulationPoints != null;
		buildInner = ((_hasBack && _hasBackHoles)  || _hasBackInnerCorner) && _triangulationPoints != null;
		if (buildOuter && buildInner) {
			_numVertices += _triangulationPoints.length;
		} else if (buildOuter) {
			_numVertices += _path.length;
		} else if (buildInner) {
			_numVertices += _triangulationPoints.length - _path.length;
		}
		
		//evaluate target number of vertices - capped holes
		buildFront = _hasFrontCappedHoles;
		buildBack = _hasBackCappedHoles;
		if (buildFront || buildBack) {
			var pointVerticesCount:Int =  (buildFront && buildBack) ? 2 : 1;
			for (innerPath in _path.getInnerPaths()) {
				_numVertices += innerPath.length * pointVerticesCount;
			}
		}
		
		//evaluate target number of triangles - side
        if (_hasSide) {
            _numTriangles += (_path.length - 1) * 2;
            if (_path.closed) _numTriangles += 2;
        }
		if (_hasInnerSide) {
			for (innerPath in _path.getInnerPaths()) {
				_numTriangles += (innerPath.length - 1) * 2;
				if (innerPath.closed) _numTriangles += 2;
			}
		}
		
		//evaluate target number of triangles - front/back
        if (_hasFront && _frontTriangulationIndices != null) {
            _numTriangles += as3hx.Compat.parseInt(_frontTriangulationIndices.length / 3);
        }
        if (_hasBack && _backTriangulationIndices != null) {
            _numTriangles += as3hx.Compat.parseInt(_backTriangulationIndices.length / 3);
        }
		
		//evaluate target number of triangles - corner
		if (_hasFrontCorner && _cornerRound > 0) {
			_numTriangles += (_path.length - 1) * 2;
            if (_path.closed) _numTriangles += 2;
		}
		if (_hasFrontInnerCorner && _innerCornerRound > 0) {
			for (innerPath in _path.getInnerPaths()) {
				_numTriangles += (innerPath.length - 1) * 2;
				if (innerPath.closed) _numTriangles += 2;
			}
		}
		if (_hasBackCorner && _cornerRound > 0) {
			_numTriangles += (_path.length - 1) * 2;
            if (_path.closed) _numTriangles += 2;
		}
		if (_hasBackInnerCorner && _innerCornerRound > 0) {
			for (innerPath in _path.getInnerPaths()) {
				_numTriangles += (innerPath.length - 1) * 2;
				if (innerPath.closed) _numTriangles += 2;
			}
		}
		
		//evaluate target number of triangles - capped holes
		var cappedTrianglesMultiplier = 0;
		if (_hasFrontCappedHoles) ++cappedTrianglesMultiplier;
		if (_hasBackCappedHoles) ++cappedTrianglesMultiplier;
		if (cappedTrianglesMultiplier > 0 && _holesTriangulationIndices != null) {
			for (holeTInd in _holesTriangulationIndices) {
				_numTriangles += as3hx.Compat.parseInt(holeTInd.length / 3) * cappedTrianglesMultiplier;
			}
		}
        
        //need to initialize raw arrays or can be reused?
        if (_numVertices == target.numVertices) {
			_rawData = target.vertexData;
        } else {
            var numVertComponents : Int = _numVertices * _stride;
            _rawData = new Vector<Float>(numVertComponents, true);
        }
		if (_numTriangles == target.numTriangles) {
			_rawIndices = (target.indexData != null)?target.indexData:new Vector<UInt>(_numTriangles*3, true);
		} else {
			_rawIndices = new Vector<UInt>(_numTriangles*3, true);
		}
		
		//init path build holders
		var pathBuildHolder:PathBuildHolder = new PathBuildHolder();
		pathBuildHolder.path = _path;
		pathBuildHolder.isInner = false;
		_pathBuildHolders = [pathBuildHolder];
		for (innerPath in _path.getInnerPaths()) {
			pathBuildHolder = new PathBuildHolder();
			pathBuildHolder.path = innerPath;
			pathBuildHolder.isInner = true;
			_pathBuildHolders.push(pathBuildHolder);
		}
		
		//build side vertices
		for (holder in _pathBuildHolders) {
			var buildFront:Bool;
			var buildBack:Bool;
			var sideWidth:Float = _thickness;
			if (!holder.isInner) {
				buildFront = _hasSide || _hasFrontCorner;
				buildBack = _hasSide || _hasBackCorner;
				if (_cornerRound > 0) sideWidth -= _cornerRound * 2;
			} else {
				buildFront = _hasInnerSide || _hasFrontInnerCorner;
				buildBack = _hasInnerSide || _hasBackInnerCorner;
				if (_innerCornerRound > 0) sideWidth -= _innerCornerRound * 2;
			}
			if (buildFront) {
				holder.vertexSideFrontPointer = _nextVertexIndex;
				for (point in holder.path.getVector()) {
					addVertex(point.x, point.y, sideWidth / 2, Math.cos(point.normalAngle), Math.sin(point.normalAngle), 0, Math.cos(point.tangentAngle), Math.sin(point.tangentAngle), 0);
					if (Std.is(point, DiscreteCornerPoint)) {
						addVertex(point.x, point.y, sideWidth / 2, Math.cos(cast((point), DiscreteCornerPoint).secondNormalAngle), Math.sin(cast((point), DiscreteCornerPoint).secondNormalAngle), 0, Math.cos(cast((point), DiscreteCornerPoint).secondTangentAngle), Math.sin(cast((point), DiscreteCornerPoint).secondTangentAngle), 0);
					}
				}
			}
			if (buildBack) {
				holder.vertexSideBackPointer = _nextVertexIndex;
				for (point in holder.path.getVector()) {
					addVertex(point.x, point.y, -sideWidth / 2, Math.cos(point.normalAngle), Math.sin(point.normalAngle), 0, Math.cos(point.tangentAngle), Math.sin(point.tangentAngle), 0);
					if (Std.is(point, DiscreteCornerPoint)) {
						addVertex(point.x, point.y, -sideWidth / 2, Math.cos(cast((point), DiscreteCornerPoint).secondNormalAngle), Math.sin(cast((point), DiscreteCornerPoint).secondNormalAngle), 0, Math.cos(cast((point), DiscreteCornerPoint).secondTangentAngle), Math.sin(cast((point), DiscreteCornerPoint).secondTangentAngle), 0);
					}
				}
			}
			if (holder.isInner) {
				if (_hasFrontCappedHoles) {
					holder.vertexCappedFrontPointer = _nextVertexIndex;
					for (point in holder.path.getVector()) {
						addVertex(point.x, point.y, sideWidth / 2, 0, 0, 1, 1, 0, 0);
					}
				}
				if (_hasBackCappedHoles) {
					holder.vertexCappedBackPointer = _nextVertexIndex;
					for (point in holder.path.getVector()) {
						addVertex(point.x, point.y, -sideWidth / 2, 0, 0, -1, 1, 0, 0);
					}
				}
			}
		}
		
		//build front vertices
		if (_hasFront || _hasFrontCorner || _hasFrontInnerCorner) {
			var buildOuter:Bool = _hasFront || _hasFrontCorner;
			var buildInner:Bool = _hasFront && _hasFrontHoles || _hasFrontInnerCorner;
			for (holder in _pathBuildHolders) {
				if (!holder.isInner && buildOuter || holder.isInner && buildInner) {
					holder.vertexFrontPointer = _nextVertexIndex;
					holder.cornerPoints = DiscretePathOffset.basicOffset(holder.path, (!holder.isInner) ? (-_cornerRound) : (-_innerCornerRound));
					for (i in 0...holder.path.length) {
                        addVertex(holder.cornerPoints[i * 2], holder.cornerPoints[i * 2 + 1], _thickness / 2, 0, 0, 1, 1, 0, 0);
                    }
				}
			}
		}
		
		//build back vertices
		if (_hasBack || _hasBackCorner || _hasBackInnerCorner) {
			var buildOuter:Bool = _hasBack || _hasBackCorner;
			var buildInner:Bool = _hasBack && _hasBackHoles || _hasBackInnerCorner;
			for (holder in _pathBuildHolders) {
				if (!holder.isInner && buildOuter || holder.isInner && buildInner) {
					holder.vertexBackPointer = _nextVertexIndex;
					holder.cornerPoints = DiscretePathOffset.basicOffset(holder.path, (!holder.isInner) ? (-_cornerRound) : (-_innerCornerRound));
					for (i in 0...holder.path.length) {
                        addVertex(holder.cornerPoints[i * 2], holder.cornerPoints[i * 2 + 1], -_thickness / 2, 0, 0, -1, 1, 0, 0);
                    }
				}
			}
		}
		
		//build side triangles
		if (_hasSide || _hasInnerSide) {
			for (holder in _pathBuildHolders) {
				if ((!holder.isInner && _hasSide) || (holder.isInner && _hasInnerSide)) {
					var i:Int = 0;
					var clockwise:Bool = holder.path.normalsDirection == NormalsDirection.CLOCKWISE;
					for (point in holder.path.getVector()) {
						
						/**
						 * 	back	0---1
						 * 			| \ |	<- indices
						 * 	front	0---1
						 */
						
						if (i >= 1) {
							//if point not first
							addTriangle(holder.vertexSideFrontPointer + i - 1,	holder.vertexSideBackPointer + i - 1,	holder.vertexSideFrontPointer + i,	clockwise);
							addTriangle(holder.vertexSideFrontPointer + i,		holder.vertexSideBackPointer + i - 1,	holder.vertexSideBackPointer + i,	clockwise);
						}
						
						if (Std.is(point, DiscreteCornerPoint)) ++i;
						++i;
					}
					
					if (holder.path.closed) {
						addTriangle(holder.vertexSideFrontPointer + i - 1,	holder.vertexSideBackPointer + i - 1,	holder.vertexSideFrontPointer,	clockwise);
						addTriangle(holder.vertexSideFrontPointer,			holder.vertexSideBackPointer + i - 1,	holder.vertexSideBackPointer,	clockwise);
					}
				}
			}
		}
		
		//build front triangles
		if (_hasFront && _frontTriangulationIndices != null) {
			length = as3hx.Compat.parseInt(_frontTriangulationIndices.length / 3);
			var pointer:Int = _pathBuildHolders[0].vertexFrontPointer;
			for (i in 0...length) {
				addTriangle(
						pointer + _frontTriangulationIndices[i * 3], 
						pointer + _frontTriangulationIndices[i * 3 + 1], 
						pointer + _frontTriangulationIndices[i * 3 + 2]
				);
			}
		}
		
		//build back triangles
		if (_hasBack && _backTriangulationIndices != null) {
			length = as3hx.Compat.parseInt(_backTriangulationIndices.length / 3);
			var pointer:Int = _pathBuildHolders[0].vertexBackPointer;
			for (i in 0...length) {
				addTriangle(
						pointer + _backTriangulationIndices[i * 3], 
						pointer + _backTriangulationIndices[i * 3 + 1], 
						pointer + _backTriangulationIndices[i * 3 + 2],
						false
				);
			}
		}
		
		//build front corner triangles
		var buildOuter:Bool = _hasFrontCorner && _cornerRound > 0;
		var buildInner:Bool = _hasFrontInnerCorner && _innerCornerRound > 0;
		if (buildOuter || buildInner) {
			for (holder in _pathBuildHolders) {
				if (!holder.isInner && buildOuter || holder.isInner && buildInner) {
					buildCornerRoundTriangles(holder.path, holder.vertexSideFrontPointer, holder.vertexFrontPointer);
				}
			}
		}
		
		//build back corner triangles
		buildOuter = _hasBackCorner && _cornerRound > 0;
		buildInner = _hasBackInnerCorner && _innerCornerRound > 0;
		if (buildOuter || buildInner) {
			for (holder in _pathBuildHolders) {
				if (!holder.isInner && buildOuter || holder.isInner && buildInner) {
					buildCornerRoundTriangles(holder.path, holder.vertexSideBackPointer, holder.vertexBackPointer, NormalsDirection.ANTICLOCKWISE);
				}
			}
		}
		
		//build capped holes
		if (_holesTriangulationIndices != null && (_hasFrontCappedHoles || _hasBackCappedHoles)) {
			for (i in 0..._holesTriangulationIndices.length) {
				var holesTInd:Array<Int> = _holesTriangulationIndices[i];
				var holder:PathBuildHolder = _pathBuildHolders[i + 1];
				length = as3hx.Compat.parseInt(holesTInd.length / 3);
				var pointer:Int;
				/*var i:Int = 1;
				var mapper:Array<Int> = [];
				for (point in holder.path.getVector()) {
					mapper.push(i);
					if (Std.is(point, DiscreteCornerPoint)) {
						i += 2;
					} else {
						++i;
					}
				}*/
				if (_hasFrontCappedHoles) {
					pointer = holder.vertexCappedFrontPointer;
					for (i in 0...length) {
						addTriangle(
								pointer + holesTInd[i * 3], 
								pointer + holesTInd[i * 3 + 1], 
								pointer + holesTInd[i * 3 + 2]
						);
					}
				}
				if (_hasBackCappedHoles) {
					pointer = holder.vertexCappedBackPointer;
					for (i in 0...length) {
						addTriangle(
								pointer + holesTInd[i * 3], 
								pointer + holesTInd[i * 3 + 1], 
								pointer + holesTInd[i * 3 + 2],
								false
						);
					}
				}
			}
		}
        
        //build real data from raw data
        target.updateData(_rawData);
        target.updateIndexData(_rawIndices);
		
		//printGeometryDetails();
    }
	
	private function buildCornerRoundTriangles(path: DiscretePath, sideVertexIndexPointer: Int, vertexIndexPointer: Int, direction: Int = NormalsDirection.CLOCKWISE) : Void {
		var points:Array<DiscretePoint> = path.getVector();
		var length:Int = points.length;
		var offset:Int = 0;
		if (Std.is(points[0], DiscreteCornerPoint)) offset++;
		for (i in 1...length) {
			addTriangle(sideVertexIndexPointer + offset + 0, sideVertexIndexPointer + offset + 1, vertexIndexPointer + i - 1, path.normalsDirection == direction);
			addTriangle(sideVertexIndexPointer + offset + 1, vertexIndexPointer + i, vertexIndexPointer + i - 1, path.normalsDirection == direction);
			offset++;
			if (Std.is(points[i], DiscreteCornerPoint)) offset++;
		}
		if (path.closed) {
			addTriangle(sideVertexIndexPointer + offset + 0, sideVertexIndexPointer + 0, vertexIndexPointer + length - 1, path.normalsDirection == direction);
			addTriangle(sideVertexIndexPointer + 0, vertexIndexPointer, vertexIndexPointer + length - 1, path.normalsDirection == direction);
		}
	}
    
    override private function buildUVs(target : CompactSubGeometry) : Void {
        var UVData : Vector<Float>;
        var stride : Int = target.UVStride;
        //var secondaryStride:uint = target.secondaryUVStride;
        var skip : Int = stride - 2;
        //var secondarySkip:uint = secondaryStride - 2;
        
        //init mapping rectangle
        var mapRect : Rectangle = (_uvMappingRect != null)?_uvMappingRect:_path.bounds.clone();
        //var secondaryMapRect:Rectangle = _path.bounds.clone();
        
        // evaluate num uvs
        var numUvs : Int = _numVertices * stride;
        
        // need to initialize raw array or can be reused?
        if (target.UVData != null && numUvs == target.UVData.length) {
			UVData = target.UVData;
        } else {
            UVData = new Vector<Float>(numUvs, true);
            invalidateGeometry();
        }
		
		for (holder in _pathBuildHolders) {
			var pointer : Int;
			var firstOffset : Float = _cornerRound * EngineMath.SQRT2 * 0.6;
            var secondOffset : Float = _thickness - _cornerRound * 2 + _cornerRound * EngineMath.SQRT2 * 1.2;
			var normalX : Float; var normalY : Float;
			
			//build front side UVs
			if (holder.vertexSideFrontPointer >= 0) {
				pointer = holder.vertexSideFrontPointer * stride + target.UVOffset;
				for (point in holder.path.getVector()) {
					normalX = point.x + Math.cos(point.normalAngle) * firstOffset;
					normalY = point.y + Math.sin(point.normalAngle) * firstOffset;
					UVData[pointer++] = ((normalX - mapRect.left) / mapRect.width) * -target.scaleU + 1;
					UVData[pointer++] = ((normalY - mapRect.top) / mapRect.height) * -target.scaleV + 1;
					pointer += skip;
					if (Std.is(point, DiscreteCornerPoint)) {
						normalX = point.x + Math.cos(cast((point), DiscreteCornerPoint).secondNormalAngle) * firstOffset;
						normalY = point.y + Math.sin(cast((point), DiscreteCornerPoint).secondNormalAngle) * firstOffset;
						UVData[pointer++] = ((normalX - mapRect.left) / mapRect.width) * -target.scaleU + 1;
						UVData[pointer++] = ((normalY - mapRect.top) / mapRect.height) * -target.scaleV + 1;
						pointer += skip;
					}
				}
			}
			
			//build front capped holes UVs
			if (holder.vertexCappedFrontPointer >= 0) {
				pointer = holder.vertexCappedFrontPointer * stride + target.UVOffset;
				for (point in holder.path.getVector()) {
					UVData[pointer++] = ((point.x - mapRect.left) / mapRect.width) * -target.scaleU + 1;
					UVData[pointer++] = ((point.y - mapRect.top) / mapRect.height) * -target.scaleV + 1;
					pointer += skip;
				}
			}
			
			//build back side UVs
			if (holder.vertexSideBackPointer >= 0) {
				pointer = holder.vertexSideBackPointer * stride + target.UVOffset;
				for (point in holder.path.getVector()) {
					normalX = point.x + Math.cos(point.normalAngle) * secondOffset;
					normalY = point.y + Math.sin(point.normalAngle) * secondOffset;
					UVData[pointer++] = ((normalX - mapRect.left) / mapRect.width) * -target.scaleU + 1;
					UVData[pointer++] = ((normalY - mapRect.top) / mapRect.height) * -target.scaleV + 1;
					pointer += skip;
					if (Std.is(point, DiscreteCornerPoint)) {
						normalX = point.x + Math.cos(cast((point), DiscreteCornerPoint).secondNormalAngle) * secondOffset;
						normalY = point.y + Math.sin(cast((point), DiscreteCornerPoint).secondNormalAngle) * secondOffset;
						UVData[pointer++] = ((normalX - mapRect.left) / mapRect.width) * -target.scaleU + 1;
						UVData[pointer++] = ((normalY - mapRect.top) / mapRect.height) * -target.scaleV + 1;
						pointer += skip;
					}
				}
			}
			
			//build back capped holes UVs
			if (holder.vertexCappedBackPointer >= 0) {
				pointer = holder.vertexCappedBackPointer * stride + target.UVOffset;
				for (point in holder.path.getVector()) {
					UVData[pointer++] = ((point.x - mapRect.left) / mapRect.width) * -target.scaleU + 1;
					UVData[pointer++] = ((point.y - mapRect.top) / mapRect.height) * -target.scaleV + 1;
					pointer += skip;
				}
			}
			
			if (holder.cornerPoints != null) {
				var px : Float;
				var py : Float;
				
				//build front UVs
				if (holder.vertexFrontPointer >= 0) {
					pointer = holder.vertexFrontPointer * stride + target.UVOffset;
					for (i in 0...holder.path.length) {
						px = holder.cornerPoints[i * 2];
                        py = holder.cornerPoints[i * 2 + 1];
						UVData[pointer++] = ((px - mapRect.left) / mapRect.width) * -target.scaleU + 1;
						UVData[pointer++] = ((py - mapRect.top) / mapRect.height) * -target.scaleV + 1;
						pointer += skip;
					}
				}
				
				//build back UVs
				if (holder.vertexBackPointer >= 0) {
					pointer = holder.vertexBackPointer * stride + target.UVOffset;
					for (i in 0...holder.path.length) {
						px = holder.cornerPoints[i * 2];
                        py = holder.cornerPoints[i * 2 + 1];
						UVData[pointer++] = ((px - mapRect.left) / mapRect.width) * -target.scaleU + 1;
						UVData[pointer++] = ((py - mapRect.top) / mapRect.height) * -target.scaleV + 1;
						pointer += skip;
					}
				}
				
			}
			
		}
        
        // build real data from raw data
        target.updateData(UVData);
    }
    
    private function get_thickness() : Float
    {
        return _thickness;
    }
    
    private function set_thickness(value : Float) : Float
    {
        if (_thickness == Math.max(value, 0))
        {
            return value;
        }
        _thickness = Math.max(value, 0);
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
    
    private function get_cornerRound() : Float
    {
        return _cornerRound;
    }
    
    private function set_cornerRound(value : Float) : Float
    {
        if (_cornerRound == Math.max(value, 0))
        {
            return value;
        }
        _cornerRound = Math.max(Math.min(_thickness / 2, value), 0);
        invalidateTriangulation();
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
	
	private function get_innerCornerRound() : Float
    {
        return _innerCornerRound;
    }
    
    private function set_innerCornerRound(value : Float) : Float
    {
        if (_innerCornerRound == Math.max(value, 0))
        {
            return value;
        }
        _innerCornerRound = Math.max(Math.min(_thickness / 2, value), 0);
        invalidateTriangulation();
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
    
    private function get_uvMappingRect() : Rectangle
    {
        return _uvMappingRect;
    }
    
    private function set_uvMappingRect(value : Rectangle) : Rectangle
    {
        _uvMappingRect = value;
        invalidateUVs();
        return value;
    }
    
    private function get_path() : DiscretePath
    {
        return _path;
    }
    
    private function set_path(value : DiscretePath) : DiscretePath
    {
        _path = value;
        invalidateTriangulation();
        invalidateGeometry();
        invalidateUVs();
        return value;
    }
}

class PathBuildHolder {
	
	public function new() {}
	
	public var path:DiscretePath;
	public var isInner:Bool;
	public var vertexFrontPointer:Int = -1;
	public var vertexBackPointer:Int = -1;
	public var vertexSideFrontPointer:Int = -1;
	public var vertexSideBackPointer:Int = -1;
	public var vertexCappedFrontPointer:Int = -1;
	public var vertexCappedBackPointer:Int = -1;
	public var cornerPoints : Array<Float>;
	
}