package pl.pkapusta.utils.apigenerator.utils.parser.definitions.members;

import pl.pkapusta.utils.apigenerator.utils.structure.type.Type;

import java.util.Arrays;

/**
 * @author Przemysław Kapusta
 */
public class FieldDefinition extends MemberDefinition {

    private final String assignment;

    public FieldDefinition(String name, String[] modifiers, Type type, String assignment) {
        super(name, modifiers, type);
        this.assignment = assignment;
    }

    public String getAssignment() {
        return assignment;
    }

    @Override
    public String toString() {
        return "FieldDefinition{" +
                "name='" + getName() + '\'' +
                ", modifiers=" + Arrays.toString(getModifiers()) +
                ", type='" + getType() + '\'' +
                ", assignment='" + getAssignment() + '\'' +
                '}';
    }

}
