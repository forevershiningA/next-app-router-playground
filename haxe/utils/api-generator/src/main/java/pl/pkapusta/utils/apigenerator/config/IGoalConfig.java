package pl.pkapusta.utils.apigenerator.config;

import pl.pkapusta.utils.apigenerator.goals.AbstractGoal;

public interface IGoalConfig {

    AbstractGoal buildInstance(Input input);

}
