package pl.pkapusta.utils.apigenerator.utils.parser.optimizators;

import pl.pkapusta.utils.apigenerator.utils.parser.ParserException;

/**
 * @author Przemysław Kapusta
 */
public interface IOptimizator {

    String optimize(String data) throws ParserException;

}
