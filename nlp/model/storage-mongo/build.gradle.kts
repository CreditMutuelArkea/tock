/*
 * This file was generated by the Gradle 'init' task.
 */

plugins {
    id("ai.tock.java-conventions")
}

dependencies {
    api(project(":tock-nlp-model-service"))
    api("org.litote.kmongo:kmongo:4.7.2")
    api("org.litote.kmongo:kmongo-async:4.7.2")
}

description = "Tock NLP Model Mongo"
