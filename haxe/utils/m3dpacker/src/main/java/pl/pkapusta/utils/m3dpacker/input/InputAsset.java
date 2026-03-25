package pl.pkapusta.utils.m3dpacker.input;

import pl.pkapusta.utils.m3dpacker.exceptions.M3DPackerException;
import pl.pkapusta.utils.m3dpacker.params.Param;

public class InputAsset {

	private String id = null;
	private InputAssetType type = null;
	private String dataFile = null;
	private String executorFile = null;
	
	InputAsset(Param assetParam) throws M3DPackerException {
		
		String[] values = assetParam.getAllParams();
		if (values == null || values.length < 3) throw new M3DPackerException("Missing asset properties");
		
		type = InputAssetType.fromAlias(values[0]);
		if (type == null) throw new M3DPackerException("Asset type not supported (type = '" + values[0] + "')");
		
		id = values[1];
		if (id.isEmpty()) throw new M3DPackerException("Missing asset id value");
		
		dataFile = values[2];
		if (dataFile.isEmpty()) throw new M3DPackerException("Missing asset data file path");
		
		if (type.equals(InputAssetType.OBJECT_3D) && values.length >= 4) {
			executorFile = values[3];
			if (executorFile.isEmpty()) throw new M3DPackerException("Missing asset executor file path");
		}
		
	}

	public String getId() {
		return id;
	}

	public InputAssetType getType() {
		return type;
	}

	public String getDataFile() {
		return dataFile;
	}

	public String getExecutorFile() {
		return executorFile;
	}
	
}
