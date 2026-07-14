# Get latest Amazon Linux 2023 AMI (fallback when no Packer AMI provided)
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

# Locals for AMI selection
locals {
  app_ami_id = var.app_ami_id != "" ? var.app_ami_id : data.aws_ami.amazon_linux_2023.id
}

# Launch Template - accepts AMI ID as variable (from Packer or fallback)
resource "aws_launch_template" "app" {
  name_prefix            = "competitor-tracker-lt-"
  image_id               = local.app_ami_id
  instance_type          = var.instance_type
  update_default_version = true

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2.name
  }

  vpc_security_group_ids = [aws_security_group.ec2.id]

  user_data = base64encode(templatefile("${path.module}/scripts/user-data.sh.tpl", {
    app_repo_url    = var.app_repo_url
    app_branch      = var.app_branch
    api_gateway_url = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com/prod"
  }))

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 30
      volume_type           = "gp3"
      delete_on_termination = true
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "competitor-tracker-app"
    }
  }

  tag_specifications {
    resource_type = "volume"
    tags = {
      Name = "competitor-tracker-app"
    }
  }

  tags = {
    Name = "competitor-tracker-lt"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Group across 2 AZs
resource "aws_autoscaling_group" "app" {
  name                = "competitor-tracker-asg"
  min_size            = var.asg_min_size
  max_size            = var.asg_max_size
  desired_capacity    = var.asg_desired_capacity
  vpc_zone_identifier = [aws_subnet.public_a.id, aws_subnet.public_c.id]
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
      instance_warmup        = 300
    }
  }

  tag {
    key                 = "Name"
    value               = "competitor-tracker-app"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Elastic IP for direct access / debugging
resource "aws_eip" "app" {
  domain = "vpc"

  tags = {
    Name = "competitor-tracker-eip"
  }
}
