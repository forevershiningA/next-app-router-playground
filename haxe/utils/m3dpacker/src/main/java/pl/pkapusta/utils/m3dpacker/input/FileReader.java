package pl.pkapusta.utils.m3dpacker.input;

import org.apache.commons.io.IOUtils;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class FileReader {

	static public byte[] readFile(String path) throws IOException {
		
		byte[] fileData = null;
		InputStream fileStream = null;
		try {
			fileStream = new BufferedInputStream(new FileInputStream(path));
			fileData = IOUtils.toByteArray(fileStream);
		} finally {
			if (fileStream != null) fileStream.close();
		}
		return fileData;
		
	}
	
	static public void readFile(String path, OutputStream out) throws IOException {
		
		InputStream fileStream = null;
		try {
			fileStream = new BufferedInputStream(new FileInputStream(path));
			IOUtils.copy(fileStream, out);
		} finally {
			if (fileStream != null) fileStream.close();
		}
		
	}
	
}
