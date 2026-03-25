package pl.pkapusta.utils.apigenerator.utils.structure.graph.member;

import pl.pkapusta.utils.apigenerator.utils.interfaces.SourceCodeMaker;
import pl.pkapusta.utils.apigenerator.utils.interfaces.Visibility;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.ClassDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.FieldDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.MemberDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.MethodDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.PropertyDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.misc.ArgumentDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.GraphClass;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.misc.BasicTypesList;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.type.GraphBasicType;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.type.GraphType;

import java.util.LinkedList;
import java.util.List;

/**
 * @author Przemysław Kapusta
 */
abstract public class GraphMember<T extends MemberDefinition> implements BasicTypesList, SourceCodeMaker, Visibility {

    public static <E extends MemberDefinition> GraphMember<E> fromDefinition(E definition, GraphClass owner) {
        if (definition instanceof FieldDefinition) {
            return (GraphMember<E>)new GraphField((FieldDefinition)definition, owner);
        } else if (definition instanceof PropertyDefinition) {
            return (GraphMember<E>)new GraphProperty((PropertyDefinition)definition, owner);
        } else if (definition instanceof MethodDefinition) {
            return (GraphMember<E>)new GraphMethod((MethodDefinition)definition, owner);
        } else if (definition instanceof ArgumentDefinition) {
            return (GraphMember<E>)new GraphArgument((ArgumentDefinition)definition, owner);
        } else {
            throw new UnsupportedOperationException("Unsupported class type");
        }
    }

    protected final T definition;
    protected final GraphClass owner;
    protected final GraphType type;

    protected GraphMember(T definition, GraphClass owner) {
        this.definition = definition;
        this.owner = owner;
        if (definition.getType() != null) {
            this.type = GraphType.fromType(definition.getType());
        } else {
            this.type = null;
        }
    }

    public GraphClass getOwner() {
        return owner;
    }

    public GraphType getType() {
        return type;
    }

    public String getName() {
        return definition.getName();
    }

    public String[] getModifiers() {
        return definition.getModifiers();
    }

    public boolean hasModifier(String modifier) {
        modifier = modifier.toLowerCase();
        String modifiers[] = getModifiers();
        if (modifiers != null) for (String mod: modifiers) {
            if (modifier.equals(mod.toLowerCase())) return true;
        }
        return false;
    }

    @Override
    public List<GraphBasicType> listBasicTypes() {
        if (type != null) {
            return type.listBasicTypes();
        } else {
            return new LinkedList<>();
        }
    }

    @Override
    public VisibilityModifier getVisibilityModifier() {
        if (hasModifier("public")) return VisibilityModifier.PUBLIC;
        if (hasModifier("private")) return VisibilityModifier.PRIVATE;
        return VisibilityModifier.DEFAULT;
    }

    @Override
    public boolean isVisible() {
        switch (getVisibilityModifier()) {
            case PUBLIC:
                return true;
            case PRIVATE:
                return false;
            case DEFAULT:
            default:
                if (ClassDefinition.ClassType.INTERFACE.equals(getOwner().getSourceType())) {
                    return true;
                } else {
                    return false;
                }
        }
    }

}
