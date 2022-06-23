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

package ai.tock.nlp.front.storage.mongo

import ai.tock.nlp.front.service.storage.ClassifiedSentenceDAO
import ai.tock.nlp.front.service.storage.FaqDefinitionDAO
import ai.tock.nlp.front.service.storage.IntentDefinitionDAO
import ai.tock.nlp.front.shared.config.ApplicationDefinition
import ai.tock.nlp.front.shared.config.Classification
import ai.tock.nlp.front.shared.config.ClassifiedSentence
import ai.tock.nlp.front.shared.config.ClassifiedSentenceStatus
import ai.tock.nlp.front.shared.config.FaqDefinition
import ai.tock.nlp.front.shared.config.FaqQuery
import ai.tock.nlp.front.shared.config.IntentDefinition
import ai.tock.shared.injector
import ai.tock.shared.provide
import ai.tock.shared.security.UserLogin
import ai.tock.translator.I18nLabel
import com.github.salomonbrys.kodein.Kodein
import com.github.salomonbrys.kodein.bind
import com.github.salomonbrys.kodein.provider
import com.mongodb.client.MongoCollection
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.litote.kmongo.Id
import org.litote.kmongo.toId
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Locale
import kotlin.test.assertEquals

class FaqDefinitionMongoDAOTest : AbstractTest() {

    private val faqDefinitionDao: FaqDefinitionDAO get() = injector.provide()
    private val intentDefinitionDao: IntentDefinitionDAO get() = injector.provide()
    private val classifiedSentencesDao: ClassifiedSentenceDAO get() = injector.provide()

    private val applicationId = "idApplication".toId<ApplicationDefinition>()
    private val applicationId2 = "idApplication2".toId<ApplicationDefinition>()
    private val intentId = "idIntent".toId<IntentDefinition>()
    private val intentId2 = "idIntent2".toId<IntentDefinition>()
    private val intentId3 = "idIntent3".toId<IntentDefinition>()

    private val faqId = "faqDefId".toId<FaqDefinition>()
    private val faqId2 = "faqDefId2".toId<FaqDefinition>()
    private val faqId3 = "faqDefId3".toId<FaqDefinition>()
    private val i18nId = "idI18n".toId<I18nLabel>()
    private val now = Instant.now().truncatedTo(ChronoUnit.MILLIS)
    private val tagList = listOf("TAG1", "TAG2")

    private val faqDefinition = FaqDefinition(faqId, applicationId, intentId, i18nId, tagList, true, now, now)
    private val faq2Definition = FaqDefinition(faqId2, applicationId, intentId2, i18nId, tagList, true, now, now)
    private val faq3Definition = FaqDefinition(faqId3, applicationId2, intentId, i18nId, tagList, true, now, now)

    private val namespace = "namespace"
    private val faq_category = "faq"
    private val userLogin: UserLogin = "whateverLogin"

    private val col: MongoCollection<FaqDefinition> by lazy { FaqDefinitionMongoDAO.col }

    override fun moreBindingModules(): Kodein.Module {
        return Kodein.Module {
            bind<FaqDefinitionDAO>() with provider { FaqDefinitionMongoDAO }
            bind<ClassifiedSentenceDAO>() with provider { ClassifiedSentenceMongoDAO }
            bind<IntentDefinitionDAO>() with provider { IntentDefinitionMongoDAO }
        }
    }

    @AfterEach
    fun cleanup() {
        faqDefinitionDao.deleteFaqDefinitionById(faqId)
        faqDefinitionDao.deleteFaqDefinitionById(faqId2)
        faqDefinitionDao.deleteFaqDefinitionById(faqId3)
        intentDefinitionDao.deleteIntentById(intentId)
        intentDefinitionDao.deleteIntentById(intentId2)
        intentDefinitionDao.deleteIntentById(intentId3)
        classifiedSentencesDao.deleteSentencesByApplicationId(applicationId)
    }

    @Test
    fun `Get a FaqDefinition just saved`() {
        faqDefinitionDao.save(faqDefinition)
        assertEquals(
            expected = faqDefinition,
            actual = faqDefinitionDao.getFaqDefinitionByApplicationId(applicationId)?.first(),
            message = "There should be something returned with an applicationId"
        )
        assertEquals(
            expected = faqDefinition,
            actual = faqDefinitionDao.getFaqDefinitionByIntentId(intentId),
            message = "There should be something returned with an intentId"
        )
        assertEquals(
            expected = faqDefinition,
            actual = faqDefinitionDao.getFaqDefinitionById(faqId),
            message = "There should be something returned with an faqId"
        )
        assertEquals(
            expected = faqDefinition,
            actual = faqDefinitionDao.getFaqDefinitionByI18nIds(setOf(i18nId))?.first(),
            message = "There should be something returned with an i18nIds"
        )
        assertEquals(
            expected = faqDefinition,
            actual = faqDefinitionDao.getFaqDefinitionByTags(tagList.toSet()).first(),
            message = "There should be something returned with tags"
        )
        assertEquals(1, col.countDocuments())
    }

