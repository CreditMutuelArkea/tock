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

package ai.tock.aws.secretmanager.dao

/**
 * Retrieve secret from a secured source
 */
interface SecretDAO {
    fun getSecret(secretId: String): String

    /**
     * Create an AWS Secret if it doesn't exist. Else, update it
     * @param secretName the secret name
     * @param secretObject the secret object to store
     * @return the ARN of a created or updated AWS Secret.
     */
    fun createOrUpdateSecret(secretName: String, secretObject: Any): String
}
