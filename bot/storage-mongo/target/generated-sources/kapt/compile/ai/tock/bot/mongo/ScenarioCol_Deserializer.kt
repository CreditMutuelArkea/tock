package ai.tock.bot.mongo

import ai.tock.bot.admin.scenario.Scenario
import ai.tock.bot.admin.scenario.ScenarioState
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.core.JsonToken
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.module.SimpleModule
import java.time.ZonedDateTime
import kotlin.String
import kotlin.collections.List
import kotlin.collections.Map
import kotlin.collections.MutableList
import kotlin.reflect.KFunction
import kotlin.reflect.KParameter
import kotlin.reflect.full.findParameterByName
import kotlin.reflect.full.primaryConstructor
import org.litote.jackson.JacksonModuleServiceLoader
import org.litote.kmongo.Id

internal class ScenarioCol_Deserializer : JsonDeserializer<ScenarioCol>(),
        JacksonModuleServiceLoader {
    override fun module() = SimpleModule().addDeserializer(ScenarioCol::class.java, this)

    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): ScenarioCol {
        with(p) {
            var __id_: Id<Scenario>? = null
            var __id_set : Boolean = false
            var _rootId_: Id<Scenario>? = null
            var _rootId_set : Boolean = false
            var _name_: String? = null
            var _name_set : Boolean = false
            var _category_: String? = null
            var _category_set : Boolean = false
            var _tags_: MutableList<String>? = null
            var _tags_set : Boolean = false
            var _applicationId_: String? = null
            var _applicationId_set : Boolean = false
            var _createDate_: ZonedDateTime? = null
            var _createDate_set : Boolean = false
            var _updateDate_: ZonedDateTime? = null
            var _updateDate_set : Boolean = false
            var _description_: String? = null
            var _description_set : Boolean = false
            var _data_: String? = null
            var _data_set : Boolean = false
            var _state_: ScenarioState? = null
            var _state_set : Boolean = false
            var _token_ : JsonToken? = currentToken
            while (_token_?.isStructEnd != true) { 
                if(_token_ != JsonToken.FIELD_NAME) {
                        _token_ = nextToken()
                        if (_token_?.isStructEnd == true) break
                        }

                val _fieldName_ = currentName
                _token_ = nextToken()
                when (_fieldName_) { 
                    "_id" -> {
                            __id_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.readValueAs(__id__reference);
                            __id_set = true
                            }
                    "rootId" -> {
                            _rootId_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.readValueAs(_rootId__reference);
                            _rootId_set = true
                            }
                    "name" -> {
                            _name_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.text;
                            _name_set = true
                            }
                    "category" -> {
                            _category_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.text;
                            _category_set = true
                            }
                    "tags" -> {
                            _tags_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.readValueAs(_tags__reference);
                            _tags_set = true
                            }
                    "applicationId" -> {
                            _applicationId_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.text;
                            _applicationId_set = true
                            }
                    "createDate" -> {
                            _createDate_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.readValueAs(ZonedDateTime::class.java);
                            _createDate_set = true
                            }
                    "updateDate" -> {
                            _updateDate_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.readValueAs(ZonedDateTime::class.java);
                            _updateDate_set = true
                            }
                    "description" -> {
                            _description_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.text;
                            _description_set = true
                            }
                    "data" -> {
                            _data_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.text;
                            _data_set = true
                            }
                    "state" -> {
                            _state_ = if(_token_ == JsonToken.VALUE_NULL) null
                             else p.readValueAs(ScenarioState::class.java);
                            _state_set = true
                            }
                    else -> {
                            if (_token_?.isStructStart == true)
                            p.skipChildren()
                            nextToken()
                            }
                    } 
                _token_ = currentToken
                        } 
            return if(__id_set && _rootId_set && _name_set && _category_set && _tags_set &&
                    _applicationId_set && _createDate_set && _updateDate_set && _description_set &&
                    _data_set && _state_set)
                    ScenarioCol(_id = __id_!!, rootId = _rootId_!!, name = _name_!!, category =
                            _category_, tags = _tags_!!, applicationId = _applicationId_!!,
                            createDate = _createDate_, updateDate = _updateDate_, description =
                            _description_, data = _data_, state = _state_!!)
                    else {
                    val map = mutableMapOf<KParameter, Any?>()
                    if(__id_set)
                    map[parameters.getValue("_id")] = __id_
                    if(_rootId_set)
                    map[parameters.getValue("rootId")] = _rootId_
                    if(_name_set)
                    map[parameters.getValue("name")] = _name_
                    if(_category_set)
                    map[parameters.getValue("category")] = _category_
                    if(_tags_set)
                    map[parameters.getValue("tags")] = _tags_
                    if(_applicationId_set)
                    map[parameters.getValue("applicationId")] = _applicationId_
                    if(_createDate_set)
                    map[parameters.getValue("createDate")] = _createDate_
                    if(_updateDate_set)
                    map[parameters.getValue("updateDate")] = _updateDate_
                    if(_description_set)
                    map[parameters.getValue("description")] = _description_
                    if(_data_set)
                    map[parameters.getValue("data")] = _data_
                    if(_state_set)
                    map[parameters.getValue("state")] = _state_ 
                    primaryConstructor.callBy(map) 
                    }
        } 
    }

    companion object {
        private val primaryConstructor: KFunction<ScenarioCol> by
                lazy(LazyThreadSafetyMode.PUBLICATION) { ScenarioCol::class.primaryConstructor!! }

        private val parameters: Map<String, KParameter> by lazy(LazyThreadSafetyMode.PUBLICATION) {
                kotlin.collections.mapOf("_id" to primaryConstructor.findParameterByName("_id")!!,
                "rootId" to primaryConstructor.findParameterByName("rootId")!!, "name" to
                primaryConstructor.findParameterByName("name")!!, "category" to
                primaryConstructor.findParameterByName("category")!!, "tags" to
                primaryConstructor.findParameterByName("tags")!!, "applicationId" to
                primaryConstructor.findParameterByName("applicationId")!!, "createDate" to
                primaryConstructor.findParameterByName("createDate")!!, "updateDate" to
                primaryConstructor.findParameterByName("updateDate")!!, "description" to
                primaryConstructor.findParameterByName("description")!!, "data" to
                primaryConstructor.findParameterByName("data")!!, "state" to
                primaryConstructor.findParameterByName("state")!!) }

        private val __id__reference: TypeReference<Id<Scenario>> = object :
                TypeReference<Id<Scenario>>() {}

        private val _rootId__reference: TypeReference<Id<Scenario>> = object :
                TypeReference<Id<Scenario>>() {}

        private val _tags__reference: TypeReference<List<String>> = object :
                TypeReference<List<String>>() {}
    }
}
