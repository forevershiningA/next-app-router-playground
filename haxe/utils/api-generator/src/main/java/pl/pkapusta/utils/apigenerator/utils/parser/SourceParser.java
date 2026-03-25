package pl.pkapusta.utils.apigenerator.utils.parser;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.utils.parser.condition.ConditionResolver;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.AnnotationDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.ClassDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.SourceDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.optimizators.CommentRemover;
import pl.pkapusta.utils.apigenerator.utils.parser.optimizators.ConditionalCompilationResolver;
import pl.pkapusta.utils.apigenerator.utils.parser.utils.BlockResolver;
import pl.pkapusta.utils.apigenerator.utils.structure.StructureException;
import pl.pkapusta.utils.apigenerator.utils.structure.type.BasicType;
import pl.pkapusta.utils.apigenerator.utils.structure.type.Type;
import pl.pkapusta.utils.apigenerator.utils.structure.type.TypeResolver;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;

/**
 * @author Przemysław Kapusta
 */
public class SourceParser {

    private static final Logger logger = LoggerFactory.getLogger(SourceParser.class);

    private final String source;
    private final String fileName;

    private ConditionResolver ccConditionResolver;

    private String workingSource;

    public SourceParser(Path sourcePath) throws ParserException {
        this(sourcePath, StandardCharsets.UTF_8);
    }

    public SourceParser(Path sourcePath, Charset charset) throws ParserException {
        try {
            source = IOUtils.toString(sourcePath.toUri(), charset);
            fileName = sourcePath.toString();
        } catch (IOException e) {
            throw new ParserException("Can't read file: " + sourcePath.toString(), e);
        }
    }

    public SourceParser(File sourcePath) throws ParserException {
        this(sourcePath, StandardCharsets.UTF_8);
    }

    public SourceParser(File sourcePath, Charset charset) throws ParserException {
        try {
            source = IOUtils.toString(sourcePath.toURI(), charset);
            fileName = sourcePath.getAbsolutePath();
        } catch (IOException e) {
            throw new ParserException("Can't read file: " + sourcePath.toString(), e);
        }
    }

    public SourceParser(String source, String fileName) {
        this.source = source;
        this.fileName = fileName;
    }

    public SourceParser setCCConditionResolver(ConditionResolver ccConditionResolver) {
        this.ccConditionResolver = ccConditionResolver;
        return this;
    }

    public String getSource() {
        return source;
    }

    public ConditionResolver getCCConditionResolver() {
        return ccConditionResolver;
    }

    public SourceDefinition parse() throws ParserException {
        workingSource = optimizeSource(source);

        String packageStr = findPackage(true);
        List<ClassDefinition> classDefs = findClasses(true);
        ClassDefinition primaryClass = findPrimaryClass(classDefs);
        List<String> imports = findImports();

        return new SourceDefinition(packageStr, primaryClass,
                classDefs.toArray(new ClassDefinition[0]), imports.toArray(new String[0]));
    }

    private ClassDefinition findPrimaryClass(List<ClassDefinition> classDefs) throws ParserException {
        String classFile = FilenameUtils.removeExtension(Paths.get(fileName).getFileName().toString());
        for (ClassDefinition classDefinition: classDefs) {
            if (classFile.equals(classDefinition.getName().getName())) return classDefinition;
        }
        throw new ParserException("Can't found primary class in file " + fileName);
    }

    private String optimizeSource(String source) throws ParserException {
        //String optimized = new StringsRemover().optimize(source);
        String optimized = new CommentRemover().optimize(source);
        optimized = new ConditionalCompilationResolver().setConditionResolver(ccConditionResolver).optimize(optimized);
        return optimized;
    }

    private String findPackage(boolean trimWorkingSource) throws ParserException {
        Matcher m = RegularExpressions.PACKAGE_REGEX.matcher(workingSource);
        if (m.find()) {
            //logger.trace("Package match regex: \"{}\"", m.group(0));
            String pkg = m.group(3);
            //logger.trace("Package: \"{}\"", pkg);
            if (trimWorkingSource) {
                workingSource = workingSource.substring(m.end());
                //logger.trace("Trimmed source: \"{}\"", workingSource);
            }
            return pkg;
        } else {
            throw new ParserException("Can't find package in source");
        }
    }

