package pl.pkapusta.utils.themebuilder.exceptions;

public class ThemeBuilderException extends Exception {

	private static final long serialVersionUID = 2111219445741604831L;

	public ThemeBuilderException(String message) {
		super(message);
	}
	
	public ThemeBuilderException(Throwable throwable) {
		super(throwable);
	}
	
	public ThemeBuilderException(String message, Throwable throwable) {
		super(message, throwable);
	}
	
}
