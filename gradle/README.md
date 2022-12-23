## Gradle

Gradle is using a wrapper to be launched without installation.
To use a command in terminal :
`./gradlew `

### Migration from maven to gradle
To make a proper migration, the idea is to compare the generate jars and the differents dependencies classpath from gradle (compileClasspath,runtimeClasspath,testCompileClasspath,testRuntimeClasspath) to maven dependencies per modules.