package pl.pkapusta.utils.apigenerator.utils.parser.condition;

import pl.pkapusta.utils.apigenerator.utils.parser.ParserException;

/**
 * @author Przemysław Kapusta
 */
public interface ConditionResolver {

    boolean resolve(String condition) throws ParserException;

}
