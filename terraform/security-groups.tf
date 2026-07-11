resource "aws_security_group" "ec2" {
  name        = "competitor-tracker-ec2-sg-v2"
  description = "EC2 security group - inbound HTTP on 3000 from ALB only, SSH optional"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from ALB only"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  dynamic "ingress" {
    for_each = var.my_ip != "" ? [1] : []
    content {
      description = "SSH from my IP"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.my_ip]
    }
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "competitor-tracker-ec2-sg"
  }
}

resource "aws_security_group" "rds" {
  name        = "competitor-tracker-rds-sg"
  description = "RDS security group - PostgreSQL from EC2 only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "PostgreSQL from EC2"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "competitor-tracker-rds-sg"
  }
}
