/*
 * Copyright (C) 2017/2021 e-voyageurs technologies
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package ai.tock.shared

import io.mockk.mockk
import io.netty.channel.EventLoopGroup
import io.vertx.core.AsyncResult
import io.vertx.core.Context
import io.vertx.core.DeploymentOptions
import io.vertx.core.Future
import io.vertx.core.Handler
import io.vertx.core.Promise
import io.vertx.core.TimeoutStream
import io.vertx.core.Verticle
import io.vertx.core.Vertx
import io.vertx.core.WorkerExecutor
import io.vertx.core.datagram.DatagramSocket
import io.vertx.core.datagram.DatagramSocketOptions
import io.vertx.core.dns.DnsClient
import io.vertx.core.dns.DnsClientOptions
import io.vertx.core.eventbus.EventBus
import io.vertx.core.file.FileSystem
import io.vertx.core.http.HttpClient
import io.vertx.core.http.HttpClientOptions
import io.vertx.core.http.HttpServer
import io.vertx.core.http.HttpServerOptions
import io.vertx.core.net.NetClient
import io.vertx.core.net.NetClientOptions
import io.vertx.core.net.NetServer
import io.vertx.core.net.NetServerOptions
import io.vertx.core.shareddata.SharedData
import io.vertx.core.spi.VerticleFactory
import java.util.concurrent.TimeUnit
import java.util.function.Supplier

/**
 * A mock for [Vertx] interface used because mockk & Vertx do not play well together.
 */
class VertxMock : Vertx {

    override fun verticleFactories(): MutableSet<VerticleFactory> = mutableSetOf()

    override fun setPeriodic(delay: Long, handler: Handler<Long>?): Long = delay

    override fun getOrCreateContext(): Context = mockk()

    override fun deployVerticle(verticle: Verticle?, completionHandler: Handler<AsyncResult<String>>?) {
    }

    override fun deployVerticle(
        verticle: Verticle?,
        options: DeploymentOptions?,
        completionHandler: Handler<AsyncResult<String>>?
    ) {
    }

    override fun deployVerticle(
        verticleClass: Class<out Verticle>?,
        options: DeploymentOptions?,
        completionHandler: Handler<AsyncResult<String>>?
    ) {
    }

    override fun deployVerticle(
        verticleSupplier: Supplier<Verticle>?,
        options: DeploymentOptions?,
        completionHandler: Handler<AsyncResult<String>>?
    ) {
    }

    override fun deployVerticle(name: String?, completionHandler: Handler<AsyncResult<String>>?) {
    }

    override fun deployVerticle(
        name: String?,
        options: DeploymentOptions?,
        completionHandler: Handler<AsyncResult<String>>?
    ) {
    }

    override fun createHttpServer(options: HttpServerOptions?): HttpServer = mockk()

    override fun createHttpServer(): HttpServer = mockk()

    override fun createHttpClient(options: HttpClientOptions?): HttpClient = mockk()

    override fun createHttpClient(): HttpClient = mockk()

    override fun fileSystem(): FileSystem = mockk()

    override fun createDnsClient(port: Int, host: String?): DnsClient = mockk()

    override fun createDnsClient(): DnsClient = mockk()

    override fun createDnsClient(options: DnsClientOptions?): DnsClient = mockk()

    override fun nettyEventLoopGroup(): EventLoopGroup = mockk()

    override fun cancelTimer(id: Long): Boolean = true

    override fun sharedData(): SharedData = mockk()

    override fun close(completionHandler: Handler<AsyncResult<Void>>?) {
    }

    override fun timerStream(delay: Long): TimeoutStream = mockk()

    override fun createSharedWorkerExecutor(name: String?): WorkerExecutor = mockk()

    override fun createSharedWorkerExecutor(name: String?, poolSize: Int): WorkerExecutor = mockk()

    override fun createSharedWorkerExecutor(name: String?, poolSize: Int, maxExecuteTime: Long): WorkerExecutor =
        mockk()

    override fun createSharedWorkerExecutor(
        name: String?,
        poolSize: Int,
        maxExecuteTime: Long,
        maxExecuteTimeUnit: TimeUnit?
    ): WorkerExecutor = mockk()

    override fun isNativeTransportEnabled(): Boolean = false

    override fun setTimer(delay: Long, handler: Handler<Long>?): Long = delay

    override fun periodicStream(delay: Long): TimeoutStream = mockk()

    override fun deploymentIDs(): MutableSet<String> = mutableSetOf()

    override fun registerVerticleFactory(factory: VerticleFactory?) {
    }

    override fun createDatagramSocket(options: DatagramSocketOptions?): DatagramSocket = mockk()

    override fun createDatagramSocket(): DatagramSocket = mockk()

    override fun isClustered(): Boolean = false

    override fun eventBus(): EventBus = mockk()

    override fun undeploy(deploymentID: String?, completionHandler: Handler<AsyncResult<Void>>?) {
    }

    override fun <T : Any?> executeBlocking(
        blockingCodeHandler: Handler<Promise<T>>?,
        ordered: Boolean,
        resultHandler: Handler<AsyncResult<T>>?
    ) {
    }

    override fun <T : Any?> executeBlocking(
        blockingCodeHandler: Handler<Promise<T>>?,
        resultHandler: Handler<AsyncResult<T>>?
    ) {
    }

    override fun runOnContext(action: Handler<Void>?) {
    }

    override fun unregisterVerticleFactory(factory: VerticleFactory?) {
    }

    override fun exceptionHandler(handler: Handler<Throwable>?): Vertx = this

    override fun exceptionHandler(): Handler<Throwable> = mockk()

    override fun createNetServer(options: NetServerOptions?): NetServer = mockk()

    override fun createNetServer(): NetServer = mockk()

    override fun createNetClient(options: NetClientOptions?): NetClient = mockk()

    override fun createNetClient(): NetClient = mockk()

    override fun setPeriodic(initialDelay: Long, delay: Long, handler: Handler<Long>?): Long = 0

    override fun periodicStream(initialDelay: Long, delay: Long): TimeoutStream = mockk()

    override fun deployVerticle(verticle: Verticle?, options: DeploymentOptions?): Future<String> = mockk()

    override fun deployVerticle(verticleClass: Class<out Verticle>?, options: DeploymentOptions?): Future<String> =
        mockk()

    override fun deployVerticle(verticleSupplier: Supplier<Verticle>?, options: DeploymentOptions?): Future<String> =
        mockk()

    override fun deployVerticle(name: String?, options: DeploymentOptions?): Future<String> = mockk()

    override fun close(): Future<Void> = mockk()

    override fun undeploy(deploymentID: String?): Future<Void> = mockk()
}
