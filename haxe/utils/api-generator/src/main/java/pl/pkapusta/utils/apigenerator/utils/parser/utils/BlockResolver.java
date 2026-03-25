package pl.pkapusta.utils.apigenerator.utils.parser.utils;

import pl.pkapusta.utils.apigenerator.utils.parser.ParserException;

import java.util.Arrays;

/**
 * @author Przemysław Kapusta
 */
public class BlockResolver {

    public static final QuotationMark STRING_QUOTATION = new QuotationMark('"', '\\');
    public static final BracketChars CODE_BLOCK = new BracketChars('{', '}', STRING_QUOTATION);
    public static final BracketChars ANNOTATION_BLOCK = new BracketChars('(', ')', STRING_QUOTATION);
    public static final BracketChars CONDITION_BLOCK = new BracketChars('(', ')', STRING_QUOTATION);
    public static final BracketChars PROPERTY_OR_FUNCTION_ARGS_BLOCK = new BracketChars('(', ')', STRING_QUOTATION);
    public static final BracketChars GENERIC_TYPE_BLOCK = new BracketChars('<', '>');

    private final CharSequence source;

    public BlockResolver(CharSequence source) {
        this.source = source;
    }

    public int findBlockStart(final int start, final BracketChars bracket) {
        final char bStart = bracket.getStart();
        for (int pos = start; pos < source.length(); ++pos) {
            if (source.charAt(pos) == bStart) return pos;
        }
        return -1;
    }

    public int findBlockEnd(final int start, final BracketChars bracket) throws ParserException {
        final char bStart = bracket.getStart();
        final char bEnd = bracket.getEnd();
        final QuotationMark[] quotations = bracket.getQuotations();
        if (source.charAt(start) != bStart)
            throw new ParserException(
                    "This is not bracket start, expected: " + bStart
                            + ", but was: " + source.charAt(start));
        int depth = 1;
        int pos = start + 1;
        if (pos >= source.length()) throw new ParserException("Unexpected end of CharSequence");
        for (; pos < source.length(); ++pos) {
            char curr = source.charAt(pos);
            QuotationMark quotation = getQuotationForChar(curr, quotations);
            if (quotation != null) {
                //when is quotation go to end
                int quotationEnd = findQuotationEnd(pos, quotation);
                pos = quotationEnd - 1;
            } else if (curr == bStart) {
                ++depth;
            } else if (curr == bEnd) {
                --depth;
                //if depth is 0 then end bracket was found
                if (depth == 0) return pos + 1;
            }
        }
        throw new ParserException("Unexpected end of CharSequence");
    }

    public int findQuotationStart(final int start, final QuotationMark quotation) {
        final char bMark = quotation.getMark();
        for (int pos = start; pos < source.length(); ++pos) {
            if (source.charAt(pos) == bMark) return pos;
        }
        return -1;
    }

    /**
     * Find end of quotataion in CharSequence
     * @param start first letter - start point includes start quotation char
     * @param quotation quotation to find
     * @return first character position after last quotation char
     */
    public int findQuotationEnd(final int start, final QuotationMark quotation) throws ParserException {
        final char mark = quotation.getMark();
        final char escape = quotation.getEscape();
        if (source.charAt(start) != mark)
            throw new ParserException(
                      "This is not quotation char, expected: " + mark
                    + ", but was: " + source.charAt(start));
        int pos = start + 1;
        if (pos >= source.length()) throw new ParserException("Unexpected end of CharSequence");
        if (source.charAt(pos) == mark) return pos + 1;
        for (pos = ++pos; pos < source.length(); ++pos) {
            if (source.charAt(pos) == mark) {
                //check if its escape
                if (source.charAt(pos - 1) == escape
                    && reverseCharCount(pos - 1) % 2 == 1) {
                    continue;
                } else {
                    return pos + 1;
                }
            }
        }
        throw new ParserException("Unexpected end of CharSequence");
    }

    private int reverseCharCount(final int start) {
        char startChar = source.charAt(start);
        int pos = start - 1;
        for (; pos >= 0; pos--) {
            if (source.charAt(start) != startChar) {
                return start - pos;
            }
        }
        return start + 1;
    }

    private QuotationMark getQuotationForChar(char ch, QuotationMark[] quotations) {
        if (quotations.length == 0) return null;
        for (QuotationMark quotation: quotations) {
            if (ch == quotation.getMark()) return quotation;
        }
        return null;
    }

    public static class BracketChars {

        private final char start;
        private final char end;
        private final QuotationMark[] quotations;

        public BracketChars(char start, char end, QuotationMark ...quotations) {
            this.start = start;
            this.end = end;
            this.quotations = quotations;
        }

        public char getStart() {
            return start;
        }

        public char getEnd() {
            return end;
        }

        public QuotationMark[] getQuotations() {
            return quotations;
        }

        @Override
        public String toString() {
            return "BracketChars{" +
                    "start=" + start +
                    ", end=" + end +
                    ", quotations=" + Arrays.toString(quotations) +
                    '}';
        }

    }

    public static class QuotationMark {

        private final char mark;
        private final char escape;

        public QuotationMark(char mark, char escape) {
            this.mark = mark;
            this.escape = escape;
        }

        public char getMark() {
            return mark;
        }

        public char getEscape() {
            return escape;
        }

        @Override
        public String toString() {
            return "QuotationMark{" +
                    "mark=" + mark +
                    ", escape=" + escape +
                    '}';
        }

    }

}
