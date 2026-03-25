package pl.pkapusta.utils.apigenerator.utils.structure.graph.type;

import pl.pkapusta.utils.apigenerator.utils.structure.graph.Graph;
import pl.pkapusta.utils.apigenerator.utils.structure.type.GenericType;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Przemysław Kapusta
 */
public class GraphGenericType extends GraphBasicType<GenericType> {

    public GraphType subType;

    public GraphGenericType(GenericType type) {
        super(type);
        subType = GraphType.fromType(type.getSubType());
    }

    public GraphType getSubType() {
        return subType;
    }

    @Override
    public List<GraphBasicType> listBasicTypes() {
        List<GraphBasicType> list = new ArrayList<>();
        list.add(this);
        for (GraphBasicType graphBasicType: subType.listBasicTypes()) {
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
        if (Graph.DEFAULT_ANY_TYPE_NAME.equals(getName())) {
            return getName();
        } else {
            StringBuilder sb = new StringBuilder(getName());
            sb.append('<');
            sb.append(subType.toSourceCode(options));
            sb.append('>');
            return sb.toString();
        }
    }

}
