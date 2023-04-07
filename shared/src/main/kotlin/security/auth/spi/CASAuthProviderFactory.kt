/*
 * Copyright (C) 2017/2020 e-voyageurs technologies
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

package ai.tock.shared.security.auth.spi

import ai.tock.shared.exception.ToRestException
import ai.tock.shared.security.auth.CASAuthProvider
import io.vertx.core.Vertx

/**
 * Construct CAS Authentication provider
 *
 * NOTE: Intended to be implemented in another JAR as SPI (Service Provider Interface)
 */
interface CASAuthProviderFactory {

    /**
     * Creates CAS Authentication provider
     */
    fun <E: ToRestException>getCasAuthProvider(vertx: Vertx): CASAuthProvider<E>
}
