package pl.pkapusta.utils.apigenerator.tests;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.utils.structure.StructureException;
import pl.pkapusta.utils.apigenerator.utils.structure.type.ArrowType;
import pl.pkapusta.utils.apigenerator.utils.structure.type.BasicType;
import pl.pkapusta.utils.apigenerator.utils.structure.type.GenericType;
import pl.pkapusta.utils.apigenerator.utils.structure.type.Type;

/**
 * @author Przemysław Kapusta
 */
public class TypeResolverTest {

    private static final Logger logger = LoggerFactory.getLogger(TypeResolverTest.class);

    @Test
    public void typeResolverTest() throws StructureException {

        Type type = Type.fromString("Foo");
        assertTrue(type instanceof BasicType);
        assertEquals("Foo", ((BasicType)type).getName());
        assertEquals("Foo", type.toSourceCode());

        type = Type.fromString("  Foo ");
        assertTrue(type instanceof BasicType);
        assertEquals("Foo", ((BasicType)type).getName());
        assertEquals("Foo", type.toSourceCode());

        type = Type.fromString("  Foo.Bar ");
        assertTrue(type instanceof BasicType);
        assertEquals("Foo.Bar", ((BasicType)type).getName());
        assertEquals("Foo.Bar", type.toSourceCode());

        type = Type.fromString("Foo<Bar>");
        assertTrue(type instanceof GenericType);
        assertEquals("Foo", ((GenericType)type).getName());
        assertEquals("Bar", ((GenericType)type).getSubType().toSourceCode());
        assertEquals("Foo<Bar>", type.toSourceCode());

        type = Type.fromString(" Foo < Bar > ");
        assertTrue(type instanceof GenericType);
        assertEquals("Foo", ((GenericType)type).getName());
        assertEquals("Bar", ((GenericType)type).getSubType().toSourceCode());
        assertEquals("Foo<Bar>", type.toSourceCode());

        type = Type.fromString("Foo<Bar<Sub>>");
        assertTrue(type instanceof GenericType);
        assertEquals("Foo", ((GenericType)type).getName());
        assertEquals("Bar<Sub>", ((GenericType)type).getSubType().toSourceCode());
        assertEquals("Foo<Bar<Sub>>", type.toSourceCode());

        type = Type.fromString("Foo->Bar");
        assertTrue(type instanceof ArrowType);
        assertEquals("Foo", ((ArrowType)type).getLeftType().toSourceCode());
        assertEquals("Bar", ((ArrowType)type).getRightType().toSourceCode());
        assertEquals("Foo -> Bar", type.toSourceCode());

        type = Type.fromString(" Foo -> Bar ");
        assertTrue(type instanceof ArrowType);
        assertEquals("Foo", ((ArrowType)type).getLeftType().toSourceCode());
        assertEquals("Bar", ((ArrowType)type).getRightType().toSourceCode());
        assertEquals("Foo -> Bar", type.toSourceCode());

        type = Type.fromString("Foo<Bar>->Left");
        assertTrue(type instanceof ArrowType);
        assertEquals("Foo<Bar>", ((ArrowType)type).getLeftType().toSourceCode());
        assertEquals("Left", ((ArrowType)type).getRightType().toSourceCode());
        assertEquals("Foo<Bar> -> Left", type.toSourceCode());

    }

}
