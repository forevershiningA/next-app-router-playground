package pl.pkapusta.utils.apigenerator.tests;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import pl.pkapusta.utils.apigenerator.Executor;
import pl.pkapusta.utils.apigenerator.ExecutorException;

import java.io.File;

/**
 * @author Przemysław Kapusta
 */
public class ExecutorTest {

    @Test
    public void fileNotFound() {
        ExecutorException exception = assertThrows(ExecutorException.class, () -> {
            new Executor().bindConfig(new File("notfoundfile.xml"));
        });
        assertTrue(exception.getMessage().startsWith("Can't bind config file"));
    }

    @Test
    public void execute() throws ExecutorException {
        new Executor()
                .bindConfig(getClass().getResourceAsStream("/config.xml"))
                .execute();
    }

}
