package pl.pkapusta.utils.apigenerator.utils.visitors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.pkapusta.utils.apigenerator.config.Input;
import pl.pkapusta.utils.apigenerator.utils.ClassMatcher;

import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.FileVisitor;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;

public class FilteredInputClassesVisitor implements FileVisitor<Path> {

    private static final Logger logger = LoggerFactory.getLogger(FilteredInputClassesVisitor.class);

    private Path startPoint;
    private Input input;
    private IClassFileVisitor classFileVisitor;

    public FilteredInputClassesVisitor(Path startPoint, Input input, IClassFileVisitor classFileVisitor) {
        this.startPoint = startPoint;
        this.input = input;
        this.classFileVisitor = classFileVisitor;
    }

    public final void execute() throws IOException {
        Files.walkFileTree(startPoint, this);
    }

    @Override
    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
        return FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
        if (canProcessFile(file)) {
            classFileVisitor.visitClassFile(file, attrs);
        }
        return FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult visitFileFailed(Path file, IOException exc) throws IOException {
        throw exc;
    }

    @Override
    public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
        return FileVisitResult.CONTINUE;
    }

    protected boolean canProcessFile(Path file) {
        if (!file.getFileName().toString().toLowerCase().endsWith(".hx")) return false;
        if (!ClassMatcher.fileMatch(startPoint.relativize(file).toString(), input.getClasses())) return false;
        return true;
    }

}
