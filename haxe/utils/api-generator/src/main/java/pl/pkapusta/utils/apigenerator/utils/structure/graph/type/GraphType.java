package pl.pkapusta.utils.apigenerator.utils.structure.graph.type;

import pl.pkapusta.utils.apigenerator.utils.interfaces.SourceCodeMaker;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.misc.BasicTypesList;
import pl.pkapusta.utils.apigenerator.utils.structure.type.ArrowType;
import pl.pkapusta.utils.apigenerator.utils.structure.type.BasicType;
import pl.pkapusta.utils.apigenerator.utils.structure.type.GenericType;
import pl.pkapusta.utils.apigenerator.utils.structure.type.Type;

import java.util.List;

/**
 * @author Przemysław Kapusta
 */
abstract public class GraphType<T extends Type> implements BasicTypesList, SourceCodeMaker {

    public static <E extends Type> GraphType<E> fromType(E type) {
        if (type instanceof ArrowType) {
            return (GraphType<E>)new GraphArrowType((ArrowType)type);
        } else if (type instanceof GenericType) {
            return (GraphType<E>)new GraphGenericType((GenericType)type);
        } else if (type instanceof BasicType) {
            return (GraphType<E>)new GraphBasicType((BasicType)type);
        } else {
            throw new UnsupportedOperationException("Unsupported class type");
        }
    }

    protected final T type;

    protected GraphType(T type) {
        this.type = type;
    }

    public T getSourceType() {
        return type;
    }

    @Override
    public String toSourceCode() {
        return toSourceCode(Options.DEFAULT);
    }

    @Override
    public String toSourceCode(final Options options) {
        return type.toSourceCode(options);
    }

}
