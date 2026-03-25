package pl.pkapusta.utils.apigenerator.config.classes;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlValue;

public interface IInputClasses {

    boolean isAllPackage();

    @XmlAttribute(name = "all-package")
    void setAllPackage(boolean allPackage);

    String getContent();

    @XmlValue
    void setContent(String content);

}
