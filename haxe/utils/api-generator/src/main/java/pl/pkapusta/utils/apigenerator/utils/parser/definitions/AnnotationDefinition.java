package pl.pkapusta.utils.apigenerator.utils.parser.definitions;

import pl.pkapusta.utils.apigenerator.utils.interfaces.SourceCodeMaker;

/**
 * @author Przemysław Kapusta
 */
public class AnnotationDefinition implements SourceCodeMaker {

    private String name;
    private String params;

    public AnnotationDefinition(String name, String params) {
        this.name = name;
        this.params = params;
    }

    public String getName() {
        return name;
    }

    public String getParams() {
        return params;
    }

    @Override
    public String toString() {
        return "AnnotationDefinition{" +
                "name='" + name + '\'' +
                ", params='" + params + '\'' +
                '}';
    }

    @Override
    public String toSourceCode() {
        return toSourceCode(Options.DEFAULT);
    }

    @Override
    public String toSourceCode(Options options) {
        StringBuilder sb = new StringBuilder("@:");
        sb.append(name);
        if (params != null) {
            sb.append('(');
            sb.append(params);
            sb.append(')');
        }
        return sb.toString();
    }

}
