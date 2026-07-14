output "app_url" {
  description = "The URL to access the app through the ALB"
  value       = "http://${aws_lb.app.dns_name}"
}

output "alb_dns_name" {
  description = "The DNS name of the Application Load Balancer"
  value       = aws_lb.app.dns_name
}

output "app_ip" {
  description = "The public IP of the EC2 instance (for direct access / debugging)"
  value       = aws_eip.app.public_ip
}

output "rds_endpoint" {
  description = "The endpoint of the RDS instance"
  value       = aws_db_instance.postgres.endpoint
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket for snapshots"
  value       = aws_s3_bucket.snapshots.bucket
}

output "instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.app.id
}

output "github_actions_access_key_id" {
  description = "AWS_ACCESS_KEY_ID for GitHub Actions secret"
  value       = aws_iam_access_key.github_actions.id
}

output "github_actions_secret_access_key" {
  description = "AWS_SECRET_ACCESS_KEY for GitHub Actions secret"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}
