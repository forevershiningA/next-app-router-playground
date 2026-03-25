package pl.pkapusta.utils.apigenerator.utils.mapping;

import pl.pkapusta.utils.apigenerator.config.Mapping;

import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Przemysław Kapusta
 */
public class PackageMapping {

    private final Pattern sourcePattern;
    private final String[] targetCache;

    public PackageMapping(Mapping mapping) {
        this.sourcePattern = buildSourcePattern(mapping.getSource());
        this.targetCache = buildTargetCache(mapping.getTarget());
    }

    public PackageMapping(String source, String target) {
        this.sourcePattern = buildSourcePattern(source);
        this.targetCache = buildTargetCache(target);
    }

    private Pattern buildSourcePattern(String source) {
        source = source.replaceAll("\\*+", "*");
        String[] slist = source.split("\\*");
        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < slist.length; ++i) {
            sb.append(Pattern.quote(slist[i]));
            sb.append("(.*)");
        }
        return Pattern.compile(sb.toString());
    }

    private String[] buildTargetCache(String target) {
        target = target.replaceAll("\\*+", "*");
        return target.split("\\*");
    }

    public String translateMapping(String source) {
        Matcher m = sourcePattern.matcher(source);
        if (m.find()) {
            StringBuffer sb = new StringBuffer();
            for (int i = 1; i <= m.groupCount(); ++i) {
                sb.append(targetCache[i-1]);
                sb.append(m.group(i));
            }
            return sb.toString();
        } else {
            return source;
        }
    }

    @Override
    public String toString() {
        return "PackageMapping{" +
                "sourcePattern=" + sourcePattern +
                ", targetCache=" + Arrays.toString(targetCache) +
                '}';
    }

}
