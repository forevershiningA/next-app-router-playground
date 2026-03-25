package pl.pkapusta.utils.apigenerator.utils.parser.optimizators;

import pl.pkapusta.utils.apigenerator.utils.parser.RegularExpressions;

/**
 * @author Przemysław Kapusta
 */
public class StringsRemover implements IOptimizator {

    @Override
    public String optimize(String data) {
        return RegularExpressions.STRING_REGEXP.matcher(data).replaceAll("null");
    }

}
