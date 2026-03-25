package pl.pkapusta.utils.apigenerator.goals;

import pl.pkapusta.utils.apigenerator.config.IGoalConfig;
import pl.pkapusta.utils.apigenerator.config.Input;

public abstract class AbstractGoal<GoalConfig extends IGoalConfig> {

    private Input input;
    private GoalConfig goalConfig;

    public AbstractGoal(Input input, GoalConfig goalConfig) {
        this.input = input;
        this.goalConfig = goalConfig;
    }

    public abstract String getType();

    public Input getInput() {
        return input;
    }

    public GoalConfig getGoalConfig() {
        return goalConfig;
    }

    public abstract void process() throws GoalException;

}
