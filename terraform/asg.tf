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

resource "aws_launch_template" "app" {
  name_prefix            = "competitor-tracker-lt-"
  image_id               = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2.name
  }

  vpc_security_group_ids = [aws_security_group.ec2.id]

  user_data = base64encode(templatefile("${path.module}/scripts/user-data.sh.tpl", {
    db_host      = aws_db_instance.postgres.address
    db_port      = aws_db_instance.postgres.port
    db_name      = "competitor_tracker"
    db_user      = "app"
    db_password  = var.db_password
    jwt_secret   = var.jwt_secret
    s3_bucket    = aws_s3_bucket.snapshots.bucket
    aws_region   = var.aws_region
    app_repo_url = var.app_repo_url
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

resource "aws_instance" "app" {
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  subnet_id = aws_subnet.public_a.id

  tags = {
    Name = "competitor-tracker-app"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_eip" "app" {
  domain = "vpc"

  tags = {
    Name = "competitor-tracker-eip"
  }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}
