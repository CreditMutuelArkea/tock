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

package ai.tock.shared.security.auth.spi

enum class WebSecurityMode {
    // If "env.tock_web_cookie_auth" is set to true, the WebSecurityMode.COOKIES mode is applied, otherwise nothing (PASSTHROUGH mode).
    DEFAULT,
    // Get tock_user_id cookie
    COOKIES,
    // Pass the interceptor without any changes
    PASSTHROUGH,
    // Parse the JWT, to validate signature, check token revocation and manage authorization
    JWT;

    companion object {
        fun findByName(mode: String): WebSecurityMode? {
            return WebSecurityMode.entries.firstOrNull { it.name == mode }
        }
    }
}