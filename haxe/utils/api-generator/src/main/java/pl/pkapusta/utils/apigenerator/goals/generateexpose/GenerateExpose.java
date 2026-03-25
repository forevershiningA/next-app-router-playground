package pl.pkapusta.utils.apigenerator.goals.generateexpose;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.config.Input;
import pl.pkapusta.utils.apigenerator.config.parameters.ParamValue;
import pl.pkapusta.utils.apigenerator.goals.AbstractGoal;
import pl.pkapusta.utils.apigenerator.goals.GoalException;
import pl.pkapusta.utils.apigenerator.utils.parser.condition.ConditionResolver;
import pl.pkapusta.utils.apigenerator.utils.parser.condition.ExpressionConditionResolver;
import pl.pkapusta.utils.apigenerator.utils.visitors.FilteredInputClassesVisitor;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

public class GenerateExpose extends AbstractGoal<GenerateExposeConfig> {

    private static final Logger logger = LoggerFactory.getLogger(GenerateExpose.class);

    public static final String TYPE = "GenerateExpose";

    protected GenerateExpose(Input input, GenerateExposeConfig goalConfig) {
        super(input, goalConfig);
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public void process() throws GoalException {
        logger.trace("process()");

        File destDir = new File(getGoalConfig().getDestination());
        if (!destDir.exists())
            throw new GoalException("Destination directory not exists");
        if (destDir.exists() && destDir.isFile())
            throw new GoalException("Destination is file, you must specify directory");

        logger.debug("Destination directory: {}", destDir.getAbsolutePath());

        try {
            Path startPoint = destDir.toPath();
            new FilteredInputClassesVisitor(startPoint, getInput(), new ClassFileVisitor(this)).execute();
        } catch (IOException e) {
            throw new GoalException(e);
        }

    }

}
