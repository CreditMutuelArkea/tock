package ai.tock.bot.mongo

import ai.tock.bot.admin.scenario.Scenario
import kotlin.String
import kotlin.Suppress
import kotlin.collections.Collection
import kotlin.collections.List
import kotlin.collections.Map
import kotlin.reflect.KProperty1
import org.litote.kmongo.Id
import org.litote.kmongo.property.KCollectionPropertyPath
import org.litote.kmongo.property.KMapPropertyPath
import org.litote.kmongo.property.KPropertyPath

private val ___id: KProperty1<ScenarioCol, Id<Scenario>?>
    get() = ScenarioCol::_id
private val __Data: KProperty1<ScenarioCol, List<ScenarioVersionCol>?>
    get() = ScenarioCol::data
internal class ScenarioCol_<T>(previous: KPropertyPath<T, *>?, property: KProperty1<*,
        ScenarioCol?>) : KPropertyPath<T, ScenarioCol?>(previous,property) {
    val _id: KPropertyPath<T, Id<Scenario>?>
        get() = KPropertyPath(this,___id)

    val data: ScenarioHistoryCol_Col<T>
        get() = ScenarioHistoryCol_Col(this,ScenarioCol::data)

    companion object {
        val _id: KProperty1<ScenarioCol, Id<Scenario>?>
            get() = ___id
        val Data: ScenarioHistoryCol_Col<ScenarioCol>
            get() = ScenarioHistoryCol_Col(null,__Data)}
}

internal class ScenarioCol_Col<T>(previous: KPropertyPath<T, *>?, property: KProperty1<*,
        Collection<ScenarioCol>?>) : KCollectionPropertyPath<T, ScenarioCol?,
        ScenarioCol_<T>>(previous,property) {
    val _id: KPropertyPath<T, Id<Scenario>?>
        get() = KPropertyPath(this,___id)

    val data: ScenarioHistoryCol_Col<T>
        get() = ScenarioHistoryCol_Col(this,ScenarioCol::data)

    @Suppress("UNCHECKED_CAST")
    override fun memberWithAdditionalPath(additionalPath: String): ScenarioCol_<T> =
            ScenarioCol_(this, customProperty(this, additionalPath))}

internal class ScenarioCol_Map<T, K>(previous: KPropertyPath<T, *>?, property: KProperty1<*, Map<K,
        ScenarioCol>?>) : KMapPropertyPath<T, K, ScenarioCol?, ScenarioCol_<T>>(previous,property) {
    val _id: KPropertyPath<T, Id<Scenario>?>
        get() = KPropertyPath(this,___id)

    val data: ScenarioHistoryCol_Col<T>
        get() = ScenarioHistoryCol_Col(this,ScenarioCol::data)

    @Suppress("UNCHECKED_CAST")
    override fun memberWithAdditionalPath(additionalPath: String): ScenarioCol_<T> =
            ScenarioCol_(this, customProperty(this, additionalPath))}
