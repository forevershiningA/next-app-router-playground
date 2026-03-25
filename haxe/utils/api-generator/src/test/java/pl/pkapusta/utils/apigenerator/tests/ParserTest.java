package pl.pkapusta.utils.apigenerator.tests;

import static org.junit.jupiter.api.Assertions.*;

import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.utils.parser.SourceParser;
import pl.pkapusta.utils.apigenerator.utils.parser.ParserException;
import pl.pkapusta.utils.apigenerator.utils.parser.condition.ExpressionConditionResolver;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.AnnotationDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.ClassDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.SourceDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.FieldDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.MemberDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.MethodDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.members.PropertyDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.definitions.misc.ArgumentDefinition;
import pl.pkapusta.utils.apigenerator.utils.parser.optimizators.CommentRemover;
import pl.pkapusta.utils.apigenerator.utils.parser.optimizators.ConditionalCompilationResolver;
import pl.pkapusta.utils.apigenerator.utils.parser.optimizators.StringsRemover;
import pl.pkapusta.utils.apigenerator.utils.parser.utils.BlockResolver;
import pl.pkapusta.utils.apigenerator.utils.structure.StructureException;
import pl.pkapusta.utils.apigenerator.utils.structure.type.Type;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * @author Przemysław Kapusta
 */
public class ParserTest {

    private static final Logger logger = LoggerFactory.getLogger(ParserTest.class);

    @Test
    public void expressionConditionResolverTest() throws ParserException {

        ExpressionConditionResolver r = new ExpressionConditionResolver();
        r.setParamValue("cValue", "true");
        r.setParamValue("numer", "10");
        r.setParamValue("str", "\"some str\"");

        assertFalse(r.resolve("!cValue"));
        assertFalse(r.resolve("cValue == false"));
        assertTrue(r.resolve("cValue"));
        assertTrue(r.resolve("cValue == true"));

        assertTrue(r.resolve("cValue && numer > 5"));
        assertTrue(r.resolve("cValue && numer <= 10"));
        assertFalse(r.resolve("cValue && numer < 10"));
        assertTrue(r.resolve("cValue||numer<10"));

        assertTrue(r.resolve("str == \"some str\""));
        assertFalse(r.resolve("str == \"some other str\""));

    }

    @Test
    public void optimizatorsTest() throws ParserException {

        assertEquals("data1 ",
                new CommentRemover().optimize("data1 //comment foo bar"));
        assertEquals("data1 \n\rdata2 ",
                new CommentRemover().optimize("data1 //comment foo bar\n\rdata2 //comment2"));
        assertEquals("data1 \ndata2 ",
                new CommentRemover().optimize("data1 //comment foo bar\ndata2 //comment2"));
        assertEquals("data1 \rdata2 ",
                new CommentRemover().optimize("data1 //comment foo bar\rdata2 //comment2"));
        assertEquals("data1data2",
                new CommentRemover().optimize("data1/*comment*/data2"));
        assertEquals("data1 data2",
                new CommentRemover().optimize("data1/*comment*/ data2"));
        assertEquals("data1data2",
                new CommentRemover().optimize("data1/**comment*/data2"));
        assertEquals("data1\n\r\n\rdata2",
                new CommentRemover().optimize("data1\n\r/**\n\r * comment with\n\r * more lines\n\r */\n\rdata2"));
        assertEquals("data1\n\r\n\rdata2",
                new CommentRemover().optimize("data1\n\r/*\n\r * comment with\n\r * more lines\n\r */\n\rdata2"));

        assertEquals("data1 = null",
                new StringsRemover().optimize("data1 = \"string\""));
        assertEquals("data1 = null",
                new StringsRemover().optimize("data1 = \"string with \\\"string\\\"\""));


        String cond1 = "precond #if !cValue then \"its #else in condition\" #else else \"#end in str\" #end postcond";
        ExpressionConditionResolver conditionResolver = new ExpressionConditionResolver()
                .setParamValue("cValue", "false");
        assertEquals("precond  then \"its #else in condition\"  postcond",
                new ConditionalCompilationResolver().setConditionResolver(conditionResolver).optimize(cond1));
        conditionResolver.setParamValue("cValue", "true");
        assertEquals("precond  else \"#end in str\"  postcond",
                new ConditionalCompilationResolver().setConditionResolver(conditionResolver).optimize(cond1));

        conditionResolver.setParamValue("cValue", "true");
        String cond2 = "precond #if !cValue then p2 #if val==5 val is 5 #elseif val==6 val is 6 #else val is different #end p2e #else else \"#end in str\" #end postcond";
        assertEquals("precond  else \"#end in str\"  postcond",
                new ConditionalCompilationResolver().setConditionResolver(conditionResolver).optimize(cond2));
        conditionResolver.setParamValue("cValue", "false")
                         .setParamValue("val", "5");
        assertEquals("precond  then p2  val is 5  p2e  postcond",
                new ConditionalCompilationResolver().setConditionResolver(conditionResolver).optimize(cond2));
        conditionResolver.setParamValue("val", "6");
        assertEquals("precond  then p2  val is 6  p2e  postcond",
                new ConditionalCompilationResolver().setConditionResolver(conditionResolver).optimize(cond2));
        conditionResolver.setParamValue("val", "7");
        assertEquals("precond  then p2  val is different  p2e  postcond",
                new ConditionalCompilationResolver().setConditionResolver(conditionResolver).optimize(cond2));
        String cond3 = "precond #if !cValue then p2 #if val==5 val is 5 #elseif val==6 val is 6 #end p2e #else else \"#end in str\" #end postcond";
        assertEquals("precond  then p2  p2e  postcond",
                new ConditionalCompilationResolver().setConditionResolver(conditionResolver).optimize(cond3));


    }

