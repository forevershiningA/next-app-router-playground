package pl.pkapusta.utils.apigenerator.utils.parser.definitions.members;

import pl.pkapusta.utils.apigenerator.utils.structure.type.Type;

import java.util.Arrays;

/**
 * @author Przemysław Kapusta
 */
public class PropertyDefinition extends MemberDefinition {

    private final String readAccessIdentifier;
    private final String writeAccessIdentifier;

    public PropertyDefinition(String name, String[] modifiers, Type type,
                                 String readAccessIdentifier, String writeAccessIdentifier) {
        super(name, modifiers, type);
        this.readAccessIdentifier = readAccessIdentifier;
        this.writeAccessIdentifier = writeAccessIdentifier;
    }

    public String getReadAccessIdentifier() {
        return readAccessIdentifier;
    }

    public String getWriteAccessIdentifier() {
        return writeAccessIdentifier;
    }

    @Override
    public String toString() {
        return "PropertyDefinition{" +
                "name='" + getName() + '\'' +
                ", modifiers=" + Arrays.toString(getModifiers()) +
                ", type='" + getType() + '\'' +
                ", readAccessIdentifier='" + getReadAccessIdentifier() + '\'' +
                ", writeAccessIdentifier='" + getWriteAccessIdentifier() + '\'' +
                '}';
    }

}
