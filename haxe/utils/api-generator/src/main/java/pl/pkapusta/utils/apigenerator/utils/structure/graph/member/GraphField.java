package pl.pkapusta.utils.apigenerator.utils.structure.graph.member;

import pl.pkapusta.utils.apigenerator.utils.interfaces.SourceCodeMaker;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.FieldDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.GraphClass;

/**
 * @author Przemysław Kapusta
 */
public class GraphField extends GraphMember<FieldDefinition> {

    public GraphField(FieldDefinition definition, GraphClass owner) {
        super(definition, owner);
    }

    public String getAssignment() {
        return definition.getAssignment();
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
        sb.append(':');
        sb.append(getType().toSourceCode(options));
        if (options.getFieldsAssigment() && getAssignment() != null) {
            sb.append(" = ");
            sb.append(getAssignment());
        }
        sb.append(';');
        return sb.toString();
    }

}
