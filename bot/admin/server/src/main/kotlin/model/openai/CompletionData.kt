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

package ai.tock.bot.admin.model.openai

import org.apache.commons.lang3.LocaleUtils
import java.lang.StringBuilder
import java.util.Locale

class CompletionData(
    val sentences: List<String>,
    val locale: String? = null, // default value = fr
    val numberOfGenerated: Int? = null, // default value = 20
    val spellingMistakes: Boolean? = null, // default value = false
    val smsLanguage: Boolean? = null, // default value = false
    val abbreviatedLanguage: Boolean? = null// default value = false
) {
    fun prompt(): String {
        val builder = StringBuilder()
        if(spellingMistakes == true || smsLanguage == true || abbreviatedLanguage == true) {
            builder.append("Parameters:\n")
            if(spellingMistakes == true)
                builder.append("- include sentences with spelling mistakes\n")
            if(smsLanguage == true)
                builder.append("- include sentences with sms language\n")
            if(abbreviatedLanguage == true)
                builder.append("- include sentences with abbreviated language\n")
            builder.append("Takes into account the previous parameters and ")
        }

        builder.append("generates in ${LocaleUtils.toLocale(locale ?: Locale.FRENCH.country).displayLanguage} language, ")
            .append("${numberOfGenerated ?: 10} sentences derived from the sentences in the following table: [")
            .append(sentences.joinToString(", ") { "\"${it}\"" })
            .append("]")

        return builder.toString()
    }
}

