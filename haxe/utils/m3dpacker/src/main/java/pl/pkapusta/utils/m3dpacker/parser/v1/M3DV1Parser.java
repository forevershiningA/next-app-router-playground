package pl.pkapusta.utils.m3dpacker.parser.v1;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.zip.DeflaterOutputStream;

import pl.pkapusta.utils.m3dpacker.input.FileReader;
import pl.pkapusta.utils.m3dpacker.input.InputAsset;
import pl.pkapusta.utils.m3dpacker.parser.M3DParser;

/**
 * Old Flash M3D Parser
 */
public class M3DV1Parser {

	static public void process(M3DParser parser, DataOutputStream out) throws IOException, NoSuchAlgorithmException {
		
		//init streams
		ByteArrayOutputStream contentByteArray = new ByteArrayOutputStream();
		DeflaterOutputStream contentDeflater = null;
		DataOutputStream contentData = null;
		if (parser.getInput().isCompressed()) {
			contentDeflater = new DeflaterOutputStream(contentByteArray);
			contentData = new DataOutputStream(contentDeflater);
		} else {
			contentData = new DataOutputStream(contentByteArray);
		}
		byte[] fileData;
		
		
		//write definition
		fileData = FileReader.readFile(parser.getInput().getDefinitionFile());
		contentData.writeShort(fileData.length);
		contentData.write(fileData);
		
		//write asserts
		List<InputAsset> assets = parser.getInput().getInputAssets();
		contentData.writeShort(assets.size());
		for (InputAsset asset: assets) {
			fileData = FileReader.readFile(asset.getDataFile());
			contentData.writeUTF(asset.getId());
			contentData.writeByte(asset.getType().getStoreId());
			contentData.writeInt(fileData.length);
			contentData.write(fileData);
			if (asset.getExecutorFile() != null) {
				fileData = FileReader.readFile(asset.getExecutorFile());
				contentData.writeBoolean(true);
				contentData.writeInt(fileData.length);
				contentData.write(fileData);
			} else {
				contentData.writeBoolean(false);
			}
		}
		
		//write executor
		if (parser.getInput().getExecutorFile() == null) {
			contentData.writeBoolean(false);
		} else {
			fileData = FileReader.readFile(parser.getInput().getExecutorFile());
			contentData.writeBoolean(true);
			contentData.writeInt(fileData.length);
			contentData.write(fileData);
		}
		
		
		//packing data
		contentData.flush();
		contentData.close();
		if (contentDeflater != null) {
			contentDeflater.flush();
			contentDeflater.close();
		}
		contentByteArray.flush();
		byte[] contentBytes = contentByteArray.toByteArray();
		contentByteArray.close();
		
		//write data out
		out.writeInt(contentBytes.length);
		out.write(contentBytes);
		
	}
	
}
