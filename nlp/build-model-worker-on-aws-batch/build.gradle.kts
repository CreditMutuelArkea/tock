/*
 * This file was generated by the Gradle 'init' task.
 */

plugins {
    id("ai.tock.java-conventions")
}

dependencies {
    api(project(":tock-shared"))
    api(project(":tock-nlp-build-model-worker-on-demand"))
    api("com.amazonaws:aws-java-sdk-sts:1.12.331")
    api("com.amazonaws:aws-java-sdk-batch:1.12.331")
}

description = "Tock NLP Build Model Worker on AWS BATCH"
