package pl.pkapusta.utils.apigenerator.utils.interfaces;

/**
 * @author Przemysław Kapusta
 */
public interface Visibility {

    boolean isVisible();
    VisibilityModifier getVisibilityModifier();

    static enum VisibilityModifier {
        PUBLIC,
        PRIVATE,
        DEFAULT
    }

}
