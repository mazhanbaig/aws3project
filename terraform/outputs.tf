output "app_url" {
  description = "The URL to access the app (HTTP on port 3000)"
  value       = "http://${aws_eip.app.public_ip}:3000"
}

output "app_ip" {
  description = "The public IP of the EC2 instance"
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
