package pl.pkapusta.utils.apigenerator.utils.structure.graph.type;

import pl.pkapusta.utils.apigenerator.utils.misc.TypeChecker;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.Graph;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.GraphClass;
import pl.pkapusta.utils.apigenerator.utils.structure.type.BasicType;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Przemysław Kapusta
 */
public class GraphBasicType<T extends BasicType> extends GraphType<T> {

    private GraphClass classObj;

    protected GraphBasicType(T type) {
        super(type);
    }

    public String getName() {
        if (TypeChecker.isPrivitiveType(type.getName())) {
            return type.getName();
        } else if (classObj != null) {
            if (classObj.getName() != this) {
                return classObj.getName().getName();
            } else {
                return getSourceName();
            }
        } else {
            return Graph.DEFAULT_ANY_TYPE_NAME;
        }
    }

    public String getSourceName() {
        return type.getName();
    }

    public void setClassObj(GraphClass classObj) {
        this.classObj = classObj;
    }

    public GraphClass getClassObj() {
        return classObj;
    }

    @Override
    public List<GraphBasicType> listBasicTypes() {
        List<GraphBasicType> list = new ArrayList<>();
        list.add(this);
        return list;
    }

    @Override
    public String toSourceCode() {
        return toSourceCode(Options.DEFAULT);
    }

    @Override
    public String toSourceCode(final Options options) {
        return getName();
    }

}
