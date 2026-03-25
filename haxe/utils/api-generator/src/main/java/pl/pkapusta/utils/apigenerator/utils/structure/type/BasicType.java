package pl.pkapusta.utils.apigenerator.utils.structure.type;

import java.util.Objects;

/**
 * @author Przemysław Kapusta
 */
public class BasicType extends Type {

    private String name;

    protected BasicType(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "BasicType{" +
                "name='" + name + '\'' +
                '}';
    }

    @Override
    public String toSourceCode() {
        return this.toSourceCode(Options.DEFAULT);
    }

    @Override
    public String toSourceCode(final Options options) {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BasicType basicType = (BasicType) o;
        return Objects.equals(name, basicType.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }

}
