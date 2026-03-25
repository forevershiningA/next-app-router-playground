package pl.pkapusta.utils.apigenerator.utils.parser.optimizators;

import jdk.nashorn.internal.ir.Block;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.utils.parser.ParserException;
import pl.pkapusta.utils.apigenerator.utils.parser.RegularExpressions;
import pl.pkapusta.utils.apigenerator.utils.parser.condition.ConditionResolver;
import pl.pkapusta.utils.apigenerator.utils.parser.utils.BlockResolver;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;

/**
 * @author Przemysław Kapusta
 */
public class ConditionalCompilationResolver implements IOptimizator {

    private static final Logger logger = LoggerFactory.getLogger(ConditionalCompilationResolver.class);

    private ConditionResolver conditionResolver;

    public ConditionalCompilationResolver setConditionResolver(ConditionResolver conditionResolver) {
        this.conditionResolver = conditionResolver;
        return this;
    }

    @Override
    public String optimize(String data) throws ParserException {
        logger.trace("optimize() start");
        BlockPos[] stringQuotations = findStringQuotationPositions(data);
        logger.trace("stringQuotations: {}", stringQuotations);

        List<BlockPos> toRemove = new ArrayList<>();
        resolveConditionalsRecurring(data, 0, data.length(), toRemove, stringQuotations, true);
        logger.trace("toRemove: {}", toRemove);

        int start = 0;
        StringBuilder sb = new StringBuilder();
        for (BlockPos bp: toRemove) {
            sb.append(data.substring(start, bp.getStart()));
            start = bp.getEnd();
        }
        sb.append(data.substring(start, data.length()));

        return sb.toString();
    }

    private int resolveConditionalsRecurring(final String data, final int from, final int to,
                                             final List<BlockPos> toRemove,
                                             final BlockPos[] stringQuotations,
                                             final boolean activeBlock) throws ParserException {
        int pos = from;
        while (pos >= from && pos < to) {
            CCExpression expression = findCCExpression(data, pos, to, stringQuotations);
            if (expression == null) return to;
            logger.trace("ccexpression found: {}", expression);
            pos = expression.getEnd();
            if (expression == null) break;
            if (CCExpressionType.IF.equals(expression.getType())) {
                pos = resolveIfExpression(expression, data, pos, to, toRemove, stringQuotations, activeBlock);
            } else if (CCExpressionType.UNDEFINED.equals(expression.getType())) {
                logger.trace("Ommiting undefined expression {}", expression.getValue());
                continue;
            } else {
                logger.trace("Unexpected conditional compilation expression {} means exit at position {}", expression.getValue(), expression.getStart());
                //throw new ParserException("Unexpected conditional compilation expression: " + expression.getValue());
                return expression.getStart();
            }
        }
        return to;
    }

    private int resolveIfExpression(final CCExpression ifExpression,
                                    final String data, final int from, final int to,
                                    final List<BlockPos> toRemove,
                                    final BlockPos[] stringQuotations,
                                    final boolean activeBlock) throws ParserException {
        logger.trace("resolveIfExpression from pos: {}", from);
        final BlockResolver blockResolver = new BlockResolver(data);
        int pos = from;
        boolean foundCondition = false;
        int conditionBlockEnd = -1;
        CCExpression expression = ifExpression;

        while (pos >= from && pos < to) {
            switch (expression.getType()) {
                case IF:
                case ELSEIF:

                    //finding condition
                    pos = seekSpaces(data, pos);
                    String ifCondition;
                    if (data.charAt(pos) == '(') {
                        int blockEnd = blockResolver.findBlockEnd(pos, BlockResolver.CONDITION_BLOCK);
                        ifCondition = data.substring(pos + 1, blockEnd - 1).trim();
                        pos = blockEnd;
                    } else {
                        int condEnd = findFirstSpace(data, pos);
                        ifCondition = data.substring(pos, condEnd);
                        pos = condEnd;
                    }
                    logger.trace("ifCondition: {}", ifCondition);

                    boolean currentActiveBlock = false;
                    if (activeBlock && !foundCondition) {
                        if (resolveIfCondition(ifCondition)) {
                            logger.trace("ifCondition == true");
                            currentActiveBlock = true;
                            foundCondition = true;
                            toRemove.add(new BlockPos(ifExpression.getStart(), pos));
                        } else {
                            logger.trace("ifCondition == false");
                        }
                    }

                    pos = resolveConditionalsRecurring(data, pos, to, toRemove, stringQuotations, currentActiveBlock);
                    if (currentActiveBlock) conditionBlockEnd = pos;

                break;
                case ELSE:
                    currentActiveBlock = false;
                    if (activeBlock && !foundCondition) {
                        logger.trace("else is true");
                        currentActiveBlock = true;
                        foundCondition = true;
                        toRemove.add(new BlockPos(ifExpression.getStart(), pos));
                    }
                    pos = resolveConditionalsRecurring(data, pos, to, toRemove, stringQuotations, currentActiveBlock);
                    if (currentActiveBlock) conditionBlockEnd = pos;
                break;
                case END:
                    logger.trace("this is end of if statement");
                    if (conditionBlockEnd != -1) {
                        toRemove.add(new BlockPos(conditionBlockEnd, pos));
                    } else if (activeBlock && !foundCondition) {
                        toRemove.add(new BlockPos(ifExpression.getStart(), pos));
                    }
                    return pos; //return pos of end
                //break;
            }
            expression = findCCExpression(data, pos, to, stringQuotations);
            pos = expression.getEnd();
            logger.trace("if ccexpression found: {}", expression);
        }

        return pos;

    }

