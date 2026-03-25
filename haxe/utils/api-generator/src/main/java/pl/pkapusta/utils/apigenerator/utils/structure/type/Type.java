package pl.pkapusta.utils.apigenerator.utils.structure.type;

import pl.pkapusta.utils.apigenerator.utils.interfaces.SourceCodeMaker;
import pl.pkapusta.utils.apigenerator.utils.structure.StructureException;

/**
 * @author Przemysław Kapusta
 */
abstract public class Type implements SourceCodeMaker {

    public static Type fromString(String data) throws StructureException {
        return new TypeResolver().resolve(data);
    }

}
