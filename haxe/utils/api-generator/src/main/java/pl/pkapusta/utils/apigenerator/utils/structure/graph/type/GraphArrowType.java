package pl.pkapusta.utils.apigenerator.utils.structure.graph.type;

import pl.pkapusta.utils.apigenerator.utils.structure.graph.Graph;
import pl.pkapusta.utils.apigenerator.utils.structure.type.ArrowType;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Przemysław Kapusta
 */
public class GraphArrowType extends GraphType<ArrowType> {

    private GraphType leftType;
    private GraphType rightType;

    public GraphArrowType(ArrowType type) {
        super(type);
        leftType = GraphType.fromType(type.getLeftType());
        rightType = GraphType.fromType(type.getRightType());
    }

    public GraphType getLeftType() {
        return leftType;
    }

    public GraphType getRightType() {
        return rightType;
    }

    @Override
    public List<GraphBasicType> listBasicTypes() {
        List<GraphBasicType> list = new ArrayList<>();
        for (GraphBasicType graphBasicType: leftType.listBasicTypes()) {
            list.add(graphBasicType);
        }
        for (GraphBasicType graphBasicType: rightType.listBasicTypes()) {
            list.add(graphBasicType);
        }
        return list;
    }

    @Override
    public String toSourceCode() {
        return toSourceCode(Options.DEFAULT);
    }

    @Override
    public String toSourceCode(final Options options) {
        if (Graph.DEFAULT_ANY_TYPE_NAME.equals(leftType.toSourceCode())) {
            return leftType.toSourceCode();
        } else {
            StringBuilder sb = new StringBuilder(leftType.toSourceCode(options));
            sb.append(" -> ");
            sb.append(rightType.toSourceCode(options));
            return sb.toString();
        }
    }

}
