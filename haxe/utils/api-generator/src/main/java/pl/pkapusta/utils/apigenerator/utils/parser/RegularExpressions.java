package pl.pkapusta.utils.apigenerator.utils.parser;

import java.util.regex.Pattern;

/**
 * @author Przemysław Kapusta
 */
public class RegularExpressions {

    public final static Pattern SPACE = Pattern.compile("(?:\\s)*");
    public static final Pattern NON_EMPTY_SPACE= Pattern.compile("(?:\\s)+");
    public final static Pattern IDENTIFIER = Pattern.compile("(?:\\w|_|\\$)+");
    public final static Pattern IDENTIFIER_WITH_DOT = Pattern.compile("(?:\\w|_|\\.|\\$)+");
    public final static Pattern IDENTIFIER_WITH_DOT_AND_ARROWS = Pattern.compile(IDENTIFIER_WITH_DOT+"(?:\\s*\\-\\>\\s*"+IDENTIFIER_WITH_DOT+")*");
    public final static Pattern MODIFIERS = Pattern.compile("(?:(?:\\s)*(?:override|abstract|final|volatile|transient|static|public|private|protected)\\s)*");
    public final static Pattern ANNOTATION_ID = Pattern.compile("@:("+IDENTIFIER_WITH_DOT+")"+SPACE);
    public final static Pattern CLASS_MEMBER_DEF_REGEX = Pattern.compile("("+MODIFIERS+")(var|function)"+NON_EMPTY_SPACE+"("+IDENTIFIER+")"+SPACE);
    public final static Pattern ARGUMENT_MEMBER_DEF_REGEX = Pattern.compile("("+MODIFIERS+")()"+SPACE+"("+IDENTIFIER+")"+SPACE);
    public static final Pattern PACKAGEIDENTIFIER = Pattern.compile("(\\w|_|\\$|\\.)+");
    public static final Pattern PACKAGE_REGEX = Pattern.compile("^"+SPACE+"\\b(package)("+NON_EMPTY_SPACE+"("+PACKAGEIDENTIFIER+"))?"+SPACE+"(;|\\b)"+SPACE);
    public static final Pattern IMPORT_REGEX = Pattern.compile("\\b(import)("+NON_EMPTY_SPACE+"("+PACKAGEIDENTIFIER+"(?:\\.\\*)?))?"+SPACE+"(;|\\b)");
    public static final Pattern CLASS_DEF_REGEXP = Pattern.compile("("+MODIFIERS+")(class|interface)"+NON_EMPTY_SPACE+"("+IDENTIFIER_WITH_DOT+")");
    public static final Pattern CLASS_EXTENDS_REGEXP = Pattern.compile("(?:extends)"+NON_EMPTY_SPACE+"("+IDENTIFIER_WITH_DOT+")");
    public static final Pattern CLASS_IMPLEMENTS_REGEXP = Pattern.compile("(?:implements)"+NON_EMPTY_SPACE+"("+IDENTIFIER_WITH_DOT+")");
    public static final Pattern CONDITIONAL_COMPILATION_REGEX = Pattern.compile("#(if|elseif|else|end)", Pattern.CASE_INSENSITIVE);
    public static final Pattern STRING_REGEXP = Pattern.compile("\"(.)*\"");
    public static final String JAVA_BLOCK_REGEXP = "(?:(\\s)*\\{(?:[^\\}])*\\}(\\s)*)";
    public static final String COMMENT_REGEXP = "(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/)|(?://.*)";

}
