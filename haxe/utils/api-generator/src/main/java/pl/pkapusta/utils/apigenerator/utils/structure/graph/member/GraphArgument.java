package pl.pkapusta.utils.apigenerator.utils.structure.graph.member;

import pl.pkapusta.utils.apigenerator.utils.parser.definitions.misc.ArgumentDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.GraphClass;

/**
 * @author Przemysław Kapusta
 */
public class GraphArgument extends GraphMember<ArgumentDefinition> {

    public GraphArgument(ArgumentDefinition definition, GraphClass owner) {
        super(definition, owner);
    }

    public String getAssignment() {
        return definition.getAssignment();
    }

    @Override
    public String toSourceCode() {
        return toSourceCode(Options.DEFAULT);
    }

    @Override
    public String toSourceCode(final Options options) {
        StringBuilder sb = new StringBuilder();
        if (options.getArgumentsModifiers() && getModifiers() != null) for (String modifier: getModifiers()) {
            sb.append(modifier);
            sb.append(' ');
        }
        sb.append(getName());
        sb.append(':');
        sb.append(getType().toSourceCode(options));
        if (options.getArgumentsAssigment() && getAssignment() != null) {
            sb.append(" = ");
            sb.append(getAssignment());
        }
        return sb.toString();
    }

}
