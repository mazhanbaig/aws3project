# Application Load Balancer
resource "aws_lb" "app" {
  name               = "competitor-tracker-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_c.id]

  enable_deletion_protection = false

  tags = {
    Name = "competitor-tracker-alb"
  }
}

# Target group for the ALB
resource "aws_lb_target_group" "app" {
  name        = "competitor-tracker-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "instance"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 10
    path                = "/api/health"
    port                = 3000
    protocol            = "HTTP"
    matcher             = "200"
  }

  tags = {
    Name = "competitor-tracker-tg"
  }
}

# Listener on port 80
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# Security group for ALB
resource "aws_security_group" "alb" {
  name        = "competitor-tracker-alb-sg"
  description = "ALB security group - HTTP from anywhere"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "competitor-tracker-alb-sg"
  }
}