    private List<ClassDefinition> findClasses(boolean trimWorkingSource) throws ParserException {
        final List<ClassDefinition> classDefs = new ArrayList<>();
        final BlockResolver blockResolver = new BlockResolver(workingSource);
        int searchStart = 0;
        int searchEnd = 0;

        StringBuffer forCut = (trimWorkingSource)?new StringBuffer():null;

        try {

            while (searchEnd < workingSource.length()) {
                searchEnd = blockResolver.findBlockStart(searchStart, BlockResolver.CODE_BLOCK);
                if (searchEnd == -1) break;
                //logger.trace("Checking: \"{}\"", workingSource.substring(searchStart, searchEnd));

                Matcher matcher = RegularExpressions.CLASS_DEF_REGEXP.matcher(workingSource);
                if (matcher.find(searchStart) && matcher.end(0) <= searchEnd) {
                    //class definition found
                    String classNameStr = matcher.group(3);
                    String classifier = matcher.group(2);
                    ClassDefinition.ClassType classType = ClassDefinition.ClassType.valueOfClassifier(classifier);
                    if (classType == null) throw new ParserException(
                            "Can't retrieve class type from classifier: " + classifier);
                    String tClassModifiers = matcher.group(1).trim();
                    String[] classModifiers = (!tClassModifiers.isEmpty()) ?
                            RegularExpressions.NON_EMPTY_SPACE.split(tClassModifiers) : new String[0];
                    //logger.trace("Class name {} and modifiers {}", className, classModifiers);
                    int pos = matcher.end(0);
                    pos = seekSpaces(workingSource, pos);
                    //add generic if exists
                    if (pos < workingSource.length() && workingSource.charAt(pos) == '<') {
                        int posEnd = new BlockResolver(workingSource).findBlockEnd(pos, BlockResolver.GENERIC_TYPE_BLOCK);
                        String typeGenData = workingSource.substring(pos + 1, posEnd - 1).trim();
                        classNameStr += "<" + typeGenData + ">";
                        pos = posEnd;
                    }
                    BasicType className = (BasicType)new TypeResolver().resolve(classNameStr);

                    Matcher m;

                    //find extends
                    BasicType classExtends = null;
                    if (ClassDefinition.ClassType.CLASS.equals(classType)) {
                        m = RegularExpressions.CLASS_EXTENDS_REGEXP.matcher(workingSource);
                        if (m.find(pos) && m.end(0) <= searchEnd) {
                            String classExtendsStr = m.group(1);
                            pos = m.end(0);
                            pos = seekSpaces(workingSource, pos);
                            //add generic if exists
                            if (pos < workingSource.length() && workingSource.charAt(pos) == '<') {
                                int posEnd = new BlockResolver(workingSource).findBlockEnd(pos, BlockResolver.GENERIC_TYPE_BLOCK);
                                String typeGenData = workingSource.substring(pos + 1, posEnd - 1).trim();
                                classExtendsStr += "<" + typeGenData + ">";
                                pos = posEnd;
                            }
                            classExtends = (BasicType)new TypeResolver().resolve(classExtendsStr);
                        }
                    }

                    //find implements
                    List<BasicType> classImplements = new ArrayList<>();
                    m = (ClassDefinition.ClassType.CLASS.equals(classType)) ?
                            RegularExpressions.CLASS_IMPLEMENTS_REGEXP.matcher(workingSource)
                            : RegularExpressions.CLASS_EXTENDS_REGEXP.matcher(workingSource);
                    while (m.find(pos) && m.end(0) <= searchEnd) {
                        String implStr = m.group(1);
                        pos = m.end(0);
                        pos = seekSpaces(workingSource, pos);
                        //add generic if exists
                        if (pos < workingSource.length() && workingSource.charAt(pos) == '<') {
                            int posEnd = new BlockResolver(workingSource).findBlockEnd(pos, BlockResolver.GENERIC_TYPE_BLOCK);
                            String typeGenData = workingSource.substring(pos + 1, posEnd - 1).trim();
                            implStr += "<" + typeGenData + ">";
                            pos = posEnd;
                        }
                        classImplements.add((BasicType)new TypeResolver().resolve(implStr));
                    }

                    //parse class annotations
                    AnnotationsParser annotationsParser = new AnnotationsParser(workingSource);
                    List<AnnotationDefinition> annotationDefs = annotationsParser.reverseFindAnnotations(matcher.start(0));

                    if (trimWorkingSource) {
                        int cutFrom = searchStart;
                        int cutTo = annotationsParser.getStart();
                        String cutStr = workingSource.substring(cutFrom, cutTo);
                        forCut.append(cutStr);
                    }

                    searchStart = blockResolver.findBlockEnd(searchEnd, BlockResolver.CODE_BLOCK);
                    String classSource = workingSource.substring(searchEnd + 1, searchStart - 1);

                    ClassParser parser = new ClassParser(
                            new ClassDefinition(
                                    classType, className, classModifiers,
                                    classExtends, classImplements.toArray(new BasicType[0]),
                                    annotationDefs.toArray(new AnnotationDefinition[0])),
                            classSource);

                    ClassDefinition definition = parser.parse();

                    //logger.trace("Class definition: {}", definition);

                    classDefs.add(definition);

                } else {
                    searchStart = blockResolver.findBlockEnd(searchEnd, BlockResolver.CODE_BLOCK);
                }

            }

        } catch (StructureException e) {
            throw new ParserException(e);
        }

        if (trimWorkingSource) {
            int cutFrom = searchStart;
            int cutTo = workingSource.length();
            String cutStr = workingSource.substring(cutFrom, cutTo);
            forCut.append(cutStr);
            workingSource = forCut.toString();
        }

        return classDefs;
    }

    private List<String> findImports() {
        List<String> imports = new ArrayList<>();
        Matcher m = RegularExpressions.IMPORT_REGEX.matcher(workingSource);
        while (m.find()) {
            //logger.trace("Import match regex: \"{}\"", m.group(0));
            imports.add(m.group(3));
            //logger.trace("Import match: \"{}\"", m.group(3));
        }
        return imports;
    }

    private int seekSpaces(String data, int start) {
        if (start >= data.length()) return start;
        Matcher m = RegularExpressions.SPACE.matcher(data);
        if (m.find(start)) {
            return m.end(0);
        } else {
            return start;
        }
    }

}
