package pl.pkapusta.utils.themebuilder.input;

import java.util.LinkedHashSet;
import java.util.Set;

import pl.pkapusta.utils.themebuilder.exceptions.ThemeBuilderException;
import pl.pkapusta.utils.themebuilder.params.Param;
import pl.pkapusta.utils.themebuilder.params.ParamsReader;

public class InputData {
	
	private String outputDir = null;
	private Set<String> inputFiles = null;
	private String themeConfigFile = null;

	public InputData(ParamsReader reader) throws ThemeBuilderException {
		
		//out dir param
		Param[] params = reader.getParams("-output");
		if (params == null) params = reader.getParams("-out");
		if (params == null) params = reader.getParams("-o");
		if (params == null) throw new ThemeBuilderException("Missing output param");
		String[] paramStrings = params[0].getAllParams();
		if (paramStrings == null || paramStrings.length == 0) throw new ThemeBuilderException("Missing output dir path");
		outputDir = paramStrings[0];
		
		//theme config file param
		params = reader.getParams("-config");
		if (params == null) params = reader.getParams("-theme-config");
		if (params == null) params = reader.getParams("-t");
		if (params == null) params = reader.getParams("-c");
		if (params == null) throw new ThemeBuilderException("Missing theme-config param");
		paramStrings = params[0].getAllParams();
		if (paramStrings == null || paramStrings.length == 0) throw new ThemeBuilderException("Missing theme-config file path");
		themeConfigFile = paramStrings[0];
		
		//theme config file param
		params = reader.getParams("-input");
		if (params == null) params = reader.getParams("-input-file");
		if (params == null) params = reader.getParams("-input-files");
		if (params == null) params = reader.getParams("-i");
		if (params == null) throw new ThemeBuilderException("Missing input files param");
		paramStrings = params[0].getAllParams();
		if (paramStrings == null || paramStrings.length == 0) throw new ThemeBuilderException("Missing input files path");
		inputFiles = new LinkedHashSet<String>();
		for (String param: paramStrings) inputFiles.add(param);
		
	}

	public String getOutputDir() {
		return outputDir;
	}

	public Set<String> getInputFiles() {
		return inputFiles;
	}

	public String getThemeConfigFile() {
		return themeConfigFile;
	}
	
}
