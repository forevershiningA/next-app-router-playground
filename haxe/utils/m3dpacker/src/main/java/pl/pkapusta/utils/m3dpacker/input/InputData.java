package pl.pkapusta.utils.m3dpacker.input;

import java.util.ArrayList;
import java.util.List;

import pl.pkapusta.utils.m3dpacker.exceptions.M3DPackerException;
import pl.pkapusta.utils.m3dpacker.params.Param;
import pl.pkapusta.utils.m3dpacker.params.ParamsReader;

public class InputData {
	
	private String outputFile = null;
	private Byte version = null;
	private boolean compressed = true;
	private String definitionFile = null;
	private String executorFile = null;
	private List<InputAsset> inputAssets = null;

	public InputData(ParamsReader reader) throws M3DPackerException {
		
		//out file param
		Param[] params = reader.getParams("-output");
		if (params == null) params = reader.getParams("-out");
		if (params == null) params = reader.getParams("-o");
		if (params == null) throw new M3DPackerException("Missing output param");
		String[] paramStrings = params[0].getAllParams();
		if (paramStrings == null || paramStrings.length == 0) throw new M3DPackerException("Missing output file name");
		outputFile = paramStrings[0];
		
		//version data
		params = reader.getParams("-version");
		if (params == null) params = reader.getParams("-ver");
		if (params == null) params = reader.getParams("-v");
		if (params != null) {
			paramStrings = params[0].getAllParams();
			if (paramStrings != null && paramStrings.length > 0) version = Byte.valueOf(paramStrings[0]);
		}
		
		//is compressed data
		params = reader.getParams("-compress");
		if (params == null) params = reader.getParams("-compressed");
		if (params == null) params = reader.getParams("-c");
		if (params != null) compressed = true;
		params = reader.getParams("-nocompress");
		if (params == null) params = reader.getParams("-nocompressed");
		if (params != null) compressed = false;
		
		//definition file
		params = reader.getParams("-definition");
		if (params == null) params = reader.getParams("-def");
		if (params == null) params = reader.getParams("-d");
		if (params == null) throw new M3DPackerException("Missing definition param");
		paramStrings = params[0].getAllParams();
		if (paramStrings == null || paramStrings.length == 0) throw new M3DPackerException("Missing definition file name");
		definitionFile = paramStrings[0];
		
		//executor file
		params = reader.getParams("-executor");
		if (params == null) params = reader.getParams("-exec");
		if (params == null) params = reader.getParams("-exe");
		if (params == null) params = reader.getParams("-e");
		if (params == null) throw new M3DPackerException("Missing executor param");
		paramStrings = params[0].getAllParams();
		if (paramStrings == null || paramStrings.length == 0) throw new M3DPackerException("Missing executor file name");
		executorFile = paramStrings[0];
		
		//asset files
		inputAssets = new ArrayList<InputAsset>();
		params = reader.getParams("-asset");
		if (params == null) params = reader.getParams("-add");
		if (params == null) params = reader.getParams("-a");
		if (params != null) {
			for (Param p: params) inputAssets.add(new InputAsset(p));
		}
		
	}

	public String getOutputFile() {
		return outputFile;
	}

	public Byte getVersion() {
		return version;
	}

	public boolean isCompressed() {
		return compressed;
	}

	public String getDefinitionFile() {
		return definitionFile;
	}

	public String getExecutorFile() {
		return executorFile;
	}

	public List<InputAsset> getInputAssets() {
		return inputAssets;
	}
	
}
