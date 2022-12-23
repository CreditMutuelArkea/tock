/*
 * This file was generated by the Gradle 'init' task.
 */

plugins {
    id("ai.tock.java-conventions")
}

dependencies {
    api(project(":tock-nlp-front-service"))
    api("org.litote.kmongo:kmongo:4.7.2")
    api("org.litote.kmongo:kmongo-async:4.7.2")
    api(project(":tock-translator-core"))
    testImplementation("io.mockk:mockk-jvm:1.13.2")
    testImplementation("org.litote.kmongo:kmongo-flapdoodle:4.7.2")
}

description = "Tock NLP Front Mongo"
