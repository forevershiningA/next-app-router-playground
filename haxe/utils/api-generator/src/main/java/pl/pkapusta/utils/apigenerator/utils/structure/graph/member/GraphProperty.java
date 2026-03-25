package pl.pkapusta.utils.apigenerator.utils.structure.graph.member;

import pl.pkapusta.utils.apigenerator.utils.interfaces.SourceCodeMaker;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.PropertyDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.GraphClass;

/**
 * @author Przemysław Kapusta
 */
public class GraphProperty extends GraphMember<PropertyDefinition> {

    public GraphProperty(PropertyDefinition definition, GraphClass owner) {
        super(definition, owner);
    }

    public String getReadAccessIdentifier() {
        return definition.getReadAccessIdentifier();
    }

    public String getWriteAccessIdentifier() {
        return definition.getWriteAccessIdentifier();
    }

    @Override
    public String toSourceCode() {
        return toSourceCode(SourceCodeMaker.Options.DEFAULT);
    }

    @Override
    public String toSourceCode(final SourceCodeMaker.Options options) {
        StringBuilder sb = new StringBuilder();
        if (options.getMembersModifiers() && getModifiers() != null) for (String modifier: getModifiers()) {
            sb.append(modifier);
            sb.append(' ');
        }
        sb.append("var ");
        sb.append(getName());
        sb.append('(');
        sb.append(getReadAccessIdentifier());
        sb.append(", ");
        sb.append(getWriteAccessIdentifier());
        sb.append(')');
        sb.append(':');
        sb.append(getType().toSourceCode(options));
        sb.append(';');
        return sb.toString();
    }

}