    @Test
    public void blockResolverTest() throws ParserException {

        assertEquals(2, new BlockResolver("\"\"").findQuotationEnd(0, BlockResolver.STRING_QUOTATION));
        assertEquals(5, new BlockResolver("\"abc\"").findQuotationEnd(0, BlockResolver.STRING_QUOTATION));
        assertEquals(7, new BlockResolver("\"abc\\\\\"").findQuotationEnd(0, BlockResolver.STRING_QUOTATION));
        assertEquals(10, new BlockResolver("\"abc\\\"efd\"").findQuotationEnd(0, BlockResolver.STRING_QUOTATION));
        assertEquals(14, new BlockResolver("eee \"abc\\\"efd\" ddd").findQuotationEnd(4, BlockResolver.STRING_QUOTATION));

        assertEquals(2, new BlockResolver("{}").findBlockEnd(0, BlockResolver.CODE_BLOCK));
        assertEquals(5, new BlockResolver("{abc}").findBlockEnd(0, BlockResolver.CODE_BLOCK));
        assertEquals(10, new BlockResolver("{abc{def}}").findBlockEnd(0, BlockResolver.CODE_BLOCK));
        assertEquals(10, new BlockResolver("{abc{def}} foo").findBlockEnd(0, BlockResolver.CODE_BLOCK));
        assertEquals(14, new BlockResolver("foo {abc{def}} foo").findBlockEnd(4, BlockResolver.CODE_BLOCK));
        assertEquals(20, new BlockResolver("foo {abc{\"str{ing\"}} foo").findBlockEnd(4, BlockResolver.CODE_BLOCK));

        assertEquals(2, new BlockResolver("a { foo }").findBlockStart(0, BlockResolver.CODE_BLOCK));
        assertEquals(0, new BlockResolver("{ foo }").findBlockStart(0, BlockResolver.CODE_BLOCK));
        assertEquals(-1, new BlockResolver("a foo").findBlockStart(0, BlockResolver.CODE_BLOCK));

    }

