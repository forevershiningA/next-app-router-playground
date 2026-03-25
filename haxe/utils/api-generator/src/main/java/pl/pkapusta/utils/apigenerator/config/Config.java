package pl.pkapusta.utils.apigenerator.config;

import org.eclipse.persistence.oxm.annotations.XmlPath;
import org.eclipse.persistence.oxm.annotations.XmlPaths;
import pl.pkapusta.utils.apigenerator.goals.copy.CopyConfig;
import pl.pkapusta.utils.apigenerator.goals.generateexpose.GenerateExposeConfig;
import pl.pkapusta.utils.apigenerator.goals.generateextern.GenerateExternConfig;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlElements;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.List;

@XmlRootElement
public class Config {

    private Input input;
    private List<IGoalConfig> goals;

    public Input getInput() {
        return input;
    }

    @XmlElement
    public void setInput(Input input) {
        this.input = input;
    }

    public List<IGoalConfig> getGoals() {
        return goals;
    }

    @XmlElementWrapper(name="goals")
    @XmlElements({
            @XmlElement(type = CopyConfig.class),
            @XmlElement(type = GenerateExposeConfig.class),
            @XmlElement(type = GenerateExternConfig.class)
    })
    @XmlPaths({
            @XmlPath("goals/goal[@type='Copy']"),
            @XmlPath("goals/goal[@type='GenerateExpose']"),
            @XmlPath("goals/goal[@type='GenerateExtern']")
    })
    public void setGoals(List<IGoalConfig> goals) {
        this.goals = goals;
    }

    @Override
    public String toString() {
        return "Config{" +
                "input=" + input +
                ", goals=" + goals +
                '}';
    }

}
