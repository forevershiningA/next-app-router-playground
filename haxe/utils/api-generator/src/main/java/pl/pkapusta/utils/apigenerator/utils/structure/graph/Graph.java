package pl.pkapusta.utils.apigenerator.utils.structure.graph;

import pl.pkapusta.utils.apigenerator.utils.misc.FullyQualifiedName;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.ClassDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.SourceDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.StructureException;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Przemysław Kapusta
 */
public class Graph {

    public static final String DEFAULT_ANY_TYPE_NAME = "Any";

    private final Map<String, ClassDefinition> classDefinitionMap;
    private final Map<String, GraphClass> classGraphObjsMap;

    public Graph() {
        classDefinitionMap = new HashMap<>();
        classGraphObjsMap = new HashMap<>();
    }

    public Graph addSourceDefinition(SourceDefinition sourceDefinition) throws StructureException {
        for (ClassDefinition classDefinition: sourceDefinition.getClasses()) {
            String fullyQualifiedName = FullyQualifiedName.fromDefinition(classDefinition);
            if (classDefinitionMap.containsKey(fullyQualifiedName))
                throw new StructureException("Can't add class with same name (duplicate)");
            classDefinitionMap.put(fullyQualifiedName, classDefinition);
        }
        return this;
    }

    public Graph addSourceDefinition(Iterable<SourceDefinition> sourceDefinitions) throws StructureException {
        for (SourceDefinition sd: sourceDefinitions) {
            addSourceDefinition(sd);
        }
        return this;
    }

    public Graph addSourceDefinition(SourceDefinition[] sourceDefinitions) throws StructureException {
        for (SourceDefinition sd: sourceDefinitions) {
            addSourceDefinition(sd);
        }
        return this;
    }

    public Graph buildGraph() {
        classGraphObjsMap.clear();
        for (Map.Entry<String, ClassDefinition> entry: classDefinitionMap.entrySet()) {
            if (!classGraphObjsMap.containsKey(entry.getKey())) {
                GraphClass graphClass = new GraphClass(entry.getValue());
                classGraphObjsMap.put(graphClass.getFullyQualifiedName(), graphClass);
                graphClass.buildGraph(classDefinitionMap, classGraphObjsMap);
            }
        }
        return this;
    }

    public GraphClass getGraphClass(String fullyQualifiedName) {
        return classGraphObjsMap.get(fullyQualifiedName);
    }

    public Iterable<GraphClass> getGraphClasses() {
        return classGraphObjsMap.values();
    }

}
