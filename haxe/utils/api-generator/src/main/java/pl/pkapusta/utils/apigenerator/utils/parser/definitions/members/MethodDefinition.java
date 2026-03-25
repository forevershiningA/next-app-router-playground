package pl.pkapusta.utils.apigenerator.utils.parser.definitions.members;

import pl.pkapusta.utils.apigenerator.utils.parser.definitions.misc.ArgumentDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.type.Type;

import java.util.Arrays;

/**
 * @author Przemysław Kapusta
 */
public class MethodDefinition extends MemberDefinition {

    private final ArgumentDefinition[] arguments;

    public MethodDefinition(String name, String[] modifiers, Type type, ArgumentDefinition[] arguments) {
        super(name, modifiers, type);
        this.arguments = arguments;
    }

    public ArgumentDefinition[] getArguments() {
        return arguments;
    }

    @Override
    public String toString() {
        return "MethodDefinition{" +
                "name='" + getName() + '\'' +
                ", modifiers=" + Arrays.toString(getModifiers()) +
                ", type='" + getType() + '\'' +
                ", arguments='" + Arrays.toString(getArguments()) + '\'' +
                '}';
    }

}
