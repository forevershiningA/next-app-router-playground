package pl.pkapusta.utils.apigenerator.utils.parser.definitions.misc;

import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.MemberDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.type.Type;

import java.util.Arrays;

/**
 * @author Przemysław Kapusta
 */
public class ArgumentDefinition extends MemberDefinition {

    private final String assignment;

    public ArgumentDefinition(String name, String[] modifiers, Type type, String assignment) {
        super(name, modifiers, type);
        this.assignment = assignment;
    }

    public String getAssignment() {
        return assignment;
    }

    @Override
    public String toString() {
        return "ArgumentDefinition{" +
                "name='" + getName() + '\'' +
                ", modifiers=" + Arrays.toString(getModifiers()) +
                ", type='" + getType() + '\'' +
                ", assignment='" + getAssignment() + '\'' +
                '}';
    }

}
