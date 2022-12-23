/*
 * This file was generated by the Gradle 'init' task.
 */

plugins {
    id("ai.tock.java-conventions")
}

dependencies {
    api(project(":tock-nlp-core-service"))
    api(project(":tock-nlp-entity-value"))
    api("com.squareup.retrofit2:retrofit:2.9.0")
    api("com.squareup.okhttp3:logging-interceptor:4.10.0")
    api("com.squareup.okhttp3:okhttp:4.10.0")
    api("com.squareup.retrofit2:converter-jackson:2.9.0")
}

description = "Tock NLP Entity Rest Client"
