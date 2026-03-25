package pl.pkapusta.engine.common.data.parsers.project;

extern interface IProjectElementReader {
	function readProjectElement(xml:Any, embedReader:Any, context:Any):Void;
}