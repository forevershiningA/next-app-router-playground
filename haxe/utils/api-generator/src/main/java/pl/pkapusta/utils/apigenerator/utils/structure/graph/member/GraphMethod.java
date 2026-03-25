package pl.pkapusta.utils.apigenerator.utils.structure.graph.member;

import pl.pkapusta.utils.apigenerator.utils.interfaces.SourceCodeMaker;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.ClassDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.MethodDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.misc.ArgumentDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.GraphClass;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.type.GraphBasicType;

import java.util.LinkedList;
import java.util.List;

/**
 * @author Przemysław Kapusta
 */
public class GraphMethod extends GraphMember<MethodDefinition> {

    private final GraphArgument[] arguments;

    public GraphMethod(MethodDefinition definition, GraphClass owner) {
        super(definition, owner);
        ArgumentDefinition[] defArgs = definition.getArguments();
        arguments = new GraphArgument[defArgs.length];
        for (int i = 0; i < arguments.length; ++i) {
            arguments[i] = new GraphArgument(defArgs[i], owner);
        }
    }

    public GraphArgument[] getArguments() {
        return arguments;
    }

    @Override
    public List<GraphBasicType> listBasicTypes() {
        List<GraphBasicType> list = new LinkedList<>();
        list.addAll(super.listBasicTypes());
        for (GraphArgument argument: arguments) {
            list.addAll(argument.listBasicTypes());
        }
        return list;
    }

    @Override
    public String toSourceCode() {
        return toSourceCode(SourceCodeMaker.Options.DEFAULT);
    }

    @Override
    public String toSourceCode(final SourceCodeMaker.Options options) {
        StringBuilder sb = new StringBuilder();
        if (options.getMembersModifiers() && getModifiers() != null) for (String modifier: getModifiers()) {
            boolean append = true;
            if (options.getRepairOverride() && "override".equals(modifier)) {
                append = false;
                GraphClass superClass = (getOwner().getExtends()!=null)?getOwner().getExtends().getClassObj():null;
                outerloop:
                while (superClass != null) {
                    GraphMember[] members = superClass.getMembers();
                    superClass = (superClass.getExtends()!=null)?superClass.getExtends().getClassObj():null;
                    //list superclass for method existing
                    for (GraphMember m : members) {
                        if (m instanceof GraphMethod) {
                            GraphMethod superMethod = (GraphMethod) m;
                            if (superMethod.getName().equals(getName())
                                    && (options.getClassPrivateMembers()
                                    || (!options.getClassPrivateMembers() && superMethod.isVisible()))) {
                                append = true;
                                break outerloop;
                            }
                        }
                    }
                }
            }
            if (append) {
                sb.append(modifier);
                sb.append(' ');
            }
        }
        sb.append("function ");
        sb.append(getName());
        sb.append('(');
        GraphArgument[] arguments = getArguments();
        if (arguments != null) for (int i = 0; i < arguments.length; ++i) {
            sb.append(arguments[i].toSourceCode(options));
            if (i < arguments.length - 1) sb.append(", ");
        }
        sb.append(')');
        if (getType() != null) {
            sb.append(':');
            sb.append(getType().toSourceCode(options));
        }
        if (ClassDefinition.ClassType.CLASS.equals(owner.getSourceType())
                && options.getMethodsBody()) {
            sb.append(" {");
            sb.append(options.getNewLineChars());
            sb.append(options.getNewLineChars());
            sb.append('}');
        } else {
            sb.append(';');
        }
        return sb.toString();
    }

}
