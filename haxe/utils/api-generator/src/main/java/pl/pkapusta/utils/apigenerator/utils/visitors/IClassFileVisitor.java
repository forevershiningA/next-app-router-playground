package pl.pkapusta.utils.apigenerator.utils.visitors;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;

public interface IClassFileVisitor {

    void visitClassFile(Path file, BasicFileAttributes attrs) throws IOException;

}