    @Test
    fun `Get a FaqDefinition by application ID`() {
        faqDefinitionDao.save(faqDefinition)
        faqDefinitionDao.save(faq2Definition)
        faqDefinitionDao.save(faq3Definition)

        assertEquals(3, col.countDocuments())

        assertEquals(
            expected = 2,
            actual = faqDefinitionDao.getFaqDefinitionByApplicationId(applicationId)?.size,
            message = "There should be something returned with an applicationId"
        )
        assertEquals(
            expected = 1,
            actual = faqDefinitionDao.getFaqDefinitionByApplicationId(applicationId2)?.size,
            message = "There should be something returned with an applicationId"
        )
    }

    @Test
    fun `Remove a FaqDefinition just saved`() {
        faqDefinitionDao.save(faqDefinition)
        faqDefinitionDao.deleteFaqDefinitionById(faqId)

        assertEquals(0, col.countDocuments())
        assertEquals(
            expected = null,
            actual = faqDefinitionDao.getFaqDefinitionByIntentId(intentId),
            message = "There should be something returned with an intentId"
        )
        assertEquals(
            expected = null,
            actual = faqDefinitionDao.getFaqDefinitionById(faqId),
            message = "There should be something returned with an faqId"
        )
        assertEquals(
            expected = null,
            actual = faqDefinitionDao.getFaqDefinitionByI18nIds(setOf(i18nId))?.firstOrNull(),
            message = "There should be something returned with an i18nIds"
        )
        assertEquals(
            expected = null,
            actual = faqDefinitionDao.getFaqDefinitionByTags(tagList.toSet()).firstOrNull(),
            message = "There should be something returned with tags"
        )
    }

    @Test
    fun `Get a faqDefinition search filtered by tag`() {
        //prepare a Faq save
        faqDefinitionDao.save(faqDefinition)

        //another faq
        val i18nId2 = "idI18n2".toId<I18nLabel>()
        val tagList2 = listOf("TAG1")

        val otherFaqDefinition =
            FaqDefinition(
                faqId2,
                applicationId,
                intentId2,
                i18nId2,
                tagList2,
                true,
                now.plusSeconds(1),
                now.plusSeconds(1)
            )
        faqDefinitionDao.save(otherFaqDefinition)

        //some another faq
        val i18nId3 = "idI18n3".toId<I18nLabel>()
        val tagList3 = listOf("TAG2")

        val someOtherFaqDefinition =
            FaqDefinition(
                faqId3,
                applicationId,
                intentId3,
                i18nId3,
                tagList3,
                true,
                now.plusSeconds(2),
                now.plusSeconds(2)
            )
        faqDefinitionDao.save(someOtherFaqDefinition)

        assertEquals(
            expected = 2,
            actual = faqDefinitionDao.getFaqDefinitionByTags(setOf("TAG1")).size,
            message = "There should be something returned with tags"
        )
    }

    @Test
    fun `Delete faq by application id`() {
        val appId1: Id<ApplicationDefinition> = "appID1".toId()
        val appId2: Id<ApplicationDefinition> = "appID2".toId()

        faqDefinitionDao.save(faqDefinition.copy(applicationId = appId1))
        faqDefinitionDao.save(faq2Definition.copy(applicationId = appId1))
        faqDefinitionDao.save(faq3Definition.copy(applicationId = appId2))

        assertEquals(3, col.countDocuments())

        assertEquals(2, faqDefinitionDao.getFaqDefinitionByApplicationId(appId1).size)

        faqDefinitionDao.deleteFaqDefinitionByApplicationId(appId1)

        assertEquals(0, faqDefinitionDao.getFaqDefinitionByApplicationId(appId1).size)
        assertEquals(1, faqDefinitionDao.getFaqDefinitionByApplicationId(appId2).size)
    }

    @Test
    fun `FaqDefinition search by tag`() {
        //prepare a Faq save
        faqDefinitionDao.save(faqDefinition)

        val firstIntentWithIntentId = IntentDefinition(
            "FAQ name",
            namespace,
            setOf(applicationId),
            emptySet(),
            label = "faqname",
            category = faq_category,
            _id = intentId
        )

        intentDefinitionDao.save(firstIntentWithIntentId)

        val i18nId = "idI18n3".toId<I18nLabel>()
        val otherTagList = listOf("OTHERTAG")

        val secondFaqDefinition =
            FaqDefinition(
                faqId3,
                applicationId,
                intentId3,
                i18nId,
                otherTagList,
                true,
                now.plusSeconds(2),
                now.plusSeconds(2)
            )

        val secondIntentWithIntentId3 = IntentDefinition(
            "Faq name 2",
            namespace,
            setOf(applicationId),
            emptySet(),
            label = "faqname2",
            category = faq_category,
            _id = intentId3
        )

        intentDefinitionDao.save(secondIntentWithIntentId3)
        faqDefinitionDao.save(secondFaqDefinition)

        val tags = faqDefinitionDao.getTags(applicationId.toString())
        assertEquals(tags, otherTagList + faqDefinition.tags)
    }

