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

variable "app_ami_id" {
  description = "AMI ID baked by Packer. If empty, uses latest Amazon Linux 2023"
  type        = string
  default     = ""
}

variable "asg_min_size" {
  description = "ASG minimum instance count"
  type        = number
  default     = 1
}

variable "asg_max_size" {
  description = "ASG maximum instance count"
  type        = number
  default     = 2
}

variable "asg_desired_capacity" {
  description = "ASG desired instance count"
  type        = number
  default     = 1
}

variable "app_branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}

variable "ssl_certificate_arn" {
  description = "ARN of the ACM SSL certificate for HTTPS listener (optional, leave empty for HTTP only)"
  type        = string
  default     = ""
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