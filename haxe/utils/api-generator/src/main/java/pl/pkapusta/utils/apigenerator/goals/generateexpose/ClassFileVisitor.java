package pl.pkapusta.utils.apigenerator.goals.generateexpose;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.config.Mapping;
import pl.pkapusta.utils.apigenerator.config.parameters.ParamValue;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ClassFileVisitor implements IClassFileVisitor {

    private static final Logger logger = LoggerFactory.getLogger(ClassFileVisitor.class);

    private final GenerateExpose goal;
    private final Path startPoint;
    private final ConditionResolver ccConditionResolver;
    private final PackageMapping packageMapping;

    public ClassFileVisitor(GenerateExpose goal) {
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
        if (goal.getInput().getMapping() != null) {
            packageMapping = new PackageMapping(goal.getInput().getMapping());
        } else {
            packageMapping = null;
        }
        logger.trace("Package mapping: {}", packageMapping);
    }

    @Override
    public void visitClassFile(Path file, BasicFileAttributes attrs) throws IOException {
        logger.info("Processing file: {}", startPoint.relativize(file));

        try {
            Charset charset = Charset.forName(goal.getGoalConfig().getCharset().toUpperCase());
            SourceParser sourceParser = new SourceParser(file, charset)
                    .setCCConditionResolver(ccConditionResolver);
            SourceDefinition sourceDefinition = sourceParser.parse();

            String exposeName = FullyQualifiedName.fromPackageAndName(
                    sourceDefinition.getPackage(),
                    sourceDefinition.getPrimaryClass().getName().getName());

            if (packageMapping != null) {
                exposeName = packageMapping.translateMapping(exposeName);
            }

            Pattern classPattern = buildClassPattern(sourceDefinition.getPrimaryClass());
            Matcher m = classPattern.matcher(sourceParser.getSource());
            if (m.find()) {
                StringBuilder sb = new StringBuilder();
                sb.append(sourceParser.getSource().substring(0, m.start()));
                sb.append("@:expose(\"");
                sb.append(exposeName);
                sb.append("\")\n");
                sb.append(sourceParser.getSource().substring(m.start()));
                String modifiedSource = sb.toString();
                //logger.trace("modifiedSource: {}", modifiedSource);

                try (OutputStream os = new FileOutputStream(file.toFile(), false)) {
                    IOUtils.write(modifiedSource, os, charset);
                }

            } else {
                throw new ParserException("Can't find class in source");
            }

        } catch (ParserException pe) {
            throw new IOException(pe);
        } catch (UnsupportedCharsetException e) {
            throw new IOException("Unsupported charset in goal config", e);
        }
    }

    private Pattern buildClassPattern(ClassDefinition clazz) {
        StringBuilder sb = new StringBuilder();
        for (String modifier: clazz.getModifiers()) {
            sb.append(Pattern.quote(modifier));
            sb.append("\\s+");
        }
        sb.append(Pattern.quote(clazz.getType().getClassifier()));
        sb.append("\\s+");
        sb.append(Pattern.quote(clazz.getName().getName()));
        return Pattern.compile(sb.toString());
    }

}
