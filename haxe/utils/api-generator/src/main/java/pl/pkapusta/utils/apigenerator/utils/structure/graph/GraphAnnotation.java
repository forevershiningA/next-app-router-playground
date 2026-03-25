package pl.pkapusta.utils.apigenerator.utils.structure.graph;

import pl.pkapusta.utils.apigenerator.utils.interfaces.SourceCodeMaker;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.AnnotationDefinition;

/**
 * @author Przemysław Kapusta
 */
public class GraphAnnotation implements SourceCodeMaker {

    public static GraphAnnotation fromDefinition(AnnotationDefinition definition) {
        return new GraphAnnotation(definition);
    }

    private String name;
    private String params;

    public GraphAnnotation(String name, String params) {
        this.name = name;
        this.params = params;
    }

    public GraphAnnotation(String name) {
        this(name, null);
    }

    protected GraphAnnotation(AnnotationDefinition definition) {
        this(definition.getName(), definition.getParams());
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getParams() {
        return params;
    }

    public void setParams(String params) {
        this.params = params;
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
