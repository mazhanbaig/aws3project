variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "PostgreSQL password for RDS"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for session tokens"
  type        = string
  sensitive   = true
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "db_instance_type" {
  description = "RDS instance type"
  type        = string
  default     = "db.t3.micro"
}

variable "my_ip" {
  description = "Your public IP for SSH access (optional, leave empty for SSM only)"
  type        = string
  default     = ""
}

variable "app_repo_url" {
  description = "GitHub repo URL for the app"
  type        = string
  default     = "https://github.com/owner/competitor-tracker.git"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}