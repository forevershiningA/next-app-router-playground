package pl.pkapusta.utils.themebuilder.build;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import pl.pkapusta.utils.themebuilder.input.ThemeConfigParams;

public class FileBuilder {

	static public void build(ThemeConfigParams params, Path inputFile, Path outputFile) throws IOException {
		
		//odczyt
		String inputString = new String(Files.readAllBytes(inputFile));
		
		//jeśli plik jest plikiem haxe trzeba zmienić jego pakiet na nowy
		boolean isAS3File = inputFile.getFileName().toString().toLowerCase().endsWith(".hx");
		if (isAS3File) {
			Pattern pattern = Pattern.compile("package\\s+(.*)\\s*;");
			Matcher m = pattern.matcher(inputString);
			if (m.find()) {
				String packageString = m.group(1);
				Path rel = inputFile.getParent().relativize(outputFile.getParent());
				Iterator<Path> relIt = rel.iterator();
				while (relIt.hasNext()) {
					String pathElement = relIt.next().toString();
					if (pathElement.equals("..")) {
						int idx = packageString.lastIndexOf(".");
						if (idx > 0) {
							packageString = packageString.substring(0, idx);
						} else {
							packageString = "";
						}
					} else if (!pathElement.equals(".")) {
						if (packageString.isEmpty()) {
							packageString = pathElement;
						} else {
							packageString = packageString + "." + pathElement;
						}
					}
				}
				inputString = inputString.replaceFirst(pattern.toString(), "package " + packageString + ";");
			}
		}
		
		inputString = replaceParameters(params, inputString, 0);
		
		//zapis
		Files.write(outputFile, inputString.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
		
	}
	
	static private String replaceParameters(ThemeConfigParams params, String input, int depth) throws IOException {
		if (depth > 16) return input;
		
		String str = input;
		
		//odczyt parametr�w
		Pattern pattern = Pattern.compile("\\$\\{([^\\{\\}\\s]+)\\}");
		Matcher m = pattern.matcher(input);
		Set<String> inputParameters = new LinkedHashSet<String>();
		while (m.find()) inputParameters.add(m.group(1));
		
		//wstawienie parametr�w
		for (String paramName: inputParameters) {
			if (params.hasParam(paramName)) {
				String paramValue = params.getParam(paramName);
				paramValue = replaceParameters(params, paramValue, depth + 1);
				str = str.replaceAll(Pattern.quote("${"+paramName+"}"), paramValue);
			}
		}
		
		//czyszczenie nieu�ywanych parametr�w
		return str.replaceAll("\\$\\{[^\\{\\}\\s]+\\}", "");
		
	}
	
}
