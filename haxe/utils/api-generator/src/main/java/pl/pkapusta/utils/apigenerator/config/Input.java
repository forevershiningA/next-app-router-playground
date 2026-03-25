package pl.pkapusta.utils.apigenerator.config;

import pl.pkapusta.utils.apigenerator.config.classes.IInputClasses;
import pl.pkapusta.utils.apigenerator.config.classes.InputExclude;
import pl.pkapusta.utils.apigenerator.config.classes.InputInclude;
import pl.pkapusta.utils.apigenerator.config.parameters.ParamValue;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlElements;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.List;

@XmlRootElement
public class Input {

    private String sourceDir;
    private List<IInputClasses> classes;
    private List<ParamValue> ccparams;
    private Mapping mapping;

    public String getSourceDir() {
        return sourceDir;
    }

    @XmlElement(name = "source-dir")
    public void setSourceDir(String sourceDir) {
        this.sourceDir = sourceDir;
    }

    public List<IInputClasses> getClasses() {
        return classes;
    }

    @XmlElementWrapper(name="classes")
    @XmlElements({
        @XmlElement(name = "include", type = InputInclude.class),
        @XmlElement(name = "exclude", type = InputExclude.class)
    })
    public void setClasses(List<IInputClasses> classes) {
        this.classes = classes;
    }

    public List<ParamValue> getCCParams() {
        return ccparams;
    }

    @XmlElementWrapper(name="ccparams")
    @XmlElements({
        @XmlElement(name = "param", type = ParamValue.class)
    })
    public void setCCParams(List<ParamValue> ccparams) {
        this.ccparams = ccparams;
    }

    public Mapping getMapping() {
        return mapping;
    }

    @XmlElement
    public void setMapping(Mapping mapping) {
        this.mapping = mapping;
    }

    @Override
    public String toString() {
        return "Input{" +
                "sourceDir='" + sourceDir + '\'' +
                ", classes=" + classes +
                ", ccparams=" + ccparams +
                ", mapping=" + mapping +
                '}';
    }

}
