/*
 * Copyright (C) 2017 VSCT
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package fr.vsct.tock.bot.engine

import fr.vsct.tock.bot.admin.bot.BotApplicationConfiguration
import fr.vsct.tock.bot.admin.bot.BotApplicationConfigurationDAO
import fr.vsct.tock.bot.connector.Connector
import fr.vsct.tock.bot.connector.ConnectorConfiguration
import fr.vsct.tock.bot.connector.ConnectorProvider
import fr.vsct.tock.bot.connector.ConnectorType
import fr.vsct.tock.bot.definition.BotDefinition
import fr.vsct.tock.bot.definition.BotProvider
import fr.vsct.tock.bot.definition.StoryHandlerListener
import fr.vsct.tock.bot.engine.config.BotConfigurationSynchronizer
import fr.vsct.tock.bot.engine.monitoring.RequestTimer
import fr.vsct.tock.bot.engine.nlp.BuiltInKeywordListener
import fr.vsct.tock.bot.engine.nlp.NlpListener
import fr.vsct.tock.nlp.api.client.NlpClient
import fr.vsct.tock.shared.DEFAULT_APP_NAMESPACE
import fr.vsct.tock.shared.Executor
import fr.vsct.tock.shared.defaultLocale
import fr.vsct.tock.shared.error
import fr.vsct.tock.shared.injector
import fr.vsct.tock.shared.longProperty
import fr.vsct.tock.shared.provide
import fr.vsct.tock.shared.tockAppDefaultNamespace
import fr.vsct.tock.shared.vertx.vertx
import io.vertx.ext.web.Router
import io.vertx.ext.web.RoutingContext
import mu.KotlinLogging
import java.time.Duration
import java.util.ServiceLoader
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArraySet

/**
 * Advanced bot configuration.
 *
 * [fr.vsct.tock.bot.registerAndInstallBot] method is the preferred way to start a bot in most use cases.
 */
object BotRepository {

    private val logger = KotlinLogging.logger {}

    private val botConfigurationDAO: BotApplicationConfigurationDAO get() = injector.provide()
    internal val botProviders: MutableSet<BotProvider> = mutableSetOf()
    internal val storyHandlerListeners: MutableList<StoryHandlerListener> = mutableListOf()
    internal val nlpListeners: MutableList<NlpListener> = mutableListOf(BuiltInKeywordListener)
    private val nlpClient: NlpClient get() = injector.provide()
    private val executor: Executor get() = injector.provide()

    internal val connectorProviders: MutableSet<ConnectorProvider> = CopyOnWriteArraySet(
        ServiceLoader.load(ConnectorProvider::class.java).map { it }
    )

    private val connectorControllerMap: MutableMap<BotApplicationConfiguration, ConnectorController> =
        ConcurrentHashMap()


    /**
     * Request timer for connectors.
     */
    @Volatile
    var requestTimer: RequestTimer = object : RequestTimer {}

    /**
     * healthcheck handler to answer to GET /healthcheck.
     */
    @Volatile
    var healthcheckHandler: (RoutingContext) -> Unit = {
        executor.executeBlocking {
            it.response().setStatusCode(if (nlpClient.healthcheck()) 200 else 500).end()
        }
    }

    private val verticle by lazy { BotVerticle() }

    /**
     * Registers a new [ConnectorProvider].
     */
    fun registerConnectorProvider(connectorProvider: ConnectorProvider) {
        connectorProviders.add(connectorProvider)
    }

    /**
     * Registers a new [BotProvider].
     */
    fun registerBotProvider(bot: BotProvider) {
        botProviders.add(bot)
    }

    /**
     * Registers a new [StoryHandlerListener].
     */
    fun registerStoryHandlerListener(listener: StoryHandlerListener) {
        storyHandlerListeners.add(listener)
    }

    /**
     * Registers an new [NlpListener].
     */
    fun registerNlpListener(listener: NlpListener) {
        nlpListeners.add(listener)
    }

    /**
     * Returns the current [ConnectorController] for a given bot and application id.
     */
    fun getController(predicate: (BotApplicationConfiguration) -> Boolean): ConnectorController? =
        connectorControllerMap
            .keys
            .firstOrNull(predicate)
            ?.let {
                connectorControllerMap[it]
            }

    /**
     * Installs the bot(s).
     *
     * @param routerHandlers the additional router handlers
     * @param adminRestConnectorInstaller the (optional) linked [fr.vsct.tock.bot.connector.rest.RestConnector] installer.
     */
    fun installBots(
        routerHandlers: List<(Router) -> Unit>,
        adminRestConnectorInstaller: (BotApplicationConfiguration) -> ConnectorConfiguration? = { null }
    ) {
        val connectorConfigurations = ConnectorConfigurationRepository.getConfigurations()

        //check connector id integrity
        connectorConfigurations
            .groupBy { it.connectorId }
            .values
            .firstOrNull { it.size != 1 }
            ?.apply {
                error("A least two configurations have the same connectorId: ${this}")
            }

        val bots = botProviders.map { it.botDefinition() }

        //install each bot
        bots.forEach {
            installBot(it, connectorConfigurations, adminRestConnectorInstaller)
        }

        //check that nlp applications exist
        bots.distinctBy { it.namespace to it.nlpModelName }
            .forEach { botDefinition ->
                try {
                    nlpClient.createApplication(
                        botDefinition.namespace,
                        botDefinition.nlpModelName,
                        defaultLocale
                    )?.apply {
                        logger.info { "nlp application initialized $namespace $name with locale $supportedLocales" }
                    }
                } catch (e: Exception) {
                    logger.error(e)
                }
            }

        //register services
        routerHandlers.forEachIndexed { index, handler ->
            verticle.registerServices("_handler_$index", handler)
        }

        //deploy verticle
        vertx.deployVerticle(verticle)

        executor.setPeriodic(
            Duration.ofMillis(longProperty("tock_bot_connector_refresh_initial_delay", 5000)),
            Duration.ofMillis(longProperty("tock_bot_connector_refresh", 5000))
        ) {
            checkBotConfigurations()
        }
    }

