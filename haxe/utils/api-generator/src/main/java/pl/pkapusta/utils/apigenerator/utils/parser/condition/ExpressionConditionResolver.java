package pl.pkapusta.utils.apigenerator.utils.parser.condition;

import pl.pkapusta.utils.apigenerator.utils.parser.ParserException;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Przemysław Kapusta
 */
public class ExpressionConditionResolver implements ConditionResolver {

    private ScriptEngineManager factory;
    private ScriptEngine cachedEngine;

    private Map<String, String> parametersMap;

    public ExpressionConditionResolver() {
        parametersMap = new HashMap<>();
    }

    public ExpressionConditionResolver setParamValue(String name, String value) {
        cachedEngine = null;
        parametersMap.put(name, value);
        return this;
    }

    public ExpressionConditionResolver clearParams() {
        cachedEngine = null;
        parametersMap.clear();
        return this;
    }

    @Override
    public boolean resolve(String condition) throws ParserException {
        if (factory == null) factory = new ScriptEngineManager();

        try {

            if (cachedEngine == null) {
                cachedEngine = factory.getEngineByName("JavaScript");
                //cache params
                StringBuffer sb = new StringBuffer();
                for (Map.Entry<String, String> entry : parametersMap.entrySet()) {
                    sb.append(entry.getKey());
                    sb.append(" = ");
                    sb.append(entry.getValue());
                    cachedEngine.eval(sb.toString());
                    sb.setLength(0);
                }
            }

            return (Boolean) cachedEngine.eval(condition);

        } catch (ScriptException e) {
            throw new ParserException("Can't resolve expression condition", e);
        }
    }

}
