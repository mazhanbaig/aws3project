# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/ec2/competitor-tracker"
  retention_in_days = 7

  tags = {
    Name = "competitor-tracker-logs"
  }
}

# ──────────────────────────────────────────────────────────────
# SNS Topic for Alarm Notifications
# ──────────────────────────────────────────────────────────────
resource "aws_sns_topic" "alarms" {
  name = "competitor-tracker-alarms"

  tags = {
    Name = "competitor-tracker-alarms"
  }
}

# ──────────────────────────────────────────────────────────────
# ASG Scaling Policies (Target Tracking)
# ──────────────────────────────────────────────────────────────
resource "aws_autoscaling_policy" "cpu_target_tracking" {
  name                   = "competitor-tracker-cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

resource "aws_autoscaling_policy" "request_count_target_tracking" {
  name                   = "competitor-tracker-request-count"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.app.arn_suffix}/${aws_lb_target_group.app.arn_suffix}"
    }
    target_value = 1000.0
  }
}

# ──────────────────────────────────────────────────────────────
# CloudWatch Alarms
# ──────────────────────────────────────────────────────────────

# High CPU Alarm (ALB-level, triggers SNS)
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "competitor-tracker-high-cpu"
  alarm_description   = "CPU utilization exceeded 70% for 2 consecutive periods"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 70
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app.name
  }

  tags = {
    Name = "competitor-tracker-high-cpu-alarm"
  }
}

# ALB 5xx Error Alarm
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "competitor-tracker-alb-5xx"
  alarm_description   = "ALB 5xx errors exceeded threshold"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }

  tags = {
    Name = "competitor-tracker-alb-5xx-alarm"
  }
}

# ALB High Latency Alarm
resource "aws_cloudwatch_metric_alarm" "alb_latency" {
  alarm_name          = "competitor-tracker-alb-latency"
  alarm_description   = "ALB average response time exceeded 3 seconds"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 3
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }

  tags = {
    Name = "competitor-tracker-alb-latency-alarm"
  }
}

# Unhealthy Hosts Alarm
resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  alarm_name          = "competitor-tracker-unhealthy-hosts"
  alarm_description   = "ALB has unhealthy targets"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
    TargetGroup  = aws_lb_target_group.app.arn_suffix
  }

  tags = {
    Name = "competitor-tracker-unhealthy-hosts-alarm"
  }
}
