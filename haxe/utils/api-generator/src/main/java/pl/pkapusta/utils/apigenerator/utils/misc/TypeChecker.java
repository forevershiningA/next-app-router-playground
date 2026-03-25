package pl.pkapusta.utils.apigenerator.utils.misc;

import java.util.HashSet;
import java.util.Set;

/**
 * @author Przemysław Kapusta
 */
public class TypeChecker {

    private static final Set<String> primitiveTypes;

    static {
        primitiveTypes = new HashSet<>();
        primitiveTypes.add("Void");
        primitiveTypes.add("Null");
        primitiveTypes.add("Any");
        primitiveTypes.add("Dynamic");
        primitiveTypes.add("Bool");
        primitiveTypes.add("Float");
        primitiveTypes.add("Int");
        primitiveTypes.add("String");
        primitiveTypes.add("Array");
        primitiveTypes.add("Map");
    }

    public static boolean isPrivitiveType(String type) {
        return primitiveTypes.contains(type);
    }

}
