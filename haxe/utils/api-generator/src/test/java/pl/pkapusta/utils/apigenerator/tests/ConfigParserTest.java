package pl.pkapusta.utils.apigenerator.tests;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.config.Config;
import pl.pkapusta.utils.apigenerator.config.IGoalConfig;
import pl.pkapusta.utils.apigenerator.config.Input;
import pl.pkapusta.utils.apigenerator.config.Mapping;
import pl.pkapusta.utils.apigenerator.config.classes.IInputClasses;
import pl.pkapusta.utils.apigenerator.config.classes.InputExclude;
import pl.pkapusta.utils.apigenerator.config.classes.InputInclude;
import pl.pkapusta.utils.apigenerator.utils.ClassMatcher;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.util.LinkedList;
import java.util.List;

/**
 * @author Przemysław Kapusta
 */
public class ConfigParserTest {

    private static final Logger logger = LoggerFactory.getLogger(ConfigParserTest.class);

    @Test
    public void loadConfig() throws JAXBException {

        JAXBContext jaxbContext = JAXBContext.newInstance(Config.class);
        Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
        Config config = (Config) jaxbUnmarshaller.unmarshal(getClass().getResourceAsStream("/config.xml"));
        logger.info("{}", config);

        assertNotNull(config);

        Input input = config.getInput();
        assertNotNull(input);
        assertEquals("C:/HaxeToolkit/haxe/lib/away3d/5,0,9", input.getSourceDir());

        Mapping mapping = input.getMapping();
        assertNotNull(mapping);
        assertEquals("away3d.*", mapping.getSource());
        assertEquals("Engine3D.core.*", mapping.getTarget());

        List<IInputClasses> classes = input.getClasses();
        assertNotNull(classes);
        assertNotEquals(0, classes.size());

        List<IGoalConfig> goals = config.getGoals();
        assertNotNull(goals);
        assertNotEquals(0, goals.size());

    }

    @Test
    public void classesMatching() {

        List<IInputClasses> classes = new LinkedList<>();
        classes.add(new InputInclude("foo.bar.aaa.*"));
        classes.add(new InputExclude("foo.bar.aaa.ble"));
        classes.add(new InputExclude("foo.bar.aaa.blz.*"));
        classes.add(new InputInclude("foo.bar.xxx"));
        classes.add(new InputInclude("foo.bar.zzz"));

        assertTrue(ClassMatcher.fileMatch("foo/bar/aaa/dry.hx", classes));
        assertFalse(ClassMatcher.fileMatch("foo/bar/aaa.hx", classes));
        assertTrue(ClassMatcher.fileMatch("foo/bar/Aaa/dry.hx", classes)); //not case sensitive
        assertTrue(ClassMatcher.fileMatch("foo/bar/aaa/etc/dry.hx", classes));
        assertFalse(ClassMatcher.fileMatch("foo/bar/aaa/ble.hx", classes));
        assertTrue(ClassMatcher.fileMatch("foo/bar/aaa/ble/etc.hx", classes));
        assertTrue(ClassMatcher.fileMatch("foo/bar/aaa/blz.hx", classes));
        assertFalse(ClassMatcher.fileMatch("foo/bar/aaa/blz/a.hx", classes));
        assertTrue(ClassMatcher.fileMatch("foo/bar/xxx.hx", classes));
        assertFalse(ClassMatcher.fileMatch("foo/bar/yyy.hx", classes));
        assertTrue(ClassMatcher.fileMatch("foo/bar/zzz.hx", classes));

    }

}
