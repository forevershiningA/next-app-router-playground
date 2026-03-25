package pl.pkapusta.utils.apigenerator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.config.Config;
import pl.pkapusta.utils.apigenerator.config.IGoalConfig;
import pl.pkapusta.utils.apigenerator.goals.AbstractGoal;
import pl.pkapusta.utils.apigenerator.goals.GoalException;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.io.File;
import java.io.InputStream;

public class Executor {

    private static final Logger logger = LoggerFactory.getLogger(Executor.class);

    private Config config;

    public Executor bindConfig(File configFile) throws ExecutorException {
        logger.trace("bindConfig({})", configFile);
        try {
            JAXBContext jaxbContext = JAXBContext.newInstance(Config.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            this.config = (Config) jaxbUnmarshaller.unmarshal(configFile);
            return this;
        } catch (JAXBException e) {
            throw new ExecutorException("Can't bind config file: " + configFile.getAbsolutePath(), e);
        }
    }

    public Executor bindConfig(InputStream configStream) throws ExecutorException {
        logger.trace("bindConfig(<stream>)");
        try {
            JAXBContext jaxbContext = JAXBContext.newInstance(Config.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            this.config = (Config) jaxbUnmarshaller.unmarshal(configStream);
            return this;
        } catch (JAXBException e) {
            throw new ExecutorException("Can't bind config from input stream", e);
        }
    }

    public void execute() throws ExecutorException {
        logger.trace("execute()");
        if (config == null)
            throw new ExecutorException("Can't execute because no config is specified");
        if (config.getGoals() == null || config.getGoals().isEmpty())
            throw new ExecutorException("Can't execute because no goals specified in config");
        for (IGoalConfig goalConfig: config.getGoals()) {
            AbstractGoal goal = goalConfig.buildInstance(config.getInput());
            try {
                logger.trace("execute() -> process goal: {}", goal.getType());
                goal.process();
            } catch (GoalException e) {
                throw new ExecutorException("Exception in goal: " + goal.getType(), e);
            }
        }
    }

}
