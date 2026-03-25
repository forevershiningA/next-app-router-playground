package pl.pkapusta.utils.apigenerator.config;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class Mapping {

    private String source;
    private String target;

    public String getSource() {
        return source;
    }

    @XmlElement
    public void setSource(String source) {
        this.source = source;
    }

    public String getTarget() {
        return target;
    }

    @XmlElement
    public void setTarget(String target) {
        this.target = target;
    }

    @Override
    public String toString() {
        return "Mapping{" +
                "source='" + source + '\'' +
                ", target='" + target + '\'' +
                '}';
    }

}
