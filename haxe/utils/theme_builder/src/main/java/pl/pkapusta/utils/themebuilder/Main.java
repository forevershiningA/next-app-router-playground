/**
 * Theme Builder
 * @author Przemys�aw Kapusta
 */

package pl.pkapusta.utils.themebuilder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.xml.parsers.ParserConfigurationException;

import org.xml.sax.SAXException;

import pl.pkapusta.utils.themebuilder.build.FileBuilder;
import pl.pkapusta.utils.themebuilder.exceptions.ThemeBuilderException;
import pl.pkapusta.utils.themebuilder.input.InputData;
import pl.pkapusta.utils.themebuilder.input.ThemeConfigParams;
import pl.pkapusta.utils.themebuilder.params.ParamsReader;

public class Main {

	public static void main(String s[]) {
		
		try {
			
			InputData input = new InputData(new ParamsReader(s));
			ThemeConfigParams configParams = new ThemeConfigParams(input.getThemeConfigFile());
			
			File outputDir = new File(input.getOutputDir());
			outputDir.mkdirs();
			
			for (String inputFile: input.getInputFiles()) {
				Path inputPath = Paths.get(inputFile);
				String fileName = inputPath.getFileName().toString();
				Path outputPath = Paths.get(input.getOutputDir() + File.separator + fileName);
				
				System.out.print("ThemeBuilder build file " + outputPath.toAbsolutePath().toString() + " ... ");
				
				FileBuilder.build(configParams, inputPath, outputPath);
				
				System.out.println("success");
				
			}
			
		} catch (ThemeBuilderException e) {
			System.err.println("ThemeBuilder error: " + e.getMessage());
		} catch (ParserConfigurationException e) {
			System.err.println("ThemeBuilder error: " + e.getMessage());
		} catch (SAXException e) {
			System.err.println("ThemeBuilder error: " + e.getMessage());
		} catch (IOException e) {
			System.err.println("ThemeBuilder error: " + e.getMessage());
		}
		
	}
	
}