    @Test
    fun `A faqDefinition search with deleted utterances`() {
        val i18nId2 = "idI18n2".toId<I18nLabel>()
        val tagList2 = listOf("TAG1")

        val firstFaqDefinition =
            FaqDefinition(
                faqId2,
                applicationId,
                intentId2,
                i18nId2,
                tagList2,
                true,
                now.plusSeconds(1),
                now.plusSeconds(1)
            )
        val firstIntentWithIntentId2 = IntentDefinition(
            "FAQ name",
            namespace,
            setOf(applicationId),
            emptySet(),
            label = "faqname",
            category = faq_category,
            _id = intentId2
        )

        intentDefinitionDao.save(firstIntentWithIntentId2)
        val firstUtterance = createUtterance("randomText", intentId2, ClassifiedSentenceStatus.validated)
        classifiedSentencesDao.save(firstUtterance)
        faqDefinitionDao.save(firstFaqDefinition)

        //some another faq
        val i18nId3 = "idI18n3".toId<I18nLabel>()
        val tagList3 = listOf("TAG2")

        val secondFaqDefinition =
            FaqDefinition(
                faqId3,
                applicationId,
                intentId3,
                i18nId3,
                tagList3,
                true,
                now.plusSeconds(2),
                now.plusSeconds(2)
            )

        val secondIntentWithIntentId3 = IntentDefinition(
            "FAQ name 2",
            namespace,
            setOf(applicationId),
            emptySet(),
            label = "faqname2",
            category = faq_category,
            _id = intentId3
        )

        intentDefinitionDao.save(secondIntentWithIntentId3)
        val secondUtterance = createUtterance("randomText2", intentId3, ClassifiedSentenceStatus.validated)
        classifiedSentencesDao.save(secondUtterance)
        faqDefinitionDao.save(secondFaqDefinition)

        // third FAQ
        val intentIdtoDel = "intentIdtoDel".toId<IntentDefinition>()
        val i18nIdToDel = "i18nIdtoDel".toId<I18nLabel>()
        val tagListToDel = listOf("TAG2")
        // Faq Definition in deletion with build Worker schedule for example
        val inDeletionFaqDefinition =
            FaqDefinition(
                faqId,
                applicationId,
                intentIdtoDel,
                i18nIdToDel,
                tagListToDel,
                true,
                now.plusSeconds(3),
                now.plusSeconds(3)
            )

        val thirdIntentWithIntentId = IntentDefinition(
            "FAQ name in deletion",
            namespace,
            setOf(applicationId),
            emptySet(),
            label = "faqnameindeletion",
            category = faq_category,
            _id = intentIdtoDel
        )

        intentDefinitionDao.save(thirdIntentWithIntentId)
        val thirdUtterance = createUtterance("randomText3", intentIdtoDel, ClassifiedSentenceStatus.validated)
        classifiedSentencesDao.save(thirdUtterance)
        faqDefinitionDao.save(inDeletionFaqDefinition)

        //delete the faq
        faqDefinitionDao.deleteFaqDefinitionById(faqId)
        intentDefinitionDao.deleteIntentById(thirdIntentWithIntentId._id)
        classifiedSentencesDao.switchSentencesStatus(listOf(thirdUtterance), ClassifiedSentenceStatus.deleted)

        // search the actual faq
        val searchFound = faqDefinitionDao.getFaqDetailsWithCount(
            createFaqQuery(null, null),
            applicationId.toString(),
            null
        )

        assertEquals(
            expected = 2,
            actual = classifiedSentencesDao.getSentences(
                setOf(intentId3, intentId2, intentIdtoDel),
                Locale.FRENCH,
                ClassifiedSentenceStatus.validated
            ).size,
            message = "There should be two classified sentences"
        )

        assertEquals(
            expected = 2,
            actual = intentDefinitionDao.getIntentByIds(setOf(intentId3, intentId2, intentIdtoDel))?.size,
            message = "There should be two intents"
        )

        assertEquals(searchFound.second, 2, "There should be 2 Faq")
    }

