output "alb_dns_name" {
  description = "The DNS name of the ALB"
  value       = aws_lb.app.dns_name
}

output "alb_zone_id" {
  description = "The zone ID of the ALB"
  value       = aws_lb.app.zone_id
}

output "rds_endpoint" {
  description = "The endpoint of the RDS instance"
  value       = aws_db_instance.postgres.endpoint
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket for snapshots"
  value       = aws_s3_bucket.snapshots.bucket
}

output "asg_name" {
  description = "The name of the Auto Scaling Group"
  value       = aws_autoscaling_group.app.name
}