    private fun findConnectorProvider(connectorType: ConnectorType): ConnectorProvider {
        return connectorProviders.first { it.connectorType == connectorType }
    }

    private fun installBot(
        botDefinition: BotDefinition,
        connectorConfigurations: List<ConnectorConfiguration>,
        adminRestConnectorInstaller: (BotApplicationConfiguration) -> ConnectorConfiguration?
    ) {
        val bot = Bot(botDefinition)
        val existingBotConfigurations = botConfigurationDAO.getConfigurationsByBotId(botDefinition.botId)
        val allConnectorConfigurations =
            connectorConfigurations +
                    existingBotConfigurations
                        .filter {
                            it.connectorType != ConnectorType.rest
                                    && connectorConfigurations.none { c -> it.applicationId == c.connectorId }
                        }
                        .map {
                            ConnectorConfiguration(it)
                        }
        val existingBotConfigurationsMap =
            existingBotConfigurations
                .groupBy { it.applicationId }
                .map { (key, value) ->
                    if (value.size > 1) {
                        logger.warn { "more than one configuration in database: $value" }
                    }
                    key to value.first()
                }
                .toMap()

        allConnectorConfigurations.forEach { baseConf ->
            findConnectorProvider(baseConf.type)
                .apply {
                    try {
                        //1 refresh connector conf
                        val conf = refreshBotConfiguration(baseConf, existingBotConfigurationsMap)
                        //2 create and install connector
                        val connector = connector(conf)
                        //3 set default namespace to bot namespace if not already set
                        if (tockAppDefaultNamespace == DEFAULT_APP_NAMESPACE) {
                            tockAppDefaultNamespace = bot.botDefinition.namespace
                        }
                        //4 update bot conf
                        val appConf = saveConfiguration(connector, conf, bot)

                        //5 monitor bot
                        BotConfigurationSynchronizer.monitor(bot)

                        //6 generate and install rest connector
                        adminRestConnectorInstaller.invoke(appConf)
                            ?.also {
                                val restConf = refreshBotConfiguration(it, existingBotConfigurationsMap)
                                saveConfiguration(
                                    findConnectorProvider(restConf.type).connector(restConf),
                                    restConf,
                                    bot
                                )
                            }
                    } catch (e: Exception) {
                        logger.error(e) {
                            "unable to install connector $baseConf"
                        }
                    }
                }
        }
    }

    private fun checkBotConfigurations() {
        try {
            logger.trace { "check configurations" }
            //clone conf list as we may update connectorControllerMap
            val existingConfs = ArrayList(connectorControllerMap.keys)
            botConfigurationDAO.getConfigurations().forEach { c ->
                if (existingConfs.none { c.equalsWithoutId(it) }) {
                    val botDefinition = botProviders.find { it.botId() == c.botId }?.botDefinition()
                    if (botDefinition != null) {
                        logger.debug { "refresh configuration $c" }
                        val bot = Bot(botDefinition)
                        val oldConfiguration = connectorControllerMap.keys.find { it._id == c._id }
                        if (oldConfiguration != null) {
                            logger.debug { "uninstall $oldConfiguration" }
                            connectorControllerMap.remove(oldConfiguration)?.unregisterServices()
                        }
                        val conf = ConnectorConfiguration(c)
                        val connector = findConnectorProvider(conf.type).connector(conf)
                        TockConnectorController.register(connector, bot, verticle)
                            .apply {
                                connectorControllerMap.put(c, this)
                            }
                    } else {
                        logger.debug { "unknown bot ${c.botId} - installation skipped" }
                    }
                }
            }
        } catch (e: Exception) {
            logger.error(e)
        }
    }

    private fun refreshBotConfiguration(
        configuration: ConnectorConfiguration,
        existingBotConfigurations: Map<String, BotApplicationConfiguration>
    ): ConnectorConfiguration =
        existingBotConfigurations[configuration.connectorId]?.run {
            ConnectorConfiguration(configuration, this)
        } ?: configuration

    private fun saveConfiguration(
        connector: Connector,
        configuration: ConnectorConfiguration,
        bot: Bot
    ): BotApplicationConfiguration {

        return with(bot.botDefinition) {
            val conf = BotApplicationConfiguration(
                configuration.connectorId.run { if (isBlank()) botId else this },
                botId,
                namespace,
                nlpModelName,
                configuration.type,
                configuration.ownerConnectorType,
                configuration.getName().run { if (isBlank()) botId else this },
                configuration.getBaseUrl(),
                configuration.parametersWithoutDefaultKeys(),
                path = configuration.path
            )

            val controller = TockConnectorController.register(connector, bot, verticle)

            botConfigurationDAO.updateIfNotManuallyModified(conf)
                .apply {
                    connectorControllerMap.put(this, controller)
                }
        }
    }

}