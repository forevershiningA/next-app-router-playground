package pl.pkapusta.utils.apigenerator.utils.parser.optimizators;

import pl.pkapusta.utils.apigenerator.utils.parser.RegularExpressions;

/**
 * @author Przemysław Kapusta
 */
public class CommentRemover implements IOptimizator {

    @Override
    public String optimize(String data) {
        return data.replaceAll(RegularExpressions.COMMENT_REGEXP, "");
    }

}
