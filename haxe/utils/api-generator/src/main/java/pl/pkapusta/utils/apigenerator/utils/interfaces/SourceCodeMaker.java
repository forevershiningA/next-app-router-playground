package pl.pkapusta.utils.apigenerator.utils.interfaces;

/**
 * @author Przemysław Kapusta
 */
public interface SourceCodeMaker {

    /**
     * Build source code from this object
     * @return source code
     */
    String toSourceCode();

    String toSourceCode(final Options options);

    public static class Options {

        public static final Options DEFAULT = new Options();

        private boolean classAnnotations = true;
        private boolean classPrivateMembers = true;
        private boolean membersModifiers = true;
        private boolean methodsBody = true;
        private boolean argumentsAssigment = true;
        private boolean argumentsModifiers = true;
        private boolean fieldsAssigment = true;
        private boolean fieldsModifiers = true;
        private boolean repairOverride = false;
        private String newLineChars = "\r\n";

        public boolean getClassAnnotations() {
            return classAnnotations;
        }

        public Options setClassAnnotations(boolean value) {
            classAnnotations = value;
            return this;
        }

        public boolean getClassPrivateMembers() {
            return classPrivateMembers;
        }

        public Options setClassPrivateMembers(boolean value) {
            classPrivateMembers = value;
            return this;
        }

        public boolean getMembersModifiers() {
            return membersModifiers;
        }

        public Options setMembersModifiers(boolean value) {
            membersModifiers = value;
            return this;
        }

        public boolean getMethodsBody() {
            return methodsBody;
        }

        public Options setMethodsBody(boolean value) {
            methodsBody = value;
            return this;
        }

        public boolean getArgumentsAssigment() {
            return argumentsAssigment;
        }

        public Options setArgumentsAssigment(boolean value) {
            argumentsAssigment = value;
            return this;
        }

        public boolean getArgumentsModifiers() {
            return argumentsModifiers;
        }

        public Options setArgumentsModifiers(boolean value) {
            argumentsModifiers = value;
            return this;
        }

        public boolean getFieldsAssigment() {
            return fieldsAssigment;
        }

        public Options setFieldsAssigment(boolean value) {
            fieldsAssigment = value;
            return this;
        }

        public boolean getFieldsModifiers() {
            return fieldsModifiers;
        }

        public Options setFieldsModifiers(boolean value) {
            fieldsModifiers = value;
            return this;
        }

        public boolean getRepairOverride() {
            return repairOverride;
        }

        public Options setRepairOverride(boolean value) {
            repairOverride = value;
            return this;
        }

        public String getNewLineChars() {
            return newLineChars;
        }

        public Options setNewLineChars(String value) {
            newLineChars = value;
            return this;
        }

    }

}
