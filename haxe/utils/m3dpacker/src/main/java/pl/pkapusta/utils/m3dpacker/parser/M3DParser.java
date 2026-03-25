package pl.pkapusta.utils.m3dpacker.parser;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import pl.pkapusta.utils.m3dpacker.input.InputData;
import pl.pkapusta.utils.m3dpacker.parser.v1.M3DV1Parser;
import pl.pkapusta.utils.m3dpacker.parser.v1.M3DV2Parser;

public class M3DParser {

	static private final Integer BASIC_HEADER_COMP1 = 0xFFFF0000;
	static private final String BASIC_HEADER_COMP2 = "WPF0";
	static private final Integer BASIC_HEADER_COMP3 = 0x0000FFFF;
	static private final String MODEL_HEADER_COMP1 = "MODL";
	static private final Integer MODEL_HEADER_COMP2 = 0xFFFFFFFF;
	
	private InputData input;
	private byte version;
	
	public M3DParser(InputData input) {
		this.input = input;
		version = (this.input.getVersion() != null)?this.input.getVersion():2;
	}
	
	public void process(OutputStream out) throws IOException, NoSuchAlgorithmException {
		
		ByteArrayOutputStream contentByteArray = new ByteArrayOutputStream();
		DataOutputStream outputData = new DataOutputStream(contentByteArray);
		writeHeader(outputData);
		switch (version) {
			case 1:
				M3DV1Parser.process(this, outputData);
				break;
			case 2:
				M3DV2Parser.process(this, outputData);
				break;
			default:
				throw new IOException("Unknown file version");
		}
		outputData.close();
		
		//digit data
		byte[] contentBytes = contentByteArray.toByteArray();
		MessageDigest md = MessageDigest.getInstance("SHA-1");
		byte[] sha1hash = md.digest(contentBytes);
		
		out.write(contentBytes);
		out.write(sha1hash);
		
	}

	private void writeHeader(DataOutputStream out) throws IOException {
		out.writeInt(BASIC_HEADER_COMP1);
		out.writeBytes(BASIC_HEADER_COMP2);
		out.writeInt(BASIC_HEADER_COMP3);
		out.writeBytes(MODEL_HEADER_COMP1);
		out.writeByte(version);
		out.writeByte((input.isCompressed())?1:0);
		out.writeInt(MODEL_HEADER_COMP2);
	}
	
	public InputData getInput() {
		return input;
	}

	public void setInput(InputData input) {
		this.input = input;
	}
	
}
