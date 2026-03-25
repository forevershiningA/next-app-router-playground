package pl.pkapusta.utils.apigenerator.goals.generateextern;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.config.Input;
import pl.pkapusta.utils.apigenerator.goals.AbstractGoal;
import pl.pkapusta.utils.apigenerator.goals.GoalException;
import pl.pkapusta.utils.apigenerator.utils.interfaces.SourceCodeMaker;
import pl.pkapusta.utils.apigenerator.utils.mapping.PackageMapping;
import pl.pkapusta.utils.apigenerator.utils.misc.FullyQualifiedName;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.SourceDefinition;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.Graph;
import pl.pkapusta.utils.apigenerator.utils.structure.StructureException;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.GraphAnnotation;
import pl.pkapusta.utils.apigenerator.utils.structure.graph.GraphClass;
import pl.pkapusta.utils.apigenerator.utils.visitors.FilteredInputClassesVisitor;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Iterator;

public class GenerateExtern extends AbstractGoal<GenerateExternConfig> {

    private static final Logger logger = LoggerFactory.getLogger(GenerateExtern.class);

    public static final String TYPE = "GenerateExtern";

    private static final String EXT = ".hx";

    private final PackageMapping packageMapping;

    public GenerateExtern(Input input, GenerateExternConfig goalConfig) {
        super(input, goalConfig);
        if (getInput().getMapping() != null) {
            packageMapping = new PackageMapping(getInput().getMapping());
        } else {
            packageMapping = null;
        }
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public void process() throws GoalException {
        logger.trace("process()");

        File destDir = new File(getGoalConfig().getDestination());
        if (destDir.exists() && destDir.isFile())
            throw new GoalException("Destination is file, you must specify directory");

        File sourceDir = new File(getInput().getSourceDir());
        if (!sourceDir.exists())
            throw new GoalException("Source directory not exists");
        if (sourceDir.isFile())
            throw new GoalException("Source can't be file");

        logger.debug("Source directory: {}", sourceDir.getAbsolutePath());
        logger.debug("Destination directory: {}", destDir.getAbsolutePath());

        try {
            if (destDir.exists() && getGoalConfig().getDeleteIfExists()) {
                FileUtils.deleteDirectory(destDir);
            }

            //parsing
            ClassFileVisitor visitor = new ClassFileVisitor(this);
            new FilteredInputClassesVisitor(sourceDir.toPath(), getInput(), visitor).execute();

            //build graph
            Graph graph = new Graph();
            for (SourceDefinition sourceDefinition: visitor.getParsedDefinitions()) {
                graph.addSourceDefinition(sourceDefinition);
            }
            graph.buildGraph();

            //iterate graph classes
            for (GraphClass graphClass: graph.getGraphClasses()) {

                //add extern modifier
                graphClass.getModifiers().addFirst("extern");

                //add native annotation
                String nativeName = null;
                Iterator<GraphAnnotation> it = graphClass.getAnnotations().iterator();
                while (it.hasNext()) {
                    GraphAnnotation annotation = it.next();
                    if ("expose".equals(annotation.getName().toLowerCase())) {
                        nativeName = annotation.getParams();
                        it.remove();
                    }
                }
                if (nativeName == null) {
                    if (packageMapping != null) {
                        String fullyQName = graphClass.getFullyQualifiedName();
                        String tmpNativeName = packageMapping.translateMapping(fullyQName);
                        if (!fullyQName.equals(tmpNativeName)) {
                            nativeName = "\"" + tmpNativeName + "\"";
                        }
                    }
                }
                if (nativeName != null) {
                    graphClass.getAnnotations().addLast(
                            new GraphAnnotation("native", nativeName)
                    );
                }

                //set extern source generator options
                SourceCodeMaker.Options externOptions = new SourceCodeMaker.Options()
                //        .setArgumentsAssigment(false)
                        .setArgumentsModifiers(false)
                        .setClassPrivateMembers(false)
                        .setMethodsBody(false)
                        .setRepairOverride(true);

                //generate extern code
                String generatedExtern = graphClass.toSourceCode(externOptions);

                //save to file
                String pkg = graphClass.getPackage();
                String subdir = (pkg == null || pkg.isEmpty())?"":
                        File.separator + pkg.replace(".", File.separator);
                File classDestDir = new File(destDir.getAbsolutePath() + subdir);
                classDestDir.mkdirs();

                File classDestFile = new File(classDestDir.getAbsolutePath()
                        + File.separator
                        + graphClass.getName().getName() + EXT);
                try (FileOutputStream fos = new FileOutputStream(classDestFile)) {
                    Charset charset = Charset.forName(getGoalConfig().getCharset().toUpperCase());
                    IOUtils.write(generatedExtern, fos, charset);
                    logger.info("Write extern to: {}", classDestFile);
                }

            }

        } catch (StructureException e) {
            throw new GoalException(e);
        } catch (IOException e) {
            throw new GoalException(e);
        }

    }

}
