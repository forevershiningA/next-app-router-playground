package pl.pkapusta.utils.apigenerator.utils.parser.definitions;

import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.MemberDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.type.BasicType;

import java.util.*;

/**
 * @author Przemysław Kapusta
 */
public class ClassDefinition {

    private SourceDefinition _sourceDefinition;
    private final ClassType _type;
    private final BasicType _name;
    private final String[] _modifiers;
    private final BasicType _extends;
    private final BasicType[] _implements;
    private final AnnotationDefinition[] _annotations;
    private final List<MemberDefinition> _members;

    public ClassDefinition(ClassType _type, BasicType _name, String[] _modifiers,
                           BasicType _extends, BasicType[] _implements,
                           AnnotationDefinition[] _annotations) {
        this._type = _type;
        this._name = _name;
        this._modifiers = _modifiers;
        this._extends = _extends;
        this._implements = _implements;
        this._annotations = _annotations;
        this._members = new ArrayList<>();
    }

    protected void setSourceDefinition(SourceDefinition _sourceDefinition) {
        this._sourceDefinition = _sourceDefinition;
    }

    public SourceDefinition getSourceDefinition() {
        return _sourceDefinition;
    }

    public ClassType getType() {
        return _type;
    }

    public BasicType getName() {
        return _name;
    }

    public String[] getModifiers() {
        return _modifiers;
    }

    public BasicType getExtends() {
        return _extends;
    }

    public BasicType[] getImplements() {
        return _implements;
    }

    public AnnotationDefinition[] getAnnotations() {
        return _annotations;
    }

    public List<MemberDefinition> getMembers() {
        return _members;
    }

    @Override
    public String toString() {
        return "ClassDefinition{" +
                "type='" + _type + '\'' +
                ", name=" + _name +
                ", modifiers=" + Arrays.toString(_modifiers) +
                ", extends='" + _extends + '\'' +
                ", implements=" + Arrays.toString(_implements) +
                ", annotations=" + Arrays.toString(_annotations) +
                ", members=" + _members +
                '}';
    }

    public enum ClassType {

        CLASS ("class"),
        INTERFACE ("interface");

        private static final Map<String, ClassType> map;
        static {
            map = new HashMap<>();
            for (ClassType type: values()) map.put(type.getClassifier(), type);
        }

        public static ClassType valueOfClassifier(String classifier) {
            return map.get(classifier);
        }

        private final String classifier;

        ClassType(String classifier) {
            this.classifier = classifier;
        }

        public String getClassifier() {
            return classifier;
        }

    }

}
