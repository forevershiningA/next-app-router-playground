package pl.pkapusta.utils.themebuilder.params;
import java.util.ArrayList;
import java.util.List;


public class Param {
	
	private String _name;
	
	private List<String> _params;

	public Param(String name) {
		_name = name;
		_params = new ArrayList<String>();
	}
	
	public String getName() {
		return _name;
	}
	
	public void addParam(String s) {
		_params.add(s);
	}
	
	public String[] getAllParams() {
		return _params.toArray(new String[_params.size()]);
	}
	
}