    private boolean resolveIfCondition(final String ifCondition) throws ParserException {
        if (conditionResolver == null) throw new ParserException("Can't resolve condition '" + ifCondition + "'. ConditionResolver must be set");
        return conditionResolver.resolve(ifCondition);
    }

    private CCExpression findCCExpression(final String data, final int from, final int to,
                                          final BlockPos[] stringQuotations) {
        int pos = from;
        Matcher matcher = RegularExpressions.CONDITIONAL_COMPILATION_REGEX.matcher(data);
        while (matcher.find(pos) && matcher.end(0) <= to) {
            pos = matcher.end(0);
            if (inQuotationPositions(matcher.start(0), matcher.end(0), stringQuotations)) continue;
            return new CCExpression(matcher.group(1), matcher.start(0), matcher.end(0));
        }
        return null;
    }

    private boolean inQuotationPositions(final int from, final int to, final BlockPos[] stringQuotations) {
        for (BlockPos blockPos: stringQuotations) {
            if (from >= blockPos.start && from < blockPos.end) return true;
            if (to > blockPos.start && to <= blockPos.end) return true;
        }
        return false;
    }

    private BlockPos[] findStringQuotationPositions(String data) throws ParserException {
        List<BlockPos> blocks = new ArrayList<>();
        BlockResolver blockResolver = new BlockResolver(data);
        int pos = 0;
        while (pos >= 0 && pos < data.length()) {
            int start = blockResolver.findQuotationStart(pos, BlockResolver.STRING_QUOTATION);
            if (start == -1) break;
            int end = blockResolver.findQuotationEnd(start, BlockResolver.STRING_QUOTATION);
            blocks.add(new BlockPos(start, end));
            pos = end;
        }
        return blocks.toArray(new BlockPos[0]);
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

    private int findFirstSpace(String data, int start) {
        if (start >= data.length()) return start;
        Matcher m = RegularExpressions.NON_EMPTY_SPACE.matcher(data);
        if (m.find(start)) {
            return m.start(0);
        } else {
            return start;
        }
    }

    enum CCExpressionType {

        IF          ("if"),
        ELSEIF      ("elseif"),
        ELSE        ("else"),
        END         ("end"),
        UNDEFINED   (null);

        private static final Map<String, CCExpressionType> map;
        static {
            map = new HashMap<>();
            for (CCExpressionType item: values()) map.put(item.getValue(), item);
        }

        public static CCExpressionType fromValue(String value) {
            CCExpressionType type = map.get(value.toLowerCase());
            return (type != null) ? type : UNDEFINED;
        }

        private final String value;

        CCExpressionType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

    }

    class CCExpression extends BlockPos {

        private final String value;
        private final CCExpressionType type;

        protected CCExpression(String value, int start, int end) {
            super(start, end);
            this.value = value;
            this.type = CCExpressionType.fromValue(value);
        }

        public String getValue() {
            return value;
        }

        public CCExpressionType getType() {
            return type;
        }

        @Override
        public String toString() {
            return "CCExpression{" +
                    "value='" + value + '\'' +
                    ", type=" + type +
                    ", start=" + getStart() +
                    ", end=" + getEnd() +
                    '}';
        }

    }

    class BlockPos {

        private final int start;
        private final int end;

        protected BlockPos(int start, int end) {
            this.start = start;
            this.end = end;
        }

        public int getStart() {
            return start;
        }

        public int getEnd() {
            return end;
        }

        @Override
        public String toString() {
            return "BlockPos{" +
                    "start=" + start +
                    ", end=" + end +
                    '}';
        }

    }

}
