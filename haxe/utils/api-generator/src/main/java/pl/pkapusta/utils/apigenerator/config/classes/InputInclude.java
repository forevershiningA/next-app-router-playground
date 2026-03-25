package pl.pkapusta.utils.apigenerator.config.classes;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlValue;

@XmlRootElement(name = "include")
public class InputInclude implements IInputClasses {

    private String content;
    private boolean allPackage;

    public InputInclude() {}

    public InputInclude(String content) {
        setContent(content);
    }

    public String getContent() {
        return content;
    }

    @XmlValue
    public void setContent(String content) {
        content = content.toLowerCase();
        if (content.endsWith(".*")) {
            content = content.substring(0, content.length() - 2);
            this.allPackage = true;
        }
        this.content = content;
    }

    public boolean isAllPackage() {
        return allPackage;
    }

    @XmlAttribute(name = "all-package")
    public void setAllPackage(boolean allPackage) {
        this.allPackage = allPackage;
    }

    @Override
    public String toString() {
        return "InputInclude{" +
                "content='" + content + '\'' +
                ", allPackage=" + allPackage +
                '}';
    }

}

