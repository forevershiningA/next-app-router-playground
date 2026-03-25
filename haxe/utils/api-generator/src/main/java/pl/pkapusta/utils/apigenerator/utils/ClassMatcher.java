package pl.pkapusta.utils.apigenerator.utils;

import pl.pkapusta.utils.apigenerator.config.classes.IInputClasses;
import pl.pkapusta.utils.apigenerator.config.classes.InputExclude;
import pl.pkapusta.utils.apigenerator.config.classes.InputInclude;

import java.util.Collection;

public class ClassMatcher {

    private static final String EXT = ".hx";

    public static boolean fileMatch(String file, IInputClasses matcher) {
        if (matcher instanceof InputExclude) return false; //always not maching
        return doMatching(prepareFile(file), matcher);
    }

    public static boolean fileMatch(String file, Collection<IInputClasses> matchers) {
        String preparedFile = prepareFile(file);

        //check for some excludes
        for (IInputClasses matcher: matchers) {
            if (matcher instanceof InputExclude) {
                if (doMatching(preparedFile, matcher)) return false;
            }
        }

        //check for includes
        for (IInputClasses matcher: matchers) {
            if (matcher instanceof InputInclude) {
                if (doMatching(preparedFile, matcher)) return true;
            }
        }

        //default false
        return false;
    }

    private static boolean doMatching(String file, IInputClasses matcher) {
        return (!matcher.isAllPackage())?
                file.equals(matcher.getContent())
                :
                file.startsWith(matcher.getContent()) && file.length() > matcher.getContent().length();
    }

    private static String prepareFile(String file) {
        file = file.toLowerCase();
        if (file.endsWith(EXT)) file = file.substring(0, file.length() - EXT.length());
        file = file.replaceAll("[\\\\/]+", ".");
        return file;
    }

}
