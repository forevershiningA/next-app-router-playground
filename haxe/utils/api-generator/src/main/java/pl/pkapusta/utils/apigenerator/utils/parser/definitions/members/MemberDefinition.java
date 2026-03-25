package pl.pkapusta.utils.apigenerator.utils.parser.definitions.members;

import pl.pkapusta.utils.apigenerator.utils.structure.type.Type;

import java.util.Arrays;

/**
 * @author Przemysław Kapusta
 */
abstract public class MemberDefinition {

    private final String name;
    private final String modifiers[];
    private final Type type;

    protected MemberDefinition(String name, String modifiers[], Type type) {
        this.name = name;
        this.modifiers = modifiers;
        this.type = type;
    }

    public String[] getModifiers() {
        return modifiers;
    }

    public String getName() {
        return name;
    }

    public Type getType() {
        return type;
    }

}
