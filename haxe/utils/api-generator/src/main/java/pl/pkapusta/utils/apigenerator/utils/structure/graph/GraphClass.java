package pl.pkapusta.utils.apigenerator.utils.structure.graph;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.utils.interfaces.SourceCodeMaker;
import pl.pkapusta.utils.apigenerator.utils.misc.FullyQualifiedName;
import pl.pkapusta.utils.apigenerator.utils.misc.TypeChecker;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.AnnotationDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.ClassDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.MemberDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.member.GraphMember;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.misc.BasicTypesList;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.type.GraphBasicType;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.type.GraphType;
import pl.pkapusta.utils.apigenerator.utils.structure.type.BasicType;

import java.util.*;

/**
 * @author Przemysław Kapusta
 */
public class GraphClass implements SourceCodeMaker {

    private static final Logger logger = LoggerFactory.getLogger(GraphClass.class);

    private final ClassDefinition classDefinition;
    private final String fullyQualifiedName;
    private GraphBasicType _name;
    private GraphBasicType _extends;
    private GraphBasicType[] _implements;
    private GraphMember[] _members;
    private String[] _imports;
    private LinkedList<String> _modifiers;
    private LinkedList<GraphAnnotation> _annotations;

    protected GraphClass(ClassDefinition classDefinition) {
        this.classDefinition = classDefinition;
        this.fullyQualifiedName = FullyQualifiedName.fromDefinition(classDefinition);
    }

    public String getFullyQualifiedName() {
        return fullyQualifiedName;
    }

    public GraphBasicType getName() {
        return _name;
    }

    public LinkedList<String> getModifiers() {
        return _modifiers;
    }

    public LinkedList<GraphAnnotation> getAnnotations() {
        return _annotations;
    }

    public ClassDefinition.ClassType getSourceType() {
        return classDefinition.getType();
    }

    public String getPackage() {
        return classDefinition.getSourceDefinition().getPackage();
    }

    protected void buildGraph(final Map<String, ClassDefinition> classDefinitionMap,
                              final Map<String, GraphClass> classGraphObjsMap) {
        //logger.trace("Build class graph {}", fullyQualifiedName);

        Set<String> importsToUse = new LinkedHashSet<>();

        //annotations
        _annotations = new LinkedList<>();
        if (classDefinition.getAnnotations() != null) for (AnnotationDefinition annotation: classDefinition.getAnnotations()) {
            _annotations.add(GraphAnnotation.fromDefinition(annotation));
        }

        //modifiers
        _modifiers = new LinkedList<>();
        if (classDefinition.getModifiers() != null) for (String modifier: classDefinition.getModifiers()) {
            _modifiers.add(modifier);
        }

        //build in names
        _name = (GraphBasicType)GraphType.fromType(classDefinition.getName());
        iterateBasicTypes(_name, classDefinitionMap, classGraphObjsMap, importsToUse);

        //build extends
        if (classDefinition.getExtends() != null) {
            _extends = (GraphBasicType)GraphType.fromType(classDefinition.getExtends());
            iterateBasicTypes(_extends, classDefinitionMap, classGraphObjsMap, importsToUse);
        }

        //build implements
        List<GraphBasicType> _implementsList = new LinkedList<>();
        for (BasicType basicType: classDefinition.getImplements()) {
            GraphBasicType _implement = (GraphBasicType)GraphType.fromType(basicType);
            iterateBasicTypes(_implement, classDefinitionMap, classGraphObjsMap, importsToUse);
            _implementsList.add(_implement);
        }
        _implements = _implementsList.toArray(new GraphBasicType[0]);

        //build members
        List<GraphMember> _membersList = new LinkedList<>();
        for (MemberDefinition definition: classDefinition.getMembers()) {
            GraphMember _member = GraphMember.fromDefinition(definition, this);
            iterateBasicTypes(_member, classDefinitionMap, classGraphObjsMap, importsToUse);
            _membersList.add(_member);
        }
        _members = _membersList.toArray(new GraphMember[0]);

        //set imports
        _imports = importsToUse.toArray(new String[0]);

    }

    protected void iterateBasicTypes(final BasicTypesList typesObj,
                                     final Map<String, ClassDefinition> classDefinitionMap,
                                     final Map<String, GraphClass> classGraphObjsMap,
                                     final Set<String> importsToUse) {
        for (GraphBasicType basicType: typesObj.listBasicTypes()) {
            //logger.trace("basic type: {}", basicType.toSourceCode());
            if (!TypeChecker.isPrivitiveType(basicType.getSourceName())) {
                String fullyQualifiedName = findFullyQualifiedNameInDefinitions(basicType.getSourceName(),
                        classDefinitionMap, importsToUse);
                //logger.trace("fullyQualifiedName: {}", fullyQualifiedName);
                if (fullyQualifiedName != null) {
                    GraphClass obj = classGraphObjsMap.get(fullyQualifiedName);
                    if (obj == null) {
                        obj = new GraphClass(classDefinitionMap.get(fullyQualifiedName));
                        classGraphObjsMap.put(obj.getFullyQualifiedName(), obj);
                        obj.buildGraph(classDefinitionMap, classGraphObjsMap);
                    }
                    basicType.setClassObj(obj);
                }
            }
        }
    }

