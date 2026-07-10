data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-*-x86_64-*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

resource "aws_launch_template" "app" {
  name_prefix            = "competitor-tracker-lt-"
  image_id               = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2.name
  }
  vpc_security_group_ids = [aws_security_group.ec2.id]
  user_data              = base64encode(templatefile("${path.module}/scripts/user-data.sh.tpl", {
    db_host         = aws_db_instance.postgres.address
    db_port         = aws_db_instance.postgres.port
    db_name         = "competitor_tracker"
    db_user         = "app"
    db_password     = var.db_password
    jwt_secret      = var.jwt_secret
    s3_bucket       = aws_s3_bucket.snapshots.bucket
    aws_region      = var.aws_region
    app_repo_url    = var.app_repo_url
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "competitor-tracker-app"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "app" {
  name                      = "competitor-tracker-asg"
  max_size                  = 2
  min_size                  = 1
  desired_capacity          = 1
  vpc_zone_identifier       = [aws_subnet.public_a.id, aws_subnet.public_c.id]
  target_group_arns         = [aws_lb_target_group.app.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "competitor-tracker-asg"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_policy" "cpu_scale" {
  name                   = "competitor-tracker-cpu-scale"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 60
  }
}