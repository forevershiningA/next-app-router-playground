package pl.pkapusta.utils.apigenerator.utils.structure.type;

import java.util.Objects;

/**
 * @author Przemysław Kapusta
 */
public class GenericType extends BasicType {

    private Type subType;

    protected GenericType(String name, Type subType) {
        super(name);
        this.subType = subType;
    }

    public Type getSubType() {
        return subType;
    }

    @Override
    public String toString() {
        return "GenericType{" +
                "name=" + getName() +
                ", subType=" + subType +
                '}';
    }

    @Override
    public String toSourceCode() {
        return this.toSourceCode(Options.DEFAULT);
    }

    @Override
    public String toSourceCode(final Options options) {
        StringBuilder sb = new StringBuilder(super.toSourceCode(options));
        sb.append('<');
        sb.append(subType.toSourceCode(options));
        sb.append('>');
        return sb.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        GenericType that = (GenericType) o;
        return Objects.equals(subType, that.subType);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), subType);
    }

}
