resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/ec2/competitor-tracker"
  retention_in_days = 7

  tags = {
    Name = "competitor-tracker-logs"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "competitor-tracker-high-cpu"
  alarm_description   = "CPU alarm for ASG scaling"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Average"
  threshold           = "70"
  alarm_actions       = []
  ok_actions          = []

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app.name
  }

  tags = {
    Name = "competitor-tracker-high-cpu-alarm"
  }
}