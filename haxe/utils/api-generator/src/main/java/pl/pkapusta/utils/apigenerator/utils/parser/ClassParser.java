package pl.pkapusta.utils.apigenerator.utils.parser;

import jdk.nashorn.internal.ir.UnaryNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.ClassDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.FieldDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.MemberDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.MethodDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.PropertyDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.misc.ArgumentDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.utils.BlockResolver;
import pl.pkapusta.utils.apigenerator.utils.structure.StructureException;
import pl.pkapusta.utils.apigenerator.utils.structure.type.Type;
import pl.pkapusta.utils.apigenerator.utils.structure.type.TypeResolver;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Przemysław Kapusta
 */
public class ClassParser {

    private static final Logger logger = LoggerFactory.getLogger(ClassParser.class);

    private final ClassDefinition definition;
    private String source;

    protected ClassParser(ClassDefinition definition, String source) {
        this.definition = definition;
        this.source = source;
    }

    public ClassDefinition parse() throws ParserException {
        parseClassMembers();
        return definition;
    }

    private void parseClassMembers() throws ParserException {
        List<BasicParseMember> members = basicParseMembers(this.source, MemberType.CLASS);
        List<MemberDefinition> defs = definition.getMembers();
        for (BasicParseMember member: members) {
            if ("var".equals(member.classifier)) {
                if (member.args == null) {
                    //is field
                    defs.add(new FieldDefinition(
                            member.name, member.modifiers,
                            member.type, member.assignment
                    ));
                } else {
                    //is property
                    String[] accessIdentifiers = member.args.trim().split("\\s*\\,\\s*");
                    defs.add(new PropertyDefinition(
                            member.name, member.modifiers, member.type,
                            accessIdentifiers[0], accessIdentifiers[1]
                    ));
                }
            } else if ("function".equals(member.classifier)) {
                //is method
                //logger.trace("parsing method '{}' arguments '{}'", member.name, member.args);
                List<ArgumentDefinition> args = parseMethodArguments(member.args);
                defs.add(new MethodDefinition(
                        member.name, member.modifiers,
                        member.type, args.toArray(new ArgumentDefinition[0])
                ));
            } else new ParserException("Invalid member");
        }
    }

    private List<ArgumentDefinition> parseMethodArguments(String data) throws ParserException {
        List<ArgumentDefinition> args = new ArrayList<>();
        if (data == null) return args;
        List<BasicParseMember> members = basicParseMembers(data, MemberType.ARGUMENT);
        for (BasicParseMember member: members) {
            args.add(new ArgumentDefinition(
                    member.name, member.modifiers,
                    member.type, member.assignment
            ));
        }
        return args;
    }

    private List<BasicParseMember> basicParseMembers(String data, MemberType memberType) throws ParserException {
        //logger.trace("Parsing members: {}", data);

        try {

            List<BasicParseMember> members = new ArrayList<>();
            int pos = 0;
            BlockResolver blockResolver = new BlockResolver(data);
            Matcher m = memberType.regex.matcher(data);
            while (pos < data.length() && m.find(pos)) {
                BasicParseMember member = new BasicParseMember();
                String tmoditiers = m.group(1).trim();
                member.modifiers = (!tmoditiers.isEmpty()) ?
                        RegularExpressions.NON_EMPTY_SPACE.split(tmoditiers) : new String[0];
                member.classifier = m.group(2);
                member.name = m.group(3);
                pos = m.end(0);

                //logger.trace("member.name = {}", member.name);

                if (memberType.methodArgsExpected && pos < data.length()) {
                    //arguments
                    if (data.charAt(pos) == '(') {
                        int posEnd = blockResolver.findBlockEnd(pos, BlockResolver.PROPERTY_OR_FUNCTION_ARGS_BLOCK);
                        member.args = data.substring(pos + 1, posEnd - 1).trim();
                        if (member.args.isEmpty()) member.args = null;
                        pos = posEnd;
                    }
                    pos = seekSpaces(data, pos);
                }

                //type
                if (pos < data.length()) {
                    if (data.charAt(pos) == ':') {
                        pos = seekSpaces(data, pos + 1);
                        TypeResolver resolver = new TypeResolver();
                        member.type = resolver.resolve(data, pos);
                        pos = resolver.getResolveEndPos();

//                    Matcher tm = RegularExpressions.IDENTIFIER_WITH_DOT_AND_ARROWS.matcher(data);
//                    if (tm.find(pos)) {
//                        String typeData = tm.group(0);
//                        pos = tm.end(0);
//
//                        //find generic type (if exists)
//                        pos = seekSpaces(data, pos);
//                        if (pos < data.length()) {
//                            if (data.charAt(pos) == '<') {
//                                int posEnd = blockResolver.findBlockEnd(pos, BlockResolver.GENERIC_TYPE_BLOCK);
//                                String typeGenData = data.substring(pos + 1, posEnd - 1).trim();
//                                typeData += '<' + typeGenData + '>';
//                                pos = posEnd;
//                            }
//                        }
//                        member.type = typeData;
//
//                    }
                    }
                    pos = seekSpaces(data, pos);
                }

                if (pos < data.length()) {
                    if (data.charAt(pos) == '=') {
                        //assignment
                        int separatorPos = find(data, pos + 1, memberType.separator);
                        if (separatorPos == -1)
                            separatorPos = data.length();
                        //throw new ParserException("Error when parsing field/property/metchod in class '"
                        //        + definition.getName() + "'. Expected separator.");
                        member.assignment = data.substring(pos + 1, separatorPos).trim();
                        pos = separatorPos + 1;
                    } else if (data.charAt(pos) == memberType.separator) {
                        pos += 1; //+1 because we need to pass semicolon
                    } else if (memberType.blockCodeExpected && data.charAt(pos) == '{') {
                        pos = blockResolver.findBlockEnd(pos, BlockResolver.CODE_BLOCK);
                    } else throw new ParserException("Unexpected char '" + data.charAt(pos) + "' when parsing field "
                            + definition.getName() + "." + member.name);
                }

                //logger.trace("Found name: {}, modifiers: {}, classifier: {}, args: {}, type: {}, assignment: {}",
                //        member.name, member.modifiers, member.classifier, member.args, member.type, member.assignment);

                members.add(member);

            }
            return members;
        } catch (StructureException e) {
            throw new ParserException(e);
        }
    }

    enum MemberType {

        CLASS (RegularExpressions.CLASS_MEMBER_DEF_REGEX, ';', true, true),
        ARGUMENT (RegularExpressions.ARGUMENT_MEMBER_DEF_REGEX, ',', false, false);

        private final Pattern regex;
        private final char separator;
        private final boolean blockCodeExpected;
        private final boolean methodArgsExpected;

        MemberType (Pattern regex, char separator,
                            boolean blockCodeExpected, boolean methodArgsExpected) {
            this.regex = regex;
            this.separator = separator;
            this.blockCodeExpected = blockCodeExpected;
            this.methodArgsExpected = methodArgsExpected;
        }

    }

    class BasicParseMember {
        private String[] modifiers = null;
        private String classifier = null;
        private String name = null;
        private String args = null;
        private Type type = null;
        private String assignment = null;
    }

    private int seekSpaces(String data, int start) {
        if (start >= data.length()) return start;
        Matcher m = RegularExpressions.SPACE.matcher(data);
        if (m.find(start)) {
            return m.end(0);
        } else {
            return start;
        }
    }

    private int find(String data, int start, char ch) {
        for (int pos = start; pos < data.length(); ++pos) {
            if (data.charAt(pos) == ch) return pos;
        }
        return -1;
    }

}
