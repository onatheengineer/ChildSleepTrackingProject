resource "aws_api_gateway_model" "status_and_message_response" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "StatusResponse"
  description  = "a JSON schema"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaStatusMessage.json")
}

// subject
resource "aws_api_gateway_model" "response_schema_subject" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaSubject"
  description  = "a JSON responseSchemaSubject"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaSubject.json")
}

// food
resource "aws_api_gateway_model" "food_event_schema_post" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "foodEventSchemaPost"
  description  = "a JSON foodEventSchemaPost"
  content_type = "application/json"
  schema       = file("${path.module}/models/foodEventSchemaPost.json")
}

resource "aws_api_gateway_model" "food_event_schema_put" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "foodEventSchemaPut"
  description  = "a JSON foodEventSchemaPut"
  content_type = "application/json"
  schema       = file("${path.module}/models/foodEventSchemaPut.json")
}

resource "aws_api_gateway_model" "response_schema_food" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaFood"
  description  = "a JSON responseSchemaFood"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaFood.json")
}

// diaper
resource "aws_api_gateway_model" "diaper_event_schema_post" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "diaperEventSchemaPost"
  description  = "a JSON diaperEventSchemaPost"
  content_type = "application/json"
  schema       = file("${path.module}/models/diaperEventSchemaPost.json")
}

resource "aws_api_gateway_model" "diaper_event_schema_put" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "diaperEventSchemaPut"
  description  = "a JSON diaperEventSchemaPut"
  content_type = "application/json"
  schema       = file("${path.module}/models/diaperEventSchemaPut.json")
}

resource "aws_api_gateway_model" "response_schema_diaper" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaDiaper"
  description  = "a JSON responseSchemaDiaper"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaDiaper.json")
}

// Healthissue Model
resource "aws_api_gateway_model" "healthissue_event_schema_post" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "healthIssueEventSchemaPost"
  description  = "a JSON healthIssueEventSchemaPost"
  content_type = "application/json"
  schema       = file("${path.module}/models/healthIssueEventSchemaPost.json")
}

resource "aws_api_gateway_model" "healthissue_event_schema_put" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "healthIssueEventSchemaPut"
  description  = "a JSON healthIssueEventSchemaPut"
  content_type = "application/json"
  schema       = file("${path.module}/models/healthIssueEventSchemaPut.json")
}

resource "aws_api_gateway_model" "response_schema_healthissue" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaHealthIssue"
  description  = "a JSON responseSchemaHealthIssue"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaHealthIssue.json")
}


// temperature models
resource "aws_api_gateway_model" "temperature_event_schema_post" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "temperatureEventSchemaPost"
  description  = "a JSON temperatureEventSchemaPost"
  content_type = "application/json"
  schema       = file("${path.module}/models/temperatureEventSchemaPost.json")
}

resource "aws_api_gateway_model" "temperature_event_schema_put" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "temperatureEventSchemaPut"
  description  = "a JSON temperatureEventSchemaPut"
  content_type = "application/json"
  schema       = file("${path.module}/models/temperatureEventSchemaPut.json")
}

resource "aws_api_gateway_model" "response_schema_temperature" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaTemperature"
  description  = "a JSON responseSchemaTemperature"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaTemperature.json")
}

// height models
resource "aws_api_gateway_model" "height_event_schema_post" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "heightEventSchemaPost"
  description  = "a JSON heightEventSchemaPost"
  content_type = "application/json"
  schema       = file("${path.module}/models/heightEventSchemaPost.json")
}

resource "aws_api_gateway_model" "height_event_schema_put" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "heightEventSchemaPut"
  description  = "a JSON heightEventSchemaPut"
  content_type = "application/json"
  schema       = file("${path.module}/models/heightEventSchemaPut.json")
}

resource "aws_api_gateway_model" "response_schema_height" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaHeight"
  description  = "a JSON responseSchemaHeight"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaHeight.json")
}

// weight models
resource "aws_api_gateway_model" "weight_event_schema_post" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "weightEventSchemaPost"
  description  = "a JSON weightEventSchemaPost"
  content_type = "application/json"
  schema       = file("${path.module}/models/weightEventSchemaPost.json")
}

resource "aws_api_gateway_model" "weight_event_schema_put" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "weightEventSchemaPut"
  description  = "a JSON weightEventSchemaPut"
  content_type = "application/json"
  schema       = file("${path.module}/models/weightEventSchemaPut.json")
}

resource "aws_api_gateway_model" "response_schema_weight" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaWeight"
  description  = "a JSON responseSchemaWeight"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaWeight.json")
}

// respiratory
resource "aws_api_gateway_model" "response_schema_respiratory" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaRespiratory"
  description  = "a JSON responseSchemaRespiratory"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaRespiratory.json")
}

// dailytracker
resource "aws_api_gateway_model" "response_schema_dailytracker" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaDailyTracker"
  description  = "a JSON responseSchemaDailyTracker"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaDailyTracker.json")
}

// health issue PROJECTcodes
resource "aws_api_gateway_model" "response_schema_healthissue_PROJECTcodes" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaHealthissuePROJECTcodes"
  description  = "a JSON responseSchemaHealthissuePROJECTcodes"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaHealthissuePROJECTcodes.json")
}

// saveHealthIssueSurveyResponse
resource "aws_api_gateway_model" "saveHealthIssueSurveyResponse_response_schema_post" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "healthIssueSurveyEventSchemaNativePost"
  description  = "a JSON saveHealthIssueSurveyResponse_response_schema_post"
  content_type = "application/json"
  schema       = file("${path.module}/models/healthIssueSurveyEventSchemaNativePost.json")
}

// graph interval
resource "aws_api_gateway_model" "response_schema_graph" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaGraph"
  description  = "a JSON responseSchemaGraph"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaGraph.json")
}

// graph interval respiratory
resource "aws_api_gateway_model" "response_schema_respiratory_graph" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaRespiratoryGraph"
  description  = "a JSON responseSchemaRespiratoryGraph"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaRespiratoryGraph.json")
}

// sleep
resource "aws_api_gateway_model" "response_schema_sleep" {
  rest_api_id  = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  name         = "responseSchemaSleep"
  description  = "a JSON responseSchemaSleep"
  content_type = "application/json"
  schema       = file("${path.module}/models/responseSchemaSleep.json")
}