package pl.pkapusta.utils.apigenerator.utils.parser;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.AnnotationDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.utils.BlockResolver;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;

/**
 * @author Przemysław Kapusta
 */
public class AnnotationsParser {

    private static final Logger logger = LoggerFactory.getLogger(AnnotationsParser.class);

    private final String source;
    private int start = -1;
    private int end = -1;

    protected AnnotationsParser(String source) {
        this.source = source;
    }

    public List<AnnotationDefinition> reverseFindAnnotations(final int start) throws ParserException {
        final int from = findStartPoint(start);
        final int to = start;
        final List<AnnotationDefinition> list = new ArrayList<>();
        String searchArea = source.substring(from, to);
        //logger.trace("Search area: '{}'", searchArea);
        BlockResolver blockResolver = new BlockResolver(searchArea);
        int pos = 0;
        Matcher m = RegularExpressions.ANNOTATION_ID.matcher(searchArea);
        while (m.find(pos)) {
            String name = m.group(1);
            String params = null;
            //logger.trace("Annotation regex: '{}'", m.group(1));
            pos = m.end(0);
            if (pos < searchArea.length() && searchArea.charAt(pos) == '(') {
                //we have brackets
                int bracketEnd = blockResolver.findBlockEnd(pos, BlockResolver.ANNOTATION_BLOCK);
                String data = searchArea.substring(pos + 1, bracketEnd - 1).trim();
                params = (!data.isEmpty())?data:null;
                pos = bracketEnd;
            }
            //logger.trace("Annotation params: '{}'", params);
            list.add(new AnnotationDefinition(name, params));
        }
        this.start = from;
        this.end = to;
        return list;
    }

    public int getStart() {
        return start;
    }

    public int getEnd() {
        return end;
    }

    private int findStartPoint(int start) {
        for (int pos = start - 1; pos >= 0; --pos) {
            char ch = source.charAt(pos);
            if (ch == ';' || ch == '}') return pos + 1;
        }
        return 0;
    }

}
