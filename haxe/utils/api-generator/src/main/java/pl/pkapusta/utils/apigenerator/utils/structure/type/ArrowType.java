package pl.pkapusta.utils.apigenerator.utils.structure.type;

/**
 * @author Przemysław Kapusta
 */
public class ArrowType extends Type {

    private Type leftType;
    private Type rightType;

    protected ArrowType(Type leftType, Type rightType) {
        this.leftType = leftType;
        this.rightType = rightType;
    }

    public Type getLeftType() {
        return leftType;
    }

    public Type getRightType() {
        return rightType;
    }

    @Override
    public String toString() {
        return "ArrowType{" +
                "leftType=" + leftType +
                ", rightType=" + rightType +
                '}';
    }

    @Override
    public String toSourceCode() {
        return toSourceCode(Options.DEFAULT);
    }

    @Override
    public String toSourceCode(final Options options) {
        StringBuilder sb = new StringBuilder(leftType.toSourceCode());
        sb.append(" -> ");
        sb.append(rightType.toSourceCode());
        return sb.toString();
    }

}