    protected String findFullyQualifiedNameInDefinitions(String typeName,
                                                         final Map<String, ClassDefinition> classDefinitionMap,
                                                         final Set<String> importsToUse) {
        //dots in class name == fully qualified name (and not imports to use)
        if (typeName.contains(".")) return typeName;

        Map<String, ClassDefinition> matchingDefs = new HashMap<>();
        for (Map.Entry<String, ClassDefinition> entry: classDefinitionMap.entrySet()) {
            if (entry.getValue().getName().getName().equals(typeName)) {
                matchingDefs.put(entry.getKey(), entry.getValue());
            }
        }
        if (matchingDefs.isEmpty()) return null;
        List<String> packages = new ArrayList<>();
        String p = classDefinition.getSourceDefinition().getPackage();
        packages.add((p==null||p.isEmpty())?null:p + "." + typeName); //can be null if not package
        for (String pkg: classDefinition.getSourceDefinition().getImports()) {
            packages.add(pkg);
        }
        for (String pkg: packages) {
            for (Map.Entry<String, ClassDefinition> entry: matchingDefs.entrySet()) {
                String clpkg = entry.getValue().getSourceDefinition().getPackage();
                if (pkg == null || pkg.isEmpty()) {
                    if (clpkg == null || clpkg.isEmpty()) {
                        return entry.getKey();
                    }
                } else if (pkg.endsWith(".*")) {
                    if (clpkg.startsWith(pkg.substring(0, pkg.length() - 2))) {
                        if (!clpkg.equals(p)) importsToUse.add(entry.getKey());
                        return entry.getKey();
                    }
                } else {
                    if (pkg.equals(entry.getKey())) {
                        if (!clpkg.equals(p)) importsToUse.add(entry.getKey());
                        return entry.getKey();
                    }
                }
            }
        }
        return null;
    }

    public GraphBasicType getExtends() {
        return _extends;
    }

    public GraphBasicType[] getImplements() {
        return _implements;
    }

    public GraphMember[] getMembers() {
        return _members;
    }

    @Override
    public String toSourceCode() {
        return toSourceCode(Options.DEFAULT);
    }

    @Override
    public String toSourceCode(final Options options) {
        StringBuilder sb = new StringBuilder();

        //class package
        sb.append("package");
        String pkg = classDefinition.getSourceDefinition().getPackage();
        if (pkg != null) {
            sb.append(' ');
            sb.append(pkg);
        }
        sb.append(';');
        sb.append(options.getNewLineChars());
        sb.append(options.getNewLineChars());

        //class imports
        if (_imports != null && _imports.length > 0) {
            for (String _import: _imports) {
                sb.append("import ");
                sb.append(_import);
                sb.append(';');
                sb.append(options.getNewLineChars());
            }
            sb.append(options.getNewLineChars());
        }

        //class annotations
        if (_annotations != null) for (GraphAnnotation annotation: _annotations) {
            sb.append(annotation.toSourceCode(options));
            sb.append(options.getNewLineChars());
        }

        //class definition
        for (String modifier: _modifiers) {
            sb.append(modifier);
            sb.append(' ');
        }
        sb.append(classDefinition.getType().getClassifier());
        sb.append(' ');
        sb.append(_name.toSourceCode(options));
        sb.append(' ');
        switch (classDefinition.getType()) {
            case CLASS:
                if (_extends != null && !Graph.DEFAULT_ANY_TYPE_NAME.equals(_extends.getName())) {
                    sb.append("extends ");
                    sb.append(_extends.toSourceCode(options));
                    sb.append(' ');
                }
            case INTERFACE:
                if (_implements != null) for (GraphBasicType basicType: _implements) {
                    if (!Graph.DEFAULT_ANY_TYPE_NAME.equals(basicType.getName())) {
                        sb.append(
                                ClassDefinition.ClassType.INTERFACE.equals(
                                        classDefinition.getType())
                                ? "extends " : "implements "
                        );
                        sb.append(basicType.toSourceCode(options));
                        sb.append(' ');
                    }
                }
                break;
        }
        sb.append('{');
        sb.append(options.getNewLineChars());

        //members
        for (GraphMember member: _members) {
            if (member.isVisible() || options.getClassPrivateMembers()) {
                String[] lines = member.toSourceCode(options).split(options.getNewLineChars());
                for (String line : lines) {
                    sb.append('\t');
                    sb.append(line);
                    sb.append(options.getNewLineChars());
                }
            }
        }

        sb.append('}');

        return sb.toString();
    }

}
