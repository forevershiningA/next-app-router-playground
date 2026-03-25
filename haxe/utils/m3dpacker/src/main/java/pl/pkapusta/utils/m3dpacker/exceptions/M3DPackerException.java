package pl.pkapusta.utils.m3dpacker.exceptions;

public class M3DPackerException extends Exception {

	private static final long serialVersionUID = 2111219445741604831L;

	public M3DPackerException(String message) {
		super(message);
	}
	
	public M3DPackerException(Throwable throwable) {
		super(throwable);
	}
	
	public M3DPackerException(String message, Throwable throwable) {
		super(message, throwable);
	}
	
}
