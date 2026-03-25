package pl.pkapusta.utils.themebuilder.params;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;


public class ParamsReader {
	
	private HashMap<String, List<Param>> paramMap;

	public ParamsReader(String s[]) {
		
		paramMap = new HashMap<String, List<Param>>();
		List<Param> pList;
		Param currentParam = null;
		
		for (int i = 0; i < s.length; i++) {
			
			String p = s[i];
			
			if (p.charAt(0) == '-') {
				
				if (currentParam != null) {
					if (paramMap.containsKey(currentParam.getName())) {
						pList = paramMap.get(currentParam.getName());
						pList.add(currentParam);
					} else {
						pList = new ArrayList<Param>();
						pList.add(currentParam);
						paramMap.put(currentParam.getName(), pList);
					}
					currentParam = null;
				}
				
				currentParam = new Param(p);
				
			} else {
				
				if (currentParam != null) {
					currentParam.addParam(p);
				}
				
			}
			
		}
		
		if (currentParam != null) {
			if (paramMap.containsKey(currentParam.getName())) {
				pList = paramMap.get(currentParam.getName());
				pList.add(currentParam);
			} else {
				pList = new ArrayList<Param>();
				pList.add(currentParam);
				paramMap.put(currentParam.getName(), pList);
			}
			currentParam = null;
		}
		
	}
	
	public boolean hasParams(String name) {
		return paramMap.containsKey(name);
	}
	
	public int paramsCount(String name) {
		if (!hasParams(name)) return 0;
		return paramMap.get(name).size();
	}
	
	public Param[] getParams(String name) {
		if (!hasParams(name)) return null;
		List<Param> p = paramMap.get(name);
		return p.toArray(new Param[p.size()]);
	}
	
}
