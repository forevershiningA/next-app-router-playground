package pl.pkapusta.utils.apigenerator.utils.parser.definitions;

import java.util.Arrays;

/**
 * @author Przemysław Kapusta
 */
public class SourceDefinition {

    private final String _package;
    private final ClassDefinition _primaryClass;
    private final ClassDefinition[] _classes;
    private final String[] _imports;

    public SourceDefinition(String _package, ClassDefinition _primaryClass, ClassDefinition[] _classes, String[] _imports) {
        this._package = _package;
        this._primaryClass = _primaryClass;
        this._classes = _classes;
        this._imports = _imports;
        for (ClassDefinition clazz: _classes) {
            clazz.setSourceDefinition(this);
        }
    }

    public String getPackage() {
        return _package;
    }

    public ClassDefinition getPrimaryClass() {
        return _primaryClass;
    }

    public ClassDefinition[] getClasses() {
        return _classes;
    }

    public String[] getImports() {
        return _imports;
    }

    @Override
    public String toString() {
        return "SourceDefinition{" +
                "package='" + _package + '\'' +
                ", primaryClass=" + _primaryClass +
                ", classes=" + Arrays.toString(_classes) +
                ", imports=" + Arrays.toString(_imports) +
                '}';
    }

}