    @Test
    fun `A faqDefinition search with name with deleted utterances`() {
        val faqName2 = "FAQ name 2"
        val i18nId2 = "idI18n2".toId<I18nLabel>()
        val tagList2 = listOf("TAG1")

        val firstFaqDefinition =
            FaqDefinition(
                faqId2,
                applicationId,
                intentId2,
                i18nId2,
                tagList2,
                true,
                now.plusSeconds(1),
                now.plusSeconds(1)
            )
        val firstIntentWithIntentId2 = IntentDefinition(
            "FAQ name",
            namespace,
            setOf(applicationId),
            emptySet(),
            label = "faqname",
            category = faq_category,
            _id = intentId2
        )

        intentDefinitionDao.save(firstIntentWithIntentId2)
        val firstUtterance = createUtterance("randomText", intentId2, ClassifiedSentenceStatus.validated)
        classifiedSentencesDao.save(firstUtterance)
        faqDefinitionDao.save(firstFaqDefinition)

        //some another faq
        val i18nId3 = "idI18n3".toId<I18nLabel>()
        val tagList3 = listOf("TAG2")

        val secondFaqDefinition =
            FaqDefinition(
                faqId3,
                applicationId,
                intentId3,
                i18nId3,
                tagList3,
                true,
                now.plusSeconds(2),
                now.plusSeconds(2)
            )

        val secondIntentWithIntentId3 = IntentDefinition(
            faqName2,
            namespace,
            setOf(applicationId),
            emptySet(),
            label = "faqname2",
            category = faq_category,
            _id = intentId3
        )

        intentDefinitionDao.save(secondIntentWithIntentId3)
        val secondUtterance = createUtterance("randomText2", intentId3, ClassifiedSentenceStatus.validated)
        classifiedSentencesDao.save(secondUtterance)
        faqDefinitionDao.save(secondFaqDefinition)

        // third FAQ
        val intentIdtoDel = "intentIdtoDel".toId<IntentDefinition>()
        val i18nIdToDel = "i18nIdtoDel".toId<I18nLabel>()
        val tagListToDel = listOf("TAG2")
        // Faq Definition in deletion with build Worker schedule for example
        val inDeletionFaqDefinition =
            FaqDefinition(
                faqId,
                applicationId,
                intentIdtoDel,
                i18nIdToDel,
                tagListToDel,
                true,
                now.plusSeconds(3),
                now.plusSeconds(3)
            )

        val thirdIntentWithIntentId = IntentDefinition(
            "FAQ name in deletion",
            namespace,
            setOf(applicationId),
            emptySet(),
            label = "faqnameindeletion",
            category = faq_category,
            _id = intentIdtoDel
        )

        intentDefinitionDao.save(thirdIntentWithIntentId)
        val thirdUtterance = createUtterance("randomText3", intentIdtoDel, ClassifiedSentenceStatus.validated)
        classifiedSentencesDao.save(thirdUtterance)
        faqDefinitionDao.save(inDeletionFaqDefinition)

        //delete the faq
        faqDefinitionDao.deleteFaqDefinitionById(faqId)
        intentDefinitionDao.deleteIntentById(thirdIntentWithIntentId._id)
        classifiedSentencesDao.switchSentencesStatus(listOf(thirdUtterance), ClassifiedSentenceStatus.deleted)

        // search the actual faq
        val searchFound = faqDefinitionDao.getFaqDetailsWithCount(
            createFaqQuery(null, faqName2),
            applicationId.toString(),
            null
        )

        assertEquals(
            expected = 2,
            actual = classifiedSentencesDao.getSentences(
                setOf(intentId3, intentId2, intentIdtoDel),
                Locale.FRENCH,
                ClassifiedSentenceStatus.validated
            ).size,
            message = "There should be two classified sentences"
        )

        assertEquals(
            expected = 2,
            actual = intentDefinitionDao.getIntentByIds(setOf(intentId3, intentId2, intentIdtoDel))?.size,
            message = "There should be two intents"
        )

        assertEquals(searchFound.second, 1, "There should be 1 Faq with the text 'FAQ name 2'")
    }

    private fun createFaqQuery(enabled: Boolean?, search: String?): FaqQuery {
        return FaqQuery(
            0,
            10,
            search,
            null,
            emptyList(),
            enabled,
            userLogin,
            null,
            applicationId.toString(),
            namespace
        )
    }

    private fun createUtterance(text: String, intentId: Id<IntentDefinition>, status: ClassifiedSentenceStatus) =
        ClassifiedSentence(
            text = text,
            language = Locale.FRENCH,
            applicationId = applicationId,
            creationDate = Instant.now(),
            updateDate = Instant.now(),
            status = status,
            classification = Classification(intentId, emptyList()),
            lastIntentProbability = 1.0,
            lastEntityProbability = 1.0,
            qualifier = userLogin
        )
}