    @Test
    public void mainParsingTest() throws IOException, ParserException, StructureException {

        String classStr = IOUtils.toString(getClass().getResourceAsStream("/Main.hx"), StandardCharsets.UTF_8.name());

        SourceDefinition sourceDefinition = new SourceParser(classStr, "/Main.hx").parse();

        assertEquals("some.pkg", sourceDefinition.getPackage());

        assertArrayEquals(new String[] {
            "foo.bar.Xxx",
            "foo.bar.Yyy",
            "foo.bar.somes.*",
            "foo.impl.Impl1",
            "foo.impl.Impl2",
            "openfl.display.Sprite",
            "openfl.events.Event",
            "after.main.class",
            "end.source"
        }, sourceDefinition.getImports());

        //check primary class
        ClassDefinition primaryClass = sourceDefinition.getPrimaryClass();
        assertEquals("Main", primaryClass.getName().toSourceCode());
        assertEquals(ClassDefinition.ClassType.CLASS, primaryClass.getType());
        assertEquals("Sprite", primaryClass.getExtends().toSourceCode());
        assertArrayEquals(new Type[] {Type.fromString("Impl1")}, primaryClass.getImplements());
        assertArrayEquals(new String[] {}, primaryClass.getModifiers());

        //check annotations of primary class
        AnnotationDefinition[] annotations = primaryClass.getAnnotations();
        assertEquals(3, annotations.length);
        AnnotationDefinition annotation = annotations[0];
        assertEquals("meta", annotation.getName());
        assertEquals("Event(name=\"event.first\",type=\"foo.bar.Zzz\")", annotation.getParams());
        annotation = annotations[1];
        assertEquals("meta", annotation.getName());
        assertEquals("Event(name=\"event.second\",type=\"foo.bar.Zzz\")", annotation.getParams());
        annotation = annotations[2];
        assertEquals("expose", annotation.getName());
        assertEquals("\"foo.Main\"", annotation.getParams());

        //check members of primary class
        List<MemberDefinition> members = primaryClass.getMembers();
        assertEquals(10, members.size());

        PropertyDefinition property = (PropertyDefinition)members.get(0);
        assertEquals("someReadProperty", property.getName());
        assertArrayEquals(new String[] {"public"}, property.getModifiers());
        assertEquals("String", property.getType().toSourceCode());
        assertEquals("get", property.getReadAccessIdentifier());
        assertEquals("never", property.getWriteAccessIdentifier());

        FieldDefinition field = (FieldDefinition)members.get(1);
        assertEquals("xxx", field.getName());
        assertArrayEquals(new String[] {"private"}, field.getModifiers());
        assertEquals("Xxx", field.getType().toSourceCode());
        assertEquals(null, field.getAssignment());

        field = (FieldDefinition)members.get(2);
        assertEquals("yyy", field.getName());
        assertArrayEquals(new String[] {}, field.getModifiers());
        assertEquals("Yyy", field.getType().toSourceCode());
        assertEquals(null, field.getAssignment());

        field = (FieldDefinition)members.get(3);
        assertEquals("str", field.getName());
        assertArrayEquals(new String[] {}, field.getModifiers());
        assertEquals("String", field.getType().toSourceCode());
        assertEquals("\"textStr\"", field.getAssignment());

        field = (FieldDefinition)members.get(4);
        assertEquals("str2", field.getName());
        assertArrayEquals(new String[] {}, field.getModifiers());
        assertEquals("String", field.getType().toSourceCode());
        assertEquals("\"textStr\"", field.getAssignment());

        field = (FieldDefinition)members.get(5);
        assertEquals("_vector", field.getName());
        assertArrayEquals(new String[] {"private"}, field.getModifiers());
        assertEquals("Vector<String>", field.getType().toSourceCode());
        assertEquals(null, field.getAssignment());

        MethodDefinition method = (MethodDefinition)members.get(6);
        assertEquals("new", method.getName());
        assertArrayEquals(new String[] {"public"}, method.getModifiers());
        assertEquals(null, method.getType());
        ArgumentDefinition[] arguments = method.getArguments();
        assertEquals(0, arguments.length);

        method = (MethodDefinition)members.get(7);
        assertEquals("func1", method.getName());
        assertArrayEquals(new String[] {"public"}, method.getModifiers());
        assertEquals("Void", method.getType().toSourceCode());
        arguments = method.getArguments();
        assertEquals(1, arguments.length);
        ArgumentDefinition argument = arguments[0];
        assertEquals("e", argument.getName());
        assertArrayEquals(new String[] {}, argument.getModifiers());
        assertEquals("Event", argument.getType().toSourceCode());
        assertEquals(null, argument.getAssignment());

        method = (MethodDefinition)members.get(8);
        assertEquals("func2", method.getName());
        assertArrayEquals(new String[] {"public", "static"}, method.getModifiers());
        assertEquals("Bool", method.getType().toSourceCode());
        arguments = method.getArguments();
        assertEquals(0, arguments.length);

        method = (MethodDefinition)members.get(9);
        assertEquals("priv_func1", method.getName());
        assertArrayEquals(new String[] {"private"}, method.getModifiers());
        assertEquals("Void", method.getType().toSourceCode());
        arguments = method.getArguments();
        assertEquals(2, arguments.length);
        argument = arguments[0];
        assertEquals("arg1", argument.getName());
        assertArrayEquals(new String[] {}, argument.getModifiers());
        assertEquals("Event -> Void", argument.getType().toSourceCode());
        assertEquals(null, argument.getAssignment());
        argument = arguments[1];
        assertEquals("arg2", argument.getName());
        assertArrayEquals(new String[] {}, argument.getModifiers());
        assertEquals("Yyy", argument.getType().toSourceCode());
        assertEquals("null", argument.getAssignment());



        ClassDefinition[] classes = sourceDefinition.getClasses();

        //check SubMain class
        ClassDefinition classDef = classes[1];
        assertEquals("SubMain<T>", classDef.getName().toSourceCode());
        assertEquals(ClassDefinition.ClassType.CLASS, classDef.getType());
        assertEquals(null, classDef.getExtends());
        assertArrayEquals(new Type[] {Type.fromString("Impl1<T>"), Type.fromString("Impl2")}, classDef.getImplements());
        assertArrayEquals(new String[] {}, classDef.getModifiers());

        //check annotations of SubMain class
        annotations = classDef.getAnnotations();
        assertEquals(1, annotations.length);
        annotation = annotations[0];
        assertEquals("test", annotation.getName());
        assertEquals(null, annotation.getParams());

        //check members of SubMain class
        assertEquals(0, classDef.getMembers().size());


        //check Tree class
        classDef = classes[2];
        assertEquals("Tree", classDef.getName().toSourceCode());
        assertEquals(ClassDefinition.ClassType.CLASS, classDef.getType());
        assertEquals(null, classDef.getExtends());
        assertArrayEquals(new String[] {}, classDef.getImplements());
        assertArrayEquals(new String[] {"final", "abstract"}, classDef.getModifiers());

        //check annotations of Tree class
        assertEquals(0, classDef.getAnnotations().length);

        //check members of Tree class
        assertEquals(0, classDef.getMembers().size());


        //check with.dots.Com class
        classDef = classes[3];
        assertEquals("with.dots.Com", classDef.getName().toSourceCode());
        assertEquals(ClassDefinition.ClassType.CLASS, classDef.getType());
        assertEquals("with.dots.Base<T>", classDef.getExtends().toSourceCode());
        assertArrayEquals(new Type[] {}, classDef.getImplements());
        assertArrayEquals(new String[] {"final", "abstract"}, classDef.getModifiers());

        //check annotations of with.dots.Com class
        annotations = classDef.getAnnotations();
        assertEquals(1, annotations.length);
        annotation = annotations[0];
        assertEquals("test2", annotation.getName());
        assertEquals(null, annotation.getParams());

        //check members of with.dots.Com class
        assertEquals(0, classDef.getMembers().size());


        //check Impl1 interface
        classDef = classes[4];
        assertEquals("Impl1", classDef.getName().toSourceCode());
        assertEquals(ClassDefinition.ClassType.INTERFACE, classDef.getType());
        assertEquals(null, classDef.getExtends());
        assertArrayEquals(new String[] {}, classDef.getImplements());
        assertArrayEquals(new String[] {}, classDef.getModifiers());

        //check annotations of Impl1 interface
        assertEquals(0, classDef.getAnnotations().length);

        //check members of Impl1 interface
        members = classDef.getMembers();
        assertEquals(1, members.size());

        method = (MethodDefinition)members.get(0);
        assertEquals("func1", method.getName());
        assertArrayEquals(new String[] {}, method.getModifiers());
        assertEquals("Void", method.getType().toSourceCode());
        arguments = method.getArguments();
        assertEquals(1, arguments.length);
        argument = arguments[0];
        assertEquals("e", argument.getName());
        assertArrayEquals(new String[] {}, argument.getModifiers());
        assertEquals("Event", argument.getType().toSourceCode());
        assertEquals(null, argument.getAssignment());



        //check Impl1 interface
        classDef = classes[5];
        assertEquals("Impl2", classDef.getName().toSourceCode());
        assertEquals(ClassDefinition.ClassType.INTERFACE, classDef.getType());
        assertEquals(null, classDef.getExtends());
        assertArrayEquals(new Type[] {Type.fromString("BaseImplA"), Type.fromString("BaseImplB")}, classDef.getImplements());
        assertArrayEquals(new String[] {}, classDef.getModifiers());

        //check annotations of Impl1 interface
        assertEquals(0, classDef.getAnnotations().length);

        //check members of Impl1 interface
        members = classDef.getMembers();
        assertEquals(1, members.size());

        method = (MethodDefinition)members.get(0);
        assertEquals("func1", method.getName());
        assertArrayEquals(new String[] {"public"}, method.getModifiers());
        assertEquals("Void", method.getType().toSourceCode());
        arguments = method.getArguments();
        assertEquals(1, arguments.length);
        argument = arguments[0];
        assertEquals("e", argument.getName());
        assertArrayEquals(new String[] {}, argument.getModifiers());
        assertEquals("Event", argument.getType().toSourceCode());
        assertEquals(null, argument.getAssignment());

    }

}
