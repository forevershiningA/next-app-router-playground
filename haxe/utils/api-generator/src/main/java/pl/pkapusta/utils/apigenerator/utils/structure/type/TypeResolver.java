package pl.pkapusta.utils.apigenerator.utils.structure.type;

import pl.pkapusta.utils.apigenerator.utils.parser.ParserException;
import pl.pkapusta.utils.apigenerator.utils.parser.RegularExpressions;
import pl.pkapusta.utils.apigenerator.utils.parser.utils.BlockResolver;
import pl.pkapusta.utils.apigenerator.utils.structure.StructureException;

import java.util.regex.Matcher;

/**
 * @author Przemysław Kapusta
 */
public class TypeResolver {

    private int resolveEndPos = -1;

    public Type resolve(String data) throws StructureException {
        return resolve(data, 0);
    }

    public Type resolve(String data, int start) throws StructureException {
        try {
            int pos = seekSpaces(data, start);
            Matcher tm = RegularExpressions.IDENTIFIER_WITH_DOT.matcher(data);
            if (tm.find(pos)) {
                String typeStr = tm.group(0);
                pos = tm.end(0);
                pos = seekSpaces(data, pos);
                BasicType type;
                if (pos < data.length() && data.charAt(pos) == '<') {
                    //generic type
                    int posEnd = new BlockResolver(data).findBlockEnd(pos, BlockResolver.GENERIC_TYPE_BLOCK);
                    String typeGenData = data.substring(pos + 1, posEnd - 1).trim();
                    pos = posEnd;
                    Type subType = new TypeResolver().resolve(typeGenData, 0);
                    resolveEndPos = pos;
                    type = new GenericType(typeStr, subType);
                } else {
                    //basic type
                    resolveEndPos = pos;
                    type = new BasicType(typeStr);
                }
                pos = seekSpaces(data, pos);
                if (pos + 1 < data.length() && data.charAt(pos) == '-' && data.charAt(pos + 1) == '>') {
                    //arrow type
                    pos += 2;
                    TypeResolver resolver = new TypeResolver();
                    Type rightType = resolver.resolve(data.substring(pos), 0);
                    pos += resolver.getResolveEndPos();
                    resolveEndPos = pos;
                    return new ArrowType(type, rightType);
                } else {
                    //basic/generic type
                    return type;
                }
            } else {
                return null;
            }
        } catch (ParserException e) {
            throw new StructureException("Invalid type '" + data + "'", e);
        }
    }

    public int getResolveEndPos() {
        return resolveEndPos;
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

}
