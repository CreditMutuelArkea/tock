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

package ai.tock.aws

import ai.tock.aws.secretmanager.dao.SecretAWSDAO
import ai.tock.aws.secretmanager.dao.SecretDAO
import ai.tock.aws.secretmanager.provider.AWSSecretsManagerService
import ai.tock.aws.secretmanager.provider.AWSSecretsManagerServiceImpl
import ai.tock.aws.secretmanager.provider.IAdvizeCredentialsAWSProvider
import ai.tock.shared.security.credentials.CredentialsProvider
import com.github.salomonbrys.kodein.Kodein
import com.github.salomonbrys.kodein.bind
import com.github.salomonbrys.kodein.singleton


val awsToolsModule = Kodein.Module {
    bind<SecretDAO>() with singleton { SecretAWSDAO() }
    bind<CredentialsProvider>(overrides = true) with singleton { IAdvizeCredentialsAWSProvider() }
    bind<AWSSecretsManagerService>() with singleton { AWSSecretsManagerServiceImpl() }
}