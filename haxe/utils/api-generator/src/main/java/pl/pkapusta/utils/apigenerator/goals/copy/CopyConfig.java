package pl.pkapusta.utils.apigenerator.goals.copy;

import pl.pkapusta.utils.apigenerator.config.IGoalConfig;
import pl.pkapusta.utils.apigenerator.config.Input;
import pl.pkapusta.utils.apigenerator.goals.AbstractGoal;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "goal")
@XmlAccessorType(XmlAccessType.NONE)
public class CopyConfig implements IGoalConfig {

    private String destination;
    private boolean deleteIfExists;

    public String getDestination() {
        return destination;
    }

    @XmlElement
    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Boolean getDeleteIfExists() {
        return deleteIfExists;
    }

    @XmlElement(name = "delete-if-exists")
    public void setDeleteIfExists(Boolean deleteIfExists) {
        this.deleteIfExists = deleteIfExists;
    }

    @Override
    public AbstractGoal buildInstance(Input input) {
        return new Copy(input, this);
    }

    @Override
    public String toString() {
        return "CopyConfig{" +
                "destination='" + destination + '\'' +
                ", deleteIfExists=" + deleteIfExists +
                '}';
    }

}
