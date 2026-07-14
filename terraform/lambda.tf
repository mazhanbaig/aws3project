# Lambda execution role
resource "aws_iam_role" "lambda_exec" {
  name = "projectfolio-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda security group (allow outbound to RDS)
resource "aws_security_group" "lambda" {
  name        = "projectfolio-lambda-sg"
  description = "Lambda security group - outbound to RDS"
  vpc_id      = aws_vpc.main.id

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "projectfolio-lambda-sg" }
}

# Lambda deployment package
data "archive_file" "lambdas" {
  type        = "zip"
  output_path = "${path.module}/lambdas.zip"
  source_dir  = "${path.module}/lambdas"
}

resource "aws_s3_object" "lambdas" {
  bucket = aws_s3_bucket.snapshots.id
  key    = "lambdas/lambdas.zip"
  source = data.archive_file.lambdas.output_path
  etag   = data.archive_file.lambdas.output_base64sha256
}

# Lambda functions
locals {
  lambda_functions = {
    "auth-signup"    = { handler = "auth-signup/index.handler" }
    "auth-login"     = { handler = "auth-login/index.handler" }
    "projects-list"  = { handler = "projects-list/index.handler" }
    "projects-create" = { handler = "projects-create/index.handler" }
    "projects-get"   = { handler = "projects-get/index.handler" }
    "projects-delete" = { handler = "projects-delete/index.handler" }
    "users-get"        = { handler = "users-get/index.handler" }
  }
}

resource "aws_lambda_function" "this" {
  for_each = local.lambda_functions

  function_name = "projectfolio-${each.key}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = each.value.handler
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  s3_bucket        = aws_s3_bucket.snapshots.id
  s3_key           = aws_s3_object.lambdas.key
  source_code_hash = data.archive_file.lambdas.output_base64sha256

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_c.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST     = aws_db_instance.postgres.address
      DB_PORT     = tostring(aws_db_instance.postgres.port)
      DB_NAME     = "competitor_tracker"
      DB_USER     = "app"
      DB_PASSWORD = var.db_password
      JWT_SECRET  = var.jwt_secret
    }
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_vpc, aws_iam_role_policy_attachment.lambda_basic]
}

# API Gateway
resource "aws_api_gateway_rest_api" "api" {
  name        = "projectfolio-api"
  description = "ProjectFolio API"
  endpoint_configuration { types = ["REGIONAL"] }
}

resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "auth"
}

resource "aws_api_gateway_resource" "auth_signup" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "signup"
}

resource "aws_api_gateway_resource" "auth_login" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "login"
}

resource "aws_api_gateway_resource" "projects" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "projects"
}

resource "aws_api_gateway_resource" "project" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.projects.id
  path_part   = "{id}"
}

resource "aws_api_gateway_resource" "users" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "users"
}

resource "aws_api_gateway_resource" "user" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "{id}"
}

# Lambda permissions
resource "aws_lambda_permission" "api" {
  for_each      = local.lambda_functions
  statement_id  = "AllowAPIGateway_${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# Helper to create method + integration + OPTIONS
locals {
  api_routes = {
    "auth-signup"    = { resource = aws_api_gateway_resource.auth_signup.id, method = "POST", key = "auth-signup" }
    "auth-login"     = { resource = aws_api_gateway_resource.auth_login.id, method = "POST", key = "auth-login" }
    "projects-list"  = { resource = aws_api_gateway_resource.projects.id, method = "GET", key = "projects-list" }
    "projects-create" = { resource = aws_api_gateway_resource.projects.id, method = "POST", key = "projects-create" }
    "projects-get"   = { resource = aws_api_gateway_resource.project.id, method = "GET", key = "projects-get" }
    "projects-delete" = { resource = aws_api_gateway_resource.project.id, method = "DELETE", key = "projects-delete" }
    "users-get"        = { resource = aws_api_gateway_resource.user.id, method = "GET", key = "users-get" }
  }
}

resource "aws_api_gateway_method" "route" {
  for_each      = local.api_routes
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = each.value.resource
  http_method   = each.value.method
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "route" {
  for_each                = local.api_routes
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = each.value.resource
  http_method             = aws_api_gateway_method.route[each.key].http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.this[each.value.key].invoke_arn
}

# OPTIONS methods for CORS
locals {
  cors_map = {
    auth_signup  = aws_api_gateway_resource.auth_signup.id
    auth_login   = aws_api_gateway_resource.auth_login.id
    projects     = aws_api_gateway_resource.projects.id
    project      = aws_api_gateway_resource.project.id
    user         = aws_api_gateway_resource.user.id
  }
}

resource "aws_api_gateway_method" "options" {
  for_each    = local.cors_map
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = each.value
  http_method = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  for_each    = local.cors_map
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = each.value
  http_method = "OPTIONS"
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_200" {
  for_each    = local.cors_map
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = each.value
  http_method = "OPTIONS"
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  for_each    = local.cors_map
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = each.value
  http_method = "OPTIONS"
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_method_response.options_200]
}

# Deploy API Gateway
resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_integration.route,
      aws_api_gateway_method.route,
      aws_api_gateway_resource.auth,
      aws_api_gateway_resource.projects,
      aws_api_gateway_resource.users,
    ]))
  }

  lifecycle { create_before_destroy = true }

  depends_on = [
    aws_api_gateway_integration.route,
    aws_api_gateway_integration.options,
  ]
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.api.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = "prod"
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com/prod"
}
