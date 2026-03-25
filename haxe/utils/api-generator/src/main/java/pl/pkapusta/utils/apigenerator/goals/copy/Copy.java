package pl.pkapusta.utils.apigenerator.goals.copy;

import org.apache.commons.io.FileUtils;
import pl.pkapusta.utils.apigenerator.config.Input;
import pl.pkapusta.utils.apigenerator.goals.AbstractGoal;
import pl.pkapusta.utils.apigenerator.goals.GoalException;

import java.io.File;
import java.io.IOException;

public class Copy extends AbstractGoal<CopyConfig> {

    public static final String TYPE = "Copy";

    protected Copy(Input input, CopyConfig goalConfig) {
        super(input, goalConfig);
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public void process() throws GoalException {
        if (getGoalConfig().getDestination() == null || getGoalConfig().getDestination().isEmpty())
            throw new GoalException("Destination property must be specified");

        File destDir = new File(getGoalConfig().getDestination());
        if (destDir.exists() && destDir.isFile())
            throw new GoalException("Destination is file, you must specify directory");

        File sourceDir = new File(getInput().getSourceDir());
        if (!sourceDir.exists())
            throw new GoalException("Source directory not exists");
        if (sourceDir.isFile())
            throw new GoalException("Source can't be file");

        try {
            if (destDir.exists() && getGoalConfig().getDeleteIfExists()) {
                FileUtils.deleteDirectory(destDir);
            }
            if (!destDir.exists()) {
                FileUtils.forceMkdir(destDir);
            }
            FileUtils.copyDirectory(sourceDir, destDir, true);
        } catch (IOException e) {
            throw new GoalException(e);
        }

    }

}
