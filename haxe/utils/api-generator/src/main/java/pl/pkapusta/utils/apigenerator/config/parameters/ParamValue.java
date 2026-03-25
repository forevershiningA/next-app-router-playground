package pl.pkapusta.utils.apigenerator.config.parameters;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Przemysław Kapusta
 */

@XmlRootElement(name = "param")
public class ParamValue {

    private String name;
    private String value;

    public String getName() {
        return name;
    }

    @XmlAttribute(name = "name")
    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    @XmlAttribute(name = "value")
    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return "ParamValue{" +
                "name='" + name + '\'' +
                ", value='" + value + '\'' +
                '}';
    }

}
