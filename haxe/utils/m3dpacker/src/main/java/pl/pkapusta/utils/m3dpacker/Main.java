/**
 * M3D Packer
 * @author Przemys�aw Kapusta
 */

package pl.pkapusta.utils.m3dpacker;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;

import pl.pkapusta.utils.m3dpacker.exceptions.M3DPackerException;
import pl.pkapusta.utils.m3dpacker.input.InputData;
import pl.pkapusta.utils.m3dpacker.params.ParamsReader;
import pl.pkapusta.utils.m3dpacker.parser.M3DParser;

public class Main {

	public static void main(String s[]) throws NoSuchAlgorithmException, IOException {
		
		try {
			
			InputData input = new InputData(new ParamsReader(s));
		
			FileOutputStream outStream = null;
			BufferedOutputStream outBuffered = null;
			
			File outFile = new File(input.getOutputFile());
			outFile.getAbsoluteFile().getParentFile().mkdir();
			
			try {
				
				outStream = new FileOutputStream(outFile);
				outBuffered = new BufferedOutputStream(outStream);
				
				System.out.print("M3D Packing: " + input.getOutputFile());
				
				M3DParser parser = new M3DParser(input);
				parser.process(outBuffered);
				
				outBuffered.flush();
				outBuffered.close();
				outStream.flush();
				
				System.out.println(" ... success");
				
			} catch (FileNotFoundException e) {
				System.err.println("M3DPacker file not found error: " + e.getMessage());
				System.exit(1);
			} finally {
				if (outStream != null) outStream.close();
			}
			
		} catch (M3DPackerException e) {
			System.err.println("M3DPacker error: " + e.getMessage());
			System.exit(1);
		}
		
	}
	
}
