/*
 * This file was generated by the Gradle 'init' task.
 */

plugins {
    id("ai.tock.java-conventions")
}

dependencies {
    api(project(":tock-nlp-core-shared"))
    api(project(":tock-nlp-model-client"))
    api(project(":tock-nlp-entity-value"))
    api("com.github.mpkorstanje:simmetrics-core:4.1.1")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5:1.7.20")
    testImplementation("org.junit.jupiter:junit-jupiter-engine:5.9.1")
    testImplementation("org.junit.jupiter:junit-jupiter-params:5.9.1")
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.9.1")
}

description = "Tock NLP Core Service"
