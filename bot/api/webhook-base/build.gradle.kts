/*
 * This file was generated by the Gradle 'init' task.
 */

plugins {
    id("ai.tock.java-conventions")
}

dependencies {
    api(project(":tock-bot-api-client"))
    api("io.vertx:vertx-web:4.3.4")
}

description = "Tock Bot API Webhook Base"
