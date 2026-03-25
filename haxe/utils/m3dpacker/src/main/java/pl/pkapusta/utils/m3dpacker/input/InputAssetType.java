package pl.pkapusta.utils.m3dpacker.input;

import java.util.HashSet;
import java.util.Set;

public enum InputAssetType {

	UNDEFINED		((byte)0, new String[]{"0", "undefined", "none", "unknown", "other"}),
	OBJECT_3D		((byte)1, new String[]{"1", "object3d", "3dobject", "3d", "obj3d"}),
	TEXTURE			((byte)2, new String[]{"2", "texture", "tex"}),
	FLASH_OBJECT	((byte)3, new String[]{"3", "flash", "flashobject", "flash_object", "swf"});
	
	public static InputAssetType fromAlias(String alias) {
		for (InputAssetType type: values()) if (type.hasAlias(alias)) return type;
		return null;
	}
	
	private byte storeId;
	private Set<String> inputAliases;
	
	private InputAssetType(byte storeId, String[] inputAliases) {
		this.storeId = storeId;
		this.inputAliases = new HashSet<String>();
		for (String alias: inputAliases) this.inputAliases.add(alias);
	}
	
	public boolean hasAlias(String alias) {
		return inputAliases.contains(alias);
	}

	public byte getStoreId() {
		return storeId;
	}

	public Set<String> getInputAliases() {
		return inputAliases;
	}
	
}
