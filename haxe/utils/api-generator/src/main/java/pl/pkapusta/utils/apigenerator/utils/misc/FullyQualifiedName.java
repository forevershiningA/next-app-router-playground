package pl.pkapusta.utils.apigenerator.utils.misc;

import pl.pkapusta.utils.apigenerator.utils.parser.definitions.ClassDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.SourceDefinition;

/**
 * @author Przemysław Kapusta
 */
public class FullyQualifiedName {

    public static String fromDefinition(SourceDefinition sourceDefinition) {
        return fromPackageAndName(sourceDefinition.getPackage(),
                sourceDefinition.getPrimaryClass().getName().getName());
    }

    public static String fromDefinition(ClassDefinition classDefinition) {
        return fromPackageAndName(classDefinition.getSourceDefinition().getPackage(),
                classDefinition.getName().getName());
    }

    public static String fromPackageAndName(String packageStr, String className) {
        if (packageStr == null) return className;
        if (packageStr.isEmpty()) return className;
        return packageStr + "." + className;
    }

}
