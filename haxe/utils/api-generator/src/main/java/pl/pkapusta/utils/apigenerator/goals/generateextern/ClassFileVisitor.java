package pl.pkapusta.utils.apigenerator.goals.generateextern;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.config.parameters.ParamValue;
import pl.pkapusta.utils.apigenerator.goals.generateexpose.GenerateExpose;
import pl.pkapusta.utils.apigenerator.utils.mapping.PackageMapping;
import pl.pkapusta.utils.apigenerator.utils.misc.FullyQualifiedName;
import pl.pkapusta.utils.apigenerator.utils.parser.ParserException;
import pl.pkapusta.utils.apigenerator.utils.parser.SourceParser;
import pl.pkapusta.utils.apigenerator.utils.parser.condition.ConditionResolver;
import pl.pkapusta.utils.apigenerator.utils.parser.condition.ExpressionConditionResolver;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.ClassDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.SourceDefinition;
import pl.pkapusta.utils.apigenerator.utils.visitors.IClassFileVisitor;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.nio.charset.UnsupportedCharsetException;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ClassFileVisitor implements IClassFileVisitor {

    private static final Logger logger = LoggerFactory.getLogger(ClassFileVisitor.class);

    private final GenerateExtern goal;
    private final Path startPoint;
    private final ConditionResolver ccConditionResolver;

    private final List<SourceDefinition> parsedDefinitions;

    public ClassFileVisitor(GenerateExtern goal) {
        this.goal = goal;
        this.startPoint = new File(goal.getGoalConfig().getDestination()).toPath();
        if (goal.getInput().getCCParams() != null && !goal.getInput().getCCParams().isEmpty()) {
            ccConditionResolver = new ExpressionConditionResolver();
            for (ParamValue pv: goal.getInput().getCCParams()) {
                ((ExpressionConditionResolver)ccConditionResolver).setParamValue(pv.getName(), pv.getValue());
            }
        } else {
            ccConditionResolver = null;
        }
        parsedDefinitions = new LinkedList<>();
    }

    @Override
    public void visitClassFile(Path file, BasicFileAttributes attrs) throws IOException {
        logger.info("Parsing file: {}", file);

        try {
            Charset charset = Charset.forName(goal.getGoalConfig().getCharset().toUpperCase());
            SourceParser sourceParser = new SourceParser(file, charset)
                    .setCCConditionResolver(ccConditionResolver);
            parsedDefinitions.add(sourceParser.parse());
        } catch (ParserException pe) {
            throw new IOException(pe);
        } catch (UnsupportedCharsetException e) {
            throw new IOException("Unsupported charset in goal config", e);
        }
    }

    public List<SourceDefinition> getParsedDefinitions() {
        return parsedDefinitions;
    }

}
