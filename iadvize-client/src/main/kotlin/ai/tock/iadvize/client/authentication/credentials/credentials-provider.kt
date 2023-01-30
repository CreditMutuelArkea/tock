/*
 * Copyright (C) 2017/2022 e-voyageurs technologies
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

package ai.tock.iadvize.client.authentication.credentials

import ai.tock.iadvize.client.*


sealed interface CredentialsProvider {
    fun getCredentials(): Credentials

    companion object {
        /**
         * Get an instance of credentials provider .
         */
        fun instance(): CredentialsProvider {
            return if (booleanProperty(IADVIZE_ENV_CREDENTIALS_STORED, true)){
                EnvCredentialsProvider
            } else {
                ExternalCredentialsProvider
            }
        }
    }

}

object EnvCredentialsProvider : CredentialsProvider {
    override fun getCredentials(): Credentials {
        val username = property(IADVIZE_USERNAME_AUTHENTICATION)
        val password = property(IADVIZE_PASSWORD_AUTHENTICATION)
        return Credentials(username, password)
    }
}

object ExternalCredentialsProvider : CredentialsProvider {
    override fun getCredentials(): Credentials {
        TODO("Add implementation for external credentials provider")
    }
}