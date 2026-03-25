package pl.pkapusta.utils.themebuilder.input;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class ThemeConfigParams {
	
	private Map<String, String> paramsMap;

	public ThemeConfigParams(String configFile) throws ParserConfigurationException, SAXException, IOException {
		paramsMap = new HashMap<String, String>();
		Document xmldoc = loadXML(configFile);
		parseParams(xmldoc, configFile);
	}
	
	private Document loadXML(String xmlFile) throws SAXException, IOException, ParserConfigurationException {
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		DocumentBuilder db = dbf.newDocumentBuilder();
		return db.parse(xmlFile);
	}
	
	private void parseParams(Document xmldoc, String xmlFile) throws SAXException, IOException, ParserConfigurationException {
		Element rootNode = xmldoc.getDocumentElement();
		NodeList nl = rootNode.getElementsByTagName("import");
		if (nl != null && nl.getLength() > 0) {
			for(int i = 0 ; i < nl.getLength(); i++) {
				Element el = (Element)nl.item(i);
				String url = null;
				if (el.hasAttribute("file")) {
					url = el.getAttribute("file");
				}
				if (el.hasAttribute("src")) {
					url = el.getAttribute("src");
				}
				if (el.hasAttribute("url")) {
					url = el.getAttribute("url");
				}
				if (url != null) {
					Path importPath = Paths.get(xmlFile).getParent().resolve(Paths.get(url)).normalize();
					Document importXmldoc = loadXML(importPath.toString());
					parseParams(importXmldoc, importPath.toString());
				}
			}
		}
		
		nl = rootNode.getElementsByTagName("param");
		if (nl != null && nl.getLength() > 0) {
			for(int i = 0 ; i < nl.getLength(); i++) {
				Element el = (Element)nl.item(i);
				String name = null;
				if (el.hasAttribute("name")) {
					name = el.getAttribute("name");
				} else if (el.hasAttribute("id")) {
					name = el.getAttribute("id");
				}
				if (name != null) {
					paramsMap.put(name, el.getTextContent());
				}
			}
		}
	}
	
	public Map<String, String> getAllParams() {
		return paramsMap;
	}
	
	public String getParam(String name) {
		if (paramsMap.containsKey(name)) return paramsMap.get(name);
		return null;
	}
	
	public boolean hasParam(String name) {
		return paramsMap.containsKey(name);
	}
	
}
