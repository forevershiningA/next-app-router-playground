package pl.pkapusta.utils.apigenerator.goals.generateextern;

import pl.pkapusta.utils.apigenerator.config.Input;
import pl.pkapusta.utils.apigenerator.goals.AbstractGoal;
import pl.pkapusta.utils.apigenerator.config.IGoalConfig;

import javax.xml.bind.Unmarshaller;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "goal")
@XmlAccessorType(XmlAccessType.NONE)
public class GenerateExternConfig implements IGoalConfig {

    private static final String DEFAULT_CHARSET = "utf-8";

    private String destination;
    private boolean deleteIfExists;
    private String charset;

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

    public String getCharset() {
        return charset;
    }

    @XmlElement(defaultValue = DEFAULT_CHARSET)
    public void setCharset(String charset) {
        this.charset = charset;
    }

    @Override
    public AbstractGoal buildInstance(Input input) {
        return new GenerateExtern(input, this);
    }

    void afterUnmarshal(Unmarshaller unmarshaller, Object parent) {
        //set default values
        if (this.charset == null) this.charset = DEFAULT_CHARSET;
    }

    @Override
    public String toString() {
        return "GenerateExternConfig{" +
                "destination='" + destination + '\'' +
                ", deleteIfExists=" + deleteIfExists +
                ", charset='" + charset + '\'' +
                '}';
    }

}
