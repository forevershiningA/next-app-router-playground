package pl.pkapusta.utils.apigenerator.tests;

import org.junit.jupiter.api.Test;
import pl.pkapusta.utils.apigenerator.Executor;
import pl.pkapusta.utils.apigenerator.ExecutorException;

import java.io.File;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * @author Przemysław Kapusta
 */
public class LibraryBuildTest {

    @Test
    public void away3d() throws ExecutorException {
        new Executor()
                .bindConfig(getClass().getResourceAsStream("/config_away3d.xml"))
                .execute();
    }

    @Test
    public void openfl() throws ExecutorException {
        new Executor()
                .bindConfig(getClass().getResourceAsStream("/config_openfl.xml"))
                .execute();
    }

    @Test
    public void engine() throws ExecutorException {
        new Executor()
                .bindConfig(getClass().getResourceAsStream("/config_engine.xml"))
                .execute();
    }

}
