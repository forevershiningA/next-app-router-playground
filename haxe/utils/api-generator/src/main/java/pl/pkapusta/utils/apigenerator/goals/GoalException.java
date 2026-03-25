package pl.pkapusta.utils.apigenerator.goals;

public class GoalException extends Exception {

    public GoalException(String message) {
        super(message);
    }

    public GoalException(String message, Throwable cause) {
        super(message, cause);
    }

    public GoalException(Throwable cause) {
        super(cause);
    }

}
